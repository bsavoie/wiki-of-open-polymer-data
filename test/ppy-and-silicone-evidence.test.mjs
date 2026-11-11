import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import test from 'node:test';
import { validateV3000Molfile } from '../lib/structure-renderer.mjs';

test('polypyrrole route excludes the retracted CTAB study and identifies its formulation', async () => {
  const snapshot = JSON.parse(await fs.readFile('public-data/wop-publication-snapshot-v2/snapshot.json', 'utf8'));
  const entry = snapshot.polymers.find(item => item.wopId === 'wop-000243');
  const serialized = JSON.stringify(entry);
  assert.doesNotMatch(serialized, /PMC10338976|10\.1016\/j\.heliyon\.2023\.e17611|cetyltrimethylammonium/i);
  const route = entry.synthesisRoutes[0];
  assert.match(route.scopeNote, /poly\(vinyl alcohol\)-stabilized/i);
  assert.match(route.productNote, /does not depict.*stabilizer/i);
  assert.ok(route.sourceIds.includes('penunuri-ppy-pva-nanoparticles-2022'));
  const rubberStudy = entry.sources.find(source => source.sourceId === 'ppy-nbr-hot-press-composite-processing-2019');
  assert.ok(rubberStudy.supports.includes('mechanicalProperties'));
  assert.match(entry.sections.mechanicalProperties, /rubber composite, not neat PPy/i);
});

test('silicone family depiction limits its n-repeat and source claims', async () => {
  const snapshot = JSON.parse(await fs.readFile('public-data/wop-publication-snapshot-v2/snapshot.json', 'utf8'));
  const entry = snapshot.polymers.find(item => item.wopId === 'wop-000160');
  const depiction = entry.structuralDepictions;
  assert.match(depiction.scopeNote, /idealized uniform linear/i);
  assert.match(depiction.items[0].notation, /does not establish every possible combination/i);
  assert.match(entry.synthesisRoutes[0].productNote, /not a depiction of the hydrosilylation crosslink/i);
  const id = depiction.items[0].structureId;
  const definition = snapshot.chemicalStructures.find(item => item.structureId === id);
  assert.equal(validateV3000Molfile(definition.molfileV3000, { structureId: id }).groups.length, 1);
});
