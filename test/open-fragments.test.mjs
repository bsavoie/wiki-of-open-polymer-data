import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import test from 'node:test';
import initializeRDKit from '@rdkit/rdkit';
import { validateV3000Molfile } from '../lib/structure-renderer.mjs';

test('local urethane, urea, and vinyl acetal motifs do not assert a false repeating chain', async () => {
  const snapshot = JSON.parse(await fs.readFile(new URL('../public-data/wop-publication-snapshot-v2/snapshot.json', import.meta.url), 'utf8'));
  const ids = ['hdi-urethane-open-segment', 'mdi-urethane-hard-open-segment', 'polyurea-open-linkage', 'polyvinyl-butyral-acetal-open-motif', 'polyvinyl-formal-acetal-open-motif'];
  for (const id of ids) {
    const record = snapshot.chemicalStructures.find((structure) => structure.structureId === id);
    assert.ok(record, id);
    const structure = validateV3000Molfile(record.molfileV3000, { structureId: id });
    assert.equal(structure.groups.length, 0, `${id} must not imply that its local motif repeats uniformly`);
    assert.equal(structure.pseudoatomIndices.size, 2, `${id} must retain both open connections`);
  }
});

test('EVA example is one open chain containing an acetate-bearing vinyl site', async () => {
  const snapshot = JSON.parse(await fs.readFile(new URL('../public-data/wop-publication-snapshot-v2/snapshot.json', import.meta.url), 'utf8'));
  const polymer = snapshot.polymers.find((entry) => entry.wopId === 'wop-000018');
  const id = 'eva-ethylene-vinyl-acetate-local-segment';
  const record = snapshot.chemicalStructures.find((structure) => structure.structureId === id);
  const structure = validateV3000Molfile(record.molfileV3000, { structureId: id });
  assert.equal(structure.groups.length, 0);
  const graph = new Map([...structure.atoms.keys()].map((atom) => [atom, []]));
  for (const bond of structure.bonds.values()) { graph.get(bond.left).push(bond.right); graph.get(bond.right).push(bond.left); }
  const ends = [...structure.atoms.values()].filter((atom) => atom.symbol === '*').map((atom) => atom.atomId);
  assert.equal(ends.length, 2);
  const queue = [[ends[0]]]; let path;
  while (queue.length) {
    const current = queue.shift();
    if (current.at(-1) === ends[1]) { path = current; break; }
    for (const next of graph.get(current.at(-1))) if (!current.includes(next)) queue.push([...current, next]);
  }
  assert.deepEqual(path.map((id) => structure.atoms.get(id).symbol), ['*', 'C', 'C', 'C', 'C', '*']);
  const substituted = path.slice(1, -1).filter((atom) => graph.get(atom).some((id) => structure.atoms.get(id).symbol === 'O'));
  assert.equal(substituted.length, 1);
  const esterO = graph.get(substituted[0]).find((id) => structure.atoms.get(id).symbol === 'O');
  const carbonyl = graph.get(esterO).find((id) => id !== substituted[0]);
  assert.ok([...structure.bonds.values()].some((bond) => bond.order === 2 && [bond.left, bond.right].includes(carbonyl) && structure.atoms.get(bond.left === carbonyl ? bond.right : bond.left).symbol === 'O'));
  assert.ok(polymer.structuralDepictions.items.some((item) => item.structureId === id && item.fidelity === 'schematic'));
  assert.ok(polymer.synthesisRoutes.some((route) => route.products.some((item) => item.structureId === id) && route.productMode === 'structural_reference'));
});

test('TPU example is a connected open segment with four urethane linkages', async () => {
  const snapshot = JSON.parse(await fs.readFile(new URL('../public-data/wop-publication-snapshot-v2/snapshot.json', import.meta.url), 'utf8'));
  const id = 'tpu-ptmeg-mdi-extended-connected-architecture';
  const record = snapshot.chemicalStructures.find((structure) => structure.structureId === id);
  const structure = validateV3000Molfile(record.molfileV3000, { structureId: id });
  assert.equal(structure.groups.length, 0, 'a local sequence must not assert a universal repeat');
  assert.equal(structure.pseudoatomIndices.size, 2);
  const bonds = [...structure.bonds.values()];
  const incident = (id) => bonds.filter((bond) => bond.left === id || bond.right === id);
  const other = (bond, id) => structure.atoms.get(bond.left === id ? bond.right : bond.left).symbol;
  const urethanes = [...structure.atoms.values()].filter((atom) => {
    if (atom.symbol !== 'C') return false;
    const neighbors = incident(atom.atomId);
    return neighbors.some((bond) => bond.order === 2 && other(bond, atom.atomId) === 'O')
      && neighbors.some((bond) => bond.order === 1 && other(bond, atom.atomId) === 'O')
      && neighbors.some((bond) => bond.order === 1 && other(bond, atom.atomId) === 'N');
  });
  assert.equal(urethanes.length, 4);
  assert.ok(!bonds.some((bond) => structure.atoms.get(bond.left).symbol === 'O' && structure.atoms.get(bond.right).symbol === 'O'));
});

