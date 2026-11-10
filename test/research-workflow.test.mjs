import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { prepareProposal, candidateForProposal, requestToPatch, reviewProposal, verifyReview, publishProposal, researchHash } from '../lib/research-workflow.mjs';
import { importSnapshot } from '../lib/importer.mjs';
import { buildSite } from '../lib/site.mjs';

const fixtureDirectory = path.resolve('fixtures/wop-publication-snapshot-v2');
const snapshot = JSON.parse(await fs.readFile(path.join(fixtureDirectory, 'snapshot.json'), 'utf8'));
const request = {
  schema: 'wop-research-request-v1', wopId: snapshot.polymers[0].wopId, section: 'mechanicalProperties',
  question: 'Which measured tensile results are available for a specified grade?',
  scope: 'An explicitly identified grade and tensile specimen.',
  acceptanceCriteria: 'Record an accessible source, measurement, test method and material limitations.'
};
const proposal = () => prepareProposal(snapshot, requestToPatch(snapshot, request), { author: 'researcher', proposalId: 'pilot-question', date: '2026-09-25' });
const approval = value => reviewProposal(snapshot, value, { reviewer: 'reviewer', decision: 'approve', note: 'The question is scoped and contains no unsupported scientific assertion.', date: '2026-09-25' });

test('a reader request becomes a bounded question without modifying other records or publishing private identities', () => {
  const p = proposal();
  const candidate = verifyReview(snapshot, p, approval(p));
  const article = candidate.polymers[0];
  assert.equal(article.research.questions[0].status, 'open');
  assert.deepEqual(article.sections, snapshot.polymers[0].sections);
  assert.deepEqual(article.sources, snapshot.polymers[0].sources);
  assert.equal(article.research.history.length, 1);
  assert.equal(JSON.stringify(candidate).includes('researcher'), false);
  assert.equal(JSON.stringify(candidate).includes('reviewer'), false);
  assert.throws(() => requestToPatch(candidate, request), /already tracked/);
  assert.throws(() => requestToPatch(snapshot, { ...request, question: 'Read /Users/private/notes.txt' }) &&
    prepareProposal(snapshot, requestToPatch(snapshot, { ...request, question: 'Read /Users/private/notes.txt' }), { author: 'researcher' }), /private/);
});

test('stale, rejected, same-author and modified proposals cannot use an approval', () => {
  const p = proposal();
  const approved = approval(p);
  assert.throws(() => reviewProposal(snapshot, p, { reviewer: ' RESEARCHER ', decision: 'approve', note: 'Self review' }), /Independent/);
  const changed = structuredClone(p); changed.summary = 'Changed after review';
  assert.throws(() => verifyReview(snapshot, changed, approved), /exact proposal/);
  const newer = structuredClone(snapshot); newer.methodology.scope += ' More scope.';
  assert.throws(() => verifyReview(newer, p, approved), /Snapshot changed/);
  const rejected = reviewProposal(snapshot, p, { reviewer: 'reviewer', decision: 'request_changes', note: 'Narrow the question first.' });
  assert.throws(() => verifyReview(snapshot, p, rejected), /approving independent review/);
  assert.throws(() => verifyReview(snapshot, p, { ...approved, candidateHash: '0'.repeat(64) }), /exact proposal/);
  assert.throws(() => reviewProposal(snapshot, p, { reviewer: 'reviewer', decision: 'approve', note: 'Reviewed.', date: 'garbage' }), /Review date/);
  assert.throws(() => reviewProposal(snapshot, p, { reviewer: 'reviewer', decision: 'approve', note: 'Reviewed.', date: '2026-09-24' }), /Review date/);
  const published = candidateForProposal(snapshot, p);
  assert.throws(() => prepareProposal(published, { summary: 'New request', changes: [{ wopId: request.wopId, questions: [] }] },
    { author: 'researcher', proposalId: p.proposalId }), /already been published/);
});

test('research attempts and question scope survive later patches', () => {
  const p = proposal();
  const first = candidateForProposal(snapshot, p);
  const question = first.polymers[0].research.questions[0];
  question.attempts.push({ date: '2026-09-25', summary: 'A bounded search did not establish a qualifying measured endpoint.', sourceIds: [] });
  const changed = { ...structuredClone(question), attempts: [] };
  const patch = { summary: 'Update question status.', changes: [{ wopId: request.wopId, questions: [changed] }] };
  assert.throws(() => prepareProposal(first, patch, { author: 'researcher' }), /prior research attempts/);
  changed.attempts = question.attempts;
  changed.scope = 'All grades';
  assert.throws(() => prepareProposal(first, patch, { author: 'researcher' }), /preserve the question/);
});

