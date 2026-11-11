import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import test from 'node:test';

test('ethylene–octene elastomer uses one source-qualified connected example in its hero and route', async () => {
  const snapshot = JSON.parse(await fs.readFile(new URL('../public-data/wop-publication-snapshot-v2/snapshot.json', import.meta.url), 'utf8'));
  const elastomer = snapshot.polymers.find((entry) => entry.wopId === 'wop-000165');
  const vldpe = snapshot.polymers.find((entry) => entry.wopId === 'wop-000007');
  const id = 'vldpe-ethylene-octene-local-segment';
  assert.deepEqual(elastomer.structuralDepictions.items.map((item) => item.structureId), [id]);
  assert.equal(vldpe.structuralDepictions.items[0].structureId, id);
  assert.equal(elastomer.structuralDepictions.representationType, 'macromolecular_motif');
  const route = elastomer.synthesisRoutes.find((item) => item.routeId === 'representative-preparation');
  assert.equal(route.productMode, 'structural_reference');
  assert.deepEqual(route.products.map((item) => item.structureId), [id]);
  assert.match(elastomer.structuralDepictions.scopeNote, /not a complete polymer or a universal sequence/i);
  assert.match(route.productNote, /branch spacing.*stereochemistry/i);
  for (const sourceId of ['eto-borealis-2933277', 'he-ethylene-octene-hexyl-branches-2024', 'zaccaria-polyethylene-branching-2025']) {
    const source = elastomer.sources.find((item) => item.sourceId === sourceId);
    assert.ok(source?.supports.includes('structuralDepictions'), sourceId);
    assert.ok(elastomer.structuralDepictions.sourceIds.includes(sourceId), sourceId);
  }
});

test('MDPE labels its shared ethylene–butene segment as one possible local example', async () => {
  const snapshot = JSON.parse(await fs.readFile(new URL('../public-data/wop-publication-snapshot-v2/snapshot.json', import.meta.url), 'utf8'));
  const mdpe = snapshot.polymers.find((entry) => entry.wopId === 'wop-000004');
  const lldpe = snapshot.polymers.find((entry) => entry.wopId === 'wop-000003');
  const id = 'lldpe-ethylene-butene-local-segment';
  assert.equal(mdpe.structuralDepictions.items[0].structureId, id);
  assert.equal(lldpe.structuralDepictions.items[0].structureId, id);
  assert.equal(mdpe.synthesisRoutes[0].products[0].structureId, id);
  assert.match(mdpe.structuralDepictions.scopeNote, /one possible ethyl branch/i);
  assert.match(mdpe.synthesisRoutes[0].productNote, /does not specify.*all grades/i);
});
