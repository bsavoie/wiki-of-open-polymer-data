import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import test from 'node:test';
import initializeRDKit from '@rdkit/rdkit';
import { validateV3000Molfile } from '../lib/structure-renderer.mjs';

test('SMMA constituent units are open and do not assert homopolymer blocks', async () => {
  const snapshot = JSON.parse(await fs.readFile('public-data/wop-publication-snapshot-v2/snapshot.json', 'utf8'));
  const rdkit = await initializeRDKit();
  const expected = new Map([['sbr-open-styrene-unit', '*CC(*)c1ccccc1'], ['smma-open-mma-unit', '*CC(*)(C)C(=O)OC']]);
  for (const [id, smiles] of expected) {
    const definition = snapshot.chemicalStructures.find(item => item.structureId === id);
    const parsed = validateV3000Molfile(definition.molfileV3000, { structureId: id });
    assert.equal(parsed.groups.length, 0);
    assert.equal(parsed.pseudoatomIndices.size, 2);
    const molecule = rdkit.get_mol(definition.molfileV3000);
    assert.ok(molecule?.is_valid());
    try { assert.equal(molecule.get_smiles(), smiles); } finally { molecule.delete(); }
  }
  const entry = snapshot.polymers.find(item => item.wopId === 'wop-000037');
  assert.deepEqual(entry.structuralDepictions.items.map(item => item.structureId), [...expected.keys()]);
  assert.deepEqual(entry.synthesisRoutes[0].products.map(item => item.structureId), [...expected.keys()]);
  assert.match(entry.synthesisRoutes[0].productNote, /do not represent separate homopolymers/i);
  assert.match(entry.synthesisRoutes[0].title, /methanol solution/i);
  assert.ok(!entry.synthesisRoutes[0].sourceIds.includes('smma-aqueous-suspension-us6502621'));
  assert.ok(entry.synthesisRoutes[0].steps.every(step => !step.sourceIds.includes('smma-aqueous-suspension-us6502621')));
  const mbs = snapshot.polymers.find(item => item.wopId === 'wop-000035');
  assert.deepEqual(mbs.structuralDepictions.items.map(item => item.structureId), ['smma-open-mma-unit', 'sbr-open-styrene-unit']);
  assert.match(mbs.structuralDepictions.scopeNote, /rubber core is not depicted/i);
  assert.match(mbs.synthesisRoutes[0].productNote, /rubber core is not depicted/i);
});
