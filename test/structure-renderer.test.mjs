import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import test from 'node:test';
import initializeRDKit from '@rdkit/rdkit';
import {
  STRUCTURE_RENDERER_VERSION,
  STRUCTURE_STYLE,
  STRUCTURE_STYLE_ID,
  normalizeRenderedSvg,
  renderChemicalStructure,
  renderChemicalStructures,
  validateChemicalStructures,
  validateV3000Molfile
} from '../lib/structure-renderer.mjs';
import structureSpecsA from '../scripts/structure-specs-a.mjs';
import structureSpecsB from '../scripts/structure-specs-b.mjs';
import structureSpecOverrides from '../scripts/structure-spec-overrides.mjs';

const GLYCAN_SRU_IDS = [
  'cellulose-anhydroglucose-unit',
  'alpha-1-4-glucan-unit',
  'chitin-n-acetylglucosamine-unit',
  'kappa-carrageenan-sru',
  'iota-carrageenan-sru',
  'lambda-carrageenan-sru',
  'agarose-sru'
];

// These are intentional alkene-geometry annotations. They are not unknown
// tetrahedral stereochemistry and must remain rendered as crossed double
// bonds after the corpus-wide default changes to plain single bonds.
const INTENTIONAL_CROSSED_DOUBLE_IDS = [
  'abs-butadiene-rich-local-segment',
  'bromobutyl-endo-local-segment',
  'butyl-rubber-isoprene-site-local-segment',
  'chlorobutyl-endo-local-segment',
  'ethylene-maleate-polyester-motif',
  'polybutadiene-1-4-sru',
  'polyisoprene-1-4-unspecified-unit',
  'sbs-connected-aba-block-architecture',
  'sis-ideal-14-midblock-architecture'
].sort();

const allStructureSpecs = {
  ...structureSpecsA,
  ...structureSpecsB,
  ...structureSpecOverrides
};

async function readPublicationSnapshot() {
  return JSON.parse(await fs.readFile(
    path.resolve('public-data/wop-publication-snapshot-v2/snapshot.json'),
    'utf8'
  ));
}

function definitionsById(snapshot) {
  return new Map(snapshot.chemicalStructures.map((definition) => [definition.structureId, definition]));
}

function cfg2Bonds(definition) {
  const semantics = validateV3000Molfile(definition.molfileV3000, {
    structureId: definition.structureId
  });
  return [...semantics.bonds.values()].filter(({ cfg }) => cfg === 2);
}

function depictionUses(snapshot, structureId) {
  return snapshot.polymers.flatMap((polymer) => [
    polymer.structuralDepictions,
    ...Object.values(polymer.contextualStructures || {})
  ].flatMap((group) => (group.items || [])
    .filter((item) => item.structureId === structureId)
    .map((item) => ({ polymer, group, item }))));
}

function internalSruAttachmentSymbols(definition) {
  const semantics = validateV3000Molfile(definition.molfileV3000, {
    structureId: definition.structureId
  });
  const sruGroups = semantics.groups.filter(({ type }) => type === 'SRU');
  assert.equal(sruGroups.length, 1, `${definition.structureId} must contain one SRU S-group`);
  const [group] = sruGroups;
  assert.equal(group.connect, 'HT', `${definition.structureId} must use head-to-tail SRU connectivity`);
  assert.equal(group.xbondIds.length, 2, `${definition.structureId} must have two SRU crossing bonds`);
  const groupAtoms = new Set(group.atomIds);

  return group.xbondIds.map((bondId) => {
    const bond = semantics.bonds.get(bondId);
    assert.ok(bond, `${definition.structureId} names missing crossing bond ${bondId}`);
    assert.equal(bond.order, 1, `${definition.structureId} crossing bond ${bondId} must be single`);
    const leftIsInternal = groupAtoms.has(bond.left);
    const rightIsInternal = groupAtoms.has(bond.right);
    assert.notEqual(
      leftIsInternal,
      rightIsInternal,
      `${definition.structureId} crossing bond ${bondId} must cross the SRU boundary`
    );
    const internalAtomId = leftIsInternal ? bond.left : bond.right;
    return semantics.atoms.get(internalAtomId)?.symbol;
  });
}

function explicitlyFiniteMotifIds() {
  return [...new Set(Object.values(allStructureSpecs).flatMap((spec) =>
    spec.items
      .filter(({ polymerSgroup }) => polymerSgroup === false)
      .map(({ key }) => key)
  ))].sort();
}

const HETEROATOM_MOLFILE = `WOP renderer smoke test
  Codex 083126

  0  0  0  0  0  0  0  0  0  0999 V3000
M  V30 BEGIN CTAB
M  V30 COUNTS 2 1 0 0 0
M  V30 BEGIN ATOM
M  V30 1 C -0.7500 0.0000 0.0000 0
M  V30 2 O 0.7500 0.0000 0.0000 0
M  V30 END ATOM
M  V30 BEGIN BOND
M  V30 1 1 1 2
M  V30 END BOND
M  V30 END CTAB
M  END
`;

const GENERIC_R_MOLFILE = `Generic Markush R smoke test
  WOP 2D

  0  0  0  0  0  0  0  0  0  0999 V3000
M  V30 BEGIN CTAB
M  V30 COUNTS 2 1 0 0 0
M  V30 BEGIN ATOM
M  V30 1 C -0.7500 0.0000 0.0000 0
M  V30 2 R 0.7500 0.0000 0.0000 0
M  V30 END ATOM
M  V30 BEGIN BOND
M  V30 1 1 1 2
M  V30 END BOND
M  V30 END CTAB
M  END
`;

const NUMBERED_R_MOLFILE = `Numbered Markush R smoke test
  WOP 2D

  0  0  0  0  0  0  0  0  0  0999 V3000
M  V30 BEGIN CTAB
M  V30 COUNTS 3 2 0 0 0
M  V30 BEGIN ATOM
M  V30 1 C 0.0000 0.0000 0.0000 0
M  V30 2 R# -1.2990 -0.7500 0.0000 0 RGROUPS=(1 1)
M  V30 3 R# 1.2990 -0.7500 0.0000 0 RGROUPS=(1 2)
M  V30 END ATOM
M  V30 BEGIN BOND
M  V30 1 1 1 2
M  V30 2 1 1 3
M  V30 END BOND
M  V30 END CTAB
M  END
`;

