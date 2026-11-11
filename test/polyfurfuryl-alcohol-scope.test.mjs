import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import test from 'node:test';
import { validateV3000Molfile } from '../lib/structure-renderer.mjs';

test('polyfurfuryl alcohol illustrates a sourced linear fragment without asserting a network', async () => {
  const snapshot = JSON.parse(await fs.readFile('public-data/wop-publication-snapshot-v2/snapshot.json', 'utf8'));
  const entry = snapshot.polymers.find(item => item.wopId === 'wop-000131');
  const id = entry.structuralDepictions.items[0].structureId;
  assert.equal(id, 'pfa-open-linear-furan-methylene-fragment');
  const definition = snapshot.chemicalStructures.find(item => item.structureId === id);
  assert.equal(validateV3000Molfile(definition.molfileV3000, { structureId: id }).groups.length, 0);
  assert.match(entry.structuralDepictions.scopeNote, /branched and crosslinked network.*not depicted/i);
  assert.match(entry.synthesisRoutes[0].steps[0].body, /reaction is exothermic/i);
  assert.deepEqual(entry.synthesisRoutes[0].sourceIds, ['tondi-polyfurfuryl-alcohol-structure-study-2019']);
});
