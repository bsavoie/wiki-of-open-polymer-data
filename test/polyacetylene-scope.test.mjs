import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import test from 'node:test';
import { validateV3000Molfile } from '../lib/structure-renderer.mjs';

test('polyacetylene n-bracketed cis and trans examples are explicitly ideal chains', async () => {
  const snapshot = JSON.parse(await fs.readFile('public-data/wop-publication-snapshot-v2/snapshot.json', 'utf8'));
  const entry = snapshot.polymers.find(item => item.wopId === 'wop-000241');
  assert.match(entry.structuralDepictions.scopeNote, /idealized all-cis and all-trans/i);
  assert.match(entry.synthesisRoutes[0].productNote, /not simultaneous products/i);
  for (const id of ['cis-polyacetylene-unit', 'trans-polyacetylene-unit']) {
    const definition = snapshot.chemicalStructures.find(item => item.structureId === id);
    assert.equal(validateV3000Molfile(definition.molfileV3000, { structureId: id }).groups.length, 1);
  }
  assert.ok(!entry.synthesisRoutes[0].sourceIds.includes('polyacetylene-us4864004'));
});
