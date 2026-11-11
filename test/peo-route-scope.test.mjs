import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import test from 'node:test';

test('PEO route identifies the source-specific low-molar-mass PEG example', async () => {
  const snapshot = JSON.parse(await fs.readFile('public-data/wop-publication-snapshot-v2/snapshot.json', 'utf8'));
  const entry = snapshot.polymers.find(item => item.wopId === 'wop-000226');
  const route = entry.synthesisRoutes[0];
  assert.deepEqual(route.inputs.map(item => item.label), ['Ethylene oxide', 'Triethylene glycol starter']);
  assert.equal(route.reagents[0].name, 'Potassium hydroxide');
  assert.match(route.scopeNote, /low-molar-mass PEG.*not a high-molar-mass PEO recipe/i);
  assert.match(route.productNote, /does not specify chain ends, molar mass or a high-molar-mass PEO product/i);
  assert.deepEqual(route.sourceIds, ['peg-teg-koh-us6812367']);
});
