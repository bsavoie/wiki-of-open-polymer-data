import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import test from 'node:test';

test('selected PPO and PTMEG preparations do not cite different catalyst routes as their own', async () => {
  const snapshot = JSON.parse(await fs.readFile('public-data/wop-publication-snapshot-v2/snapshot.json', 'utf8'));
  for (const [wopId, alternative] of [
    ['wop-000227', 'double-metal-cyanide-polyether-patent-2017'],
    ['wop-000228', 'ptmeg-lithium-halide-oleum-us4209641']
  ]) {
    const entry = snapshot.polymers.find(item => item.wopId === wopId);
    const route = entry.synthesisRoutes[0];
    assert.ok(!route.sourceIds.includes(alternative));
    assert.ok(route.steps.every(step => !step.sourceIds.includes(alternative)));
    assert.ok(entry.sources.some(source => source.sourceId === alternative));
  }
  const ppo = snapshot.polymers.find(item => item.wopId === 'wop-000227');
  assert.match(ppo.structuralDepictions.scopeNote, /ideal head-to-tail/i);
  assert.match(ppo.synthesisRoutes[0].productNote, /not an assertion of defect-free/i);
});
