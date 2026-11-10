import fs from 'node:fs/promises';
import path from 'node:path';
import initializeRDKit from '@rdkit/rdkit';

export const STRUCTURE_RENDERER_VERSION = 'rdkit-js-2025.03.4';
export const STRUCTURE_STYLE_ID = 'wop-structure-style-v5';
export const STRUCTURE_STYLE = Object.freeze({
  id: STRUCTURE_STYLE_ID,
  bondLengthPx: 48,
  bondLineWidthPx: 2,
  annotationFontScale: 1.2,
  repeatLabelGapPx: 4,
  marginPx: 24,
  maximumWidthPx: 960,
  maximumHeightPx: 480,
  drawingCanvasPx: 4096,
  atomColoring: true,
  labelMode: 'heteroatom-and-required-terminal',
  stereoStyle: 'wedge-hash-wavy-and-crossed-unknown',
  background: 'transparent',
  coordinatePolicy: 'preserve-authored-v3000',
  superatomPolicy: 'expanded-only',
  attachmentPolicy: 'unlabeled-terminal-pseudoatom',
  sgroupConnectivityLabelPolicy: 'suppress-ht-hh-eu',
  markushPolicy: 'visible-generic-and-numbered-r-with-authored-notation'
});

const STRUCTURE_ID_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const NUMBER_PATTERN_SOURCE = String.raw`[+-]?(?:\d+(?:\.\d*)?|\.\d+)(?:[Ee][+-]?\d+)?`;
const NUMBER_PATTERN = new RegExp(`^${NUMBER_PATTERN_SOURCE}$`);
const MAX_MOLFILE_BYTES = 2 * 1024 * 1024;
const MAX_SVG_BYTES = 8 * 1024 * 1024;
const MAX_SVG_ELEMENTS = 100_000;
const RDKit_RUNTIME_VERSION = '2025.03.4';
const RAW_ROOT_ATTRIBUTES = new Set([
  'version', 'baseProfile', 'xmlns', 'xmlns:rdkit', 'xmlns:xlink', 'xml:space', 'width', 'height', 'viewBox'
]);
const PATH_PRESENTATION_ATTRIBUTES = new Set([
  'fill', 'fill-rule', 'fill-opacity', 'stroke', 'stroke-width', 'stroke-linecap', 'stroke-linejoin',
  'stroke-miterlimit', 'stroke-opacity'
]);
const PATH_ATTRIBUTE_ORDER = [
  'fill', 'fill-rule', 'fill-opacity', 'stroke', 'stroke-width', 'stroke-linecap', 'stroke-linejoin',
  'stroke-miterlimit', 'stroke-opacity'
];
const PATH_STYLE_ATTRIBUTES = new Set(PATH_ATTRIBUTE_ORDER);
const SVG_COLOR_PATTERN = /^(?:none|#[0-9A-Fa-f]{6})$/;
const SVG_COMMAND_ARGUMENTS = Object.freeze({ M: 2, L: 2, C: 6, Q: 4, Z: 0 });
const COORDINATE_TOLERANCE = 1e-4;

let rdkitPromise;

function structureError(structureId, message, cause) {
  const error = new Error(`${structureId ? `Chemical structure ${structureId}` : 'Chemical structure'}: ${message}`, cause ? { cause } : undefined);
  error.code = 'WOP_STRUCTURE_ERROR';
  return error;
}

function normalizeMolfile(molfileV3000, structureId) {
  if (typeof molfileV3000 !== 'string' || !molfileV3000.trim()) {
    throw structureError(structureId, 'molfileV3000 must be a non-empty string');
  }
  if (Buffer.byteLength(molfileV3000, 'utf8') > MAX_MOLFILE_BYTES) {
    throw structureError(structureId, `molfileV3000 exceeds ${MAX_MOLFILE_BYTES} bytes`);
  }
  if (molfileV3000.includes('\0')) throw structureError(structureId, 'molfileV3000 contains a NUL byte');
  return `${molfileV3000.replace(/\r\n?/g, '\n').trimEnd()}\n`;
}

function logicalV3000Lines(molfile) {
  const physical = molfile.split('\n');
  const logical = [];
  for (let index = 0; index < physical.length; index += 1) {
    const line = physical[index];
    if (!line.startsWith('M  V30 ')) continue;
    let content = line.slice(7);
    while (content.endsWith('-')) {
      index += 1;
      if (index >= physical.length || !physical[index].startsWith('M  V30 ')) {
        throw new Error('unterminated V3000 continuation line');
      }
      content = `${content.slice(0, -1)}${physical[index].slice(7)}`;
    }
    logical.push(content);
  }
  return logical;
}

function validateCoordinates(lines, structureId) {
  const begin = lines.indexOf('BEGIN ATOM');
  const end = lines.indexOf('END ATOM');
  if (begin < 0 || end <= begin) throw structureError(structureId, 'V3000 atom block is missing or out of order');

  const atomLines = lines.slice(begin + 1, end);
  const counts = lines.find((line) => line.startsWith('COUNTS '));
  const declaredAtoms = counts?.match(/^COUNTS\s+(\d+)\s+/)?.[1];
  if (!declaredAtoms) throw structureError(structureId, 'V3000 COUNTS record is missing or malformed');
  if (Number(declaredAtoms) !== atomLines.length || atomLines.length === 0) {
    throw structureError(structureId, `V3000 atom count declares ${declaredAtoms}, but ${atomLines.length} atom records were found`);
  }

  const atomPattern = new RegExp(
    `^\\d+\\s+(?:"(?:[^"]|"")*"|\\S+)\\s+(${NUMBER_PATTERN_SOURCE})\\s+(${NUMBER_PATTERN_SOURCE})\\s+(${NUMBER_PATTERN_SOURCE})\\s+\\d+(?:\\s|$)`
  );
  const xyCoordinates = [];
  for (const atomLine of atomLines) {
    const match = atomLine.match(atomPattern);
    if (!match) throw structureError(structureId, `malformed V3000 atom record: ${atomLine}`);
    const coordinates = match.slice(1).map(Number);
    if (coordinates.some((coordinate) => !Number.isFinite(coordinate))) {
      throw structureError(structureId, `non-finite V3000 coordinate in atom record: ${atomLine}`);
    }
    xyCoordinates.push(`${coordinates[0]},${coordinates[1]}`);
  }
  if (xyCoordinates.length > 1 && new Set(xyCoordinates).size === 1) {
    throw structureError(structureId, 'all authored atom coordinates overlap; run an explicit curator layout in Ketcher');
  }
  return atomLines.length;
}

function countedIds(line, key, structureId, { required = false } = {}) {
  const match = line.match(new RegExp(`(?:^|\\s)${key}=\\((\\d+)\\s*([0-9\\s]*)\\)(?:\\s|$)`));
  if (!match) {
    if (required) throw structureError(structureId, `V3000 S-group is missing ${key}`);
    return null;
  }
  const ids = match[2].trim() ? match[2].trim().split(/\s+/).map(Number) : [];
  if (ids.length !== Number(match[1]) || ids.some((id) => !Number.isInteger(id) || id <= 0) ||
      new Set(ids).size !== ids.length) {
    throw structureError(structureId, `V3000 S-group ${key} count or identifiers are malformed`);
  }
  return ids;
}

function sameNumberSet(left, right) {
  return left.size === right.size && [...left].every((value) => right.has(value));
}

function validateConnectionTableSemantics(lines, structureId) {
  const counts = lines.find((line) => line.startsWith('COUNTS '));
  const declared = counts?.match(/^COUNTS\s+(\d+)\s+(\d+)\s+(\d+)\s+/);
  if (!declared) throw structureError(structureId, 'V3000 COUNTS record is missing or malformed');
  const atomBegin = lines.indexOf('BEGIN ATOM');
  const atomEnd = lines.indexOf('END ATOM');
  const bondBegin = lines.indexOf('BEGIN BOND');
  const bondEnd = lines.indexOf('END BOND');
  if (bondBegin < 0 || bondEnd <= bondBegin) throw structureError(structureId, 'V3000 bond block is missing or out of order');

  const atoms = new Map();
  for (const line of lines.slice(atomBegin + 1, atomEnd)) {
    const match = line.match(new RegExp(
      `^(\\d+)\\s+("(?:[^"]|"")*"|\\S+)\\s+(${NUMBER_PATTERN_SOURCE})\\s+(${NUMBER_PATTERN_SOURCE})\\s+(${NUMBER_PATTERN_SOURCE})\\s+\\d+(?:\\s|$)`
    ));
    if (!match || atoms.has(Number(match[1]))) throw structureError(structureId, `malformed or duplicate V3000 atom record: ${line}`);
    const chargeToken = line.match(/(?:^|\s)CHG=([+-]?\d+)(?:\s|$)/)?.[1];
    const charge = chargeToken === undefined ? 0 : Number(chargeToken);
    if (!Number.isSafeInteger(charge)) throw structureError(structureId, `invalid V3000 formal charge in atom record: ${line}`);
    atoms.set(Number(match[1]), {
      atomId: Number(match[1]),
      symbol: match[2],
      x: Number(match[3]),
      y: Number(match[4]),
      z: Number(match[5]),
      charge,
      line
    });
  }
  const bonds = new Map();
  for (const line of lines.slice(bondBegin + 1, bondEnd)) {
    const match = line.match(/^(\d+)\s+(\d+)\s+(\d+)\s+(\d+)(?:\s|$)/);
    if (!match) throw structureError(structureId, `malformed V3000 bond record: ${line}`);
    const [bondId, order, left, right] = match.slice(1).map(Number);
    if (bonds.has(bondId) || !atoms.has(left) || !atoms.has(right) || left === right) {
      throw structureError(structureId, `invalid or duplicate V3000 bond record: ${line}`);
    }
    const cfgToken = line.match(/(?:^|\s)CFG=(\d+)(?:\s|$)/)?.[1];
    const cfg = cfgToken === undefined ? null : Number(cfgToken);
    if (cfg !== null && ![1, 2, 3].includes(cfg)) {
      throw structureError(structureId, `V3000 bond ${bondId} has unsupported CFG=${cfg}`);
    }
    bonds.set(bondId, { bondId, order, left, right, cfg, line });
  }
  if (atoms.size !== Number(declared[1]) || bonds.size !== Number(declared[2])) {
    throw structureError(structureId, 'V3000 COUNTS does not match the atom or bond block');
  }

  const sgroupBegin = lines.indexOf('BEGIN SGROUP');
  const sgroupEnd = lines.indexOf('END SGROUP');
  const groupLines = sgroupBegin < 0 && sgroupEnd < 0
    ? []
    : (sgroupBegin >= 0 && sgroupEnd > sgroupBegin
        ? lines.slice(sgroupBegin + 1, sgroupEnd).filter((line) => /^\d+\s+\S+\s+/.test(line))
        : null);
  if (groupLines === null) throw structureError(structureId, 'V3000 S-group block is incomplete or out of order');
  if (groupLines.length !== Number(declared[3])) {
    throw structureError(structureId, 'V3000 COUNTS does not match the S-group block');
  }

  const groupIds = new Set();
  const groups = [];
  for (const line of groupLines) {
    const match = line.match(/^(\d+)\s+(\S+)\s+/);
    const groupId = Number(match?.[1]);
    const type = match?.[2];
    if (!Number.isInteger(groupId) || groupIds.has(groupId)) {
      throw structureError(structureId, `invalid or duplicate V3000 S-group record: ${line}`);
    }
    groupIds.add(groupId);
    const atomIds = countedIds(line, 'ATOMS', structureId, { required: ['SRU', 'COP'].includes(type) });
    const xbondIds = countedIds(line, 'XBONDS', structureId, { required: type === 'SRU' });
    if (atomIds?.some((id) => !atoms.has(id)) || xbondIds?.some((id) => !bonds.has(id))) {
      throw structureError(structureId, `V3000 S-group ${groupId} references an unknown atom or bond`);
    }
    const bracketCoordinates = [...line.matchAll(/(?:^|\s)BRKXYZ=\(9\s+([^)]+)\)/g)].map((match) => {
      const values = match[1].trim().split(/\s+/).map(Number);
      if (values.length !== 9 || values.some((value) => !Number.isFinite(value))) {
        throw structureError(structureId, `V3000 S-group ${groupId} has malformed BRKXYZ coordinates`);
      }
      return values;
    });
    groups.push({
      groupId,
      type,
      atomIds: atomIds || [],
      xbondIds: xbondIds || [],
      connect: line.match(/(?:^|\s)CONNECT=([A-Z]+)(?:\s|$)/)?.[1] || null,
      subtype: line.match(/(?:^|\s)SUBTYPE=([A-Z]+)(?:\s|$)/)?.[1] || null,
      label: line.match(/(?:^|\s)LABEL=("(?:[^"]|"")*"|\S+)(?:\s|$)/)?.[1] || null,
      bracketCoordinates,
      line
    });
  }

  for (const group of groups.filter(({ type }) => ['SRU', 'COP'].includes(type))) {
    const atomIds = new Set(group.atomIds);
    if (atomIds.size < 2) throw structureError(structureId, `V3000 ${group.type} S-group ${group.groupId} must contain at least two atoms`);
    if ([...atomIds].some((id) => atoms.get(id).symbol === '*')) {
      throw structureError(structureId, `V3000 ${group.type} S-group ${group.groupId} cannot contain an attachment pseudoatom`);
    }
    const connect = group.connect;
    if (group.type === 'SRU' && !['HT', 'HH', 'EU'].includes(connect)) {
      throw structureError(structureId, `V3000 SRU S-group ${group.groupId} requires CONNECT=HT, HH, or EU`);
    }
    if (group.type === 'COP' && connect && !['HT', 'HH', 'EU'].includes(connect)) {
      throw structureError(structureId, `V3000 COP S-group ${group.groupId} has an invalid CONNECT value`);
    }
    const subtype = group.subtype;
    if (group.type === 'COP' && subtype && !['ALT', 'BLO', 'RAN'].includes(subtype)) {
      throw structureError(structureId, `V3000 COP S-group ${group.groupId} has an invalid subtype`);
    }
    const boundary = new Set([...bonds]
      .filter(([, bond]) => atomIds.has(bond.left) !== atomIds.has(bond.right))
      .map(([bondId]) => bondId));
    if (group.type === 'SRU') {
      const xbondIds = new Set(group.xbondIds);
      if (xbondIds.size < 2 || !sameNumberSet(boundary, xbondIds)) {
        throw structureError(structureId, `V3000 SRU S-group ${group.groupId} XBONDS must name every bracket-crossing bond`);
      }
      const connected = new Set([group.atomIds[0]]);
      let changed = true;
      while (changed) {
        changed = false;
        for (const bond of bonds.values()) {
          if (!atomIds.has(bond.left) || !atomIds.has(bond.right)) continue;
          if (connected.has(bond.left) && !connected.has(bond.right)) {
            connected.add(bond.right);
            changed = true;
          } else if (connected.has(bond.right) && !connected.has(bond.left)) {
            connected.add(bond.left);
            changed = true;
          }
        }
      }
      if (connected.size !== atomIds.size) {
        throw structureError(structureId, `V3000 SRU S-group ${group.groupId} atoms must form one connected repeat segment`);
      }
    } else if (group.xbondIds.length && !sameNumberSet(boundary, new Set(group.xbondIds))) {
      throw structureError(structureId, `V3000 COP S-group ${group.groupId} XBONDS must name every group-crossing bond`);
    }
  }

  const pseudoatomIndices = new Set();
  const genericRAtomIndices = new Set();
  const numberedRAtomLabels = new Map();
  for (const [atomId, atom] of atoms) {
    if (atom.symbol === '"R"' || atom.symbol === '"R#"') {
      throw structureError(structureId, `Markush R atom ${atomId} must use an unquoted V3000 atom symbol`);
    }
    if (atom.symbol === 'R#') {
      if (/(?:^|\s)(?:CHG|MASS|RAD|MAP)=/.test(atom.line)) {
        throw structureError(structureId, `numbered Markush R atom ${atomId} cannot carry charge, isotope, radical, or atom-map metadata`);
      }
      const groupRecords = [...atom.line.matchAll(/(?:^|\s)RGROUPS=\((\d+)\s*([0-9\s]*)\)(?=\s|$)/g)];
      const groupNumberToken = groupRecords.length === 1 ? groupRecords[0][2].trim() : '';
      if (groupRecords.length !== 1 || groupRecords[0][1] !== '1' ||
          !/^(?:[1-9]|[12][0-9]|3[0-2])$/.test(groupNumberToken)) {
        throw structureError(structureId, `numbered Markush R atom ${atomId} requires exactly one RGROUPS=(1 n) label with n from 1 to 32`);
      }
      const groupNumber = Number(groupNumberToken);
      const attached = [...bonds].filter(([, bond]) => bond.left === atomId || bond.right === atomId);
      if (attached.length !== 1 || attached[0][1].order !== 1) {
        throw structureError(structureId, `numbered Markush R atom ${atomId} must have exactly one single bond`);
      }
      numberedRAtomLabels.set(atomId - 1, groupNumber);
      atom.rGroupNumber = groupNumber;
      continue;
    }
    if (atom.symbol === 'R') {
      if (/(?:^|\s)(?:CHG|MASS|RAD|RGROUPS|MAP)=/.test(atom.line)) {
        throw structureError(structureId, `generic Markush R atom ${atomId} cannot carry charge, isotope, radical, numbered R-group, or atom-map metadata`);
      }
      const attached = [...bonds].filter(([, bond]) => bond.left === atomId || bond.right === atomId);
      if (attached.length !== 1 || attached[0][1].order !== 1) {
        throw structureError(structureId, `generic Markush R atom ${atomId} must have exactly one single bond`);
      }
      genericRAtomIndices.add(atomId - 1);
      continue;
    }
    if (/(?:^|\s)RGROUPS=/.test(atom.line)) {
      throw structureError(structureId, `non-R# atom ${atomId} cannot carry numbered R-group metadata`);
    }
    if (atom.symbol !== '*') continue;
    if (/(?:^|\s)(?:CHG|MASS|RAD)=/.test(atom.line)) {
      throw structureError(structureId, `attachment pseudoatom ${atomId} cannot carry charge, isotope, or radical metadata`);
    }
    const attached = [...bonds].filter(([, bond]) => bond.left === atomId || bond.right === atomId);
    if (attached.length !== 1 || attached[0][1].order !== 1) {
      throw structureError(structureId, `attachment pseudoatom ${atomId} must have exactly one single bond`);
    }
    pseudoatomIndices.add(atomId - 1);
  }
  const bondLengths = [...bonds.values()].map((bond) => {
    const left = atoms.get(bond.left);
    const right = atoms.get(bond.right);
    return Math.hypot(left.x - right.x, left.y - right.y);
  });
  if (!bondLengths.length || bondLengths.some((length) => !Number.isFinite(length) || length <= 0)) {
    throw structureError(structureId, 'every V3000 bond must have a positive finite authored 2D length');
  }
  const meanBondLength = bondLengths.reduce((sum, length) => sum + length, 0) / bondLengths.length;
  return { pseudoatomIndices, genericRAtomIndices, numberedRAtomLabels, groups, atoms, bonds, meanBondLength };
}

