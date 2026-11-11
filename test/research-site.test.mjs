import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import test from 'node:test';
import vm from 'node:vm';
import { buildSite, renderArticle, renderHome } from '../lib/site.mjs';
import { sectionContentHash } from '../lib/research.mjs';

const snapshot = JSON.parse(await fs.readFile(new URL('../public-data/wop-publication-snapshot-v2/snapshot.json', import.meta.url), 'utf8'));

function researchArticle() {
  const article = structuredClone(snapshot.polymers.find((item) => item.sources.some((source) => source.supports.includes('mechanicalProperties'))));
  const sourceId = article.sources.find((source) => source.supports.includes('mechanicalProperties')).sourceId;
  article.evidence = [{ evidenceId: 'test-measurement', section: 'mechanicalProperties', kind: 'measurement', attribute: 'Tensile modulus', material: 'Specified test grade', value: { min: 1.2, max: 1.5, units: 'GPa', uncertainty: 0.1, uncertaintyNote: 'Reported standard deviation' }, conditions: 'Dry, at 23 °C', method: 'Named tensile protocol', sourceId, locator: 'Table 2', limitations: 'Only this grade and specimen.' }];
  article.research = { questions: [{ questionId: 'test-question', section: 'mechanicalProperties', question: 'What does this grade support?', scope: 'Only the specified grade.', priority: 'high', status: 'resolved', acceptanceCriteria: 'Retain test conditions.', attempts: [{ date: '2026-09-25', summary: 'Checked the table.', sourceIds: [sourceId] }], resolution: { date: '2026-09-25', summary: 'Qualified value recorded.', sourceIds: [sourceId], evidenceIds: ['test-measurement'] } }], sectionReviews: [{ section: 'mechanicalProperties', reviewedDate: '2026-09-25', summary: 'Checked material and test scope.', contentHash: sectionContentHash(article, 'mechanicalProperties') }], history: [{ changeId: 'test-change', date: '2026-09-25', summary: 'Added one qualified record.', sections: ['mechanicalProperties'], questionIds: ['test-question'] }] };
  return article;
}

test('articles distinguish population, evidence, review, outcomes, and inherited flags', () => {
  const article = researchArticle();
  let html = renderArticle(article, snapshot);
  assert.match(html, /Source Backed Draft|Source-backed Draft|Agent Corrected|Open Source Reviewed/);
  assert.match(html, /1 structured measurement record/);
  assert.match(html, /Reviewed at this revision · 2026-09-25/);
  assert.match(html, /id="question-test-question"/);
  assert.match(html, /Only the specified grade/);
  assert.match(html, /Checked the table/);
  assert.match(html, /Qualified value recorded/);
  assert.match(html, /Added one qualified record/);
  for (const flag of article.maturity.reviewFlags) assert.ok(html.includes(flag.replaceAll('_', ' ').replace(/\b\w/g, (character) => character.toUpperCase())));
  assert.match(html, /not individual research assignments/);
  article.sections.mechanicalProperties += '\n\nA changed section.';
  html = renderArticle(article, snapshot);
  assert.match(html, /Content changed since review/);
  assert.doesNotMatch(html, /Reviewed at this revision/);
});

test('evidence renders scoped values with source links before technical prose', () => {
  const article = researchArticle();
  const html = renderArticle(article, snapshot);
  const panel = html.slice(html.indexOf('id="mechanicalProperties" data-article-panel'));
  assert.ok(panel.indexOf('class="evidence-table"') < panel.indexOf('class="section-prose section-prose--technical"'));
  for (const content of ['1.2–1.5 ± 0.1', 'GPa', 'Specified test grade', 'Dry, at 23 °C', 'Named tensile protocol', 'Only this grade and specimen.', 'Table 2', 'Reported standard deviation']) assert.ok(panel.includes(content), content);
  assert.ok(panel.includes(`href="#source-${article.evidence[0].sourceId}"`));
  article.evidence[0].material = '<script>alert(1)</script>';
  assert.ok(renderArticle(article, snapshot).includes('&lt;script&gt;alert(1)&lt;/script&gt;'));
});

test('homepage presents the catalog without a public research queue', () => {
  const article = researchArticle();
  const local = { ...snapshot, polymers: [article] };
  const html = renderHome(local);
  assert.doesNotMatch(html, /id="research-queue"|data-research-question|Research queue/);
  assert.match(html, /data-catalog-expand/);
  assert.match(html, /WOPD/);
  assert.doesNotMatch(html, /Completeness before perfection/);
});

