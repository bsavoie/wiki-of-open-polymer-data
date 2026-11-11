// Expected graph: PubChem CID 54157542, attributed to ChEBI 147961,
// https://pubchem.ncbi.nlm.nih.gov/compound/54157542; central reducing-end
// alpha configuration is fixed by the independently source-checked alpha-D
// residue. Glycosidic positional conventions: https://iupac.qmul.ac.uk/2carb/38.html.
// The source's central reducing-end stereochemistry was unspecified; it was
// not used to infer the central alpha assignment.
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import test from 'node:test';
import initializeRDKit from '@rdkit/rdkit';

const BRANCH_ID = 'amylopectin-branched-triglucosyl-motif';
const EXPECTED_ISOMERIC_GRAPH = '*O[C@H]1O[C@H](CO[C@H]2O[C@H](CO)[C@@H](O*)[C@H](O)[C@H]2O)[C@@H](O[C@H]2O[C@H](CO)[C@@H](O*)[C@H](O)[C@H]2O)[C@H](O)[C@H]1O';

test('amylopectin branch preserves sourced alpha-D stereochemistry, glycosidic topology, and three open ends', async () => {
  const snapshot = JSON.parse(await fs.readFile('public-data/wop-publication-snapshot-v2/snapshot.json', 'utf8'));
  const definition = snapshot.chemicalStructures.find(record => record.structureId === BRANCH_ID);
  assert.ok(definition, `missing accepted ${BRANCH_ID} definition`);
  const rdkit = await initializeRDKit();
  const mol = rdkit.get_mol(definition.molfileV3000, JSON.stringify({ sanitize: true, removeHs: false, strictParsing: true }));
  assert.ok(mol?.is_valid(), 'candidate must parse strictly');
  try {
    const payload = JSON.parse(mol.get_json());
    const graph = payload.molecules[0];
    assert.equal(graph.atoms.length, 37);
    assert.equal(graph.bonds.length, 39);
    const atomicNumber = atom => graph.atoms[atom - 1].z ?? payload.defaults.atom.z;
    const neighbors = atom => graph.bonds.flatMap(bond => {
      const [a, b] = bond.atoms.map(x => x + 1);
      return a === atom ? [b] : b === atom ? [a] : [];
    });
    const bond = (a, b) => graph.bonds.find(record => record.atoms.includes(a - 1) && record.atoms.includes(b - 1));
    for (const [donor, oxygen, acceptor] of [[20,1,17], [28,4,25]]) {
      assert.equal(atomicNumber(donor), 6);
      assert.equal(atomicNumber(oxygen), 8);
      assert.equal(atomicNumber(acceptor), 6);
      assert.deepEqual(neighbors(oxygen).sort((x,y) => x-y), [donor,acceptor].sort((x,y) => x-y));
      assert.equal(bond(donor,oxygen)?.bo ?? payload.defaults.bond.bo, 1);
      assert.equal(bond(oxygen,acceptor)?.bo ?? payload.defaults.bond.bo, 1);
    }
    assert.ok(bond(25,18), 'central C6 is linked to the central ring C5');
    const rings = graph.extensions.find(extension => extension.name === 'rdkitRepresentation').atomRings;
    assert.ok(rings.some(ring => ring.includes(16)), '1→4 acceptor C4 is in a ring');
    assert.ok(rings.every(ring => !ring.includes(24)), '1→6 acceptor C6 is exocyclic');
    const ends = graph.atoms.flatMap((atom, index) => (atom.z ?? payload.defaults.atom.z) === 0 ? [index+1] : []);
    assert.deepEqual(ends, [35,36,37]);
    assert.deepEqual(ends.map(end => {
      const attached = neighbors(end);
      assert.equal(attached.length, 1);
      assert.equal(atomicNumber(attached[0]), 8);
      assert.equal(bond(end,attached[0])?.bo ?? payload.defaults.bond.bo, 1);
      return attached[0];
    }).sort((a,b) => a-b), [10,11,14]);
    const stereoCenters = graph.atoms.flatMap((atom,index) => ['cw','ccw'].includes(atom.stereo) ? [index+1] : []);
    const expectedCenters = [17,18,19,20,21,22,23,24,26,27,28,29,30,31,32];
    assert.deepEqual(stereoCenters, expectedCenters);
    const absGroups = (graph.stereoGroups || []).filter(group => group.type === 'abs');
    assert.deepEqual(absGroups.flatMap(group => group.atoms.map(atom => atom+1)).sort((a,b) => a-b), expectedCenters);
    // Full stereochemical comparison also rejects inverted central and donor
    // anomers; counting assigned centers alone would not establish alpha-D.
    assert.equal(mol.get_smiles(), EXPECTED_ISOMERIC_GRAPH);
  } finally {
    mol.delete();
  }
});

test('starch and thermoplastic starch use the connected branch in both article and route', async () => {
  const snapshot = JSON.parse(await fs.readFile('public-data/wop-publication-snapshot-v2/snapshot.json', 'utf8'));
  for (const id of ['wop-000201', 'wop-000204']) {
    const article = snapshot.polymers.find(record => record.wopId === id);
    assert.ok(article.structuralDepictions.items.some(item => item.structureId === BRANCH_ID));
    assert.ok(article.synthesisRoutes[0].products.some(item => item.structureId === BRANCH_ID));
    assert.ok(article.structuralDepictions.sourceIds.includes('li-starch-branching-enzymes-2015'));
  }
  assert.match(snapshot.polymers.find(record => record.wopId === 'wop-000204').structuralDepictions.scopeNote, /processing can alter molecular size and branching/i);
});
