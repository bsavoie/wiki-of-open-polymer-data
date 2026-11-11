import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import fs from 'node:fs/promises';
import path from 'node:path';
import test from 'node:test';
import { readAndValidateSnapshot } from '../lib/importer.mjs';
import {
  CONTEXTUAL_STRUCTURE_REVIEW_STATUSES,
  PRIMARY_CLASSES,
  SECTION_KEYS,
  STRUCTURE_FIDELITIES,
  STRUCTURE_REPRESENTATION_TYPES,
  STRUCTURE_REVIEW_STATUSES,
  SnapshotValidationError,
  validateSnapshot
} from '../lib/schema.mjs';
import { isPublicSourceUrl } from '../lib/source-policy.mjs';

const publicDirectory = path.resolve('public-data/wop-publication-snapshot-v2');
const fixtureDirectory = path.resolve('fixtures/wop-publication-snapshot-v2');
const snapshot = await readAndValidateSnapshot(publicDirectory);
const fixture = await readAndValidateSnapshot(fixtureDirectory);
const legacySnapshot = JSON.parse(await fs.readFile(path.resolve('public-data/wop-publication-snapshot-v1/snapshot.json'), 'utf8'));
const LEGACY_V1_SHA256 = 'c9de0069c4f68b71c3b0730e1b579728abbc0a53bf8f2ebabec6ff1489b0bf0c';

test('the legacy v1 publication snapshot remains byte-for-byte frozen', async () => {
  const legacyPath = path.resolve('public-data/wop-publication-snapshot-v1/snapshot.json');
  const checksumPath = path.resolve('public-data/wop-publication-snapshot-v1/snapshot.sha256');
  const [legacyBytes, checksumRecord] = await Promise.all([
    fs.readFile(legacyPath),
    fs.readFile(checksumPath, 'utf8')
  ]);
  const expected = checksumRecord.trim().split(/\s+/)[0];
  assert.equal(expected, LEGACY_V1_SHA256);
  assert.equal(createHash('sha256').update(legacyBytes).digest('hex'), LEGACY_V1_SHA256);
});

const FIXTURE_V3000 = `Fixture structure
  WOP 2D

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

const CONTEXTUAL_FIXTURE_V3000 = FIXTURE_V3000
  .replace('Fixture structure', 'Contextual fixture structure')
  .replace('M  V30 2 O 0.7500', 'M  V30 2 N 0.7500');

const NUMBERED_R_FIXTURE_V3000 = `Numbered Markush fixture
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

function attachReviewedFixtureStructure(copy, sourceId) {
  const article = copy.polymers[0];
  const source = article.sources.find((candidate) => candidate.sourceId === sourceId);
  if (!source) throw new Error(`Test setup is missing source ${sourceId}`);
  source.supports = [...new Set([...source.supports, 'structuralDepictions'])];
  copy.chemicalStructures = [{ structureId: 'fixture-repeat-unit', molfileV3000: FIXTURE_V3000 }];
  article.structuralDepictions = {
    reviewStatus: 'reviewed',
    representationType: 'constitutional_repeat_unit',
    scopeNote: 'This exact fixture connection table is used only to exercise the v2 contract.',
    sourceIds: [sourceId],
    items: [{
      structureId: 'fixture-repeat-unit',
      label: 'Fixture repeat unit',
      fidelity: 'exact',
      altText: 'Fixture carbon–oxygen constitutional unit',
      caption: 'Exact fixture connection table for schema validation.'
    }]
  };
}

function attachContextualFixtureStructure(copy, sourceId) {
  const article = copy.polymers[0];
  const source = article.sources.find((candidate) => candidate.sourceId === sourceId);
  if (!source) throw new Error(`Test setup is missing source ${sourceId}`);
  source.supports = [...new Set([...source.supports, 'structuralDepictions'])];
  copy.chemicalStructures.push({
    structureId: 'fixture-contextual-structure',
    molfileV3000: CONTEXTUAL_FIXTURE_V3000
  });
  article.contextualStructures = {
    feedstocksAndSynthesis: {
      reviewStatus: 'reviewed',
      scopeNote: 'This finite fixture structure provides source-mapped synthesis context and is not the article hero.',
      sourceIds: [sourceId],
      items: [{
        structureId: 'fixture-contextual-structure',
        label: 'Fixture synthesis structure',
        fidelity: 'representative',
        altText: 'Finite fixture structure used as synthesis context',
        caption: 'Representative contextual fixture structure for schema validation.',
        notation: 'n = 0'
      }]
    },
    processing: {
      reviewStatus: 'draft',
      scopeNote: 'This second group exercises processing context without requiring an item notation.',
      sourceIds: [sourceId],
      items: [{
        structureId: 'fixture-contextual-structure',
        label: 'Fixture processing structure',
        fidelity: 'schematic',
        altText: 'Finite fixture structure used as processing context',
        caption: 'Schematic contextual fixture structure for processing validation.'
      }]
    }
  };
}

