import { createHash } from 'node:crypto';
import { isNonemptyString, isPlainObject, validatePublicText } from './source-policy.mjs';

export const QUESTION_STATUSES = Object.freeze(['open', 'in_progress', 'in_review', 'resolved', 'no_eligible_evidence']);
const SLUG = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const CLOSED_STATUSES = new Set(['resolved', 'no_eligible_evidence']);
const EVIDENCE_SECTIONS = new Set(['mechanicalProperties', 'processing']);

function shape(value, required, optional, label, errors) {
  if (!isPlainObject(value)) {
    errors.push(`${label} must be an object`);
    return false;
  }
  for (const key of required) if (!Object.hasOwn(value, key)) errors.push(`${label}.${key} is required`);
  for (const key of Object.keys(value)) if (![...required, ...optional].includes(key)) errors.push(`${label}.${key} is not permitted`);
  return true;
}

function text(value, label, errors) {
  if (!isNonemptyString(value)) errors.push(`${label} must be a non-empty string`);
}

function date(value, label, errors) {
  const parsed = typeof value === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(value) ? new Date(`${value}T00:00:00.000Z`) : null;
  if (!parsed || !Number.isFinite(parsed.valueOf()) || parsed.toISOString().slice(0, 10) !== value) {
    errors.push(`${label} must be a real YYYY-MM-DD date`);
  }
}

function array(value, label, errors) {
  if (Array.isArray(value)) return value;
  errors.push(`${label} must be an array`);
  return [];
}

function ids(value, label, errors) {
  const values = array(value, label, errors);
  if (values.some(item => typeof item !== 'string' || !SLUG.test(item))) errors.push(`${label} must contain lowercase slug identifiers`);
  if (new Set(values).size !== values.length) errors.push(`${label} must not contain duplicates`);
  return values;
}

function uniqueId(value, seen, label, errors) {
  if (typeof value !== 'string' || !SLUG.test(value)) errors.push(`${label} must be a lowercase slug`);
  if (seen.has(value)) errors.push(`${label} is duplicated`);
  seen.add(value);
}

function sourceLinks(value, section, sources, label, errors) {
  for (const id of ids(value, label, errors)) {
    const source = sources.get(id);
    if (!source) errors.push(`${label} names unknown article source ${id}`);
    else if (!Array.isArray(source.supports) || !source.supports.includes(section)) errors.push(`${label} source ${id} does not support ${section}`);
  }
}

function stable(value) {
  if (Array.isArray(value)) return value.map(stable);
  if (isPlainObject(value)) return Object.fromEntries(Object.keys(value).sort().map(key => [key, stable(value[key])]));
  return value;
}

/** A review belongs to the exact prose, source records and structured evidence reviewed. */
export function sectionContentHash(article, section) {
  const sourceRecords = (article.sources || []).filter(source => source.supports?.includes(section))
    .toSorted((a, b) => a.sourceId.localeCompare(b.sourceId));
  const evidence = (article.evidence || []).filter(item => item.section === section)
    .toSorted((a, b) => a.evidenceId.localeCompare(b.evidenceId));
  const content = { section, prose: article.sections?.[section] || '', sources: sourceRecords, evidence };
  if (section === 'feedstocksAndSynthesis') content.synthesisRoutes = article.synthesisRoutes || [];
  if (article.contextualStructures?.[section]) content.contextualStructures = article.contextualStructures[section];
  return createHash('sha256').update(JSON.stringify(stable(content))).digest('hex');
}

export function getSectionStatus(article, section) {
  const review = article.research?.sectionReviews?.find(item => item.section === section);
  return {
    populated: isNonemptyString(article.sections?.[section]),
    evidenceCount: (article.evidence || []).filter(item => item.section === section).length,
    reviewStatus: !review ? 'unreviewed' : review.contentHash === sectionContentHash(article, section) ? 'reviewed' : 'stale',
    reviewedDate: review?.reviewedDate || null
  };
}

/** Counts describe research work and evidence, without equating populated prose to review. */
export function summarizeResearch(snapshot) {
  const articles = snapshot.polymers || [];
  const result = {
    articleCount: articles.length,
    questionCounts: Object.fromEntries(QUESTION_STATUSES.map(status => [status, 0])),
    openQuestionCount: 0,
    evidenceCount: 0,
    populatedSectionCount: 0,
    reviewedSectionCount: 0,
    staleSectionCount: 0
  };
  for (const article of articles) {
    result.evidenceCount += (article.evidence || []).length;
    for (const question of article.research?.questions || []) {
      if (Object.hasOwn(result.questionCounts, question.status)) result.questionCounts[question.status] += 1;
      if (['open', 'in_progress', 'in_review'].includes(question.status)) result.openQuestionCount += 1;
    }
    for (const section of Object.keys(article.sections || {})) {
      const status = getSectionStatus(article, section);
      if (status.populated) result.populatedSectionCount += 1;
      if (status.reviewStatus === 'reviewed') result.reviewedSectionCount += 1;
      if (status.reviewStatus === 'stale') result.staleSectionCount += 1;
    }
  }
  return result;
}

