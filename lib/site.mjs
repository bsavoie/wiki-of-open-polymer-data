import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { CORE_ATTRIBUTE_KEYS, SECTION_KEYS, validateSnapshot } from './schema.mjs';
import { isPublicSourceUrl } from './source-policy.mjs';

const SITE_DIRECTORY = path.dirname(fileURLToPath(import.meta.url));
const SITE_ASSETS = path.resolve(SITE_DIRECTORY, '../site-assets');
const BUILD_SCHEMA = 'wop-static-build-v1';
const BUILD_GENERATOR = 'wiki-of-open-polymer-data';
const ASSET_FILES = ['site.css', 'search.js', 'article.js'];

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

function renderProse(value) {
  return String(value)
    .trim()
    .split(/\r?\n\s*\r?\n/)
    .map((paragraph) => paragraph.trim())
    .filter(Boolean)
    .map((paragraph) => `<p>${escapeHtml(paragraph)}</p>`)
    .join('');
}

function siteHeader(root) {
  return `<a class="skip-link" href="#main-content">Skip to main content</a>
<header class="site-header"><div class="site-header__inner">
  <a class="wordmark" href="${root}" aria-label="Wiki of Open Polymer Data home"><span class="wordmark__mark" aria-hidden="true">WOP</span><span><strong>Wiki of Open Polymer Data</strong><small>Open polymer reference</small></span></a>
  <nav class="site-nav" aria-label="Primary navigation"><a href="${root}#catalog">Catalog</a><a href="${root}#methodology">Methodology</a></nav>
</div></header>`;
}

function siteFooter(root) {
  return `<footer class="site-footer"><div><strong>Wiki of Open Polymer Data</strong><p>A completeness-first catalog whose empty sections are research invitations, not hidden claims.</p></div><div><p>Code: Apache-2.0 · Original data: CC0 · Original prose: CC BY 4.0. Linked sources retain their own terms.</p><a href="${root}#catalog">Browse polymer entries →</a></div></footer>`;
}

function layout({ title, description, body, page = 'article', scripts = '' }) {
  const home = page === 'home';
  const root = home ? './' : '../../';
  const assetRoot = home ? 'assets/' : '../../assets/';
  const fullTitle = home ? 'Wiki of Open Polymer Data' : `${title} · Wiki of Open Polymer Data`;
  return `<!doctype html>
<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1">
<title>${escapeHtml(fullTitle)}</title><meta name="description" content="${escapeHtml(description)}"><link rel="stylesheet" href="${assetRoot}site.css"></head>
<body>${siteHeader(root)}<main id="main-content">${body}</main>${siteFooter(root)}${scripts}</body></html>`;
}

function renderTags(values, className = '') {
  return values.map((value) => `<span${className ? ` class="${className}"` : ''}>${escapeHtml(humanize(value))}</span>`).join('');
}

function renderPolymerCard(polymer) {
  const searchable = [
    polymer.canonicalName,
    ...polymer.alternateNames,
    ...polymer.abbreviations,
    ...polymer.taxonomy.chemistryClasses
  ].join(' ').toLocaleLowerCase('en-US');
  const alternate = [...polymer.abbreviations, ...polymer.alternateNames].slice(0, 4);
  const category = PRIMARY_CLASS_LABELS[polymer.taxonomy.primaryClass] || humanize(polymer.taxonomy.primaryClass);
  return `<article class="polymer-card" data-polymer-card data-wop-id="${escapeHtml(polymer.wopId)}" data-search="${escapeHtml(searchable)}" data-primary-class="${escapeHtml(polymer.taxonomy.primaryClass)}" data-behaviors="${escapeHtml(polymer.taxonomy.materialBehaviors.join(' '))}" data-market-tiers="${escapeHtml(polymer.taxonomy.marketTiers.join(' '))}">
    <div class="polymer-card__meta"><span>${escapeHtml(polymer.wopId)}</span><span>${escapeHtml(humanize(polymer.maturity.contentMaturity))}</span></div>
    <h3><a href="polymers/${escapeHtml(polymer.canonicalSlug)}/">${escapeHtml(polymer.canonicalName)}</a></h3>
    ${alternate.length ? `<p class="polymer-card__aliases">${escapeHtml(alternate.join(' · '))}</p>` : ''}
    <p class="polymer-card__category">${escapeHtml(category)}</p>
    <div class="polymer-card__tags">${renderTags(polymer.taxonomy.materialBehaviors.slice(0, 3))}</div>
  </article>`;
}

