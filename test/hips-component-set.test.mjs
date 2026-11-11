import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import test from 'node:test';

test('HIPS distinguishes its PS matrix from illustrative rubber microstructure units', async () => {
  const snapshot = JSON.parse(await fs.readFile('public-data/wop-publication-snapshot-v2/snapshot.json', 'utf8'));
  const entry = snapshot.polymers.find(item => item.wopId === 'wop-000031');
  const ids = ['polystyrene-sru', 'sbr-open-cis-unit', 'sbr-open-trans-unit', 'sbr-open-vinyl-unit'];
  assert.deepEqual(entry.structuralDepictions.items.map(item => item.structureId), ids);
  assert.deepEqual(entry.synthesisRoutes[0].products.map(item => item.structureId), ids);
  assert.match(entry.structuralDepictions.scopeNote, /possible rubber constituents/i);
  assert.match(entry.synthesisRoutes[0].productNote, /do not encode.*grafting/i);
});
