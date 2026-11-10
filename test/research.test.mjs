import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import test from 'node:test';
import { SECTION_KEYS, validateSnapshot } from '../lib/schema.mjs';
import { getSectionStatus, sectionContentHash, summarizeResearch, validateResearch } from '../lib/research.mjs';

const snapshot = JSON.parse(await fs.readFile('public-data/wop-publication-snapshot-v2/snapshot.json', 'utf8'));

function articleFixture() {
  const article = structuredClone(snapshot.polymers.find(item => item.sections.mechanicalProperties.trim()));
  const sourceId = article.sources.find(source => source.supports.includes('mechanicalProperties')).sourceId;
  article.evidence = [{
    evidenceId: 'fixture-measurement', section: 'mechanicalProperties', kind: 'measurement',
    attribute: 'Tensile strength', material: 'Named fixture grade and specimen',
    value: { min: 30, max: 35, units: 'MPa' }, conditions: 'Dry specimens; room temperature',
    method: 'Reported tensile method', sourceId, locator: 'Table 2',
    limitations: 'Test fixture only; no family-wide interpretation.'
  }];
  article.research = {
    questions: [{
      questionId: 'fixture-strength', section: 'mechanicalProperties',
      question: 'Which tensile interval is reported for the named specimen?', scope: 'One named grade',
      priority: 'normal', status: 'open', acceptanceCriteria: 'Record the range with method and conditions.', attempts: []
    }], sectionReviews: [], history: []
  };
  return article;
}

function errorsFor(article) {
  const errors = [];
  validateResearch(article, 'fixture', errors, SECTION_KEYS);
  return errors;
}

function closeQuestion(article, status = 'resolved') {
  const question = article.research.questions[0];
  question.status = status;
  question.attempts = [{ date: '2026-09-25', summary: 'Examined the cited table and specimen method.', sourceIds: [article.evidence[0].sourceId] }];
  question.resolution = {
    date: '2026-09-25', summary: 'Recorded the qualified interval.',
    sourceIds: [article.evidence[0].sourceId], evidenceIds: ['fixture-measurement']
  };
}

test('existing snapshots accept absent research fields and the extension validates through the snapshot schema', () => {
  assert.doesNotThrow(() => validateSnapshot(snapshot));
  const article = articleFixture();
  assert.deepEqual(errorsFor(article), []);
  const extended = structuredClone(snapshot);
  extended.polymers[extended.polymers.findIndex(item => item.wopId === article.wopId)] = article;
  assert.doesNotThrow(() => validateSnapshot(extended));
});

test('quantitative evidence rejects malformed numbers, scope, units, duplicates and unknown shape', () => {
  const changes = [
    a => { a.evidence = {}; },
    a => { a.evidence[0] = null; },
    a => { a.evidence[0].value.min = Infinity; },
    a => { a.evidence[0].value.max = '35'; },
    a => { a.evidence[0].value.min = 36; },
    a => { a.evidence[0].value.units = ''; },
    a => { a.evidence[0].value.uncertainty = 2; },
    a => { a.evidence[0].value.uncertainty = -1; a.evidence[0].value.uncertaintyNote = 'Standard deviation'; },
    a => { a.evidence[0].material = ''; },
    a => { a.evidence[0].kind = 'operating_window'; },
    a => { a.evidence[0].section = 'overview'; },
    a => { a.evidence[0].sourceId = 'missing'; },
    a => { a.sources.find(source => source.sourceId === a.evidence[0].sourceId).supports = ['overview']; },
    a => { a.sections.mechanicalProperties = ''; },
    a => { a.evidence.push(structuredClone(a.evidence[0])); },
    a => { a.evidence[0].value.average = 32; }
  ];
  changes.forEach((change, index) => {
    const article = articleFixture(); change(article);
    assert.ok(errorsFor(article).length, `malformed evidence case ${index} must fail`);
  });
});

test('point estimates with explained uncertainty and qualified processing windows are valid', () => {
  const article = articleFixture();
  article.evidence[0].value = { min: 32, max: 32, units: 'MPa', uncertainty: 2, uncertaintyNote: 'One standard deviation across five specimens.' };
  article.evidence.push({ ...article.evidence[0], evidenceId: 'fixture-window', section: 'processing', kind: 'operating_window', attribute: 'Melt temperature', value: { min: 200, max: 220, units: '°C' }, sourceId: article.sources.find(source => source.supports.includes('processing')).sourceId });
  assert.deepEqual(errorsFor(article), []);
});