function renderMethodologySource(source) {
  return `<li><a href="${escapeHtml(source.contentUrl || source.url)}" rel="external noreferrer">${escapeHtml(source.citation)}</a><span>${escapeHtml(source.locator)} · ${escapeHtml(humanize(source.reuseStatus))}</span></li>`;
}

export function renderHome(snapshot) {
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
  const body = `<section class="home-hero"><div><span class="eyebrow">Completeness before perfection</span><h1>Polymer knowledge, built in the open.</h1><p>From commodity plastics to engineering resins, elastomers, fibers, thermosets, biopolymers, and functional materials. The catalog starts broad and exposes its gaps so future research can make every entry stronger.</p><div class="corpus-stats"><span><strong>${polymers.length}</strong> canonical entries</span><span><strong>${classCounts.size}</strong> browsing classes</span><span><strong>${snapshot.methodology.sources.length}</strong> seed-method sources</span></div></div><aside><strong>Seed-set boundary</strong><p>${escapeHtml(snapshot.methodology.rankingDisclaimer)}</p></aside></section>
<section class="catalog" id="catalog" aria-labelledby="catalog-title"><header class="section-heading"><span class="eyebrow">Research queue and reference</span><h2 id="catalog-title">Polymer catalog</h2><p>Search names and abbreviations, then narrow by the entry's primary browsing class or material behavior.</p></header>
  <form class="catalog-controls" data-catalog-controls>
    <label class="catalog-search"><span>Search</span><input type="search" placeholder="Try polyethylene, PEEK, nylon, or silicone" autocomplete="off" data-search-input></label>
    <label><span>Primary class</span><select data-class-filter><option value="">All classes</option>${classOptions}</select></label>
    <label><span>Behavior</span><select data-behavior-filter><option value="">All behaviors</option>${behaviorOptions}</select></label>
    <button type="reset" data-clear-filters>Clear</button>
  </form>
  <div class="catalog-summary" aria-live="polite"><strong data-result-count>${polymers.length}</strong> entries shown</div>
  <div class="polymer-grid" data-polymer-grid>${polymers.map(renderPolymerCard).join('')}</div>
  <div class="empty-state" data-empty-state hidden><strong>No entry matches those filters.</strong><p>Try a canonical name, abbreviation, broader class, or clear the filters.</p></div>
</section>
<section class="methodology" id="methodology" aria-labelledby="methodology-title"><div><span class="eyebrow">How the seed works</span><h2 id="methodology-title">A broad starting denominator</h2><p>${escapeHtml(snapshot.methodology.scope)}</p><p>${escapeHtml(snapshot.methodology.sourceStandard)}</p><ul>${snapshot.methodology.selectionSignals.map((signal) => `<li>${escapeHtml(signal)}</li>`).join('')}</ul></div><div class="methodology__sources"><h3>Open methodology sources</h3><ol>${snapshot.methodology.sources.map(renderMethodologySource).join('')}</ol></div></section>
<script id="catalog-index" type="application/json">${jsonForHtml(searchIndex)}</script>`;
  return layout({
    title: 'Polymer catalog',
    description: 'An open-source-grounded, completeness-first reference for polymer families and materials.',
    body,
    page: 'home',
    scripts: '<script defer src="assets/search.js"></script>'
  });
}

function renderSource(source, index) {
  return `<li id="source-${escapeHtml(source.sourceId)}"><span class="source-number">${index + 1}</span><div><a href="${escapeHtml(source.contentUrl || source.url)}" rel="external noreferrer">${escapeHtml(source.citation)}</a><p>${escapeHtml(source.locator)}</p><div class="source-meta"><span>${escapeHtml(humanize(source.sourceType))}</span><span>${escapeHtml(humanize(source.reuseStatus))}</span><span>Accessed ${escapeHtml(source.accessedDate)}</span></div></div></li>`;
}

