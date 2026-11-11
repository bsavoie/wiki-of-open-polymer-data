import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import test from 'node:test';

test('MXD6 aqueous salt route does not cite a distinct molten-acid process for its steps', async () => {
  const snapshot = JSON.parse(await fs.readFile('public-data/wop-publication-snapshot-v2/snapshot.json', 'utf8'));
  const entry = snapshot.polymers.find(item => item.wopId === 'wop-000065');
  const route = entry.synthesisRoutes[0];
  assert.ok(route.sourceIds.includes('mxd6-basf-de102005051400'));
  assert.ok(!route.sourceIds.includes('mxd6-mgc-us9637594'));
  assert.ok(route.steps.every(step => !step.sourceIds.includes('mxd6-mgc-us9637594')));
  assert.ok(entry.sources.some(source => source.sourceId === 'mxd6-mgc-us9637594'));
  assert.match(route.steps[2].body, /release the pressure/i);
});
