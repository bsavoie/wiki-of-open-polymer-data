import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import test from 'node:test';
import { validateV3000Molfile } from '../lib/structure-renderer.mjs';

test('phenolic resin examples identify bounded local structures and an omitted network', async () => {
  const snapshot = JSON.parse(await fs.readFile('public-data/wop-publication-snapshot-v2/snapshot.json', 'utf8'));
  const expected = new Map([
    ['wop-000111', ['novolac-ortho-para-open-phenol', 'resole-ortho-methylol-open-phenol']],
    ['wop-000112', ['novolac-ortho-para-open-phenol']],
    ['wop-000113', ['resole-ortho-methylol-open-phenol']]
  ]);
  for (const [wopId, ids] of expected) {
    const entry = snapshot.polymers.find(item => item.wopId === wopId);
    assert.deepEqual(entry.structuralDepictions.items.map(item => item.structureId), ids);
    assert.deepEqual(entry.synthesisRoutes[0].products.map(item => item.structureId), ids);
    assert.match(entry.structuralDepictions.scopeNote, /network.*not depicted/i);
    for (const id of ids) {
      const definition = snapshot.chemicalStructures.find(item => item.structureId === id);
      assert.equal(validateV3000Molfile(definition.molfileV3000, { structureId: id }).groups.length, 0);
    }
  }
  assert.match(snapshot.polymers.find(item => item.wopId === 'wop-000111').synthesisRoutes[0].productNote, /alternative precursor references, not simultaneous products/i);
});

test('mixed phenolic resins distinguish sourced examples from their selected preparation', async () => {
  const snapshot = JSON.parse(await fs.readFile('public-data/wop-publication-snapshot-v2/snapshot.json', 'utf8'));
  const prf = snapshot.polymers.find(item => item.wopId === 'wop-000116');
  const puf = snapshot.polymers.find(item => item.wopId === 'wop-000120');
  assert.match(prf.structuralDepictions.scopeNote, /do not establish these exact species in the selected PRF sample/i);
  assert.match(puf.structuralDepictions.scopeNote, /not.*identified product of the separately selected synthesis route/i);
  assert.match(prf.structuralDepictions.scopeNote, /cured network.*not depicted/i);
  assert.match(puf.structuralDepictions.scopeNote, /cured network.*not depicted/i);
  assert.equal(puf.structuralDepictions.items[0].structureId, 'puf-ortho-hydroxybenzylurea-example');
});
