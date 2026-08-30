import path from 'node:path';
import {
  isNonemptyString,
  isPlainObject,
  validatePublicText,
  validateSourceRecord
} from './source-policy.mjs';

export const SNAPSHOT_SCHEMA = 'wop-publication-snapshot-v1';
export const ARTICLE_TYPE = 'polymer_entry';
export const SECTION_KEYS = Object.freeze([
  'overview',
  'nomenclature',
  'feedstocksAndSynthesis',
  'mechanicalProperties',
  'processing',
  'structureAndMorphology',
  'properties',
  'applications',
  'degradationAndStability',
  'recyclingAndEndOfLife',
  'healthSafetyAndRegulation',
  'limitationsAndVariability'
]);
export const CORE_ATTRIBUTE_KEYS = Object.freeze([
  'feedstocksAndSynthesis',
  'mechanicalProperties',
  'processing'
]);
export const PRIMARY_CLASSES = new Set([
  'commodity_thermoplastic',
  'engineering_thermoplastic',
  'high_performance_polymer',
  'thermoset',
  'elastomer',
  'thermoplastic_elastomer',
  'fiber_and_textile',
  'natural_and_semisynthetic',
  'biodegradable_and_biomedical',
  'functional_and_specialty',
  'water_soluble_and_hydrogel'
]);
export const MATERIAL_BEHAVIORS = new Set([
  'thermoplastic', 'thermoset', 'elastomer', 'thermoplastic_elastomer',
  'fiber', 'foam', 'coating', 'adhesive', 'hydrogel', 'ionomer',
  'biopolymer', 'functional', 'resin'
]);
export const MARKET_TIERS = new Set(['commodity', 'engineering', 'high_performance', 'specialty']);
export const ORIGINS = new Set(['synthetic', 'semisynthetic', 'natural', 'bio_based']);
export const ENTRY_KINDS = new Set([
  'family', 'polymer', 'subfamily', 'copolymer', 'network',
  'modified_polymer', 'grade_family', 'polymer_blend', 'polymer_complex'
]);
export const MATURITY = new Set([
  'stub', 'source_backed_draft', 'agent_corrected', 'open_source_reviewed'
]);
export const CONFIDENCE = new Set(['provisional', 'medium', 'high']);
export const REVIEW_FLAGS = new Set([
  'open_sources_needed',
  'taxonomy_needs_review',
  'nomenclature_needs_review',
  'processing_data_needed',
  'grade_variation_not_captured',
  'property_data_needed',
  'end_of_life_review_needed',
  'safety_review_needed',
  'possible_duplicate_scope'
]);

const WOP_ID = /^wop-[0-9]{6}$/;
const SLUG = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const CHEMISTRY_CLASS = /^[a-z0-9]+(?:_[a-z0-9]+)*$/;
const RELATIONSHIP_KINDS = new Set(['broader', 'narrower', 'related']);
const SEARCH_KINDS = new Set(['ambiguous', 'umbrella', 'application']);
const METHODOLOGY_SUPPORTS = new Set([
  'taxonomy', 'nomenclature', 'commodity_prevalence', 'processing_framework',
  'biomedical_scope', 'natural_polymer_scope'
]);
const ARTICLE_SUPPORTS = new Set(SECTION_KEYS);
const ARTICLE_KEYS = new Set([
  'type', 'wopId', 'canonicalSlug', 'canonicalName', 'alternateNames',
  'abbreviations', 'entryKind', 'taxonomy', 'relationships', 'sections',
  'sources', 'maturity'
]);

export class SnapshotValidationError extends Error {
  constructor(errors) {
    super(`Snapshot validation failed:\n- ${errors.join('\n- ')}`);
    this.name = 'SnapshotValidationError';
    this.errors = errors;
  }
}

function requiredString(value, label, errors) {
  if (!isNonemptyString(value)) errors.push(`${label} must be a non-empty string`);
}

function exactShape(value, allowedKeys, requiredKeys, label, errors) {
  if (!isPlainObject(value)) {
    errors.push(`${label} must be an object`);
    return false;
  }
  for (const key of Object.keys(value)) {
    if (!allowedKeys.has(key)) errors.push(`${label}.${key} is not permitted`);
  }
  for (const key of requiredKeys) {
    if (!Object.hasOwn(value, key)) errors.push(`${label}.${key} is required`);
  }
  return true;
}

