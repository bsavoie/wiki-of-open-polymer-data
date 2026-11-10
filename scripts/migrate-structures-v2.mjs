import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import structureSpecsA from './structure-specs-a.mjs';
import structureSpecsB from './structure-specs-b.mjs';
import structureSpecOverrides from './structure-spec-overrides.mjs';
import evidenceSupplements, { unresolved as unresolvedEvidence } from './structure-evidence-supplements.mjs';
import { validateSnapshot } from '../lib/schema.mjs';
import { validateChemicalStructures as validateRenderedStructures } from '../lib/structure-renderer.mjs';
import { importSnapshot } from '../lib/importer.mjs';

const scriptDirectory = path.dirname(fileURLToPath(import.meta.url));
const repository = path.resolve(scriptDirectory, '..');
const v1Path = path.join(repository, 'public-data', 'wop-publication-snapshot-v1', 'snapshot.json');
const v2Directory = path.join(repository, 'public-data', 'wop-publication-snapshot-v2');
const fixtureV1Path = path.join(repository, 'fixtures', 'wop-publication-snapshot-v1', 'snapshot.json');
const fixtureV2Directory = path.join(repository, 'fixtures', 'wop-publication-snapshot-v2');
const helperPath = path.join(scriptDirectory, 'generate-v3000.py');

const v1 = JSON.parse(await fs.readFile(v1Path, 'utf8'));
const specs = { ...structureSpecsA, ...structureSpecsB, ...structureSpecOverrides };
const contextualStructureKeys = ['feedstocksAndSynthesis', 'processing'];

function contextualGroups(spec) {
  if (spec.contextualStructures === undefined) return [];
  if (!spec.contextualStructures || typeof spec.contextualStructures !== 'object' ||
      Array.isArray(spec.contextualStructures)) {
    throw new Error('contextualStructures must be an object');
  }
  const unexpected = Object.keys(spec.contextualStructures)
    .filter((key) => !contextualStructureKeys.includes(key));
  if (unexpected.length || !Object.keys(spec.contextualStructures).length) {
    throw new Error(`contextualStructures has invalid or empty section keys: ${unexpected.join(', ') || 'none'}`);
  }
  return contextualStructureKeys
    .filter((key) => Object.hasOwn(spec.contextualStructures, key))
    .map((key) => [key, spec.contextualStructures[key]]);
}

function allSpecItems(spec) {
  return [
    ...spec.items,
    ...contextualGroups(spec).flatMap(([, group]) => group.items || [])
  ];
}
const polymerIds = new Set(v1.polymers.map((polymer) => polymer.wopId));
const specIds = new Set(Object.keys(specs));

for (const wopId of polymerIds) {
  if (!specIds.has(wopId)) throw new Error(`Missing structure migration specification for ${wopId}`);
}
for (const wopId of specIds) {
  if (!polymerIds.has(wopId)) throw new Error(`Structure migration specification names unknown ${wopId}`);
}
for (const wopId of Object.keys(evidenceSupplements)) {
  if (!polymerIds.has(wopId)) throw new Error(`Structure-evidence supplement names unknown ${wopId}`);
  if (Object.hasOwn(unresolvedEvidence, wopId)) {
    throw new Error(`Structure-evidence supplement ${wopId} is also marked unresolved`);
  }
}
for (const [wopId, reason] of Object.entries(unresolvedEvidence)) {
  if (!polymerIds.has(wopId)) throw new Error(`Unresolved structure-evidence record names unknown ${wopId}`);
  if (typeof reason !== 'string' || !reason.trim()) {
    throw new Error(`Unresolved structure-evidence record ${wopId} requires a specific reason`);
  }
}

