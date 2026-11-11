import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import test from 'node:test';
import initializeRDKit from '@rdkit/rdkit';
import { validateV3000Molfile } from '../lib/structure-renderer.mjs';

test('PBAT open units retain butylene, adipate and para-terephthalate connectivity', async () => {
  const snapshot = JSON.parse(await fs.readFile('public-data/wop-publication-snapshot-v2/snapshot.json', 'utf8'));
  const rdkit = await initializeRDKit();
  const expected = new Map([
    ['pbat-open-butylene-adipate-unit', '*OCCCCOC(=O)CCCCC(*)=O'],
    ['pbat-open-butylene-terephthalate-unit', '*OCCCCOC(=O)c1ccc(C(*)=O)cc1']
  ]);
  for (const [id, smiles] of expected) {
    const definition = snapshot.chemicalStructures.find(item => item.structureId === id);
    const parsed = validateV3000Molfile(definition.molfileV3000, { structureId: id });
    assert.equal(parsed.groups.length, 0);
    assert.equal(parsed.pseudoatomIndices.size, 2);
    const molecule = rdkit.get_mol(definition.molfileV3000);
    assert.ok(molecule?.is_valid());
    try { assert.equal(molecule.get_smiles(), smiles); } finally { molecule.delete(); }
  }
  const entry = snapshot.polymers.find(item => item.wopId === 'wop-000223');
  assert.deepEqual(entry.structuralDepictions.items.map(item => item.structureId), [...expected.keys()]);
  assert.deepEqual(entry.synthesisRoutes[0].products.map(item => item.structureId), [...expected.keys()]);
  assert.match(entry.synthesisRoutes[0].productNote, /not separate homopolymers/i);
});

test('PBSA uses separate open succinate and adipate constituents', async () => {
  const snapshot = JSON.parse(await fs.readFile('public-data/wop-publication-snapshot-v2/snapshot.json', 'utf8'));
  const rdkit = await initializeRDKit();
  const definition = snapshot.chemicalStructures.find(item => item.structureId === 'pbsa-open-butylene-succinate-unit');
  const parsed = validateV3000Molfile(definition.molfileV3000, { structureId: definition.structureId });
  assert.equal(parsed.groups.length, 0);
  assert.equal(parsed.pseudoatomIndices.size, 2);
  const molecule = rdkit.get_mol(definition.molfileV3000);
  assert.ok(molecule?.is_valid());
  try { assert.equal(molecule.get_smiles(), '*OCCCCOC(=O)CCC(*)=O'); } finally { molecule.delete(); }
  const entry = snapshot.polymers.find(item => item.wopId === 'wop-000224');
  const ids = ['pbsa-open-butylene-succinate-unit', 'pbat-open-butylene-adipate-unit'];
  assert.deepEqual(entry.structuralDepictions.items.map(item => item.structureId), ids);
  assert.deepEqual(entry.synthesisRoutes[0].products.map(item => item.structureId), ids);
});