test('question closure requires research attempts and section-matched evidence sources', () => {
  const article = articleFixture(); closeQuestion(article);
  assert.deepEqual(errorsFor(article), []);
  const changes = [
    a => { a.research.questions[0].attempts = []; },
    a => { delete a.research.questions[0].resolution; },
    a => { a.research.questions[0].resolution.sourceIds = []; },
    a => { a.research.questions[0].resolution.sourceIds = { includes: 'malformed' }; },
    a => { a.research.questions[0].resolution.evidenceIds = ['missing']; },
    a => { a.research.questions[0].resolution.sourceIds = ['missing']; },
    a => { a.research.questions[0].section = 'history'; },
    a => { a.research.questions[0].status = 'open'; },
    a => { a.research.questions[0].attempts[0].date = '2026-02-30'; },
    a => { a.research.questions[0].resolution.date = 'not-a-date'; },
    a => { a.research.questions.push(structuredClone(a.research.questions[0])); }
  ];
  changes.forEach((change, index) => {
    const changed = structuredClone(article); change(changed);
    assert.ok(errorsFor(changed).length, `invalid closure case ${index} must fail`);
  });
});

test('unsuccessful searches can close without inventing eligible sources or measurements', () => {
  const article = articleFixture(); closeQuestion(article, 'no_eligible_evidence');
  article.research.questions[0].attempts[0].sourceIds = [];
  article.research.questions[0].resolution.sourceIds = [];
  article.research.questions[0].resolution.evidenceIds = [];
  article.research.questions[0].resolution.summary = 'No eligible measurements found in the bounded search.';
  assert.deepEqual(errorsFor(article), []);
});

test('research history validates question links, dates, sections and strict shape', () => {
  const article = articleFixture();
  article.research.history = [{ changeId: 'fixture-change', date: '2026-09-25', summary: 'Added a scoped research question.', sections: ['mechanicalProperties'], questionIds: ['fixture-strength'] }];
  assert.deepEqual(errorsFor(article), []);
  for (const change of [
    a => { a.research.history[0].questionIds = ['missing']; },
    a => { a.research.history[0].sections = []; },
    a => { a.research.history[0].date = '2026-13-01'; },
    a => { a.research.history[0].reviewer = 'Unpermitted identity'; },
    a => { a.research.history.push(structuredClone(a.research.history[0])); }
  ]) {
    const changed = structuredClone(article); change(changed);
    assert.ok(errorsFor(changed).length);
  }
});

test('section reviews become stale after prose, evidence, or supporting source changes', () => {
  const article = articleFixture();
  article.research.sectionReviews = [{ section: 'mechanicalProperties', reviewedDate: '2026-09-25', summary: 'Checked specimen scope and source table.', contentHash: sectionContentHash(article, 'mechanicalProperties') }];
  assert.equal(getSectionStatus(article, 'mechanicalProperties').reviewStatus, 'reviewed');
  assert.deepEqual(errorsFor(article), []);
  for (const change of [
    a => { a.sections.mechanicalProperties += ' Additional qualified prose.'; },
    a => { a.evidence[0].value.max += 1; },
    a => { a.sources.find(source => source.sourceId === a.evidence[0].sourceId).locator += ', Table 3'; }
  ]) {
    const changed = structuredClone(article); change(changed);
    assert.equal(getSectionStatus(changed, 'mechanicalProperties').reviewStatus, 'stale');
    assert.deepEqual(errorsFor(changed), [], 'stale reviews remain valid history');
  }
  article.research.questions[0].priority = 'high';
  article.sections.history += ' Independent history prose.';
  assert.equal(getSectionStatus(article, 'mechanicalProperties').reviewStatus, 'reviewed');
});

test('hashing is independent of object-key and source record order, but includes synthesis routes', () => {
  const article = articleFixture();
  const changed = structuredClone(article);
  changed.sources.reverse();
  changed.evidence[0] = Object.fromEntries(Object.entries(changed.evidence[0]).reverse());
  assert.equal(sectionContentHash(article, 'mechanicalProperties'), sectionContentHash(changed, 'mechanicalProperties'));
  const before = sectionContentHash(article, 'feedstocksAndSynthesis');
  article.synthesisRoutes = [{ routeId: 'hash-fixture', summary: 'Changed route content' }];
  assert.notEqual(sectionContentHash(article, 'feedstocksAndSynthesis'), before);
});

test('reviews reject malformed digests, duplicate sections and empty prose', () => {
  const article = articleFixture();
  const review = { section: 'mechanicalProperties', reviewedDate: '2026-09-25', summary: 'Review fixture.', contentHash: sectionContentHash(article, 'mechanicalProperties') };
  article.research.sectionReviews = [review];
  for (const change of [
    a => { a.research.sectionReviews[0].contentHash = 'invalid'; },
    a => { a.research.sectionReviews[0].reviewedDate = '2026-02-30'; },
    a => { a.research.sectionReviews.push(structuredClone(review)); },
    a => { a.sections.mechanicalProperties = ''; }
  ]) {
    const changed = structuredClone(article); change(changed);
    assert.ok(errorsFor(changed).length);
  }
});