const structureInputs = new Map();
const smilesOwners = new Map();
for (const [wopId, spec] of Object.entries(specs)) {
  if (!spec || typeof spec !== 'object' || !Array.isArray(spec.items)) {
    throw new Error(`${wopId} has a malformed migration specification`);
  }
  if (!['draft', 'reviewed'].includes(spec.reviewStatus)) {
    throw new Error(`${wopId} must record an explicit draft or reviewed structure status`);
  }
  if (!Array.isArray(spec.sourceIds) || spec.sourceIds.length === 0 || new Set(spec.sourceIds).size !== spec.sourceIds.length) {
    throw new Error(`${wopId} must explicitly name one or more unique verified structure source IDs`);
  }
  for (const [sectionKey, group] of contextualGroups(spec)) {
    if (!group || typeof group !== 'object' || Array.isArray(group) ||
        typeof group.scopeNote !== 'string' || !group.scopeNote.trim() ||
        !Array.isArray(group.items) || group.items.length === 0) {
      throw new Error(`${wopId} contextualStructures.${sectionKey} requires a scopeNote and one or more items`);
    }
    if (group.sourceIds !== undefined && (!Array.isArray(group.sourceIds) || !group.sourceIds.length ||
        new Set(group.sourceIds).size !== group.sourceIds.length)) {
      throw new Error(`${wopId} contextualStructures.${sectionKey}.sourceIds must be a non-empty unique list when provided`);
    }
  }
  for (const item of allSpecItems(spec)) {
    if (!item.key || (!item.smiles && !item.molfilePath) || (item.smiles && item.molfilePath)) {
      throw new Error(`${wopId} items require a key and exactly one migration SMILES or curated molfile path`);
    }
    if (item.polymerSgroup !== undefined && !item.smiles) {
      throw new Error(`${wopId} item ${item.key} can request generated polymer S-group metadata only with migration SMILES`);
    }
    if (item.markushLabels !== undefined) {
      const labels = item.markushLabels;
      if (!item.smiles || !labels || typeof labels !== 'object' || Array.isArray(labels) ||
          !Object.keys(labels).length || Object.entries(labels).some(([mapNumber, label]) =>
            !/^[1-9][0-9]*$/.test(mapNumber) || !/^R(?:[1-9]|[12][0-9]|3[0-2])?$/.test(label))) {
        throw new Error(`${wopId} item ${item.key} markushLabels must map positive atom-map numbers to R or R1 through R32 on a migration SMILES`);
      }
    }
    if (item.unknownTetrahedralStereo !== undefined && typeof item.unknownTetrahedralStereo !== 'boolean') {
      throw new Error(`${wopId} item ${item.key} unknownTetrahedralStereo must be true or false`);
    }
    const input = item.smiles
      ? {
          structureId: item.key,
          smiles: item.smiles,
          ...(item.polymerSgroup !== undefined ? { polymerSgroup: item.polymerSgroup } : {}),
          ...(item.markushLabels !== undefined ? { markushLabels: item.markushLabels } : {}),
          ...(item.unknownTetrahedralStereo !== undefined
            ? { unknownTetrahedralStereo: item.unknownTetrahedralStereo }
            : {})
        }
      : { structureId: item.key, molfilePath: item.molfilePath };
    const prior = structureInputs.get(item.key);
    if (prior && JSON.stringify(prior) !== JSON.stringify(input)) {
      throw new Error(`Structure key ${item.key} is assigned inconsistent migration inputs`);
    }
    if (item.smiles) {
      const equivalentOwner = smilesOwners.get(item.smiles);
      if (equivalentOwner && equivalentOwner !== item.key) {
        throw new Error(`Migration SMILES for ${item.key} duplicates ${equivalentOwner}; reuse the shared structure key`);
      }
      smilesOwners.set(item.smiles, item.key);
    }
    structureInputs.set(item.key, input);
  }
}