test('the public denominator retains at least the 250 stable seed identifiers', () => {
  assert.ok(snapshot.polymers.length >= 250);
  const ids = new Set(snapshot.polymers.map((entry) => entry.wopId));
  for (let index = 1; index <= 250; index += 1) {
    assert.ok(ids.has(`wop-${String(index).padStart(6, '0')}`));
  }
  for (const entry of snapshot.polymers) assert.equal(entry.type, 'polymer_entry');
});

test('the populated snapshot has no stubs and frozen stubs expose no prose or article sources', () => {
  const stubs = snapshot.polymers.filter((entry) => entry.maturity.contentMaturity === 'stub');
  assert.equal(stubs.length, 0, 'the populated public snapshot should not retain research stubs');
  for (const entry of stubs) {
    assert.equal(entry.maturity.confidence, 'provisional');
    assert.ok(entry.maturity.reviewFlags.includes('open_sources_needed'));
    assert.equal(entry.sources.length, 0);
    for (const key of SECTION_KEYS) assert.equal(entry.sections[key], '');
  }

  const frozen = fixture.polymers[0];
  assert.equal(frozen.maturity.contentMaturity, 'stub');
  assert.equal(frozen.sources.length, 0);
  for (const key of SECTION_KEYS) assert.equal(frozen.sections[key], '');
});

test('all public entries satisfy reviewed structural-depiction acceptance', () => {
  assert.equal(snapshot.polymers.length, 263);
  assert.ok(snapshot.chemicalStructures.length > 0);
  assert.equal(JSON.stringify(snapshot).includes('"smiles"'), false);
  assert.equal(JSON.stringify(snapshot).includes('<svg'), false);
  assert.ok(snapshot.chemicalStructures.every(({ molfileV3000 }) => molfileV3000.includes('V3000')));
  const definitions = new Set(snapshot.chemicalStructures.map(({ structureId }) => structureId));
  const usage = new Map(snapshot.chemicalStructures.map(({ structureId }) => [structureId, 0]));
  for (const polymer of snapshot.polymers) {
    const depiction = polymer.structuralDepictions;
    assert.equal(depiction.reviewStatus, 'reviewed', polymer.wopId);
    assert.ok(depiction.sourceIds.length >= 1, polymer.wopId);
    if (depiction.representationType !== 'no_unique_repeat') assert.ok(depiction.items.length >= 1, polymer.wopId);
    for (const sourceId of depiction.sourceIds) {
      const source = polymer.sources.find((candidate) => candidate.sourceId === sourceId);
      assert.ok(source?.supports.includes('structuralDepictions'), `${polymer.wopId} / ${sourceId}`);
    }
    for (const item of depiction.items) {
      assert.ok(definitions.has(item.structureId), `${polymer.wopId} / ${item.structureId}`);
      usage.set(item.structureId, usage.get(item.structureId) + 1);
    }
    for (const [sectionKey, group] of Object.entries(polymer.contextualStructures || {})) {
      assert.ok(['feedstocksAndSynthesis', 'processing'].includes(sectionKey), `${polymer.wopId} / ${sectionKey}`);
      assert.ok(CONTEXTUAL_STRUCTURE_REVIEW_STATUSES.has(group.reviewStatus), `${polymer.wopId} / ${sectionKey}`);
      for (const sourceId of group.sourceIds) {
        const source = polymer.sources.find((candidate) => candidate.sourceId === sourceId);
        assert.ok(source?.supports.includes('structuralDepictions'), `${polymer.wopId} / ${sectionKey} / ${sourceId}`);
      }
      for (const item of group.items) {
        assert.ok(definitions.has(item.structureId), `${polymer.wopId} / ${sectionKey} / ${item.structureId}`);
        usage.set(item.structureId, usage.get(item.structureId) + 1);
      }
    }
  }
  assert.equal([...usage.values()].filter((count) => count === 0).length, 0);
  assert.ok([...usage.values()].some((count) => count > 1), 'identical chemistry should reuse shared definitions');
});

