// FAO describes beta-D-mannuronic acid (M), alpha-L-guluronic acid (G),
// mixed MG blocks and C1–O–C4 linkages:
// https://www.fao.org/4/x5822e/x5822e04.htm
// The two sugar residue configurations of the checked candidate were verified
// by cleaving the bridge, capping open sites, and comparing the resulting
// finite neutral acids to RCSB BEM and LGU (https://www.rcsb.org/ligand/BEM,
// https://www.rcsb.org/ligand/LGU). The full isomeric graph below derives from
// that independently checked candidate, not from an assumed universal sequence.
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import test from 'node:test';
import initializeRDKit from '@rdkit/rdkit';

const SEGMENT_ID = 'alginic-acid-mg-local-segment';
const EXPECTED_GRAPH = '*O[C@@H]1O[C@H](C(=O)O)[C@@H](O[C@@H]2O[C@@H](C(=O)O)[C@@H](O*)[C@H](O)[C@@H]2O)[C@H](O)[C@@H]1O';

test('alginic acid M–G segment preserves the 1→4 bridge, acid form, continuations, and absolute stereochemistry', async () => {
  const snapshot = JSON.parse(await fs.readFile('public-data/wop-publication-snapshot-v2/snapshot.json', 'utf8'));
  const definition = snapshot.chemicalStructures.find(record => record.structureId === SEGMENT_ID);
  assert.ok(definition, `missing ${SEGMENT_ID} definition`);
  const rdkit = await initializeRDKit();
  const mol = rdkit.get_mol(definition.molfileV3000, JSON.stringify({ sanitize: true, removeHs: false, strictParsing: true }));
  assert.ok(mol?.is_valid(), 'candidate must parse strictly');
  try {
    const payload = JSON.parse(mol.get_json());
    const graph = payload.molecules[0];
    assert.equal(graph.atoms.length, 27);
    assert.equal(graph.bonds.length, 28);
    const atom = i => graph.atoms[i - 1];
    const atomicNumber = i => atom(i).z ?? payload.defaults.atom.z;
    const hydrogens = i => atom(i).impHs ?? payload.defaults.atom.impHs;
    const neighbors = i => graph.bonds.flatMap(edge => {
      const [a,b] = edge.atoms.map(j => j+1);
      return a === i ? [b] : b === i ? [a] : [];
    });
    const bondOrder = (a,b) => {
      const edge = graph.bonds.find(record => record.atoms.includes(a-1) && record.atoms.includes(b-1));
      assert.ok(edge, `missing bond ${a}–${b}`);
      return edge.bo ?? payload.defaults.bond.bo;
    };
    // M C4 – O – G C1; the oxygen joins the two different sugar rings.
    assert.equal(atomicNumber(14), 8);
    assert.deepEqual(neighbors(14).sort((a,b)=>a-b), [9,15]);
    assert.equal(bondOrder(9,14), 1);
    assert.equal(bondOrder(14,15), 1);
    const rings = graph.extensions.find(extension => extension.name === 'rdkitRepresentation').atomRings;
    assert.ok(rings.some(ring => ring.includes(8) && !ring.includes(14)), 'M C4 is in the M ring');
    assert.ok(rings.some(ring => ring.includes(14) && !ring.includes(8)), 'G C1 is in the other ring');
    assert.ok(rings.every(ring => !ring.includes(13)), 'glycosidic oxygen is outside both rings');
    // Both free ends represent continuation through O; they are not a cyclic repeat closure.
    const ends = graph.atoms.flatMap((a,i) => (a.z ?? payload.defaults.atom.z) === 0 ? [i+1] : []);
    assert.deepEqual(ends, [1,27]);
    assert.deepEqual(ends.map(end => {
      const attached = neighbors(end);
      assert.equal(attached.length, 1);
      assert.equal(atomicNumber(attached[0]), 8);
      assert.equal(bondOrder(end,attached[0]),1);
      return attached[0];
    }), [2,22]);
    assert.deepEqual(neighbors(2).sort((a,b)=>a-b), [1,3]);
    assert.deepEqual(neighbors(22).sort((a,b)=>a-b), [21,27]);
    // Explicit neutral COOH at both uronic acid C6 atoms, no Na+ counterions.
    for (const [carbon,carbonyl,hydroxyl] of [[6,7,8],[18,19,20]]) {
      assert.equal(atomicNumber(carbon),6);
      assert.equal(atomicNumber(carbonyl),8);
      assert.equal(atomicNumber(hydroxyl),8);
      assert.equal(bondOrder(carbon,carbonyl),2);
      assert.equal(bondOrder(carbon,hydroxyl),1);
      assert.equal(hydrogens(hydroxyl),1);
    }
    assert.ok(graph.atoms.every(a => (a.chg ?? payload.defaults.atom.chg) === 0), 'all atoms are neutral');
    assert.ok(graph.atoms.every(a => (a.z ?? payload.defaults.atom.z) !== 11), 'no sodium counterions');
    const centers = graph.atoms.flatMap((a,i) => ['cw','ccw'].includes(a.stereo) ? [i+1] : []);
    const expectedCenters = [3,5,9,10,12,15,17,21,23,25];
    assert.deepEqual(centers, expectedCenters);
    const abs = (graph.stereoGroups || []).filter(group => group.type === 'abs');
    assert.deepEqual(abs.flatMap(group => group.atoms.map(i=>i+1)).sort((a,b)=>a-b), expectedCenters);
    assert.equal((graph.stereoGroups || []).length,1, 'all assigned centers belong only to STEABS');
    // Counting centers alone would miss any inversion; compare the entire
    // independently checked isomeric graph to establish the absolute assignments.
    assert.equal(mol.get_smiles(), EXPECTED_GRAPH);
  } finally {
    mol.delete();
  }
});