function validateUniqueStrings(value, label, errors, { allowed, minimum = 0, pattern } = {}) {
  if (!Array.isArray(value) || value.length < minimum || value.some((item) => !isNonemptyString(item))) {
    errors.push(`${label} must be an array of non-empty strings${minimum ? ` with at least ${minimum} item(s)` : ''}`);
    return;
  }
  if (new Set(value).size !== value.length) errors.push(`${label} must not contain duplicates`);
  if (allowed && value.some((item) => !allowed.has(item))) errors.push(`${label} contains an invalid value`);
  if (pattern && value.some((item) => !pattern.test(item))) errors.push(`${label} contains an invalid slug value`);
}

function validateTaxonomy(taxonomy, label, errors) {
  const keys = new Set(['primaryClass', 'materialBehaviors', 'marketTiers', 'origins', 'chemistryClasses', 'functionalTags']);
  if (!exactShape(taxonomy, keys, keys, label, errors)) return;
  if (!PRIMARY_CLASSES.has(taxonomy.primaryClass)) errors.push(`${label}.primaryClass is invalid`);
  validateUniqueStrings(taxonomy.materialBehaviors, `${label}.materialBehaviors`, errors, { allowed: MATERIAL_BEHAVIORS, minimum: 1 });
  validateUniqueStrings(taxonomy.marketTiers, `${label}.marketTiers`, errors, { allowed: MARKET_TIERS, minimum: 1 });
  validateUniqueStrings(taxonomy.origins, `${label}.origins`, errors, { allowed: ORIGINS, minimum: 1 });
  validateUniqueStrings(taxonomy.chemistryClasses, `${label}.chemistryClasses`, errors, { pattern: CHEMISTRY_CLASS, minimum: 1 });
  validateUniqueStrings(taxonomy.functionalTags, `${label}.functionalTags`, errors, { pattern: CHEMISTRY_CLASS });
}

function validateMaturity(maturity, label, errors) {
  const keys = new Set(['contentMaturity', 'confidence', 'reviewFlags']);
  if (!exactShape(maturity, keys, keys, label, errors)) return;
  if (!MATURITY.has(maturity.contentMaturity)) errors.push(`${label}.contentMaturity is invalid`);
  if (!CONFIDENCE.has(maturity.confidence)) errors.push(`${label}.confidence is invalid`);
  validateUniqueStrings(maturity.reviewFlags, `${label}.reviewFlags`, errors, { allowed: REVIEW_FLAGS });
}

function canonicalDocumentUrl(value) {
  if (typeof value !== 'string') return null;
  try {
    const url = new URL(value);
    url.hash = '';
    url.search = '';
    return url.href;
  } catch {
    return null;
  }
}