test('fiber copolymer examples connect both constituent units on one open backbone', async () => {
  const snapshot = JSON.parse(await fs.readFile(new URL('../public-data/wop-publication-snapshot-v2/snapshot.json', import.meta.url), 'utf8'));
  for (const [entryId, id, secondElement] of [
    ['wop-000184', 'acrylonitrile-vinyl-chloride-local-segment', 'N'],
    ['wop-000185', 'vinyl-chloride-vinyl-acetate-local-segment', 'O']
  ]) {
    const polymer = snapshot.polymers.find((entry) => entry.wopId === entryId);
    const definition = snapshot.chemicalStructures.find((record) => record.structureId === id);
    const graph = validateV3000Molfile(definition.molfileV3000, { structureId: id });
    assert.equal(graph.groups.length, 0);
    assert.equal(graph.pseudoatomIndices.size, 2);
    const symbols = [...graph.atoms.values()].map((atom) => atom.symbol);
    assert.equal(symbols.filter((symbol) => symbol === 'Cl').length, 1);
    assert.ok(symbols.includes(secondElement));
    const adjacency = new Map([...graph.atoms.keys()].map((atom) => [atom, []]));
    for (const bond of graph.bonds.values()) { adjacency.get(bond.left).push(bond.right); adjacency.get(bond.right).push(bond.left); }
    const ends = [...graph.atoms.values()].filter((atom) => atom.symbol === '*').map((atom) => atom.atomId);
    const queue = [[ends[0]]]; let path;
    while (queue.length) {
      const current = queue.shift();
      if (current.at(-1) === ends[1]) { path = current; break; }
      for (const next of adjacency.get(current.at(-1))) if (!current.includes(next)) queue.push([...current, next]);
    }
    assert.deepEqual(path.map((atom) => graph.atoms.get(atom).symbol), ['*', 'C', 'C', 'C', 'C', '*']);
    const bonds = [...graph.bonds.values()];
    if (entryId === 'wop-000184') {
      assert.ok(bonds.some((bond) => bond.order === 3 && [graph.atoms.get(bond.left).symbol, graph.atoms.get(bond.right).symbol].sort().join() === 'C,N'));
    } else {
      assert.ok(bonds.some((bond) => bond.order === 2 && [graph.atoms.get(bond.left).symbol, graph.atoms.get(bond.right).symbol].sort().join() === 'C,O'));
    }
    assert.ok(polymer.synthesisRoutes.some((route) => route.productMode === 'structural_reference' && route.products.some((product) => product.structureId === id)));
  }
});

test('m-PBI example preserves the source-qualified connected tautomer', async () => {
  const snapshot = JSON.parse(await fs.readFile(new URL('../public-data/wop-publication-snapshot-v2/snapshot.json', import.meta.url), 'utf8'));
  const id = 'meta-pbi-connected-segment';
  const definition = snapshot.chemicalStructures.find((record) => record.structureId === id);
  const structure = validateV3000Molfile(definition.molfileV3000, { structureId: id });
  assert.equal(structure.groups.length, 0);
  assert.equal(structure.pseudoatomIndices.size, 2);
  const rdkit = await initializeRDKit();
  const molecule = rdkit.get_mol(definition.molfileV3000);
  assert.ok(molecule?.is_valid());
  try {
    assert.equal(molecule.get_smiles(), '*c1cccc(-c2nc3cc(-c4ccc5[nH]c(*)nc5c4)ccc3[nH]2)c1');
  } finally {
    molecule.delete();
  }
});

