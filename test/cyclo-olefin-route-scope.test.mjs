import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import test from 'node:test';

test('cyclo-olefin ROMP route does not depict the distinct addition-polymer structure as its product', async () => {
  const snapshot = JSON.parse(await fs.readFile('public-data/wop-publication-snapshot-v2/snapshot.json', 'utf8'));
  const entry = snapshot.polymers.find(item => item.wopId === 'wop-000016');
  assert.equal(entry.structuralDepictions.items[0].structureId, 'addition-polynorbornene-sru');
  assert.deepEqual(entry.synthesisRoutes[0].products, [{ label: 'Hydrogenated ring-opening polymer' }]);
  assert.match(entry.synthesisRoutes[0].productNote, /not structurally depicted/i);
  const copolymer = snapshot.polymers.find(item => item.wopId === 'wop-000017');
  assert.match(copolymer.structuralDepictions.scopeNote, /adjacent/);
  assert.match(copolymer.structuralDepictions.scopeNote, /without assigning the chain-wide sequence/i);
});
