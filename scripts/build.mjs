import path from 'node:path';
import { readAndValidateSnapshot } from '../lib/importer.mjs';
import { buildSite } from '../lib/site.mjs';

const source = path.resolve(process.argv[2] || 'public-data/wop-publication-snapshot-v1');
const output = path.resolve(process.argv[3] || 'dist');
const snapshot = await readAndValidateSnapshot(source);
const built = await buildSite(snapshot, output, { siteUrl: process.env.WOP_SITE_URL || null });
console.log(`Built ${snapshot.polymers.length} canonical polymer entries in ${built.output}`);
if (built.retainedBackup) console.warn(`The new build is live, but a prior backup could not be cleaned: ${built.retainedBackup}`);
