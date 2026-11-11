import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import test from 'node:test';
import initializeRDKit from '@rdkit/rdkit';
import { validateV3000Molfile } from '../lib/structure-renderer.mjs';

test('NBR and HNBR illustrate separate source-qualified units and retain the HNBR gap', async () => {
  const snapshot = JSON.parse(await fs.readFile('public-data/wop-publication-snapshot-v2/snapshot.json', 'utf8'));
  const rdkit = await initializeRDKit();
  for (const [id, smiles] of [['hnbr-open-hydrogenated-14-unit', '*CCCC*'], ['hnbr-open-hydrogenated-12-unit', '*CC(*)CC']]) {
    const definition = snapshot.chemicalStructures.find(item => item.structureId === id);
    const parsed = validateV3000Molfile(definition.molfileV3000, { structureId: id });
    assert.equal(parsed.groups.length, 0);
    assert.equal(parsed.pseudoatomIndices.size, 2);
    const molecule = rdkit.get_mol(definition.molfileV3000);
    assert.ok(molecule?.is_valid());
    try { assert.equal(molecule.get_smiles(), smiles); } finally { molecule.delete(); }
  }
  const cases = [
    ['wop-000142', ['xnbr-open-acrylonitrile-unit', 'sbr-open-cis-unit', 'sbr-open-trans-unit', 'sbr-open-vinyl-unit']],
    ['wop-000143', ['xnbr-open-acrylonitrile-unit', 'hnbr-open-hydrogenated-14-unit', 'hnbr-open-hydrogenated-12-unit']]
  ];
  for (const [wid, ids] of cases) {
    const entry = snapshot.polymers.find(item => item.wopId === wid);
    assert.deepEqual(entry.structuralDepictions.items.map(item => item.structureId), ids);
    assert.deepEqual(entry.synthesisRoutes[0].products.map(item => item.structureId), ids);
  }
  const hnbr = snapshot.polymers.find(item => item.wopId === 'wop-000143');
  assert.match(hnbr.structuralDepictions.scopeNote, /residual unsaturation is not depicted/i);
  assert.match(hnbr.synthesisRoutes[0].productNote, /residual unsaturation is not depicted/i);
});
