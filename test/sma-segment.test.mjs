import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import test from 'node:test';
import initializeRDKit from '@rdkit/rdkit';
import { validateV3000Molfile } from '../lib/structure-renderer.mjs';

test('SMA uses an open segment with connected styrene and cyclic anhydride chemistry', async () => {
  const snapshot = JSON.parse(await fs.readFile('public-data/wop-publication-snapshot-v2/snapshot.json', 'utf8'));
  const id = 'styrene-maleic-anhydride-local-segment';
  const definition = snapshot.chemicalStructures.find(item => item.structureId === id);
  const parsed = validateV3000Molfile(definition.molfileV3000, { structureId: id });
  assert.equal(parsed.groups.length, 0);
  assert.equal(parsed.pseudoatomIndices.size, 2);
  const rdkit = await initializeRDKit();
  const mol = rdkit.get_mol(definition.molfileV3000);
  assert.ok(mol?.is_valid());
  try { assert.equal(mol.get_smiles(), '*CC(CC1C(=O)OC(=O)C1*)c1ccccc1'); } finally { mol.delete(); }
  const article = snapshot.polymers.find(item => item.wopId === 'wop-000036');
  assert.equal(article.structuralDepictions.items[0].structureId, id);
  assert.equal(article.synthesisRoutes[0].products[0].structureId, id);
  assert.match(article.structuralDepictions.scopeNote, /does not specify.*sequence/i);
});