const INVALID_GENERIC_R_VALENCE_MOLFILE = `Invalid generic Markush R valence
  WOP 2D

  0  0  0  0  0  0  0  0  0  0999 V3000
M  V30 BEGIN CTAB
M  V30 COUNTS 3 2 0 0 0
M  V30 BEGIN ATOM
M  V30 1 C -1.5000 0.0000 0.0000 0
M  V30 2 R 0.0000 0.0000 0.0000 0
M  V30 3 C 1.5000 0.0000 0.0000 0
M  V30 END ATOM
M  V30 BEGIN BOND
M  V30 1 1 1 2
M  V30 2 1 2 3
M  V30 END BOND
M  V30 END CTAB
M  END
`;

const SRU_MOLFILE = `Polyethylene repeat unit
  WOP 2D

  0  0  0  0  0  0  0  0  0  0  0 V3000
M  V30 BEGIN CTAB
M  V30 COUNTS 4 3 1 0 0
M  V30 BEGIN ATOM
M  V30 1 * -1.5000 0.0000 0.0000 0
M  V30 2 C 0.0000 0.0000 0.0000 0
M  V30 3 C 1.5000 0.0000 0.0000 0
M  V30 4 * 3.0000 0.0000 0.0000 0
M  V30 END ATOM
M  V30 BEGIN BOND
M  V30 1 1 1 2
M  V30 2 1 2 3
M  V30 3 1 3 4
M  V30 END BOND
M  V30 BEGIN SGROUP
M  V30 1 SRU 0 ATOMS=(2 2 3) XBONDS=(2 1 3) CONNECT=HT
M  V30 END SGROUP
M  V30 END CTAB
M  END
`;

const COP_MOLFILE = `Copolymer unit set
  WOP 2D

  0  0  0  0  0  0  0  0  0  0999 V3000
M  V30 BEGIN CTAB
M  V30 COUNTS 8 6 3 0 0
M  V30 BEGIN ATOM
M  V30 1 * -3.0000 0.0000 0.0000 0
M  V30 2 C -1.5000 0.0000 0.0000 0
M  V30 3 C 0.0000 0.0000 0.0000 0
M  V30 4 * 1.5000 0.0000 0.0000 0
M  V30 5 * -3.0000 -2.0000 0.0000 0
M  V30 6 C -1.5000 -2.0000 0.0000 0
M  V30 7 C 0.0000 -2.0000 0.0000 0
M  V30 8 * 1.5000 -2.0000 0.0000 0
M  V30 END ATOM
M  V30 BEGIN BOND
M  V30 1 1 1 2
M  V30 2 1 2 3
M  V30 3 1 3 4
M  V30 4 1 5 6
M  V30 5 1 6 7
M  V30 6 1 7 8
M  V30 END BOND
M  V30 BEGIN SGROUP
M  V30 1 SRU 0 ATOMS=(2 2 3) XBONDS=(2 1 3) CONNECT=HT LABEL=m
M  V30 2 SRU 0 ATOMS=(2 6 7) XBONDS=(2 4 6) CONNECT=HT LABEL=n
M  V30 3 COP 0 ATOMS=(4 2 3 6 7) CONNECT=EU
M  V30 END SGROUP
M  V30 END CTAB
M  END
`;

const INVALID_VALENCE_MOLFILE = `Invalid pentavalent carbon
  WOP 2D

  0  0  0  0  0  0  0  0  0  0999 V3000
M  V30 BEGIN CTAB
M  V30 COUNTS 6 5 0 0 0
M  V30 BEGIN ATOM
M  V30 1 C 0.0000 0.0000 0.0000 0
M  V30 2 C 1.5000 0.0000 0.0000 0
M  V30 3 C -1.5000 0.0000 0.0000 0
M  V30 4 C 0.0000 1.5000 0.0000 0
M  V30 5 C 0.0000 -1.5000 0.0000 0
M  V30 6 C 1.0607 1.0607 0.0000 0
M  V30 END ATOM
M  V30 BEGIN BOND
M  V30 1 1 1 2
M  V30 2 1 1 3
M  V30 3 1 1 4
M  V30 4 1 1 5
M  V30 5 1 1 6
M  V30 END BOND
M  V30 END CTAB
M  END
`;

const UNKNOWN_STEREO_SRU_MOLFILE = `Unknown tacticity repeat unit
  WOP 2D

  0  0  0  0  0  0  0  0  0  0999 V3000
M  V30 BEGIN CTAB
M  V30 COUNTS 6 5 1 0 0
M  V30 BEGIN ATOM
M  V30 1 * -1.984313 0.000000 0.000000 0
M  V30 2 C -0.566947 0.490990 0.000000 0
M  V30 3 C 0.566947 -0.490990 0.000000 0
M  V30 4 C 0.283473 -1.963961 0.000000 0
M  V30 5 C 1.417367 -2.945942 0.000000 0
M  V30 6 * 1.984313 0.000000 0.000000 0
M  V30 END ATOM
M  V30 BEGIN BOND
M  V30 1 1 1 2
M  V30 2 1 2 3 CFG=2
M  V30 3 1 3 4
M  V30 4 2 4 5
M  V30 5 1 3 6
M  V30 END BOND
M  V30 BEGIN SGROUP
M  V30 1 SRU 0 ATOMS=(4 2 3 4 5) XBONDS=(2 1 5) CONNECT=HT LABEL=n
M  V30 END SGROUP
M  V30 END CTAB
M  END
`;

