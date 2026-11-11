import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import test from 'node:test';
import vm from 'node:vm';
import { renderArticle } from '../lib/site.mjs';

const snapshot = JSON.parse(await fs.readFile(new URL('../public-data/wop-publication-snapshot-v2/snapshot.json', import.meta.url), 'utf8'));
const tpu = snapshot.polymers.find((entry) => entry.wopId === 'wop-000173');
const id = 'tpu-ptmeg-mdi-extended-connected-architecture';
const render = (metadata) => renderArticle(tpu, snapshot, { structureDimensions: new Map([[id, metadata]]) });

test('complex figure treatment uses atom count and shape without changing simple figures', () => {
  const simple = render({width: 300, height: 200, atomCount: 29});
  assert.doesNotMatch(simple, /structure-card__image--complex/);
  const wideRepeat = render({width: 478, height: 248, atomCount: 24});
  assert.equal((wideRepeat.match(/data-structure-scroll/g) || []).length, 2, 'wide repeats remain readable even below the complex-atom threshold');
  assert.equal((wideRepeat.match(/--complex-min-width:478px/g) || []).length, 2);
  const compact = render({width: 500, height: 480, atomCount: 47});
  assert.match(compact, /structure-card__image--complex/);
  assert.equal((compact.match(/data-structure-scroll/g) || []).length, 2, 'large near-square figures retain authored scale');
  const dense = render({width: 800, height: 300, atomCount: 58});
  assert.equal((dense.match(/data-structure-scroll/g) || []).length, 2, 'hero and route are independently scrollable');
  assert.equal((dense.match(/class="complex-scroll-hint"/g) || []).length, 2);
  assert.equal((dense.match(/--complex-min-width:720px/g) || []).length, 2);
  assert.match(dense, /tabindex="0" aria-label="Chemical structure; scroll horizontally to see the full structure" data-structure-scroll/, 'static HTML retains keyboard access without JavaScript');
  assert.doesNotMatch(dense, /class="reaction-scroll-hint"/, 'route does not duplicate the complex-figure hint');
  const wide = render({width: 960, height: 200, atomCount: 58});
  assert.equal((wide.match(/class="complex-scroll-hint"/g) || []).length, 2);
  assert.doesNotMatch(wide, /class="reaction-scroll-hint"/);
  const bounded = render({width: 800, height: 300, atomCount: 9999});
  assert.match(bounded, /--complex-min-width:720px/);
});

test('wide contextual examples remain keyboard-scrollable in overview cards', () => {
  const entry = snapshot.polymers.find((item) => item.wopId === 'wop-000098');
  const id = 'dgeba-diepoxide-precursor';
  const html = renderArticle(entry, snapshot, { structureDimensions: new Map([[id, { width: 600, height: 250, atomCount: 25 }]]) });
  const start = html.indexOf('contextual-structure-preview__cards');
  const end = html.indexOf('</aside>', start);
  assert.ok(start >= 0 && end > start, 'overview contains a contextual-structure preview');
  const preview = html.slice(start, end);
  assert.match(preview, /structure-card__image--complex-scroll[^>]*tabindex="0"[^>]*data-structure-scroll/);
  assert.match(preview, /Scroll the structure horizontally/);
});

test('moderately wide figures retain readable scale without clipping route content', async () => {
  const moderate = render({ width: 405, height: 238, atomCount: 16 });
  assert.equal((moderate.match(/data-structure-scroll/g) || []).length, 2, 'moderately wide hero and route figures get accessible scroll regions');
  assert.equal((moderate.match(/--complex-min-width:405px/g) || []).length, 2);
  const smallWide = render({ width: 359, height: 188, atomCount: 16 });
  assert.equal((smallWide.match(/data-structure-scroll/g) || []).length, 2, 'small wide figures retain a readable minimum scale');
  const moderatelyWide = render({ width: 367, height: 240, atomCount: 16 });
  assert.equal((moderatelyWide.match(/data-structure-scroll/g) || []).length, 2, 'moderate-width structures preserve readable labels');
  assert.doesNotMatch(render({ width: 350, height: 235, atomCount: 16 }), /structure-card__image--complex-scroll/, 'aspect below 1.5 does not trigger the 350px branch');
  const belowWidth = render({ width: 349, height: 200, atomCount: 16 });
  assert.doesNotMatch(belowWidth, /structure-card__image--complex-scroll/);
  const belowAspect = render({ width: 405, height: 312, atomCount: 16 });
  assert.doesNotMatch(belowAspect, /structure-card__image--complex-scroll/);
  const css = await fs.readFile(new URL('../site-assets/article-refresh.css', import.meta.url), 'utf8');
  assert.match(css, /\.reaction-scheme \.structure-card__image--complex-scroll\s*\{[^}]*height:\s*auto/s, 'route scroll region grows with the image');
});