function validateArticle(article, index, errors) {
  const label = `polymers[${index}]`;
  if (!exactShape(article, ARTICLE_KEYS, ARTICLE_KEYS, label, errors)) return;
  if (article.type !== ARTICLE_TYPE) errors.push(`${label}.type must be ${ARTICLE_TYPE}`);
  requiredString(article.wopId, `${label}.wopId`, errors);
  if (typeof article.wopId === 'string' && !WOP_ID.test(article.wopId)) errors.push(`${label}.wopId must match wop-NNNNNN`);
  requiredString(article.canonicalSlug, `${label}.canonicalSlug`, errors);
  if (typeof article.canonicalSlug === 'string' && !SLUG.test(article.canonicalSlug)) errors.push(`${label}.canonicalSlug must be a lowercase URL slug`);
  requiredString(article.canonicalName, `${label}.canonicalName`, errors);
  validateUniqueStrings(article.alternateNames, `${label}.alternateNames`, errors);
  validateUniqueStrings(article.abbreviations, `${label}.abbreviations`, errors);
  if (ENTRY_KINDS.has(article.entryKind) === false) errors.push(`${label}.entryKind is invalid`);
  const identityNames = [
    article.canonicalName,
    ...(Array.isArray(article.alternateNames) ? article.alternateNames : []),
    ...(Array.isArray(article.abbreviations) ? article.abbreviations : [])
  ]
    .filter((value) => typeof value === 'string')
    .map((value) => value.trim().toLocaleLowerCase('en-US'));
  if (new Set(identityNames).size !== identityNames.length) errors.push(`${label} contains a duplicate canonical, alternate, or abbreviated name`);
  validateTaxonomy(article.taxonomy, `${label}.taxonomy`, errors);
  validateMaturity(article.maturity, `${label}.maturity`, errors);
  if (article.maturity?.confidence === 'high' && article.maturity?.contentMaturity !== 'open_source_reviewed') {
    errors.push(`${label}.maturity.confidence high is reserved for open_source_reviewed records`);
  }

  if (!Array.isArray(article.relationships)) errors.push(`${label}.relationships must be an array`);
  else article.relationships.forEach((relationship, relationshipIndex) => {
    const location = `${label}.relationships[${relationshipIndex}]`;
    const keys = new Set(['kind', 'wopId']);
    if (!exactShape(relationship, keys, keys, location, errors)) return;
    if (!RELATIONSHIP_KINDS.has(relationship.kind)) errors.push(`${location}.kind is invalid`);
    if (typeof relationship.wopId !== 'string' || !WOP_ID.test(relationship.wopId)) errors.push(`${location}.wopId must match wop-NNNNNN`);
    if (relationship.wopId === article.wopId) errors.push(`${location} cannot refer to its own article`);
  });

  const sectionKeys = new Set(SECTION_KEYS);
  if (exactShape(article.sections, sectionKeys, sectionKeys, `${label}.sections`, errors)) {
    for (const key of SECTION_KEYS) {
      if (typeof article.sections[key] !== 'string') errors.push(`${label}.sections.${key} must be a string`);
    }
  }

  if (!Array.isArray(article.sources)) errors.push(`${label}.sources must be an array`);
  else {
    const sourceIds = new Set();
    const urlLineages = new Map();
    article.sources.forEach((source, sourceIndex) => {
      const location = `${label}.sources[${sourceIndex}]`;
      validateSourceRecord(source, location, errors, ARTICLE_SUPPORTS);
      if (isPlainObject(source)) {
        if (sourceIds.has(source.sourceId)) errors.push(`${location}.sourceId is duplicated within the article`);
        sourceIds.add(source.sourceId);
        for (const key of ['url', 'contentUrl']) {
          const documentUrl = canonicalDocumentUrl(source[key]);
          if (!documentUrl || !isNonemptyString(source.lineageId)) continue;
          if (urlLineages.has(documentUrl) && urlLineages.get(documentUrl) !== source.lineageId) {
            errors.push(`${location}.${key} assigns a second lineageId to the same document URL`);
          } else {
            urlLineages.set(documentUrl, source.lineageId);
          }
        }
      }
    });
  }

  if (isPlainObject(article.sections) && Array.isArray(article.sources)) {
    const supported = new Set(article.sources.flatMap((source) => Array.isArray(source?.supports) ? source.supports : []));
    for (const key of SECTION_KEYS) {
      if (isNonemptyString(article.sections[key]) && !supported.has(key)) {
        errors.push(`${label}.sections.${key} has prose but no source mapped to that section`);
      }
      if (!isNonemptyString(article.sections[key]) && supported.has(key)) {
        errors.push(`${label}.sources maps to empty section ${key}`);
      }
    }
    for (const key of CORE_ATTRIBUTE_KEYS) {
      if (!isNonemptyString(article.sections[key])) continue;
      const supportingSources = article.sources.filter((source) =>
        Array.isArray(source?.supports) && source.supports.includes(key));
      const lineages = new Set(supportingSources
        .map((source) => source?.lineageId)
        .filter((lineageId) => isNonemptyString(lineageId)));
      if (lineages.size < 2) {
        errors.push(`${label}.sections.${key} requires at least two independent source lineages`);
      }
      const documents = new Set(supportingSources
        .map((source) => canonicalDocumentUrl(source?.contentUrl || source?.url))
        .filter(Boolean));
      if (documents.size < 2) {
        errors.push(`${label}.sections.${key} requires at least two distinct source documents`);
      }
    }
    const populated = SECTION_KEYS.filter((key) => isNonemptyString(article.sections[key]));
    const reviewFlags = Array.isArray(article.maturity?.reviewFlags) ? article.maturity.reviewFlags : [];
    const principalSections = ['overview', 'feedstocksAndSynthesis', 'mechanicalProperties', 'processing', 'applications', 'limitationsAndVariability'];
    if (principalSections.some((key) => !isNonemptyString(article.sections[key])) && !reviewFlags.includes('open_sources_needed')) {
      errors.push(`${label} has an unpopulated principal section and must retain open_sources_needed`);
    }
    for (const [key, flag] of [
      ['processing', 'processing_data_needed'],
      ['mechanicalProperties', 'property_data_needed']
    ]) {
      if (!isNonemptyString(article.sections[key]) && !reviewFlags.includes(flag)) {
        errors.push(`${label} has an empty ${key} section and must retain ${flag}`);
      }
    }
    if (article.maturity?.contentMaturity === 'stub') {
      if (populated.length) errors.push(`${label} is a stub and must keep every prose section empty`);
      if (article.sources.length) errors.push(`${label} is a stub and must not publish unused article sources`);
      if (!Array.isArray(article.maturity?.reviewFlags) || !article.maturity.reviewFlags.includes('open_sources_needed')) errors.push(`${label} stub must retain open_sources_needed`);
      if (article.maturity.confidence !== 'provisional') errors.push(`${label} stub confidence must be provisional`);
    } else if (!populated.length || article.sources.length === 0) {
      errors.push(`${label} non-stub records require sourced prose`);
    }
    if (article.maturity?.contentMaturity === 'open_source_reviewed') {
      for (const key of ['overview', 'feedstocksAndSynthesis', 'mechanicalProperties', 'processing', 'applications', 'limitationsAndVariability']) {
        if (!isNonemptyString(article.sections[key])) errors.push(`${label} open_source_reviewed record requires ${key}`);
      }
      const blockingFlags = [
        'open_sources_needed',
        'taxonomy_needs_review',
        'nomenclature_needs_review',
        'processing_data_needed',
        'property_data_needed',
        'possible_duplicate_scope'
      ];
      if (Array.isArray(article.maturity.reviewFlags) &&
          article.maturity.reviewFlags.some((flag) => blockingFlags.includes(flag))) {
        errors.push(`${label} open_source_reviewed record retains a principal-section or scope review flag`);
      }
      if (article.maturity.confidence === 'provisional') {
        errors.push(`${label} open_source_reviewed record cannot have provisional confidence`);
      }
      const lineages = new Set(article.sources
        .map((source) => source?.lineageId)
        .filter((lineageId) => isNonemptyString(lineageId)));
      if (lineages.size < 2) errors.push(`${label} open_source_reviewed record requires at least two independent source lineages`);
      const documents = new Set(article.sources
        .map((source) => canonicalDocumentUrl(source?.contentUrl || source?.url))
        .filter(Boolean));
      if (documents.size < 2) errors.push(`${label} open_source_reviewed record requires at least two distinct source documents`);
    }
  }

  const { sources, ...publicArticleWithoutSources } = article;
  validatePublicText(publicArticleWithoutSources, label, errors);
}

