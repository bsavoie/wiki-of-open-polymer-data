import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { prepareProposal, candidateForProposal, requestToPatch, reviewProposal, verifyReview, publishProposal, researchHash, researchHistoryDirectory } from '../lib/research-workflow.mjs';
import { importSnapshot, SNAPSHOT_IMPORT_LOCK } from '../lib/importer.mjs';
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

test('canonical research publication always selects the historical archive', () => {
  const canonical = path.resolve('public-data/wop-publication-snapshot-v2');
  const history = path.resolve('public-data/structure-history/2026-11-10');
  assert.equal(researchHistoryDirectory(canonical), history);
  assert.equal(researchHistoryDirectory(canonical, null), history);
  assert.equal(researchHistoryDirectory(canonical, '/unrelated/history'), history);
  assert.equal(researchHistoryDirectory(fixtureDirectory), null);
  assert.equal(researchHistoryDirectory(fixtureDirectory, '/disposable/history'), '/disposable/history');
});

test('a symlinked canonical snapshot parent still selects the historical archive', async t => {
  const root = await fs.mkdtemp(path.join(os.tmpdir(), 'wop-history-parent-'));
  t.after(() => fs.rm(root, { recursive: true, force: true }));
  const alias = path.join(root, 'public-data-alias');
  await fs.symlink(path.resolve('public-data'), alias, 'dir');
  assert.equal(
    researchHistoryDirectory(path.join(alias, 'wop-publication-snapshot-v2')),
    path.resolve('public-data/structure-history/2026-11-10')
  );
});

test('research publication forwards its selected archive to the staged builder', async t => {
  const paths = await storage(t);
  const p = proposal();
  const historyDirectory = path.join(path.dirname(paths.outputDirectory), 'history');
  let actual;
  await assert.rejects(publishProposal({ ...paths, proposal: p, review: approval(p), historyDirectory }, {
    builder: async (_candidate, _output, options) => {
      actual = options.historyDirectory;
      throw new Error('Stopped before publication');
    }
  }), /Stopped before publication/);
  assert.equal(actual, historyDirectory);
});

test('invalid research history archive leaves prior snapshot and site intact', async t => {
  const paths = await storage(t);
  const originalSnapshot = await fs.readFile(path.join(paths.snapshotDirectory, 'snapshot.json'));
  const originalSite = await fs.readFile(path.join(paths.outputDirectory, 'index.html'));
  const historyDirectory = path.join(path.dirname(paths.outputDirectory), 'corrupt-history');
  await fs.cp(path.resolve('public-data/structure-history/2026-11-10'), historyDirectory, { recursive: true });
  await fs.appendFile(path.join(historyDirectory, 'historical-structures.zip'), 'invalid');
  const p = proposal();
  await assert.rejects(publishProposal({ ...paths, proposal: p, review: approval(p), historyDirectory }, {
    builder: (candidate, output, options) => buildSite(candidate, output, { ...options, allowExternal: true })
  }), /historical structure archive or digest/i);
  assert.deepEqual(await fs.readFile(path.join(paths.snapshotDirectory, 'snapshot.json')), originalSnapshot);
  assert.deepEqual(await fs.readFile(path.join(paths.outputDirectory, 'index.html')), originalSite);
});

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

test('output-lock cleanup failure after a successful swap does not roll back the published snapshot', async t => {
  const paths = await storage(t);
  const p = proposal();
  const lockPath = path.join(await fs.realpath(path.dirname(paths.outputDirectory)), `.${path.basename(paths.outputDirectory)}.wop-build.lock`);
  const unlink = fs.unlink;
  const warn = console.warn;
  const warnings = [];
  fs.unlink = async (file, ...args) => {
    if (file === lockPath) throw Object.assign(new Error('Injected lock cleanup failure'), { code: 'EACCES' });
    return unlink(file, ...args);
  };
  console.warn = message => warnings.push(message);
  let result;
  try {
    result = await publishProposal({ ...paths, proposal: p, review: approval(p) }, {
      builder: (candidate, output, options) => buildSite(candidate, output, { ...options, allowExternal: true })
    });
  } finally {
    fs.unlink = unlink;
    console.warn = warn;
  }
  const published = JSON.parse(await fs.readFile(path.join(paths.snapshotDirectory, 'snapshot.json'), 'utf8'));
  const built = JSON.parse(await fs.readFile(path.join(paths.outputDirectory, 'data/wop-publication-snapshot-v2/snapshot.json'), 'utf8'));
  assert.equal(result.proposalId, p.proposalId);
  assert.equal(researchHash(published), researchHash(built));
  assert.equal(published.polymers[0].research.questions.length, 1);
  assert.match(warnings.join('\n'), /output-lock cleanup was incomplete/);
  assert.ok((await fs.lstat(lockPath)).isFile());
});