test('the structural-depiction enums and status invariants are machine enforced', () => {
  assert.deepEqual([...STRUCTURE_REVIEW_STATUSES], ['pending', 'draft', 'reviewed']);
  assert.deepEqual([...CONTEXTUAL_STRUCTURE_REVIEW_STATUSES], ['draft', 'reviewed']);
  assert.deepEqual([...STRUCTURE_FIDELITIES], ['exact', 'representative', 'schematic']);
  assert.deepEqual([...STRUCTURE_REPRESENTATION_TYPES], [
    'undetermined',
    'constitutional_repeat_unit',
    'stereochemical_repeat_segment',
    'copolymer_unit_set',
    'block_or_graft_architecture',
    'variable_substitution_motif',
    'family_representative_set',
    'network_fragment',
    'component_set',
    'macromolecular_motif',
    'no_unique_repeat'
  ]);
  assert.doesNotThrow(() => validateSnapshot(structuredClone(fixture)), 'pending stub fixture');

  const reviewed = structuredClone(fixture);
  reviewed.polymers[0].sections.overview = 'Source-backed fixture prose.';
  reviewed.polymers[0].sources = [{
    ...reviewed.methodology.sources[1],
    sourceId: 'fixture-structure-source',
    supports: ['overview']
  }];
  reviewed.polymers[0].maturity.contentMaturity = 'source_backed_draft';
  reviewed.polymers[0].maturity.confidence = 'medium';
  attachReviewedFixtureStructure(reviewed, 'fixture-structure-source');

  for (const status of ['draft', 'reviewed']) {
    const copy = structuredClone(reviewed);
    copy.polymers[0].structuralDepictions.reviewStatus = status;
    assert.doesNotThrow(() => validateSnapshot(copy), status);
  }
  for (const representationType of [...STRUCTURE_REPRESENTATION_TYPES].filter((value) => !['undetermined', 'no_unique_repeat'].includes(value))) {
    const copy = structuredClone(reviewed);
    copy.polymers[0].structuralDepictions.representationType = representationType;
    if (['copolymer_unit_set', 'component_set'].includes(representationType)) {
      copy.polymers[0].structuralDepictions.items.push({
        ...copy.polymers[0].structuralDepictions.items[0],
        label: 'Second fixture component',
        altText: 'Second fixture component using the shared test connection table',
        caption: 'Second fixture item included to exercise multi-component cardinality.'
      });
    }
    assert.doesNotThrow(() => validateSnapshot(copy), representationType);
  }
  for (const fidelity of STRUCTURE_FIDELITIES) {
    const copy = structuredClone(reviewed);
    copy.polymers[0].structuralDepictions.items[0].fidelity = fidelity;
    assert.doesNotThrow(() => validateSnapshot(copy), fidelity);
  }

  const noUnique = structuredClone(reviewed);
  noUnique.chemicalStructures = [];
  noUnique.polymers[0].structuralDepictions.representationType = 'no_unique_repeat';
  noUnique.polymers[0].structuralDepictions.items = [];
  noUnique.polymers[0].structuralDepictions.scopeNote = 'The sourced material is compositionally irregular, so it has no single defensible repeat unit.';
  assert.doesNotThrow(() => validateSnapshot(noUnique));

  const invalidPending = structuredClone(reviewed);
  invalidPending.polymers[0].structuralDepictions.reviewStatus = 'pending';
  assert.throws(() => validateSnapshot(invalidPending), /pending is allowed only on stub|must be undetermined|must be empty/);
  const invalidUndetermined = structuredClone(reviewed);
  invalidUndetermined.polymers[0].structuralDepictions.representationType = 'undetermined';
  assert.throws(() => validateSnapshot(invalidUndetermined), /cannot be undetermined/);
});

test('structure registry and evidence linkage reject malformed, duplicate, dangling, and orphan records', () => {
  const base = structuredClone(fixture);
  base.polymers[0].sections.overview = 'Source-backed fixture prose.';
  base.polymers[0].sources = [{
    ...base.methodology.sources[1],
    sourceId: 'fixture-structure-source',
    supports: ['overview']
  }];
  base.polymers[0].maturity.contentMaturity = 'source_backed_draft';
  base.polymers[0].maturity.confidence = 'medium';
  attachReviewedFixtureStructure(base, 'fixture-structure-source');
  assert.doesNotThrow(() => validateSnapshot(base));

  const cases = [
    [(copy) => { copy.chemicalStructures[0].molfileV3000 = 'not a molfile'; }, /missing V3000|missing M  V30|missing M  END/],
    [(copy) => { copy.chemicalStructures[0].smiles = 'CO'; }, /smiles is not permitted/],
    [(copy) => { copy.chemicalStructures.push(structuredClone(copy.chemicalStructures[0])); }, /structureId is duplicated/],
    [(copy) => { copy.chemicalStructures.push({ structureId: 'duplicate-connection-table', molfileV3000: `Different title\n${FIXTURE_V3000.slice(FIXTURE_V3000.indexOf('  WOP 2D'))}` }); }, /duplicates fixture-repeat-unit/],
    [(copy) => { copy.polymers[0].structuralDepictions.items[0].structureId = 'missing-structure'; }, /does not name a chemical structure|not used/],
    [(copy) => { copy.polymers[0].structuralDepictions.items[0].altText = ''; }, /altText must be a non-empty string/],
    [(copy) => { copy.polymers[0].structuralDepictions.items[0].caption = ''; }, /caption must be a non-empty string/],
    [(copy) => { copy.polymers[0].structuralDepictions.reviewStatus = 'approved'; }, /reviewStatus is invalid/],
    [(copy) => { copy.polymers[0].structuralDepictions.representationType = 'pretty_picture'; }, /representationType is invalid/],
    [(copy) => { copy.polymers[0].structuralDepictions.items[0].fidelity = 'plausible'; }, /fidelity is invalid/],
    [(copy) => { copy.chemicalStructures.push({ structureId: 'orphan-structure', molfileV3000: FIXTURE_V3000.replace('Fixture structure', 'Orphan structure').replace('2 O 0.7500', '2 N 0.7500') }); }, /not used by any polymer entry/],
    [(copy) => { copy.polymers[0].structuralDepictions.sourceIds = ['missing-source']; }, /unknown article source|does not name mapped/],
    [(copy) => { copy.polymers[0].sources[0].supports = ['overview']; }, /does not support structuralDepictions/]
  ];
  for (const [mutate, pattern] of cases) {
    const copy = structuredClone(base);
    mutate(copy);
    assert.throws(() => validateSnapshot(copy), pattern);
  }
});