function assertExpandedSuperatoms(lines, structureId) {
  for (const line of lines) {
    if (/^\d+\s+SUP\s/.test(line) && !/(?:^|\s)ESTATE=E(?:\s|$)/.test(line)) {
      throw structureError(structureId, 'SUP S-groups must be authored with ESTATE=E so the build never silently expands them');
    }
  }
}

export function validateV3000Molfile(molfileV3000, { structureId = null } = {}) {
  const molfile = normalizeMolfile(molfileV3000, structureId);
  if (!/^ {0,3}\d+\s+\d+.*V3000\s*$/m.test(molfile) || /V2000/.test(molfile)) {
    throw structureError(structureId, 'canonical structure must be an MDL V3000 molfile');
  }
  for (const marker of ['BEGIN CTAB', 'END CTAB', 'BEGIN BOND', 'END BOND']) {
    if (!molfile.includes(`M  V30 ${marker}`)) throw structureError(structureId, `V3000 ${marker} marker is missing`);
  }
  if (!/^M  END\s*$/m.test(molfile)) throw structureError(structureId, 'molfile M  END terminator is missing');

  let lines;
  try {
    lines = logicalV3000Lines(molfile);
  } catch (error) {
    throw structureError(structureId, error.message, error);
  }
  const atomCount = validateCoordinates(lines, structureId);
  assertExpandedSuperatoms(lines, structureId);
  const semantics = validateConnectionTableSemantics(lines, structureId);
  return { molfile, atomCount, ...semantics };
}