test('tall authored figures retain their scale in hero and route views', async () => {
  const tall = render({ width: 190, height: 320, atomCount: 15 });
  assert.equal((tall.match(/structure-card__image--tall/g) || []).length, 2);
  assert.equal((render({ width: 317, height: 392, atomCount: 24 }).match(/structure-card__image--tall/g) || []).length, 2, 'near-square but tall figures retain legible labels');
  const square = render({ width: 420, height: 390, atomCount: 24 });
  assert.equal((square.match(/structure-card__image--tall/g) || []).length, 2, 'large near-square figures are not height-capped');
  assert.equal((square.match(/--complex-min-width:420px/g) || []).length, 2, 'both near-square figure uses preserve their readable width');
  assert.doesNotMatch(render({ width: 300, height: 200, atomCount: 15 }), /structure-card__image--tall/);
  const css = await fs.readFile(new URL('../site-assets/article-refresh.css', import.meta.url), 'utf8');
  assert.match(css, /structure-card__image--tall img[^}]*max-height:\s*none/s);
});

test('progressive scroll focus follows overflow, hidden panels and resize without requiring ResizeObserver', async () => {
  const source = await fs.readFile(new URL('../site-assets/article.js', import.meta.url), 'utf8');
  for (const hasObserver of [false, true]) {
    const listeners = new Map(), observed = []; let onResize;
    const region = { clientWidth: 0, scrollWidth: 0, tabIndex: 0, classes: new Map(), classList: { toggle(key, value) { region.classes.set(key, value); } } };
    const document = {
      querySelectorAll: (selector) => selector === '[data-structure-scroll]' ? [region] : [],
      addEventListener: (type, fn) => listeners.set(`document:${type}`, fn)
    };
    class Observer { constructor(fn) { onResize = fn; } observe(target) { observed.push(target); } }
    const context = { document, addEventListener: (type, fn) => listeners.set(`window:${type}`, fn), requestAnimationFrame: (fn) => fn(), matchMedia: () => ({ matches: false }), ...(hasObserver ? { ResizeObserver: Observer } : {}) };
    vm.runInNewContext(source, context);
    assert.equal(region.tabIndex, -1, 'hidden panel is not a tab stop');
    region.clientWidth = 329; region.scrollWidth = 704;
    listeners.get('document:click')();
    assert.equal(region.tabIndex, 0, 'revealed overflow is keyboard accessible');
    assert.equal(region.classes.get('is-not-overflowing'), false);
    region.clientWidth = 560; region.scrollWidth = 560;
    listeners.get('window:resize')();
    assert.equal(region.tabIndex, -1, 'fitting figure is removed from tab order');
    assert.equal(region.classes.get('is-not-overflowing'), true);
    region.clientWidth = 329; region.scrollWidth = 704;
    if (hasObserver) { assert.deepEqual(observed, [region]); onResize([{target: region}]); }
    else listeners.get('window:resize')();
    assert.equal(region.tabIndex, 0, 'overflow restores keyboard access');
  }
});

const entry = snapshot.polymers.find(p => p.wopId === 'wop-000102');
const tgddm = 'tetraglycidyl-methylenedianiline-precursor';
const ech = 'epichlorohydrin-feedstock';

test('expanded synthesis context provides keyboard-scrollable figures only where needed', () => {
  const html = renderArticle(entry, snapshot, { structureDimensions: new Map([
    [tgddm, {width: 424, height: 316, atomCount: 25}],
    [ech, {width: 200, height: 150, atomCount: 5}]
  ]) });
  const start = html.indexOf('<aside class="section-structures"');
  const end = html.indexOf('</aside>', start);
  assert.ok(start >= 0 && end > start);
  const context = html.slice(start, end);
  assert.equal((context.match(/data-structure-scroll/g) || []).length, 1);
  assert.match(context, /structure-card__image--complex-scroll[^>]*--complex-min-width:424px[^>]*tabindex="0"[^>]*data-structure-scroll/);
  assert.match(context, /Scroll the structure horizontally/);
  assert.match(context, /epichlorohydrin-feedstock\.svg/);
  const below = renderArticle(entry, snapshot, { structureDimensions: new Map([[tgddm, {width: 400, height: 309, atomCount: 25}], [ech, {width: 200, height: 150, atomCount: 5}]]) });
  const section = below.slice(below.indexOf('<aside class=\"section-structures\"'), below.indexOf('</aside>', below.indexOf('<aside class=\"section-structures\"')));
  assert.doesNotMatch(section, /data-structure-scroll/, 'aspect below 1.3 remains unmodified');
});