for (const lockKind of ['snapshot import', 'research publication']) {
  test(`${lockKind} lock cleanup failure preserves a successful snapshot/site publication`, async t => {
    const paths = await storage(t);
    const p = proposal();
    const parent = lockKind === 'snapshot import'
      ? await fs.realpath(path.dirname(paths.snapshotDirectory)) : path.dirname(paths.snapshotDirectory);
    const lockPath = path.join(parent, lockKind === 'snapshot import' ? SNAPSHOT_IMPORT_LOCK : '.wop-research-publication.lock');
    const unlink = fs.unlink, warn = console.warn, warnings = [];
    fs.unlink = async (file, ...args) => {
      if (file === lockPath) throw Object.assign(new Error('Injected lock cleanup failure'), { code: 'EACCES' });
      return unlink(file, ...args);
    };
    console.warn = message => warnings.push(message);
    let result;
    try {
      result = await publishProposal({ ...paths, proposal: p, review: approval(p) }, {
        builder: (candidate, output, options) => buildSite(candidate, output, { ...options, allowExternal: true })
      });
    } finally {
      fs.unlink = unlink;
      console.warn = warn;
    }
    const published = JSON.parse(await fs.readFile(path.join(paths.snapshotDirectory, 'snapshot.json'), 'utf8'));
    const built = JSON.parse(await fs.readFile(path.join(paths.outputDirectory, 'data/wop-publication-snapshot-v2/snapshot.json'), 'utf8'));
    assert.equal(result.proposalId, p.proposalId);
    assert.equal(researchHash(published), researchHash(built));
    assert.equal(published.polymers[0].research.questions.length, 1);
    assert.match(warnings.join('\n'), /lock cleanup was incomplete/);
    assert.ok((await fs.lstat(lockPath)).isFile());
  });
}

test('research lock cleanup failure preserves an earlier publication error and prior data', async t => {
  const paths = await storage(t), p = proposal();
  const original = await fs.readFile(path.join(paths.snapshotDirectory, 'snapshot.json'));
  const html = await fs.readFile(path.join(paths.outputDirectory, 'index.html'));
  const lockPath = path.join(path.dirname(paths.snapshotDirectory), '.wop-research-publication.lock');
  const unlink = fs.unlink, warn = console.warn, warnings = [];
  fs.unlink = async (file, ...args) => {
    if (file === lockPath) throw Object.assign(new Error('Injected lock cleanup failure'), { code: 'EACCES' });
    return unlink(file, ...args);
  };
  console.warn = message => warnings.push(message);
  try {
    await assert.rejects(publishProposal({ ...paths, proposal: p, review: approval(p) }, {
      builder: async () => { throw new Error('Injected publication failure'); }
    }), /Injected publication failure/);
  } finally {
    fs.unlink = unlink;
    console.warn = warn;
  }
  assert.deepEqual(await fs.readFile(path.join(paths.snapshotDirectory, 'snapshot.json')), original);
  assert.deepEqual(await fs.readFile(path.join(paths.outputDirectory, 'index.html')), html);
  assert.match(warnings.join('\n'), /Research publication lock cleanup was incomplete/);
});

test('research publication does not remove a replaced lock', async t => {
  const paths = await storage(t), p = proposal();
  const lockPath = path.join(path.dirname(paths.snapshotDirectory), '.wop-research-publication.lock');
  const warn = console.warn, warnings = [];
  console.warn = message => warnings.push(message);
  try {
    await assert.rejects(publishProposal({ ...paths, proposal: p, review: approval(p) }, {
      builder: async () => {
        await fs.unlink(lockPath);
        await fs.writeFile(lockPath, 'replacement lock');
        throw new Error('Injected publication failure');
      }
    }), /Injected publication failure/);
  } finally {
    console.warn = warn;
  }
  assert.equal(await fs.readFile(lockPath, 'utf8'), 'replacement lock');
  assert.match(warnings.join('\n'), /Research publication lock cleanup was incomplete/);
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

test('research publication holds the import lock between its snapshot import and site swap', async t => {
  const paths = await storage(t), p = proposal();
  const competingSource = path.join(path.dirname(paths.snapshotDirectory), 'competing-source');
  await fs.mkdir(competingSource);
  const competing = candidateForProposal(snapshot, p);
  competing.methodology.scope += ' Additional independent import.';
  await fs.writeFile(path.join(competingSource, 'snapshot.json'), JSON.stringify(competing));
  const rename = fs.rename;
  let attempted = false;
  fs.rename = async (source, destination, ...args) => {
    if (!attempted && source === paths.outputDirectory) {
      attempted = true;
      await assert.rejects(importSnapshot(competingSource, paths.snapshotDirectory), /Another snapshot import holds the lock/);
    }
    return rename(source, destination, ...args);
  };
  try {
    await publishProposal({ ...paths, proposal: p, review: approval(p) }, {
      builder: (candidate, output, options) => buildSite(candidate, output, { ...options, allowExternal: true })
    });
  } finally {
    fs.rename = rename;
  }
  assert.equal(attempted, true);
  const published = JSON.parse(await fs.readFile(path.join(paths.snapshotDirectory, 'snapshot.json'), 'utf8'));
  const built = JSON.parse(await fs.readFile(path.join(paths.outputDirectory, 'data/wop-publication-snapshot-v2/snapshot.json'), 'utf8'));
  assert.equal(researchHash(published), researchHash(built));
  await importSnapshot(competingSource, paths.snapshotDirectory);
});

test('research publication retains its import lock through snapshot rollback', async t => {
  const paths = await storage(t), p = proposal();
  const original = await fs.readFile(path.join(paths.snapshotDirectory, 'snapshot.json'));
  const html = await fs.readFile(path.join(paths.outputDirectory, 'index.html'));
  await assert.rejects(publishProposal({ ...paths, proposal: p, review: approval(p) }, {
    builder: async (_candidate, _output, { beforePublish }) => {
      await beforePublish();
      await assert.rejects(importSnapshot(fixtureDirectory, paths.snapshotDirectory), /Another snapshot import holds the lock/);
      throw new Error('Injected site swap failure');
    }
  }), /Injected site swap failure/);
  assert.deepEqual(await fs.readFile(path.join(paths.snapshotDirectory, 'snapshot.json')), original);
  assert.deepEqual(await fs.readFile(path.join(paths.outputDirectory, 'index.html')), html);
  await importSnapshot(fixtureDirectory, paths.snapshotDirectory);
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