test('LLDPE example has one ethyl branch on a continuing carbon backbone', async () => {
  const snapshot = JSON.parse(await fs.readFile(new URL('../public-data/wop-publication-snapshot-v2/snapshot.json', import.meta.url), 'utf8'));
  const id = 'lldpe-ethylene-butene-local-segment';
  const definition = snapshot.chemicalStructures.find((record) => record.structureId === id);
  const structure = validateV3000Molfile(definition.molfileV3000, { structureId: id });
  assert.equal(structure.groups.length, 0);
  const graph = new Map([...structure.atoms.keys()].map((atom) => [atom, []]));
  for (const bond of structure.bonds.values()) { graph.get(bond.left).push(bond.right); graph.get(bond.right).push(bond.left); }
  const ends = [...structure.atoms.values()].filter((atom) => atom.symbol === '*').map((atom) => atom.atomId);
  assert.equal(ends.length, 2);
  const queue = [[ends[0]]]; let path;
  while (queue.length) {
    const current = queue.shift();
    if (current.at(-1) === ends[1]) { path = current; break; }
    for (const next of graph.get(current.at(-1))) if (!current.includes(next)) queue.push([...current, next]);
  }
  assert.deepEqual(path.map((atom) => structure.atoms.get(atom).symbol), ['*', 'C', 'C', 'C', 'C', 'C', 'C', '*']);
  const backbone = new Set(path);
  const branches = path.flatMap((atom) => graph.get(atom).filter((neighbor) => !backbone.has(neighbor)));
  assert.equal(branches.length, 1);
  const first = branches[0];
  assert.equal(structure.atoms.get(first).symbol, 'C');
  const second = graph.get(first).filter((atom) => !backbone.has(atom));
  assert.equal(second.length, 1);
  assert.equal(structure.atoms.get(second[0]).symbol, 'C');
  assert.equal(graph.get(second[0]).length, 1);
});

test('PDADMAC segment preserves the methylene bridge and balanced chloride ions', async () => {
  const snapshot = JSON.parse(await fs.readFile(new URL('../public-data/wop-publication-snapshot-v2/snapshot.json', import.meta.url), 'utf8'));
  const id = 'pdadmac-two-unit-chloride-segment';
  const definition = snapshot.chemicalStructures.find((record) => record.structureId === id);
  const structure = validateV3000Molfile(definition.molfileV3000, { structureId: id });
  assert.equal(structure.groups.length, 0, 'finite counterions must not be presented against an n-fold charged repeat');
  assert.equal(structure.pseudoatomIndices.size, 2);
  const atoms = [...structure.atoms.values()];
  assert.equal(atoms.filter((atom) => atom.symbol === 'N' && atom.charge === 1).length, 2);
  assert.equal(atoms.filter((atom) => atom.symbol === 'Cl' && atom.charge === -1).length, 2);
  const rdkit = await initializeRDKit();
  const molecule = rdkit.get_mol(definition.molfileV3000);
  assert.ok(molecule?.is_valid());
  try {
    assert.equal(molecule.get_smiles(), '*CC1C[N+](C)(C)CC1CCC1C[N+](C)(C)CC1C*.[Cl-].[Cl-]');
  } finally {
    molecule.delete();
  }
});

test('PNaSS segment keeps para sulfonates and balanced sodium counterions', async () => {
  const snapshot = JSON.parse(await fs.readFile(new URL('../public-data/wop-publication-snapshot-v2/snapshot.json', import.meta.url), 'utf8'));
  const id = 'pnass-two-unit-sodium-segment';
  const definition = snapshot.chemicalStructures.find((record) => record.structureId === id);
  const structure = validateV3000Molfile(definition.molfileV3000, { structureId: id });
  assert.equal(structure.groups.length, 0);
  assert.equal(structure.pseudoatomIndices.size, 2);
  const atoms = [...structure.atoms.values()];
  assert.equal(atoms.filter((atom) => atom.symbol === 'Na' && atom.charge === 1).length, 2);
  assert.equal(atoms.filter((atom) => atom.symbol === 'O' && atom.charge === -1).length, 2);
  const rdkit = await initializeRDKit();
  const molecule = rdkit.get_mol(definition.molfileV3000);
  assert.ok(molecule?.is_valid());
  try {
    assert.equal(molecule.get_smiles(), '*CC(CC(*)c1ccc(S(=O)(=O)[O-])cc1)c1ccc(S(=O)(=O)[O-])cc1.[Na+].[Na+]');
  } finally {
    molecule.delete();
  }
});

