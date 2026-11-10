import path from 'node:path';
import { readAndValidateSnapshot } from '../lib/importer.mjs';

const arguments_ = process.argv.slice(2);
const strict = arguments_.includes('--strict');
const positional = arguments_.filter((argument) => argument !== '--strict');
if (positional.length > 1) {
  console.error('Usage: npm run structures:coverage -- [--strict] [snapshot-directory]');
  process.exitCode = 1;
} else {
  const source = path.resolve(positional[0] || 'public-data/wop-publication-snapshot-v2');
  const snapshot = await readAndValidateSnapshot(source);
  const countBy = (values) => [...values.reduce((counts, value) => counts.set(value, (counts.get(value) || 0) + 1), new Map()).entries()]
    .sort(([left], [right]) => left.localeCompare(right));
  const heroItems = snapshot.polymers.flatMap((polymer) => polymer.structuralDepictions.items);
  const contextualGroups = snapshot.polymers.flatMap((polymer) => Object.entries(polymer.contextualStructures || {})
    .map(([sectionKey, depiction]) => ({ sectionKey, depiction })));
  const contextualItems = contextualGroups.flatMap(({ depiction }) => depiction.items);
  const allItems = [...heroItems, ...contextualItems];
  const used = new Set(allItems.map((item) => item.structureId));
  const unused = snapshot.chemicalStructures.filter(({ structureId }) => !used.has(structureId)).map(({ structureId }) => structureId);
  const pending = snapshot.polymers.filter((polymer) => polymer.structuralDepictions.reviewStatus !== 'reviewed');
  const unreviewedContextual = contextualGroups.filter(({ depiction }) => depiction.reviewStatus !== 'reviewed');
  const reviewedWithoutImage = snapshot.polymers.filter((polymer) => polymer.structuralDepictions.reviewStatus === 'reviewed'
    && polymer.structuralDepictions.representationType !== 'no_unique_repeat'
    && polymer.structuralDepictions.items.length === 0);
  const entriesWithoutAnyItem = snapshot.polymers.filter((polymer) => polymer.structuralDepictions.items.length +
    Object.values(polymer.contextualStructures || {}).reduce((count, group) => count + group.items.length, 0) === 0);

  console.log(`Polymer entries: ${snapshot.polymers.length}`);
  console.log(`Chemical structure definitions: ${snapshot.chemicalStructures.length}`);
  console.log(`Referenced definitions: ${used.size}`);
  console.log(`Depiction items: ${allItems.length} (${heroItems.length} hero, ${contextualItems.length} contextual)`);
  console.log('\nHero review status');
  for (const [status, count] of countBy(snapshot.polymers.map((polymer) => polymer.structuralDepictions.reviewStatus))) console.log(`  ${status}: ${count}`);
  console.log('\nContextual review status');
  for (const [status, count] of countBy(contextualGroups.map(({ depiction }) => depiction.reviewStatus))) console.log(`  ${status}: ${count}`);
  console.log('\nContextual section');
  for (const [sectionKey, count] of countBy(contextualGroups.map(({ sectionKey }) => sectionKey))) console.log(`  ${sectionKey}: ${count}`);
  console.log('\nRepresentation type');
  for (const [type, count] of countBy(snapshot.polymers.map((polymer) => polymer.structuralDepictions.representationType))) console.log(`  ${type}: ${count}`);
  console.log(`\nUnused definitions: ${unused.length}${unused.length ? ` (${unused.join(', ')})` : ''}`);
  console.log(`Unreviewed entries: ${pending.length}`);
  console.log(`Unreviewed contextual groups: ${unreviewedContextual.length}`);
  console.log(`Reviewed non-empty representations without items: ${reviewedWithoutImage.length}`);
  console.log(`Entries without any hero or contextual render: ${entriesWithoutAnyItem.length}`);

  if (strict && (unused.length || pending.length || unreviewedContextual.length || reviewedWithoutImage.length ||
      entriesWithoutAnyItem.length)) {
    throw new Error('Structural depiction coverage does not meet the reviewed-corpus acceptance criteria');
  }
}
