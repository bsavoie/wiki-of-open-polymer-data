import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { CORE_ATTRIBUTE_KEYS, SECTION_KEYS, validateSnapshot } from './schema.mjs';
import { isPublicSourceUrl } from './source-policy.mjs';
import { renderSynthesisPreview } from './synthesis-preview.mjs';
import { renderMethodologyWorkflow } from './methodology-view.mjs';
import { copyHistoryBundle } from './structure-history.mjs';
import {
  STRUCTURE_RENDERER_VERSION,
  STRUCTURE_STYLE_ID,
  renderChemicalStructures
} from './structure-renderer.mjs';

const SITE_DIRECTORY = path.dirname(fileURLToPath(import.meta.url));
const SITE_ASSETS = path.resolve(SITE_DIRECTORY, '../site-assets');
const BUILD_SCHEMA = 'wop-static-build-v2';
const LEGACY_BUILD_SCHEMA = 'wop-static-build-v1';
const BUILD_GENERATOR = 'wiki-of-open-polymer-data';
const ASSET_FILES = ['site.css', 'catalog-refresh.css', 'article-refresh.css', 'methodology-flow.css', 'InterVariable.woff2', 'inter.LICENSE', 'search.js', 'home-tabs.js', 'article.js', 'research.js', 'synthesis-preview.js', 'synthesis-preview.css'];

export const PRIMARY_CLASS_LABELS = Object.freeze({
  commodity_thermoplastic: 'Commodity thermoplastics',
  engineering_thermoplastic: 'Engineering thermoplastics',
  high_performance_polymer: 'High-performance polymers',
  thermoset: 'Thermosets',
  elastomer: 'Elastomers',
  thermoplastic_elastomer: 'Thermoplastic elastomers',
  fiber_and_textile: 'Fibers and textiles',
  natural_and_semisynthetic: 'Natural and semisynthetic polymers',
  biodegradable_and_biomedical: 'Biodegradable and biomedical polymers',
  functional_and_specialty: 'Functional and specialty polymers',
  water_soluble_and_hydrogel: 'Water-soluble polymers and hydrogels'
});

const SECTION_LABELS = Object.freeze({
  overview: 'Overview',
  history: 'History',
  nomenclature: 'Nomenclature and scope',
  feedstocksAndSynthesis: 'Feedstocks and synthesis',
  mechanicalProperties: 'Mechanical properties',
  processing: 'Processing',
  structureAndMorphology: 'Structure and morphology',
  properties: 'Thermal and other properties',
  applications: 'Applications',
  degradationAndStability: 'Degradation and stability',
  recyclingAndEndOfLife: 'Recycling and end of life',
  healthSafetyAndRegulation: 'Health, safety, and regulation',
  limitationsAndVariability: 'Limitations and variability'
});

const SOURCE_SUPPORT_LABELS = Object.freeze({
  ...SECTION_LABELS,
  structuralDepictions: 'Structural depictions'
});

const escapeHtml = (value) => String(value).replace(/[&<>'"]/g, (character) => ({
  '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;'
})[character]);

const humanize = (value) => String(value).replaceAll('_', ' ').replace(/\b\w/g, (letter) => letter.toUpperCase());

function jsonForHtml(value) {
  return JSON.stringify(value)
    .replace(/</g, '\\u003c')
    .replace(/\u2028/g, '\\u2028')
    .replace(/\u2029/g, '\\u2029');
}

function proseParagraphs(value) {
  return String(value)
    .trim()
    .split(/\r?\n\s*\r?\n/)
    .map((paragraph) => paragraph.trim())
    .filter(Boolean);
}

function renderProse(value) {
  return proseParagraphs(value).map((paragraph) => `<p>${escapeHtml(paragraph)}</p>`).join('');
}

function renderTechnicalProse(value) {
  const paragraphs = proseParagraphs(value);
  const rendered = paragraphs.map((paragraph, index) => {
    const className = paragraphs.length > 1 && index === 0 ? ' class="section-prose__opening"' : '';
    return `<p${className}>${escapeHtml(paragraph)}</p>`;
  }).join('');
  return `<div class="section-prose section-prose--technical">${rendered}</div>`;
}

function renderApplicationsProse(value) {
  const labels = ['Products and industries', 'Purchasing', 'Scale and evidence limits'];
  const paragraphs = proseParagraphs(value);
  if (paragraphs.length !== labels.length || !paragraphs.every((paragraph, index) => paragraph.startsWith(`${labels[index]}. `))) {
    return renderTechnicalProse(value);
  }
  return `<div class="applications-prose">${paragraphs.map((paragraph, index) => `<section class="applications-topic"><h3>${labels[index]}</h3>${renderProse(paragraph.slice(labels[index].length + 2))}</section>`).join('')}</div>`;
}

function siteHeader(root) {
  return `<a class="skip-link" href="#main-content">Skip to main content</a>
<header class="site-header"><div class="site-header__inner">
  <a class="wordmark" href="${root}" aria-label="Wiki of Open Polymer Data home"><span class="wordmark__mark" aria-hidden="true"><span class="wordmark__plate" data-letter="W">W</span><span class="wordmark__plate" data-letter="O">O</span><span class="wordmark__plate" data-letter="P">P</span><span class="wordmark__plate" data-letter="D">D</span></span><span class="wordmark__name"><span class="wordmark__initial" data-letter="W">W</span>iki <span class="wordmark__initial" data-letter="o">o</span>f <span class="wordmark__initial" data-letter="O">O</span>pen <span class="wordmark__initial" data-letter="P">P</span>olymer <span class="wordmark__initial" data-letter="D">D</span>ata</span></a>
  <nav class="site-nav" aria-label="Primary navigation"><a href="${root}#catalog">Catalog</a><a href="${root}#methodology">Methodology</a></nav>
</div></header>`;
}

function siteFooter(root) {
  return `<footer class="site-footer"><div><strong>Wiki of Open Polymer Data</strong><p>An open reference for polymer families and materials.</p></div><div><p>Code: Apache-2.0 · Original data: CC0 · Original prose: CC BY 4.0. Linked sources retain their own terms.</p><a href="${root}#catalog">Browse polymer entries →</a></div></footer>`;
}

function layout({ title, description, body, page = 'article', scripts = '' }) {
  const home = page === 'home';
  const root = home ? './' : '../../';
  const assetRoot = home ? 'assets/' : '../../assets/';
  const fullTitle = home ? 'Wiki of Open Polymer Data' : `${title} · Wiki of Open Polymer Data`;
  return `<!doctype html>
<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1">
<title>${escapeHtml(fullTitle)}</title><meta name="description" content="${escapeHtml(description)}"><link rel="stylesheet" href="${assetRoot}site.css?v=brand-20261111"><link rel="stylesheet" href="${assetRoot}catalog-refresh.css"><link rel="stylesheet" href="${assetRoot}article-refresh.css"><link rel="stylesheet" href="${assetRoot}methodology-flow.css"></head>
<body>${siteHeader(root)}<main id="main-content">${body}</main>${siteFooter(root)}${scripts}</body></html>`;
}

// Explicitly select source-reviewed examples when the material has no honest
// universal hero depiction. These remain contextual, never polymer repeats.
const CATALOG_CONTEXT_EXAMPLES = {
    'wop-000098': ['feedstocksAndSynthesis', 'dgeba-diepoxide-precursor', 'cycloaliphatic-diepoxide-precursor'],
    'wop-000099': ['feedstocksAndSynthesis', 'dgeba-diepoxide-precursor'],
    'wop-000100': ['feedstocksAndSynthesis', 'dgebf-para-para-diepoxide-precursor', 'dgebf-para-ortho-diepoxide-precursor', 'dgebf-ortho-ortho-diepoxide-precursor'],
    'wop-000101': ['feedstocksAndSynthesis', 'epoxy-cresol-li-fig1-open-motif'],
    'wop-000102': ['feedstocksAndSynthesis', 'tetraglycidyl-methylenedianiline-precursor'],
    'wop-000103': ['feedstocksAndSynthesis', 'cycloaliphatic-diepoxide-precursor'],
    'wop-000104': ['feedstocksAndSynthesis', 'propylene-itaconate-polyester-motif', 'propylene-succinate-polyester-motif'],
    'wop-000105': ['feedstocksAndSynthesis', 'ethylene-ortho-phthalate-polyester-motif', 'ethylene-maleate-polyester-motif'],
    'wop-000106': ['feedstocksAndSynthesis', 'ethylene-isophthalate-polyester-motif', 'ethylene-maleate-polyester-motif'],
    'wop-000107': ['feedstocksAndSynthesis', 'dicyclopentadiene-feedstock'],
    'wop-000108': ['feedstocksAndSynthesis', 'bisphenol-a-epoxy-vinyl-ester-precursor'],
    'wop-000109': ['feedstocksAndSynthesis', 'bisphenol-a-epoxy-vinyl-ester-precursor'],
    'wop-000110': ['feedstocksAndSynthesis', 'novolac-methacrylate-open-side-chain'],
    'wop-000121': ['processing', 'tetramethylol-ortho-hydroxybenzoguanamine-example'],
    'wop-000127': ['feedstocksAndSynthesis', 'bismaleimidodiphenylmethane-precursor'],
    'wop-000130': ['processing', 'four-aminophenoxy-phthalonitrile'],
    'wop-000133': ['feedstocksAndSynthesis', 'monoethyl-four-phenylethynylphthalate-endcapper']
};

