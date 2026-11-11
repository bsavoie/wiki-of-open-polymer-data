import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import test from 'node:test';
import { validateV3000Molfile } from '../lib/structure-renderer.mjs';

test('UF and MUF use a bounded dimethylolurea precursor rather than an asserted network junction', async () => {
  const snapshot = JSON.parse(await fs.readFile('public-data/wop-publication-snapshot-v2/snapshot.json', 'utf8'));
  const id = 'dimethylolurea-precursor-example';
  const definition = snapshot.chemicalStructures.find(item => item.structureId === id);
  assert.equal(validateV3000Molfile(definition.molfileV3000, { structureId: id }).groups.length, 0);
  for (const wopId of ['wop-000117', 'wop-000119']) {
    const entry = snapshot.polymers.find(item => item.wopId === wopId);
    assert.ok(entry.structuralDepictions.items.some(item => item.structureId === id));
    assert.ok(entry.synthesisRoutes[0].products.some(item => item.structureId === id));
    assert.match(entry.structuralDepictions.scopeNote, /cured network.*not depicted/i);
  }
});
