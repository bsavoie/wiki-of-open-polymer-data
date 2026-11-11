import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import test from 'node:test';
import vm from 'node:vm';
import { renderHome } from '../lib/site.mjs';

const snapshot = JSON.parse(await fs.readFile(new URL('../public-data/wop-publication-snapshot-v2/snapshot.json', import.meta.url), 'utf8'));

test('home sections remain available without JavaScript and tabs are enhanced progressively', () => {
  const html = renderHome(snapshot);
  assert.match(html, /data-home-tabs hidden/);
  assert.match(html, /href="#catalog" data-home-tab/);
  assert.match(html, /href="#methodology" data-home-tab/);
  assert.match(html, /<section class="catalog" id="catalog"(?![^>]*hidden)/);
  assert.match(html, /<section class="methodology" id="methodology"(?![^>]*hidden)/);
});

test('home tabs support links, keyboard navigation, history, and deep fragments', async () => {
  const node = (id) => ({ id, attrs: {}, listeners: {}, hidden: false,
    setAttribute(key, value) { this.attrs[key] = value; },
    addEventListener(key, fn) { this.listeners[key] = fn; },
    focus() { this.focused = true; }, scrollIntoView() { this.scrolled = true; } });
  const catalog = node('catalog'), methodology = node('methodology'), inner = node('method-story-title');
  catalog.contains = () => false;
  methodology.contains = (target) => target === inner;
  const tabs = [node('home-tab-catalog'), node('home-tab-methodology')];
  tabs[0].hash = '#catalog'; tabs[1].hash = '#methodology';
  const tablist = { ...node('home-tabs'), hidden: true, querySelectorAll: () => tabs };
  const nodes = { catalog, methodology, 'method-story-title': inner };
  const listeners = {};
  const location = { href: 'https://example.org/?q=nylon#method-story-title', get hash() { return new URL(this.href).hash; } };
  const context = { URL, location, document: { querySelector: () => tablist, getElementById: (id) => nodes[id] },
    history: { state: null, pushState(_, __, url) { location.href = String(url); } },
    addEventListener: (event, fn) => { listeners[event] = fn; }, requestAnimationFrame: (fn) => fn() };
  vm.runInNewContext(await fs.readFile(new URL('../site-assets/home-tabs.js', import.meta.url), 'utf8'), context);
  assert.equal(tablist.hidden, false);
  assert.equal(catalog.hidden, true);
  assert.equal(methodology.hidden, false);
  assert.equal(tabs[1].attrs['aria-selected'], 'true');
  assert.equal(inner.scrolled, true);
  let prevented = false;
  tabs[1].listeners.keydown({ key: 'ArrowRight', preventDefault() { prevented = true; } });
  assert.equal(prevented, true);
  assert.equal(tabs[0].focused, true);
  assert.equal(catalog.hidden, false);
  assert.equal(methodology.hidden, true);
  assert.equal(new URL(location.href).searchParams.get('q'), 'nylon');
  location.href = 'https://example.org/?q=nylon#methodology';
  listeners.hashchange();
  assert.equal(methodology.hidden, false);
  assert.equal(tablist.scrolled, true);
  location.href = 'https://example.org/?q=nylon';
  listeners.popstate();
  assert.equal(catalog.hidden, false);
  assert.equal(tabs[0].attrs['aria-selected'], 'true');
  tabs[1].listeners.click({ button: 0, preventDefault() {} });
  assert.equal(methodology.hidden, false);
  assert.equal(location.hash, '#methodology');
});
