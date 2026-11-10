// Split a reviewed Ketcher export containing finite, disconnected molecules.
// Atom coordinates and properties are retained; no layout or name inference.
import fs from 'node:fs/promises';
const [file, ...ids] = process.argv.slice(2);
if (!file || !ids.length) throw new Error('Usage: node scripts/import-synthesis-components.mjs <Ketcher V3000 export> <structure-id> ...');
const raw = await fs.readFile(file, 'utf8');
if (/BEGIN SGROUP|BEGIN COLLECTION|M  V30 .* -\s*$/m.test(raw)) throw new Error('Only finite, ungrouped molecules with unwrapped V3000 records are supported');
const records = name => raw.split(`M  V30 BEGIN ${name}\n`)[1].split(`M  V30 END ${name}`)[0].trim().split('\n').map(line => line.replace('M  V30 ', '').split(/\s+/));
const atoms = records('ATOM'), bonds = records('BOND');
const unseen = new Set(atoms.map(atom => atom[0]));
const components = [];
while (unseen.size) {
  const component = new Set([unseen.values().next().value]);
  for (const id of component) for (const bond of bonds) {
    if (bond[2] === id) component.add(bond[3]);
    if (bond[3] === id) component.add(bond[2]);
  }
  for (const id of component) unseen.delete(id);
  components.push(component);
}
if (components.length !== ids.length) throw new Error(`Expected ${ids.length} molecules, found ${components.length}`);
const definitions = components.map((component, i) => {
  const a = atoms.filter(atom => component.has(atom[0]));
  const b = bonds.filter(bond => component.has(bond[2]));
  const renumber = new Map(a.map((atom, index) => [atom[0], String(index + 1)]));
  const lines = [ids[i], '  Ketcher 2D', '', '  0  0  0     0  0            999 V3000', 'M  V30 BEGIN CTAB', `M  V30 COUNTS ${a.length} ${b.length} 0 0 0`, 'M  V30 BEGIN ATOM',
    ...a.map(atom => `M  V30 ${[renumber.get(atom[0]), ...atom.slice(1)].join(' ')}`), 'M  V30 END ATOM', 'M  V30 BEGIN BOND',
    ...b.map((bond, index) => `M  V30 ${[index + 1, bond[1], renumber.get(bond[2]), renumber.get(bond[3]), ...bond.slice(4)].join(' ')}`), 'M  V30 END BOND', 'M  V30 END CTAB', 'M  END', ''];
  return { structureId: ids[i], molfileV3000: lines.join('\n') };
});
// Emit candidate definitions for explicit, validated insertion into the snapshot.
console.log(JSON.stringify(definitions, null, 2));