function renderPolymerCard(polymer) {
  const searchable = [
    polymer.canonicalName,
    ...polymer.alternateNames,
    ...polymer.abbreviations,
    ...polymer.taxonomy.chemistryClasses
  ].join(' ').toLocaleLowerCase('en-US');
  const alternate = [...polymer.abbreviations, ...polymer.alternateNames].slice(0, 4);
  const category = PRIMARY_CLASS_LABELS[polymer.taxonomy.primaryClass] || humanize(polymer.taxonomy.primaryClass);
  const depiction = polymer.structuralDepictions;
  const [contextSection, ...exampleIds] = CATALOG_CONTEXT_EXAMPLES[polymer.wopId] || [];
  const context = depiction?.representationType === 'no_unique_repeat' && contextSection
    ? polymer.contextualStructures?.[contextSection] : null;
  const items = context ? context.items.filter((candidate) => exampleIds.includes(candidate.structureId)) : (depiction?.items || []);
  const depictionLabel = ({
    component_set: 'Separate components',
    copolymer_unit_set: 'Illustrative local units',
    family_representative_set: 'Representative structures',
    block_or_graft_architecture: 'Architecture segments',
    variable_substitution_motif: 'Possible local motifs',
    constitutional_repeat_unit: 'Constitutional repeat unit',
    stereochemical_repeat_segment: 'Stereochemical segment'
  })[depiction?.representationType] || 'Illustrative structure';
  const label = context ? `${contextSection === 'processing' ? 'Processing' : 'Synthesis'} example; not a complete polymer structure` : depictionLabel;
  const thumbnail = `<div class="polymer-card__components${items.length === 1 ? ' polymer-card__components--single' : ''}" aria-label="${escapeHtml(label)}"><span class="polymer-card__components-label">${escapeHtml(label)}</span><p class="polymer-card__components-scope">${escapeHtml(depiction?.scopeNote || 'A structural depiction is not yet available.')}</p>${context ? `<p class="polymer-card__components-scope">${escapeHtml(context.scopeNote)}</p>` : ''}${items.map((component) => `<figure class="polymer-card__component"><img src="assets/structures/${escapeHtml(encodeURIComponent(String(component.structureId)))}.svg" alt="${escapeHtml(component.altText)}" loading="lazy" decoding="async"><figcaption>${escapeHtml(component.label)}</figcaption><p class="polymer-card__component-notation">${escapeHtml(component.caption)}</p>${component.notation ? `<p class="polymer-card__component-notation">${escapeHtml(component.notation)}</p>` : ''}</figure>`).join('')}</div>`;
  return `<article class="polymer-card polymer-card--components" data-polymer-card data-wop-id="${escapeHtml(polymer.wopId)}" data-search="${escapeHtml(searchable)}" data-primary-class="${escapeHtml(polymer.taxonomy.primaryClass)}" data-behaviors="${escapeHtml(polymer.taxonomy.materialBehaviors.join(' '))}" data-market-tiers="${escapeHtml(polymer.taxonomy.marketTiers.join(' '))}">
    ${thumbnail}
    <div class="polymer-card__meta"><span>${escapeHtml(polymer.wopId)}</span></div>
    <h3><a href="polymers/${escapeHtml(polymer.canonicalSlug)}/">${escapeHtml(polymer.canonicalName)}</a></h3>
    ${alternate.length ? `<p class="polymer-card__aliases">${escapeHtml(alternate.join(' · '))}</p>` : ''}
    <p class="polymer-card__category">${escapeHtml(category)}</p>
  </article>`;
}

function renderMethodologySource(source) {
  return `<li><a href="${escapeHtml(source.contentUrl || source.url)}" rel="external noreferrer">${escapeHtml(source.citation)}</a><span>${escapeHtml(source.locator)} · ${escapeHtml(humanize(source.reuseStatus))}</span></li>`;
}

function renderEvidenceTable(polymer, section, citationIndex) {
  const entries = (polymer.evidence || []).filter((entry) => entry.section === section);
  if (!entries.length) return '';
  const rows = entries.map((entry) => {
    const value = entry.value.min === entry.value.max ? `${entry.value.min}` : `${entry.value.min}–${entry.value.max}`;
    const uncertainty = entry.value.uncertainty === undefined ? '' : ` ± ${entry.value.uncertainty}`;
    return `<tr id="evidence-${escapeHtml(entry.evidenceId)}"><th scope="row">${escapeHtml(entry.attribute)}<small>${escapeHtml(humanize(entry.kind))}</small></th><td>${escapeHtml(value + uncertainty)} ${escapeHtml(entry.value.units)}${entry.value.uncertaintyNote ? `<small>${escapeHtml(entry.value.uncertaintyNote)}</small>` : ''}</td><td>${escapeHtml(entry.material)}</td><td>${escapeHtml(entry.conditions)}<small>Method: ${escapeHtml(entry.method)}</small></td><td>${escapeHtml(entry.limitations)}<small>${escapeHtml(entry.locator)}</small>${renderCitationLinks([entry.sourceId], citationIndex)}</td></tr>`;
  }).join('');
  return `<section class="evidence-summary" aria-label="Qualified evidence"><h3>Qualified evidence</h3><p>Values apply only to the material and conditions listed. They are not family-wide design values.</p><div class="evidence-table-scroll" tabindex="0" role="region" aria-label="Evidence table; scroll horizontally on small screens"><table class="evidence-table"><caption>${escapeHtml(SECTION_LABELS[section])}: source-qualified records</caption><thead><tr><th scope="col">Attribute</th><th scope="col">Value</th><th scope="col">Material / grade</th><th scope="col">Conditions and method</th><th scope="col">Limits and source</th></tr></thead><tbody>${rows}</tbody></table></div></section>`;
}

export function renderHome(snapshot, { hasStructureHistory = false } = {}) {
  const polymers = [...snapshot.polymers].sort((left, right) => left.canonicalName.localeCompare(right.canonicalName));
  const classCounts = new Map();
  for (const polymer of polymers) classCounts.set(polymer.taxonomy.primaryClass, (classCounts.get(polymer.taxonomy.primaryClass) || 0) + 1);
  const classOptions = [...classCounts.entries()]
    .sort((left, right) => (PRIMARY_CLASS_LABELS[left[0]] || left[0]).localeCompare(PRIMARY_CLASS_LABELS[right[0]] || right[0]))
    .map(([value, count]) => `<option value="${escapeHtml(value)}">${escapeHtml(PRIMARY_CLASS_LABELS[value] || humanize(value))} (${count})</option>`)
    .join('');
  const behaviors = [...new Set(polymers.flatMap((polymer) => polymer.taxonomy.materialBehaviors))].sort();
  const behaviorOptions = behaviors.map((value) => `<option value="${escapeHtml(value)}">${escapeHtml(humanize(value))}</option>`).join('');
  const searchIndex = {
    terms: snapshot.searchTerms.map((term) => ({ term: term.term, wopIds: term.wopIds })),
    aliases: snapshot.aliases.map((alias) => ({ slug: alias.slug, wopId: alias.wopId }))
  };
  const body = `<section class="home-hero"><div><h1>The Wiki of Open Polymer Data is an experiment in using AI as an encyclopedist.</h1><p>The wiki was fully built by agents using open literature. The entire repository can be downloaded and forked at will. It will be updated from time to time when new models are released or when popular demand motivates a data expansion.</p><div class="corpus-stats"><span><strong>${polymers.length}</strong> canonical entries</span><span><strong>${classCounts.size}</strong> classes</span><span><strong>${snapshot.methodology.sources.length}</strong> seed-method sources</span></div></div></section>
<nav class="home-tabs" data-home-tabs hidden aria-label="Explore the wiki"><a id="home-tab-catalog" href="#catalog" data-home-tab>Catalog</a><a id="home-tab-methodology" href="#methodology" data-home-tab>Methodology</a></nav>
<section class="catalog" id="catalog" aria-labelledby="catalog-title"><header class="section-heading"><span class="eyebrow">Open polymer reference</span><h2 id="catalog-title">Polymer catalog</h2><p>Search names and abbreviations, then narrow by class or material behavior.</p></header>
  <form class="catalog-controls" data-catalog-controls>
    <label class="catalog-search"><span>Search</span><input type="search" placeholder="Try polyethylene, PEEK, nylon, or silicone" autocomplete="off" data-search-input></label>
    <label><span>Class</span><select data-class-filter><option value="">All classes</option>${classOptions}</select></label>
    <label><span>Behavior</span><select data-behavior-filter><option value="">All behaviors</option>${behaviorOptions}</select></label>
    <button type="reset" data-clear-filters>Clear</button>
  </form>
  <div class="catalog-summary" aria-live="polite"><strong data-result-count>${polymers.length}</strong> matching entries<span data-displayed-count></span></div>
  <div class="polymer-grid" id="polymer-results" data-polymer-grid>${polymers.map(renderPolymerCard).join('')}</div>
  <div class="catalog-expand"><button type="button" data-catalog-expand aria-controls="polymer-results" aria-expanded="false" hidden>Show all entries</button></div>
  <div class="empty-state" data-empty-state hidden><strong>No entry matches those filters.</strong><p>Try a canonical name, abbreviation, broader class, or clear the filters.</p></div>
</section>
<section class="methodology" id="methodology" aria-labelledby="methodology-title"><h2 id="methodology-title">How the wiki is built</h2>${renderMethodologyWorkflow()}<div><h3>A broad starting denominator</h3><p>${escapeHtml(snapshot.methodology.scope)}</p><p>${escapeHtml(snapshot.methodology.rankingDisclaimer)}</p><p>${escapeHtml(snapshot.methodology.sourceStandard)}</p><ul>${snapshot.methodology.selectionSignals.map((signal) => `<li>${escapeHtml(signal)}</li>`).join('')}</ul>${hasStructureHistory ? '<p><a href="structure-history/2026-11-10/">Historical structure records and withdrawals</a></p>' : ''}</div><div class="methodology__sources"><h3>Open methodology sources</h3><ol>${snapshot.methodology.sources.map(renderMethodologySource).join('')}</ol></div></section>
<script id="catalog-index" type="application/json">${jsonForHtml(searchIndex)}</script>`;
  return layout({
    title: 'Polymer catalog',
    description: 'An open-source-grounded, completeness-first reference for polymer families and materials.',
    body,
    page: 'home',
    scripts: '<script defer src="assets/search.js"></script><script defer src="assets/home-tabs.js"></script>'
  });
}