const generatedInputs = [...structureInputs.values()].filter((input) => input.smiles);
const helper = spawnSync('python3', [helperPath], {
  cwd: repository,
  encoding: 'utf8',
  input: JSON.stringify(generatedInputs),
  maxBuffer: 64 * 1024 * 1024
});
if (helper.error) throw helper.error;
if (helper.status !== 0) throw new Error(`V3000 generation failed:\n${helper.stderr.trim()}`);
const generatedStructures = JSON.parse(helper.stdout);
for (const input of structureInputs.values()) {
  if (!input.molfilePath) continue;
  const absolutePath = path.resolve(scriptDirectory, input.molfilePath);
  const curatedRoot = path.resolve(scriptDirectory, 'curated-structures');
  if (!absolutePath.startsWith(`${curatedRoot}${path.sep}`)) {
    throw new Error(`Curated structure path for ${input.structureId} escapes scripts/curated-structures`);
  }
  generatedStructures.push({
    structureId: input.structureId,
    molfileV3000: await fs.readFile(absolutePath, 'utf8')
  });
}
const canonicalOwners = new Map();
for (const structure of generatedStructures) {
  if (!structure._migrationCanonicalSmiles) continue;
  const owner = canonicalOwners.get(structure._migrationCanonicalSmiles);
  if (owner && owner !== structure.structureId) {
    throw new Error(`Generated chemistry for ${structure.structureId} duplicates ${owner}; reuse the shared structure key`);
  }
  canonicalOwners.set(structure._migrationCanonicalSmiles, structure.structureId);
}
const chemicalStructures = generatedStructures
  .map(({ structureId, molfileV3000 }) => ({ structureId, molfileV3000 }))
  .sort((left, right) => left.structureId.localeCompare(right.structureId));

function recordsMatchExceptSupports(left, right) {
  const { supports: leftSupports, ...leftRecord } = left;
  const { supports: rightSupports, ...rightRecord } = right;
  return JSON.stringify(leftRecord) === JSON.stringify(rightRecord);
}

const polymers = v1.polymers.map((polymer) => {
  const spec = specs[polymer.wopId];
  const supplement = evidenceSupplements[polymer.wopId];
  let sourceIds = spec.sourceIds;
  let reviewStatus = spec.reviewStatus;
  let sources = polymer.sources.map((source) => ({ ...source, supports: [...source.supports] }));
  const supplementalSourceIds = new Set();

  if (supplement) {
    if (!Array.isArray(supplement.sources) || !Array.isArray(supplement.sourceIds) ||
        supplement.sourceIds.length === 0 || new Set(supplement.sourceIds).size !== supplement.sourceIds.length) {
      throw new Error(`${polymer.wopId} has a malformed structural-evidence supplement`);
    }
    // A supplement is the completed, independently sourced chemistry review
    // for entries that began as migration drafts. Promote only after the
    // supplement has passed the source/linkage checks below; unresolved gaps
    // are kept in the separate unresolved registry and cannot reach this path.
    reviewStatus = 'reviewed';
    sourceIds = supplement.sourceIds;
    const sourceIndex = new Map(sources.map((source, index) => [source.sourceId, index]));
    const supplementIds = new Set();
    for (const source of supplement.sources) {
      if (!source || typeof source !== 'object' || Array.isArray(source) || !source.sourceId ||
          supplementIds.has(source.sourceId)) {
        throw new Error(`${polymer.wopId} has a malformed or duplicate supplemental source`);
      }
      supplementIds.add(source.sourceId);
      supplementalSourceIds.add(source.sourceId);
      if (!Array.isArray(source.supports) || source.supports.length !== 1 || source.supports[0] !== 'structuralDepictions') {
        throw new Error(`${polymer.wopId} supplemental source ${source.sourceId} must support only structuralDepictions`);
      }
      const index = sourceIndex.get(source.sourceId);
      if (index === undefined) {
        sourceIndex.set(source.sourceId, sources.length);
        sources.push(source);
      } else if (!recordsMatchExceptSupports(sources[index], source)) {
        throw new Error(`${polymer.wopId} supplemental source ${source.sourceId} conflicts with its legacy record`);
      }
    }
  }

  const resolvedContextualGroups = contextualGroups(spec).map(([sectionKey, group]) => [sectionKey, {
    ...group,
    sourceIds: group.sourceIds || sourceIds,
    reviewStatus: group.reviewStatus || reviewStatus
  }]);
  const selectedStructureSourceIds = [...new Set([
    ...sourceIds,
    ...resolvedContextualGroups.flatMap(([, group]) => group.sourceIds)
  ])];
  for (const sourceId of supplementalSourceIds) {
    if (!selectedStructureSourceIds.includes(sourceId)) {
      throw new Error(`${polymer.wopId} supplemental source ${sourceId} is not named by a hero or contextual structural record`);
    }
  }
  const sourcesById = new Map(sources.map((source) => [source.sourceId, source]));
  for (const sourceId of selectedStructureSourceIds) {
    if (!sourcesById.has(sourceId)) {
      throw new Error(`${polymer.wopId} explicitly names unknown structure source ${sourceId}`);
    }
  }
  const selectedSources = new Set(selectedStructureSourceIds);
  sources = sources.map((source) => selectedSources.has(source.sourceId)
    ? { ...source, supports: [...new Set([...source.supports, 'structuralDepictions'])] }
    : { ...source, supports: source.supports.filter((support) => support !== 'structuralDepictions') });
  const contextualStructures = Object.fromEntries(resolvedContextualGroups.map(([sectionKey, group]) => [sectionKey, {
    reviewStatus: group.reviewStatus,
    scopeNote: group.scopeNote,
    sourceIds: group.sourceIds,
    items: group.items.map(({ key, label, fidelity, altText, caption, notation }) => ({
      structureId: key,
      label,
      fidelity,
      altText,
      caption,
      ...(notation ? { notation } : {})
    }))
  }]));
  return {
    ...polymer,
    sources,
    structuralDepictions: {
      reviewStatus,
      representationType: spec.representationType,
      scopeNote: spec.scopeNote,
      sourceIds,
      items: spec.items.map(({ key, label, fidelity, altText, caption, notation }) => ({
        structureId: key,
        label,
        fidelity,
        altText,
        caption,
        ...(notation ? { notation } : {})
      }))
    },
    ...(resolvedContextualGroups.length ? { contextualStructures } : {})
  };
});