function validateMethodology(methodology, errors) {
  const label = 'methodology';
  const keys = new Set(['scope', 'selectionSignals', 'rankingDisclaimer', 'sourceStandard', 'sources']);
  if (!exactShape(methodology, keys, keys, label, errors)) return;
  for (const key of ['scope', 'rankingDisclaimer', 'sourceStandard']) requiredString(methodology[key], `${label}.${key}`, errors);
  validateUniqueStrings(methodology.selectionSignals, `${label}.selectionSignals`, errors, { minimum: 1 });
  if (!Array.isArray(methodology.sources) || methodology.sources.length < 3) {
    errors.push(`${label}.sources must contain at least three open methodology sources`);
  } else {
    const sourceIds = new Set();
    methodology.sources.forEach((source, index) => {
      validateSourceRecord(source, `${label}.sources[${index}]`, errors, METHODOLOGY_SUPPORTS);
      if (sourceIds.has(source?.sourceId)) errors.push(`${label}.sources[${index}].sourceId is duplicated`);
      sourceIds.add(source?.sourceId);
    });
  }
  const { sources, ...withoutSources } = methodology;
  validatePublicText(withoutSources, label, errors);
}

function normalizeIdentity(value) {
  return value.normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/gi, ' ')
    .trim()
    .toLocaleLowerCase('en-US');
}

function identityRouteSlug(value) {
  return normalizeIdentity(value).replaceAll(' ', '-');
}

