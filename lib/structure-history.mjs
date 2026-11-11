// Isolated site-integration proposal. Call only within buildSite's staging directory.
import fs from 'node:fs/promises';
import { realpathSync } from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { createHash } from 'node:crypto';
import { fileURLToPath } from 'node:url';
import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
const digest = (bytes) => createHash('sha256').update(bytes).digest('hex');
const files = ['README.md', 'index.html', 'registry.json', 'historical-structures.zip'];
const BASELINE_INVENTORY_SHA256 = '48a80a7143009c898b9ab3d8a3bef8c152e3e6225c4e369545e391f3cd4dec16';
const validateHistory = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../scripts/validate-structure-history.py');
const execFileAsync = promisify(execFile);

// A build reads an existing snapshot, so resolve the source itself as well as
// its parents: either may be a symlink to the canonical publication input.
export function buildHistoryDirectory(snapshotDirectory) {
  const repository = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
  const canonical = path.join(repository, 'public-data/wop-publication-snapshot-v2');
  return realpathSync(path.resolve(snapshotDirectory)) === realpathSync(canonical)
    ? path.join(repository, 'public-data/structure-history/2026-11-10')
    : null;
}

export async function copyHistoryBundle({ sourceDirectory, outputDirectory, snapshot }) {
  const input = await Promise.all(files.map(name => fs.readFile(path.join(sourceDirectory, name))));
  const [readme, page, registryBytes, archive] = input;
  const registry = JSON.parse(registryBytes.toString('utf8'));
  if (registry.schema !== 'wop-structure-history-v1' || registry.archive?.path !== 'historical-structures.zip' || registry.archive?.sha256 !== digest(archive)) throw new Error('Invalid historical structure archive or digest');
  if (!readme.toString('utf8').includes('Do not use them as current scientific references') || !page.toString('utf8').includes('must not be used as current scientific references') || !page.toString('utf8').includes('href="historical-structures.zip"') || /href="[^"]+\.mol"/i.test(page.toString('utf8'))) throw new Error('History warning or download links invalid');
  const active = new Map(snapshot.chemicalStructures.map(item => [item.structureId, item.molfileV3000]));
  const seen = new Set();
  const entries = new Map();
  for (const item of registry.entries) {
    if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(item.structureId) || seen.has(item.structureId) || item.archiveMember !== `molfiles/${item.structureId}.mol` || !/^[0-9a-f]{64}$/.test(item.historicalSha256) || !item.reason) throw new Error('Invalid historical structure record');
    seen.add(item.structureId);
    entries.set(item.structureId, item);
    if (item.successorStructureId && !active.has(item.successorStructureId)) throw new Error(`Historical successor missing: ${item.structureId}`);
    if (item.status === 'withdrawn') { if (active.has(item.structureId) || item.currentSha256 !== null) throw new Error(`Withdrawn structure reactivated: ${item.structureId}`); }
    else if (item.status === 'historical-layout') { if (!active.has(item.structureId) || digest(active.get(item.structureId)) !== item.currentSha256) throw new Error(`Active historical-layout record changed: ${item.structureId}`); }
    else throw new Error(`Unknown history status: ${item.structureId}`);
  }
  const baseline = new Set();
  const inventory = registry.baselineStructures.map(item => `${item.structureId}\t${item.sha256}\n`).sort().join('');
  if (digest(inventory) !== BASELINE_INVENTORY_SHA256) throw new Error('Historical baseline inventory changed');
  for (const item of registry.baselineStructures) {
    if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(item.structureId) || baseline.has(item.structureId) || !/^[0-9a-f]{64}$/.test(item.sha256)) throw new Error('Invalid baseline structure inventory');
    baseline.add(item.structureId);
    const current = active.get(item.structureId), changed = current === undefined || digest(current) !== item.sha256, record = entries.get(item.structureId);
    if (changed !== !!record || (record && record.historicalSha256 !== item.sha256)) throw new Error(`History inventory stale: ${item.structureId}`);
  }
  if ([...entries.keys()].some(id => !baseline.has(id))) throw new Error('Historical record absent from baseline inventory');
  // Validate the exact captured bytes, including every ZIP member. Validating
  // source paths and reading them again would allow the archive to change in
  // between; the builder later writes these same buffers to the staged site.
  const validationRoot = await fs.mkdtemp(path.join(os.tmpdir(), 'wop-history-validation-'));
  try {
    const bundle = path.join(validationRoot, 'bundle');
    const snapshotPath = path.join(validationRoot, 'snapshot.json');
    await fs.mkdir(bundle);
    await Promise.all(files.map((name, index) => fs.writeFile(path.join(bundle, name), input[index])));
    await fs.writeFile(snapshotPath, JSON.stringify(snapshot));
    try {
      await execFileAsync('python3', [validateHistory, '--snapshot', snapshotPath, '--bundle', bundle]);
    } catch (error) {
      throw new Error('Invalid historical structure archive or records; Python 3 history validation failed', { cause: error });
    }
  } finally {
    await fs.rm(validationRoot, { recursive: true, force: true });
  }
  const destination = path.join(outputDirectory, 'structure-history', '2026-11-10');
  await fs.mkdir(destination, { recursive: true });
  await Promise.all(files.map((name, index) => fs.writeFile(path.join(destination, name), input[index])));
  return { destination, count: seen.size, archiveSha256: registry.archive.sha256 };
}
