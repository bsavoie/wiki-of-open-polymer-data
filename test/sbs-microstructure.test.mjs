import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';

test('SBS example is qualified and SEBS route does not depict a misleading precursor', async () => {
  const data = JSON.parse(await readFile(process.env.SBS_TEST_SNAPSHOT || 'public-data/wop-publication-snapshot-v2/snapshot.json', 'utf8'));
  const sbs = data.polymers.find(p => p.wopId === 'wop-000166');
  const sebs = data.polymers.find(p => p.wopId === 'wop-000168');
  const depiction = sbs.structuralDepictions;
  const id = 'sbs-connected-aba-block-architecture';
  assert.equal(depiction.items[0].structureId, id);
  assert.match(depiction.scopeNote, /1,4-butadiene-derived/);
  assert.match(depiction.scopeNote, /may also contain 1,2-vinyl/);
  assert.match(depiction.items[0].caption, /alkene geometry is unspecified/);
  assert.ok(depiction.sourceIds.includes('sbs-midblock-microstructure-gunduz-2021'));
  assert.ok(sbs.sources.find(s => s.sourceId === 'sbs-midblock-microstructure-gunduz-2021').supports.includes('structuralDepictions'));
  assert.equal(sbs.synthesisRoutes[0].products[0].structureId, id);
  assert.match(sbs.synthesisRoutes[0].productNote, /1,4-butadiene-derived/);
  assert.deepEqual(sebs.synthesisRoutes[0].inputs[0], {label:'SBS precursor'});
  assert.ok(!sebs.contextualStructures?.feedstocksAndSynthesis?.items.some(item => item.structureId === id));
  const mol = data.chemicalStructures.find(s => s.structureId === id).molfileV3000;
  assert.equal(createHash('sha256').update(mol).digest('hex'), '0d1d9fa5d3684477a503733828e521fb4660f162ae52c89f580f010de2b9bc77');
});
