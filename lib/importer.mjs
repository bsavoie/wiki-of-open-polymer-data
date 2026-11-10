import fs from 'node:fs/promises';
import { readFileSync, renameSync } from 'node:fs';
import path from 'node:path';
import { createHash, randomUUID } from 'node:crypto';
import { SNAPSHOT_SCHEMA, snapshotFile, validateSnapshot } from './schema.mjs';
import { validateChemicalStructures as validateRenderedStructures } from './structure-renderer.mjs';

export const SNAPSHOT_DIRECTORY_MARKER = '.wop-snapshot-directory.json';
export const SNAPSHOT_IMPORT_LOCK = `.${SNAPSHOT_SCHEMA}.import.lock`;
const DIRECTORY_MARKER_SCHEMA = 'wop-snapshot-directory-v2';

async function readValidatedSnapshotBytes(sourceDirectory) {
  const raw = await fs.readFile(snapshotFile(sourceDirectory));
  const snapshot = validateSnapshot(JSON.parse(raw.toString('utf8')));
  await validateRenderedStructures(snapshot.chemicalStructures);
  return { raw, snapshot };
}

export async function readAndValidateSnapshot(sourceDirectory) {
  return (await readValidatedSnapshotBytes(sourceDirectory)).snapshot;
}

async function destinationPath(destinationDirectory) {
  const requested = path.resolve(destinationDirectory);
  if (path.basename(requested) !== SNAPSHOT_SCHEMA) {
    throw new Error(`Snapshot destination must be a directory named ${SNAPSHOT_SCHEMA}`);
  }
  const realParent = await fs.realpath(path.dirname(requested));
  return path.join(realParent, path.basename(requested));
}

async function readOwnedDestination(destination) {
  let entry;
  try {
    entry = await fs.lstat(destination);
  } catch (error) {
    if (error.code === 'ENOENT') return null;
    throw error;
  }
  if (!entry.isDirectory() || entry.isSymbolicLink()) {
    throw new Error('Snapshot destination must be a real directory, not a file or symbolic link');
  }
  let marker;
  try {
    marker = JSON.parse(await fs.readFile(path.join(destination, SNAPSHOT_DIRECTORY_MARKER), 'utf8'));
  } catch {
    throw new Error('Refusing to replace a directory not marked as Wiki of Open Polymer Data snapshot storage');
  }
  if (marker?.schema !== DIRECTORY_MARKER_SCHEMA || marker?.snapshotSchema !== SNAPSHOT_SCHEMA) {
    throw new Error('Refusing to replace a directory with an invalid snapshot ownership marker');
  }
  // The incoming snapshot is always checked with the current renderer before
  // this function runs.  Read an owned prior snapshot through the data schema
  // only so a renderer/semantic-validation upgrade can replace data that was
  // valid under the preceding renderer while still preserving stable IDs.
  // A failed incoming preflight never reaches the staging/rename path.
  const raw = await fs.readFile(snapshotFile(destination), 'utf8');
  return validateSnapshot(JSON.parse(raw));
}

function assertStableIdentity(previous, incoming, { allowProvisionalStructureReplacement = false } = {}) {
  if (!previous) return;
  const incomingById = new Map(incoming.polymers.map((polymer) => [polymer.wopId, polymer]));
  const incomingAliases = new Map(incoming.aliases.map((alias) => [alias.slug, alias.wopId]));
  const normalizeIdentity = (value) => value.normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/gi, ' ')
    .trim()
    .toLocaleLowerCase('en-US');
  const searchTerms = new Map(incoming.searchTerms.map((entry) => [normalizeIdentity(entry.term), new Set(entry.wopIds)]));
  for (const prior of previous.polymers) {
    const next = incomingById.get(prior.wopId);
    if (!next) throw new Error(`Import would remove stable identifier ${prior.wopId}`);
    if (next.canonicalSlug !== prior.canonicalSlug && incomingAliases.get(prior.canonicalSlug) !== prior.wopId) {
      throw new Error(`Import changes ${prior.wopId} from route ${prior.canonicalSlug} without preserving that route as an alias`);
    }
    const nextIdentities = new Set([
      next.canonicalName,
      ...next.alternateNames,
      ...next.abbreviations
    ].map(normalizeIdentity));
    for (const priorIdentity of [prior.canonicalName, ...prior.alternateNames, ...prior.abbreviations]) {
      const normalized = normalizeIdentity(priorIdentity);
      if (!nextIdentities.has(normalized) && !searchTerms.get(normalized)?.has(prior.wopId)) {
        throw new Error(`Import changes ${prior.wopId} without preserving prior identity ${JSON.stringify(priorIdentity)} as an identity or search term`);
      }
    }
  }

  const previousIds = new Set(previous.polymers.map((polymer) => polymer.wopId));
  const previousMaximum = Math.max(...previous.polymers.map((polymer) => Number(polymer.wopId.slice(4))));
  const appended = incoming.polymers
    .filter((polymer) => !previousIds.has(polymer.wopId))
    .map((polymer) => Number(polymer.wopId.slice(4)))
    .sort((left, right) => left - right);
  for (const [index, numericId] of appended.entries()) {
    const expected = previousMaximum + index + 1;
    if (numericId !== expected) throw new Error(`New stable identifiers must append sequentially; expected wop-${String(expected).padStart(6, '0')}`);
  }

  // Structure IDs become publication-stable once the complete corpus has
  // passed chemistry review. Before that gate, a migration baseline may still
  // replace provisional definitions whose chemistry or representation was
  // corrected during review. Polymer IDs, routes, and names remain protected
  // above at every stage.
  const releasedStructureCorpus = previous.polymers.every(
    (polymer) => polymer.structuralDepictions?.reviewStatus === 'reviewed'
  );
  if (releasedStructureCorpus && !allowProvisionalStructureReplacement) {
    const incomingStructures = new Map(incoming.chemicalStructures.map((structure) => [structure.structureId, structure]));
    for (const prior of previous.chemicalStructures) {
      const next = incomingStructures.get(prior.structureId);
      if (!next) throw new Error(`Import would remove stable chemical structure ${prior.structureId}`);
    }
  }
}