test('full context scrolling has intrinsic height, readable image, and overflow indication', async () => {
  const css = await fs.readFile(new URL('../site-assets/article-refresh.css', import.meta.url), 'utf8');
  assert.match(css, /\.section-structures \.structure-card__image--complex-scroll[\s\S]*?\{[^}]*overflow-x:\s*auto/);
  assert.match(css, /\.section-structures \.structure-card__image--complex-scroll[\s\S]*?\{[^}]*height:\s*auto/);
  assert.match(css, /\.section-structures \.structure-card__image--complex-scroll img[\s\S]*?\{[^}]*min-width:\s*var\(--complex-min-width\)/);
  assert.match(css, /\.section-structures \.complex-scroll-hint[\s\S]*?\{[^}]*display:\s*block/);
});

test('synthesis reagent illustrations preserve readable scale and keyboard scrolling', async () => {
  const polymer = snapshot.polymers.find(item => item.wopId === 'wop-000133');
  const id = 'monoethyl-four-phenylethynylphthalate-endcapper';
  const html = renderArticle(polymer, snapshot, { structureDimensions: new Map([[id, { width: 478, height: 322, atomCount: 21 }]]) });
  const start = html.indexOf('<dl class="reaction-reagents">');
  const end = html.indexOf('</dl>', start);
  assert.ok(start >= 0 && end > start);
  const reagent = html.slice(start, end);
  assert.match(reagent, /structure-card__image--complex-scroll[^>]*--complex-min-width:478px[^>]*tabindex="0"[^>]*data-structure-scroll/);
  const css = await fs.readFile(new URL('../site-assets/article-refresh.css', import.meta.url), 'utf8');
  assert.match(css, /\.reaction-reagents \.structure-card__image--complex-scroll[\s\S]*?\{[^}]*overflow-x:\s*auto/);
  assert.match(css, /\.reaction-reagents \.structure-card__image--complex-scroll img[\s\S]*?\{[^}]*max-height:\s*none/);
  assert.match(css, /\.reaction-reagents \.complex-scroll-hint[\s\S]*?\{[^}]*display:\s*block/);
});

test('gallery navigation preserves arrow keys for nested scroll regions', async () => {
  const script = await fs.readFile(new URL('../site-assets/article.js', import.meta.url), 'utf8');
  const handlers = {};
  const cards = [0, 340].map(left => ({
    classList: { contains: name => name === 'structure-card' },
    getBoundingClientRect: () => ({ left }), offsetWidth: 320
  }));
  const track = {
    children: cards, clientWidth: 320, scrollWidth: 660, scrollLeft: 0,
    getBoundingClientRect: () => ({ left: 0 }),
    addEventListener: (type, fn) => { handlers[type] = fn; },
    setAttribute() {}, scrollTo(value) { this.scrollLeft = value.left; }
  };
  const elements = {
    '[data-structure-gallery-track]': track,
    '[data-structure-gallery-toolbar]': {},
    '[data-structure-gallery-current]': {},
    '[data-structure-gallery-controls]': {},
    '[data-structure-gallery-previous]': { addEventListener() {} },
    '[data-structure-gallery-next]': { addEventListener() {} }
  };
  const gallery = { querySelector: selector => elements[selector] };
  const document = { querySelectorAll: selector => selector === '[data-structure-gallery]' ? [gallery] : [] };
  vm.runInNewContext(script, { document, window: {}, matchMedia: () => ({ matches: true }), addEventListener() {}, requestAnimationFrame: fn => fn() });
  let prevented = false;
  handlers.keydown({ target: {}, key: 'ArrowRight', preventDefault() { prevented = true; } });
  assert.equal(prevented, false, 'nested region retains browser arrow-key scrolling');
  assert.equal(track.scrollLeft, 0, 'nested arrows do not move the gallery');
  handlers.keydown({ target: track, key: 'ArrowRight', preventDefault() { prevented = true; } });
  assert.equal(prevented, true, 'focused track consumes its navigation key');
  assert.equal(track.scrollLeft, 340, 'focused track moves to next card');
});
