import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import test from 'node:test';

test('PDMS route retains the unidentified base catalyst in the cited comparative example', async () => {
  const snapshot = JSON.parse(await fs.readFile('public-data/wop-publication-snapshot-v2/snapshot.json', 'utf8'));
  const route = snapshot.polymers.find(item => item.wopId === 'wop-000240').synthesisRoutes[0];
  assert.deepEqual(route.inputs.map(item => item.label), ['Octamethylcyclotetrasiloxane (D4)', 'Hexamethyldisiloxane']);
  assert.equal(route.reagents[0].name, 'Base-type catalyst');
  assert.match(route.reagents[0].detail, /does not name the specific base/i);
  assert.deepEqual(route.sourceIds, ['siloxane-d4-ep2997074-comparative10']);
});
