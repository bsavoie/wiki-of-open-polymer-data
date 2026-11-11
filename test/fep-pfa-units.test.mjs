import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import test from 'node:test';
import { validateV3000Molfile } from '../lib/structure-renderer.mjs';

test('FEP and PFA use open constituent units and qualify the PFA ether example', async () => {
  const snapshot = JSON.parse(await fs.readFile('public-data/wop-publication-snapshot-v2/snapshot.json', 'utf8'));
  const cases = [
    ['wop-000090', ['thv-open-tfe-unit', 'thv-open-hfp-unit']],
    ['wop-000091', ['thv-open-tfe-unit', 'fluoro-open-pmve-unit']],
    ['wop-000159', ['thv-open-tfe-unit', 'fluoro-open-propylene-unit']],
    ['wop-000158', ['thv-open-tfe-unit', 'fluoro-open-pmve-unit']]
  ];
  for (const [wid, ids] of cases) {
    const entry = snapshot.polymers.find(item => item.wopId === wid);
    assert.deepEqual(entry.structuralDepictions.items.map(item => item.structureId), ids);
    assert.deepEqual(entry.synthesisRoutes[0].products.map(item => item.structureId), ids);
    for (const id of ids) {
      const definition = snapshot.chemicalStructures.find(item => item.structureId === id);
      const parsed = validateV3000Molfile(definition.molfileV3000, { structureId: id });
      assert.equal(parsed.groups.length, 0);
      assert.equal(parsed.pseudoatomIndices.size, 2);
    }
  }
  const ffkm = snapshot.polymers.find(item => item.wopId === 'wop-000158');
  assert.match(ffkm.synthesisRoutes[0].productNote, /cure-site comonomer.*not depicted/i);
  const fepm = snapshot.polymers.find(item => item.wopId === 'wop-000159');
  assert.match(fepm.synthesisRoutes[0].inputs[2].label, /3,3,3-Trifluoropropene-1/);
  assert.match(fepm.synthesisRoutes[0].productNote, /cure-site monomer.*not depicted/i);
  const pfa = snapshot.polymers.find(item => item.wopId === 'wop-000091');
  assert.match(pfa.synthesisRoutes[0].productNote, /not an assertion that the cited aqueous dispersion recipe used this specific ether/i);
});
