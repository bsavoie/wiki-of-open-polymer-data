import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import test from 'node:test';
import initializeRDKit from '@rdkit/rdkit';
import { validateV3000Molfile } from '../lib/structure-renderer.mjs';

test('SBR depicts open constituent units without homopolymer brackets or a fixed sequence', async () => {
  const snapshot = JSON.parse(await fs.readFile('public-data/wop-publication-snapshot-v2/snapshot.json', 'utf8'));
  const expected = new Map([
    ['sbr-open-styrene-unit', '*CC(*)c1ccccc1'],
    ['sbr-open-cis-unit', '*C/C=C\\C*'],
    ['sbr-open-trans-unit', '*C/C=C/C*'],
    ['sbr-open-vinyl-unit', '*CC(*)C=C']
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
  for (const wid of ['wop-000138', 'wop-000139', 'wop-000140']) {
    const article = snapshot.polymers.find(item => item.wopId === wid);
    assert.deepEqual(article.structuralDepictions.items.map(item => item.structureId), [...expected.keys()]);
    assert.deepEqual(article.synthesisRoutes[0].products.map(item => item.structureId), [...expected.keys()]);
    assert.match(article.structuralDepictions.scopeNote, /not every grade contains each/i);
  }
});
