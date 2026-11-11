import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import test from 'node:test';
import initializeRDKit from '@rdkit/rdkit';
import { validateV3000Molfile } from '../lib/structure-renderer.mjs';

test('VMQ displays open dimethyl and methylvinyl siloxane constituents', async () => {
  const snapshot = JSON.parse(await fs.readFile('public-data/wop-publication-snapshot-v2/snapshot.json', 'utf8'));
  const rdkit = await initializeRDKit();
  const expected = new Map([['vmq-open-dimethyl-unit', '*O[Si](*)(C)C'], ['vmq-open-methylvinyl-unit', '*O[Si](*)(C)C=C']]);
  for (const [id, smiles] of expected) {
    const definition = snapshot.chemicalStructures.find(item => item.structureId === id);
    const parsed = validateV3000Molfile(definition.molfileV3000, { structureId: id });
    assert.equal(parsed.groups.length, 0);
    assert.equal(parsed.pseudoatomIndices.size, 2);
    const molecule = rdkit.get_mol(definition.molfileV3000);
    assert.ok(molecule?.is_valid());
    try { assert.equal(molecule.get_smiles(), smiles); } finally { molecule.delete(); }
  }
  const entry = snapshot.polymers.find(item => item.wopId === 'wop-000161');
  assert.deepEqual(entry.structuralDepictions.items.map(item => item.structureId), [...expected.keys()]);
  assert.deepEqual(entry.synthesisRoutes[0].products.map(item => item.structureId), [...expected.keys()]);
  assert.match(entry.structuralDepictions.scopeNote, /do not assign adjacency, sequence/i);
});
