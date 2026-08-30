import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { importSnapshot } from '../lib/importer.mjs';

const [source, unexpectedDestination] = process.argv.slice(2);
const repository = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const destination = path.join(repository, 'public-data', 'wop-publication-snapshot-v1');
if (!source) {
  console.error('Usage: npm run import:snapshot -- /path/to/wop-publication-snapshot-v1');
  process.exitCode = 1;
} else if (unexpectedDestination) {
  console.error('The import destination is fixed to public-data/wop-publication-snapshot-v1 for safety.');
  process.exitCode = 1;
} else {
  const snapshot = await importSnapshot(path.resolve(source), destination);
  console.log(`Imported ${snapshot.polymers.length} public polymer entries atomically.`);
}