test('a reopened question retains dated prior outcomes without claiming it remains resolved', () => {
  const article = researchArticle();
  const question = article.research.questions[0];
  question.previousResolutions = [{ date: '2026-09-24', status: 'no_eligible_evidence', summary: 'Earlier bounded search found no qualifying source.', sourceIds: [], evidenceIds: [] }, { ...question.resolution, status: question.status }];
  question.status = 'open';
  delete question.resolution;
  const html = renderArticle(article, snapshot);
  const renderedQuestion = html.slice(html.indexOf('id="question-test-question"'), html.indexOf('<h3>Broad review needs'));
  assert.match(renderedQuestion, /<span>Open<\/span>/);
  assert.match(renderedQuestion, /Prior recorded outcomes/);
  assert.match(renderedQuestion, /Prior outcome · Resolved · 2026-09-25/);
  assert.match(renderedQuestion, /Prior outcome · No eligible evidence found · 2026-09-24/);
  assert.match(renderedQuestion, /Earlier bounded search found no qualifying source/);
  assert.match(renderedQuestion, /href="#evidence-test-measurement"/);
  assert.doesNotMatch(renderedQuestion, /<strong>Recorded outcome/);
});

test('article retains review history without a reader-facing research submission form', () => {
  const article = researchArticle();
  const html = renderArticle(article, snapshot);
  assert.match(html, /Evidence and review history/);
  assert.match(html, /id="question-test-question"/);
  assert.doesNotMatch(html, /data-research-request|href="#research-request"|assets\/research\.js/);
});

test('catalog search restores shareable URL state and preserves unrelated parameters', async () => {
  const listeners = {};
  const windowListeners = {};
  const input = { value: '' }, classFilter = { value: '' }, behaviorFilter = { value: '' };
  const count = {}, empty = {};
  const cards = [{ dataset: { search: 'polymer alpha', wopId: 'wop-000001', primaryClass: 'thermoset', behaviors: 'thermoset' } }, { dataset: { search: 'polymer beta', wopId: 'wop-000002', primaryClass: 'elastomer', behaviors: 'elastomer' } }];
  const controls = { querySelector: (selector) => ({ '[data-search-input]': input, '[data-class-filter]': classFilter, '[data-behavior-filter]': behaviorFilter })[selector], addEventListener: (type, callback) => { listeners[type] = callback; } };
  const location = { href: 'https://example.org/?q=alpha&class=thermoset&research-priority=high' };
  const context = { URL, Set, document: { querySelector: (selector) => ({ '[data-catalog-controls]': controls, '[data-result-count]': count, '[data-empty-state]': empty, '#catalog-index': { textContent: '{}' } })[selector], querySelectorAll: () => cards }, location, history: { state: null, replaceState: (_, __, url) => { location.href = String(url); } }, addEventListener: (type, callback) => { windowListeners[type] = callback; }, requestAnimationFrame: (callback) => callback() };
  vm.runInNewContext(await fs.readFile(new URL('../site-assets/search.js', import.meta.url), 'utf8'), context);
  assert.equal(input.value, 'alpha');
  assert.equal(count.textContent, '1');
  assert.equal(cards[1].hidden, true);
  input.value = 'beta'; classFilter.value = '';
  listeners.input();
  assert.equal(new URL(location.href).searchParams.get('q'), 'beta');
  assert.equal(new URL(location.href).searchParams.get('research-priority'), 'high');
  location.href = 'https://example.org/?q=alpha&class=thermoset';
  windowListeners.popstate();
  assert.equal(input.value, 'alpha');
  assert.equal(classFilter.value, 'thermoset');
  assert.equal(cards[0].hidden, false);
  assert.equal(cards[1].hidden, true);
});

test('catalog limits initial results and expands matching entries without losing filters', async () => {
  const fields = { '[data-search-input]': { value: '' }, '[data-class-filter]': { value: '' }, '[data-behavior-filter]': { value: '' } };
  const listeners = {}, mediaListeners = {}, count = {}, displayed = {}, empty = {};
  const cards = Array.from({ length: 8 }, (_, index) => ({ dataset: { search: `polymer ${index}`, wopId: `wop-${index}`, primaryClass: 'thermoset', behaviors: 'thermoset' } }));
  const expand = { hidden: true, attrs: {}, setAttribute(name, value) { this.attrs[name] = value; }, addEventListener(type, fn) { listeners[type] = fn; } };
  const controls = { querySelector: (key) => fields[key], addEventListener() {} };
  const media = { matches: false, addEventListener(type, fn) { mediaListeners[type] = fn; } };
  const location = { href: 'https://example.org/' };
  const doc = { querySelector: (key) => ({ '[data-catalog-controls]': controls, '[data-result-count]': count, '[data-displayed-count]': displayed, '[data-catalog-expand]': expand, '[data-empty-state]': empty, '#catalog-index': { textContent: '{}' } })[key], querySelectorAll: () => cards };
  const context = { URL, Set, document: doc, location, history: { state: null, replaceState() {} }, addEventListener() {}, matchMedia: () => media, requestAnimationFrame: (fn) => fn() };
  vm.runInNewContext(await fs.readFile(new URL('../site-assets/search.js', import.meta.url), 'utf8'), context);
  assert.equal(count.textContent, '8');
  assert.equal(cards.filter((card) => !card.hidden).length, 6);
  assert.equal(expand.attrs['aria-expanded'], 'false');
  listeners.click();
  assert.equal(cards.filter((card) => !card.hidden).length, 8);
  assert.equal(expand.attrs['aria-expanded'], 'true');
  listeners.click();
  media.matches = true;
  mediaListeners.change();
  assert.equal(cards.filter((card) => !card.hidden).length, 3);
  fields['[data-search-input]'].value = '7';
  mediaListeners.change();
  assert.equal(count.textContent, '1');
  assert.equal(cards[7].hidden, false);
  assert.equal(expand.hidden, true);
});