function renderSection(polymer, key, { tabPanel = false } = {}) {
  const text = polymer.sections[key];
  const supporting = polymer.sources.filter((source) => source.supports.includes(key));
  const number = String(SECTION_KEYS.indexOf(key) + 1).padStart(2, '0');
  const heading = tabPanel ? 'h3' : 'h2';
  const panelAttributes = tabPanel ? ' data-core-panel' : '';
  const classes = `article-section${tabPanel ? ' core-attribute-panel' : ''}`;
  if (!text.trim()) {
    return `<section class="${classes} article-section--empty" id="${escapeHtml(key)}"${panelAttributes}><div class="article-section__heading"><span>${number}</span><${heading}>${escapeHtml(SECTION_LABELS[key])}</${heading}></div><div class="research-gap"><strong>Open-source research needed</strong><p>This entry does not yet publish a sourced ${escapeHtml(SECTION_LABELS[key].toLocaleLowerCase('en-US'))} section.</p></div></section>`;
  }
  const citations = supporting.map((source) => `<a href="#source-${escapeHtml(source.sourceId)}">${escapeHtml(source.sourceId)}</a>`).join(', ');
  return `<section class="${classes}" id="${escapeHtml(key)}"${panelAttributes}><div class="article-section__heading"><span>${number}</span><${heading}>${escapeHtml(SECTION_LABELS[key])}</${heading}></div>${renderProse(text)}<p class="section-sources">Supported by ${citations}</p></section>`;
}

function renderCoreAttributes(polymer) {
  const tabs = CORE_ATTRIBUTE_KEYS.map((key) =>
    `<a href="#${escapeHtml(key)}" data-core-tab>${escapeHtml(SECTION_LABELS[key])}</a>`
  ).join('');
  return `<section class="core-attributes" id="core-attributes" data-core-attributes><div class="article-section__heading core-attributes__heading"><span>Core</span><h2>Core attributes</h2></div><p class="core-attributes__intro">Synthesis, measured mechanical behavior, and article processing are researched independently so their evidence boundaries stay visible.</p><nav class="core-attribute-tabs" aria-label="Core polymer attributes" data-core-tablist>${tabs}</nav><div class="core-attribute-panels">${CORE_ATTRIBUTE_KEYS.map((key) => renderSection(polymer, key, { tabPanel: true })).join('')}</div></section>`;
}