function renderSource(source, index) {
  return `<li id="source-${escapeHtml(source.sourceId)}"><span class="source-number">${index + 1}</span><div><a href="${escapeHtml(source.contentUrl || source.url)}" rel="external noreferrer">${escapeHtml(source.citation)}</a><p>${escapeHtml(source.locator)}</p><div class="source-meta"><span>${escapeHtml(humanize(source.sourceType))}</span><span>${escapeHtml(humanize(source.reuseStatus))}</span><span>Accessed ${escapeHtml(source.accessedDate)}</span></div></div></li>`;
}

function normalizeDoi(value) {
  return String(value || '')
    .trim()
    .toLocaleLowerCase('en-US')
    .replace(/^https?:\/\/(?:dx\.)?doi\.org\//u, '');
}

function normalizeReferenceUrl(value) {
  try {
    const parsed = new URL(String(value));
    parsed.hash = '';
    return parsed.href;
  } catch {
    return String(value || '').trim();
  }
}

function citationSuffix(index) {
  let value = index + 1;
  let suffix = '';
  while (value > 0) {
    value -= 1;
    suffix = String.fromCharCode(97 + (value % 26)) + suffix;
    value = Math.floor(value / 26);
  }
  return suffix;
}

function createCitationIndex(polymer) {
  const sources = polymer.sources || [];
  const parents = sources.map((_, index) => index);
  const find = (index) => {
    let root = index;
    while (parents[root] !== root) root = parents[root];
    while (parents[index] !== index) {
      const next = parents[index];
      parents[index] = root;
      index = next;
    }
    return root;
  };
  const unite = (left, right) => {
    const leftRoot = find(left);
    const rightRoot = find(right);
    if (leftRoot !== rightRoot) parents[rightRoot] = leftRoot;
  };
  const tokenOwner = new Map();

  sources.forEach((source, index) => {
    const doi = normalizeDoi(source.doi);
    const preferredUrl = normalizeReferenceUrl(source.contentUrl || source.url);
    const tokens = [doi ? `doi:${doi}` : null, preferredUrl ? `url:${preferredUrl}` : null].filter(Boolean);
    if (!tokens.length) tokens.push(`source:${source.sourceId}`);
    for (const token of tokens) {
      if (tokenOwner.has(token)) unite(tokenOwner.get(token), index);
      else tokenOwner.set(token, index);
    }
  });

  const grouped = new Map();
  sources.forEach((source, index) => {
    const root = find(index);
    if (!grouped.has(root)) grouped.set(root, []);
    grouped.get(root).push({ source, originalIndex: index });
  });
  const groups = [...grouped.values()]
    .sort((left, right) => left[0].originalIndex - right[0].originalIndex)
    .map((occurrences, index) => ({ number: index + 1, occurrences }));
  const bySourceId = new Map();
  for (const group of groups) {
    group.occurrences.forEach(({ source }, index) => {
      const suffix = group.occurrences.length > 1 ? `.${citationSuffix(index)}` : '';
      bySourceId.set(source.sourceId, {
        group,
        label: `${group.number}${suffix}`,
        number: group.number,
        suffix
      });
    });
  }
  return { groups, bySourceId };
}

function renderCitationLinks(sourceIds, citationIndex) {
  const seen = new Set();
  return sourceIds.map((source) => typeof source === 'string' ? source : source.sourceId)
    .filter((sourceId) => sourceId && !seen.has(sourceId) && seen.add(sourceId))
    .map((sourceId) => {
      const indexed = citationIndex?.bySourceId.get(sourceId);
      if (!indexed) return `<a href="#source-${escapeHtml(sourceId)}">${escapeHtml(sourceId)}</a>`;
      const citation = indexed.group.occurrences[0].source.citation;
      return `<a class="citation-ref" href="#source-${escapeHtml(sourceId)}" aria-label="Reference ${escapeHtml(indexed.label)}: ${escapeHtml(citation)}">[${escapeHtml(indexed.label)}]</a>`;
    })
    .join(' ');
}

function renderSectionSources(sources, citationIndex, label = 'Sources') {
  if (!sources.length) return '';
  return `<p class="section-sources"><span>${escapeHtml(label)}</span>${renderCitationLinks(sources, citationIndex)}</p>`;
}

function renderReferenceGroup(group, citationIndex) {
  const primary = group.occurrences[0].source;
  const evidenceNotes = group.occurrences.map(({ source }) => {
    const indexed = citationIndex.bySourceId.get(source.sourceId);
    const supports = source.supports.map((key) => SOURCE_SUPPORT_LABELS[key] || humanize(key)).join(', ');
    const alternateCopy = normalizeReferenceUrl(source.contentUrl || source.url) === normalizeReferenceUrl(primary.contentUrl || primary.url)
      ? ''
      : ` · <a href="${escapeHtml(source.contentUrl || source.url)}" rel="external noreferrer">Open cited copy</a>`;
    return `<li id="source-${escapeHtml(source.sourceId)}" class="reference-occurrence"><span class="reference-occurrence__label">[${escapeHtml(indexed.label)}]</span><div><p>${escapeHtml(source.locator)}</p><span>Supports ${escapeHtml(supports)}${alternateCopy}</span></div></li>`;
  }).join('');
  const typeLabels = [...new Set(group.occurrences.map(({ source }) => humanize(source.sourceType)))];
  const reuseLabels = [...new Set(group.occurrences.map(({ source }) => humanize(source.reuseStatus)))];
  const accessedDates = [...new Set(group.occurrences.map(({ source }) => source.accessedDate))];
  const occurrenceLabel = group.occurrences.length === 1 ? '1 evidence note' : `${group.occurrences.length} evidence notes`;
  const fullTextLink = primary.contentUrl && normalizeReferenceUrl(primary.contentUrl) !== normalizeReferenceUrl(primary.url)
    ? `<a class="reference-document__full-text" href="${escapeHtml(primary.contentUrl)}" rel="external noreferrer">Read full text</a>`
    : '';
  return `<li id="reference-${group.number}" class="reference-document"><span class="source-number">${group.number}</span><div class="reference-document__body"><a class="reference-document__citation" href="${escapeHtml(primary.url)}" rel="external noreferrer">${escapeHtml(primary.citation)}</a><div class="reference-document__access"><p class="source-meta">${escapeHtml([...typeLabels, ...reuseLabels, `Accessed ${accessedDates.join(', ')}`].join(' · '))}</p>${fullTextLink}</div><details class="reference-support"><summary>What this source supports <span>${escapeHtml(occurrenceLabel)}</span></summary><ol class="reference-occurrences">${evidenceNotes}</ol></details></div></li>`;
}

function structureConventionNotes(item, structureMetadata = {}) {
  const conventions = structureMetadata.conventions || {};
  return [
    item.notation,
    conventions.openAttachmentCount
      ? 'Short waves across bond ends mark connections to omitted portions; they are not wavy stereobonds.'
      : null,
    conventions.unknownSingleBondCount
      ? 'A wavy single bond means that configuration at that center is intentionally unspecified; it is not a polymer-continuation bond.'
      : null,
    conventions.unknownDoubleBondCount
      ? 'A crossed double bond means that E/Z geometry is intentionally unspecified.'
      : null
  ].filter(Boolean);
}

function renderStructureCard(item, structureDimensions = new Map(), { assetPrefix = '../../assets/structures/', compact = false, compactHeadingLevel = 3, compactDisclosure = false, showNotes = false, complexSizing = false, scrollSizing = false } = {}) {
  const assetName = encodeURIComponent(String(item.structureId));
  const structureMetadata = structureDimensions.get(item.structureId) || { width: 960, height: 480 };
  const dimensions = {
    width: structureMetadata.width || 960,
    height: structureMetadata.height || 480
  };
  const aspectRatio = Number(dimensions.width) / Number(dimensions.height);
  const isWide = aspectRatio >= 3.2;
  const isTall = aspectRatio <= 1.2 && Number(dimensions.height) >= 280;
  const atomCount = Number(structureMetadata.atomCount);
  const isComplex = complexSizing && Number.isFinite(atomCount) && atomCount >= 30;
  // Wide repeats can have unreadable labels on a phone even when they contain
  // fewer than 30 atoms; retain their authored drawing scale as well.
  const complexScroll = (compact || scrollSizing) && complexSizing && (
    (isComplex && aspectRatio >= 2) || (Number(dimensions.width) >= 400 && aspectRatio >= 1.3) || (Number(dimensions.width) >= 350 && aspectRatio >= 1.5) || (Number(dimensions.width) >= 380 && isTall)
  );
  const imageClass = `structure-card__image${isWide ? ' structure-card__image--wide' : ''}${isTall ? ' structure-card__image--tall' : ''}${isComplex ? ' structure-card__image--complex' : ''}${complexScroll ? ' structure-card__image--complex-scroll' : ''}`;
  const scrollAttributes = complexScroll
    ? ` style="--complex-min-width:${Math.min(720, Math.max(360, Number(dimensions.width), (Number.isFinite(atomCount) ? atomCount : 0) * 12))}px" tabindex="0" aria-label="Chemical structure; scroll horizontally to see the full structure" data-structure-scroll`
    : isWide ? ' tabindex="0" aria-label="Wide chemical structure; scroll horizontally on a small screen"' : '';
  const scrollHint = complexScroll ? '<p class="complex-scroll-hint">Scroll the structure horizontally ↔</p>' : '';
  const notes = structureConventionNotes(item, structureMetadata);
  const compactAttachmentNote = structureMetadata.conventions?.openAttachmentCount
    ? '<p class="structure-card__continuation">Waves across bond ends mark connections to omitted portions.</p>'
    : '';
  const notation = notes.length
    ? `<div class="structure-card__notation"><strong>Notation</strong><ul>${notes.map((note) => `<li>${escapeHtml(note)}</li>`).join('')}</ul></div>`
    : '';
  if (compact) {
    const heading = [3, 4, 5].includes(compactHeadingLevel) ? `h${compactHeadingLevel}` : 'h3';
    if (compactDisclosure) {
      return `<figure class="structure-card structure-card--compact" data-structure-fidelity="${escapeHtml(item.fidelity)}"><div class="structure-card__heading"><${heading}>${escapeHtml(item.label)}</${heading}><span class="structure-card__fidelity">${escapeHtml(humanize(item.fidelity))} depiction</span></div><div class="${imageClass}"${scrollAttributes}><img src="${escapeHtml(assetPrefix)}${escapeHtml(assetName)}.svg" width="${escapeHtml(dimensions.width)}" height="${escapeHtml(dimensions.height)}" loading="eager" decoding="async" alt="${escapeHtml(item.altText)}"></div>${scrollHint}${compactAttachmentNote}<figcaption class="structure-card__compact-caption">${escapeHtml(item.caption)}</figcaption></figure>`;
    }
    return `<figure class="structure-card structure-card--compact"><figcaption class="structure-card__heading"><${heading}>${escapeHtml(item.label)}</${heading}></figcaption><div class="${imageClass}"${scrollAttributes}><img src="${escapeHtml(assetPrefix)}${escapeHtml(assetName)}.svg" width="${escapeHtml(dimensions.width)}" height="${escapeHtml(dimensions.height)}" loading="eager" decoding="async" alt="${escapeHtml(item.altText)}"></div>${scrollHint}${showNotes ? `${notation}<p class="structure-card__compact-caption">${escapeHtml(item.caption)}</p>` : compactAttachmentNote}</figure>`;
  }
  const qualifier = new RegExp(`\\b${item.fidelity}\\b`, 'iu').test(item.caption)
    ? ''
    : `<strong class="structure-card__qualifier">${escapeHtml(humanize(item.fidelity))} depiction.</strong> `;
  return `<figure class="structure-card"><div class="structure-card__heading"><h3>${escapeHtml(item.label)}</h3></div><div class="${imageClass}"${scrollAttributes}><img src="${escapeHtml(assetPrefix)}${escapeHtml(assetName)}.svg" width="${escapeHtml(dimensions.width)}" height="${escapeHtml(dimensions.height)}" loading="eager" decoding="async" alt="${escapeHtml(item.altText)}"></div>${scrollHint}${notation}<figcaption><p>${qualifier}${escapeHtml(item.caption)}</p></figcaption></figure>`;
}

function renderStructureGrid(items, structureDimensions, options = {}) {
  if (!items.length) return '';
  const isCompactGallery = options.compact && items.length > 1;
  const compactGallery = isCompactGallery
    ? ` tabindex="0" aria-label="Structural depiction gallery with ${items.length} items; scroll horizontally to view each item" data-structure-gallery-track`
    : '';
  const gridModifier = items.length === 1
    ? ' structure-grid--single'
    : items.length === 2
      ? ' structure-grid--pair'
    : items.length > 2
      ? ' structure-grid--many'
      : '';
  const grid = `<div class="structure-grid${gridModifier}"${compactGallery}>${items.map((item) => renderStructureCard(item, structureDimensions, options)).join('')}</div>`;
  if (!isCompactGallery) return grid;
  return `<div class="structure-gallery" data-structure-gallery><div class="structure-gallery__toolbar" data-structure-gallery-toolbar hidden><span aria-live="polite"><strong data-structure-gallery-current>1</strong> of ${items.length}</span><div class="structure-gallery__controls" data-structure-gallery-controls><button type="button" data-structure-gallery-previous aria-label="Previous structural depiction">←</button><button type="button" data-structure-gallery-next aria-label="Next structural depiction">→</button></div></div>${grid}</div>`;
}

function renderBlockArchitecture(architecture) {
  if (!architecture) return '';
  const blocks = architecture.blocks.map((label) => `<li class="block-architecture__block">${escapeHtml(label)}</li>`).join('');
  const sources = architecture.sourceIds.map((sourceId, index) => `<a href="#source-${escapeHtml(sourceId)}">Source ${index + 1}</a>`).join(', ');
  return `<figure class="block-architecture"><div class="block-architecture__diagram" role="img" aria-label="${escapeHtml(architecture.altText)}"><ol class="block-architecture__blocks" aria-hidden="true">${blocks}</ol></div><figcaption><strong>Block architecture.</strong> ${escapeHtml(architecture.caption)} <span class="block-architecture__scale">Block widths do not represent their lengths or proportions.</span><span class="block-architecture__sources">Architecture sources: ${sources}</span></figcaption></figure>`;
}

function renderStructuralDepictions(polymer, structureDimensions = new Map(), citationIndex = null) {
  const depiction = polymer.structuralDepictions || {
    representationType: 'undetermined',
    scopeNote: 'This entry does not yet publish a sourced structural depiction.',
    sourceIds: [],
    items: []
  };
  const items = Array.isArray(depiction.items) ? depiction.items : [];
  const figures = renderStructureGrid(items, structureDimensions, { compact: true, complexSizing: true, showNotes: true });
  const architecture = renderBlockArchitecture(depiction.architecture);
  let state = '';
  if (depiction.representationType === 'no_unique_repeat') {
    state = '<p class="structure-boundary"><strong>No single canonical structure.</strong></p>';
  } else if (!items.length) {
    state = '<p class="structure-boundary"><strong>A sourced structure is not yet available.</strong></p>';
  }
  return `<section class="structure-showcase structure-showcase--overview" id="structural-depictions" aria-labelledby="structural-depictions-title" data-structure-representation="${escapeHtml(depiction.representationType)}" data-structure-count="${items.length}"><div class="structure-showcase__heading"><h3 id="structural-depictions-title">Structure</h3></div>${state}<p class="structure-showcase__scope">${escapeHtml(depiction.scopeNote)}</p>${architecture}${figures}${renderSectionSources(depiction.sourceIds || [], citationIndex, 'Structure sources')}</section>`;
}

function renderSynthesisRoutes(polymer, structureDimensions, citationIndex) {
  if (!polymer.synthesisRoutes?.length) return '';
  const items = new Map([
    ...polymer.structuralDepictions.items,
    ...Object.values(polymer.contextualStructures || {}).flatMap(group => group.items)
  ].map(item => [item.structureId, item]));
  const participant = value => {
    const item = items.get(value.structureId);
    if (!item) return `<div class="reaction-label">${escapeHtml(value.label)}</div>`;
    const metadata = structureDimensions.get(item.structureId) || {};
    const notes = structureConventionNotes(item, metadata);
    const wide = metadata.width / metadata.height >= 3.2 && !(metadata.atomCount >= 30 || metadata.width >= 440);
    return `<div class="reaction-participant">${renderStructureCard({ ...item, label: value.label }, structureDimensions, { compact: true, compactHeadingLevel: 4, compactDisclosure: true, complexSizing: true })}${wide ? '<p class="reaction-scroll-hint">Scroll the structure horizontally ↔</p>' : ''}${notes.length ? `<p class="reaction-notation">${notes.map(escapeHtml).join(' ')}</p>` : ''}</div>`;
  };
  return `<div class="synthesis-routes"><h3>Synthesis and preparation routes</h3>${polymer.synthesisRoutes.map(route => {
    const reagents = route.reagents.map(reagent => `<div class="reaction-reagent"><dt><span>${escapeHtml(humanize(reagent.role))}</span><strong>${escapeHtml(reagent.name)}</strong></dt><dd>${escapeHtml(reagent.detail)}${reagent.structureId ? participant({label: reagent.name, structureId: reagent.structureId}) : ''}</dd></div>`).join('');
    const reference = route.productMode === 'structural_reference';
    const usedStructures = new Set([...route.inputs, ...route.products, ...route.reagents].map(value => value.structureId).filter(Boolean));
    const structureSourceIds = [...new Set([polymer.structuralDepictions, ...Object.values(polymer.contextualStructures || {})].filter(group => group.items.some(item => usedStructures.has(item.structureId))).flatMap(group => group.sourceIds))];
    const genericLimitations = 'This outline does not specify a universal recipe, reagent loading, operating schedule, or conversion endpoint. Those details must retain the material and process limits of the cited source. Figure notes distinguish exact molecules from representative motifs and variable architectures.';
    const limitations = route.limitations === genericLimitations ? '' : `<p class="synthesis-route__limits">${escapeHtml(route.limitations)}</p>`;
    const steps = route.steps.map(step => `<li><h5>${escapeHtml(step.title)}</h5><p>${escapeHtml(step.body)}</p>${renderSectionSources(step.sourceIds, citationIndex, 'Evidence')}</li>`).join('');
    return `<section class="synthesis-route" id="synthesis-route-${escapeHtml(route.routeId)}" aria-labelledby="route-title-${escapeHtml(route.routeId)}"><header><span class="synthesis-route__basis">${escapeHtml(humanize(route.basis))}</span><h4 id="route-title-${escapeHtml(route.routeId)}">${escapeHtml(route.title)}</h4><p>${escapeHtml(route.scopeNote)}</p></header><div class="reaction-scheme" aria-label="${escapeHtml(route.title)} reaction scheme"><div class="reaction-side"><h5>Starting materials</h5>${route.inputs.map(participant).join('<span class="reaction-plus" aria-hidden="true">+</span>')}</div><div class="reaction-arrow"><p>${escapeHtml(route.conditions)}</p><span aria-label="yields">⟶</span></div><div class="reaction-side"><h5>${reference ? 'Product / structural reference' : 'Product / structural outcome'}</h5>${route.products.map(participant).join(reference ? '' : '<span class="reaction-plus" aria-hidden="true">+</span>')}${route.productNote ? `<p class="reaction-product-note">${escapeHtml(route.productNote)}</p>` : ''}</div></div><div class="reaction-mechanism"><h5>Mechanism</h5><p>${escapeHtml(route.mechanism)}</p></div>${reagents ? `<dl class="reaction-reagents">${reagents}</dl>` : ''}<h5 class="synthesis-route__steps-title">Procedure outline</h5><ol class="synthesis-steps">${steps}</ol>${limitations}${renderSectionSources(route.sourceIds, citationIndex, 'Route sources')}${renderSectionSources(structureSourceIds, citationIndex, 'Structure sources')}</section>`;
  }).join('')}</div>`;
}

function renderContextualStructures(polymer, key, structureDimensions = new Map(), citationIndex = null) {
  const group = polymer.contextualStructures?.[key];
  if (!group) return '';
  const label = key === 'processing' ? 'Processing chemistry' : 'Synthesis chemistry';
  const evidence = renderSectionSources(group.sourceIds, citationIndex, 'Figure sources');
  const content = `<aside class="section-structures" aria-label="${escapeHtml(label)}"><div class="section-structures__heading"><h3>${escapeHtml(label)}</h3></div><p>${escapeHtml(group.scopeNote)}</p>${renderStructureGrid(group.items, structureDimensions, { complexSizing: true, scrollSizing: true })}${evidence}</aside>`;
  return key === 'feedstocksAndSynthesis' && polymer.synthesisRoutes?.length
    ? `<details class="synthesis-structure-notes"><summary>Reagent structures</summary>${content}</details>` : content;
}

function renderSection(polymer, key, { tabPanel = false, articlePanel = false, nested = false, displayNumber = null, structureDimensions = new Map(), citationIndex = null } = {}) {
  const text = polymer.sections[key];
  const supporting = polymer.sources.filter((source) => source.supports.includes(key));
  const routes = key === 'feedstocksAndSynthesis' ? renderSynthesisRoutes(polymer, structureDimensions, citationIndex) : '';
  const contextualStructures = renderContextualStructures(polymer, key, structureDimensions, citationIndex);
  const contextualPreview = key === 'overview'
    ? renderContextualStructurePreview(polymer, structureDimensions)
    : '';
  const number = displayNumber || String(SECTION_KEYS.indexOf(key) + 1).padStart(2, '0');
  const heading = tabPanel || nested ? 'h3' : 'h2';
  const panelAttributes = tabPanel ? ' data-core-panel' : articlePanel ? ' data-article-panel' : '';
  const classes = `article-section${tabPanel ? ' core-attribute-panel' : ''}${articlePanel ? ` article-tab-panel article-tab-panel--${key}` : ''}`;
  const sectionHeading = articlePanel
    ? `<div class="article-section__heading article-section__heading--plain"><h2>${escapeHtml(SECTION_LABELS[key])}</h2></div>`
    : `<div class="article-section__heading"><span>${number}</span><${heading}>${escapeHtml(SECTION_LABELS[key])}</${heading}></div>`;
  if (!text.trim()) {
    return `<section class="${classes} article-section--empty" id="${escapeHtml(key)}"${panelAttributes}>${sectionHeading}<div class="research-gap"><strong>Open-source research needed</strong><p>This entry does not yet publish a sourced ${escapeHtml(SECTION_LABELS[key].toLocaleLowerCase('en-US'))} section.</p></div>${contextualPreview}${contextualStructures}</section>`;
  }
  const prose = `${routes ? '<h3 class="synthesis-family-heading">Family chemistry and route variants</h3>' : ''}${key === 'applications' ? renderApplicationsProse(text) : articlePanel ? renderTechnicalProse(text) : renderProse(text)}`;
  const citations = renderSectionSources(supporting, citationIndex);
  return `<section class="${classes}" id="${escapeHtml(key)}"${panelAttributes}>${sectionHeading}${renderEvidenceTable(polymer, key, citationIndex)}${routes}${prose}${contextualPreview}${contextualStructures}${citations}</section>`;
}

function renderCoreAttributes(polymer, structureDimensions = new Map()) {
  const tabs = CORE_ATTRIBUTE_KEYS.map((key) =>
    `<a href="#${escapeHtml(key)}" data-core-tab>${escapeHtml(SECTION_LABELS[key])}</a>`
  ).join('');
  return `<section class="core-attributes" id="core-attributes" data-core-attributes><div class="article-section__heading core-attributes__heading"><span>Core</span><h2>Core attributes</h2></div><p class="core-attributes__intro">Synthesis, measured mechanical behavior, and article processing are researched independently so their evidence boundaries stay visible.</p><nav class="core-attribute-tabs" aria-label="Core polymer attributes" data-core-tablist>${tabs}</nav><div class="core-attribute-panels">${CORE_ATTRIBUTE_KEYS.map((key) => renderSection(polymer, key, { tabPanel: true, structureDimensions })).join('')}</div></section>`;
}

const DEGRADATION_KEYS = ['degradationAndStability', 'recyclingAndEndOfLife'];
const GENERAL_INFORMATION_KEYS = SECTION_KEYS.filter((key) => !['overview', 'history', 'applications', ...DEGRADATION_KEYS].includes(key) && !CORE_ATTRIBUTE_KEYS.includes(key));
const OVERVIEW_STRUCTURE_KEYS = ['structureAndMorphology', 'properties', 'limitationsAndVariability'];
const OVERVIEW_USE_KEYS = ['healthSafetyAndRegulation'];

const DEGRADATION_TOPICS = ['Degradation products and pathways', 'Timescales', 'Environmental persistence'];

function renderDegradationPanel(polymer, citationIndex) {
  const degradation = polymer.sections.degradationAndStability.trim();
  const recycling = polymer.sections.recyclingAndEndOfLife.trim();
  const gap = (topic) => `<div class="research-gap"><strong>Open-source research needed</strong><p>This entry does not yet publish sourced ${escapeHtml(topic)} information.</p></div>`;
  const paragraphs = degradation ? proseParagraphs(degradation).map((paragraph) => {
    const topic = DEGRADATION_TOPICS.find((label) => paragraph.startsWith(`${label}:`));
    return topic
      ? `<div class="degradation-topic"><h3>${escapeHtml(topic)}</h3>${renderProse(paragraph.slice(topic.length + 1))}</div>`
      : renderProse(paragraph);
  }).join('') : DEGRADATION_TOPICS.map((topic) => `<div class="degradation-topic"><h3>${escapeHtml(topic)}</h3>${gap(topic.toLocaleLowerCase('en-US'))}</div>`).join('');
  const stabilityHeading = degradation && !DEGRADATION_TOPICS.some((topic) => degradation.startsWith(`${topic}:`))
    ? '<h3>Degradation and stability</h3>' : '';
  const evidence = (key, label) => renderSectionSources(polymer.sources.filter((source) => source.supports.includes(key)), citationIndex, label);
  return `<section class="article-section article-tab-panel article-tab-panel--degradation" id="degradation" data-article-panel><div class="article-section__heading article-section__heading--plain"><h2>Degradation</h2></div><section class="degradation-evidence" id="degradationAndStability" aria-label="Degradation and stability">${stabilityHeading}${paragraphs}${evidence('degradationAndStability', 'Degradation sources')}</section><section class="degradation-evidence degradation-topic" id="recyclingAndEndOfLife"><h3>Reclamation and recycling</h3>${recycling ? renderProse(recycling) : gap('reclamation and recycling')}${evidence('recyclingAndEndOfLife', 'Recycling sources')}</section></section>`;
}

function renderRecordBoundary(polymer, { nested = false } = {}) {
  const heading = nested ? 'h3' : 'h2';
  return `<section class="record-boundary"><div><span class="eyebrow">Classification details</span><${heading}>Origin and chemistry</${heading}></div><dl><div><dt>Origin</dt><dd>${escapeHtml(polymer.taxonomy.origins.map(humanize).join(', '))}</dd></div><div><dt>Chemistry</dt><dd>${escapeHtml(polymer.taxonomy.chemistryClasses.map(humanize).join(', '))}</dd></div></dl></section>`;
}

function renderRelationships(relationships, { nested = false } = {}) {
  if (!relationships.length) return '';
  const heading = nested ? 'h3' : 'h2';
  return `<section class="article-section" id="relationships"><div class="article-section__heading"><span>↔</span><${heading}>Related entries</${heading}></div><ul class="relationships">${relationships.map((relationship) => `<li><span>${escapeHtml(humanize(relationship.kind))}</span><a href="../${escapeHtml(relationship.target.canonicalSlug)}/">${escapeHtml(relationship.target.canonicalName)}</a></li>`).join('')}</ul></section>`;
}

function renderSources(polymer) {
  return `<section class="article-section sources" id="sources"><div class="article-section__heading"><span>§</span><h2>Sources</h2></div>${polymer.sources.length ? `<ol>${polymer.sources.map(renderSource).join('')}</ol>` : '<div class="research-gap"><strong>No article sources yet</strong><p>The entry is an identity-and-taxonomy stub. Methodology sources on the catalog page explain why it is in the initial research denominator; they do not support unwritten article claims.</p></div>'}</section>`;
}

function renderReferencesPanel(polymer, citationIndex = createCitationIndex(polymer)) {
  const references = citationIndex.groups.length
    ? `<ol>${citationIndex.groups.map((group) => renderReferenceGroup(group, citationIndex)).join('')}</ol>`
    : '<div class="research-gap"><strong>No article references yet</strong><p>The entry is an identity-and-taxonomy stub. Methodology sources on the catalog page explain why it is in the initial research denominator; they do not support unwritten article claims.</p></div>';
  return `<section class="article-section sources article-tab-panel article-tab-panel--references" id="references" data-article-panel><span class="legacy-fragment-target" id="sources" aria-hidden="true"></span><div class="article-section__heading article-section__heading--plain"><h2>References</h2></div>${references}</section>`;
}

function renderOverviewDefinition(polymer, citationIndex) {
  const text = polymer.sections.overview;
  const supporting = polymer.sources.filter((source) => source.supports.includes('overview'));
  const heading = '<h4 class="visually-hidden" id="canonical-definition-title">Canonical definition</h4>';
  if (!text.trim()) {
    return `<section class="overview-definition article-section--empty" aria-labelledby="canonical-definition-title">${heading}<div class="research-gap"><strong>Open-source research needed</strong><p>This entry does not yet publish a sourced overview.</p></div></section>`;
  }
  return `<section class="overview-definition" aria-labelledby="canonical-definition-title">${heading}${renderProse(text)}${renderSectionSources(supporting, citationIndex)}</section>`;
}

function renderOverviewFacts(polymer) {
  return `<dl class="overview-facts"><div><dt>Origin</dt><dd>${escapeHtml(polymer.taxonomy.origins.map(humanize).join(', '))}</dd></div><div><dt>Chemistry</dt><dd>${escapeHtml(polymer.taxonomy.chemistryClasses.map(humanize).join(', '))}</dd></div></dl>`;
}

function renderOverviewSubsection(polymer, key, citationIndex) {
  const text = polymer.sections[key];
  if (!text.trim()) return '';
  const supporting = polymer.sources.filter((source) => source.supports.includes(key));
  return `<section class="overview-subsection" id="${escapeHtml(key)}"><h4>${escapeHtml(SECTION_LABELS[key])}</h4>${renderProse(text)}${renderSectionSources(supporting, citationIndex)}</section>`;
}

function renderOverviewStructure(polymer, citationIndex) {
  const populated = OVERVIEW_STRUCTURE_KEYS.filter((key) => polymer.sections[key].trim());
  return populated.map((key) => {
    const paragraphs = proseParagraphs(polymer.sections[key]);
    const sources = polymer.sources.filter((source) => source.supports.includes(key));
    const citations = renderCitationLinks(sources, citationIndex);
    const prose = paragraphs.map((paragraph, paragraphIndex) => {
      const lead = paragraphIndex === 0 ? `<strong>${escapeHtml(SECTION_LABELS[key])}.</strong> ` : '';
      const references = paragraphIndex === paragraphs.length - 1 && citations ? ` ${citations}` : '';
      return `<p>${lead}${escapeHtml(paragraph)}${references}</p>`;
    }).join('');
    return `<div class="overview-structure__passage" id="${escapeHtml(key)}">${prose}</div>`;
  }).join('');
}

const CONTEXTUAL_STRUCTURE_PREVIEW_GROUPS = Object.freeze([
  { key: 'feedstocksAndSynthesis', contextLabel: 'Synthesis context' },
  { key: 'processing', contextLabel: 'Processing context' }
]);

function renderContextualStructurePreview(polymer, structureDimensions = new Map(), { nested = false } = {}) {
  if (polymer.structuralDepictions?.representationType !== 'no_unique_repeat') return '';
  const groups = CONTEXTUAL_STRUCTURE_PREVIEW_GROUPS
    .map((definition) => ({ ...definition, group: polymer.contextualStructures?.[definition.key] }))
    .filter(({ group }) => Array.isArray(group?.items) && group.items.length);
  if (!groups.length) return '';
  const headingLevel = nested ? 4 : 3;
  const cardHeadingLevel = headingLevel + 1;
  const cards = groups.map(({ key, contextLabel, group }) => `<section class="contextual-structure-preview__group"><a class="contextual-structure-preview__tab-link" href="#${escapeHtml(key)}"><span>${escapeHtml(contextLabel)}</span><span>View details →</span></a><div class="contextual-structure-preview__cards">${group.items.map((item) => renderStructureCard(item, structureDimensions, { compact: true, compactHeadingLevel: cardHeadingLevel, compactDisclosure: true, complexSizing: true })).join('')}</div></section>`).join('');
  return `<aside class="contextual-structure-preview" aria-labelledby="representative-chemistry-title"><div class="contextual-structure-preview__heading"><div><span class="eyebrow">Contextual examples</span><h${headingLevel} id="representative-chemistry-title">Representative chemistry</h${headingLevel}></div></div><p>These sourced examples provide synthesis or processing context. They are not a repeat unit or complete network.</p>${cards}</aside>`;
}

function renderCoverageGaps(polymer) {
  const missing = GENERAL_INFORMATION_KEYS.filter((key) => !polymer.sections[key].trim());
  if (!missing.length) return '';
  const items = missing.map((key) => `<li id="${escapeHtml(key)}"><strong>${escapeHtml(SECTION_LABELS[key])}</strong><span>Open-source research needed.</span></li>`).join('');
  return `<section class="overview-group overview-group--gaps coverage-gaps" aria-labelledby="coverage-gaps-title"><h3 id="coverage-gaps-title">Coverage gaps</h3><p>These topics remain explicit research needs; no claims are inferred from an empty record.</p><ul>${items}</ul></section>`;
}

function renderOverviewGroup(title, body, modifier) {
  if (!body) return '';
  return `<section class="overview-group overview-group--${escapeHtml(modifier)}"><h3>${escapeHtml(title)}</h3>${body}</section>`;
}

function renderOverviewRelationships(relationships) {
  if (!relationships.length) return '';
  const items = relationships.map((relationship) => `<li><span>${escapeHtml(humanize(relationship.kind))}</span><a href="../${escapeHtml(relationship.target.canonicalSlug)}/">${escapeHtml(relationship.target.canonicalName)}</a></li>`).join('');
  return `<section class="overview-group overview-group--relationships" id="relationships"><h3>Related entries</h3><ul class="relationships">${items}</ul></section>`;
}

function renderOverviewInformation(polymer, structureDimensions, relationships = [], citationIndex = null) {
  const definition = `${renderOverviewDefinition(polymer, citationIndex)}${renderOverviewFacts(polymer)}${renderContextualStructurePreview(polymer, structureDimensions, { nested: true })}${renderOverviewSubsection(polymer, 'nomenclature', citationIndex)}`;
  const structure = renderOverviewStructure(polymer, citationIndex);
  const useAndLifecycle = OVERVIEW_USE_KEYS.map((key) => renderOverviewSubsection(polymer, key, citationIndex)).join('');
  return `<section class="article-tab-panel article-tab-panel--overview" id="overview" data-article-panel aria-labelledby="overview-title"><span class="legacy-fragment-target" id="general" aria-hidden="true"></span><header class="article-tab-panel__intro"><h2 id="overview-title">Overview</h2></header>${renderStructuralDepictions(polymer, structureDimensions, citationIndex)}${renderOverviewGroup('Definition and classification', definition, 'definition')}${renderOverviewGroup('Structure, properties, and variability', structure, 'structure')}${renderOverviewGroup('Health and safety', useAndLifecycle, 'use')}${renderCoverageGaps(polymer)}${renderOverviewRelationships(relationships)}</section>`;
}

function renderArticleProfileTabs(tabs) {
  const navigation = tabs.map(({ id, label }) => `<a href="#${escapeHtml(id)}" data-article-tab><strong>${escapeHtml(label)}</strong></a>`).join('');
  return `<div class="article-profile__tabs article-tabs" data-article-tabs><div class="article-profile__tab-dock article-tabs__sticky"><nav class="article-profile__tab-grid article-tabs__list" aria-label="Polymer article sections" data-article-tablist>${navigation}</nav></div><div class="article-profile__surface"><div class="article-tab-panels">${tabs.map(({ panel }) => panel).join('')}</div></div></div>`;
}

function renderArticleProfile(polymer, snapshot, { structureDimensions = new Map() } = {}) {
  const category = PRIMARY_CLASS_LABELS[polymer.taxonomy.primaryClass] || humanize(polymer.taxonomy.primaryClass);
  const names = [...polymer.abbreviations, ...polymer.alternateNames];
  const byId = new Map(snapshot.polymers.map((entry) => [entry.wopId, entry]));
  const relationships = polymer.relationships.map((relationship) => ({ ...relationship, target: byId.get(relationship.wopId) })).filter((relationship) => relationship.target);
  const citationIndex = createCitationIndex(polymer);
  const tabs = [
    { id: 'overview', label: 'Overview', panel: renderOverviewInformation(polymer, structureDimensions, relationships, citationIndex) },
    { id: 'history', label: 'History', panel: renderSection(polymer, 'history', { articlePanel: true, citationIndex }) },
    { id: 'feedstocksAndSynthesis', label: 'Synthesis', panel: renderSection(polymer, 'feedstocksAndSynthesis', { articlePanel: true, structureDimensions, citationIndex }) },
    { id: 'mechanicalProperties', label: 'Mechanical properties', panel: renderSection(polymer, 'mechanicalProperties', { articlePanel: true, structureDimensions, citationIndex }) },
    { id: 'processing', label: 'Processing', panel: renderSection(polymer, 'processing', { articlePanel: true, structureDimensions, citationIndex }) },
    { id: 'applications', label: 'Applications', panel: renderSection(polymer, 'applications', { articlePanel: true, citationIndex }) },
    { id: 'degradation', label: 'Degradation', panel: renderDegradationPanel(polymer, citationIndex) },
    { id: 'references', label: 'References', panel: renderReferencesPanel(polymer, citationIndex) }
  ];
  const hero = `<header class="article-profile__hero"><div class="article-profile__identity"><h1${polymer.canonicalName.split(/\s+/).some(word => word.length > 24) ? ' class="article-title--long"' : ''}>${escapeHtml(polymer.canonicalName).replaceAll('):poly(', '):<wbr>poly(')}</h1>${names.length ? `<p class="article-aliases">${escapeHtml(names.join(' · '))}</p>` : ''}<dl class="article-profile__class"><div><dt>Class</dt><dd>${escapeHtml(category)}</dd></div></dl></div></header>`;
  const body = `<nav class="breadcrumb breadcrumb--article-profile" aria-label="Breadcrumb"><a href="../../"><span class="breadcrumb__wide">Polymer catalog</span><span class="breadcrumb__compact">Catalog</span></a><span aria-hidden="true">/</span><span>${escapeHtml(polymer.canonicalName)}</span></nav>
<article class="article-shell article-shell--tabbed article-profile" data-article-profile>${hero}${renderArticleProfileTabs(tabs)}</article>`;
  return layout({
    title: polymer.canonicalName,
    description: polymer.sections.overview.trim() || `Open-source research entry for ${polymer.canonicalName}.`,
    body,
    scripts: '<script defer src="../../assets/article.js?v=article-profile-6"></script>'
  });
}

export function renderArticle(polymer, snapshot, { structureDimensions = new Map() } = {}) {
  return renderArticleProfile(polymer, snapshot, { structureDimensions });
}

export function renderAliasRedirect(alias, polymer) {
  const target = `../${polymer.canonicalSlug}/`;
  return `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="robots" content="noindex,follow"><meta http-equiv="refresh" content="0; url=${escapeHtml(target)}"><link rel="canonical" href="${escapeHtml(target)}"><title>Redirecting…</title></head><body><p>Redirecting to <a href="${escapeHtml(target)}">${escapeHtml(polymer.canonicalName)}</a>.</p><script>location.replace(${JSON.stringify(target)})</script></body></html>`;
}

export function renderSitemap(snapshot, siteUrl) {
  const root = new URL(siteUrl);
  const urls = snapshot.polymers.map((polymer) => {
    const location = new URL(`polymers/${polymer.canonicalSlug}/`, root).href;
    return `  <url><loc>${escapeHtml(location)}</loc></url>`;
  }).join('\n');
  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>\n`;
}

function renderRedirects(snapshot) {
  const byId = new Map(snapshot.polymers.map((polymer) => [polymer.wopId, polymer]));
  const canonical = new Set(snapshot.polymers.map((polymer) => polymer.canonicalSlug));
  const aliases = new Set();
  const lines = [];
  for (const alias of snapshot.aliases) {
    const polymer = byId.get(alias.wopId);
    if (!polymer) throw new Error(`Cannot create redirect for ${alias.slug}: unknown entry ${alias.wopId}`);
    if (canonical.has(alias.slug) || aliases.has(alias.slug)) throw new Error(`Cannot create redirect for ${alias.slug}: route collision`);
    aliases.add(alias.slug);
    lines.push(`/polymers/${alias.slug} /polymers/${polymer.canonicalSlug}/ 301`);
  }
  return lines.length ? `${lines.join('\n')}\n` : '';
}

async function writeSite(snapshot, outputDirectory, siteUrl, historyDirectory) {
  const containedDirectory = (...parts) => {
    const directory = path.resolve(outputDirectory, ...parts);
    if (!directory.startsWith(`${path.resolve(outputDirectory)}${path.sep}`)) {
      throw new Error('Generated route escaped the staged output directory');
    }
    return directory;
  };
  const assets = await Promise.all(ASSET_FILES.map((asset) => fs.readFile(path.join(SITE_ASSETS, asset))));
  await fs.mkdir(path.join(outputDirectory, 'assets'), { recursive: true });
  await fs.mkdir(path.join(outputDirectory, 'data', 'wop-publication-snapshot-v1'), { recursive: true });
  await fs.mkdir(path.join(outputDirectory, 'data', 'wop-publication-snapshot-v2'), { recursive: true });
  const renderedStructures = await renderChemicalStructures(
    snapshot.chemicalStructures,
    path.join(outputDirectory, 'assets', 'structures')
  );
  const structureDimensions = new Map(renderedStructures.structures.map((structure) => [structure.structureId, {
    width: structure.width,
    height: structure.height,
    atomCount: structure.atomCount,
    conventions: structure.conventions
  }]));
  const legacySnapshot = await fs.readFile(path.resolve(SITE_DIRECTORY, '../public-data/wop-publication-snapshot-v1/snapshot.json'), 'utf8');
  if (historyDirectory) await copyHistoryBundle({ sourceDirectory: historyDirectory, outputDirectory, snapshot });
  await fs.writeFile(path.join(outputDirectory, 'index.html'), renderHome(snapshot, { hasStructureHistory: Boolean(historyDirectory) }));
  await fs.mkdir(path.join(outputDirectory, 'synthesis-preview'), { recursive: true });
  await fs.writeFile(path.join(outputDirectory, 'synthesis-preview', 'index.html'), renderSynthesisPreview(snapshot));
  await Promise.all(ASSET_FILES.map((asset, index) => fs.writeFile(path.join(outputDirectory, 'assets', asset), assets[index])));
  await fs.writeFile(path.join(outputDirectory, '_redirects'), renderRedirects(snapshot));
  if (siteUrl) {
    await fs.writeFile(path.join(outputDirectory, 'sitemap.xml'), renderSitemap(snapshot, siteUrl));
    await fs.writeFile(path.join(outputDirectory, 'robots.txt'), `User-agent: *\nAllow: /\nSitemap: ${new URL('sitemap.xml', siteUrl).href}\n`);
  } else {
    await fs.writeFile(path.join(outputDirectory, 'robots.txt'), 'User-agent: *\nAllow: /\n');
  }
  await fs.writeFile(path.join(outputDirectory, 'data', 'wop-publication-snapshot-v1', 'snapshot.json'), legacySnapshot);
  await fs.writeFile(path.join(outputDirectory, 'data', 'wop-publication-snapshot-v2', 'snapshot.json'), `${JSON.stringify(snapshot, null, 2)}\n`);
  await fs.writeFile(path.join(outputDirectory, '.wop-build.json'), `${JSON.stringify({
    schema: BUILD_SCHEMA,
    generator: BUILD_GENERATOR,
    polymerCount: snapshot.polymers.length,
    rendererVersion: STRUCTURE_RENDERER_VERSION,
    styleVersion: STRUCTURE_STYLE_ID,
    structureDefinitionCount: snapshot.chemicalStructures.length,
    renderedItemCount: snapshot.polymers.reduce((count, polymer) => count + polymer.structuralDepictions.items.length +
      Object.values(polymer.contextualStructures || {}).reduce((groupCount, group) => groupCount + group.items.length, 0), 0)
  })}\n`);
  const byId = new Map(snapshot.polymers.map((polymer) => [polymer.wopId, polymer]));
  await Promise.all(snapshot.polymers.map(async (polymer) => {
    const directory = containedDirectory('polymers', polymer.canonicalSlug);
    await fs.mkdir(directory, { recursive: true });
    await fs.writeFile(path.join(directory, 'index.html'), renderArticle(polymer, snapshot, { structureDimensions }));
  }));
  await Promise.all(snapshot.aliases.map(async (alias) => {
    const directory = containedDirectory('polymers', alias.slug);
    await fs.mkdir(directory, { recursive: true });
    await fs.writeFile(path.join(directory, 'index.html'), renderAliasRedirect(alias, byId.get(alias.wopId)));
  }));
}

async function recognizedBuild(output) {
  try {
    const marker = JSON.parse(await fs.readFile(path.join(output, '.wop-build.json'), 'utf8'));
    const markerKeys = Object.keys(marker || {}).sort().join(',');
    const currentMarker = marker?.schema === BUILD_SCHEMA && marker?.generator === BUILD_GENERATOR &&
      Number.isInteger(marker?.polymerCount) && typeof marker?.rendererVersion === 'string' &&
      typeof marker?.styleVersion === 'string' && Number.isInteger(marker?.structureDefinitionCount) &&
      Number.isInteger(marker?.renderedItemCount) && markerKeys === 'generator,polymerCount,renderedItemCount,rendererVersion,schema,structureDefinitionCount,styleVersion';
    const legacyMarker = marker?.schema === LEGACY_BUILD_SCHEMA && marker?.generator === BUILD_GENERATOR &&
      Number.isInteger(marker?.polymerCount) && markerKeys === 'generator,polymerCount,schema';
    if (!currentMarker && !legacyMarker) return false;
    const expected = [
      ['index.html', 'file'],
      ['assets', 'directory'],
      ['data', 'directory'],
      ['polymers', 'directory']
    ];
    for (const [name, kind] of expected) {
      const entry = await fs.lstat(path.join(output, name));
      if (entry.isSymbolicLink() || (kind === 'file' ? !entry.isFile() : !entry.isDirectory())) return false;
    }
    return true;
  } catch {
    return false;
  }
}

function normalizedSiteUrl(siteUrl) {
  if (siteUrl === undefined || siteUrl === null || siteUrl === '') return null;
  if (!isPublicSourceUrl(siteUrl)) throw new Error('siteUrl must be a public HTTPS URL');
  const parsed = new URL(siteUrl);
  parsed.hash = '';
  parsed.search = '';
  if (!parsed.pathname.endsWith('/')) parsed.pathname += '/';
  return parsed.href;
}

export async function buildSite(snapshot, outputDirectory, { allowExternal = false, siteUrl = null, beforePublish = null, historyDirectory = null, acquirePublishGuard = null } = {}) {
  validateSnapshot(snapshot);
  const output = path.resolve(outputDirectory);
  const repository = path.resolve(SITE_DIRECTORY, '..');
  const publicData = path.join(repository, 'public-data');
  const distRoot = path.join(repository, 'dist');
  const outputsRoot = path.join(repository, 'outputs');
  const isAllowedInRepository = output === distRoot || path.dirname(output) === outputsRoot;
  const isInsideRepository = output.startsWith(`${repository}${path.sep}`);
  if (output === path.parse(output).root || output === repository ||
      publicData === output || output.startsWith(`${publicData}${path.sep}`) ||
      (isInsideRepository && !isAllowedInRepository) ||
      (!isInsideRepository && !allowExternal)) {
    throw new Error('Build output must be dist/ or a direct child of outputs/ unless an API caller explicitly allows a disposable external directory');
  }
  await fs.mkdir(path.dirname(output), { recursive: true });
  const realParent = await fs.realpath(path.dirname(output));
  if (!allowExternal) {
    const expectedParent = output === distRoot ? repository : outputsRoot;
    if (realParent !== expectedParent) throw new Error('Build output parent resolves outside the allowed generated-output roots');
  }
  const publicSiteUrl = normalizedSiteUrl(siteUrl);
  // Coordinate builders by physical parent, including callers using a
  // symlinked external parent. Never remove an existing lock: its owner may
  // still be publishing, and an abandoned lock requires explicit inspection.
  const lockPath = path.join(realParent, `.${path.basename(output)}.wop-build.lock`);
  const lock = await fs.open(lockPath, 'wx').catch(error => {
    if (error.code === 'EEXIST') throw new Error('Another static build holds the output lock; wait for it to finish');
    throw error;
  });
  let lockIdentity;
  let result;
  let publishGuard;
  try {
    lockIdentity = await lock.stat();
    let existing = null;
    try {
      existing = await fs.lstat(output);
    } catch (error) {
      if (error.code !== 'ENOENT') throw error;
    }
    if (existing && (!existing.isDirectory() || existing.isSymbolicLink())) throw new Error('Build output must be a real directory');
    if (existing && !(await recognizedBuild(output))) throw new Error('Refusing to replace a directory not marked as Wiki of Open Polymer Data output');

    const temporary = await fs.mkdtemp(path.join(path.dirname(output), `.${path.basename(output)}-build-`));
    const staged = path.join(temporary, 'site');
    let backupRoot = null;
    let previous = null;
    try {
      await writeSite(snapshot, staged, publicSiteUrl, historyDirectory);
      if (acquirePublishGuard) publishGuard = await acquirePublishGuard();
      if (beforePublish) await beforePublish();
    } catch (error) {
      await fs.rm(temporary, { recursive: true, force: true }).catch(() => {});
      throw error;
    }

    const replacedPrevious = Boolean(existing);
    if (existing) {
      backupRoot = await fs.mkdtemp(path.join(path.dirname(output), `.${path.basename(output)}-previous-`));
      previous = path.join(backupRoot, 'site');
      try {
        await fs.rename(output, previous);
      } catch (error) {
        await fs.rm(temporary, { recursive: true, force: true }).catch(() => {});
        await fs.rm(backupRoot, { recursive: true, force: true }).catch(() => {});
        throw error;
      }
    }
    try {
      await fs.rename(staged, output);
    } catch (publishError) {
      if (previous) {
        try {
          await fs.rename(previous, output);
        } catch (restoreError) {
          await fs.rm(temporary, { recursive: true, force: true }).catch(() => {});
          throw new AggregateError(
            [publishError, restoreError],
            `Static build publication failed and restoration also failed; prior build remains at ${previous}`
          );
        }
      }
      await fs.rm(temporary, { recursive: true, force: true }).catch(() => {});
      if (backupRoot) await fs.rm(backupRoot, { recursive: true, force: true }).catch(() => {});
      throw publishError;
    }

    await fs.rm(temporary, { recursive: true, force: true }).catch(() => {});
    let retainedBackup = null;
    if (backupRoot) {
      try {
        await fs.rm(backupRoot, { recursive: true, force: true });
      } catch {
        retainedBackup = backupRoot;
      }
    }
    result = { output, replacedPrevious, retainedBackup, siteUrl: publicSiteUrl };
  } finally {
    if (publishGuard) {
      try { await publishGuard.release(); } catch {
        console.warn(`Snapshot publication guard cleanup was incomplete; inspect ${publishGuard.lockPath} before removal.`);
        if (result) result.retainedSnapshotLock = publishGuard.lockPath;
      }
    }
    // The site may already have been swapped into place. Cleanup failures
    // must not turn a successful swap into an error that causes a caller to
    // roll back its snapshot while leaving the new site live.
    let cleanupIncomplete = false;
    try { await lock.close(); } catch { cleanupIncomplete = true; }
    if (lockIdentity) {
      try {
        const current = await fs.lstat(lockPath);
        if (current.dev === lockIdentity.dev && current.ino === lockIdentity.ino) await fs.unlink(lockPath);
        else cleanupIncomplete = true;
      } catch (error) {
        if (error.code !== 'ENOENT') cleanupIncomplete = true;
      }
    } else cleanupIncomplete = true;
    if (cleanupIncomplete) {
      console.warn(`Static build output-lock cleanup was incomplete; a lock may remain at ${lockPath}.`);
      if (result) result.retainedLock = lockPath;
    }
  }
  return result;
}