export function validateResearch(article, label, errors, sectionKeys) {
  const sections = new Set(sectionKeys);
  const sources = new Map((Array.isArray(article.sources) ? article.sources : []).filter(isPlainObject).map(source => [source.sourceId, source]));
  const evidenceById = new Map();
  const evidenceIds = new Set();
  if (Object.hasOwn(article, 'evidence')) {
    const location = `${label}.evidence`;
    array(article.evidence, location, errors).forEach((item, index) => {
      const at = `${location}[${index}]`;
      if (!shape(item, ['evidenceId', 'section', 'kind', 'attribute', 'material', 'value', 'conditions', 'method', 'sourceId', 'locator', 'limitations'], [], at, errors)) return;
      uniqueId(item.evidenceId, evidenceIds, `${at}.evidenceId`, errors);
      evidenceById.set(item.evidenceId, item);
      if (!EVIDENCE_SECTIONS.has(item.section)) errors.push(`${at}.section is invalid`);
      if (!isNonemptyString(article.sections?.[item.section])) errors.push(`${at} cannot attach evidence to an empty section`);
      if (item.kind !== (item.section === 'processing' ? 'operating_window' : 'measurement')) errors.push(`${at}.kind does not match its section`);
      for (const key of ['attribute', 'material', 'conditions', 'method', 'locator', 'limitations']) text(item[key], `${at}.${key}`, errors);
      sourceLinks([item.sourceId], item.section, sources, `${at}.sourceId`, errors);
      if (shape(item.value, ['min', 'max', 'units'], ['uncertainty', 'uncertaintyNote'], `${at}.value`, errors)) {
        const value = item.value;
        for (const key of ['min', 'max']) if (!Number.isFinite(value[key])) errors.push(`${at}.value.${key} must be finite`);
        if (value.min > value.max) errors.push(`${at}.value.min must not exceed max`);
        text(value.units, `${at}.value.units`, errors);
        if (Object.hasOwn(value, 'uncertainty')) {
          if (!Number.isFinite(value.uncertainty) || value.uncertainty < 0) errors.push(`${at}.value.uncertainty must be finite and nonnegative`);
          text(value.uncertaintyNote, `${at}.value.uncertaintyNote`, errors);
        }
        if (Object.hasOwn(value, 'uncertaintyNote')) text(value.uncertaintyNote, `${at}.value.uncertaintyNote`, errors);
      }
    });
    validatePublicText(article.evidence, location, errors);
  }
  if (!Object.hasOwn(article, 'research')) return;
  const research = article.research;
  const location = `${label}.research`;
  if (!shape(research, ['questions', 'sectionReviews', 'history'], [], location, errors)) return;
  const questionIds = new Set();
  array(research.questions, `${location}.questions`, errors).forEach((question, index) => {
    const at = `${location}.questions[${index}]`;
    if (!shape(question, ['questionId', 'section', 'question', 'scope', 'priority', 'status', 'acceptanceCriteria', 'attempts'], ['resolution', 'previousResolutions'], at, errors)) return;
    uniqueId(question.questionId, questionIds, `${at}.questionId`, errors);
    if (!sections.has(question.section)) errors.push(`${at}.section is invalid`);
    for (const key of ['question', 'scope', 'acceptanceCriteria']) text(question[key], `${at}.${key}`, errors);
    if (!['high', 'normal', 'low'].includes(question.priority)) errors.push(`${at}.priority is invalid`);
    if (!QUESTION_STATUSES.includes(question.status)) errors.push(`${at}.status is invalid`);
    const attempts = array(question.attempts, `${at}.attempts`, errors);
    attempts.forEach((attempt, attemptIndex) => {
      const attemptAt = `${at}.attempts[${attemptIndex}]`;
      if (!shape(attempt, ['date', 'summary', 'sourceIds'], [], attemptAt, errors)) return;
      date(attempt.date, `${attemptAt}.date`, errors);
      text(attempt.summary, `${attemptAt}.summary`, errors);
      sourceLinks(attempt.sourceIds, question.section, sources, `${attemptAt}.sourceIds`, errors);
    });
    const closed = CLOSED_STATUSES.has(question.status);
    if (closed && !attempts.length) errors.push(`${at} closed questions require at least one research attempt`);
    if (closed && !Object.hasOwn(question, 'resolution')) errors.push(`${at}.resolution is required for closed questions`);
    if (!closed && Object.hasOwn(question, 'resolution')) errors.push(`${at}.resolution is permitted only for closed questions`);
    const validateResolution = (resolution, resolutionAt, status, previous = false) => {
      if (!shape(resolution, ['date', 'summary', 'sourceIds', 'evidenceIds', ...(previous ? ['status'] : [])], [], resolutionAt, errors)) return;
      if (previous && !CLOSED_STATUSES.has(status)) errors.push(`${resolutionAt}.status must be a closed question status`);
      date(resolution.date, `${resolutionAt}.date`, errors);
      text(resolution.summary, `${resolutionAt}.summary`, errors);
      sourceLinks(resolution.sourceIds, question.section, sources, `${resolutionAt}.sourceIds`, errors);
      if (status === 'resolved' && (!Array.isArray(resolution.sourceIds) || !resolution.sourceIds.length)) errors.push(`${resolutionAt}.sourceIds requires supporting evidence for resolved questions`);
      for (const id of ids(resolution.evidenceIds, `${resolutionAt}.evidenceIds`, errors)) {
        const evidence = evidenceById.get(id);
        if (!evidence) errors.push(`${resolutionAt}.evidenceIds names unknown evidence ${id}`);
        else {
          if (evidence.section !== question.section) errors.push(`${resolutionAt}.evidenceIds evidence ${id} belongs to another section`);
          if (!Array.isArray(resolution.sourceIds) || !resolution.sourceIds.includes(evidence.sourceId)) errors.push(`${resolutionAt}.sourceIds must include the source of evidence ${id}`);
        }
      }
    };
    const previousResolutions = Object.hasOwn(question, 'previousResolutions')
      ? array(question.previousResolutions, `${at}.previousResolutions`, errors) : [];
    previousResolutions.forEach((resolution, index) => {
      const resolutionAt = `${at}.previousResolutions[${index}]`;
      validateResolution(resolution, resolutionAt, resolution?.status, true);
      if (!isPlainObject(resolution)) return;
      if (!attempts.some(attempt => isPlainObject(attempt) && typeof attempt.date === 'string' && attempt.date <= resolution.date)) {
        errors.push(`${resolutionAt} requires an attempt on or before its resolution date`);
      }
      if (index > 0 && previousResolutions[index - 1]?.date > resolution.date) errors.push(`${at}.previousResolutions must be ordered by date`);
    });
    if (Object.hasOwn(question, 'resolution')) {
      validateResolution(question.resolution, `${at}.resolution`, question.status);
      if (isPlainObject(question.resolution)) {
        if (attempts.some(attempt => isPlainObject(attempt) && attempt.date > question.resolution.date)) errors.push(`${at}.resolution.date must not precede research attempts`);
        if (previousResolutions.some(resolution => isPlainObject(resolution) && resolution.date > question.resolution.date)) errors.push(`${at}.resolution.date must not precede previous resolutions`);
      }
    }
  });
  const reviewedSections = new Set();
  array(research.sectionReviews, `${location}.sectionReviews`, errors).forEach((review, index) => {
    const at = `${location}.sectionReviews[${index}]`;
    if (!shape(review, ['section', 'reviewedDate', 'summary', 'contentHash'], [], at, errors)) return;
    if (!sections.has(review.section)) errors.push(`${at}.section is invalid`);
    if (reviewedSections.has(review.section)) errors.push(`${at}.section is duplicated`);
    reviewedSections.add(review.section);
    if (!isNonemptyString(article.sections?.[review.section])) errors.push(`${at} cannot review an empty section`);
    date(review.reviewedDate, `${at}.reviewedDate`, errors);
    text(review.summary, `${at}.summary`, errors);
    if (typeof review.contentHash !== 'string' || !/^[a-f0-9]{64}$/.test(review.contentHash)) errors.push(`${at}.contentHash must be a SHA256 digest`);
  });
  const changeIds = new Set();
  array(research.history, `${location}.history`, errors).forEach((change, index) => {
    const at = `${location}.history[${index}]`;
    if (!shape(change, ['changeId', 'date', 'summary', 'sections', 'questionIds'], [], at, errors)) return;
    uniqueId(change.changeId, changeIds, `${at}.changeId`, errors);
    date(change.date, `${at}.date`, errors);
    text(change.summary, `${at}.summary`, errors);
    const changedSections = array(change.sections, `${at}.sections`, errors);
    if (!changedSections.length || new Set(changedSections).size !== changedSections.length || changedSections.some(section => !sections.has(section))) errors.push(`${at}.sections must contain unique article section keys`);
    for (const id of ids(change.questionIds, `${at}.questionIds`, errors)) if (!questionIds.has(id)) errors.push(`${at}.questionIds names unknown question ${id}`);
  });
  validatePublicText(research, location, errors);
}
