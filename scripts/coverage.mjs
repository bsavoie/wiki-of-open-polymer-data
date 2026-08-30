import path from 'node:path';
import { readAndValidateSnapshot } from '../lib/importer.mjs';
import { PRIMARY_CLASS_LABELS } from '../lib/site.mjs';
import { SECTION_KEYS } from '../lib/schema.mjs';

const source = path.resolve(process.argv[2] || 'public-data/wop-publication-snapshot-v1');
const snapshot = await readAndValidateSnapshot(source);
const countBy = (values) => [...values.reduce((counts, value) => counts.set(value, (counts.get(value) || 0) + 1), new Map()).entries()]
  .sort((left, right) => left[0].localeCompare(right[0]));

console.log(`Polymer entries: ${snapshot.polymers.length}`);
console.log('\nPrimary browsing classes');
for (const [value, count] of countBy(snapshot.polymers.map((entry) => entry.taxonomy.primaryClass))) {
  console.log(`  ${PRIMARY_CLASS_LABELS[value] || value}: ${count}`);
}
console.log('\nContent maturity');
for (const [value, count] of countBy(snapshot.polymers.map((entry) => entry.maturity.contentMaturity))) console.log(`  ${value}: ${count}`);
console.log('\nPopulated article sections');
for (const key of SECTION_KEYS) {
  const count = snapshot.polymers.filter((entry) => entry.sections[key].trim()).length;
  console.log(`  ${key}: ${count}/${snapshot.polymers.length}`);
}
