import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import test from 'node:test';
import initializeRDKit from '@rdkit/rdkit';
import { validateV3000Molfile } from '../lib/structure-renderer.mjs';

test('PETG constituent drawings do not prescribe homopolymer blocks or CHDM stereochemistry', async () => {
  const snapshot = JSON.parse(await fs.readFile('public-data/wop-publication-snapshot-v2/snapshot.json', 'utf8'));
  const rdkit = await initializeRDKit();
  const expected = new Map([
    ['petg-open-ethylene-terephthalate-unit', '*OCCOC(=O)c1ccc(C(*)=O)cc1'],
    ['petg-open-chdm-terephthalate-unit', '*OCC1CCC(COC(=O)c2ccc(C(*)=O)cc2)CC1']
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
  const entry = snapshot.polymers.find(item => item.wopId === 'wop-000045');
  assert.deepEqual(entry.structuralDepictions.items.map(item => item.structureId), [...expected.keys()]);
  assert.deepEqual(entry.synthesisRoutes[0].products.map(item => item.structureId), [...expected.keys()]);
  assert.match(entry.structuralDepictions.scopeNote, /do not assign chain neighbors or block lengths/i);
  assert.match(entry.synthesisRoutes[0].productNote, /cis\/trans composition/i);
  assert.ok(!entry.synthesisRoutes[0].sourceIds.includes('petg-jiangsu-114853991'));
  assert.ok(entry.synthesisRoutes[0].steps.every(step => !step.sourceIds.includes('petg-jiangsu-114853991')));
  assert.ok(entry.sources.some(source => source.sourceId === 'petg-jiangsu-114853991'));
});
