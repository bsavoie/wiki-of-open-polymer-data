import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import test from 'node:test';
import initializeRDKit from '@rdkit/rdkit';
import { validateV3000Molfile } from '../lib/structure-renderer.mjs';

test('CPVC depicts independently sourced open pairs without asserting their adjacency', async () => {
  const snapshot = JSON.parse(await fs.readFile('public-data/wop-publication-snapshot-v2/snapshot.json', 'utf8'));
  const expected = new Map([
    ['cpvc-open-ch2-chcl', '*CC(*)Cl'],
    ['cpvc-open-chcl-chcl', '*C(Cl)C(*)Cl'],
    ['cpvc-open-chcl-ccl2', '*C(Cl)C(*)(Cl)Cl']
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
  const article = snapshot.polymers.find(item => item.wopId === 'wop-000024');
  assert.deepEqual(article.structuralDepictions.items.map(item => item.structureId), [...expected.keys()]);
  assert.deepEqual(article.synthesisRoutes[0].products.map(item => item.structureId), [...expected.keys()]);
  assert.match(article.structuralDepictions.scopeNote, /do not specify how the pairs are adjacent/i);
  assert.match(article.synthesisRoutes[0].productNote, /do not establish which pairs occur in this particular preparation/i);
});
