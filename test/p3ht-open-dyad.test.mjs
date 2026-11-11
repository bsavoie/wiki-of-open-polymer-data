import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import test from 'node:test';
import initializeRDKit from '@rdkit/rdkit';
import { validateV3000Molfile } from '../lib/structure-renderer.mjs';

test('P3HT illustration is an open head-to-tail dyad rather than an endlessly repeated dyad', async () => {
  const snapshot = JSON.parse(await fs.readFile('public-data/wop-publication-snapshot-v2/snapshot.json', 'utf8'));
  const id = 'p3ht-open-head-to-tail-dyad';
  const definition = snapshot.chemicalStructures.find(item => item.structureId === id);
  const parsed = validateV3000Molfile(definition.molfileV3000, { structureId: id });
  assert.equal(parsed.groups.length, 0);
  assert.equal(parsed.pseudoatomIndices.size, 2);
  const rdkit = await initializeRDKit();
  const molecule = rdkit.get_mol(definition.molfileV3000);
  assert.ok(molecule?.is_valid());
  try { assert.equal(molecule.get_smiles(), '*c1cc(CCCCCC)c(-c2cc(CCCCCC)c(*)s2)s1'); } finally { molecule.delete(); }
  const entry = snapshot.polymers.find(item => item.wopId === 'wop-000245');
  assert.equal(entry.structuralDepictions.items[0].structureId, id);
  assert.equal(entry.synthesisRoutes[0].products[0].structureId, id);
  assert.match(entry.structuralDepictions.scopeNote, /does not assert perfect regioregularity/i);
});

test('polythiophene family uses a legible open P3HT example and a source-matched route', async () => {
  const snapshot = JSON.parse(await fs.readFile('public-data/wop-publication-snapshot-v2/snapshot.json', 'utf8'));
  const entry = snapshot.polymers.find(item => item.wopId === 'wop-000244');
  assert.equal(entry.structuralDepictions.items[1].structureId, 'p3ht-open-head-to-tail-dyad');
  assert.match(entry.structuralDepictions.scopeNote, /does not prescribe chain-wide regioregularity/i);
  assert.deepEqual(entry.synthesisRoutes[0].sourceIds, ['polythiophene-fecl3-chloroform-pmc8123070']);
  assert.ok(entry.synthesisRoutes[0].steps.every(step => !step.sourceIds.includes('polythiophene-ocvd-us9793479')));
});
