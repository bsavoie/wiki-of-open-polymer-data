import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import test from 'node:test';
import initializeRDKit from '@rdkit/rdkit';
import { validateV3000Molfile } from '../lib/structure-renderer.mjs';

test('SAN references preserve a connected, open, sequence-qualified local segment', async () => {
  const snapshot = JSON.parse(await fs.readFile('public-data/wop-publication-snapshot-v2/snapshot.json', 'utf8'));
  const id = 'san-styrene-acrylonitrile-local-segment';
  const record = snapshot.chemicalStructures.find(item => item.structureId === id);
  const parsed = validateV3000Molfile(record.molfileV3000, { structureId: id });
  assert.equal(parsed.groups.length, 0);
  assert.equal(parsed.pseudoatomIndices.size, 2);
  const rdkit = await initializeRDKit();
  const molecule = rdkit.get_mol(record.molfileV3000);
  assert.ok(molecule?.is_valid());
  try { assert.equal(molecule.get_smiles(), '*CC(CC(*)C#N)c1ccccc1'); } finally { molecule.delete(); }
  for (const wid of ['wop-000032', 'wop-000033', 'wop-000034']) {
    const article = snapshot.polymers.find(item => item.wopId === wid);
    assert.ok(article.structuralDepictions.items.some(item => item.structureId === id));
    assert.ok(article.synthesisRoutes.some(route => route.products.some(item => item.structureId === id)));
    assert.ok(article.structuralDepictions.sourceIds.includes('inceoglu-san-copolymer-structure-2013'));
  }
  const abs = snapshot.polymers.find(item => item.wopId === 'wop-000033').synthesisRoutes[0];
  assert.equal(abs.productMode, 'structural_reference');
  assert.match(abs.productNote, /does not depict the rubber phase/i);
});
