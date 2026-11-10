import fs from 'node:fs/promises';
import path from 'node:path';
import { createHash, randomUUID } from 'node:crypto';
import { validateSnapshot, SECTION_KEYS, SNAPSHOT_SCHEMA } from './schema.mjs';
import { sectionContentHash } from './research.mjs';
import { importSnapshot } from './importer.mjs';
import { buildSite } from './site.mjs';

export const PROPOSAL_SCHEMA = 'wop-research-proposal-v1';
export const REVIEW_SCHEMA = 'wop-research-review-v1';
export const REQUEST_SCHEMA = 'wop-research-request-v1';
const dateToday = () => new Date().toISOString().slice(0, 10);
const text = value => typeof value === 'string' && value.trim().length > 0;
const object = value => value !== null && typeof value === 'object' && !Array.isArray(value);
const realDate = value => {
  if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const date = new Date(`${value}T00:00:00.000Z`);
  return Number.isFinite(date.valueOf()) && date.toISOString().slice(0, 10) === value;
};
const canonical = value => Array.isArray(value) ? value.map(canonical) : object(value)
  ? Object.fromEntries(Object.keys(value).sort().map(key => [key, canonical(value[key])])) : value;
export const researchHash = value => createHash('sha256').update(JSON.stringify(canonical(value))).digest('hex');
const bytesHash = value => createHash('sha256').update(value).digest('hex');

function shape(value, keys, required = keys) {
  if (!object(value) || Object.keys(value).some(key => !keys.includes(key)) || required.some(key => !Object.hasOwn(value, key))) {
    throw new Error(`Expected fields: ${keys.join(', ')}`);
  }
}

function upsert(existing = [], incoming, key) {
  if (!Array.isArray(incoming) || incoming.some(item => !object(item) || !text(item[key])) ||
      new Set(incoming.map(item => item[key])).size !== incoming.length) throw new Error(`Invalid or duplicate ${key} records`);
  const records = new Map(existing.map(item => [item[key], item]));
  for (const item of incoming) records.set(item[key], structuredClone(item));
  return [...records.values()];
}

function assertQuestionHistory(previous, next) {
  if (!previous) return;
  for (const key of ['section', 'question', 'scope', 'acceptanceCriteria']) {
    if (previous[key] !== next[key]) throw new Error(`Question ${previous.questionId}: preserve the question and acceptance criteria; create a new question for a different scope`);
  }
  if (!Array.isArray(next.attempts) || previous.attempts.some((attempt, index) => researchHash(attempt) !== researchHash(next.attempts[index] ?? null))) {
    throw new Error(`Question ${previous.questionId}: prior research attempts must be retained`);
  }
  if (researchHash(next.previousResolutions || []) !== researchHash(previous.previousResolutions || [])) {
    throw new Error(`Question ${previous.questionId}: prior outcomes must be retained; the workflow archives new outcomes automatically`);
  }
  if (previous.resolution && (previous.status !== next.status || researchHash(previous.resolution) !== researchHash(next.resolution || null))) {
    next.previousResolutions = [...(previous.previousResolutions || []), { status: previous.status, ...structuredClone(previous.resolution) }];
  }
}