test('a no-evidence disposition preserves the empty scientific section and can be reopened', () => {
  const first = candidateForProposal(snapshot, proposal());
  const question = structuredClone(first.polymers[0].research.questions[0]);
  question.status = 'no_eligible_evidence';
  question.attempts.push({ date: '2026-09-25', summary: 'The scoped search found metadata only; no anonymous full content was established.', sourceIds: [] });
  question.resolution = { date: '2026-09-25', summary: 'No eligible evidence in this attempt; the material question remains unresolved.', sourceIds: [], evidenceIds: [] };
  const close = prepareProposal(first, { summary: 'Record the bounded search outcome.', changes: [{ wopId: request.wopId, questions: [question] }] }, { author: 'researcher' });
  const closed = candidateForProposal(first, close);
  assert.equal(closed.polymers[0].sections.mechanicalProperties, '');
  question.status = 'open'; delete question.resolution;
  const reopen = prepareProposal(closed, { summary: 'Reopen for newly available source evidence.', changes: [{ wopId: request.wopId, questions: [question] }] }, { author: 'researcher' });
  const reopened = candidateForProposal(closed, reopen).polymers[0];
  assert.equal(reopened.research.history.length, 3);
  assert.equal(reopened.research.questions[0].previousResolutions[0].status, 'no_eligible_evidence');
  assert.equal(reopened.research.questions[0].previousResolutions[0].summary, closed.polymers[0].research.questions[0].resolution.summary);
});

async function storage(t) {
  const root = await fs.mkdtemp(path.join(os.tmpdir(), 'wop-research-test-'));
  t.after(() => fs.rm(root, { recursive: true, force: true }));
  const snapshotDirectory = path.join(root, 'wop-publication-snapshot-v2');
  await importSnapshot(fixtureDirectory, snapshotDirectory);
  const outputDirectory = path.join(root, 'site');
  await buildSite(snapshot, outputDirectory, { allowExternal: true });
  return { snapshotDirectory, outputDirectory };
}

test('reviewed publication builds first and atomically publishes the candidate plus question history', async t => {
  const paths = await storage(t);
  const p = proposal();
  const result = await publishProposal({ ...paths, proposal: p, review: approval(p) }, {
    builder: (candidate, output, options) => buildSite(candidate, output, { ...options, allowExternal: true })
  });
  assert.deepEqual(result.articles, [request.wopId]);
  const published = JSON.parse(await fs.readFile(path.join(paths.snapshotDirectory, 'snapshot.json'), 'utf8'));
  const built = JSON.parse(await fs.readFile(path.join(paths.outputDirectory, 'data/wop-publication-snapshot-v2/snapshot.json'), 'utf8'));
  assert.equal(researchHash(published), researchHash(built));
  assert.equal(published.polymers[0].research.questions.length, 1);
  await assert.rejects(publishProposal({ ...paths, proposal: p, review: approval(p) }), /Snapshot changed/);
});

test('failed build or post-import site swap retains the prior snapshot bytes and site', async t => {
  const paths = await storage(t);
  const original = await fs.readFile(path.join(paths.snapshotDirectory, 'snapshot.json'), 'utf8');
  const html = await fs.readFile(path.join(paths.outputDirectory, 'index.html'), 'utf8');
  for (const afterImport of [false, true]) {
    const p = proposal();
    await assert.rejects(publishProposal({ ...paths, proposal: p, review: approval(p) }, {
      builder: async (_candidate, _output, { beforePublish }) => {
        if (afterImport) await beforePublish();
        throw new Error('Injected build or swap failure');
      }
    }), /Injected/);
    assert.equal(await fs.readFile(path.join(paths.snapshotDirectory, 'snapshot.json'), 'utf8'), original);
    assert.equal(await fs.readFile(path.join(paths.outputDirectory, 'index.html'), 'utf8'), html);
  }
});

test('an edit made during rendering cancels publication without overwriting it', async t => {
  const paths = await storage(t);
  const p = proposal();
  const originalPath = path.join(paths.snapshotDirectory, 'snapshot.json');
  const concurrent = `${await fs.readFile(originalPath, 'utf8')}\n`;
  await assert.rejects(publishProposal({ ...paths, proposal: p, review: approval(p) }, {
    builder: async (_candidate, _output, { beforePublish }) => {
      await fs.writeFile(originalPath, concurrent);
      await beforePublish();
    }
  }), /Snapshot changed while building/);
  assert.equal(await fs.readFile(originalPath, 'utf8'), concurrent);
});
