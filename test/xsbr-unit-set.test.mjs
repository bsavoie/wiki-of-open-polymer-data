import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import test from 'node:test';
import { validateV3000Molfile } from '../lib/structure-renderer.mjs';

test('XSBR separates constituent examples and distinguishes the itaconic-acid recipe', async () => {
  const snapshot = JSON.parse(await fs.readFile('public-data/wop-publication-snapshot-v2/snapshot.json', 'utf8'));
  const entry = snapshot.polymers.find(item => item.wopId === 'wop-000141');
  const ids = entry.structuralDepictions.items.map(item => item.structureId);
  assert.equal(ids.length, 5);
  assert.ok(ids.includes('xsbr-open-acrylic-acid-unit'));
  assert.match(entry.structuralDepictions.scopeNote, /not established for the cited XSBR sample/i);
  assert.match(entry.synthesisRoutes[0].productNote, /uses itaconic acid.*not depicted/i);
  assert.deepEqual(entry.synthesisRoutes[0].products.map(item => item.structureId), ids);
  for (const id of ids) {
    const definition = snapshot.chemicalStructures.find(item => item.structureId === id);
    assert.equal(validateV3000Molfile(definition.molfileV3000, { structureId: id }).groups.length, 0);
  }
});
