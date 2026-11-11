import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import test from 'node:test';
import { validateV3000Molfile } from '../lib/structure-renderer.mjs';

test('CPE uses a source-bounded chlorinated site and an aqueous route citation', async () => {
  const snapshot = JSON.parse(await fs.readFile('public-data/wop-publication-snapshot-v2/snapshot.json', 'utf8'));
  const entry = snapshot.polymers.find(item => item.wopId === 'wop-000155');
  const id = entry.structuralDepictions.items[0].structureId;
  assert.equal(id, 'cpe-three-carbon-chloro-local-segment');
  const definition = snapshot.chemicalStructures.find(item => item.structureId === id);
  const graph = validateV3000Molfile(definition.molfileV3000, { structureId: id });
  assert.equal([...graph.atoms.values()].filter(atom => atom.symbol === 'C').length, 3);
  assert.equal([...graph.atoms.values()].filter(atom => atom.symbol === 'Cl').length, 1);
  assert.equal(graph.groups.length, 0);
  assert.deepEqual(entry.synthesisRoutes[0].sourceIds, ['cpe-cn102863568']);
  assert.match(entry.synthesisRoutes[0].productNote, /does not identify the substitution pattern/i);
});

test('CSPE shows separate substitution units and the prechlorinated gas-route substrate', async () => {
  const snapshot = JSON.parse(await fs.readFile('public-data/wop-publication-snapshot-v2/snapshot.json', 'utf8'));
  const entry = snapshot.polymers.find(item => item.wopId === 'wop-000156');
  const ids = entry.structuralDepictions.items.map(item => item.structureId);
  assert.deepEqual(ids, ['epm-open-ethylene-unit', 'cspe-open-chloro-unit', 'cspe-open-chlorosulfonyl-unit']);
  for (const id of ids) {
    const definition = snapshot.chemicalStructures.find(item => item.structureId === id);
    assert.equal(validateV3000Molfile(definition.molfileV3000, { structureId: id }).groups.length, 0);
  }
  const route = entry.synthesisRoutes[0];
  assert.equal(route.inputs[0].label, 'Particulate chlorinated polyethylene');
  assert.equal(route.inputs[0].structureId, undefined);
  assert.match(route.conditions, /solvent-free/i);
  assert.match(route.productNote, /do not assign adjacency/i);
});