test('collapsed search puts a direct family match ahead of alphabetically earlier derivatives', async () => {
  const fields = { '[data-search-input]': { value: '' }, '[data-class-filter]': { value: '' }, '[data-behavior-filter]': { value: '' } };
  const names = ['Chlorinated polyethylene', 'Cross-linked polyethylene', 'High-density polyethylene', 'Linear low-density polyethylene', 'Low-density polyethylene', 'Medium-density polyethylene', 'Polyethylene family'];
  const cards = names.map((name, index) => ({ dataset: { search: name, wopId: `wop-${index}`, primaryClass: 'commodity', behaviors: 'thermoplastic' }, querySelector: () => ({ textContent: name }) }));
  const ordered = [];
  const grid = { appendChild(card) { const index = ordered.indexOf(card); if (index >= 0) ordered.splice(index, 1); ordered.push(card); } };
  const count = {}, empty = {}, listeners = {};
  const expand = { setAttribute() {}, addEventListener() {} };
  const controls = { querySelector: (key) => fields[key], addEventListener: (type, fn) => { listeners[type] = fn; } };
  const location = { href: 'https://example.org/?q=polyethylene' };
  const document = { querySelector: (key) => ({ '[data-catalog-controls]': controls, '[data-polymer-grid]': grid, '[data-result-count]': count, '[data-catalog-expand]': expand, '[data-empty-state]': empty, '#catalog-index': { textContent: '{}' } })[key], querySelectorAll: () => cards };
  const context = { URL, Set, document, location, history: { state: null, replaceState(_, __, value) { location.href = String(value); } }, addEventListener() {}, requestAnimationFrame: (fn) => fn() };
  vm.runInNewContext(await fs.readFile(new URL('../site-assets/search.js', import.meta.url), 'utf8'), context);
  assert.equal(ordered[0], cards[6]);
  assert.equal(cards[6].hidden, false);
  fields['[data-search-input]'].value = '';
  listeners.input();
  assert.deepEqual(ordered, cards);
});

test('request download trims content, rejects blanks, and creates the CLI handoff contract', async () => {
  const listeners = {};
  const elements = Object.fromEntries(['section', 'question', 'scope', 'acceptanceCriteria'].map((name) => [name, { value: ` ${name} `, setCustomValidity(message) { this.validationMessage = message; } }]));
  elements.section.value = 'mechanicalProperties';
  const status = {};
  const form = { hidden: true, dataset: { wopId: 'wop-000001' }, elements, querySelector: () => status, addEventListener: (type, callback) => { listeners[type] = callback; }, reportValidity: () => Object.values(elements).every((field) => !field.validationMessage) };
  let downloaded = null;
  let clicked = 0;
  const link = { click: () => { clicked += 1; }, remove() {} };
  const context = { Blob, URL: { createObjectURL: (blob) => { downloaded = blob; return 'blob:request'; }, revokeObjectURL() {} }, document: { querySelector: (selector) => selector === '[data-research-request]' ? form : null, addEventListener() {}, createElement: () => link, body: { append() {} } }, setTimeout: (callback) => callback() };
  vm.runInNewContext(await fs.readFile(new URL('../site-assets/research.js', import.meta.url), 'utf8'), context);
  assert.equal(form.hidden, false);
  elements.question.value = '   ';
  listeners.submit({ preventDefault() {} });
  assert.equal(clicked, 0);
  elements.question.value = ' Qualified question ';
  listeners.submit({ preventDefault() {} });
  assert.equal(clicked, 1);
  assert.deepEqual(JSON.parse(await downloaded.text()), { schema: 'wop-research-request-v1', wopId: 'wop-000001', section: 'mechanicalProperties', question: 'Qualified question', scope: 'scope', acceptanceCriteria: 'acceptanceCriteria' });
  assert.match(status.textContent, /Nothing was sent/);
});