test('Markush notation bounds every numbered R group and permits repeated generic R only for equivalent sites', () => {
  const base = structuredClone(fixture);
  base.polymers[0].sections.overview = 'Source-backed fixture prose.';
  base.polymers[0].sources = [{
    ...base.methodology.sources[1],
    sourceId: 'fixture-structure-source',
    supports: ['overview']
  }];
  base.polymers[0].maturity.contentMaturity = 'source_backed_draft';
  base.polymers[0].maturity.confidence = 'medium';
  attachReviewedFixtureStructure(base, 'fixture-structure-source');
  base.chemicalStructures[0].molfileV3000 = NUMBERED_R_FIXTURE_V3000;
  base.polymers[0].structuralDepictions.items[0].notation = 'R¹ = methyl; R² = ethyl.';
  assert.doesNotThrow(() => validateSnapshot(base));

  const asciiNotation = structuredClone(base);
  asciiNotation.polymers[0].structuralDepictions.items[0].notation = 'R1 = methyl; R^2 = ethyl.';
  assert.doesNotThrow(() => validateSnapshot(asciiNotation));

  for (const [mutate, pattern] of [
    [(copy) => { delete copy.polymers[0].structuralDepictions.items[0].notation; }, /notation is required for a Markush R structure/],
    [(copy) => { copy.polymers[0].structuralDepictions.items[0].notation = 'R¹ = methyl.'; }, /must define displayed R²/],
    [(copy) => { copy.polymers[0].structuralDepictions.items[0].notation = 'R¹ = methyl; BR2 is unrelated.'; }, /must define displayed R²/],
    [(copy) => {
      copy.chemicalStructures[0].molfileV3000 = copy.chemicalStructures[0].molfileV3000
        .replace('RGROUPS=(1 2)', 'RGROUPS=(1 33)');
    }, /numbered R-group labels must be from 1 to 32/]
  ]) {
    const copy = structuredClone(base);
    mutate(copy);
    assert.throws(() => validateSnapshot(copy), pattern);
  }

  const repeatedGeneric = structuredClone(base);
  repeatedGeneric.chemicalStructures[0].molfileV3000 = repeatedGeneric.chemicalStructures[0].molfileV3000
    .replaceAll(/R#([^\n]*?) RGROUPS=\(1 \d+\)/g, 'R$1');
  repeatedGeneric.polymers[0].structuralDepictions.items[0].notation = 'R = alkyl.';
  assert.throws(
    () => validateSnapshot(repeatedGeneric),
    /notation must state that repeated unnumbered R sites are equivalent; number independent sites/
  );
  repeatedGeneric.polymers[0].structuralDepictions.items[0].notation = 'Each R is the same alkyl substituent; the repeated sites are equivalent.';
  assert.doesNotThrow(() => validateSnapshot(repeatedGeneric));

  repeatedGeneric.polymers[0].structuralDepictions.items[0].notation = 'Each R independently = alkyl; the sites may differ.';
  assert.throws(
    () => validateSnapshot(repeatedGeneric),
    /number independent sites/
  );
});

test('contextual structures enforce exact groups, evidence, notation, and registry usage', () => {
  const base = structuredClone(fixture);
  const article = base.polymers[0];
  article.sections.overview = 'Source-backed fixture prose.';
  article.sources = [{
    ...base.methodology.sources[1],
    sourceId: 'fixture-structure-source',
    supports: ['overview']
  }, {
    ...base.methodology.sources[2],
    sourceId: 'fixture-contextual-source',
    supports: ['structuralDepictions']
  }];
  article.maturity.contentMaturity = 'source_backed_draft';
  article.maturity.confidence = 'medium';
  attachReviewedFixtureStructure(base, 'fixture-structure-source');
  attachContextualFixtureStructure(base, 'fixture-contextual-source');

  assert.doesNotThrow(() => validateSnapshot(base), 'contextual-only definitions and mapped sources are valid');

  const cases = [
    [(copy) => {
      copy.polymers[0].contextualStructures.mechanicalProperties = structuredClone(
        copy.polymers[0].contextualStructures.feedstocksAndSynthesis
      );
    }, /contextualStructures\.mechanicalProperties is not permitted/],
    [(copy) => {
      copy.polymers[0].contextualStructures.feedstocksAndSynthesis.extra = true;
    }, /contextualStructures\.feedstocksAndSynthesis\.extra is not permitted/],
    [(copy) => {
      delete copy.polymers[0].contextualStructures.feedstocksAndSynthesis.scopeNote;
    }, /contextualStructures\.feedstocksAndSynthesis\.scopeNote is required/],
    [(copy) => {
      copy.polymers[0].contextualStructures.feedstocksAndSynthesis.reviewStatus = 'pending';
    }, /contextualStructures\.feedstocksAndSynthesis\.reviewStatus is invalid/],
    [(copy) => {
      copy.polymers[0].contextualStructures.processing.reviewStatus = 'approved';
    }, /contextualStructures\.processing\.reviewStatus is invalid/],
    [(copy) => {
      copy.polymers[0].contextualStructures.feedstocksAndSynthesis.scopeNote = '';
    }, /contextualStructures\.feedstocksAndSynthesis\.scopeNote must be a non-empty string/],
    [(copy) => {
      copy.polymers[0].contextualStructures.feedstocksAndSynthesis.sourceIds = [];
    }, /contextualStructures\.feedstocksAndSynthesis\.sourceIds must be an array of non-empty strings with at least 1 item/],
    [(copy) => {
      copy.polymers[0].contextualStructures.feedstocksAndSynthesis.items = [];
    }, /contextualStructures\.feedstocksAndSynthesis\.items must be an array with at least one depiction/],
    [(copy) => {
      copy.polymers[0].contextualStructures.feedstocksAndSynthesis.items[0].notation = '';
    }, /contextualStructures\.feedstocksAndSynthesis\.items\[0\]\.notation must be a non-empty string/],
    [(copy) => {
      copy.polymers[0].contextualStructures.processing.items[0].comment = 'not allowed';
    }, /contextualStructures\.processing\.items\[0\]\.comment is not permitted/],
    [(copy) => {
      copy.polymers[0].structuralDepictions.items[0].notation = '';
    }, /structuralDepictions\.items\[0\]\.notation must be a non-empty string/],
    [(copy) => {
      copy.polymers[0].contextualStructures = {};
    }, /contextualStructures must contain at least one section group/],
    [(copy) => {
      copy.polymers[0].contextualStructures.feedstocksAndSynthesis.sourceIds = ['missing-context-source'];
    }, /contextualStructures\.feedstocksAndSynthesis\.sourceIds names unknown article source missing-context-source/],
    [(copy) => {
      copy.polymers[0].sources.find((source) => source.sourceId === 'fixture-contextual-source').supports = ['overview'];
    }, /contextualStructures\.(?:feedstocksAndSynthesis|processing)\.sourceIds source fixture-contextual-source does not support structuralDepictions/],
    [(copy) => {
      copy.polymers[0].sources.push({
        ...copy.methodology.sources[0],
        sourceId: 'unclaimed-structure-source',
        supports: ['structuralDepictions']
      });
    }, /does not name mapped structure source unclaimed-structure-source/],
    [(copy) => {
      copy.polymers[0].contextualStructures.feedstocksAndSynthesis.items[0].structureId = 'missing-contextual-structure';
    }, /contextualStructures\.feedstocksAndSynthesis\.items\[0\]\.structureId does not name a chemical structure/]
  ];
  for (const [mutate, pattern] of cases) {
    const copy = structuredClone(base);
    mutate(copy);
    assert.throws(() => validateSnapshot(copy), pattern);
  }
});

test('the frozen seed catalog and public snapshot name the same targets', async () => {
  const raw = await fs.readFile(path.resolve('seed/initial-polymer-catalog.tsv'), 'utf8');
  const names = raw.trim().split(/\r?\n/).slice(1).map((line) => line.split('\t')[1]);
  assert.ok(names.length >= 250);
  const byId = new Map(snapshot.polymers.map((entry) => [entry.wopId, entry]));
  names.forEach((name, index) => {
    const id = `wop-${String(index + 1).padStart(6, '0')}`;
    assert.equal(byId.get(id)?.canonicalName, name, `${id} must retain its frozen seed target`);
  });
});

test('v2 preserves every v1 stable ID and keeps each legacy canonical and alias route resolvable', () => {
  assert.ok(snapshot.polymers.length >= legacySnapshot.polymers.length);
  const v2ById = new Map(snapshot.polymers.map((polymer) => [polymer.wopId, polymer]));
  const v2AliasesBySlug = new Map(snapshot.aliases.map((alias) => [alias.slug, alias.wopId]));
  for (const legacy of legacySnapshot.polymers) {
    const current = v2ById.get(legacy.wopId);
    assert.ok(current, legacy.wopId);
    if (current.canonicalSlug !== legacy.canonicalSlug) {
      assert.equal(
        v2AliasesBySlug.get(legacy.canonicalSlug),
        legacy.wopId,
        `${legacy.wopId} must preserve its v1 canonical route as an alias when the v2 slug changes`
      );
    }
  }
  for (const legacyAlias of legacySnapshot.aliases) {
    assert.equal(
      v2AliasesBySlug.get(legacyAlias.slug),
      legacyAlias.wopId,
      `${legacyAlias.slug} must preserve its v1 alias target`
    );
  }
});

test('the seed spans every declared primary browsing class and major material families', () => {
  const classes = new Set(snapshot.polymers.map((entry) => entry.taxonomy.primaryClass));
  assert.deepEqual(classes, PRIMARY_CLASSES);
  const names = new Set(snapshot.polymers.map((entry) => entry.canonicalName));
  for (const required of [
    'Polyethylene family',
    'Polypropylene family',
    'Poly(vinyl chloride)',
    'Polystyrene',
    'Poly(ethylene terephthalate)',
    'Polyamide family',
    'Bisphenol A polycarbonate',
    'Poly(ether ether ketone)',
    'Epoxy resin family',
    'Natural rubber',
    'Ethylene–propylene–diene rubber',
    'Cellulose',
    'Polylactide family',
    'Polydimethylsiloxane',
    'Polyaniline'
  ]) assert.ok(names.has(required), `missing ${required}`);
});

test('abbreviation collisions remain search ambiguities rather than routes', () => {
  const aliasSlugs = new Set(snapshot.aliases.map((alias) => alias.slug));
  for (const slug of ['pei', 'ppo', 'pfa', 'ce']) assert.equal(aliasSlugs.has(slug), false);
  for (const term of ['PEI', 'PPO', 'PFA', 'CE']) {
    const entry = snapshot.searchTerms.find((candidate) => candidate.term === term);
    assert.ok(entry, `missing ambiguous term ${term}`);
    assert.equal(entry.kind, 'ambiguous');
    assert.ok(entry.wopIds.length >= 2);
  }
});

test('a source-backed section validates only when its source maps to that section', () => {
  const copy = structuredClone(fixture);
  const article = copy.polymers[0];
  article.sections.overview = 'This independently written overview is supported by the cited open textbook section.';
  article.sources = [{
    ...copy.methodology.sources[1],
    sourceId: 'polyethylene-openstax-overview',
    lineageId: 'openstax-organic-chemistry',
    supports: ['overview']
  }];
  article.maturity.contentMaturity = 'source_backed_draft';
  article.maturity.confidence = 'medium';
  attachReviewedFixtureStructure(copy, 'polyethylene-openstax-overview');
  assert.doesNotThrow(() => validateSnapshot(copy));

  const hiddenGaps = structuredClone(copy);
  hiddenGaps.polymers[0].maturity.reviewFlags = [];
  assert.throws(() => validateSnapshot(hiddenGaps), /must retain open_sources_needed|processing_data_needed/);

  const unsupported = structuredClone(copy);
  unsupported.polymers[0].sources[0].supports = ['processing'];
  assert.throws(() => validateSnapshot(unsupported), SnapshotValidationError);
});

test('history is required, allows explicit gaps, and requires mapped evidence when populated', () => {
  const missing = structuredClone(fixture);
  delete missing.polymers[0].sections.history;
  assert.throws(() => validateSnapshot(missing), /sections.history is required/);
  assert.doesNotThrow(() => validateSnapshot(structuredClone(fixture)));

  const copy = structuredClone(fixture);
  const article = copy.polymers[0];
  article.sections.history = 'A source-backed account of discovery and commercial development.';
  article.sources = [{ ...copy.methodology.sources[1], sourceId: 'fixture-history', supports: ['history'] }];
  article.maturity.contentMaturity = 'source_backed_draft';
  attachReviewedFixtureStructure(copy, 'fixture-history');
  assert.doesNotThrow(() => validateSnapshot(copy));
  article.sources[0].supports = ['structuralDepictions'];
  assert.throws(() => validateSnapshot(copy), /sections.history has prose but no source mapped/);
});

test('every published polymer has a history supported by anonymously accessible evidence', () => {
  for (const article of snapshot.polymers) {
    assert.ok(article.sections.history.trim(), `${article.wopId} needs history`);
    const sources = article.sources.filter(source => source.supports.includes('history'));
    assert.ok(sources.length, `${article.wopId} needs history evidence`);
    assert.ok(sources.every(source => source.accessStatus === 'anonymous_full_content'));
  }
});

test('each populated core attribute requires two documents and independent lineages', () => {
  for (const key of ['feedstocksAndSynthesis', 'mechanicalProperties', 'processing']) {
    const copy = structuredClone(fixture);
    const article = copy.polymers[0];
    article.sections[key] = `Independently written, source-mapped ${key} text.`;
    article.sources = [{
      ...copy.methodology.sources[1],
      sourceId: `${key.toLocaleLowerCase()}-one`,
      supports: [key]
    }];
    article.maturity.contentMaturity = 'source_backed_draft';
    article.maturity.confidence = 'medium';
    attachReviewedFixtureStructure(copy, `${key.toLocaleLowerCase()}-one`);
    assert.throws(() => validateSnapshot(copy), /two independent source lineages/);

    article.sources.push({
      ...copy.methodology.sources[2],
      sourceId: `${key.toLocaleLowerCase()}-two`,
      supports: [key]
    });
    assert.doesNotThrow(() => validateSnapshot(copy));
  }
});

test('NIST publication identifiers distinguish reports without counting tracking variants twice', () => {
  const copy = structuredClone(fixture);
  const article = copy.polymers[0];
  article.sections.mechanicalProperties = 'A source-backed example of film mechanics.';
  article.sources = [
    {
      ...copy.methodology.sources[1],
      sourceId: 'nist-report-one',
      lineageId: 'nist-study-one',
      url: 'https://tsapps.nist.gov/publication/get_pdf.cfm?pub_id=905225',
      supports: ['mechanicalProperties']
    },
    {
      ...copy.methodology.sources[2],
      sourceId: 'nist-report-two',
      lineageId: 'nist-study-two',
      url: 'https://tsapps.nist.gov/publication/get_pdf.cfm?pub_id=920744',
      supports: ['mechanicalProperties']
    }
  ];
  for (const source of article.sources) delete source.contentUrl;
  article.maturity.contentMaturity = 'source_backed_draft';
  attachReviewedFixtureStructure(copy, 'nist-report-one');

  assert.doesNotThrow(() => validateSnapshot(copy));

  // A fragment, a tracking parameter, and zero-padded ID do not make a new report.
  article.sources[1].url = 'https://tsapps.nist.gov/publication/get_pdf.cfm?utm_source=test&pub_id=000905225#page=2';
  assert.throws(() => validateSnapshot(copy), /same document URL|distinct source documents/);

  // Same lineage also cannot make two document occurrences from one report.
  article.sources[1].lineageId = article.sources[0].lineageId;
  assert.throws(() => validateSnapshot(copy), /two distinct source documents/);
});

test('open-source-reviewed maturity requires principal coverage and independent lineages', () => {
  const copy = structuredClone(fixture);
  const article = copy.polymers[0];
  const principal = [
    'overview',
    'feedstocksAndSynthesis',
    'mechanicalProperties',
    'processing',
    'applications',
    'limitationsAndVariability'
  ];
  for (const key of principal) article.sections[key] = `Independently written, source-mapped ${key} text.`;
  article.sources = [{
    ...copy.methodology.sources[1],
    sourceId: 'review-source-one',
    supports: principal
  }];
  article.maturity = {
    contentMaturity: 'open_source_reviewed',
    confidence: 'high',
    reviewFlags: ['end_of_life_review_needed', 'safety_review_needed']
  };
  attachReviewedFixtureStructure(copy, 'review-source-one');
  assert.throws(() => validateSnapshot(copy), /two independent source lineages/);

  article.sources.push({
    ...copy.methodology.sources[2],
    sourceId: 'review-source-two',
    supports: principal
  });
  assert.doesNotThrow(() => validateSnapshot(copy));

  article.sources[1].url = `${article.sources[0].url}?view=1`;
  delete article.sources[1].contentUrl;
  assert.throws(() => validateSnapshot(copy), /same document URL|distinct source documents/);
});

test('stubs cannot hide prose or unused article sources', () => {
  const prose = structuredClone(fixture);
  prose.polymers[0].sections.overview = 'Unsupported filler.';
  assert.throws(() => validateSnapshot(prose), /stub|no source mapped/);

  const unused = structuredClone(fixture);
  unused.polymers[0].sources = [{
    ...unused.methodology.sources[1],
    sourceId: 'unused-source',
    supports: ['overview']
  }];
  assert.throws(() => validateSnapshot(unused), /stub|empty section/);
});

test('the public boundary rejects private paths, prose URLs, closed access, and dangling relationships', () => {
  const cases = [
    (copy) => { copy.polymers[0].canonicalName = '/Users/private/polymer'; },
    (copy) => { copy.polymers[0].canonicalName = '/etc/passwd'; },
    (copy) => { copy.polymers[0].canonicalName = '../private-notes.md'; },
    (copy) => { copy.polymers[0].canonicalName = '%25252Froot%25252F.ssh%25252Fid_rsa'; },
    (copy) => { copy.polymers[0].canonicalName = 'workspace/secrets'; },
    (copy) => { copy.polymers[0].canonicalName = '.agents/private'; },
    (copy) => { copy.polymers[0].canonicalName = 'src/config.js'; },
    (copy) => { copy.polymers[0].canonicalName = '${HOME}/secrets.txt'; },
    (copy) => { copy.polymers[0].canonicalName = 'foo/bar.py'; },
    (copy) => {
      copy.polymers[0].maturity.contentMaturity = 'source_backed_draft';
      copy.polymers[0].sections.overview = 'See https://example.org instead of using a typed source.';
    },
    (copy) => {
      copy.polymers[0].maturity.contentMaturity = 'source_backed_draft';
      copy.polymers[0].sections.overview = 'See example.com/private instead of using a typed source.';
    },
    (copy) => { copy.methodology.sources[0].accessStatus = 'login_required'; },
    (copy) => { copy.methodology.sources[0].url = 'https://127.0.0.1/source'; },
    (copy) => { copy.polymers[0].relationships.push({ kind: 'related', wopId: 'wop-999999' }); }
  ];
  for (const mutate of cases) {
    const copy = structuredClone(fixture);
    mutate(copy);
    assert.throws(() => validateSnapshot(copy), SnapshotValidationError);
  }
});

test('alias collisions and duplicate canonical names fail validation', () => {
  const aliasCollision = structuredClone(fixture);
  aliasCollision.aliases.push({ slug: aliasCollision.polymers[0].canonicalSlug, wopId: aliasCollision.polymers[0].wopId });
  assert.throws(() => validateSnapshot(aliasCollision), /conflicts with a canonical slug/);

  const duplicate = structuredClone(snapshot);
  duplicate.polymers[1].canonicalName = duplicate.polymers[0].canonicalName;
  assert.throws(() => validateSnapshot(duplicate), /duplicate canonicalName/);
});

test('cross-record identity collisions require a complete ambiguous search term and no alias route', () => {
  const collision = structuredClone(snapshot);
  collision.polymers[1].abbreviations.push('PE');
  assert.throws(() => validateSnapshot(collision), /cross-record identity|ambiguous identity/);

  collision.searchTerms.push({
    term: 'PE',
    kind: 'ambiguous',
    wopIds: [collision.polymers[0].wopId, collision.polymers[1].wopId]
  });
  assert.throws(() => validateSnapshot(collision), /cannot have the alias route pe/);

  const punctuation = structuredClone(snapshot);
  punctuation.polymers[0].abbreviations.push('ZZ/Q');
  punctuation.polymers[1].abbreviations.push('ZZ-Q');
  punctuation.searchTerms.push({
    term: 'ZZ/Q',
    kind: 'ambiguous',
    wopIds: [punctuation.polymers[0].wopId, punctuation.polymers[1].wopId]
  });
  punctuation.aliases.push({ slug: 'zz-q', wopId: punctuation.polymers[0].wopId });
  assert.throws(() => validateSnapshot(punctuation), /cannot have the alias route zz-q/);
});

test('malformed collection shapes always produce SnapshotValidationError', () => {
  const mutations = [
    (copy) => { copy.polymers = {}; },
    (copy) => { copy.polymers[0].alternateNames = {}; },
    (copy) => { copy.polymers[0].abbreviations = 7; },
    (copy) => { copy.polymers[0].relationships = {}; },
    (copy) => { copy.polymers[0].maturity.reviewFlags = 7; }
  ];
  for (const mutate of mutations) {
    const copy = structuredClone(fixture);
    mutate(copy);
    assert.throws(() => validateSnapshot(copy), SnapshotValidationError);
  }
});

test('source URLs must be credential-free public HTTPS locations', () => {
  assert.equal(isPublicSourceUrl('https://openstax.org/books/organic-chemistry'), true);
  for (const value of [
    'http://example.org/source',
    'https://user:pass@example.org/source',
    'https://example.org/source?password=hunter2',
    'https://example.org/source?api_key=sk-secret',
    'https://example.org/source#access_token=secret',
    'https://localhost/source',
    'https://10.0.0.1/source',
    'file:///private/source.pdf',
    'https://example.invalid/source'
  ]) assert.equal(isPublicSourceUrl(value), false, value);
});

test('a DOI is allowed only in its typed source field', () => {
  const copy = structuredClone(fixture);
  copy.methodology.sources[0].doi = '10.1351/PAC-REC-08-01-30';
  assert.doesNotThrow(() => validateSnapshot(copy));

  copy.methodology.sources[0].doi = 'https://doi.org/10.1351/PAC-REC-08-01-30';
  assert.throws(() => validateSnapshot(copy), /bare DOI/);

  copy.methodology.sources[0].doi = '10.1234/file:///Users/private/secret.pdf';
  assert.throws(() => validateSnapshot(copy), /bare DOI/);
});
