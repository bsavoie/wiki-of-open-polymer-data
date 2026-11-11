import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import test from 'node:test';

test('polyurea interfacial preparation does not cite a separate solvent-free spray process', async () => {
  const snapshot = JSON.parse(await fs.readFile('public-data/wop-publication-snapshot-v2/snapshot.json', 'utf8'));
  const entry = snapshot.polymers.find(item => item.wopId === 'wop-000124');
  const route = entry.synthesisRoutes[0];
  assert.ok(route.sourceIds.includes('polyurea-linear-interfacial-us3367920'));
  assert.ok(!route.sourceIds.includes('polyurea-aliphatic-spray-network-us5480955'));
  assert.ok(route.steps.every(step => !step.sourceIds.includes('polyurea-aliphatic-spray-network-us5480955')));
  assert.ok(entry.sources.some(source => source.sourceId === 'polyurea-aliphatic-spray-network-us5480955'));
});
