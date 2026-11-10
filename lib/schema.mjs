import path from 'node:path';
import { validateSynthesisRoutes } from './synthesis-routes.mjs';
import { validateResearch } from './research.mjs';
import {
  isNonemptyString,
  isPlainObject,
  validatePublicText,
  validateSourceRecord
} from './source-policy.mjs';

export const SNAPSHOT_SCHEMA = 'wop-publication-snapshot-v2';
export const LEGACY_SNAPSHOT_SCHEMA = 'wop-publication-snapshot-v1';
export const ARTICLE_TYPE = 'polymer_entry';
export const SECTION_KEYS = Object.freeze([
  'overview',
  'history',
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
export const STRUCTURE_REVIEW_STATUSES = new Set(['pending', 'draft', 'reviewed']);
export const CONTEXTUAL_STRUCTURE_REVIEW_STATUSES = new Set(['draft', 'reviewed']);
export const STRUCTURE_REPRESENTATION_TYPES = new Set([
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
export const STRUCTURE_FIDELITIES = new Set(['exact', 'representative', 'schematic']);
export const STRUCTURAL_DEPICTIONS_SUPPORT = 'structuralDepictions';

const WOP_ID = /^wop-[0-9]{6}$/;
const SLUG = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const CHEMISTRY_CLASS = /^[a-z0-9]+(?:_[a-z0-9]+)*$/;
const RELATIONSHIP_KINDS = new Set(['broader', 'narrower', 'related']);
const SEARCH_KINDS = new Set(['ambiguous', 'umbrella', 'application']);
const METHODOLOGY_SUPPORTS = new Set([
  'taxonomy', 'nomenclature', 'commodity_prevalence', 'processing_framework',
  'biomedical_scope', 'natural_polymer_scope'
]);
const ARTICLE_SUPPORTS = new Set([...SECTION_KEYS, STRUCTURAL_DEPICTIONS_SUPPORT]);
const ARTICLE_REQUIRED_KEYS = new Set([
  'type', 'wopId', 'canonicalSlug', 'canonicalName', 'alternateNames',
  'abbreviations', 'entryKind', 'taxonomy', 'relationships', 'sections',
  'sources', 'maturity', 'structuralDepictions'
]);
const ARTICLE_KEYS = new Set([...ARTICLE_REQUIRED_KEYS, 'contextualStructures', 'synthesisRoutes', 'evidence', 'research']);
const STRUCTURE_DEFINITION_KEYS = new Set(['structureId', 'molfileV3000']);
const STRUCTURAL_DEPICTIONS_KEYS = new Set([
  'reviewStatus', 'representationType', 'scopeNote', 'sourceIds', 'items'
]);
const STRUCTURAL_DEPICTION_ITEM_REQUIRED_KEYS = new Set([
  'structureId', 'label', 'fidelity', 'altText', 'caption'
]);
const STRUCTURAL_DEPICTION_ITEM_KEYS = new Set([
  ...STRUCTURAL_DEPICTION_ITEM_REQUIRED_KEYS,
  'notation'
]);
const CONTEXTUAL_STRUCTURE_KEYS = new Set(['feedstocksAndSynthesis', 'processing']);
const CONTEXTUAL_STRUCTURE_GROUP_KEYS = new Set([
  'reviewStatus', 'scopeNote', 'sourceIds', 'items'
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

function validateStructuralDepictionItem(item, location, errors) {
  if (!exactShape(item, STRUCTURAL_DEPICTION_ITEM_KEYS, STRUCTURAL_DEPICTION_ITEM_REQUIRED_KEYS, location, errors)) return;
  if (!SLUG.test(item.structureId || '')) errors.push(`${location}.structureId must be a lowercase slug`);
  for (const key of ['label', 'altText', 'caption']) requiredString(item[key], `${location}.${key}`, errors);
  if (!STRUCTURE_FIDELITIES.has(item.fidelity)) errors.push(`${location}.fidelity is invalid`);
  if (Object.hasOwn(item, 'notation')) requiredString(item.notation, `${location}.notation`, errors);
  validatePublicText(item, location, errors);
}

function validateStructuralSourceIds(article, sourceIds, location, errors) {
  if (!Array.isArray(article.sources) || !Array.isArray(sourceIds)) return;
  const sourcesById = new Map(article.sources
    .filter((source) => isPlainObject(source) && isNonemptyString(source.sourceId))
    .map((source) => [source.sourceId, source]));
  for (const sourceId of sourceIds) {
    const source = sourcesById.get(sourceId);
    if (!source) errors.push(`${location}.sourceIds names unknown article source ${sourceId}`);
    else if (!Array.isArray(source.supports) || !source.supports.includes(STRUCTURAL_DEPICTIONS_SUPPORT)) {
      errors.push(`${location}.sourceIds source ${sourceId} does not support ${STRUCTURAL_DEPICTIONS_SUPPORT}`);
    }
  }
}

function validateStructuralDepictions(article, label, errors) {
  const value = article.structuralDepictions;
  const location = `${label}.structuralDepictions`;
  if (!exactShape(value, STRUCTURAL_DEPICTIONS_KEYS, STRUCTURAL_DEPICTIONS_KEYS, location, errors)) return;

  if (!STRUCTURE_REVIEW_STATUSES.has(value.reviewStatus)) {
    errors.push(`${location}.reviewStatus is invalid`);
  }
  if (!STRUCTURE_REPRESENTATION_TYPES.has(value.representationType)) {
    errors.push(`${location}.representationType is invalid`);
  }
  requiredString(value.scopeNote, `${location}.scopeNote`, errors);
  validateUniqueStrings(value.sourceIds, `${location}.sourceIds`, errors, {
    minimum: value.reviewStatus === 'pending' ? 0 : 1,
    pattern: SLUG
  });

  if (!Array.isArray(value.items)) {
    errors.push(`${location}.items must be an array`);
  } else {
    value.items.forEach((item, itemIndex) => {
      const itemLocation = `${location}.items[${itemIndex}]`;
      validateStructuralDepictionItem(item, itemLocation, errors);
    });
  }

  const items = Array.isArray(value.items) ? value.items : [];
  const sourceIds = Array.isArray(value.sourceIds) ? value.sourceIds : [];
  if (value.reviewStatus === 'pending') {
    if (article.maturity?.contentMaturity !== 'stub') errors.push(`${location}.reviewStatus pending is allowed only on stub records`);
    if (value.representationType !== 'undetermined') errors.push(`${location}.representationType must be undetermined while pending`);
    if (items.length) errors.push(`${location}.items must be empty while pending`);
    if (sourceIds.length) errors.push(`${location}.sourceIds must be empty while pending`);
  } else {
    if (value.representationType === 'undetermined') errors.push(`${location}.representationType cannot be undetermined after research begins`);
    if (value.representationType !== 'no_unique_repeat' && items.length === 0) {
      errors.push(`${location}.items must contain at least one depiction unless representationType is no_unique_repeat`);
    }
    const singleItemTypes = new Set([
      'constitutional_repeat_unit',
      'stereochemical_repeat_segment'
    ]);
    if (singleItemTypes.has(value.representationType) && items.length !== 1) {
      errors.push(`${location}.items must contain exactly one depiction for representationType ${value.representationType}`);
    }
    if (['copolymer_unit_set', 'component_set'].includes(value.representationType) && items.length < 2) {
      errors.push(`${location}.items must contain at least two depictions for representationType ${value.representationType}`);
    }
    if (value.representationType === 'no_unique_repeat' && items.length !== 0) {
      errors.push(`${location}.items must be empty for representationType no_unique_repeat`);
    }
  }

  validateStructuralSourceIds(article, sourceIds, location, errors);
  validatePublicText({
    reviewStatus: value.reviewStatus,
    representationType: value.representationType,
    scopeNote: value.scopeNote,
    sourceIds: value.sourceIds
  }, location, errors);
}

function validateContextualStructureGroup(article, value, location, errors) {
  if (!exactShape(value, CONTEXTUAL_STRUCTURE_GROUP_KEYS, CONTEXTUAL_STRUCTURE_GROUP_KEYS, location, errors)) return;
  if (!CONTEXTUAL_STRUCTURE_REVIEW_STATUSES.has(value.reviewStatus)) {
    errors.push(`${location}.reviewStatus is invalid`);
  }
  requiredString(value.scopeNote, `${location}.scopeNote`, errors);
  validateUniqueStrings(value.sourceIds, `${location}.sourceIds`, errors, { minimum: 1, pattern: SLUG });
  if (!Array.isArray(value.items) || value.items.length === 0) {
    errors.push(`${location}.items must be an array with at least one depiction`);
  } else {
    value.items.forEach((item, itemIndex) => {
      validateStructuralDepictionItem(item, `${location}.items[${itemIndex}]`, errors);
    });
  }
  validateStructuralSourceIds(article, value.sourceIds, location, errors);
  validatePublicText({
    reviewStatus: value.reviewStatus,
    scopeNote: value.scopeNote,
    sourceIds: value.sourceIds
  }, location, errors);
}

function validateContextualStructures(article, label, errors) {
  validateSynthesisRoutes(article, label, errors);
  if (article.synthesisRoutes) validatePublicText(article.synthesisRoutes, `${label}.synthesisRoutes`, errors);
  if (!Object.hasOwn(article, 'contextualStructures')) return;
  const value = article.contextualStructures;
  const location = `${label}.contextualStructures`;
  if (!exactShape(value, CONTEXTUAL_STRUCTURE_KEYS, new Set(), location, errors)) return;
  if (Object.keys(value).length === 0) errors.push(`${location} must contain at least one section group`);
  for (const key of CONTEXTUAL_STRUCTURE_KEYS) {
    if (Object.hasOwn(value, key)) {
      validateContextualStructureGroup(article, value[key], `${location}.${key}`, errors);
    }
  }
}

function validateStructureEvidenceMappings(article, label, errors) {
  if (!Array.isArray(article.sources)) return;
  const namedSourceIds = new Set(Array.isArray(article.structuralDepictions?.sourceIds)
    ? article.structuralDepictions.sourceIds
    : []);
  if (isPlainObject(article.contextualStructures)) {
    for (const key of CONTEXTUAL_STRUCTURE_KEYS) {
      const sourceIds = article.contextualStructures[key]?.sourceIds;
      if (Array.isArray(sourceIds)) sourceIds.forEach((sourceId) => namedSourceIds.add(sourceId));
    }
  }
  const mapped = article.sources
    .filter((source) => Array.isArray(source?.supports) && source.supports.includes(STRUCTURAL_DEPICTIONS_SUPPORT))
    .map((source) => source.sourceId);
  for (const sourceId of mapped) {
    if (!namedSourceIds.has(sourceId)) {
      errors.push(`${label} does not name mapped structure source ${sourceId} in structuralDepictions or contextualStructures`);
    }
  }
}

function normalizedMolfile(value) {
  return String(value).replaceAll('\r\n', '\n').trim();
}

function normalizedConnectionTable(value) {
  const molfile = normalizedMolfile(value);
  const ctab = molfile.indexOf('M  V30 BEGIN CTAB');
  return ctab === -1 ? molfile : molfile.slice(ctab);
}

const SUPERSCRIPT_DIGITS = Object.freeze({
  0: '⁰', 1: '¹', 2: '²', 3: '³', 4: '⁴',
  5: '⁵', 6: '⁶', 7: '⁷', 8: '⁸', 9: '⁹'
});

function superscriptNumber(value) {
  return String(value).split('').map((digit) => SUPERSCRIPT_DIGITS[digit]).join('');
}

function markushMetadata(molfileV3000) {
  const logical = normalizedMolfile(molfileV3000).replace(/-\nM  V30 /g, '');
  const genericRCount = [...logical.matchAll(/^M  V30 \d+ R\s/gm)].length;
  const numberedRAtomCount = [...logical.matchAll(/^M  V30 \d+ R#\s/gm)].length;
  const numberedRGroupNumbers = [...logical.matchAll(
    /^M  V30 \d+ R#\s.*?(?:^|\s)RGROUPS=\(1\s+([1-9]\d*)\)(?=\s|$)/gm
  )].map((match) => Number(match[1]));
  const hasNumberedR = /^M  V30 \d+ R#\s/m.test(logical);
  return { genericRCount, numberedRAtomCount, numberedRGroupNumbers, hasNumberedR };
}

function notationNamesRGroup(notation, groupNumber) {
  if (!isNonemptyString(notation)) return false;
  const superscript = superscriptNumber(groupNumber);
  if (new RegExp(`(?:^|[^A-Za-z0-9])R${superscript}(?![⁰¹²³⁴⁵⁶⁷⁸⁹])`).test(notation)) return true;
  return new RegExp(`(?:^|[^A-Za-z0-9])R(?:\\^)?${groupNumber}(?!\\d)`).test(notation);
}

function validateChemicalStructures(value, errors) {
  if (!Array.isArray(value)) {
    errors.push('chemicalStructures must be an array');
    return new Map();
  }
  const byId = new Map();
  const contentOwners = new Map();
  value.forEach((structure, index) => {
    const label = `chemicalStructures[${index}]`;
    if (!exactShape(structure, STRUCTURE_DEFINITION_KEYS, STRUCTURE_DEFINITION_KEYS, label, errors)) return;
    if (!SLUG.test(structure.structureId || '')) errors.push(`${label}.structureId must be a lowercase slug`);
    if (byId.has(structure.structureId)) errors.push(`${label}.structureId is duplicated`);
    else byId.set(structure.structureId, structure);
    if (!isNonemptyString(structure.molfileV3000)) {
      errors.push(`${label}.molfileV3000 must be a non-empty string`);
      return;
    }
    const molfile = normalizedMolfile(structure.molfileV3000);
    for (const marker of ['V3000', 'M  V30 BEGIN CTAB', 'M  V30 BEGIN ATOM', 'M  V30 END ATOM', 'M  V30 END CTAB', 'M  END']) {
      if (!molfile.includes(marker)) errors.push(`${label}.molfileV3000 is missing ${marker}`);
    }
    const markush = markushMetadata(molfile);
    if (markush.hasNumberedR && markush.numberedRGroupNumbers.length !== markush.numberedRAtomCount) {
      errors.push(`${label}.molfileV3000 requires exactly one RGROUPS=(1 n) label on every numbered R# atom`);
    }
    if (markush.numberedRGroupNumbers.some((groupNumber) => groupNumber > 32)) {
      errors.push(`${label}.molfileV3000 numbered R-group labels must be from 1 to 32`);
    }
    if (/^M  V30 \d+ "R#?"\s/m.test(molfile)) {
      errors.push(`${label}.molfileV3000 Markush R atom symbols must not be quoted`);
    }
    if (/\b(?:https?:\/\/|file:\/\/)|<\/?(?:script|foreignObject)\b/i.test(molfile)) {
      errors.push(`${label}.molfileV3000 contains forbidden external or markup content`);
    }
    validatePublicText(structure.molfileV3000, `${label}.molfileV3000`, errors);
    const connectionTable = normalizedConnectionTable(molfile);
    if (contentOwners.has(connectionTable)) {
      errors.push(`${label}.molfileV3000 duplicates ${contentOwners.get(connectionTable)}; reuse one structure definition`);
    } else {
      contentOwners.set(connectionTable, structure.structureId);
    }
  });
  return byId;
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
  if (!exactShape(article, ARTICLE_KEYS, ARTICLE_REQUIRED_KEYS, label, errors)) return;
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

  validateStructuralDepictions(article, label, errors);
  validateContextualStructures(article, label, errors);
  validateStructureEvidenceMappings(article, label, errors);
  validateResearch(article, label, errors, SECTION_KEYS);

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
  const topKeys = new Set(['schema', 'methodology', 'chemicalStructures', 'polymers', 'aliases', 'searchTerms']);
  exactShape(snapshot, topKeys, topKeys, 'snapshot', errors);
  if (snapshot.schema !== SNAPSHOT_SCHEMA) errors.push(`schema must be ${SNAPSHOT_SCHEMA}`);
  validateMethodology(snapshot.methodology, errors);
  const structuresById = validateChemicalStructures(snapshot.chemicalStructures, errors);

  const polymers = Array.isArray(snapshot.polymers) ? snapshot.polymers : [];
  const aliasRecords = Array.isArray(snapshot.aliases) ? snapshot.aliases : [];
  const searchRecords = Array.isArray(snapshot.searchTerms) ? snapshot.searchTerms : [];
  if (polymers.length === 0) errors.push('polymers must be a non-empty array');
  else polymers.forEach((article, index) => validateArticle(article, index, errors));

  const usedStructureIds = new Set();
  for (const [articleIndex, article] of polymers.entries()) {
    const itemGroups = [];
    if (Array.isArray(article?.structuralDepictions?.items)) {
      itemGroups.push({
        items: article.structuralDepictions.items,
        location: `polymers[${articleIndex}].structuralDepictions.items`
      });
    }
    if (isPlainObject(article?.contextualStructures)) {
      for (const key of CONTEXTUAL_STRUCTURE_KEYS) {
        if (Array.isArray(article.contextualStructures[key]?.items)) {
          itemGroups.push({
            items: article.contextualStructures[key].items,
            location: `polymers[${articleIndex}].contextualStructures.${key}.items`
          });
        }
      }
    }
    for (const { items, location } of itemGroups) {
      for (const [itemIndex, item] of items.entries()) {
        if (!structuresById.has(item?.structureId)) {
          errors.push(`${location}[${itemIndex}].structureId does not name a chemical structure`);
        } else {
          usedStructureIds.add(item.structureId);
          const definition = structuresById.get(item.structureId);
          const markush = markushMetadata(definition.molfileV3000);
          const hasMarkush = markush.genericRCount > 0 || markush.hasNumberedR;
          if (hasMarkush && !isNonemptyString(item.notation)) {
            errors.push(`${location}[${itemIndex}].notation is required for a Markush R structure`);
          } else if (isNonemptyString(item.notation)) {
            for (const groupNumber of new Set(markush.numberedRGroupNumbers)) {
              if (!notationNamesRGroup(item.notation, groupNumber)) {
                errors.push(`${location}[${itemIndex}].notation must define displayed R${superscriptNumber(groupNumber)}`);
              }
            }
            if (markush.genericRCount > 1 && !markush.hasNumberedR &&
                (!/each R/i.test(item.notation) ||
                 !/(?:same|identical|equivalent)/i.test(item.notation))) {
              errors.push(`${location}[${itemIndex}].notation must state that repeated unnumbered R sites are equivalent; number independent sites`);
            }
          }
        }
      }
    }
  }
  for (const structureId of structuresById.keys()) {
    if (!usedStructureIds.has(structureId)) errors.push(`chemical structure ${structureId} is not used by any polymer entry`);
  }

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
