import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import test from 'node:test';
import initializeRDKit from '@rdkit/rdkit';
import { validateV3000Molfile } from '../lib/structure-renderer.mjs';

test('vinyl-acetal product sites are open local motifs, while the PVA precursor remains a repeat', async () => {
  const snapshot = JSON.parse(await fs.readFile('public-data/wop-publication-snapshot-v2/snapshot.json', 'utf8'));
  const rdkit = await initializeRDKit();
  for (const [id, expected] of [['vinyl-alcohol-local-motif', '*CC(*)O'], ['vinyl-acetate-local-motif', '*CC(*)OC(C)=O']]) {
    const definition = snapshot.chemicalStructures.find(item => item.structureId === id);
    const parsed = validateV3000Molfile(definition.molfileV3000, { structureId: id });
    assert.equal(parsed.groups.length, 0);
    assert.equal(parsed.pseudoatomIndices.size, 2);
    const mol = rdkit.get_mol(definition.molfileV3000);
    assert.ok(mol?.is_valid());
    try { assert.equal(mol.get_smiles(), expected); } finally { mol.delete(); }
  }
  for (const id of ['wop-000028', 'wop-000029']) {
    const article = snapshot.polymers.find(item => item.wopId === id);
    assert.ok(article.structuralDepictions.items.some(item => item.structureId === 'vinyl-alcohol-local-motif'));
    assert.ok(article.synthesisRoutes[0].products.some(item => item.structureId === 'vinyl-alcohol-local-motif'));
    assert.ok(article.synthesisRoutes[0].inputs.some(item => item.structureId === 'polyvinyl-alcohol-sru'));
  }
  const pvb = snapshot.polymers.find(item => item.wopId === 'wop-000028');
  assert.ok(pvb.structuralDepictions.items.some(item => item.structureId === 'vinyl-acetate-local-motif'));
  assert.ok(pvb.synthesisRoutes[0].products.some(item => item.structureId === 'vinyl-acetate-local-motif'));
});
