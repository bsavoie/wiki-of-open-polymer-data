import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import test from 'node:test';
import initializeRDKit from '@rdkit/rdkit';
import { validateV3000Molfile } from '../lib/structure-renderer.mjs';

test('ethylene–propylene examples use open units and keep the patent diene distinct from the omitted cure-site drawing', async () => {
  const snapshot = JSON.parse(await fs.readFile('public-data/wop-publication-snapshot-v2/snapshot.json', 'utf8'));
  const expected = new Map([['epm-open-ethylene-unit', '*CC*'], ['fluoro-open-propylene-unit', '*CC(*)C']]);
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
  for (const wid of ['wop-000149', 'wop-000150']) {
    const article = snapshot.polymers.find(item => item.wopId === wid);
    assert.deepEqual(article.structuralDepictions.items.slice(0, 2).map(item => item.structureId), [...expected.keys()]);
    assert.deepEqual(article.synthesisRoutes[0].products.slice(0, 2).map(item => item.structureId), [...expected.keys()]);
  }
  const route = snapshot.polymers.find(item => item.wopId === 'wop-000150').synthesisRoutes[0];
  assert.equal(route.inputs[2].label, '11-Ethyl-1,11-tridecadiene');
  assert.match(route.productNote, /diene-derived cure site is not depicted/i);
});
