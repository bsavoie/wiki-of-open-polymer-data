import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import test from 'node:test';
import { validateV3000Molfile } from '../lib/structure-renderer.mjs';

test('PEDOT and PEDOT:PSS identify ideal parent repeats and bound the selected preparation', async () => {
  const snapshot = JSON.parse(await fs.readFile('public-data/wop-publication-snapshot-v2/snapshot.json', 'utf8'));
  const pedot = snapshot.polymers.find(item => item.wopId === 'wop-000246');
  const complex = snapshot.polymers.find(item => item.wopId === 'wop-000247');
  assert.match(pedot.structuralDepictions.scopeNote, /ideal neutral.*repeat/i);
  assert.match(complex.structuralDepictions.scopeNote, /partially oxidized and ionically associated/i);
  assert.deepEqual(complex.synthesisRoutes[0].sourceIds, ['sakunpongpitiporn-pedot-pss-surfactant-study']);
  assert.ok(complex.sources.some(source => source.sourceId === 'herckens-pedot-pss-comparative-2023'));
  assert.ok(!complex.sources.some(source => source.sourceId === 'muro-crosslinked-pedot-pss-nanoparticle-study'));
  for (const item of complex.structuralDepictions.items) {
    const definition = snapshot.chemicalStructures.find(entry => entry.structureId === item.structureId);
    assert.equal(validateV3000Molfile(definition.molfileV3000, { structureId: item.structureId }).groups.length, 1);
  }
});