function validateDefinition(definition) {
  if (!definition || typeof definition !== 'object' || Array.isArray(definition)) {
    throw structureError(null, 'registry records must be objects');
  }
  const { structureId, molfileV3000 } = definition;
  if (typeof structureId !== 'string' || !STRUCTURE_ID_PATTERN.test(structureId)) {
    throw structureError(null, `invalid structureId ${JSON.stringify(structureId)}; use a stable lowercase slug`);
  }
  const validated = validateV3000Molfile(molfileV3000, { structureId });
  return { structureId, ...validated };
}

async function getRDKit() {
  rdkitPromise ||= initializeRDKit().then((rdkit) => {
    const runtimeVersion = rdkit.version();
    if (runtimeVersion !== RDKit_RUNTIME_VERSION) {
      throw new Error(`expected RDKit ${RDKit_RUNTIME_VERSION}, received ${runtimeVersion}`);
    }
    return rdkit;
  });
  return rdkitPromise;
}

function parseWithRDKit(rdkit, molfile, structureId, purpose) {
  let molecule;
  try {
    molecule = rdkit.get_mol(molfile, JSON.stringify({
      sanitize: true,
      removeHs: false,
      strictParsing: true
    }));
    if (!molecule || !molecule.is_valid()) {
      molecule?.delete();
      throw new Error('RDKit rejected the connection table during strict sanitized parsing');
    }
    if (!molecule.has_coords()) {
      molecule.delete();
      throw new Error('RDKit did not retain the authored 2D coordinates');
    }
    return molecule;
  } catch (error) {
    molecule?.delete();
    throw structureError(structureId, `RDKit could not parse/check the ${purpose} V3000 molfile: ${error.message || error}`, error);
  }
}

function arrayEqual(left, right) {
  return left.length === right.length && left.every((value, index) => value === right[index]);
}

function approximatelyEqual(left, right, tolerance = COORDINATE_TOLERANCE) {
  return Number.isFinite(left) && Number.isFinite(right) && Math.abs(left - right) <= tolerance;
}