test('ionomer example joins ethylene and acid units with a balanced sodium carboxylate', async () => {
  const snapshot = JSON.parse(await fs.readFile(new URL('../public-data/wop-publication-snapshot-v2/snapshot.json', import.meta.url), 'utf8'));
  const id = 'ionomer-eaa-partial-sodium-local-segment';
  const definition = snapshot.chemicalStructures.find((record) => record.structureId === id);
  const structure = validateV3000Molfile(definition.molfileV3000, { structureId: id });
  assert.equal(structure.groups.length, 0);
  assert.equal(structure.pseudoatomIndices.size, 2);
  const rdkit = await initializeRDKit();
  const molecule = rdkit.get_mol(definition.molfileV3000);
  assert.ok(molecule?.is_valid());
  try {
    assert.equal(molecule.get_smiles(), '*CCCC(CCCC(*)C(=O)[O-])C(=O)O.[Na+]');
  } finally {
    molecule.delete();
  }
});

test('LDPE, VLDPE and EVOH examples show connected local chain structures', async () => {
  const snapshot = JSON.parse(await fs.readFile(new URL('../public-data/wop-publication-snapshot-v2/snapshot.json', import.meta.url), 'utf8'));
  const rdkit = await initializeRDKit();
  for (const [id, expected] of [
    ['ldpe-illustrative-butyl-branch', '*CCCC(CC*)CCCC'],
    ['vldpe-ethylene-octene-local-segment', '*CCCC(CC*)CCCCCC'],
    ['evoh-local-ethylene-vinyl-alcohol', '*CCCC(O)CC*']
  ]) {
    const definition = snapshot.chemicalStructures.find((record) => record.structureId === id);
    const structure = validateV3000Molfile(definition.molfileV3000, { structureId: id });
    assert.equal(structure.groups.length, 0);
    assert.equal(structure.pseudoatomIndices.size, 2);
    const molecule = rdkit.get_mol(definition.molfileV3000);
    assert.ok(molecule?.is_valid());
    try { assert.equal(molecule.get_smiles(), expected); } finally { molecule.delete(); }
  }
});

test('PFSA example retains its connected long-side-chain acid chemistry', async () => {
  const snapshot = JSON.parse(await fs.readFile(new URL('../public-data/wop-publication-snapshot-v2/snapshot.json', import.meta.url), 'utf8'));
  const id = 'pfsa-long-side-chain-acid-local-segment';
  const definition = snapshot.chemicalStructures.find((record) => record.structureId === id);
  const structure = validateV3000Molfile(definition.molfileV3000, { structureId: id });
  assert.equal(structure.groups.length, 0);
  assert.equal(structure.pseudoatomIndices.size, 2);
  const rdkit = await initializeRDKit();
  const molecule = rdkit.get_mol(definition.molfileV3000);
  assert.ok(molecule?.is_valid());
  try {
    assert.equal(molecule.get_smiles(), '*C(F)(F)C(F)(F)C(F)(F)C(*)(F)OC(F)(F)C(F)(OC(F)(F)C(F)(F)S(=O)(=O)O)C(F)(F)F');
  } finally { molecule.delete(); }
});

test('VDF/HFP example is one open fluorinated copolymer segment', async () => {
  const snapshot = JSON.parse(await fs.readFile(new URL('../public-data/wop-publication-snapshot-v2/snapshot.json', import.meta.url), 'utf8'));
  const id = 'vdf-hfp-local-chain-segment';
  const definition = snapshot.chemicalStructures.find((record) => record.structureId === id);
  const structure = validateV3000Molfile(definition.molfileV3000, { structureId: id });
  assert.equal(structure.groups.length, 0);
  assert.equal(structure.pseudoatomIndices.size, 2);
  const rdkit = await initializeRDKit();
  const molecule = rdkit.get_mol(definition.molfileV3000);
  assert.ok(molecule?.is_valid());
  try { assert.equal(molecule.get_smiles(), '*C(F)(F)CC(F)(F)C(*)(F)C(F)(F)F'); } finally { molecule.delete(); }
});

test('EAA and EMAA local segments distinguish the methacrylic methyl group', async () => {
  const snapshot = JSON.parse(await fs.readFile(new URL('../public-data/wop-publication-snapshot-v2/snapshot.json', import.meta.url), 'utf8'));
  const rdkit = await initializeRDKit();
  for (const [id, expected] of [
    ['eaa-open-acid-local-segment', '*CCCC(CC*)C(=O)O'],
    ['emaa-open-acid-local-segment', '*CCCC(C)(CC*)C(=O)O']
  ]) {
    const definition = snapshot.chemicalStructures.find((record) => record.structureId === id);
    const structure = validateV3000Molfile(definition.molfileV3000, { structureId: id });
    assert.equal(structure.groups.length, 0);
    assert.equal(structure.pseudoatomIndices.size, 2);
    const molecule = rdkit.get_mol(definition.molfileV3000);
    assert.ok(molecule?.is_valid());
    try { assert.equal(molecule.get_smiles(), expected); } finally { molecule.delete(); }
  }
});