export function candidateForProposal(snapshot, proposal) {
  shape(proposal, ['schema', 'proposalId', 'author', 'createdDate', 'baseHash', 'summary', 'changes']);
  if (proposal.schema !== PROPOSAL_SCHEMA || !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(proposal.proposalId) ||
      !text(proposal.author) || !text(proposal.summary) || !realDate(proposal.createdDate)) throw new Error('Invalid research proposal metadata');
  if (researchHash(snapshot) !== proposal.baseHash) throw new Error('Snapshot changed since this proposal was prepared; rebase and obtain a new review');
  if (snapshot.polymers.some(article => article.research?.history.some(change => change.changeId === proposal.proposalId))) throw new Error('Proposal ID has already been published; use a new ID to preserve history');
  if (!Array.isArray(proposal.changes) || !proposal.changes.length) throw new Error('A proposal must contain at least one bounded article change');
  const candidate = structuredClone(snapshot);
  const seen = new Set();
  for (const change of structuredClone(proposal.changes)) {
    shape(change, ['wopId', 'sections', 'sources', 'evidence', 'questions', 'reviewSections'], ['wopId']);
    if (seen.has(change.wopId)) throw new Error(`Duplicate change target ${change.wopId}`);
    seen.add(change.wopId);
    const article = candidate.polymers.find(item => item.wopId === change.wopId);
    if (!article) throw new Error(`Unknown stable article ID ${change.wopId}`);
    const beforeHash = researchHash(article);
    const touchedSections = new Set();
    if (change.sections !== undefined) {
      if (!object(change.sections) || Object.keys(change.sections).some(key => !SECTION_KEYS.includes(key))) throw new Error('Invalid section patch');
      for (const [key, value] of Object.entries(change.sections)) {
        article.sections[key] = value;
        touchedSections.add(key);
      }
    }
    if (change.sources !== undefined) {
      for (const source of change.sources) {
        const prior = article.sources.find(item => item.sourceId === source?.sourceId);
        for (const key of prior?.supports || []) if (SECTION_KEYS.includes(key)) touchedSections.add(key);
      }
      article.sources = upsert(article.sources, change.sources, 'sourceId');
      for (const source of change.sources) for (const key of source.supports || []) if (SECTION_KEYS.includes(key)) touchedSections.add(key);
    }
    if (change.evidence !== undefined) {
      for (const evidence of change.evidence) {
        const prior = article.evidence?.find(item => item.evidenceId === evidence?.evidenceId);
        if (prior) touchedSections.add(prior.section);
      }
      article.evidence = upsert(article.evidence, change.evidence, 'evidenceId');
      for (const evidence of change.evidence) touchedSections.add(evidence.section);
    }
    article.research ??= { questions: [], sectionReviews: [], history: [] };
    if (change.questions !== undefined) {
      if (!Array.isArray(change.questions)) throw new Error('questions must be an array');
      for (const question of change.questions) {
        if (!object(question)) throw new Error('Invalid question record');
        assertQuestionHistory(article.research.questions.find(prior => prior.questionId === question.questionId), question);
        touchedSections.add(question.section);
      }
      article.research.questions = upsert(article.research.questions, change.questions, 'questionId');
    }
    if (change.reviewSections !== undefined) {
      if (!Array.isArray(change.reviewSections) || change.reviewSections.some(key => !SECTION_KEYS.includes(key)) ||
          new Set(change.reviewSections).size !== change.reviewSections.length) throw new Error('Invalid reviewSections');
      for (const section of change.reviewSections) {
        if (!article.sections[section]?.trim()) throw new Error('Cannot mark an empty section reviewed');
        article.research.sectionReviews = upsert(article.research.sectionReviews, [{
          section, reviewedDate: proposal.createdDate, summary: proposal.summary, contentHash: sectionContentHash(article, section)
        }], 'section');
        touchedSections.add(section);
      }
    }
    if (!touchedSections.size || researchHash(article) === beforeHash) throw new Error(`No substantive change for ${change.wopId}`);
    article.research.history = upsert(article.research.history, [{
      changeId: proposal.proposalId, date: proposal.createdDate, summary: proposal.summary,
      sections: [...touchedSections].sort(), questionIds: (change.questions || []).map(item => item.questionId)
    }], 'changeId');
  }
  return validateSnapshot(candidate);
}

export function prepareProposal(snapshot, patch, { author, proposalId = `research-${randomUUID()}`, date = dateToday() } = {}) {
  shape(patch, ['summary', 'changes']);
  const proposal = { schema: PROPOSAL_SCHEMA, proposalId, author, createdDate: date, baseHash: researchHash(snapshot), ...structuredClone(patch) };
  candidateForProposal(snapshot, proposal);
  return proposal;
}

export function requestToPatch(snapshot, request) {
  shape(request, ['schema', 'wopId', 'section', 'question', 'scope', 'acceptanceCriteria']);
  if (request.schema !== REQUEST_SCHEMA || !SECTION_KEYS.includes(request.section) ||
      !['question', 'scope', 'acceptanceCriteria'].every(key => text(request[key]))) throw new Error('Invalid research request');
  const article = snapshot.polymers.find(item => item.wopId === request.wopId);
  if (!article) throw new Error('Request names an unknown article');
  const questionId = `question-${researchHash(request).slice(0, 16)}`;
  if (article.research?.questions.some(question => question.questionId === questionId)) throw new Error('This request is already tracked');
  return {
    summary: 'Record a section-specific research question for evidence review.',
    changes: [{ wopId: request.wopId, questions: [{
      questionId, section: request.section, question: request.question, scope: request.scope,
      acceptanceCriteria: request.acceptanceCriteria, priority: 'normal', status: 'open', attempts: []
    }] }]
  };
}

