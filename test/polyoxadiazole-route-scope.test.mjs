import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import test from 'node:test';

test('polyoxadiazole PPA route does not cite a separate Ugi-type method for its steps', async () => {
  const snapshot = JSON.parse(await fs.readFile('public-data/wop-publication-snapshot-v2/snapshot.json', 'utf8'));
  const entry = snapshot.polymers.find(item => item.wopId === 'wop-000183');
  const route = entry.synthesisRoutes[0];
  assert.deepEqual(route.sourceIds, ['polyoxadiazole-ppa-us7847054']);
  assert.ok(route.steps.every(step => !step.sourceIds.includes('polyoxadiazole-ugi-mcp-pmc9890602')));
  assert.ok(entry.sources.some(source => source.sourceId === 'polyoxadiazole-ugi-mcp-pmc9890602'));
});
