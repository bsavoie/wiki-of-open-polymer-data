import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import test from 'node:test';
import { importSnapshot, readAndValidateSnapshot } from '../lib/importer.mjs';
import { buildSite, renderArticle, renderHome } from '../lib/site.mjs';

const publicDirectory = path.resolve('public-data/wop-publication-snapshot-v2');
const fixtureDirectory = path.resolve('fixtures/wop-publication-snapshot-v2');
const snapshot = await readAndValidateSnapshot(publicDirectory);
const fixture = await readAndValidateSnapshot(fixtureDirectory);

const temporaryDirectory = () => fs.mkdtemp(path.join(os.tmpdir(), 'wop-test-'));
const isCanonicalNameInStructurePilot = ({ canonicalName }) => /^[A-C]/u.test(canonicalName);
const isArticleProfilePilot = ({ canonicalName }) => /^[A-C]/u.test(canonicalName);
const depictionGroups = (polymer) => [
  polymer.structuralDepictions,
  ...Object.values(polymer.contextualStructures || {})
];
const depictionItems = (polymer) => depictionGroups(polymer).flatMap(({ items }) => items);

async function listFiles(directory, prefix = '') {
  const files = [];
  for (const entry of await fs.readdir(directory, { withFileTypes: true })) {
    const relative = path.join(prefix, entry.name);
    if (entry.isDirectory()) files.push(...await listFiles(path.join(directory, entry.name), relative));
    else files.push(relative);
  }
  return files;
}

test('snapshot import validates before mutation and rolls back an invalid replacement', async () => {
  const root = await temporaryDirectory();
  const destination = path.join(root, 'wop-publication-snapshot-v2');
  await importSnapshot(fixtureDirectory, destination);
  const prior = await fs.readFile(path.join(destination, 'snapshot.json'), 'utf8');
  const invalidDirectory = path.join(root, 'invalid');
  await fs.mkdir(invalidDirectory);
  const invalid = structuredClone(fixture);
  invalid.polymers[0].canonicalSlug = 'Not a slug';
  await fs.writeFile(path.join(invalidDirectory, 'snapshot.json'), JSON.stringify(invalid));
  await assert.rejects(importSnapshot(invalidDirectory, destination), /Snapshot validation failed/);
  assert.equal(await fs.readFile(path.join(destination, 'snapshot.json'), 'utf8'), prior);

  const malformedStructureDirectory = path.join(root, 'malformed-structure');
  await fs.mkdir(malformedStructureDirectory);
  const malformedStructure = structuredClone(snapshot);
  malformedStructure.chemicalStructures[0].molfileV3000 = malformedStructure.chemicalStructures[0].molfileV3000
    .replace(/M  V30 1 \S+ /, 'M  V30 1 NotAnElement ');
  await fs.writeFile(path.join(malformedStructureDirectory, 'snapshot.json'), JSON.stringify(malformedStructure));
  await assert.rejects(importSnapshot(malformedStructureDirectory, destination), /Chemical structure|RDKit|V3000/);
  assert.equal(await fs.readFile(path.join(destination, 'snapshot.json'), 'utf8'), prior);
});

