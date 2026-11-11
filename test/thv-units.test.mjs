import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import test from 'node:test';
import initializeRDKit from '@rdkit/rdkit';
import { validateV3000Molfile } from '../lib/structure-renderer.mjs';

test('THV constituent references remain open units without a prescribed copolymer sequence', async () => {
  const snapshot = JSON.parse(await fs.readFile('public-data/wop-publication-snapshot-v2/snapshot.json', 'utf8'));
  const expected = new Map([
    ['thv-open-tfe-unit', '*C(F)(F)C(*)(F)F'],
    ['thv-open-hfp-unit', '*C(F)(F)C(*)(F)C(F)(F)F'],
    ['thv-open-vdf-unit', '*CC(*)(F)F']
  ]);
  const rdkit = await initializeRDKit();
  for (const [id, smiles] of expected) {
    const definition = snapshot.chemicalStructures.find(record => record.structureId === id);
    const parsed = validateV3000Molfile(definition.molfileV3000, { structureId: id });
    assert.equal(parsed.groups.length, 0);
    assert.equal(parsed.pseudoatomIndices.size, 2);
    const molecule = rdkit.get_mol(definition.molfileV3000);
    assert.ok(molecule?.is_valid());
    try { assert.equal(molecule.get_smiles(), smiles); } finally { molecule.delete(); }
  }
  const article = snapshot.polymers.find(record => record.wopId === 'wop-000096');
  assert.deepEqual(article.structuralDepictions.items.map(item => item.structureId), [...expected.keys()]);
  assert.deepEqual(article.synthesisRoutes[0].products.map(item => item.structureId), [...expected.keys()]);
  assert.match(article.structuralDepictions.scopeNote, /sequence.*unspecified/i);
  assert.equal(article.synthesisRoutes[0].productMode, 'structural_reference');
});