async function writeStagedSnapshot(staged, snapshot, sourceBytes) {
  await fs.mkdir(staged);
  await fs.writeFile(path.join(staged, 'snapshot.json'), sourceBytes ?? `${JSON.stringify(snapshot, null, 2)}\n`);
  await fs.writeFile(path.join(staged, SNAPSHOT_DIRECTORY_MARKER), `${JSON.stringify({
    schema: DIRECTORY_MARKER_SCHEMA,
    snapshotSchema: SNAPSHOT_SCHEMA
  }, null, 2)}\n`, 'utf8');
}

export async function importSnapshot(sourceDirectory, destinationDirectory, options = {}) {
  const { expectedSnapshotHash, preserveSourceBytes = false } = options;
  if (expectedSnapshotHash !== undefined && (typeof expectedSnapshotHash !== 'string' || !/^[a-f0-9]{64}$/.test(expectedSnapshotHash))) {
    throw new Error('expectedSnapshotHash must be a lowercase SHA256 hash of the prior snapshot bytes');
  }
  if (typeof preserveSourceBytes !== 'boolean') throw new Error('preserveSourceBytes must be a boolean');
  const source = await fs.realpath(path.resolve(sourceDirectory));
  const destination = await destinationPath(destinationDirectory);
  if (source === destination) throw new Error('Snapshot source and destination must be different directories');

  // Read once: a rollback can preserve exactly the same bytes that passed
  // validation, even if the source file changes while the renderer awaits.
  const { raw, snapshot } = await readValidatedSnapshotBytes(source);
  const parent = path.dirname(destination);
  // All importer writers share this lock, including callers without an
  // optimistic precondition. Keep it outside the directory being swapped.
  const lockPath = path.join(parent, SNAPSHOT_IMPORT_LOCK);
  const lock = await fs.open(lockPath, 'wx').catch(error => {
    if (error.code === 'EEXIST') throw new Error('Another snapshot import holds the lock; wait for it to finish');
    throw error;
  });
  const assertExpectedSnapshot = () => {
    if (expectedSnapshotHash === undefined) return;
    let currentHash;
    try {
      currentHash = createHash('sha256').update(readFileSync(snapshotFile(destination))).digest('hex');
    } catch (error) {
      if (error.code !== 'ENOENT') throw error;
    }
    if (currentHash !== expectedSnapshotHash) throw new Error('Snapshot changed since the expected base; import cancelled');
  };
  try {
    const previous = await readOwnedDestination(destination);
    assertExpectedSnapshot();
    assertStableIdentity(previous, snapshot, options);

    const staged = path.join(parent, `.${path.basename(destination)}.next-${randomUUID()}`);
    const backup = path.join(parent, `.${path.basename(destination)}.previous-${randomUUID()}`);
    let movedExisting = false;
    try {
      await writeStagedSnapshot(staged, snapshot, preserveSourceBytes ? raw : undefined);
      // Do not yield between the final byte precondition and the swap. The lock
      // coordinates other importer processes; this also closes the in-process
      // asynchronous validation/staging window.
      assertExpectedSnapshot();
      if (previous) {
        renameSync(destination, backup);
        movedExisting = true;
      }
      renameSync(staged, destination);
    } catch (publishError) {
      await fs.rm(staged, { recursive: true, force: true }).catch(() => {});
      if (movedExisting) {
        try {
          await fs.rename(backup, destination);
        } catch (restoreError) {
          throw new AggregateError(
            [publishError, restoreError],
            `Snapshot import failed and automatic restoration also failed; prior data remains at ${backup}`
          );
        }
      }
      throw publishError;
    }

    if (movedExisting) await fs.rm(backup, { recursive: true, force: true }).catch(() => {});
    return snapshot;
  } finally {
    await lock.close();
    await fs.rm(lockPath, { force: true });
  }
}
