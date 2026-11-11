import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import fs from 'node:fs/promises';
import test from 'node:test';
import { validateV3000Molfile } from '../lib/structure-renderer.mjs';

test('chitosan depicts two open residues with reviewed absolute stereochemistry', async () => {
  const snapshot = JSON.parse(await fs.readFile('public-data/wop-publication-snapshot-v2/snapshot.json', 'utf8'));
  const entry = snapshot.polymers.find(item => item.wopId === 'wop-000206');
  const cases = [
    ['chitosan-glucosamine-open-residue', 'b255edb43e04f8740291a38e8c20d37b3d48563afed5ba04821b7fe49919cc3d'],
    ['chitosan-acetylglucosamine-open-residue', '41559bcfbfc9e1b400870a81680e93a812d3a49c4b353138fd0087ccddee2556'],
  ];
  for (const [id, expectedHash] of cases) {
    const definition = snapshot.chemicalStructures.find(item => item.structureId === id);
    assert.ok(definition, id);
    assert.equal(createHash('sha256').update(definition.molfileV3000).digest('hex'), expectedHash, 'the independently stereo-reviewed connection table is unchanged');
    assert.equal(validateV3000Molfile(definition.molfileV3000, { structureId: id }).groups.length, 0);
    assert.match(definition.molfileV3000, /MDLV30\/STEABS ATOMS=\(5 /);
    assert.ok(entry.structuralDepictions.items.some(item => item.structureId === id));
    assert.ok(entry.synthesisRoutes[0].products.some(item => item.structureId === id));
  }
  assert.match(entry.structuralDepictions.scopeNote, /neutral/i);
  assert.match(entry.structuralDepictions.scopeNote, /protonation.*vary/i);
  assert.equal(entry.synthesisRoutes[0].inputs[0].structureId, 'chitin-n-acetylglucosamine-unit');
});