test('V3000 validator requires explicit curated coordinates and expanded superatoms', () => {
  const validated = validateV3000Molfile(HETEROATOM_MOLFILE, { structureId: 'heteroatom-smoke' });
  assert.equal(validated.atomCount, 2);
  assert.ok(validated.molfile.endsWith('\n'));
  assert.throws(
    () => validateV3000Molfile(HETEROATOM_MOLFILE.replaceAll('V3000', 'V2000'), { structureId: 'wrong-format' }),
    /must be an MDL V3000 molfile/
  );
  assert.throws(
    () => validateV3000Molfile(HETEROATOM_MOLFILE.replace('2 O 0.7500 0.0000', '2 O -0.7500 0.0000'), { structureId: 'overlap' }),
    /all authored atom coordinates overlap/
  );
  assert.throws(
    () => validateV3000Molfile(SRU_MOLFILE.replace('1 SRU 0', '1 SUP 0'), { structureId: 'contracted-superatom' }),
    /ESTATE=E/
  );
  for (const [molfile, pattern] of [
    [SRU_MOLFILE.replace('CONNECT=HT', 'CONNECT=XX'), /requires CONNECT/],
    [SRU_MOLFILE.replace('XBONDS=(2 1 3)', 'XBONDS=(2 1 2)'), /XBONDS must name every bracket-crossing bond/],
    [SRU_MOLFILE.replace('XBONDS=(2 1 3)', 'XBONDS=(2 1 1)'), /count or identifiers are malformed/],
    [SRU_MOLFILE.replace(' XBONDS=(2 1 3)', ''), /missing XBONDS/],
    [COP_MOLFILE.replace('CONNECT=EU', 'CONNECT=EU SUBTYPE=CHA'), /invalid subtype/],
    [INVALID_VALENCE_MOLFILE.replace('M  V30 1 C ', 'M  V30 1 * '), /attachment pseudoatom 1 must have exactly one single bond/],
    [INVALID_GENERIC_R_VALENCE_MOLFILE, /generic Markush R atom 2 must have exactly one single bond/],
    [GENERIC_R_MOLFILE.replace('2 R ', '2 R# '), /requires exactly one RGROUPS/],
    [NUMBERED_R_MOLFILE.replace('RGROUPS=(1 1)', 'RGROUPS=(2 1 2)'), /requires exactly one RGROUPS/],
    [NUMBERED_R_MOLFILE.replace('RGROUPS=(1 1)', 'RGROUPS=(1 33)'), /requires exactly one RGROUPS/],
    [NUMBERED_R_MOLFILE.replace('RGROUPS=(1 1)', 'RGROUPS=(1 01)'), /requires exactly one RGROUPS/],
    [NUMBERED_R_MOLFILE.replace('RGROUPS=(1 1)', 'RGROUPS=(1 1) RGROUPS=(1 2)'), /requires exactly one RGROUPS/],
    [NUMBERED_R_MOLFILE.replace('0 RGROUPS=(1 1)', '0 MAP=4 RGROUPS=(1 1)'), /cannot carry charge, isotope, radical, or atom-map metadata/],
    [NUMBERED_R_MOLFILE.replace('2 R# ', '2 "R#" '), /must use an unquoted V3000 atom symbol/],
    [GENERIC_R_MOLFILE.replace(
      'M  V30 2 R 0.7500 0.0000 0.0000 0',
      'M  V30 2 R 0.7500 0.0000 0.0000 0 RGROUPS=(1 1)'
    ), /generic Markush R atom 2 cannot carry/],
    [GENERIC_R_MOLFILE.replace(
      'M  V30 2 R 0.7500 0.0000 0.0000 0',
      'M  V30 2 R 0.7500 0.0000 0.0000 0 MAP=1'
    ), /generic Markush R atom 2 cannot carry/],
    [GENERIC_R_MOLFILE.replace(
      'M  V30 1 C -0.7500 0.0000 0.0000 0',
      'M  V30 1 C -0.7500 0.0000 0.0000 0 RGROUPS=(1 1)'
    ), /non-R# atom 1 cannot carry/]
  ]) {
    assert.throws(() => validateV3000Molfile(molfile, { structureId: 'invalid-sgroup' }), pattern);
  }
});

test('absolute stereo labels are suppressed only in the verified display copy', async () => {
  const fixture = await fs.readFile('test/fixtures/structures/enhanced-stereo-mixed.mol', 'utf8');
  const absolute = 'M  V30 MDLV30/STEABS ATOMS=(5 17 18 19 20 21)';
  const and = 'M  V30 MDLV30/STERAC1 ATOMS=(5 22 23 24 26 27)';
  const or = 'M  V30 MDLV30/STEREL1 ATOMS=(5 28 29 30 31 32)';
  assert.ok(fixture.includes(absolute) && fixture.includes(and) && fixture.includes(or));

  const before = await renderChemicalStructure({ structureId: 'stereo-mixed', molfileV3000: fixture });
  const withoutAbs = fixture.replace(`${absolute}\n`, '');
  const expected = await renderChemicalStructure({ structureId: 'stereo-without-abs', molfileV3000: withoutAbs });
  const withoutGroups = withoutAbs.replace(`${and}\n`, '').replace(`${or}\n`, '');
  const noGroups = await renderChemicalStructure({ structureId: 'stereo-without-groups', molfileV3000: withoutGroups });
  assert.equal(before.svg, expected.svg, 'rendering removes only redundant absolute labels');
  assert.notEqual(before.svg, noGroups.svg, 'AND/OR labels remain visible');
  assert.equal(before.molfile, fixture, 'canonical download retains every collection');
  assert.deepEqual(before.diagnostics.displayOnly.suppressedAbsoluteStereoAtoms, [17,18,19,20,21]);
  assert.equal(before.diagnostics.stereoRendering.length, 15);
  assert.deepEqual(before.diagnostics.stereoRendering, expected.diagnostics.stereoRendering);
  const output = await fs.mkdtemp(path.join(os.tmpdir(), 'wop-stereo-download-'));
  try {
    await renderChemicalStructures([{ structureId: 'stereo-download', molfileV3000: fixture }], output);
    assert.equal(await fs.readFile(path.join(output, 'stereo-download.mol'), 'utf8'), fixture);
  } finally {
    await fs.rm(output, { recursive: true, force: true });
  }

  const allAbsolute = fixture.replace(`${absolute}\n${and}\n${or}`,
    'M  V30 MDLV30/STEABS ATOMS=(15 17 18 19 20 21 22 23 24 26 27 28 29 30 31 32)');
  const all = await renderChemicalStructure({ structureId: 'stereo-all-absolute', molfileV3000: allAbsolute });
  assert.equal(all.molfile, allAbsolute);
  assert.equal(all.diagnostics.displayOnly.suppressedAbsoluteStereoAtoms.length, 15);
  assert.equal(all.svg, noGroups.svg);

  const wrapped = fixture.replace(absolute, 'M  V30 MDLV30/STEABS ATOMS=(5 17 18 -\nM  V30 19 20 21)');
  const continuation = await renderChemicalStructure({ structureId: 'stereo-wrapped', molfileV3000: wrapped });
  assert.equal(continuation.svg, before.svg);
  assert.equal(continuation.molfile, wrapped);
  const invalid = fixture.replace(absolute, 'M  V30 MDLV30/STEABS ATOMS=(1 1)');
  await assert.rejects(renderChemicalStructure({ structureId: 'stereo-unassigned', molfileV3000: invalid }), /absolute-stereo collection does not match assigned canonical stereocenters/);
});

test('wrapped S-group CONNECT is suppressed only in the display copy', async () => {
  const output = await fs.mkdtemp(path.join(os.tmpdir(), 'wop-wrapped-connect-'));
  try {
    for (const connect of ['HT', 'HH', 'EU']) {
      const plain = SRU_MOLFILE.replace('CONNECT=HT', `CONNECT=${connect}`);
      const splitValue = plain.replace(`CONNECT=${connect}`, `CONNECT=${connect[0]}-\nM  V30 ${connect[1]}`);
      const splitToken = plain.replace('CONNECT=', 'CONNEC-\nM  V30 T=');
      const splitElsewhere = plain.replace('XBONDS=(2 1 3)', 'XBONDS=(2 1 -\nM  V30 3)');
      const baseline = await renderChemicalStructure({ structureId: 'wrapped-connect', molfileV3000: plain });
      for (const candidate of [splitValue, splitToken, splitElsewhere]) {
        const rendered = await renderChemicalStructure({ structureId: 'wrapped-connect', molfileV3000: candidate });
        assert.equal(rendered.svg, baseline.svg, `${connect} line folding must not affect the drawing`);
        assert.equal(rendered.molfile, candidate, 'canonical V3000 retains its original physical lines');
        assert.deepEqual(rendered.diagnostics.displayOnly.suppressedConnectLabels, [connect]);
        await renderChemicalStructures([{ structureId: 'wrapped-connect', molfileV3000: candidate }], output);
        assert.equal(await fs.readFile(path.join(output, 'wrapped-connect.mol'), 'utf8'), candidate);
      }
    }
    const malformed = SRU_MOLFILE.replace('CONNECT=HT', 'CONNECT=H-\nnot a continuation');
    await assert.rejects(renderChemicalStructure({ structureId: 'bad-continuation', molfileV3000: malformed }), /continuation/);
  } finally {
    await fs.rm(output, { recursive: true, force: true });
  }
});

test('RDKit rendering is deterministic, tightly normalized, colored, and style-pinned', async () => {
  const definition = { structureId: 'heteroatom-smoke', molfileV3000: HETEROATOM_MOLFILE };
  const first = await renderChemicalStructure(definition);
  const second = await renderChemicalStructure(definition);
  assert.equal(STRUCTURE_RENDERER_VERSION, 'rdkit-js-2025.03.4');
  assert.equal(STRUCTURE_STYLE_ID, 'wop-structure-style-v9');
  assert.deepEqual(STRUCTURE_STYLE, {
    id: 'wop-structure-style-v9',
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
    attachmentPolicy: 'sru-boundary-or-perpendicular-open-attachment',
    sgroupConnectivityLabelPolicy: 'suppress-ht-hh-eu',
    absoluteStereoLabelPolicy: 'suppress-validated-abs-labels-only',
    markushPolicy: 'visible-generic-and-numbered-r-with-authored-notation'
  });
  assert.equal(first.svg, second.svg);
  assert.equal(createHash('sha256').update(first.svg).digest('hex'), '01d10c342424812ca9f556a4f0119f7f80a231d7ad7cb3b5642db2d26c75b1dd');
  assert.match(first.svg, /^<svg xmlns="http:\/\/www\.w3\.org\/2000\/svg" width="118" height="64" viewBox="1989 2016 118 64">/);
  assert.match(first.svg, /stroke="#FF0000"/);
  assert.doesNotMatch(first.svg, /<\?|<!--|\b(?:class|style)=|<(?:script|foreignObject|image|style|text)\b|(?:data:|javascript:|url\s*\()/i);
  assert.equal(first.molfile, HETEROATOM_MOLFILE);
  assert.equal(first.diagnostics.canonicalSemantics.authoredCoordinatesRetained, true);
  assert.equal(first.diagnostics.serializer.serializerIsCanonicalAuthority, false);
  assert.doesNotThrow(() => normalizeRenderedSvg(first.svg, { structureId: 'safe-svg' }));
  assert.throws(
    () => normalizeRenderedSvg(first.svg.replace('</svg>', '<script>alert(1)</script></svg>'), { structureId: 'script-svg' }),
    /forbidden declaration or element/
  );
  assert.throws(
    () => normalizeRenderedSvg(first.svg.replace('<path ', '<path style="fill:url(https://evil.example/asset)" '), { structureId: 'external-svg' }),
    /unsupported inline style|must be none|unsafe/
  );
  assert.throws(
    () => normalizeRenderedSvg(`${first.svg}<g></g>`, { structureId: 'sibling-root-svg' }),
    /path-only|malformed markup/
  );
  await assert.rejects(
    renderChemicalStructure({ structureId: 'invalid-valence', molfileV3000: INVALID_VALENCE_MOLFILE }),
    /RDKit could not parse\/check|rejected the connection table/
  );
  const unknownStereo = await renderChemicalStructure({
    structureId: 'unknown-tacticity',
    molfileV3000: UNKNOWN_STEREO_SRU_MOLFILE
  });
  assert.deepEqual(unknownStereo.diagnostics.serializer.singleBondCfg2Omissions, [2]);
  assert.deepEqual(unknownStereo.diagnostics.stereoRendering, [
    { bondId: 2, cfg: 2, geometry: 'cubic-wavy', verified: true }
  ]);
  assert.equal(unknownStereo.diagnostics.displayOnly.canonicalMolfileUnchanged, true);
  assert.deepEqual(unknownStereo.diagnostics.displayOnly.hiddenTerminalPseudoatomIndices, [1, 6]);
  assert.doesNotMatch(unknownStereo.svg, /\*|\bHT\b|\bclass=|\bstyle=/);
  const genericR = await renderChemicalStructure({
    structureId: 'generic-markush-r',
    molfileV3000: GENERIC_R_MOLFILE
  });
  assert.deepEqual(genericR.diagnostics.displayOnly.visibleGenericRAtomIndices, [2]);
  assert.deepEqual(genericR.conventions, {
    openAttachmentCount: 0,
    genericRAtomCount: 1,
    numberedRAtomCount: 0,
    unknownSingleBondCount: 0,
    unknownDoubleBondCount: 0
  });
  assert.deepEqual(genericR.diagnostics.displayOnly.hiddenTerminalPseudoatomIndices, []);
  const numberedR = await renderChemicalStructure({
    structureId: 'numbered-markush-r',
    molfileV3000: NUMBERED_R_MOLFILE
  });
  assert.equal(numberedR.molfile, NUMBERED_R_MOLFILE);
  assert.deepEqual(numberedR.diagnostics.displayOnly.suppressedNumberedRGroups, [
    { atomId: 2, groupNumber: 1 },
    { atomId: 3, groupNumber: 2 }
  ]);
  assert.deepEqual(numberedR.diagnostics.displayOnly.visibleNumberedRAtoms, [
    { atomId: 2, groupNumber: 1 },
    { atomId: 3, groupNumber: 2 }
  ]);
  assert.deepEqual(numberedR.diagnostics.numberedRLabelRendering, [
    { atomId: 2, groupNumber: 1, glyphPathCount: 2, geometry: 'r-with-superscript', verified: true },
    { atomId: 3, groupNumber: 2, glyphPathCount: 2, geometry: 'r-with-superscript', verified: true }
  ]);
  assert.equal(numberedR.conventions.numberedRAtomCount, 2);
  const wrappedNumberedR = await renderChemicalStructure({
    structureId: 'wrapped-numbered-markush-r',
    molfileV3000: NUMBERED_R_MOLFILE.replace(
      '0 RGROUPS=(1 1)',
      '0 -\nM  V30 RGROUPS=(1 1)'
    )
  });
  assert.deepEqual(wrappedNumberedR.diagnostics.displayOnly.visibleNumberedRAtoms, [
    { atomId: 2, groupNumber: 1 },
    { atomId: 3, groupNumber: 2 }
  ]);
  const multiDigitNumberedR = await renderChemicalStructure({
    structureId: 'multi-digit-numbered-markush-r',
    molfileV3000: NUMBERED_R_MOLFILE.replace('RGROUPS=(1 2)', 'RGROUPS=(1 10)')
  });
  assert.deepEqual(multiDigitNumberedR.diagnostics.numberedRLabelRendering.at(-1), {
    atomId: 3,
    groupNumber: 10,
    glyphPathCount: 3,
    geometry: 'r-with-superscript',
    verified: true
  });
  await assert.rejects(
    renderChemicalStructure({
      structureId: 'invalid-valence-with-wavy-bond',
      molfileV3000: INVALID_VALENCE_MOLFILE.replace('M  V30 1 1 1 2', 'M  V30 1 1 1 2 CFG=2')
    }),
    /RDKit could not parse\/check|rejected the connection table/
  );
});

test('SRU structures render sequentially to paired SVG and V3000 assets', async (context) => {
  const temporary = await fs.mkdtemp(path.join(os.tmpdir(), 'wop-structure-renderer-'));
  context.after(async () => fs.rm(temporary, { recursive: true, force: true }));
  const definitions = [
    { structureId: 'heteroatom-smoke', molfileV3000: HETEROATOM_MOLFILE },
    { structureId: 'polyethylene-sru-smoke', molfileV3000: SRU_MOLFILE },
    { structureId: 'copolymer-sgroup-smoke', molfileV3000: COP_MOLFILE }
  ];
  const validation = await validateChemicalStructures(definitions);
  assert.equal(validation.length, 3);
  assert.deepEqual(validation[1].diagnostics.displayOnly.hiddenTerminalPseudoatomIndices, [1, 4]);
  assert.equal(validation[1].diagnostics.canonicalSemantics.sgroupCount, 1);
  assert.equal(validation[2].diagnostics.canonicalSemantics.sgroupCount, 3);

  const output = path.join(temporary, 'assets', 'structures');
  const rendered = await renderChemicalStructures(definitions, output);
  assert.equal(rendered.structureDefinitionCount, 3);
  assert.equal(rendered.renderedStructureCount, 3);
  assert.deepEqual((await fs.readdir(output)).sort(), [
    'copolymer-sgroup-smoke.mol',
    'copolymer-sgroup-smoke.svg',
    'heteroatom-smoke.mol',
    'heteroatom-smoke.svg',
    'polyethylene-sru-smoke.mol',
    'polyethylene-sru-smoke.svg'
  ]);
  assert.match(await fs.readFile(path.join(output, 'polyethylene-sru-smoke.svg'), 'utf8'), /<svg/);
  assert.equal(await fs.readFile(path.join(output, 'polyethylene-sru-smoke.mol'), 'utf8'), SRU_MOLFILE);
  assert.match(await fs.readFile(path.join(output, 'copolymer-sgroup-smoke.mol'), 'utf8'), /M  V30 3 COP 0/);
});

test('all corpus repeat brackets cross only their declared continuation bonds', async () => {
  const snapshot = await readPublicationSnapshot();
  const orient = (a, b, c) => (b.x - a.x) * (c.y - a.y) - (b.y - a.y) * (c.x - a.x);
  const intersects = (a, b, c, d) => orient(a, b, c) * orient(a, b, d) < 0 &&
    orient(c, d, a) * orient(c, d, b) < 0;
  for (const definition of snapshot.chemicalStructures) {
    const id = definition.structureId;
    const semantics = validateV3000Molfile(definition.molfileV3000);
    for (const group of semantics.groups.filter(g => g.type === 'SRU')) {
    const crossings = group.bracketCoordinates.map(([x, y, z, x2, y2]) => {
      assert.ok(Math.hypot(x2 - x, y2 - y) <= 1.5 * semantics.meanBondLength,
        `${id}: brackets must delimit the backbone, not enclose all side groups`);
      const hit = [...semantics.bonds.values()].filter(b => intersects({ x, y }, { x: x2, y: y2 },
        semantics.atoms.get(b.left), semantics.atoms.get(b.right))).map(b => b.bondId);
      assert.equal(hit.length, 1, `${id}: each bracket crosses exactly one bond`);
      return hit[0];
    });
    assert.deepEqual(crossings.sort((a, b) => a - b), [...group.xbondIds].sort((a, b) => a - b));
    }
  }
});

test('PHEMA repeat retains its side-chain chemistry and clears its repeat subscript', async () => {
  const snapshot = await readPublicationSnapshot();
  const entry = snapshot.polymers.find((item) => item.wopId === 'wop-000229');
  const definition = definitionsById(snapshot).get('polyhema-unit');
  const record = validateV3000Molfile(definition.molfileV3000);
  const [group] = record.groups;
  assert.equal(group.type, 'SRU');
  assert.equal(group.connect, 'HT');
  assert.equal(group.xbondIds.length, 2);
  assert.ok(entry.structuralDepictions.sourceIds.includes('evlyukhin-phema-repeat-2015'));
  assert.ok(entry.sources.some((source) => source.sourceId === 'evlyukhin-phema-repeat-2015' && source.supports.includes('structuralDepictions')));
  // Both carbonyl atoms lie above the repeat bracket so the n subscript is
  // below the backbone, away from the carbonyl bond and oxygen label.
  const top = Math.max(...group.bracketCoordinates.flatMap((b) => [b[1], b[4]]));
  assert.ok(record.atoms.get(5).y > top);
  assert.ok(record.atoms.get(6).y > top);
  const rdkit = await initializeRDKit();
  const molecule = rdkit.get_mol(definition.molfileV3000);
  assert.ok(molecule?.is_valid());
  try { assert.equal(molecule.get_smiles(), '*CC(*)(C)C(=O)OCCO'); }
  finally { molecule.delete(); }
});

test('PVP repeat retains its N-linked lactam and independent structure source', async () => {
  const snapshot = await readPublicationSnapshot();
  const entry = snapshot.polymers.find((item) => item.wopId === 'wop-000237');
  const definition = definitionsById(snapshot).get('polyvinylpyrrolidone-unit');
  const record = validateV3000Molfile(definition.molfileV3000);
  const [group] = record.groups;
  assert.equal(group.type, 'SRU');
  assert.equal(group.connect, 'HT');
  assert.equal(group.xbondIds.length, 2);
  assert.ok(entry.structuralDepictions.sourceIds.includes('gonzalez-ortiz-pvp-repeat-2022'));
  assert.ok(entry.sources.some((source) => source.sourceId === 'gonzalez-ortiz-pvp-repeat-2022' && source.supports.includes('structuralDepictions')));
  const rdkit = await initializeRDKit();
  const molecule = rdkit.get_mol(definition.molfileV3000);
  assert.ok(molecule?.is_valid());
  try { assert.equal(molecule.get_smiles(), '*CC(*)N1CCCC1=O'); }
  finally { molecule.delete(); }
});

test('repeat labels clear their own bracket tips and preserve canonical downloads', async () => {
  const snapshot = await readPublicationSnapshot();
  for (const id of ['polystyrene-sru', 'polymethyl-methacrylate-sru', 'polyethylene-terephthalate-sru',
    'isotactic-polypropylene-corrected-dyad', 'sbs-connected-aba-block-architecture']) {
    const definition = snapshot.chemicalStructures.find(d => d.structureId === id);
    const rendered = await renderChemicalStructure(definition);
    const labels = rendered.diagnostics.repeatLabelRendering;
    assert.equal(labels.length, id.startsWith('sbs-') ? 3 : 1);
    for (const { labelBounds: label, bracketBounds: bracket } of labels) {
      assert.ok(label.minX >= bracket.maxX + 3.9, `${id}: horizontal label clearance`);
      assert.ok(label.minY >= bracket.maxY + 3.9, `${id}: vertical label clearance`);
      assert.ok(label.maxY - label.minY >= 11, `${id}: legible repeat label`);
    }
    assert.equal(rendered.molfile, definition.molfileV3000);
    assert.equal(rendered.diagnostics.canonicalSemantics.authoredCoordinatesRetained, true);
  }
});

test('glycan SRU virtual stitches join carbon to oxygen rather than oxygen to oxygen', async () => {
  const snapshot = await readPublicationSnapshot();
  const byId = definitionsById(snapshot);

  for (const structureId of GLYCAN_SRU_IDS) {
    const definition = byId.get(structureId);
    assert.ok(definition, `missing corrected glycan structure ${structureId}`);
    assert.deepEqual(
      internalSruAttachmentSymbols(definition).sort(),
      ['C', 'O'],
      `${structureId} virtual SRU stitch must be C–O, never O–O`
    );
  }
});

test('PEBA soft block stitches carbon to oxygen at a PA12 ester junction', async () => {
  const snapshot = await readPublicationSnapshot();
  const definition = definitionsById(snapshot).get('peba-pa12-ptmeg-corrected-architecture');
  const structure = validateV3000Molfile(definition.molfileV3000, { structureId: definition.structureId });
  const soft = structure.groups.find((group) => group.label === 'y');
  assert.ok(soft);
  const symbols = soft.atomIds.map((id) => structure.atoms.get(id).symbol).sort();
  assert.deepEqual(symbols, ['C', 'C', 'C', 'C', 'O']);
  const atoms = new Set(soft.atomIds);
  const endpoints = soft.xbondIds.map((id) => {
    const bond = structure.bonds.get(id);
    assert.notEqual(atoms.has(bond.left), atoms.has(bond.right));
    return structure.atoms.get(atoms.has(bond.left) ? bond.left : bond.right).symbol;
  }).sort();
  assert.deepEqual(endpoints, ['C', 'O'], 'adjacent PTMEG repeats must join through C–O, not O–O');
  const hard = structure.groups.find((group) => group.label === 'x');
  assert.ok(hard);
  const hardAtoms = new Set(hard.atomIds);
  const bridgingO = [...structure.atoms.values()].find((atom) => atom.symbol === 'O' && !atoms.has(atom.atomId) && !hardAtoms.has(atom.atomId));
  assert.ok(bridgingO, 'the ester oxygen lies between the two repeat blocks');
  const bonds = [...structure.bonds.values()];
  const esterBond = bonds.find((bond) => [bond.left, bond.right].includes(bridgingO.atomId) && hardAtoms.has(bond.left === bridgingO.atomId ? bond.right : bond.left));
  assert.ok(esterBond);
  const carbonyl = esterBond.left === bridgingO.atomId ? esterBond.right : esterBond.left;
  assert.equal(structure.atoms.get(carbonyl).symbol, 'C');
  assert.ok(bonds.some((bond) => bond.order === 2 && [bond.left, bond.right].includes(carbonyl) && structure.atoms.get(bond.left === carbonyl ? bond.right : bond.left).symbol === 'O'));
});

test('the PMDA–ODA polyimide example joins repeat units through nitrogen and carbon', async () => {
  const snapshot = await readPublicationSnapshot();
  const definition = definitionsById(snapshot).get('pmda-oda-polyimide-sru');
  assert.ok(definition);
  assert.deepEqual(internalSruAttachmentSymbols(definition).sort(), ['C', 'N']);
  const structure = validateV3000Molfile(definition.molfileV3000, { structureId: definition.structureId });
  const atoms = [...structure.atoms.values()];
  assert.equal(atoms.filter((atom) => atom.symbol === 'N').length, 2);
  assert.equal(atoms.filter((atom) => atom.symbol === 'O').length, 5);
  const polymer = snapshot.polymers.find((entry) => entry.wopId === 'wop-000086');
  assert.match(polymer.synthesisRoutes[0].productNote, /not a claim that it is the product/);
});

test('finite motifs explicitly marked polymerSgroup false contain no V3000 S-group', async () => {
  const snapshot = await readPublicationSnapshot();
  const byId = definitionsById(snapshot);
  // The migration specifications include historical definitions which may
  // have been retired. The publication snapshot is the live registry.
  const finiteMotifIds = explicitlyFiniteMotifIds().filter((id) => byId.has(id));
  assert.ok(finiteMotifIds.length > 0, 'expected at least one explicitly finite motif');

  for (const structureId of finiteMotifIds) {
    const definition = byId.get(structureId);
    assert.doesNotMatch(
      definition.molfileV3000,
      /^M  V30 BEGIN SGROUP$/m,
      `${structureId} is finite and must not render repeat brackets`
    );
    const semantics = validateV3000Molfile(definition.molfileV3000, { structureId });
    assert.equal(semantics.groups.length, 0, `${structureId} must have no V3000 S-group records`);
  }
});

test('canonical corpus has no unintended single-bond CFG=2 and preserves explained crossed doubles', async () => {
  const snapshot = await readPublicationSnapshot();
  const crossedDoubleIds = [];
  const unknownSingleBondIds = [];

  for (const definition of snapshot.chemicalStructures) {
    const cfg2 = cfg2Bonds(definition);
    if (cfg2.some(({ order }) => order === 1)) unknownSingleBondIds.push(definition.structureId);
    if (cfg2.some(({ order }) => order === 2)) crossedDoubleIds.push(definition.structureId);
  }

  assert.deepEqual(
    unknownSingleBondIds.sort(),
    [],
    'single-bond CFG=2 is reserved for intentionally curated stereochemistry and must be explicit'
  );
  assert.deepEqual(crossedDoubleIds.sort(), INTENTIONAL_CROSSED_DOUBLE_IDS);

  for (const structureId of INTENTIONAL_CROSSED_DOUBLE_IDS) {
    const definition = snapshot.chemicalStructures.find((candidate) => candidate.structureId === structureId);
    assert.ok(definition, `missing intentional crossed-double structure ${structureId}`);
    const uses = depictionUses(snapshot, structureId);
    assert.ok(uses.length > 0, `${structureId} must be used by a reviewed depiction`);
    for (const { group, item } of uses) {
      assert.match(
        `${group.scopeNote} ${item.caption}`,
        /alkene|cis|trans|unsaturation|double|geometry/i,
        `${structureId} must explain why crossed double-bond geometry is shown`
      );
    }
    const rendered = await renderChemicalStructure(definition);
    assert.ok(
      rendered.diagnostics.stereoRendering.some(({ geometry }) => geometry === 'crossed-double-bond'),
      `${structureId} must render its intentional CFG=2 double bond as crossed geometry`
    );
  }
});

test('open attachment marks preserve stereo, suppress SRU crossings, and stay inside SVG bounds', async () => {
  const snapshot = await readPublicationSnapshot();
  const byId = definitionsById(snapshot);
  const cases = [
    ['amylopectin-branched-triglucosyl-motif', 3, null],
    ['cellulose-trisubstitution-corrected-markush-motif', 2, 9],
    ['isotactic-polypropylene-corrected-dyad', 0, null],
    ['sbs-connected-aba-block-architecture', 0, null]
  ];
  for (const [id, markerCount, stereoBond] of cases) {
    const definition = byId.get(id);
    const rendered = await renderChemicalStructure(definition);
    assert.equal(rendered.molfile, definition.molfileV3000, `${id} canonical download must remain unchanged`);
    assert.equal(rendered.conventions.openAttachmentCount, markerCount, id);
    assert.equal(rendered.diagnostics.attachmentRendering.length, markerCount, id);
    if (stereoBond) {
      assert.ok(rendered.diagnostics.stereoRendering.some(b => b.bondId === stereoBond && b.geometry === 'solid-wedge' && b.verified));
      assert.ok(rendered.diagnostics.attachmentRendering.some(a => a.bondId === stereoBond && a.verified));
    }
    const [, minX, minY, width, height] = rendered.svg.match(/viewBox="(-?\d+) (-?\d+) (\d+) (\d+)"/).map(Number);
    for (const marker of rendered.diagnostics.attachmentRendering) {
      assert.equal(marker.geometry, 'perpendicular-open-attachment');
      assert.ok(marker.bounds.minX >= minX && marker.bounds.maxX <= minX + width, `${id} mark must fit horizontally`);
      assert.ok(marker.bounds.minY >= minY && marker.bounds.maxY <= minY + height, `${id} mark must fit vertically`);
    }
  }
});

test('polypropylene tactic dyads stitch into propylene chains with the claimed relative stereo', async () => {
  const snapshot = await readPublicationSnapshot();
  const byId = definitionsById(snapshot);
  const rdkit = await initializeRDKit();
  const cases = [
    ['isotactic-polypropylene-corrected-dyad', '*C[C@H](C)C[C@@H](*)C'],
    ['syndiotactic-polypropylene-corrected-dyad', '*C[C@H](C)C[C@H](*)C']
  ];
  for (const [id, expectedSmiles] of cases) {
    const definition = byId.get(id);
    const record = validateV3000Molfile(definition.molfileV3000, { structureId: id });
    const [group] = record.groups;
    assert.equal(group.type, 'SRU');
    assert.equal(group.connect, 'HT');
    assert.equal(group.xbondIds.length, 2);
    const inside = new Set(group.atomIds);
    assert.equal(inside.size, 6, `${id} must contain two C3 propylene units`);
    const adjacency = new Map([...inside].map(atom => [atom, []]));
    for (const bond of record.bonds.values()) {
      if (inside.has(bond.left) && inside.has(bond.right)) {
        assert.equal(bond.order, 1);
        adjacency.get(bond.left).push(bond.right);
        adjacency.get(bond.right).push(bond.left);
      }
    }
    const endpoints = group.xbondIds.map(id => {
      const bond = record.bonds.get(id);
      assert.notEqual(inside.has(bond.left), inside.has(bond.right));
      return inside.has(bond.left) ? bond.left : bond.right;
    });
    const queue = [[endpoints[0]]];
    let path;
    while (queue.length) {
      const candidate = queue.shift();
      const tail = candidate.at(-1);
      if (tail === endpoints[1]) { path = candidate; break; }
      for (const next of adjacency.get(tail)) if (!candidate.includes(next)) queue.push([...candidate, next]);
    }
    assert.ok(path);
    assert.equal(path.length, 4, `${id} must have four backbone atoms per dyad`);
    const backbone = new Set(path);
    const substitution = path.map(atom => {
      assert.equal(record.atoms.get(atom).symbol, 'C');
      const branches = adjacency.get(atom).filter(other => !backbone.has(other));
      for (const branch of branches) {
        assert.equal(record.atoms.get(branch).symbol, 'C');
        assert.equal(adjacency.get(branch).length, 1, `${id} pendant group must be methyl`);
      }
      return branches.length;
    });
    // Two stitched copies must alternate unsubstituted and methyl-bearing
    // carbon even at the junction: no extra methylene at an SRU boundary.
    const stitched = [...substitution, ...substitution];
    assert.equal(stitched.filter(Boolean).length, 4);
    for (let i = 0; i < stitched.length; i++) assert.notEqual(stitched[i], stitched[(i + 1) % stitched.length], `${id} has an incorrect repeat junction`);
    const molecule = rdkit.get_mol(definition.molfileV3000);
    assert.ok(molecule?.is_valid());
    try { assert.equal(molecule.get_smiles(), expectedSmiles, `${id} must preserve its specified local stereochemistry`); }
    finally { molecule.delete(); }
  }
});

test('canonical cis/trans diene records preserve specified E/Z stereochemistry', async () => {
  const snapshot = await readPublicationSnapshot();
  const byId = definitionsById(snapshot);
  const rdkit = await initializeRDKit();
  const expected = new Map([
    ['cis-1-4-polybutadiene-unit', '*C/C=C\\C*'],
    ['trans-1-4-polybutadiene-unit', '*C/C=C/C*'],
    ['cis-1-4-polyisoprene-unit', '*C/C=C(/C)C*'],
    ['trans-1-4-polyisoprene-unit', '*C/C=C(\\C)C*']
  ]);

  for (const [structureId, expectedSmiles] of expected) {
    const definition = byId.get(structureId);
    assert.ok(definition, `missing specified-alkene structure ${structureId}`);
    const molecule = rdkit.get_mol(definition.molfileV3000);
    assert.ok(molecule?.is_valid(), `${structureId} must parse in RDKit`);
    try {
      assert.equal(
        molecule.get_smiles(),
        expectedSmiles,
        `${structureId} must retain its specified E/Z configuration after V3000 parsing`
      );
    } finally {
      molecule.delete();
    }
  }
});

test('registry validation and RDKit parse failures occur before creating output', async () => {
  const duplicate = { structureId: 'duplicate-smoke', molfileV3000: HETEROATOM_MOLFILE };
  const destination = path.join(os.tmpdir(), `wop-duplicate-output-${process.pid}-${Date.now()}`);
  await assert.rejects(renderChemicalStructures([duplicate, duplicate], destination), /duplicate registry identifier/);
  await assert.rejects(fs.access(destination), { code: 'ENOENT' });

  const parseFailureDestination = path.join(os.tmpdir(), `wop-parse-failure-output-${process.pid}-${Date.now()}`);
  await assert.rejects(
    renderChemicalStructures([
      duplicate,
      { structureId: 'invalid-valence', molfileV3000: INVALID_VALENCE_MOLFILE }
    ], parseFailureDestination),
    /RDKit could not parse\/check|rejected the connection table/
  );
  await assert.rejects(fs.access(parseFailureDestination), { code: 'ENOENT' });
});

test('normalized SVG hashes and visual goldens cover the required chemistry classes', async () => {
  const goldenDirectory = path.resolve('test/fixtures/structure-goldens');
  const manifest = JSON.parse(await fs.readFile(path.join(goldenDirectory, 'manifest.json'), 'utf8'));
  const snapshot = await readPublicationSnapshot();
  assert.equal(manifest.rendererVersion, STRUCTURE_RENDERER_VERSION);
  assert.equal(manifest.styleVersion, STRUCTURE_STYLE_ID);
  assert.deepEqual(manifest.cases.map(({ category }) => category), [
    'carbon-only',
    'heteroatom-rich',
    'stereoregular',
    'copolymer',
    'ionic',
    'silicon-containing',
    'generic-markush',
    'numbered-markush',
    'network',
    'blend',
    'irregular-motif'
  ]);
  const byId = definitionsById(snapshot);

  for (const goldenCase of manifest.cases) {
    assert.ok(goldenCase.outputs.length >= 1, goldenCase.category);
    for (const expected of goldenCase.outputs) {
      const definition = expected.structureId === 'cop-sgroup'
        ? {
            structureId: 'cop-sgroup',
            molfileV3000: await fs.readFile(path.resolve('test/fixtures/structures/cop-sgroup.mol'), 'utf8')
          }
        : byId.get(expected.structureId);
      assert.ok(definition, `${goldenCase.category} / ${expected.structureId}`);
      const rendered = await renderChemicalStructure(definition);
      if (expected.structureId === 'isotactic-polypropylene-corrected-dyad') {
        assert.ok(rendered.diagnostics.stereoRendering.some(({ geometry }) => geometry === 'solid-wedge'));
        assert.ok(rendered.diagnostics.stereoRendering.some(({ geometry }) => geometry === 'hashed-wedge'));
      }
      const fixture = await fs.readFile(path.join(goldenDirectory, expected.filename), 'utf8');
      assert.equal(rendered.svg, fixture, `${goldenCase.category} / ${expected.structureId}`);
      assert.equal(
        createHash('sha256').update(rendered.svg).digest('hex'),
        expected.sha256,
        `${goldenCase.category} / ${expected.structureId}`
      );
    }
  }
});
