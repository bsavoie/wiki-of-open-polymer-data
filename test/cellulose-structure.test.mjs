import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import test from 'node:test';
import { validateV3000Molfile } from '../lib/structure-renderer.mjs';

test('cellulose substituent labels follow C2, C3 and C6 on the absolute D backbone', async () => {
  const snapshot = JSON.parse(await fs.readFile(new URL('../public-data/wop-publication-snapshot-v2/snapshot.json', import.meta.url), 'utf8'));
  const definition = snapshot.chemicalStructures.find((item) => item.structureId === 'cellulose-trisubstitution-corrected-markush-motif');
  const s = validateV3000Molfile(definition.molfileV3000);
  const adjacent = new Map([...s.atoms.keys()].map((id) => [id, []]));
  for (const bond of s.bonds.values()) {
    adjacent.get(bond.left).push(bond.right);
    adjacent.get(bond.right).push(bond.left);
  }
  const is = (id, symbol) => s.atoms.get(id)?.symbol === symbol;
  const one = (list) => { assert.equal(list.length, 1); return list[0]; };
  const glycosidicO = one([...s.atoms.values()].filter((atom) => atom.symbol === 'O' && adjacent.get(atom.atomId).some((id) => is(id, '*'))).map((atom) => atom.atomId));
  const c1 = one(adjacent.get(glycosidicO).filter((id) => is(id, 'C')));
  const ringO = one(adjacent.get(c1).filter((id) => is(id, 'O') && id !== glycosidicO));
  const c2 = one(adjacent.get(c1).filter((id) => is(id, 'C')));
  const c3 = one(adjacent.get(c2).filter((id) => is(id, 'C') && id !== c1));
  const c4 = one(adjacent.get(c3).filter((id) => is(id, 'C') && id !== c2));
  const c5 = one(adjacent.get(ringO).filter((id) => is(id, 'C') && id !== c1));
  assert.ok(adjacent.get(c4).includes(c5));
  assert.ok(adjacent.get(c4).some((id) => is(id, '*')));
  const c6 = one(adjacent.get(c5).filter((id) => is(id, 'C') && id !== c4));
  const labelAt = (carbon) => {
    const oxygen = one(adjacent.get(carbon).filter((id) => is(id, 'O') && adjacent.get(id).some((n) => is(n, 'R#'))));
    return s.atoms.get(one(adjacent.get(oxygen).filter((id) => is(id, 'R#')))).rGroupNumber;
  };
  assert.deepEqual([labelAt(c2), labelAt(c3), labelAt(c6)], [2, 3, 6]);
  assert.match(definition.molfileV3000, /M  V30 COUNTS 16 16 0 0 1/);
  const users = snapshot.polymers.filter((p) => p.structuralDepictions.items.some((item) => item.structureId === definition.structureId));
  assert.equal(users.length, 9);
  for (const polymer of users) {
    assert.ok(polymer.structuralDepictions.sourceIds.includes('magalhaes-cellulose-structure-reactivity-2023'));
  }
});
