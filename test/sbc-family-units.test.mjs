import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import test from 'node:test';
import { validateV3000Molfile } from '../lib/structure-renderer.mjs';

test('styrenic block family separates an open hydrogenated example from ideal repeats', async () => {
  const snapshot = JSON.parse(await fs.readFile('public-data/wop-publication-snapshot-v2/snapshot.json', 'utf8'));
  const entry = snapshot.polymers.find(item => item.wopId === 'wop-000257');
  const ids = entry.structuralDepictions.items.map(item => item.structureId);
  assert.equal(ids[3], 'hydrogenated-butadiene-ethyl-open-segment');
  assert.deepEqual(entry.synthesisRoutes[0].products.map(item => item.structureId), ids);
  assert.match(entry.synthesisRoutes[0].productNote, /hydrogenation is separate/i);
  for (const [index, id] of ids.entries()) {
    const definition = snapshot.chemicalStructures.find(item => item.structureId === id);
    assert.equal(validateV3000Molfile(definition.molfileV3000, { structureId: id }).groups.length, index === 3 ? 0 : 1);
  }
});