test('question and evidence deep links reveal their panel, disclosure and keyboard focus after Back', async () => {
  const windowListeners = {}, documentListeners = {};
  const document = { activeElement: null, readyState: 'complete', addEventListener: (type, callback) => { documentListeners[type] = callback; } };
  const node = (id) => ({ id, attributes: {}, hidden: false, classList: { contains: () => false }, getBoundingClientRect: () => ({ left: 0, right: 100 }), setAttribute(name, value) { this.attributes[name] = value; }, hasAttribute(name) { return Object.hasOwn(this.attributes, name); }, removeAttribute(name) { delete this.attributes[name]; }, getAttribute(name) { return this.attributes[name]; }, addEventListener() {}, focus() { document.activeElement = this; }, scrollIntoView() { this.scrolled = true; }, matches(selector) { return selector === 'details' && this.isDetails; }, closest(selector) { return selector === '[data-article-panel]' ? this.panel : selector === 'details' ? this.disclosure : null; } });
  const panels = ['overview', 'mechanicalProperties', 'references'].map(node);
  panels.forEach((panel) => { panel.panel = panel; });
  const tabs = panels.map((panel) => ({ ...node(`tab-${panel.id}`), hash: `#${panel.id}` }));
  const tablist = { ...node('tablist'), contains: () => false };
  const disclosure = { ...node('research-progress'), isDetails: true, open: false, panel: panels[0] };
  const question = { ...node('question-test-question'), disclosure, panel: panels[0] };
  const evidence = { ...node('evidence-test-measurement'), panel: panels[1] };
  const sourceDisclosure = { ...node('reference-support'), isDetails: true, open: false, panel: panels[2] };
  const source = { ...node('source-test-source'), disclosure: sourceDisclosure, panel: panels[2] };
  const root = { ...node('article-tabs'), querySelector: () => tablist, querySelectorAll: (selector) => selector === '[data-article-tab]' ? tabs : panels };
  const nodes = new Map([...panels, question, evidence, source, disclosure].map((item) => [item.id, item]));
  document.getElementById = (id) => nodes.get(id);
  document.querySelectorAll = (selector) => selector === '[data-article-tabs]' ? [root] : [];
  const location = { hash: '#question-test-question' };
  const history = { pushState: (_, __, hash) => { location.hash = hash; }, replaceState: (_, __, hash) => { location.hash = hash; } };
  vm.runInNewContext(await fs.readFile(new URL('../site-assets/article.js', import.meta.url), 'utf8'), { document, location, history, scrollY: 0, scrollX: 0, scrollTo() {}, requestAnimationFrame: (callback) => callback(), matchMedia: () => ({ matches: false, addEventListener() {} }), addEventListener: (type, callback) => { windowListeners[type] = callback; } });
  assert.equal(disclosure.open, true);
  assert.equal(panels[0].hidden, false);
  assert.equal(panels[1].hidden, true);
  assert.equal(document.activeElement, question);
  const follow = (target) => documentListeners.click({ target: { closest: () => ({ hash: `#${target.id}` }) }, button: 0, preventDefault() {} });
  follow(evidence);
  assert.equal(panels[0].hidden, true);
  assert.equal(panels[1].hidden, false);
  assert.equal(document.activeElement, evidence);
  follow(source);
  assert.equal(panels[2].hidden, false);
  assert.equal(sourceDisclosure.open, true);
  assert.equal(document.activeElement, source);
  disclosure.open = false;
  location.hash = '#question-test-question';
  windowListeners.popstate();
  assert.equal(panels[0].hidden, false);
  assert.equal(panels[2].hidden, true);
  assert.equal(disclosure.open, true);
  assert.equal(document.activeElement, question);
});

test('the publication callback runs after staging and failure preserves the prior site', async () => {
  const fixture = JSON.parse(await fs.readFile(new URL('../fixtures/wop-publication-snapshot-v2/snapshot.json', import.meta.url), 'utf8'));
  const root = await fs.mkdtemp(path.join(os.tmpdir(), 'wop-research-site-'));
  const output = path.join(root, 'site');
  try {
    let called = false;
    await buildSite(fixture, output, { allowExternal: true, beforePublish: async () => { called = true; } });
    assert.equal(called, true);
    const original = await fs.readFile(path.join(output, 'index.html'), 'utf8');
    assert.ok((await fs.readFile(path.join(output, 'assets/research.js'), 'utf8')).includes('wop-research-request-v1'));
    await assert.rejects(buildSite(fixture, output, { allowExternal: true, beforePublish: async () => {
      assert.equal(await fs.readFile(path.join(output, 'index.html'), 'utf8'), original);
      throw new Error('Reject research publication');
    } }), /Reject research publication/);
    assert.equal(await fs.readFile(path.join(output, 'index.html'), 'utf8'), original);
    assert.deepEqual(await fs.readdir(root), ['site']);
  } finally {
    await fs.rm(root, { recursive: true, force: true });
  }
});
