import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import test from 'node:test';

test('specified lactide and representative (R)-3HA structures declare absolute V3000 stereochemistry', async () => {
  const data = JSON.parse(await fs.readFile(new URL('../public-data/wop-publication-snapshot-v2/snapshot.json', import.meta.url), 'utf8'));
  for (const id of ['poly-l-lactide-chiral-unit', 'poly-d-lactide-chiral-unit', 'poly-3-hydroxybutyrate-chiral-unit', 'poly-r-3-hydroxyalkanoate-chiral-markush-unit']) {
    const record = data.chemicalStructures.find((structure) => structure.structureId === id);
    assert.ok(record, id);
    assert.match(record.molfileV3000, /M  V30 COUNTS \d+ \d+ \d+ \d+ 1\n/, id);
    assert.match(record.molfileV3000, /\bCFG=[13]\b/, id);
  }
  for (const [id, structureId] of [['wop-000215', 'phbv-rr-local-segment'], ['wop-000216', 'phbhhx-rr-local-segment']]) {
    const polymer = data.polymers.find((entry) => entry.wopId === id);
    const item = polymer.structuralDepictions.items.find((depiction) => depiction.structureId === structureId);
    assert.match(item.caption, /\(R\)/);
    assert.ok(polymer.structuralDepictions.sourceIds.includes('chebi-131525-poly-r-3-hydroxybutyrate'));
    const record = data.chemicalStructures.find((structure) => structure.structureId === structureId);
    assert.match(record.molfileV3000, /MDLV30\/STEABS ATOMS=\(2 /, structureId);
  }
  const family = data.polymers.find((entry) => entry.wopId === 'wop-000213');
  const example = family.structuralDepictions.items.find((item) => item.structureId === 'poly-r-3-hydroxyalkanoate-chiral-markush-unit');
  assert.match(example.notation, /methyl/);
  assert.match(example.notation, /ethyl/);
  assert.match(example.notation, /other side chains are not represented/i);
  const route = family.synthesisRoutes.find((item) => item.routeId === 'representative-preparation');
  assert.match(route.productNote, /structural reference/i);
});