function verifyRDKitSemantics(
  molecule,
  semantics,
  structureId,
  { suppressedConnect = false, suppressedNumberedRGroups = false } = {}
) {
  let payload;
  try {
    payload = JSON.parse(molecule.get_json());
  } catch (error) {
    throw structureError(structureId, `RDKit returned malformed semantic JSON: ${error.message || error}`, error);
  }
  const parsed = payload?.molecules?.[0];
  const defaultAtom = payload?.defaults?.atom || {};
  const defaultBond = payload?.defaults?.bond || {};
  if (!parsed || !Array.isArray(parsed.atoms) || !Array.isArray(parsed.bonds)) {
    throw structureError(structureId, 'RDKit semantic JSON is missing atoms or bonds');
  }
  if (parsed.atoms.length !== semantics.atoms.size || parsed.bonds.length !== semantics.bonds.size) {
    throw structureError(structureId, 'RDKit changed the canonical atom or bond count');
  }

  const coordinates = parsed.conformers?.[0]?.coords;
  if (!Array.isArray(coordinates) || coordinates.length !== semantics.atoms.size) {
    throw structureError(structureId, 'RDKit semantic JSON is missing the authored 2D conformer');
  }
  for (const [atomId, expected] of semantics.atoms) {
    const actual = parsed.atoms[atomId - 1];
    const actualCharge = actual?.chg ?? defaultAtom.chg ?? 0;
    if (actualCharge !== expected.charge) {
      throw structureError(structureId, `RDKit changed formal charge on atom ${atomId}`);
    }
    if (expected.symbol === 'R#') {
      const actualAtomicNumber = actual?.z ?? defaultAtom.z ?? 6;
      const actualRGroupNumber = actual?.isotope ?? defaultAtom.isotope ?? 0;
      const expectedRGroupNumber = suppressedNumberedRGroups ? 0 : expected.rGroupNumber;
      if (actualAtomicNumber !== 0 || actualRGroupNumber !== expectedRGroupNumber) {
        throw structureError(structureId, `RDKit changed numbered Markush R-group semantics on atom ${atomId}`);
      }
    }
    const coordinate = coordinates[atomId - 1];
    if (!Array.isArray(coordinate) || !approximatelyEqual(coordinate[0], expected.x) ||
        !approximatelyEqual(coordinate[1], expected.y)) {
      throw structureError(structureId, `RDKit changed authored 2D coordinates for atom ${atomId}`);
    }
  }
  for (const [bondId, expected] of semantics.bonds) {
    const actual = parsed.bonds[bondId - 1];
    const actualOrder = actual?.bo ?? defaultBond.bo ?? 1;
    if (!actual || !arrayEqual(actual.atoms || [], [expected.left - 1, expected.right - 1]) || actualOrder !== expected.order) {
      throw structureError(structureId, `RDKit changed canonical connectivity or order for bond ${bondId}`);
    }
  }

  const actualGroups = parsed.substanceGroups || [];
  if (actualGroups.length !== semantics.groups.length) {
    throw structureError(structureId, 'RDKit changed the canonical S-group count');
  }
  for (let index = 0; index < semantics.groups.length; index += 1) {
    const expected = semantics.groups[index];
    const actual = actualGroups[index];
    const properties = actual?.properties || {};
    const expectedAtoms = expected.atomIds.map((atomId) => atomId - 1);
    const expectedBonds = expected.xbondIds.map((bondId) => bondId - 1);
    const expectedConnect = suppressedConnect ? null : expected.connect;
    if (properties.TYPE !== expected.type || !arrayEqual(actual.atoms || [], expectedAtoms) ||
        !arrayEqual(actual.bonds || [], expectedBonds) ||
        (properties.CONNECT || null) !== expectedConnect ||
        (properties.SUBTYPE || null) !== expected.subtype ||
        (properties.LABEL || null) !== expected.label) {
      throw structureError(structureId, `RDKit changed canonical S-group ${expected.groupId} semantics`);
    }
    const actualBrackets = actual.brackets || [];
    if (actualBrackets.length !== expected.bracketCoordinates.length) {
      throw structureError(structureId, `RDKit changed canonical S-group ${expected.groupId} bracket count`);
    }
    for (let bracketIndex = 0; bracketIndex < expected.bracketCoordinates.length; bracketIndex += 1) {
      const expectedFlat = expected.bracketCoordinates[bracketIndex];
      const actualFlat = (actualBrackets[bracketIndex] || []).flat();
      if (actualFlat.length !== 9 || actualFlat.some((value, valueIndex) => !approximatelyEqual(value, expectedFlat[valueIndex]))) {
        throw structureError(structureId, `RDKit changed canonical S-group ${expected.groupId} bracket coordinates`);
      }
    }
  }

  return {
    atomCount: semantics.atoms.size,
    bondCount: semantics.bonds.size,
    formalChargeCount: [...semantics.atoms.values()].filter(({ charge }) => charge !== 0).length,
    sgroupCount: semantics.groups.length,
    authoredCoordinatesRetained: true
  };
}

function serializerDiagnostics(molecule, semantics) {
  const serialized = molecule.get_v3Kmolblock();
  const lines = logicalV3000Lines(serialized);
  const begin = lines.indexOf('BEGIN BOND');
  const end = lines.indexOf('END BOND');
  const serializedBonds = new Map(lines.slice(begin + 1, end).map((line) => [Number(line.match(/^(\d+)\s/)?.[1]), line]));
  const cfg2Omissions = [...semantics.bonds.values()]
    .filter(({ order, cfg }) => order === 1 && cfg === 2)
    .filter(({ bondId }) => !/(?:^|\s)CFG=2(?:\s|$)/.test(serializedBonds.get(bondId) || ''))
    .map(({ bondId }) => bondId);
  return {
    serializerIsCanonicalAuthority: false,
    singleBondCfg2Omissions: cfg2Omissions,
    note: cfg2Omissions.length
      ? 'RDKit MinimalLib get_v3Kmolblock() drops canonical single-bond CFG=2 markers in this release; the immutable input is validated directly and each rendered wavy bond is asserted from SVG geometry.'
      : 'RDKit MinimalLib serialization is diagnostic only; the immutable canonical V3000 input remains authoritative.'
  };
}

function unfoldAtomRecords(molfile) {
  const physicalLines = molfile.split('\n');
  const unfolded = [];
  let inAtomBlock = false;
  for (let index = 0; index < physicalLines.length; index += 1) {
    let line = physicalLines[index];
    if (line === 'M  V30 BEGIN ATOM') inAtomBlock = true;
    if (inAtomBlock && line.startsWith('M  V30 ') && line.endsWith('-')) {
      while (line.endsWith('-')) {
        index += 1;
        line = `${line.slice(0, -1)}${physicalLines[index].slice(7)}`;
      }
    }
    unfolded.push(line);
    if (line === 'M  V30 END ATOM') inAtomBlock = false;
  }
  return unfolded;
}