test('the static build emits canonical pages, unique aliases, local search, data, and no ambiguous routes', async () => {
  const root = await temporaryDirectory();
  const output = path.join(root, 'site');
  await buildSite(snapshot, output, { allowExternal: true, siteUrl: 'https://polymers.example.org/' });

  const home = await fs.readFile(path.join(output, 'index.html'), 'utf8');
  const polyethylene = await fs.readFile(path.join(output, 'polymers', 'polyethylene-family', 'index.html'), 'utf8');
  const abs = await fs.readFile(path.join(output, 'polymers', 'acrylonitrile-butadiene-styrene-copolymer', 'index.html'), 'utf8');
  const hdpe = await fs.readFile(path.join(output, 'polymers', 'high-density-polyethylene', 'index.html'), 'utf8');
  const pa6 = await fs.readFile(path.join(output, 'polymers', 'polyamide-6', 'index.html'), 'utf8');
  const alias = await fs.readFile(path.join(output, 'polymers', 'pe', 'index.html'), 'utf8');
  const redirects = await fs.readFile(path.join(output, '_redirects'), 'utf8');
  const sitemap = await fs.readFile(path.join(output, 'sitemap.xml'), 'utf8');
  const search = await fs.readFile(path.join(output, 'assets', 'search.js'), 'utf8');
  const articleScript = await fs.readFile(path.join(output, 'assets', 'article.js'), 'utf8');
  const style = await fs.readFile(path.join(output, 'assets', 'site.css'), 'utf8');
  const articleStyle = await fs.readFile(path.join(output, 'assets', 'article-refresh.css'), 'utf8');
  const catalogStyle = await fs.readFile(path.join(output, 'assets', 'catalog-refresh.css'), 'utf8');
  const font = await fs.readFile(path.join(output, 'assets', 'InterVariable.woff2'));
  assert.deepEqual(font, await fs.readFile(path.resolve('site-assets/InterVariable.woff2')));
  const publishedData = JSON.parse(await fs.readFile(path.join(output, 'data', 'wop-publication-snapshot-v2', 'snapshot.json'), 'utf8'));
  const publishedLegacyData = await fs.readFile(path.join(output, 'data', 'wop-publication-snapshot-v1', 'snapshot.json'), 'utf8');
  const frozenLegacyData = await fs.readFile(path.resolve('public-data/wop-publication-snapshot-v1/snapshot.json'), 'utf8');
  const marker = JSON.parse(await fs.readFile(path.join(output, '.wop-build.json'), 'utf8'));

  assert.match(home, /Polymer knowledge, built in the open/);
  assert.match(home, /data-catalog-controls/);
  assert.match(home, new RegExp(`${snapshot.polymers.length}<\\/strong> canonical entries`));
  assert.match(home, /<label><span>Class<\/span><select data-class-filter>/);
  assert.doesNotMatch(home, /primary browsing class|Primary class|browsing classes/i);
  assert.doesNotMatch(home, /Source Backed Draft|Content maturity|<span>Confidence<\/span>|<dt>Review flags<\/dt>/);
  assert.doesNotMatch(home, /polymer-card__tags/);
  assert.match(polyethylene, /id="structural-depictions"/);
  assert.match(polyethylene, /structure-card__image/);
  assert.match(polyethylene, /loading="eager"/);
  assert.match(polyethylene, /<img src="\.\.\/\.\.\/assets\/structures\/[^"]+\.svg" width="\d+" height="\d+" loading="eager" decoding="async" alt="[^"]+">/);
  assert.match(polyethylene, /Download V3000 molfile/);
  assert.match(polyethylene, /Definition and classification/);
  assert.match(polyethylene, /data-article-tablist/);
  assert.doesNotMatch(polyethylene, /role="tablist"/);
  assert.doesNotMatch(polyethylene, /role="tabpanel"/);
  assert.match(polyethylene, /Mechanical properties/);
  assert.match(polyethylene, /data-article-panel/);
  assert.equal((polyethylene.match(/id="feedstocksAndSynthesis"/g) || []).length, 1);
  assert.equal((polyethylene.match(/id="mechanicalProperties"/g) || []).length, 1);
  assert.ok(polyethylene.indexOf('id="overview"') < polyethylene.indexOf('id="nomenclature"'));
  assert.ok(polyethylene.indexOf('id="structural-depictions"') < polyethylene.indexOf('id="overview"'));
  assert.ok(polyethylene.indexOf('id="nomenclature"') < polyethylene.indexOf('id="feedstocksAndSynthesis"'));
  assert.ok(polyethylene.indexOf('id="structureAndMorphology"') < polyethylene.indexOf('id="feedstocksAndSynthesis"'));
  assert.match(polyethylene, /assets\/article\.js/);
  assert.match(polyethylene, /pe-laminatedplastics-ldpe-hdpe-uhmw-mechanics/);
  assert.match(polyethylene, /hdpe-elastoviscoplastic-tensile-rate-model-2012/);
  assert.doesNotMatch(polyethylene, /No article sources yet/);
  assert.match(abs, /<article class="article-shell article-shell--tabbed article-profile" data-article-profile>/);
  assert.match(abs, /<header class="article-profile__hero article-profile__hero--pair">/);
  assert.doesNotMatch(abs, /class="canonical-definition" id="overview"/);
  assert.doesNotMatch(abs, /contextual-structure-preview/);
  assert.match(abs, /class="structure-showcase structure-showcase--hero(?:\s|\")/);
  const absHeroFigures = abs.slice(abs.indexOf('<header class="article-profile__hero'), abs.indexOf('</header>', abs.indexOf('<header class="article-profile__hero')));
  assert.match(absHeroFigures, /Waves across bond ends mark connections to omitted portions/);
  assert.match(abs, /Short waves across bond ends mark connections to omitted portions; they are not wavy stereobonds/);
  assert.equal((absHeroFigures.match(/structure-card structure-card--compact/g) || []).length, 2);
  assert.match(abs, /aria-label="Structural depiction gallery with 2 items; scroll horizontally to view each item"/);
  assert.match(abs, /data-structure-gallery/);
  assert.match(abs, /data-structure-gallery-track/);
  assert.match(abs, /data-structure-gallery-toolbar hidden/);
  assert.match(abs, /data-structure-gallery-controls/);
  assert.match(abs, /data-structure-gallery-previous/);
  assert.match(abs, /data-structure-gallery-next/);
  assert.match(abs, /id="structural-depiction-notes"/);
  assert.match(abs, /<details class="structural-details" id="structural-depiction-notes"><summary>/);
  assert.doesNotMatch(abs, /<details class="structural-details"[^>]* open/);
  assert.match(abs, /Schematic unbracketed SAN-matrix segment/);
  assert.match(abs, /A crossed double bond means that E\/Z geometry is intentionally unspecified/);
  assert.match(abs, /<nav class="article-profile__tab-grid article-tabs__list" aria-label="Polymer article sections" data-article-tablist>/);
  assert.equal((abs.match(/ data-article-tab(?=[ >])/g) || []).length, 8);
  assert.equal((abs.match(/ data-article-panel(?=[ >])/g) || []).length, 8);
  assert.doesNotMatch(abs, /data-core-attributes|data-core-panel/);
  assert.doesNotMatch(abs, /role="tablist"|role="tabpanel"/);
  assert.equal((abs.match(/id="overview"/g) || []).length, 1);
  for (const id of ['general', 'history', 'feedstocksAndSynthesis', 'mechanicalProperties', 'processing', 'applications', 'degradation', 'degradationAndStability', 'recyclingAndEndOfLife', 'references', 'sources']) {
    assert.equal((abs.match(new RegExp(`id="${id}"`, 'g')) || []).length, 1);
  }
  assert.match(abs, /<dt>Class<\/dt><dd>Commodity thermoplastics<\/dd>/);
  const absHero = abs.slice(abs.indexOf('<header class="article-profile__hero'), abs.indexOf('data-article-tablist'));
  assert.match(absHero, /<h2 id="structural-depictions-title">Structure<\/h2>/);
  assert.doesNotMatch(absHero, />Chemical structure<\/h2>|Structural depiction<\/h2>|Depiction metadata|Component Set depiction|structure-showcase__badges|structure-showcase__evidence|>Reviewed<|>Schematic<|>Representative<|<div class="article-tags">/);
  assert.doesNotMatch(abs, /Primary browsing class|Content maturity|<dt>Confidence<\/dt>|<dt>Review flags<\/dt>/);
  assert.match(absHero, /class="article-maturity"><span class="status-chip">Source Backed Draft<\/span><a href="#research-progress">Evidence and review status<\/a>/);
  assert.match(abs, /id="research-progress"><summary>Evidence and review history<\/summary>/);
  assert.match(abs, /class="reference-document__citation" href="https:\/\/pubs\.rsc\.org\/en\/content\/articlelanding\/2024\/lp\/d4lp00238e"/);
  assert.match(abs, /class="reference-document__full-text" href="https:\/\/backoffice\.biblio\.ugent\.be\/download\/01JJKQP3EHHYEYTTR4D2K7FHNX\/01JKASZ885V5C54GSPYNK4RXK4"/);
  const absRecord = snapshot.polymers.find(({ wopId }) => wopId === 'wop-000033');
  assert.equal(absRecord.maturity.contentMaturity, 'source_backed_draft');
  assert.equal(absRecord.maturity.confidence, 'medium');
  assert.ok(absRecord.maturity.reviewFlags.length > 0);
  const overviewStart = abs.indexOf('id="overview"');
  const synthesisStart = abs.indexOf('id="feedstocksAndSynthesis"');
  for (const id of ['nomenclature', 'structureAndMorphology', 'properties', 'healthSafetyAndRegulation', 'limitationsAndVariability']) {
    const sectionPosition = abs.indexOf(`id="${id}"`);
    assert.ok(sectionPosition > overviewStart && sectionPosition < synthesisStart, `${id} must remain in Overview`);
  }
  assert.match(abs, /<h4 class="visually-hidden" id="canonical-definition-title">Canonical definition<\/h4>/);
  assert.match(abs, /<h4>Nomenclature and scope<\/h4>/);
  assert.match(abs, /<dl class="overview-facts">[\s\S]*<dt>Origin<\/dt>[\s\S]*<dt>Chemistry<\/dt>/);
  assert.doesNotMatch(abs, /record-boundary|Classification details/);
  assert.doesNotMatch(abs, /The canonical definition, names and scope, structural organization/);
  assert.match(abs, /id="feedstocksAndSynthesis"[^>]*data-article-panel[^>]*>[\s\S]*?<div class="article-section__heading article-section__heading--plain"><h2>Feedstocks and synthesis<\/h2>/);
  assert.match(abs, /id="mechanicalProperties"[^>]*data-article-panel[^>]*>[\s\S]*?<div class="article-section__heading article-section__heading--plain"><h2>Mechanical properties<\/h2>/);
  assert.match(abs, /id="processing"[^>]*data-article-panel[^>]*>[\s\S]*?<div class="article-section__heading article-section__heading--plain"><h2>Processing<\/h2>/);
  assert.doesNotMatch(abs, /id="(?:feedstocksAndSynthesis|mechanicalProperties|processing)"[^>]*data-article-panel[^>]*>[\s\S]*?<span>\d+<\/span>/);
  assert.match(abs, /<a href="#history" data-article-tab><strong>History<\/strong><\/a>/);
  assert.match(abs, /<a href="#feedstocksAndSynthesis" data-article-tab><strong>Synthesis<\/strong><\/a>/);
  assert.match(abs, /<a href="#mechanicalProperties" data-article-tab><strong>Mechanical properties<\/strong><\/a>/);
  assert.match(abs, /<a href="#processing" data-article-tab><strong>Processing<\/strong><\/a>/);
  assert.equal((abs.match(/class="overview-group overview-group--(?:definition|structure|use)"/g) || []).length, absRecord.sections.healthSafetyAndRegulation.trim() ? 3 : 2);
  assert.match(abs, /<section class="overview-group overview-group--definition"><h3>Definition and classification<\/h3>/);
  assert.match(abs, /<section class="overview-group overview-group--structure"><h3>Structure, properties, and variability<\/h3>/);
  if (absRecord.sections.healthSafetyAndRegulation.trim()) assert.match(abs, /<section class="overview-group overview-group--use"><h3>Health and safety<\/h3>/);
  assert.doesNotMatch(abs, /class="overview-group overview-group--gaps coverage-gaps"/);
  assert.ok(abs.indexOf('<header class="article-profile__hero') < abs.indexOf('id="structural-depictions"'));
  assert.ok(abs.indexOf('id="structural-depictions"') < abs.indexOf('data-article-tablist'));
  assert.ok(abs.indexOf('data-article-tablist') < abs.indexOf('class="article-profile__surface"'));
  assert.ok(abs.indexOf('class="article-profile__surface"') < abs.indexOf('id="overview"'));
  assert.equal((abs.match(/class="article-profile__surface"/g) || []).length, 1);
  assert.doesNotMatch(abs, /class="article-nav/);
  assert.ok(abs.indexOf('id="processing"') < abs.indexOf('id="degradation"'));
  for (const id of ['degradationAndStability', 'recyclingAndEndOfLife']) {
    assert.ok(abs.indexOf(`id="${id}"`) > abs.indexOf('id="degradation"'));
    assert.ok(abs.indexOf(`id="${id}"`) < abs.indexOf('id="references"'));
  }
  assert.ok(abs.indexOf('id="references"') < abs.indexOf('id="sources"'));
  assert.ok(abs.indexOf('id="structureAndMorphology"') < abs.indexOf('id="structural-depiction-notes"'));
  assert.ok(abs.indexOf('id="structural-depiction-notes"') < abs.indexOf('id="properties"'));
  for (const [page, id] of [[hdpe, 'wop-000005'], [pa6, 'wop-000053']]) {
    assert.match(page, new RegExp(id, 'i'));
    assert.match(page, /<dt>Class<\/dt><dd>[^<]+<\/dd>/);
    assert.doesNotMatch(page, /<div class="article-tags">/);
    assert.doesNotMatch(page, /Primary browsing class|Content maturity|<span>Confidence<\/span>|<dt>Review flags<\/dt>/);
    const maturityLabel = snapshot.polymers.find(({ wopId }) => wopId === id).maturity.contentMaturity
      .replaceAll('_', ' ').replace(/\b\w/g, (letter) => letter.toUpperCase());
    assert.ok(page.includes(`<p class="article-maturity"><span class="status-chip">${maturityLabel}</span>`));
    assert.equal((page.match(/ data-article-panel(?=[ >])/g) || []).length, 8);
    assert.match(page, /section-sources/);
    assert.doesNotMatch(page, /This stub does not yet publish|Open-source research stub for/);
  }
  assert.match(hdpe, /hdpe-amjadi-fatemi-tensile-2020/);
  assert.match(pa6, /pa6-zheng-ionic-liquid-mechanics-processing-2018/);
  assert.doesNotMatch(pa6, /pa6-basf-ultramid-b3k-properties-processing-2026/);
  assert.match(alias, /http-equiv="refresh"/);
  assert.match(redirects, /^\/polymers\/pe \/polymers\/polyethylene-family\/ 301$/m);
  assert.match(sitemap, /https:\/\/polymers\.example\.org\/polymers\/polyethylene-family\//);
  assert.doesNotMatch(sitemap, /<loc>\/polymers\/pe\//);
  assert.match(search, /data-behavior-filter/);
  assert.match(search, /index\.aliases/);
  assert.match(articleScript, /ArrowRight/);
  assert.match(articleScript, /ArrowDown/);
  assert.match(articleScript, /aria-orientation/);
  assert.match(articleScript, /hashchange/);
  assert.match(articleScript, /popstate/);
  assert.match(articleScript, /pushState/);
  assert.match(articleScript, /data-article-tabs/);
  assert.match(articleScript, /data-article-tablist/);
  assert.match(articleScript, /bringTabIntoView/);
  assert.match(articleScript, /requestAnimationFrame/);
  assert.match(articleScript, /scrollIntoView/);
  assert.match(articleScript, /tablist\.scrollLeft/);
  assert.match(articleScript, /focus\(\{ preventScroll: true \}\)/);
  assert.match(articleScript, /target\.classList\.contains\('legacy-fragment-target'\) \? panel : target/);
  assert.doesNotMatch(articleScript, /if \(destination === panel\) return;/);
  assert.match(articleScript, /isPanelRoute && root\.closest\('\[data-article-profile\]'\)/);
  assert.match(articleScript, /history\.replaceState\(routeState, '', `\$\{location\.pathname\}\$\{location\.search\}`\);[\s\S]*history\.replaceState\(routeState, '', routeHash\);/);
  assert.match(articleScript, /const restoreFocus = focus \|\| \(activePanel && activePanel\.id !== targetId\);/);
  assert.match(articleScript, /normalizeScroll: Boolean\(articleProfile && isPanelRoute\)/);
  assert.match(articleScript, /if \(!location\.hash\) \{\s+activate\(defaultTab, \{[\s\S]*normalizeScroll: Boolean\(articleProfile\)/);
  assert.match(articleScript, /activate\(tab, \{ historyMode: 'push', normalizeScroll: Boolean\(root\.closest\('\[data-article-profile\]'\)\) \}\);/);
  assert.match(articleScript, /Math\.min\(previousScrollY, surfaceTop - stickyTop - stickyHeight\)/);
  assert.doesNotMatch(articleScript, /activate\(tab, \{ historyMode: 'push' \}\);\s+revealFragment\(\);/);
  assert.match(articleScript, /history\.pushState\(null, '', link\.hash\);\s+revealFragment\(link\.hash\);/);
  assert.match(articleScript, /const revealFragment = \(hash = location\.hash, \{ scrollPanel = true \} = \{\}\) =>/);
  assert.match(articleScript, /destination === panel && !scrollPanel/);
  assert.match(articleScript, /scrollPanel: !articleProfile/);
  assert.match(articleScript, /const disclosure = target\.matches\('details'\) \? target : target\.closest\('details'\);/);
  assert.match(articleScript, /if \(disclosure\) disclosure\.open = true;/);
  assert.match(articleScript, /data-structure-gallery/);
  assert.match(articleScript, /data-structure-gallery-track/);
  assert.match(articleScript, /data-structure-gallery-controls/);
  assert.match(articleScript, /track\.scrollWidth > track\.clientWidth/);
  assert.match(articleScript, /const itemStart = \(item\) => item\.getBoundingClientRect\(\)\.left - track\.getBoundingClientRect\(\)\.left \+ track\.scrollLeft;/);
  assert.match(articleScript, /track\.scrollTo\(/);
  assert.match(articleScript, /track\.addEventListener\('keydown'/);
  assert.match(articleScript, /event\.key === 'ArrowRight'/);
  assert.match(articleScript, /addEventListener\('load', \(\) => requestAnimationFrame\(restoreTop\)/);
  assert.match(articleScript, /ResizeObserver/);
  assert.match(style, /--blue-dark/);
  assert.match(style, /\.structure-showcase/);
  assert.match(style, /\.article-hero--overview/);
  assert.match(style, /\.article-profile__hero/);
  assert.match(style, /\.article-profile__hero \.structure-grid--many \{[^}]*grid-auto-columns: 100%;[^}]*overflow-x: auto;/);
  assert.match(style, /\.article-profile__hero \{[\s\S]*grid-template-areas: "identity structure";/);
  assert.match(style, /\.article-profile__class/);
  assert.match(style, /\.article-profile__surface/);
  assert.match(style, /\.canonical-definition/);
  assert.match(style, /\.article-tab-panel--overview/);
  assert.match(style, /\.article-profile__tab-dock/);
  assert.match(style, /\.article-profile__tab-grid/);
  assert.match(style, /\.article-tabs__list/);
  assert.match(style, /\.article-shell--tabbed \.article-tab-panel \.article-section \{ scroll-margin-top: 150px; \}/);
  assert.match(style, /@media \(max-width: 900px\)[\s\S]*\.article-nav--tabbed \{ display: none; \}/);
  assert.match(style, /@media \(max-width: 600px\)[\s\S]*\.article-tabs__list \{[^}]*grid-auto-flow: column;[^}]*grid-auto-columns: minmax\(138px, 1fr\);/);
  assert.match(articleStyle, /@media \(max-width: 600px\)[\s\S]*\.article-profile__tab-grid \{[^}]*overflow-x: auto;/);
  assert.match(catalogStyle, /@media \(max-width: 600px\)[\s\S]*\.polymer-grid \{ grid-template-columns: minmax\(0, 1fr\); \}/);
  assert.match(style, /@media \(max-width: 720px\)[\s\S]*\.article-profile__hero \{[^}]*grid-template-areas: "identity" "structure";/);
  assert.doesNotMatch(style, /\.wordmark small, \.site-nav \{ display: none; \}/);
  assert.match(style, /@media print[\s\S]*\.article-tab-panel\[hidden\] \{ display: block !important; \}/);
  assert.match(style, /@media print[\s\S]*details\.structural-details:not\(\[open\]\) > \*:not\(summary\), details\.reference-support:not\(\[open\]\) > \*:not\(summary\) \{ display: block !important; \}/);
  assert.match(style, /@media print[\s\S]*\.article-tab-panel__intro \{ color: black;/);
  assert.match(style, /@media \(max-width: 600px\)[\s\S]*\.structure-card__image--wide \{[^}]*overflow-x: auto;/);
  assert.match(style, /\.structure-card__image--wide img \{ width: 560px; max-width: none; \}/);
  assert.match(style, /@media print[\s\S]*\.structure-card \{ break-inside: avoid; \}/);
  const withoutJavaScript = polyethylene.replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, '');
  assert.match(withoutJavaScript, /id="structural-depictions"/);
  assert.match(withoutJavaScript, /<figure class="structure-card">/);
  assert.match(withoutJavaScript, /class="structure-showcase__scope(?: |")/);
  const tabbedWithoutJavaScript = abs.replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, '');
  assert.equal((tabbedWithoutJavaScript.match(/ data-article-panel(?=[ >])/g) || []).length, 8);
  assert.doesNotMatch(tabbedWithoutJavaScript, /data-article-panel[^>]*\shidden(?:[\s>])/);
  assert.match(tabbedWithoutJavaScript, /id="applications"/);
  assert.equal(publishedData.polymers.length, snapshot.polymers.length);
  assert.equal(publishedLegacyData, frozenLegacyData);
  assert.deepEqual(marker, {
    schema: 'wop-static-build-v2',
    generator: 'wiki-of-open-polymer-data',
    polymerCount: snapshot.polymers.length,
    rendererVersion: 'rdkit-js-2025.03.4',
    styleVersion: 'wop-structure-style-v9',
    structureDefinitionCount: snapshot.chemicalStructures.length,
    renderedItemCount: snapshot.polymers.reduce((count, polymer) => count + depictionItems(polymer).length, 0)
  });
  const exampleStructure = snapshot.chemicalStructures[0].structureId;
  assert.match(await fs.readFile(path.join(output, 'assets', 'structures', `${exampleStructure}.svg`), 'utf8'), /<svg/);
  assert.match(await fs.readFile(path.join(output, 'assets', 'structures', `${exampleStructure}.mol`), 'utf8'), /V3000/);
  for (const { structureId } of snapshot.chemicalStructures) {
    await fs.access(path.join(output, 'assets', 'structures', `${structureId}.svg`));
    await fs.access(path.join(output, 'assets', 'structures', `${structureId}.mol`));
  }
  // Every current canonical article has completed the corpus rollout and must
  // publish at least one hero or contextual render with paired generated
  // assets and links. The separate renderer test below still covers the valid
  // schema/UI state for a future sourced no-unique article with no item.
  for (const polymer of snapshot.polymers) {
    const items = depictionItems(polymer);
    const article = await fs.readFile(
      path.join(output, 'polymers', polymer.canonicalSlug, 'index.html'),
      'utf8'
    );
    if (isArticleProfilePilot(polymer)) {
      const tabsPosition = article.indexOf('data-article-tablist');
      const structurePosition = article.indexOf('id="structural-depictions"');
      assert.ok(structurePosition < tabsPosition, `${polymer.wopId} structural depiction must be incorporated into the profile header`);
      assert.ok(tabsPosition < article.indexOf('id="overview"'), `${polymer.wopId} tabs must sit directly before the shared article surface`);
    } else {
      assert.ok(
        article.indexOf('id="structural-depictions"') < article.indexOf('id="overview"'),
        `${polymer.wopId} structural showcase must precede article content`
      );
    }
    assert.ok(items.length > 0, `${polymer.wopId} ${polymer.canonicalName} must publish a hero or contextual structure item`);
    for (const { structureId } of items) {
      const svgReference = `../../assets/structures/${structureId}.svg`;
      const molReference = `../../assets/structures/${structureId}.mol`;
      assert.ok(article.includes(svgReference), `${polymer.wopId} article must embed ${structureId}.svg`);
      assert.ok(article.includes(molReference), `${polymer.wopId} article must link ${structureId}.mol`);
      assert.match(
        await fs.readFile(path.join(output, 'assets', 'structures', `${structureId}.svg`), 'utf8'),
        /^<svg\b/,
        `${polymer.wopId} must have generated SVG for ${structureId}`
      );
      assert.match(
        await fs.readFile(path.join(output, 'assets', 'structures', `${structureId}.mol`), 'utf8'),
        /V3000/,
        `${polymer.wopId} must have generated V3000 MOL for ${structureId}`
      );
    }
  }
  const articleProfilePolymers = snapshot.polymers.filter(isArticleProfilePilot);
  assert.equal(articleProfilePolymers.length, 42, 'expected all current A–C articles in the reusable profile rollout');
  for (const polymer of articleProfilePolymers) {
    const article = await fs.readFile(
      path.join(output, 'polymers', polymer.canonicalSlug, 'index.html'),
      'utf8'
    );
    assert.match(article, /article-shell--tabbed article-profile/, `${polymer.wopId} must use the reusable article profile`);
    assert.match(article, /data-article-profile/, `${polymer.wopId} must expose the profile interaction boundary`);
    const structuralItemCount = polymer.structuralDepictions.items.length;
    const expectedHeroVariant = polymer.structuralDepictions.representationType === 'no_unique_repeat' || structuralItemCount === 0
      ? 'boundary'
      : structuralItemCount === 1
        ? 'single'
        : structuralItemCount === 2
          ? 'pair'
          : 'gallery';
    assert.match(article, new RegExp(`<header class="article-profile__hero article-profile__hero--${expectedHeroVariant}">`), `${polymer.wopId} must expose its structural hero modifier`);
    assert.equal((article.match(/ data-article-tab(?=[ >])/g) || []).length, 8, `${polymer.wopId} must have eight article tabs`);
    assert.equal((article.match(/ data-article-panel(?=[ >])/g) || []).length, 8, `${polymer.wopId} must have eight article panels`);
    assert.equal((article.match(/id="overview"/g) || []).length, 1, `${polymer.wopId} must render its canonical definition once`);
    assert.doesNotMatch(article, /data-core-attributes|data-core-panel/, `${polymer.wopId} must not nest the legacy core tabs`);
    assert.doesNotMatch(article, /Primary browsing class|Content maturity|<dt>Confidence<\/dt>|<dt>Review flags<\/dt>/, `${polymer.wopId} must not expose internal maturity metadata`);
    const profileHero = article.slice(article.indexOf('<header class="article-profile__hero'), article.indexOf('data-article-tablist'));
    assert.doesNotMatch(profileHero, />Chemical structure<\/h2>|Structural depiction<\/h2>|Depiction metadata|structure-showcase__badges|structure-showcase__evidence|<div class="article-tags">/, `${polymer.wopId} must keep the profile summary free of redundant or internal structure labels`);
    assert.match(article, /id="references"[^>]*data-article-panel/, `${polymer.wopId} must consolidate citations in References`);
    assert.match(article, /id="structural-depiction-notes"/, `${polymer.wopId} must provide a target for the hero scope link`);
    const structureNotes = article.slice(article.indexOf('id="structural-depiction-notes"'), article.indexOf('id="properties"'));
    for (const sourceId of polymer.structuralDepictions.sourceIds) {
      assert.ok(structureNotes.includes(`href="#source-${sourceId}"`), `${polymer.wopId} must retain structure source ${sourceId} with its detailed notes`);
    }
    for (const source of polymer.sources) {
      assert.ok(article.includes(`id="source-${source.sourceId}"`), `${polymer.wopId} must retain source ${source.sourceId}`);
    }
  }
  const pilotPolymers = snapshot.polymers.filter(isCanonicalNameInStructurePilot);
  assert.ok(pilotPolymers.length > 0, 'expected canonical-name A–C pilot articles');
  const cycloaliphaticEpoxy = await fs.readFile(
    path.join(output, 'polymers', 'cycloaliphatic-epoxy-resin', 'index.html'),
    'utf8'
  );
  assert.match(cycloaliphaticEpoxy, /No single canonical structure/);
  assert.doesNotMatch(cycloaliphaticEpoxy, /This material cannot be represented honestly by one definitive repeat-unit drawing/);
  assert.match(cycloaliphaticEpoxy, /class="contextual-structure-preview"/);
  assert.match(cycloaliphaticEpoxy, /Contextual examples/);
  assert.match(cycloaliphaticEpoxy, /Representative chemistry/);
  assert.match(cycloaliphaticEpoxy, /Synthesis context/);
  assert.match(cycloaliphaticEpoxy, /They are not a repeat unit or complete network/);
  const cycloaliphaticPreview = cycloaliphaticEpoxy.slice(
    cycloaliphaticEpoxy.indexOf('class="contextual-structure-preview"'),
    cycloaliphaticEpoxy.indexOf('</aside>', cycloaliphaticEpoxy.indexOf('class="contextual-structure-preview"'))
  );
  assert.match(cycloaliphaticPreview, /href="#feedstocksAndSynthesis"/);
  assert.match(cycloaliphaticPreview, /View details →/);
  assert.match(cycloaliphaticPreview, /<h5>Representative cycloaliphatic diepoxide precursor<\/h5>/);
  assert.match(cycloaliphaticPreview, /data-structure-fidelity="representative"/);
  assert.match(cycloaliphaticPreview, /Representative depiction/);
  assert.match(cycloaliphaticPreview, /Representative cycloaliphatic diepoxide constitution; stereochemistry, other precursor chemistries and the cured network are not specified/);
  assert.doesNotMatch(cycloaliphaticPreview, /Download V3000 molfile|Figure sources/);
  const cycloaliphaticHero = cycloaliphaticEpoxy.slice(
    cycloaliphaticEpoxy.indexOf('<header class="article-profile__hero'),
    cycloaliphaticEpoxy.indexOf('data-article-tablist')
  );
  assert.doesNotMatch(cycloaliphaticHero, /Representative chemistry|structure-card--compact/);
  assert.match(cycloaliphaticEpoxy, /Synthesis chemistry/);
  assert.doesNotMatch(cycloaliphaticEpoxy, /Synthesis structures/);
  assert.match(cycloaliphaticEpoxy, /class="citation-ref"[^>]*>\[3\]<\/a>/);
  assert.ok((cycloaliphaticEpoxy.match(/class="reference-document"/g) || []).length < snapshot.polymers.find(({ wopId }) => wopId === 'wop-000103').sources.length);
  assert.match(cycloaliphaticEpoxy, /id="reference-2" class="reference-document"[\s\S]*?<span>3 evidence notes<\/span>[\s\S]*?\[2\.a\][\s\S]*?\[2\.b\][\s\S]*?\[2\.c\]/);
  for (const source of snapshot.polymers.find(({ wopId }) => wopId === 'wop-000103').sources) {
    assert.match(cycloaliphaticEpoxy, new RegExp(`id="source-${source.sourceId}"`));
  }
  assert.ok(
    cycloaliphaticEpoxy.indexOf('id="feedstocksAndSynthesis"') < cycloaliphaticEpoxy.lastIndexOf('Representative cycloaliphatic diepoxide'),
    'the full finite-diepoxide card must remain inside the synthesis section after its overview preview'
  );
  const benzoguanamineResin = await fs.readFile(
    path.join(output, 'polymers', 'benzoguanamine-formaldehyde-resin', 'index.html'),
    'utf8'
  );
  assert.match(benzoguanamineResin, /No single canonical structure/);
  assert.match(benzoguanamineResin, /Representative chemistry/);
  assert.match(benzoguanamineResin, /Processing context/);
  assert.match(benzoguanamineResin, /href="#processing"/);
  assert.match(benzoguanamineResin, /Processing chemistry/);
  assert.doesNotMatch(benzoguanamineResin, /Processing structures/);
  const epoxyNovolacVinylEster = await fs.readFile(
    path.join(output, 'polymers', 'epoxy-novolac-vinyl-ester', 'index.html'),
    'utf8'
  );
  assert.match(epoxyNovolacVinylEster, /No single canonical structure/);
  assert.match(epoxyNovolacVinylEster, /One open methacrylate side chain/);
  assert.match(epoxyNovolacVinylEster, /aromatic ring, bridges and cured network are not depicted/);
  assert.match(epoxyNovolacVinylEster, /novolac-methacrylate-open-side-chain\.svg/);
  assert.doesNotMatch(epoxyNovolacVinylEster, /o-cresol-epoxy-novolac-vinyl-ester-source-motif\.svg/);
  assert.doesNotMatch(epoxyNovolacVinylEster, /novolac-epoxy-vinyl-ester-motif/);
  const epoxyNovolacPreview = epoxyNovolacVinylEster.slice(
    epoxyNovolacVinylEster.indexOf('class="contextual-structure-preview"'),
    epoxyNovolacVinylEster.indexOf('</aside>', epoxyNovolacVinylEster.indexOf('class="contextual-structure-preview"'))
  );
  assert.match(epoxyNovolacPreview, /data-structure-fidelity="representative"/);
  assert.match(epoxyNovolacPreview, /Representative depiction/);
  assert.match(epoxyNovolacPreview, /aromatic ring, bridges and cured network are not depicted/);
  const phthalonitrile = await fs.readFile(
    path.join(output, 'polymers', 'phthalonitrile-resin', 'index.html'),
    'utf8'
  );
  assert.match(phthalonitrile, /data-article-profile/);
  assert.match(phthalonitrile, /No single canonical structure/);
  assert.match(phthalonitrile, /class="contextual-structure-preview"/);
  assert.match(phthalonitrile, /Processing context/);
  assert.doesNotMatch(phthalonitrile, /Open Processing tab/);
  assert.match(phthalonitrile, /4-\(4-Aminophenoxy\)phthalonitrile example/);
  const phthalonitrilePreview = phthalonitrile.slice(
    phthalonitrile.indexOf('class="contextual-structure-preview"'),
    phthalonitrile.indexOf('</aside>', phthalonitrile.indexOf('class="contextual-structure-preview"'))
  );
  assert.match(phthalonitrilePreview, /<h4 id="representative-chemistry-title">Representative chemistry<\/h4>/);
  assert.match(phthalonitrilePreview, /<h5>4-\(4-Aminophenoxy\)phthalonitrile example<\/h5>/);
  assert.doesNotMatch(phthalonitrilePreview, /<h3 id="representative-chemistry-title">/);
  assert.ok(
    phthalonitrile.indexOf('id="overview"') < phthalonitrile.indexOf('class="contextual-structure-preview"'),
    'articles must place their representative chemistry inside Overview'
  );
  assert.ok(
    phthalonitrile.indexOf('class="contextual-structure-preview"') < phthalonitrile.indexOf('id="feedstocksAndSynthesis"'),
    'articles must keep their representative chemistry within Overview'
  );
  const boundedContextArticles = snapshot.polymers.filter((polymer) =>
    polymer.structuralDepictions.representationType === 'no_unique_repeat' &&
    Object.values(polymer.contextualStructures || {}).some((group) => group.items.length)
  );
  assert.ok(boundedContextArticles.length > 0, 'expected structurally bounded articles with contextual chemistry');
  for (const polymer of boundedContextArticles) {
    const article = await fs.readFile(
      path.join(output, 'polymers', polymer.canonicalSlug, 'index.html'),
      'utf8'
    );
    assert.match(article, /No single canonical structure/, `${polymer.wopId} must state its structural boundary concisely`);
    assert.match(article, /class="contextual-structure-preview"/, `${polymer.wopId} must surface its contextual chemistry`);
    assert.match(article, /They are not a repeat unit or complete network/, `${polymer.wopId} must distinguish contextual chemistry from the material structure`);
    const previewStart = article.indexOf('class="contextual-structure-preview"');
    const preview = article.slice(previewStart, article.indexOf('</aside>', previewStart));
    for (const group of Object.values(polymer.contextualStructures || {})) {
      for (const item of group.items) {
        assert.match(preview, new RegExp(`data-structure-fidelity="${item.fidelity}"`), `${polymer.wopId} must disclose ${item.fidelity} fidelity in its compact preview`);
        assert.ok(preview.includes(item.caption), `${polymer.wopId} must retain each contextual item caveat in its compact preview`);
      }
    }
  }
  const shippedFiles = await listFiles(output);
  assert.equal(shippedFiles.some((name) => /indigo|ketcher|rdkit|\.wasm$/i.test(name)), false);
  await assert.rejects(fs.access(path.join(output, 'polymers', 'pei')));

  await buildSite(fixture, output, { allowExternal: true });
  const replacedMarker = JSON.parse(await fs.readFile(path.join(output, '.wop-build.json'), 'utf8'));
  assert.equal(replacedMarker.polymerCount, 1);
  const leftovers = (await fs.readdir(root)).filter((name) => name.startsWith('.site-build-'));
  assert.deepEqual(leftovers, []);
});

test('Applications is a distinct sourced panel, preserves fragments, and supports empty stubs', () => {
  const empty = renderArticle(fixture.polymers[0], fixture);
  assert.match(empty, /href="#applications" data-article-tab><strong>Applications<\/strong>/);
  assert.equal((empty.match(/id="applications"/g) || []).length, 1);
  assert.match(empty, /id="applications" data-article-panel>[\s\S]*?does not yet publish a sourced applications section/);
  const copy = structuredClone(fixture);
  copy.polymers[0].sections.applications = 'Products and industries. Sensor films <script>unsafe</script>\n\nPurchasing. A specified powder grade.\n\nScale and evidence limits. A 5 g package is not annual consumption.';
  const html = renderArticle(copy.polymers[0], copy);
  assert.match(html, /<h3>Products and industries<\/h3><p>Sensor films &lt;script&gt;unsafe&lt;\/script&gt;<\/p>/);
  assert.match(html, /<h3>Purchasing<\/h3>/);
  assert.match(html, /<h3>Scale and evidence limits<\/h3>/);
  assert.ok(html.indexOf('id="applications"') > html.indexOf('id="processing"'));
  assert.equal((html.match(/id="applications"/g) || []).length, 1);
  copy.polymers[0].sections.applications = 'Earlier application prose remains readable.';
  assert.match(renderArticle(copy.polymers[0], copy), /<p>Earlier application prose remains readable\.<\/p>/);
});

test('an empty stub has a distinct History tab and a readable research gap', () => {
  const html = renderArticle(fixture.polymers[0], fixture);
  assert.match(html, /<section class="overview-group overview-group--gaps coverage-gaps"[^>]*><h3[^>]*>Coverage gaps<\/h3>/);
  assert.match(html, /href="#history" data-article-tab><strong>History<\/strong>/);
  assert.equal((html.match(/id="history"/g) || []).length, 1);
  assert.match(html, /id="history" data-article-panel>[\s\S]*?does not yet publish a sourced history section/);
  assert.doesNotMatch(html, /data-article-panel[^>]*\shidden(?:[\s>])/);
});

test('Degradation keeps both evidence sections in one tab and shows explicit gaps on stubs', () => {
  const empty = renderArticle(fixture.polymers[0], fixture);
  assert.match(empty, /href="#degradation" data-article-tab><strong>Degradation<\/strong>/);
  const panel = empty.slice(empty.indexOf('id="degradation"'), empty.indexOf('id="references"'));
  for (const title of ['Degradation products and pathways', 'Timescales', 'Environmental persistence', 'Reclamation and recycling']) {
    assert.ok(panel.includes(`<h3>${title}</h3>`));
  }
  assert.equal((panel.match(/Open-source research needed/g) || []).length, 4);
  for (const id of ['degradation', 'degradationAndStability', 'recyclingAndEndOfLife']) {
    assert.equal((empty.match(new RegExp(`id="${id}"`, 'g')) || []).length, 1);
  }
  assert.doesNotMatch(panel, /\shidden(?:[\s>])/);

  const copy = structuredClone(fixture);
  copy.polymers[0].sections.degradationAndStability = 'Degradation products and pathways: <script>unsafe</script>\n\nTimescales: A condition-qualified test.\n\nEnvironmental persistence: No field lifetime established.';
  copy.polymers[0].sections.recyclingAndEndOfLife = 'A scoped recovery example.';
  const populated = renderArticle(copy.polymers[0], copy);
  assert.match(populated, /<h3>Timescales<\/h3><p>A condition-qualified test\.<\/p>/);
  assert.match(populated, /&lt;script&gt;unsafe&lt;\/script&gt;/);
  assert.doesNotMatch(populated, /<script>unsafe/);
  copy.polymers[0].sections.degradationAndStability = 'Previously authored prose remains readable.';
  const legacySection = renderArticle(copy.polymers[0], copy).match(/id="degradationAndStability"[^>]*>([\s\S]*?)<\/section>/)?.[1];
  assert.ok(legacySection);
  assert.match(legacySection, /^<h3>Degradation and stability<\/h3><div class="section-status"/);
  assert.match(legacySection, /<span>Populated<\/span>/);
  assert.match(legacySection, /Section evidence status/);
  assert.match(legacySection, /<p>Previously authored prose remains readable\.<\/p>/);
});

test('renderers escape imported prose, names, and embedded search JSON', () => {
  const copy = structuredClone(fixture);
  copy.polymers[0].canonicalName = '<img src=x onerror=alert(1)>';
  copy.polymers[0].alternateNames = ['</script><script>alert(2)</script>'];
  copy.polymers[0].structuralDepictions = {
    reviewStatus: 'draft',
    representationType: 'constitutional_repeat_unit',
    scopeNote: '<script>alert(4)</script>',
    sourceIds: ['source"><script>alert(5)</script>'],
    items: [{
      structureId: 'fixture-structure',
      label: '<img src=x onerror=alert(6)>',
      fidelity: 'representative',
      altText: '"><script>alert(7)</script>',
      caption: '<script>alert(8)</script>',
      notation: '<script>alert(9)</script>'
    }]
  };
  copy.polymers[0].contextualStructures = {
    processing: {
      reviewStatus: 'draft',
      scopeNote: '<script>alert(10)</script>',
      sourceIds: ['source"><script>alert(5)</script>'],
      items: [{
        structureId: 'fixture-structure',
        label: 'Curing agent',
        fidelity: 'representative',
        altText: 'Representative curing agent',
        caption: 'Finite processing component.'
      }]
    }
  };
  copy.searchTerms = [{ term: '</script><script>alert(3)</script>', kind: 'umbrella', wopIds: [copy.polymers[0].wopId] }];
  const article = renderArticle(copy.polymers[0], copy);
  const home = renderHome(copy);
  assert.doesNotMatch(article, /<img src=x/);
  assert.match(article, /&lt;img src=x onerror=alert\(1\)&gt;/);
  assert.doesNotMatch(article, /<script>alert\((?:[4-9]|10)\)<\/script>/);
  assert.match(article, /&lt;script&gt;alert\(8\)&lt;\/script&gt;/);
  assert.match(article, /&lt;script&gt;alert\(9\)&lt;\/script&gt;/);
  assert.match(article, /&lt;script&gt;alert\(10\)&lt;\/script&gt;/);
  assert.doesNotMatch(home, /<script>alert\(2\)<\/script>/);
  assert.match(home, /\\u003c\/script>/);
});

test('article rendering distinguishes multiple depictions from an honest no-unique state', () => {
  const multiple = structuredClone(fixture);
  multiple.polymers[0].structuralDepictions = {
    reviewStatus: 'reviewed',
    representationType: 'component_set',
    scopeNote: 'The components are shown separately; no covalent bond or blend ratio is implied.',
    sourceIds: ['component-source'],
    items: [
      { structureId: 'component-a', label: 'Component A', fidelity: 'representative', altText: 'Representative component A repeat unit', caption: 'Representative first component.' },
      { structureId: 'component-b', label: 'Component B', fidelity: 'schematic', altText: 'Schematic component B repeat unit', caption: 'Schematic second component.' }
    ]
  };
  const multipleHtml = renderArticle(multiple.polymers[0], multiple, {
    structureDimensions: new Map([
      ['component-a', { width: 960, height: 180 }],
      ['component-b', { width: 400, height: 400 }]
    ])
  });
  assert.match(multipleHtml, /class="structure-grid(?:\s|\")/);
  assert.doesNotMatch(multipleHtml, /structure-grid--single/);
  assert.equal((multipleHtml.match(/<figure class="structure-card structure-card--compact">/g) || []).length, 2);
  assert.equal((multipleHtml.match(/structure-card__image--wide/g) || []).length, 1);
  assert.match(multipleHtml, /tabindex="0" aria-label="Chemical structure; scroll horizontally to see the full structure" data-structure-scroll/);

  const noUnique = structuredClone(fixture);
  noUnique.polymers[0].structuralDepictions = {
    reviewStatus: 'reviewed',
    representationType: 'no_unique_repeat',
    scopeNote: 'Irregular connectivity prevents one defensible repeat-unit drawing.',
    sourceIds: ['irregular-source'],
    items: []
  };
  const noUniqueHtml = renderArticle(noUnique.polymers[0], noUnique);
  assert.match(noUniqueHtml, /No single canonical structure/);
  assert.match(noUniqueHtml, /Irregular connectivity prevents one defensible repeat-unit drawing/);
  assert.doesNotMatch(noUniqueHtml, /<figure class="structure-card(?:\s|\")/);
});

test('the builder refuses source roots, arbitrary directories, and alias route collisions', async () => {
  await assert.rejects(
    buildSite(fixture, path.resolve('public-data/unsafe-build')),
    /Build output must be dist/
  );

  const root = await temporaryDirectory();
  const arbitrary = path.join(root, 'existing');
  await fs.mkdir(arbitrary);
  await fs.writeFile(path.join(arbitrary, 'keep.txt'), 'user data');
  await assert.rejects(buildSite(fixture, arbitrary, { allowExternal: true }), /not marked/);
  assert.equal(await fs.readFile(path.join(arbitrary, 'keep.txt'), 'utf8'), 'user data');

  const legacy = path.join(root, 'legacy-output');
  await Promise.all(['assets', 'data', 'polymers'].map((directory) => fs.mkdir(path.join(legacy, directory), { recursive: true })));
  await fs.writeFile(path.join(legacy, 'index.html'), 'legacy build');
  await fs.writeFile(path.join(legacy, '.wop-build.json'), JSON.stringify({
    schema: 'wop-static-build-v1',
    generator: 'wiki-of-open-polymer-data',
    polymerCount: 262
  }));
  await buildSite(fixture, legacy, { allowExternal: true });
  assert.equal(JSON.parse(await fs.readFile(path.join(legacy, '.wop-build.json'), 'utf8')).schema, 'wop-static-build-v2');

  const collision = structuredClone(fixture);
  collision.aliases = [{ slug: collision.polymers[0].canonicalSlug, wopId: collision.polymers[0].wopId }];
  await assert.rejects(buildSite(collision, path.join(root, 'collision'), { allowExternal: true }), /conflicts with a canonical slug|route collision/);

  await assert.rejects(buildSite(fixture, path.join(root, 'external-by-default')), /explicitly allows/);

  const escaped = structuredClone(fixture);
  escaped.polymers[0].canonicalSlug = '../../../audit-escape';
  await assert.rejects(
    buildSite(escaped, path.join(root, 'unsafe-site'), { allowExternal: true }),
    /Snapshot validation failed/
  );
  await assert.rejects(fs.access(path.join(root, 'audit-escape')));
});

test('a structure parse/render failure cannot replace the prior validated site', async () => {
  const root = await temporaryDirectory();
  const output = path.join(root, 'site');
  await buildSite(fixture, output, { allowExternal: true });
  const priorMarker = await fs.readFile(path.join(output, '.wop-build.json'), 'utf8');
  const priorHome = await fs.readFile(path.join(output, 'index.html'), 'utf8');
  const malformed = structuredClone(snapshot);
  malformed.chemicalStructures[0].molfileV3000 = malformed.chemicalStructures[0].molfileV3000
    .replace(/M  V30 1 \S+ /, 'M  V30 1 NotAnElement ');
  await assert.rejects(buildSite(malformed, output, { allowExternal: true }), /Chemical structure|RDKit|V3000/);
  assert.equal(await fs.readFile(path.join(output, '.wop-build.json'), 'utf8'), priorMarker);
  assert.equal(await fs.readFile(path.join(output, 'index.html'), 'utf8'), priorHome);
});

test('the importer refuses unowned destinations and stable-route reassignment', async () => {
  const root = await temporaryDirectory();
  const unowned = path.join(root, 'unowned', 'wop-publication-snapshot-v2');
  await fs.mkdir(unowned, { recursive: true });
  await fs.writeFile(path.join(unowned, 'keep.txt'), 'user data');
  await assert.rejects(importSnapshot(fixtureDirectory, unowned), /not marked/);
  assert.equal(await fs.readFile(path.join(unowned, 'keep.txt'), 'utf8'), 'user data');

  await assert.rejects(importSnapshot(fixtureDirectory, root), /directory named/);

  const destination = path.join(root, 'owned', 'wop-publication-snapshot-v2');
  await fs.mkdir(path.dirname(destination));
  await importSnapshot(fixtureDirectory, destination);
  const changedDirectory = path.join(root, 'changed');
  await fs.mkdir(changedDirectory);
  const changed = structuredClone(fixture);
  changed.polymers[0].canonicalSlug = 'polyethylene-renamed-without-route-lineage';
  await fs.writeFile(path.join(changedDirectory, 'snapshot.json'), JSON.stringify(changed));
  await assert.rejects(importSnapshot(changedDirectory, destination), /without preserving that route as an alias/);
  assert.equal((await readAndValidateSnapshot(destination)).polymers[0].canonicalSlug, fixture.polymers[0].canonicalSlug);

  const repurposedDirectory = path.join(root, 'repurposed');
  await fs.mkdir(repurposedDirectory);
  const repurposed = structuredClone(fixture);
  repurposed.polymers[0].canonicalName = 'Completely Unrelated Material';
  repurposed.polymers[0].alternateNames = [];
  repurposed.polymers[0].abbreviations = [];
  await fs.writeFile(path.join(repurposedDirectory, 'snapshot.json'), JSON.stringify(repurposed));
  await assert.rejects(importSnapshot(repurposedDirectory, destination), /without preserving prior identity/);

  const releasedDestination = path.join(root, 'released', 'wop-publication-snapshot-v2');
  await fs.mkdir(path.dirname(releasedDestination));
  await importSnapshot(publicDirectory, releasedDestination);
  const removedStructureDirectory = path.join(root, 'removed-structure');
  await fs.mkdir(removedStructureDirectory);
  const removedStructure = structuredClone(snapshot);
  const pex = removedStructure.polymers.find((polymer) => polymer.wopId === 'wop-000008');
  pex.structuralDepictions = {
    ...pex.structuralDepictions,
    representationType: 'no_unique_repeat',
    scopeNote: 'A sourced review does not select one unique repeat unit.',
    items: []
  };
  // Keep this fixture valid so the importer reaches the stable-asset removal guard.
  delete pex.synthesisRoutes;
  removedStructure.chemicalStructures = removedStructure.chemicalStructures
    .filter((structure) => structure.structureId !== 'pex-carbon-carbon-junction');
  await fs.writeFile(path.join(removedStructureDirectory, 'snapshot.json'), JSON.stringify(removedStructure));
  await assert.rejects(
    importSnapshot(removedStructureDirectory, releasedDestination),
    /remove stable chemical structure pex-carbon-carbon-junction/
  );

  // A single draft must not disable the structure-ID guard for all articles.
  const draftSource = path.join(root, 'draft-source');
  const draftDestination = path.join(root, 'draft-owned', 'wop-publication-snapshot-v2');
  await fs.mkdir(draftSource);
  await fs.mkdir(path.dirname(draftDestination));
  const draftBaseline = structuredClone(snapshot);
  draftBaseline.polymers.find((polymer) => polymer.wopId === 'wop-000096').structuralDepictions.reviewStatus = 'draft';
  await fs.writeFile(path.join(draftSource, 'snapshot.json'), JSON.stringify(draftBaseline));
  await importSnapshot(draftSource, draftDestination);
  await assert.rejects(
    importSnapshot(removedStructureDirectory, draftDestination),
    /remove stable chemical structure pex-carbon-carbon-junction/
  );
});