export function renderArticle(polymer, snapshot) {
  const category = PRIMARY_CLASS_LABELS[polymer.taxonomy.primaryClass] || humanize(polymer.taxonomy.primaryClass);
  const names = [...polymer.abbreviations, ...polymer.alternateNames];
  const byId = new Map(snapshot.polymers.map((entry) => [entry.wopId, entry]));
  const relationships = polymer.relationships.map((relationship) => ({ ...relationship, target: byId.get(relationship.wopId) })).filter((relationship) => relationship.target);
  const remainingSections = SECTION_KEYS.filter((key) => !CORE_ATTRIBUTE_KEYS.includes(key));
  const navigation = remainingSections.flatMap((key) => key === 'nomenclature'
    ? [key, 'core-attributes']
    : [key]);
  const body = `<nav class="breadcrumb" aria-label="Breadcrumb"><a href="../../">Polymer catalog</a><span aria-hidden="true">/</span><span>${escapeHtml(polymer.canonicalName)}</span></nav>
<article class="article-shell"><header class="article-hero"><div><span class="eyebrow">${escapeHtml(polymer.wopId)} · ${escapeHtml(humanize(polymer.entryKind))}</span><h1>${escapeHtml(polymer.canonicalName)}</h1>${names.length ? `<p class="article-aliases">${escapeHtml(names.join(' · '))}</p>` : ''}<div class="article-tags">${renderTags([...polymer.taxonomy.materialBehaviors, ...polymer.taxonomy.marketTiers])}</div></div><aside><span>Primary browsing class</span><strong>${escapeHtml(category)}</strong><span>Content maturity</span><strong>${escapeHtml(humanize(polymer.maturity.contentMaturity))}</strong><span>Confidence</span><strong>${escapeHtml(humanize(polymer.maturity.confidence))}</strong></aside></header>
<div class="article-layout"><aside class="article-nav"><strong>On this page</strong><nav>${navigation.map((key) => `<a href="#${escapeHtml(key)}">${escapeHtml(key === 'core-attributes' ? 'Core attributes' : SECTION_LABELS[key])}</a>`).join('')}<a href="#sources">Sources</a></nav></aside><div class="article-content">
  <section class="record-boundary"><div><span class="eyebrow">Record boundary</span><h2>${escapeHtml(category)}</h2></div><dl><div><dt>Origin</dt><dd>${escapeHtml(polymer.taxonomy.origins.map(humanize).join(', '))}</dd></div><div><dt>Chemistry classes</dt><dd>${escapeHtml(polymer.taxonomy.chemistryClasses.map(humanize).join(', '))}</dd></div><div><dt>Review flags</dt><dd>${escapeHtml(polymer.maturity.reviewFlags.map(humanize).join(', ') || 'None recorded')}</dd></div></dl></section>
  ${remainingSections.map((key) => key === 'nomenclature'
    ? `${renderSection(polymer, key)}${renderCoreAttributes(polymer)}`
    : renderSection(polymer, key)).join('')}
  ${relationships.length ? `<section class="article-section" id="relationships"><div class="article-section__heading"><span>↔</span><h2>Related entries</h2></div><ul class="relationships">${relationships.map((relationship) => `<li><span>${escapeHtml(humanize(relationship.kind))}</span><a href="../${escapeHtml(relationship.target.canonicalSlug)}/">${escapeHtml(relationship.target.canonicalName)}</a></li>`).join('')}</ul></section>` : ''}
  <section class="article-section sources" id="sources"><div class="article-section__heading"><span>§</span><h2>Sources</h2></div>${polymer.sources.length ? `<ol>${polymer.sources.map(renderSource).join('')}</ol>` : '<div class="research-gap"><strong>No article sources yet</strong><p>The entry is an identity-and-taxonomy stub. Methodology sources on the catalog page explain why it is in the initial research denominator; they do not support unwritten article claims.</p></div>'}</section>
</div></div></article>`;
  return layout({
    title: polymer.canonicalName,
    description: polymer.sections.overview.trim() || `Open-source research entry for ${polymer.canonicalName}.`,
    body,
    scripts: '<script defer src="../../assets/article.js"></script>'
  });
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

async function writeSite(snapshot, outputDirectory, siteUrl) {
  const containedDirectory = (...parts) => {
    const directory = path.resolve(outputDirectory, ...parts);
    if (!directory.startsWith(`${path.resolve(outputDirectory)}${path.sep}`)) {
      throw new Error('Generated route escaped the staged output directory');
    }
    return directory;
  };
  const assets = await Promise.all(ASSET_FILES.map((asset) => fs.readFile(path.join(SITE_ASSETS, asset), 'utf8')));
  await fs.mkdir(path.join(outputDirectory, 'assets'), { recursive: true });
  await fs.mkdir(path.join(outputDirectory, 'data', 'wop-publication-snapshot-v1'), { recursive: true });
  await fs.writeFile(path.join(outputDirectory, 'index.html'), renderHome(snapshot));
  await Promise.all(ASSET_FILES.map((asset, index) => fs.writeFile(path.join(outputDirectory, 'assets', asset), assets[index])));
  await fs.writeFile(path.join(outputDirectory, '_redirects'), renderRedirects(snapshot));
  if (siteUrl) {
    await fs.writeFile(path.join(outputDirectory, 'sitemap.xml'), renderSitemap(snapshot, siteUrl));
    await fs.writeFile(path.join(outputDirectory, 'robots.txt'), `User-agent: *\nAllow: /\nSitemap: ${new URL('sitemap.xml', siteUrl).href}\n`);
  } else {
    await fs.writeFile(path.join(outputDirectory, 'robots.txt'), 'User-agent: *\nAllow: /\n');
  }
  await fs.writeFile(path.join(outputDirectory, 'data', 'wop-publication-snapshot-v1', 'snapshot.json'), `${JSON.stringify(snapshot, null, 2)}\n`);
  await fs.writeFile(path.join(outputDirectory, '.wop-build.json'), `${JSON.stringify({
    schema: BUILD_SCHEMA,
    generator: BUILD_GENERATOR,
    polymerCount: snapshot.polymers.length
  })}\n`);
  const byId = new Map(snapshot.polymers.map((polymer) => [polymer.wopId, polymer]));
  await Promise.all(snapshot.polymers.map(async (polymer) => {
    const directory = containedDirectory('polymers', polymer.canonicalSlug);
    await fs.mkdir(directory, { recursive: true });
    await fs.writeFile(path.join(directory, 'index.html'), renderArticle(polymer, snapshot));
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
      Number.isInteger(marker?.polymerCount) && markerKeys === 'generator,polymerCount,schema';
    if (!currentMarker) return false;
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

export async function buildSite(snapshot, outputDirectory, { allowExternal = false, siteUrl = null } = {}) {
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
  if (!allowExternal) {
    const realParent = await fs.realpath(path.dirname(output));
    const expectedParent = output === distRoot ? repository : outputsRoot;
    if (realParent !== expectedParent) throw new Error('Build output parent resolves outside the allowed generated-output roots');
  }
  const publicSiteUrl = normalizedSiteUrl(siteUrl);
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
    await writeSite(snapshot, staged, publicSiteUrl);
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
  return { output, replacedPrevious, retainedBackup, siteUrl: publicSiteUrl };
}
