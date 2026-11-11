import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import test from 'node:test';
import initializeRDKit from '@rdkit/rdkit';
import { validateV3000Molfile } from '../lib/structure-renderer.mjs';

test('the historical EPDM route depicts its own diene feed and retained cure-site motif', async () => {
  const snapshot = JSON.parse(await fs.readFile('public-data/wop-publication-snapshot-v2/snapshot.json', 'utf8'));
  const entry = snapshot.polymers.find(item => item.wopId === 'wop-000150');
  const rdkit = await initializeRDKit();
  const cases = [
    ['epdm-11-ethyl-tridecadiene-feedstock', 'C=CCCCCCCCCC(=CC)CC', 0],
    ['epdm-11-ethyl-tridecadiene-open-unit', '*CC(*)CCCCCCCCC(=CC)CC', 2]
  ];
  for (const [id, smiles, attachmentCount] of cases) {
    const definition = snapshot.chemicalStructures.find(item => item.structureId === id);
    assert.ok(definition, `missing ${id}`);
    const parsed = validateV3000Molfile(definition.molfileV3000, { structureId: id });
    assert.equal(parsed.groups.length, 0);
    assert.equal(parsed.pseudoatomIndices.size, attachmentCount);
    assert.match(definition.molfileV3000, /M  V30 \d+ 2 \d+ \d+ CFG=2/);
    const molecule = rdkit.get_mol(definition.molfileV3000);
    assert.ok(molecule?.is_valid());
    try { assert.equal(molecule.get_smiles(), smiles); } finally { molecule.delete(); }
  }
  const route = entry.synthesisRoutes.find(item => item.routeId === 'representative-preparation');
  assert.ok(route.inputs.some(item => item.structureId === cases[0][0]));
  assert.ok(route.products.some(item => item.structureId === cases[1][0]));
  assert.match(route.productNote, /retains an internal double bond/i);
  assert.ok(entry.structuralDepictions.items.some(item => item.structureId === cases[1][0]));
  assert.ok(entry.contextualStructures.feedstocksAndSynthesis.items.some(item => item.structureId === cases[0][0]));
});
