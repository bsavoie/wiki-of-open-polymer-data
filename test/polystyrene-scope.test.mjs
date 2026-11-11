import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

test('polystyrene repeat is presented as a representative head-to-tail example', async () => {
  const snapshot = JSON.parse(await readFile('public-data/wop-publication-snapshot-v2/snapshot.json','utf8'));
  const p = snapshot.polymers.find(p => p.wopId === 'wop-000030');
  const d = p.structuralDepictions;
  assert.equal(d.items[0].structureId,'polystyrene-sru');
  assert.equal(d.items[0].fidelity,'representative');
  assert.match(d.scopeNote,/head-to-tail/);
  assert.match(d.scopeNote,/stereochemistry unspecified/);
  assert.match(d.scopeNote,/occasional different junctions/);
  for (const id of ['ou-polystyrene-chain-repeat','ou-polystyrene-head-tail']) {
    assert.ok(d.sourceIds.includes(id));
    assert.ok(p.sources.find(s => s.sourceId === id).supports.includes('structuralDepictions'));
  }
  assert.equal(p.synthesisRoutes[0].products[0].structureId,'polystyrene-sru');
  assert.match(p.synthesisRoutes[0].productNote,/representative head-to-tail/);
});
