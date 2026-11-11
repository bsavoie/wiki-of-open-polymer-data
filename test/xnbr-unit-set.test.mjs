import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import test from 'node:test';
import initializeRDKit from '@rdkit/rdkit';
import { validateV3000Molfile } from '../lib/structure-renderer.mjs';

test('XNBR unit examples do not assert an unsupported connected sequence', async () => {
  const snapshot = JSON.parse(await fs.readFile('public-data/wop-publication-snapshot-v2/snapshot.json', 'utf8'));
  const expected = new Map([
    ['xnbr-open-acrylonitrile-unit', '*CC(*)C#N'],
    ['sbr-open-trans-unit', '*C/C=C/C*'],
    ['xnbr-open-methacrylic-acid-unit', '*CC(*)(C)C(=O)O']
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
  const article = snapshot.polymers.find(item => item.wopId === 'wop-000144');
  assert.deepEqual(article.structuralDepictions.items.map(item => item.structureId), [...expected.keys()]);
  assert.deepEqual(article.synthesisRoutes[0].products.map(item => item.structureId), [...expected.keys()]);
  assert.match(article.synthesisRoutes[0].productNote, /not established for this particular patent product/i);
});