function displayOnlyMolfile(molfile, semantics) {
  const suppressedConnectLabels = [];
  const suppressedNumberedRGroups = [];
  let inSgroupBlock = false;
  let inAtomBlock = false;
  const displayMolfileV3000 = unfoldAtomRecords(molfile).map((line) => {
    if (line === 'M  V30 BEGIN ATOM') inAtomBlock = true;
    if (line === 'M  V30 BEGIN SGROUP') inSgroupBlock = true;
    let displayLine = inSgroupBlock
      ? line.replace(/\s+CONNECT=(HT|HH|EU)(?=\s|$)/g, (match, value) => {
          suppressedConnectLabels.push(value);
          return '';
        })
      : line;
    if (inAtomBlock) {
      const atomId = Number(line.match(/^M  V30 (\d+) R#\s/)?.[1]);
      const groupNumber = Number.isInteger(atomId)
        ? semantics.numberedRAtomLabels.get(atomId - 1)
        : null;
      if (groupNumber !== null && groupNumber !== undefined) {
        displayLine = displayLine
          .replace(/^M  V30 (\d+) R#\s/, 'M  V30 $1 R ')
          .replace(new RegExp(`\\s+RGROUPS=\\(1\\s+${groupNumber}\\)(?=\\s|$)`), '');
        suppressedNumberedRGroups.push({ atomId, groupNumber });
      }
    }
    if (line === 'M  V30 END ATOM') inAtomBlock = false;
    if (line === 'M  V30 END SGROUP') inSgroupBlock = false;
    return displayLine;
  }).join('\n');
  return { displayMolfileV3000, suppressedConnectLabels, suppressedNumberedRGroups };
}

function renderWithRDKit(molecule, semantics, structureId) {
  const fixedScale = STRUCTURE_STYLE.bondLengthPx /
    (semantics.meanBondLength * STRUCTURE_STYLE.drawingCanvasPx);
  const atomLabels = Object.fromEntries([
    ...[...semantics.pseudoatomIndices].map((index) => [index, '']),
    ...[...semantics.genericRAtomIndices].map((index) => [index, 'R']),
    ...[...semantics.numberedRAtomLabels].map(([index, groupNumber]) => [index, `R<sup>${groupNumber}</sup>`])
  ]);
  const options = {
    width: STRUCTURE_STYLE.drawingCanvasPx,
    height: STRUCTURE_STYLE.drawingCanvasPx,
    fixedScale,
    bondLineWidth: STRUCTURE_STYLE.bondLineWidthPx,
    scaleBondWidth: false,
    clearBackground: false,
    backgroundColour: [1, 1, 1, 0],
    padding: 0,
    prepareMolsBeforeDrawing: false,
    dummiesAreAttachments: false,
    includeMetadata: false,
    centreMoleculesBeforeDrawing: true,
    explicitMethyl: false,
    addStereoAnnotation: false,
    // Only explicit canonical CFG=2 markers receive unknown-stereo geometry.
    // Plain bonds remain plain when a curator intentionally leaves an
    // otherwise possible stereocenter unspecified.
    unspecifiedStereoIsUnknown: false,
    useMolBlockWedging: true,
    maxFontSize: 32,
    minFontSize: 18,
    annotationFontScale: STRUCTURE_STYLE.annotationFontScale,
    additionalAtomLabelPadding: 0.08,
    atomLabels
  };
  try {
    return molecule.get_svg_with_highlights(JSON.stringify(options));
  } catch (error) {
    throw structureError(structureId, `RDKit could not render the V3000 molfile: ${error.message || error}`, error);
  }
}

function parseAttributes(source, context) {
  const attributes = new Map();
  let cursor = 0;
  while (cursor < source.length) {
    const whitespace = source.slice(cursor).match(/^\s+/);
    if (whitespace) cursor += whitespace[0].length;
    if (cursor >= source.length) break;
    const name = source.slice(cursor).match(/^([A-Za-z_:][A-Za-z0-9_.:-]*)\s*=\s*/);
    if (!name) throw new Error(`malformed SVG attribute list on <${context}>`);
    cursor += name[0].length;
    const quote = source[cursor];
    if (quote !== '"' && quote !== "'") throw new Error(`SVG attribute ${name[1]} on <${context}> must be quoted`);
    const end = source.indexOf(quote, cursor + 1);
    if (end < 0) throw new Error(`unterminated SVG attribute ${name[1]} on <${context}>`);
    const value = source.slice(cursor + 1, end);
    if (/[\u0000-\u0008\u000b\u000c\u000e-\u001f<>&]/.test(value)) {
      throw new Error(`SVG attribute ${name[1]} contains unsafe characters`);
    }
    if (attributes.has(name[1])) throw new Error(`duplicate SVG attribute ${name[1]} on <${context}>`);
    attributes.set(name[1], value);
    cursor = end + 1;
  }
  return attributes;
}

function numericValue(value, name, { minimum = -Infinity, maximum = Infinity, allowPx = false } = {}) {
  const suffix = allowPx && value.endsWith('px') ? 'px' : '';
  const numericToken = suffix ? value.slice(0, -2) : value;
  if (!NUMBER_PATTERN.test(numericToken)) throw new Error(`SVG ${name} must be numeric${allowPx ? ' with an optional px suffix' : ''}`);
  const numeric = Number(numericToken);
  if (!Number.isFinite(numeric) || numeric < minimum || numeric > maximum) {
    throw new Error(`SVG ${name} is outside the allowed range`);
  }
  return numeric;
}

function displayNumber(value) {
  if (Object.is(value, -0)) return '0';
  return Number.isInteger(value) ? String(value) : String(Number(value.toFixed(6)));
}

function normalizePresentationValue(name, value) {
  if (name === 'fill' || name === 'stroke') {
    if (!SVG_COLOR_PATTERN.test(value)) throw new Error(`SVG ${name} must be none or a six-digit hex color`);
    return value === 'none' ? value : value.toUpperCase();
  }
  if (name === 'fill-rule') {
    if (!['evenodd', 'nonzero'].includes(value)) throw new Error('SVG fill-rule is not allowed');
    return value;
  }
  if (name === 'stroke-linecap') {
    if (!['butt', 'round', 'square'].includes(value)) throw new Error('SVG stroke-linecap is not allowed');
    return value;
  }
  if (name === 'stroke-linejoin') {
    if (!['miter', 'round', 'bevel'].includes(value)) throw new Error('SVG stroke-linejoin is not allowed');
    return value;
  }
  if (name === 'stroke-width') return displayNumber(numericValue(value, name, { minimum: 0, maximum: 100, allowPx: true }));
  if (name === 'fill-opacity' || name === 'stroke-opacity') {
    return displayNumber(numericValue(value, name, { minimum: 0, maximum: 1 }));
  }
  if (name === 'stroke-miterlimit') return displayNumber(numericValue(value, name, { minimum: 1, maximum: 100 }));
  throw new Error(`SVG path presentation attribute ${name} is not allowed`);
}

function parsePathStyle(attributes) {
  const presentation = new Map();
  const style = attributes.get('style');
  if (style !== undefined) {
    for (const declaration of style.split(';')) {
      if (!declaration.trim()) continue;
      const match = declaration.match(/^\s*([a-z-]+)\s*:\s*([^:;]+?)\s*$/);
      if (!match || !PATH_STYLE_ATTRIBUTES.has(match[1])) throw new Error('SVG path contains an unsupported inline style');
      if (presentation.has(match[1])) throw new Error(`SVG path repeats style property ${match[1]}`);
      presentation.set(match[1], normalizePresentationValue(match[1], match[2]));
    }
  }
  for (const name of PATH_PRESENTATION_ATTRIBUTES) {
    if (!attributes.has(name)) continue;
    const value = normalizePresentationValue(name, attributes.get(name));
    if (presentation.has(name) && presentation.get(name) !== value) {
      throw new Error(`SVG path has conflicting ${name} values`);
    }
    presentation.set(name, value);
  }
  if ((presentation.get('fill') || 'none') === 'none' && (presentation.get('stroke') || 'none') === 'none') {
    throw new Error('SVG path has neither a visible fill nor stroke');
  }
  return presentation;
}

function includePoint(bounds, x, y) {
  if (!Number.isFinite(x) || !Number.isFinite(y) || Math.abs(x) > 1e7 || Math.abs(y) > 1e7) {
    throw new Error('SVG path contains a non-finite or excessive coordinate');
  }
  bounds.minX = Math.min(bounds.minX, x);
  bounds.minY = Math.min(bounds.minY, y);
  bounds.maxX = Math.max(bounds.maxX, x);
  bounds.maxY = Math.max(bounds.maxY, y);
}

function quadraticValue(p0, p1, p2, t) {
  const oneMinus = 1 - t;
  return oneMinus * oneMinus * p0 + 2 * oneMinus * t * p1 + t * t * p2;
}

function cubicValue(p0, p1, p2, p3, t) {
  const oneMinus = 1 - t;
  return oneMinus ** 3 * p0 + 3 * oneMinus ** 2 * t * p1 + 3 * oneMinus * t * t * p2 + t ** 3 * p3;
}

function quadraticExtrema(p0, p1, p2) {
  const denominator = p0 - 2 * p1 + p2;
  if (Math.abs(denominator) < 1e-12) return [];
  const t = (p0 - p1) / denominator;
  return t > 0 && t < 1 ? [t] : [];
}

function cubicExtrema(p0, p1, p2, p3) {
  const a = -p0 + 3 * p1 - 3 * p2 + p3;
  const b = 2 * (p0 - 2 * p1 + p2);
  const c = p1 - p0;
  if (Math.abs(a) < 1e-12) {
    if (Math.abs(b) < 1e-12) return [];
    const t = -c / b;
    return t > 0 && t < 1 ? [t] : [];
  }
  const discriminant = b * b - 4 * a * c;
  if (discriminant < 0) return [];
  const root = Math.sqrt(discriminant);
  return [(-b + root) / (2 * a), (-b - root) / (2 * a)].filter((t) => t > 0 && t < 1);
}

function parsePathData(value) {
  if (typeof value !== 'string' || !value.trim()) throw new Error('SVG path d must be non-empty');
  const tokenPattern = new RegExp(`[MLCQZ]|${NUMBER_PATTERN_SOURCE}`, 'g');
  const tokens = [];
  let cursor = 0;
  let match;
  while ((match = tokenPattern.exec(value))) {
    if (!/^[\s,]*$/.test(value.slice(cursor, match.index))) throw new Error('SVG path contains unsupported syntax');
    tokens.push(/[MLCQZ]/.test(match[0]) ? match[0] : Number(match[0]));
    cursor = tokenPattern.lastIndex;
    if (tokens.length > 1_000_000) throw new Error('SVG path exceeds the token limit');
  }
  if (!/^[\s,]*$/.test(value.slice(cursor))) throw new Error('SVG path contains unsupported syntax');
  if (!tokens.length || typeof tokens[0] !== 'string') throw new Error('SVG path must begin with a command');

  const bounds = { minX: Infinity, minY: Infinity, maxX: -Infinity, maxY: -Infinity };
  const commands = new Set();
  let command = null;
  let current = null;
  let subpathStart = null;
  let index = 0;
  let closed = false;
  while (index < tokens.length) {
    if (typeof tokens[index] === 'string') {
      command = tokens[index];
      commands.add(command);
      index += 1;
      if (!(command in SVG_COMMAND_ARGUMENTS)) throw new Error(`SVG path command ${command} is not allowed`);
      if (command === 'Z') {
        if (!current || !subpathStart) throw new Error('SVG path closes an unopened subpath');
        includePoint(bounds, ...subpathStart);
        current = subpathStart;
        closed = true;
        command = null;
        continue;
      }
    }
    if (!command) throw new Error('SVG path coordinate is missing a command');
    const count = SVG_COMMAND_ARGUMENTS[command];
    const values = tokens.slice(index, index + count);
    if (values.length !== count || values.some((token) => typeof token !== 'number')) {
      throw new Error(`SVG path command ${command} has malformed coordinates`);
    }
    index += count;
    if (command === 'M') {
      current = [values[0], values[1]];
      subpathStart = current;
      includePoint(bounds, ...current);
      command = 'L';
    } else if (command === 'L') {
      if (!current) throw new Error('SVG line precedes its initial move');
      includePoint(bounds, ...current);
      includePoint(bounds, values[0], values[1]);
      current = [values[0], values[1]];
    } else if (command === 'Q') {
      if (!current) throw new Error('SVG curve precedes its initial move');
      const [x0, y0] = current;
      const [x1, y1, x2, y2] = values;
      includePoint(bounds, x0, y0);
      includePoint(bounds, x2, y2);
      for (const t of quadraticExtrema(x0, x1, x2)) includePoint(bounds, quadraticValue(x0, x1, x2, t), quadraticValue(y0, y1, y2, t));
      for (const t of quadraticExtrema(y0, y1, y2)) includePoint(bounds, quadraticValue(x0, x1, x2, t), quadraticValue(y0, y1, y2, t));
      current = [x2, y2];
    } else if (command === 'C') {
      if (!current) throw new Error('SVG curve precedes its initial move');
      const [x0, y0] = current;
      const [x1, y1, x2, y2, x3, y3] = values;
      includePoint(bounds, x0, y0);
      includePoint(bounds, x3, y3);
      for (const t of cubicExtrema(x0, x1, x2, x3)) includePoint(bounds, cubicValue(x0, x1, x2, x3, t), cubicValue(y0, y1, y2, y3, t));
      for (const t of cubicExtrema(y0, y1, y2, y3)) includePoint(bounds, cubicValue(x0, x1, x2, x3, t), cubicValue(y0, y1, y2, y3, t));
      current = [x3, y3];
    }
  }
  if (!Number.isFinite(bounds.minX)) throw new Error('SVG path has no drawable coordinates');
  return {
    bounds,
    commands,
    closed,
    normalized: tokens.map((token) => typeof token === 'number' ? displayNumber(token) : token).join(' ')
  };
}

function parseAndNormalizeSvg(svg, { repeatGroups = null } = {}) {
  if (typeof svg !== 'string' || !svg.trim()) throw new Error('RDKit returned an empty SVG');
  if (Buffer.byteLength(svg, 'utf8') > MAX_SVG_BYTES) throw new Error(`SVG exceeds ${MAX_SVG_BYTES} bytes`);
  let document = svg.trim();
  document = document.replace(/^<\?xml\s+version=(['"])1\.0\1\s+encoding=(['"])(?:iso-8859-1|UTF-8)\2\s*\?>\s*/i, '');
  if (/<\?|<!DOCTYPE|<!ENTITY/i.test(document)) throw new Error('SVG contains a forbidden declaration');
  if ((document.match(/<!--/g) || []).length !== (document.match(/-->/g) || []).length) {
    throw new Error('SVG contains a malformed comment');
  }
  document = document.replace(/<!--[\s\S]*?-->/g, '');
  if (/<!|<script|<foreignObject|<image|<style|<text/i.test(document)) {
    throw new Error('SVG contains a forbidden declaration or element');
  }

  const tagPattern = /<\/?([A-Za-z][A-Za-z0-9:-]*)([^>]*)>/g;
  let cursor = 0;
  let rootOpen = false;
  let rootClosed = false;
  let elementCount = 0;
  const paths = [];
  let rootAttributes;
  let match;
  while ((match = tagPattern.exec(document))) {
    if (document.slice(cursor, match.index).trim()) throw new Error('SVG contains non-whitespace text nodes');
    cursor = tagPattern.lastIndex;
    elementCount += 1;
    if (elementCount > MAX_SVG_ELEMENTS) throw new Error(`SVG exceeds ${MAX_SVG_ELEMENTS} elements`);
    const [tag, name, rawTail] = match;
    const closing = tag.startsWith('</');
    const selfClosing = /\/\s*>$/.test(tag);
    if (closing) {
      if (name !== 'svg' || !rootOpen || rootClosed || rawTail.trim()) throw new Error(`unexpected SVG closing tag </${name}>`);
      rootClosed = true;
      continue;
    }
    if (!rootOpen) {
      if (name !== 'svg' || selfClosing) throw new Error('SVG root must be one non-empty <svg> element');
      rootOpen = true;
      rootAttributes = parseAttributes(rawTail, 'svg');
      for (const attribute of rootAttributes.keys()) {
        if (!RAW_ROOT_ATTRIBUTES.has(attribute)) throw new Error(`SVG root attribute ${attribute} is not allowed`);
      }
      if (rootAttributes.get('xmlns') !== 'http://www.w3.org/2000/svg') throw new Error('unexpected SVG namespace');
      if (rootAttributes.has('version') && rootAttributes.get('version') !== '1.1') throw new Error('unexpected SVG version');
      if (rootAttributes.has('baseProfile') && rootAttributes.get('baseProfile') !== 'full') throw new Error('unexpected SVG baseProfile');
      if (rootAttributes.has('xml:space') && rootAttributes.get('xml:space') !== 'preserve') throw new Error('unexpected SVG xml:space value');
      if (rootAttributes.has('xmlns:rdkit') && rootAttributes.get('xmlns:rdkit') !== 'http://www.rdkit.org/xml') {
        throw new Error('unexpected RDKit SVG namespace');
      }
      if (rootAttributes.has('xmlns:xlink') && rootAttributes.get('xmlns:xlink') !== 'http://www.w3.org/1999/xlink') {
        throw new Error('unexpected SVG XLink namespace');
      }
      for (const dimension of ['width', 'height']) {
        if (rootAttributes.has(dimension)) numericValue(rootAttributes.get(dimension), dimension, { minimum: Number.EPSILON, allowPx: true });
      }
      const viewBox = rootAttributes.get('viewBox')?.trim().split(/\s+/) || [];
      if (viewBox.length !== 4 || viewBox.some((value) => !NUMBER_PATTERN.test(value))) throw new Error('SVG root has an invalid viewBox');
      continue;
    }
    if (rootClosed || name !== 'path' || !selfClosing) throw new Error(`SVG element <${name}> is not allowed; output must be path-only`);
    const attributes = parseAttributes(rawTail.replace(/\/\s*$/, ''), 'path');
    for (const attribute of attributes.keys()) {
      if (!['class', 'd', 'style', ...PATH_PRESENTATION_ATTRIBUTES].includes(attribute)) {
        throw new Error(`SVG path attribute ${attribute} is not allowed`);
      }
    }
    const classValue = attributes.get('class');
    if (classValue !== undefined && !/^[A-Za-z0-9_-]+(?:\s+[A-Za-z0-9_-]+)*$/.test(classValue)) {
      throw new Error('SVG path class list is malformed');
    }
    const geometry = parsePathData(attributes.get('d'));
    paths.push({
      ...geometry,
      classes: new Set(classValue?.trim().split(/\s+/) || []),
      presentation: parsePathStyle(attributes)
    });
  }
  if (document.slice(cursor).trim()) throw new Error('SVG contains malformed markup');
  if (!rootOpen || !rootClosed || !paths.length) throw new Error('SVG must contain one balanced root and at least one path');

  const repeatLabelRendering = repeatGroups ? positionSgroupLabels(paths, repeatGroups) : [];
  const bounds = { minX: Infinity, minY: Infinity, maxX: -Infinity, maxY: -Infinity };
  let maximumStrokeWidth = 0;
  for (const pathRecord of paths) {
    bounds.minX = Math.min(bounds.minX, pathRecord.bounds.minX);
    bounds.minY = Math.min(bounds.minY, pathRecord.bounds.minY);
    bounds.maxX = Math.max(bounds.maxX, pathRecord.bounds.maxX);
    bounds.maxY = Math.max(bounds.maxY, pathRecord.bounds.maxY);
    maximumStrokeWidth = Math.max(maximumStrokeWidth, Number(pathRecord.presentation.get('stroke-width') || 0));
  }
  const strokePadding = maximumStrokeWidth / 2;
  const minX = Math.floor(bounds.minX - strokePadding - STRUCTURE_STYLE.marginPx);
  const minY = Math.floor(bounds.minY - strokePadding - STRUCTURE_STYLE.marginPx);
  const maxX = Math.ceil(bounds.maxX + strokePadding + STRUCTURE_STYLE.marginPx);
  const maxY = Math.ceil(bounds.maxY + strokePadding + STRUCTURE_STYLE.marginPx);
  const viewWidth = maxX - minX;
  const viewHeight = maxY - minY;
  if (!(viewWidth > 0 && viewHeight > 0)) throw new Error('SVG tight bounds are empty');
  const intrinsicScale = Math.min(
    1,
    STRUCTURE_STYLE.maximumWidthPx / viewWidth,
    STRUCTURE_STYLE.maximumHeightPx / viewHeight
  );
  const width = Math.min(STRUCTURE_STYLE.maximumWidthPx, Math.max(1, Math.round(viewWidth * intrinsicScale)));
  const height = Math.min(STRUCTURE_STYLE.maximumHeightPx, Math.max(1, Math.round(viewHeight * intrinsicScale)));
  const pathMarkup = paths.map((record) => {
    const attributes = [`d="${record.normalized}"`];
    for (const name of PATH_ATTRIBUTE_ORDER) {
      if (record.presentation.has(name)) attributes.push(`${name}="${record.presentation.get(name)}"`);
    }
    return `  <path ${attributes.join(' ')}/>`;
  }).join('\n');
  const normalized = `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="${minX} ${minY} ${viewWidth} ${viewHeight}">\n${pathMarkup}\n</svg>\n`;
  if (/\b(?:class|style)=|<\?|<!--|<\/?(?:script|style|text|image|foreignObject)\b|(?:url\s*\(|javascript:|data:)/i.test(normalized)) {
    throw new Error('normalized SVG failed the path-only safety invariant');
  }
  return { svg: normalized, width, height, paths, repeatLabelRendering, viewBox: { minX, minY, width: viewWidth, height: viewHeight } };
}

// RDKit emits the S-group glyph run followed by bracket pairs in group order.
// Move each label independently; never move chemistry, brackets, or atom labels.
// Unexpected glyph counts or upstream path shapes fail closed.
function positionSgroupLabels(paths, groups) {
  const checks = [];
  const start = paths.findIndex(p => p.classes.has('connect'));
  if (start < 0) return checks;
  let cursor = start;
  const glyphs = [];
  while (paths[cursor]?.classes.has('connect')) glyphs.push(paths[cursor++]);
  const labels = groups.map(g => ({ groupId: g.groupId, label: (g.label || 'n').replace(/^"|"$/g, '') }));
  if (labels.some(g => !/^[A-Za-z0-9]+$/.test(g.label)) ||
    labels.reduce((sum, g) => sum + g.label.length, 0) !== glyphs.length) {
    throw new Error('S-group glyph count does not match the canonical repeat labels');
  }
  let glyphIndex = 0;
  for (const group of labels) {
    const labelGlyphs = glyphs.slice(glyphIndex, glyphIndex += group.label.length);
    const brackets = paths.slice(cursor, cursor += 2);
    if (brackets.length !== 2 || brackets.some(p => p.classes.size ||
      !/^M [^MLCQZ]+ L [^MLCQZ]+ L [^MLCQZ]+ L [^MLCQZ]+$/.test(p.normalized) ||
      p.presentation.get('fill') !== 'none')) {
      throw new Error('S-group label is not followed by the expected RDKit bracket pair');
    }
    const exit = brackets.reduce((right, p) => p.bounds.maxX > right.bounds.maxX ? p : right);
    const minX = Math.min(...labelGlyphs.map(p => p.bounds.minX));
    const minY = Math.min(...labelGlyphs.map(p => p.bounds.minY));
    const dx = exit.bounds.maxX + STRUCTURE_STYLE.repeatLabelGapPx - minX;
    const dy = exit.bounds.maxY + STRUCTURE_STYLE.repeatLabelGapPx - minY;
    for (const glyph of labelGlyphs) {
      let coordinate = 0;
      const shifted = glyph.normalized.replace(new RegExp(NUMBER_PATTERN_SOURCE, 'g'), n =>
        displayNumber(Number(n) + (coordinate++ % 2 === 0 ? dx : dy)));
      Object.assign(glyph, parsePathData(shifted));
    }
    checks.push({ groupId: group.groupId, label: group.label, glyphCount: labelGlyphs.length,
      gapPx: STRUCTURE_STYLE.repeatLabelGapPx,
      labelBounds: { minX: Math.min(...labelGlyphs.map(p => p.bounds.minX)), minY: Math.min(...labelGlyphs.map(p => p.bounds.minY)),
        maxX: Math.max(...labelGlyphs.map(p => p.bounds.maxX)), maxY: Math.max(...labelGlyphs.map(p => p.bounds.maxY)) },
      bracketBounds: exit.bounds, verified: true });
  }
  if (paths.slice(cursor).some(p => p.classes.has('connect'))) {
    throw new Error('Unexpected additional S-group glyph run');
  }
  return checks;
}

function normalizeSvg(svg, structureId, options) {
  try {
    return parseAndNormalizeSvg(svg, options);
  } catch (error) {
    throw structureError(structureId, `rendered SVG failed normalization/safety validation: ${error.message}`, error);
  }
}

export function normalizeRenderedSvg(svg, { structureId = null } = {}) {
  const { paths, viewBox, repeatLabelRendering, ...normalized } = normalizeSvg(svg, structureId);
  return normalized;
}

function verifyStereoGeometry(semantics, paths, structureId) {
  const checks = [];
  for (const bond of semantics.bonds.values()) {
    if (bond.cfg === null) continue;
    const renderedPaths = paths.filter(({ classes }) => classes.has(`bond-${bond.bondId - 1}`));
    if (!renderedPaths.length) throw structureError(structureId, `RDKit omitted stereobond ${bond.bondId} from the SVG`);
    if (bond.order === 1 && bond.cfg === 2) {
      if (!renderedPaths.some(({ commands }) => commands.has('C'))) {
        throw structureError(structureId, `canonical single-bond CFG=2 on bond ${bond.bondId} was not rendered as a cubic wavy bond`);
      }
      checks.push({ bondId: bond.bondId, cfg: 2, geometry: 'cubic-wavy', verified: true });
    } else if (bond.order === 1 && bond.cfg === 1) {
      if (!renderedPaths.some(({ closed, presentation }) => closed && (presentation.get('fill') || 'none') !== 'none')) {
        throw structureError(structureId, `canonical CFG=1 on bond ${bond.bondId} was not rendered as a solid wedge`);
      }
      checks.push({ bondId: bond.bondId, cfg: 1, geometry: 'solid-wedge', verified: true });
    } else if (bond.order === 1 && bond.cfg === 3) {
      if (renderedPaths.length < 2 || renderedPaths.some(({ presentation }) => (presentation.get('stroke') || 'none') === 'none')) {
        throw structureError(structureId, `canonical CFG=3 on bond ${bond.bondId} was not rendered as a hashed wedge`);
      }
      checks.push({ bondId: bond.bondId, cfg: 3, geometry: 'hashed-wedge', verified: true });
    } else if (bond.order === 2 && bond.cfg === 2) {
      if (renderedPaths.length < 2) throw structureError(structureId, `canonical double-bond CFG=2 on bond ${bond.bondId} was not rendered as crossed geometry`);
      checks.push({ bondId: bond.bondId, cfg: 2, geometry: 'crossed-double-bond', verified: true });
    }
  }
  return checks;
}

function verifyNumberedRLabelGeometry(semantics, paths, structureId) {
  const checks = [];
  for (const [atomIndex, groupNumber] of semantics.numberedRAtomLabels) {
    const renderedPaths = paths.filter(({ classes }) =>
      classes.size === 1 && classes.has(`atom-${atomIndex}`));
    const expectedGlyphPathCount = 1 + String(groupNumber).length;
    if (renderedPaths.length !== expectedGlyphPathCount) {
      throw structureError(
        structureId,
        `numbered Markush atom ${atomIndex + 1} did not render as one R plus the superscript ${groupNumber}`
      );
    }
    checks.push({
      atomId: atomIndex + 1,
      groupNumber,
      glyphPathCount: renderedPaths.length,
      geometry: 'r-with-superscript',
      verified: true
    });
  }
  return checks;
}

async function renderValidatedStructure(validated) {
  const {
    structureId,
    molfile,
    atomCount,
    pseudoatomIndices,
    genericRAtomIndices,
    numberedRAtomLabels
  } = validated;
  const rdkit = await getRDKit();
  let canonicalMolecule;
  let displayMolecule;
  try {
    canonicalMolecule = parseWithRDKit(rdkit, molfile, structureId, 'canonical');
    const canonicalSemantics = verifyRDKitSemantics(canonicalMolecule, validated, structureId);
    const serializer = serializerDiagnostics(canonicalMolecule, validated);
    const display = displayOnlyMolfile(molfile, validated);
    displayMolecule = parseWithRDKit(rdkit, display.displayMolfileV3000, structureId, 'display-only');
    verifyRDKitSemantics(displayMolecule, validated, structureId, {
      suppressedConnect: true,
      suppressedNumberedRGroups: true
    });
    const rendered = normalizeSvg(renderWithRDKit(displayMolecule, validated, structureId), structureId, { repeatGroups: validated.groups.filter(g => g.type === 'SRU') });
    const stereoRendering = verifyStereoGeometry(validated, rendered.paths, structureId);
    const numberedRLabelRendering = verifyNumberedRLabelGeometry(validated, rendered.paths, structureId);
    for (const atomIndex of pseudoatomIndices) {
      if (rendered.paths.some(({ classes }) => classes.size === 1 && classes.has(`atom-${atomIndex}`))) {
        throw structureError(structureId, `terminal attachment pseudoatom ${atomIndex + 1} remained visibly labeled`);
      }
    }
    const diagnostics = {
      parser: 'RDKit strict sanitized V3000 parse',
      runtimeVersion: RDKit_RUNTIME_VERSION,
      canonicalSemantics,
      displayOnly: {
        suppressedConnectLabels: display.suppressedConnectLabels,
        suppressedNumberedRGroups: display.suppressedNumberedRGroups,
        hiddenTerminalPseudoatomIndices: [...pseudoatomIndices].map((index) => index + 1),
        visibleGenericRAtomIndices: [...genericRAtomIndices].map((index) => index + 1),
        visibleNumberedRAtoms: [...numberedRAtomLabels].map(([index, groupNumber]) => ({
          atomId: index + 1,
          groupNumber
        })),
        canonicalMolfileUnchanged: true
      },
      serializer,
      repeatLabelRendering: rendered.repeatLabelRendering,
      stereoRendering,
      numberedRLabelRendering
    };
    const { paths, viewBox, repeatLabelRendering, ...publicRendered } = rendered;
    const conventions = {
      genericRAtomCount: genericRAtomIndices.size,
      numberedRAtomCount: numberedRAtomLabels.size,
      unknownSingleBondCount: [...validated.bonds.values()]
        .filter(({ order, cfg }) => order === 1 && cfg === 2).length,
      unknownDoubleBondCount: [...validated.bonds.values()]
        .filter(({ order, cfg }) => order === 2 && cfg === 2).length
    };
    return { structureId, molfile, atomCount, diagnostics, conventions, ...publicRendered };
  } finally {
    displayMolecule?.delete();
    canonicalMolecule?.delete();
  }
}

function preflightRegistry(chemicalStructures) {
  if (!Array.isArray(chemicalStructures)) throw structureError(null, 'chemicalStructures must be an array');
  const seen = new Set();
  return chemicalStructures.map((definition) => {
    const validated = validateDefinition(definition);
    if (seen.has(validated.structureId)) throw structureError(validated.structureId, 'duplicate registry identifier');
    seen.add(validated.structureId);
    return validated;
  });
}

export async function renderChemicalStructure(definition) {
  return renderValidatedStructure(validateDefinition(definition));
}

export async function validateChemicalStructures(chemicalStructures) {
  const validatedDefinitions = preflightRegistry(chemicalStructures);
  const results = [];
  for (const definition of validatedDefinitions) {
    const rendered = await renderValidatedStructure(definition);
    results.push({
      structureId: rendered.structureId,
      atomCount: rendered.atomCount,
      width: rendered.width,
      height: rendered.height,
      conventions: rendered.conventions,
      diagnostics: rendered.diagnostics
    });
  }
  return results;
}

export async function renderChemicalStructures(chemicalStructures, outputDirectory) {
  if (typeof outputDirectory !== 'string' || !outputDirectory) throw new TypeError('outputDirectory must be a non-empty path string');
  const validatedDefinitions = preflightRegistry(chemicalStructures);
  const destination = path.resolve(outputDirectory);
  // Parse, semantically verify, render, and normalize every definition before
  // touching the destination. A chemistry or SVG failure cannot leave a
  // partially replaced asset set.
  const renderedDefinitions = [];
  for (const definition of validatedDefinitions) {
    const rendered = await renderValidatedStructure(definition);
    renderedDefinitions.push(rendered);
  }

  await fs.mkdir(destination, { recursive: true });
  const structures = [];
  for (const rendered of renderedDefinitions) {
    const { structureId } = rendered;
    await fs.writeFile(path.join(destination, `${structureId}.svg`), rendered.svg, 'utf8');
    await fs.writeFile(path.join(destination, `${structureId}.mol`), rendered.molfile, 'utf8');
    structures.push({
      structureId,
      svgPath: path.join(destination, `${structureId}.svg`),
      molPath: path.join(destination, `${structureId}.mol`),
      width: rendered.width,
      height: rendered.height,
      atomCount: rendered.atomCount,
      conventions: rendered.conventions,
      diagnostics: rendered.diagnostics
    });
  }
  return {
    rendererVersion: STRUCTURE_RENDERER_VERSION,
    styleId: STRUCTURE_STYLE_ID,
    structureDefinitionCount: structures.length,
    renderedStructureCount: structures.length,
    structureCount: structures.length,
    outputDirectory: destination,
    structures
  };
}