test('PEI family example preserves the source-qualified BPADA–mPD connected chain', async () => {
  const snapshot = JSON.parse(await fs.readFile(new URL('../public-data/wop-publication-snapshot-v2/snapshot.json', import.meta.url), 'utf8'));
  const id = 'bpada-mpd-polyetherimide-open-segment';
  const definition = snapshot.chemicalStructures.find((record) => record.structureId === id);
  const structure = validateV3000Molfile(definition.molfileV3000, { structureId: id });
  assert.equal(structure.groups.length, 0);
  assert.equal(structure.pseudoatomIndices.size, 2);
  const rdkit = await initializeRDKit();
  const molecule = rdkit.get_mol(definition.molfileV3000);
  assert.ok(molecule?.is_valid());
  try {
    assert.equal(molecule.get_smiles(), '*c1cccc(N2C(=O)c3ccc(Oc4ccc(C(C)(C)c5ccc(Oc6ccc7c(c6)C(=O)N(*)C7=O)cc5)cc4)cc3C2=O)c1');
  } finally { molecule.delete(); }
});

test('biosourced PHBV and PHBHHx examples preserve connected R/R stereochemistry', async () => {
  const snapshot = JSON.parse(await fs.readFile(new URL('../public-data/wop-publication-snapshot-v2/snapshot.json', import.meta.url), 'utf8'));
  const rdkit = await initializeRDKit();
  for (const [id, expected] of [
    ['phbv-rr-local-segment', '*O[C@H](C)CC(=O)O[C@H](CC)CC(*)=O'],
    ['phbhhx-rr-local-segment', '*O[C@H](C)CC(=O)O[C@H](CCC)CC(*)=O']
  ]) {
    const definition = snapshot.chemicalStructures.find((record) => record.structureId === id);
    const structure = validateV3000Molfile(definition.molfileV3000, { structureId: id });
    assert.equal(structure.groups.length, 0);
    assert.equal(structure.pseudoatomIndices.size, 2);
    const molecule = rdkit.get_mol(definition.molfileV3000);
    assert.ok(molecule?.is_valid());
    try { assert.equal(molecule.get_smiles(), expected); } finally { molecule.delete(); }
  }
});

test('ETFE and ECTFE examples connect ethylene to the appropriate halogenated unit', async () => {
  const snapshot = JSON.parse(await fs.readFile(new URL('../public-data/wop-publication-snapshot-v2/snapshot.json', import.meta.url), 'utf8'));
  const rdkit = await initializeRDKit();
  for (const [id, expected] of [
    ['etfe-open-ethylene-tfe-segment', '*CCC(F)(F)C(*)(F)F'],
    ['ectfe-open-ethylene-ctfe-segment', '*CCC(F)(Cl)C(*)(F)F']
  ]) {
    const definition = snapshot.chemicalStructures.find((record) => record.structureId === id);
    const structure = validateV3000Molfile(definition.molfileV3000, { structureId: id });
    assert.equal(structure.groups.length, 0);
    assert.equal(structure.pseudoatomIndices.size, 2);
    const molecule = rdkit.get_mol(definition.molfileV3000);
    assert.ok(molecule?.is_valid());
    try { assert.equal(molecule.get_smiles(), expected); } finally { molecule.delete(); }
  }
});

test('thermoplastic polyimide example retains the source-qualified connected PMDA–diamine chain', async () => {
  const snapshot = JSON.parse(await fs.readFile(new URL('../public-data/wop-publication-snapshot-v2/snapshot.json', import.meta.url), 'utf8'));
  const id = 'tpi-pmda-meta-bis-dimethylbenzyl-diamine-open-segment';
  const definition = snapshot.chemicalStructures.find((record) => record.structureId === id);
  const structure = validateV3000Molfile(definition.molfileV3000, { structureId: id });
  assert.equal(structure.groups.length, 0);
  assert.equal(structure.pseudoatomIndices.size, 2);
  const rdkit = await initializeRDKit();
  const molecule = rdkit.get_mol(definition.molfileV3000);
  assert.ok(molecule?.is_valid());
  try { assert.equal(molecule.get_smiles(), '*c1ccc(C(C)(C)c2cccc(C(C)(C)c3ccc(-n4c(=O)c5cc6c(=O)n(*)c(=O)c6cc5c4=O)cc3)c2)cc1'); } finally { molecule.delete(); }
});
