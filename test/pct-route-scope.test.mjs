import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import test from 'node:test';

test('PCT route identifies the direct-acid patent example and its stereochemical limit', async () => {
  const snapshot = JSON.parse(await fs.readFile('public-data/wop-publication-snapshot-v2/snapshot.json', 'utf8'));
  const entry = snapshot.polymers.find(item => item.wopId === 'wop-000049');
  const route = entry.synthesisRoutes[0];
  assert.deepEqual(route.inputs.map(item => item.label), ['Terephthalic acid', '1,4-Cyclohexanedimethanol (70% trans)']);
  assert.deepEqual(route.reagents.map(item => item.name), ['Titanium oxide-based catalyst', 'Antimony trioxide', 'Triethyl phosphate']);
  assert.match(route.productNote, /not assigned to individual rings/i);
  assert.match(entry.contextualStructures.feedstocksAndSynthesis.scopeNote, /alternative ester-interchange route/i);
});