export function reviewProposal(snapshot, proposal, { reviewer, decision, note, date = dateToday() } = {}) {
  const candidate = candidateForProposal(snapshot, proposal);
  if (!text(reviewer) || reviewer.trim().toLowerCase() === proposal.author.trim().toLowerCase()) throw new Error('Independent review requires a reviewer distinct from the proposal author');
  if (!['approve', 'request_changes'].includes(decision) || !text(note)) throw new Error('Review requires a decision and substantive note');
  if (!realDate(date) || date < proposal.createdDate) throw new Error('Review date must be a real date on or after the proposal date');
  return { schema: REVIEW_SCHEMA, proposalId: proposal.proposalId, proposalHash: researchHash(proposal), candidateHash: researchHash(candidate), reviewer, decision, note, reviewedDate: date };
}

export function verifyReview(snapshot, proposal, review) {
  shape(review, ['schema', 'proposalId', 'proposalHash', 'candidateHash', 'reviewer', 'decision', 'note', 'reviewedDate']);
  const expected = reviewProposal(snapshot, proposal, { reviewer: review.reviewer, decision: review.decision, note: review.note, date: review.reviewedDate });
  if (review.schema !== REVIEW_SCHEMA || review.decision !== 'approve' || researchHash(review) !== researchHash(expected)) {
    throw new Error('Publication requires an approving independent review bound to this exact proposal and candidate');
  }
  return candidateForProposal(snapshot, proposal);
}

// Build the entire candidate before importing it. The site builder stages output
// and rolls back failed swaps. If a swap fails after import, restore the prior
// snapshot too; private review artifacts never enter either public directory.
export async function publishProposal({ snapshotDirectory, outputDirectory, proposal, review, siteUrl = null }, services = {}) {
  const importer = services.importer || importSnapshot;
  const builder = services.builder || buildSite;
  const destination = path.resolve(snapshotDirectory);
  const snapshotPath = path.join(destination, 'snapshot.json');
  const parent = path.dirname(destination);
  const lockPath = path.join(parent, '.wop-research-publication.lock');
  const lock = await fs.open(lockPath, 'wx').catch(error => {
    if (error.code === 'EEXIST') throw new Error('Another research publication holds the lock; wait for it to finish');
    throw error;
  });
  let workspace;
  let imported = false;
  let original;
  let candidate;
  try {
    original = await fs.readFile(snapshotPath, 'utf8');
    const snapshot = JSON.parse(original);
    candidate = verifyReview(snapshot, proposal, review);
    workspace = await fs.mkdtemp(path.join(parent, '.research-publication-'));
    const incoming = path.join(workspace, SNAPSHOT_SCHEMA);
    await fs.mkdir(incoming);
    await fs.writeFile(path.join(incoming, 'snapshot.json'), `${JSON.stringify(candidate, null, 2)}\n`);
    const built = await builder(candidate, outputDirectory, {
      siteUrl,
      beforePublish: async () => {
        if (await fs.readFile(snapshotPath, 'utf8') !== original) throw new Error('Snapshot changed while building; publication cancelled');
        await importer(incoming, destination, { expectedSnapshotHash: bytesHash(original) });
        imported = true;
      }
    });
    if (!imported) throw new Error('Builder did not execute the guarded publication step');
    return { proposalId: proposal.proposalId, articles: proposal.changes.map(change => change.wopId), candidateHash: researchHash(candidate), output: built.output };
  } catch (error) {
    if (imported) {
      try {
        const currentRaw = await fs.readFile(snapshotPath, 'utf8');
        const current = JSON.parse(currentRaw);
        if (researchHash(current) !== researchHash(candidate)) throw new Error('Concurrent snapshot edit prevents automatic rollback');
        const recovery = path.join(workspace, 'recovery');
        await fs.mkdir(recovery);
        await fs.writeFile(path.join(recovery, 'snapshot.json'), original);
        await importer(recovery, destination, { expectedSnapshotHash: bytesHash(currentRaw), preserveSourceBytes: true });
      } catch (rollbackError) {
        // Retain the recovery directory if manual reconciliation is needed.
        const retained = workspace;
        workspace = null;
        throw new AggregateError([error, rollbackError], `Publication and snapshot rollback failed; recovery files retained at ${retained}`);
      }
    }
    throw error;
  } finally {
    if (workspace) await fs.rm(workspace, { recursive: true, force: true }).catch(() => {});
    await lock.close();
    await fs.rm(lockPath, { force: true });
  }
}
