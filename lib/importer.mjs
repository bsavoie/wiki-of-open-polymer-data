import fs from 'node:fs/promises';
import path from 'node:path';
import { randomUUID } from 'node:crypto';
import { SNAPSHOT_SCHEMA, snapshotFile, validateSnapshot } from './schema.mjs';

export const SNAPSHOT_DIRECTORY_MARKER = '.wop-snapshot-directory.json';
const DIRECTORY_MARKER_SCHEMA = 'wop-snapshot-directory-v1';

export async function readAndValidateSnapshot(sourceDirectory) {
  const raw = await fs.readFile(snapshotFile(sourceDirectory), 'utf8');
  return validateSnapshot(JSON.parse(raw));
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
  return readAndValidateSnapshot(destination);
}

function assertStableIdentity(previous, incoming) {
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
}

async function writeStagedSnapshot(staged, snapshot) {
  await fs.mkdir(staged);
  await fs.writeFile(path.join(staged, 'snapshot.json'), `${JSON.stringify(snapshot, null, 2)}\n`, 'utf8');
  await fs.writeFile(path.join(staged, SNAPSHOT_DIRECTORY_MARKER), `${JSON.stringify({
    schema: DIRECTORY_MARKER_SCHEMA,
    snapshotSchema: SNAPSHOT_SCHEMA
  }, null, 2)}\n`, 'utf8');
}

export async function importSnapshot(sourceDirectory, destinationDirectory) {
  const source = await fs.realpath(path.resolve(sourceDirectory));
  const destination = await destinationPath(destinationDirectory);
  if (source === destination) throw new Error('Snapshot source and destination must be different directories');

  const snapshot = await readAndValidateSnapshot(source);
  const previous = await readOwnedDestination(destination);
  assertStableIdentity(previous, snapshot);

  const parent = path.dirname(destination);
  const staged = path.join(parent, `.${path.basename(destination)}.next-${randomUUID()}`);
  const backup = path.join(parent, `.${path.basename(destination)}.previous-${randomUUID()}`);
  await writeStagedSnapshot(staged, snapshot);

  let movedExisting = false;
  try {
    if (previous) {
      await fs.rename(destination, backup);
      movedExisting = true;
    }
    await fs.rename(staged, destination);
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
}
