import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import test from 'node:test';
import initializeRDKit from '@rdkit/rdkit';
import { validateV3000Molfile } from '../lib/structure-renderer.mjs';

test('EPDM and TPV show a source-qualified open ENB-derived cure-site example', async () => {
  const snapshot = JSON.parse(await fs.readFile('public-data/wop-publication-snapshot-v2/snapshot.json', 'utf8'));
  const id = 'epdm-enb-open-local-unit';
  const definition = snapshot.chemicalStructures.find(item => item.structureId === id);
  assert.ok(definition);
  const parsed = validateV3000Molfile(definition.molfileV3000, { structureId: id });
  assert.equal(parsed.groups.length, 0);
  assert.equal(parsed.pseudoatomIndices.size, 2);
  assert.match(definition.molfileV3000, /M  V30 5 2 5 6 CFG=2/);
  assert.doesNotMatch(definition.molfileV3000, /STEABS|M  V30 \d+ C [^\n]* CFG=/);
  const rdkit = await initializeRDKit();
  const molecule = rdkit.get_mol(definition.molfileV3000);
  assert.ok(molecule?.is_valid());
  try { assert.equal(molecule.get_smiles(), '*C1C2CC(=CC)C(C2)C1*'); } finally { molecule.delete(); }
  for (const wid of ['wop-000150', 'wop-000172']) {
    const article = snapshot.polymers.find(item => item.wopId === wid);
    const item = article.structuralDepictions.items.find(item => item.structureId === id);
    assert.ok(item, `${wid} must show the ENB-derived unit`);
    assert.match(item.caption, /uncrosslinked/i);
    assert.match(item.caption, /E\/Z geometry unspecified/i);
    assert.ok(article.structuralDepictions.sourceIds.includes('de-roo-epdm-enb-structure-2021'));
  }
  const tpv = snapshot.polymers.find(item => item.wopId === 'wop-000172');
  assert.match(tpv.structuralDepictions.scopeNote, /not a guaranteed residual double bond after vulcanization/i);
  assert.ok(tpv.synthesisRoutes[0].products.some(item => item.structureId === id));
  assert.match(tpv.synthesisRoutes[0].productNote, /before reaction/i);
});
