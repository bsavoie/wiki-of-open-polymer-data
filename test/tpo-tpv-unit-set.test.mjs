import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import test from 'node:test';
import { validateV3000Molfile } from '../lib/structure-renderer.mjs';

test('TPO and TPV distinguish the PP phase from open rubber constituents', async () => {
  const snapshot = JSON.parse(await fs.readFile('public-data/wop-publication-snapshot-v2/snapshot.json', 'utf8'));
  for (const id of ['wop-000171', 'wop-000172']) {
    const entry = snapshot.polymers.find(item => item.wopId === id);
    const ids = entry.structuralDepictions.items.map(item => item.structureId);
    const expected = ['polypropylene-unspecified-sru', 'epm-open-ethylene-unit', 'fluoro-open-propylene-unit'];
    if (id === 'wop-000172') expected.push('epdm-enb-open-local-unit');
    assert.deepEqual(ids, expected);
    assert.deepEqual(entry.synthesisRoutes[0].products.map(item => item.structureId), ids);
    for (const sid of ids.slice(1)) {
      const definition = snapshot.chemicalStructures.find(item => item.structureId === sid);
      assert.equal(validateV3000Molfile(definition.molfileV3000, { structureId: sid }).groups.length, 0);
    }
  }
  const tpv = snapshot.polymers.find(item => item.wopId === 'wop-000172');
  assert.match(tpv.structuralDepictions.scopeNote, /not a guaranteed residual double bond after vulcanization/i);
  assert.match(tpv.synthesisRoutes[0].steps[0].body, /before adding polypropylene/i);
  assert.match(tpv.synthesisRoutes[0].steps[1].body, /add polypropylene/i);
  assert.ok(!tpv.synthesisRoutes[0].sourceIds.includes('tpv-sulfur-dynamic-network-innes-2022'));
});
