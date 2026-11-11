import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import test from 'node:test';
import initializeRDKit from '@rdkit/rdkit';
import { validateV3000Molfile } from '../lib/structure-renderer.mjs';

test('copolyaramid examples retain para and meta ether residue connectivity as open motifs', async () => {
  const snapshot = JSON.parse(await fs.readFile('public-data/wop-publication-snapshot-v2/snapshot.json', 'utf8'));
  const expected = new Map([
    ['copolyaramid-open-ppta-unit', '*Nc1ccc(NC(=O)c2ccc(C(*)=O)cc2)cc1'],
    ['copolyaramid-open-oda-unit', '*Nc1cccc(Oc2ccc(NC(=O)c3ccc(C(*)=O)cc3)cc2)c1']
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
  const article = snapshot.polymers.find(item => item.wopId === 'wop-000179');
  assert.deepEqual(article.structuralDepictions.items.map(item => item.structureId), [...expected.keys()]);
  assert.deepEqual(article.synthesisRoutes[0].products.map(item => item.structureId), [...expected.keys()]);
  assert.match(article.structuralDepictions.scopeNote, /do not specify.*adjacency/i);
});
