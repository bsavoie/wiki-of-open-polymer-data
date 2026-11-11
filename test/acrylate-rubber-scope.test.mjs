import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import test from 'node:test';
import initializeRDKit from '@rdkit/rdkit';
import { validateV3000Molfile } from '../lib/structure-renderer.mjs';

test('acrylate rubber and AEM show bounded open constituents rather than unsupported homopolymer blocks', async () => {
  const snapshot = JSON.parse(await fs.readFile('public-data/wop-publication-snapshot-v2/snapshot.json', 'utf8'));
  const definition = snapshot.chemicalStructures.find(item => item.structureId === 'alkyl-acrylate-markush-unit');
  const parsed = validateV3000Molfile(definition.molfileV3000, { structureId: definition.structureId });
  assert.equal(parsed.groups.length, 0);
  const rdkit = await initializeRDKit();
  const molecule = rdkit.get_mol(definition.molfileV3000);
  assert.ok(molecule?.is_valid());
  try { assert.equal(molecule.get_smiles(), '*CC(*)C(=O)O*'); } finally { molecule.delete(); }
  const acrylic = snapshot.polymers.find(item => item.wopId === 'wop-000151');
  assert.deepEqual(acrylic.structuralDepictions.items.map(item => item.structureId), ['alkyl-acrylate-markush-unit']);
  assert.match(acrylic.structuralDepictions.items[0].notation, /2-methoxyethyl/);
  assert.equal(acrylic.synthesisRoutes[0].products[0].structureId, 'alkyl-acrylate-markush-unit');
  const aem = snapshot.polymers.find(item => item.wopId === 'wop-000152');
  const expected = ['epm-open-ethylene-unit', 'alkyl-acrylate-markush-unit'];
  assert.deepEqual(aem.structuralDepictions.items.map(item => item.structureId), expected);
  assert.deepEqual(aem.synthesisRoutes[0].products.map(item => item.structureId), expected);
  assert.match(aem.synthesisRoutes[0].inputs[2].label, /cure-site monomer.*patent example/i);
  assert.match(aem.synthesisRoutes[0].productNote, /does not depict every component/i);
});

test('polyacrylate patent example names its comonomers and discloses omitted units', async () => {
  const snapshot = JSON.parse(await fs.readFile('public-data/wop-publication-snapshot-v2/snapshot.json', 'utf8'));
  const entry = snapshot.polymers.find(item => item.wopId === 'wop-000040');
  const route = entry.synthesisRoutes[0];
  assert.deepEqual(route.inputs.map(item => item.label), ['n-Butyl acrylate', '2-Ethylhexyl acrylate', 'Acrylic acid', 'Maleic anhydride', 'N-tert-Butylacrylamide']);
  assert.match(route.productNote, /acrylic acid-.*maleic anhydride-.*N-tert-butylacrylamide-derived portions.*not depicted/i);
  assert.match(route.conditions, /subsequent initiator additions/i);
});