export function validateSnapshot(snapshot) {
  const errors = [];
  if (!isPlainObject(snapshot)) throw new SnapshotValidationError(['snapshot must be an object']);
  const topKeys = new Set(['schema', 'methodology', 'polymers', 'aliases', 'searchTerms']);
  exactShape(snapshot, topKeys, topKeys, 'snapshot', errors);
  if (snapshot.schema !== SNAPSHOT_SCHEMA) errors.push(`schema must be ${SNAPSHOT_SCHEMA}`);
  validateMethodology(snapshot.methodology, errors);

  const polymers = Array.isArray(snapshot.polymers) ? snapshot.polymers : [];
  const aliasRecords = Array.isArray(snapshot.aliases) ? snapshot.aliases : [];
  const searchRecords = Array.isArray(snapshot.searchTerms) ? snapshot.searchTerms : [];
  if (polymers.length === 0) errors.push('polymers must be a non-empty array');
  else polymers.forEach((article, index) => validateArticle(article, index, errors));

  const ids = new Set();
  const slugs = new Set();
  const names = new Set();
  const identityOwners = new Map();
  for (const [index, article] of polymers.entries()) {
    if (!isPlainObject(article)) continue;
    if (typeof article.wopId === 'string') {
      if (ids.has(article.wopId)) errors.push(`duplicate wopId ${article.wopId}`);
      ids.add(article.wopId);
    }
    if (typeof article.canonicalSlug === 'string') {
      if (slugs.has(article.canonicalSlug)) errors.push(`duplicate canonicalSlug ${article.canonicalSlug}`);
      slugs.add(article.canonicalSlug);
    }
    if (typeof article.canonicalName === 'string') {
      const normalizedName = normalizeIdentity(article.canonicalName);
      if (names.has(normalizedName)) errors.push(`duplicate canonicalName at polymers[${index}]`);
      names.add(normalizedName);
    }
    const identities = [
      article.canonicalName,
      ...(Array.isArray(article.alternateNames) ? article.alternateNames : []),
      ...(Array.isArray(article.abbreviations) ? article.abbreviations : [])
    ].filter((value) => typeof value === 'string' && value.trim());
    for (const identity of identities) {
      const normalized = normalizeIdentity(identity);
      if (!identityOwners.has(normalized)) identityOwners.set(normalized, { display: identity, values: new Set(), ids: new Set() });
      identityOwners.get(normalized).values.add(identity);
      if (typeof article.wopId === 'string') identityOwners.get(normalized).ids.add(article.wopId);
    }
  }
  for (const [index, article] of polymers.entries()) {
    if (!isPlainObject(article) || !Array.isArray(article.relationships)) continue;
    for (const [relationIndex, relationship] of article.relationships.entries()) {
      if (!ids.has(relationship?.wopId)) errors.push(`polymers[${index}].relationships[${relationIndex}].wopId does not name a published entry`);
    }
  }

  if (!Array.isArray(snapshot.aliases)) errors.push('aliases must be an array');
  const aliasSlugs = new Set();
  aliasRecords.forEach((alias, index) => {
    const label = `aliases[${index}]`;
    const keys = new Set(['slug', 'wopId']);
    if (!exactShape(alias, keys, keys, label, errors)) return;
    if (!SLUG.test(alias.slug || '')) errors.push(`${label}.slug must be a lowercase URL slug`);
    if (!ids.has(alias.wopId)) errors.push(`${label}.wopId must name a published entry`);
    if (slugs.has(alias.slug)) errors.push(`${label}.slug conflicts with a canonical slug`);
    if (aliasSlugs.has(alias.slug)) errors.push(`${label}.slug is duplicated`);
    if (typeof alias.slug === 'string') aliasSlugs.add(alias.slug);
    validatePublicText(alias, label, errors);
  });

  if (!Array.isArray(snapshot.searchTerms)) errors.push('searchTerms must be an array');
  const searchByTerm = new Map();
  searchRecords.forEach((entry, index) => {
    const label = `searchTerms[${index}]`;
    const keys = new Set(['term', 'kind', 'wopIds']);
    if (!exactShape(entry, keys, keys, label, errors)) return;
    requiredString(entry.term, `${label}.term`, errors);
    if (!SEARCH_KINDS.has(entry.kind)) errors.push(`${label}.kind is invalid`);
    if (!Array.isArray(entry.wopIds) || entry.wopIds.length === 0 ||
        entry.wopIds.some((id) => !ids.has(id)) || new Set(entry.wopIds).size !== entry.wopIds.length) {
      errors.push(`${label}.wopIds must contain unique published entry IDs`);
    }
    if (isNonemptyString(entry.term)) {
      const normalized = normalizeIdentity(entry.term);
      if (searchByTerm.has(normalized)) errors.push(`${label}.term duplicates another search term`);
      else searchByTerm.set(normalized, entry);
    }
    validatePublicText(entry, label, errors);
  });

  for (const [normalized, collision] of identityOwners) {
    if (collision.ids.size < 2) continue;
    const expectedIds = [...collision.ids].sort();
    const search = searchByTerm.get(normalized);
    const actualIds = Array.isArray(search?.wopIds) ? [...search.wopIds].sort() : [];
    if (search?.kind !== 'ambiguous' || expectedIds.join('\u0000') !== actualIds.join('\u0000')) {
      errors.push(`cross-record identity ${JSON.stringify(collision.display)} must be an ambiguous search term naming every matching entry`);
    }
    for (const identity of collision.values) {
      const routeSlug = identityRouteSlug(identity);
      if (routeSlug && aliasSlugs.has(routeSlug)) {
        errors.push(`ambiguous identity ${JSON.stringify(collision.display)} cannot have the alias route ${routeSlug}`);
      }
    }
  }

  if (errors.length) throw new SnapshotValidationError(errors);
  return snapshot;
}

export function snapshotFile(sourceDirectory) {
  return path.join(sourceDirectory, 'snapshot.json');
}