test('research and evidence reject URLs and private paths outside typed sources', () => {
  for (const value of ['https://example.org/paper', '/Users/example/private/notes.txt', 'file:///tmp/notes']) {
    const article = articleFixture(); article.research.questions[0].scope = value;
    assert.ok(errorsFor(article).some(error => /private|URL/.test(error)));
    article.research.questions[0].scope = 'Named specimen'; article.evidence[0].locator = value;
    assert.ok(errorsFor(article).some(error => /private|URL/.test(error)));
  }
});

test('research summaries count unresolved work and distinguish evidence and review from prose', () => {
  const article = articleFixture();
  article.research.sectionReviews = [{ section: 'mechanicalProperties', reviewedDate: '2026-09-25', summary: 'Fixture review.', contentHash: sectionContentHash(article, 'mechanicalProperties') }];
  const summary = summarizeResearch({ polymers: [article] });
  assert.equal(summary.articleCount, 1);
  assert.equal(summary.openQuestionCount, 1);
  assert.equal(summary.questionCounts.open, 1);
  assert.equal(summary.evidenceCount, 1);
  assert.equal(summary.reviewedSectionCount, 1);
  assert.equal(summary.staleSectionCount, 0);
  assert.equal(summary.populatedSectionCount, Object.values(article.sections).filter(value => value.trim()).length);
  article.sections.mechanicalProperties += ' Changed prose.';
  closeQuestion(article);
  const after = summarizeResearch({ polymers: [article] });
  assert.equal(after.openQuestionCount, 0);
  assert.equal(after.questionCounts.resolved, 1);
  assert.equal(after.reviewedSectionCount, 0);
  assert.equal(after.staleSectionCount, 1);
});

test('reopened questions preserve valid prior outcomes without treating them as current closure', () => {
  const article = articleFixture(); closeQuestion(article);
  const question = article.research.questions[0];
  question.previousResolutions = [{ status: question.status, ...structuredClone(question.resolution) }];
  question.status = 'in_progress';
  delete question.resolution;
  question.attempts.push({ date: '2026-09-26', summary: 'Expanded the search after a new lead.', sourceIds: [] });
  assert.deepEqual(errorsFor(article), []);
  assert.equal(summarizeResearch({ polymers: [article] }).openQuestionCount, 1);
  for (const change of [
    q => { q.previousResolutions = {}; },
    q => { q.previousResolutions[0] = null; },
    q => { q.previousResolutions[0].status = 'open'; },
    q => { q.previousResolutions[0].date = '2026-02-30'; },
    q => { q.previousResolutions[0].sourceIds = []; },
    q => { q.previousResolutions[0].sourceIds = ['missing']; },
    q => { q.previousResolutions[0].evidenceIds = ['missing']; },
    q => { q.previousResolutions[0].reviewer = 'Unpermitted identity'; },
    q => { q.previousResolutions[0].summary = '/Users/example/private/review.txt'; },
    q => { q.previousResolutions[0].date = '2026-09-24'; },
    q => { q.attempts = []; }
  ]) {
    const changed = structuredClone(article); change(changed.research.questions[0]);
    assert.ok(errorsFor(changed).length);
  }
});

test('resolution chronology preserves ordered outcomes and requires closure after attempts', () => {
  const article = articleFixture(); closeQuestion(article);
  const question = article.research.questions[0];
  question.previousResolutions = [{ status: 'no_eligible_evidence', date: '2026-09-25', summary: 'Earlier bounded search found no eligible evidence.', sourceIds: [], evidenceIds: [] }];
  question.attempts.push({ date: '2026-09-26', summary: 'Examined a newly accessible source.', sourceIds: [article.evidence[0].sourceId] });
  question.resolution.date = '2026-09-26';
  assert.deepEqual(errorsFor(article), []);
  const beforeAttempt = structuredClone(article);
  beforeAttempt.research.questions[0].resolution.date = '2026-09-25';
  assert.ok(errorsFor(beforeAttempt).some(error => error.includes('must not precede research attempts')));
  const backwards = structuredClone(article);
  backwards.research.questions[0].previousResolutions.unshift({ ...question.previousResolutions[0], date: '2026-09-26' });
  assert.ok(errorsFor(backwards).some(error => error.includes('must be ordered by date')));
  const beforePrior = structuredClone(article);
  beforePrior.research.questions[0].previousResolutions[0].date = '2026-09-27';
  assert.ok(errorsFor(beforePrior).some(error => error.includes('must not precede previous resolutions')));
});
