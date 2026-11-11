import path from 'node:path';
import fs from 'node:fs/promises';
import { readValidatedSnapshotBytes } from '../lib/importer.mjs';
import { snapshotFile } from '../lib/schema.mjs';
import { buildSite } from '../lib/site.mjs';
import { buildHistoryDirectory } from '../lib/structure-history.mjs';
import { acquireSnapshotBuildGuard } from '../lib/build-snapshot-guard.mjs';

// Resolve once before reading so a changed symlink cannot select history for a
// different source than the snapshot that was loaded.
const source = await fs.realpath(path.resolve(process.argv[2] || 'public-data/wop-publication-snapshot-v2'));
const output = path.resolve(process.argv[3] || 'dist');
const { raw, snapshot } = await readValidatedSnapshotBytes(source);
const historyDirectory = buildHistoryDirectory(source);
const built = await buildSite(snapshot, output, {
  siteUrl: process.env.WOP_SITE_URL || null,
  historyDirectory,
  acquirePublishGuard: historyDirectory ? () => acquireSnapshotBuildGuard(source) : null,
  beforePublish: async () => {
    const current = await fs.readFile(snapshotFile(source));
    if (!raw.equals(current)) throw new Error('Snapshot changed while building; publication cancelled');
  }
});
console.log(`Built ${snapshot.polymers.length} canonical polymer entries in ${built.output}`);
if (built.retainedBackup) console.warn(`The new build is live, but a prior backup could not be cleaned: ${built.retainedBackup}`);
