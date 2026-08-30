import path from 'node:path';
import { readAndValidateSnapshot } from '../lib/importer.mjs';

const source = path.resolve(process.argv[2] || 'public-data/wop-publication-snapshot-v1');
const snapshot = await readAndValidateSnapshot(source);
console.log(`Validated ${snapshot.polymers.length} polymer entries, ${snapshot.aliases.length} aliases, and ${snapshot.searchTerms.length} search terms.`);