const v2 = {
  schema: 'wop-publication-snapshot-v2',
  methodology: v1.methodology,
  chemicalStructures,
  polymers,
  aliases: v1.aliases,
  searchTerms: v1.searchTerms
};
validateSnapshot(v2);
await validateRenderedStructures(v2.chemicalStructures);

const fixtureV1 = JSON.parse(await fs.readFile(fixtureV1Path, 'utf8'));
const fixtureV2 = {
  schema: 'wop-publication-snapshot-v2',
  methodology: fixtureV1.methodology,
  chemicalStructures: [],
  polymers: fixtureV1.polymers.map((polymer) => ({
    ...polymer,
    structuralDepictions: {
      reviewStatus: 'pending',
      representationType: 'undetermined',
      scopeNote: 'This stub does not yet publish a sourced structural depiction.',
      sourceIds: [],
      items: []
    }
  })),
  aliases: fixtureV1.aliases,
  searchTerms: fixtureV1.searchTerms
};
validateSnapshot(fixtureV2);

await fs.mkdir(fixtureV2Directory, { recursive: true });
const migrationRoot = await fs.mkdtemp(path.join(os.tmpdir(), 'wop-structure-migration-'));
const migrationSource = path.join(migrationRoot, 'source');
try {
  await fs.mkdir(migrationSource);
  await fs.writeFile(path.join(migrationSource, 'snapshot.json'), `${JSON.stringify(v2, null, 2)}\n`);
  // The checked-in v2 corpus is still the explicitly provisional migration
  // baseline. This curator-only command may replace provisional structure IDs
  // while chemistry review is in progress; the normal public import path keeps
  // the released-corpus stability guard enabled.
  await importSnapshot(migrationSource, v2Directory, {
    allowProvisionalStructureReplacement: true
  });
} finally {
  await fs.rm(migrationRoot, { recursive: true, force: true });
}
await fs.writeFile(path.join(fixtureV2Directory, 'snapshot.json'), `${JSON.stringify(fixtureV2, null, 2)}\n`);

const reviewed = polymers.filter((polymer) => polymer.structuralDepictions.reviewStatus === 'reviewed').length;
const renderedItems = polymers.reduce((count, polymer) => count + polymer.structuralDepictions.items.length +
  Object.values(polymer.contextualStructures || {}).reduce((groupCount, group) => groupCount + group.items.length, 0), 0);
console.log(`Migrated ${reviewed} reviewed entries with ${chemicalStructures.length} definitions and ${renderedItems} depiction items.`);
