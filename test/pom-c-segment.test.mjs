import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import test from 'node:test';
import initializeRDKit from '@rdkit/rdkit';
import { validateV3000Molfile } from '../lib/structure-renderer.mjs';

test('POM copolymer example has a connected oxyethylene interruption', async () => {
  const snapshot = JSON.parse(await fs.readFile('public-data/wop-publication-snapshot-v2/snapshot.json', 'utf8'));
  const id = 'pom-oxyethylene-interruption-local-segment';
  const definition = snapshot.chemicalStructures.find(item => item.structureId === id);
  const parsed = validateV3000Molfile(definition.molfileV3000, { structureId: id });
  assert.equal(parsed.groups.length, 0);
  assert.equal(parsed.pseudoatomIndices.size, 2);
  const rdkit = await initializeRDKit();
  const molecule = rdkit.get_mol(definition.molfileV3000);
  assert.ok(molecule?.is_valid());
  try { assert.equal(molecule.get_smiles(), '*COCOCCOCOC*'); } finally { molecule.delete(); }
  const family = snapshot.polymers.find(item => item.wopId === 'wop-000073');
  const copolymer = snapshot.polymers.find(item => item.wopId === 'wop-000075');
  assert.deepEqual(family.structuralDepictions.items.map(item => item.structureId), ['polyoxymethylene-sru', id]);
  for (const article of [family, copolymer]) {
    assert.deepEqual(article.synthesisRoutes[0].products.map(item => item.structureId), [id]);
    assert.match(article.synthesisRoutes[0].productNote, /chain-wide sequence/);
  }
});
