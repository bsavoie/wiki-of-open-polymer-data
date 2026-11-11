import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import test from 'node:test';
import initializeRDKit from '@rdkit/rdkit';
import { validateV3000Molfile } from '../lib/structure-renderer.mjs';

test('fluoroelastomer family examples use open units and bound the illustrated route', async () => {
  const snapshot = JSON.parse(await fs.readFile('public-data/wop-publication-snapshot-v2/snapshot.json', 'utf8'));
  const expected = new Map([
    ['fluoro-open-pmve-unit', '*C(F)(F)C(*)(F)OC(F)(F)F'],
    ['fluoro-open-propylene-unit', '*CC(*)C']
  ]);
  const rdkit = await initializeRDKit();
  for (const [id, smiles] of expected) {
    const definition = snapshot.chemicalStructures.find(item => item.structureId === id);
    const parsed = validateV3000Molfile(definition.molfileV3000, { structureId: id });
    assert.equal(parsed.groups.length, 0);
    assert.equal(parsed.pseudoatomIndices.size, 2);
    const molecule = rdkit.get_mol(definition.molfileV3000);
    assert.ok(molecule?.is_valid());
    try { assert.equal(molecule.get_smiles(), smiles); } finally { molecule.delete(); }
  }
  const article = snapshot.polymers.find(item => item.wopId === 'wop-000262');
  const route = article.synthesisRoutes[0];
  assert.deepEqual(route.inputs.map(item => item.label), ['Vinylidene fluoride', 'Hexafluoropropylene', 'Tetrafluoroethylene']);
  assert.equal(route.products[0].structureId, 'vdf-hfp-local-chain-segment');
  assert.match(route.productNote, /does not establish that adjacency in this specific patent product/i);
  assert.ok(article.structuralDepictions.items.some(item => item.structureId === 'fluoro-open-pmve-unit'));
  assert.ok(article.structuralDepictions.items.some(item => item.structureId === 'fluoro-open-propylene-unit'));
});

test('FKM family illustrates a bounded VDF/HFP segment and optional TFE unit', async () => {
  const snapshot = JSON.parse(await fs.readFile('public-data/wop-publication-snapshot-v2/snapshot.json', 'utf8'));
  const entry = snapshot.polymers.find(item => item.wopId === 'wop-000157');
  const ids = ['vdf-hfp-local-chain-segment', 'thv-open-tfe-unit'];
  assert.deepEqual(entry.structuralDepictions.items.map(item => item.structureId), ids);
  assert.deepEqual(entry.synthesisRoutes[0].products.map(item => item.structureId), ids);
  assert.match(entry.structuralDepictions.scopeNote, /TFE unit illustrates a constituent in some FKM members/i);
  assert.match(entry.synthesisRoutes[0].productNote, /not simultaneous products/i);
});
