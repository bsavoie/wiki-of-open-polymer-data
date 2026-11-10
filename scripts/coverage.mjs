import path from 'node:path';
import { readAndValidateSnapshot } from '../lib/importer.mjs';
import { PRIMARY_CLASS_LABELS } from '../lib/site.mjs';
import { SECTION_KEYS } from '../lib/schema.mjs';
import { summarizeResearch } from '../lib/research.mjs';

const source = path.resolve(process.argv[2] || 'public-data/wop-publication-snapshot-v2');
const snapshot = await readAndValidateSnapshot(source);
const countBy = (values) => [...values.reduce((counts, value) => counts.set(value, (counts.get(value) || 0) + 1), new Map()).entries()]
  .sort((left, right) => left[0].localeCompare(right[0]));
const heroItems = snapshot.polymers.flatMap((entry) => entry.structuralDepictions.items);
const contextualGroups = snapshot.polymers.flatMap((entry) => Object.entries(entry.contextualStructures || {})
  .map(([sectionKey, depiction]) => ({ sectionKey, depiction })));
const contextualItems = contextualGroups.flatMap(({ depiction }) => depiction.items);
const allItems = [...heroItems, ...contextualItems];
const referencedStructures = new Set(allItems.map((item) => item.structureId));

console.log(`Polymer entries: ${snapshot.polymers.length}`);
console.log('\nPrimary browsing classes');
for (const [value, count] of countBy(snapshot.polymers.map((entry) => entry.taxonomy.primaryClass))) {
  console.log(`  ${PRIMARY_CLASS_LABELS[value] || value}: ${count}`);
}
console.log('\nContent maturity');
for (const [value, count] of countBy(snapshot.polymers.map((entry) => entry.maturity.contentMaturity))) console.log(`  ${value}: ${count}`);
console.log('\nStructural depiction review');
for (const [value, count] of countBy(snapshot.polymers.map((entry) => entry.structuralDepictions.reviewStatus))) console.log(`  ${value}: ${count}`);
console.log('\nStructural representation types');
for (const [value, count] of countBy(snapshot.polymers.map((entry) => entry.structuralDepictions.representationType))) console.log(`  ${value}: ${count}`);
console.log('\nContextual structure review');
for (const [value, count] of countBy(contextualGroups.map(({ depiction }) => depiction.reviewStatus))) console.log(`  ${value}: ${count}`);
console.log('\nContextual structure sections');
for (const [value, count] of countBy(contextualGroups.map(({ sectionKey }) => sectionKey))) console.log(`  ${value}: ${count}`);
console.log(`\nChemical structures: ${snapshot.chemicalStructures.length}`);
console.log(`Referenced chemical structures: ${referencedStructures.size}`);
console.log(`Depiction items: ${allItems.length} (${heroItems.length} hero, ${contextualItems.length} contextual)`);
console.log('\nPopulated article sections');
for (const key of SECTION_KEYS) {
  const count = snapshot.polymers.filter((entry) => entry.sections[key].trim()).length;
  console.log(`  ${key}: ${count}/${snapshot.polymers.length}`);
}
const research = summarizeResearch(snapshot);
console.log('\nResearch progress (population is not review)');
console.log(`  Structured measurements and operating examples: ${research.evidenceCount}`);
console.log(`  Sections with current reviews: ${research.reviewedSectionCount}`);
console.log(`  Sections whose reviews need refreshing: ${research.staleSectionCount}`);
console.log(`  Articles with specific tracked questions: ${snapshot.polymers.filter(article => article.research?.questions.length).length}/${snapshot.polymers.length}`);
for (const [status, count] of Object.entries(research.questionCounts)) console.log(`  ${status}: ${count}`);
console.log('  No eligible evidence records a bounded search outcome; the scientific gap remains.');
