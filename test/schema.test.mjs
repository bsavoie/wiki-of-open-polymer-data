import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import path from 'node:path';
import test from 'node:test';
import { readAndValidateSnapshot } from '../lib/importer.mjs';
import {
  PRIMARY_CLASSES,
  SECTION_KEYS,
  SnapshotValidationError,
  validateSnapshot
} from '../lib/schema.mjs';
import { isPublicSourceUrl } from '../lib/source-policy.mjs';

const publicDirectory = path.resolve('public-data/wop-publication-snapshot-v1');
const fixtureDirectory = path.resolve('fixtures/wop-publication-snapshot-v1');
const snapshot = await readAndValidateSnapshot(publicDirectory);
const fixture = await readAndValidateSnapshot(fixtureDirectory);

test('the public denominator retains at least the 250 stable seed identifiers', () => {
  assert.ok(snapshot.polymers.length >= 250);
  const ids = new Set(snapshot.polymers.map((entry) => entry.wopId));
  for (let index = 1; index <= 250; index += 1) {
    assert.ok(ids.has(`wop-${String(index).padStart(6, '0')}`));
  }
  for (const entry of snapshot.polymers) assert.equal(entry.type, 'polymer_entry');
});

test('records that remain stubs expose no prose or article sources', () => {
  const stubs = snapshot.polymers.filter((entry) => entry.maturity.contentMaturity === 'stub');
  assert.ok(stubs.length > 0, 'the evolving public snapshot should retain at least one research stub');
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
  assert.doesNotThrow(() => validateSnapshot(copy));

  const hiddenGaps = structuredClone(copy);
  hiddenGaps.polymers[0].maturity.reviewFlags = [];
  assert.throws(() => validateSnapshot(hiddenGaps), /must retain open_sources_needed|processing_data_needed/);

  const unsupported = structuredClone(copy);
  unsupported.polymers[0].sources[0].supports = ['processing'];
  assert.throws(() => validateSnapshot(unsupported), SnapshotValidationError);
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
    assert.throws(() => validateSnapshot(copy), /two independent source lineages/);

    article.sources.push({
      ...copy.methodology.sources[2],
      sourceId: `${key.toLocaleLowerCase()}-two`,
      supports: [key]
    });
    assert.doesNotThrow(() => validateSnapshot(copy));
  }
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
