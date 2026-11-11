import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import test from 'node:test';
import { renderHome } from '../lib/site.mjs';

const snapshot = JSON.parse(await fs.readFile('public-data/wop-publication-snapshot-v2/snapshot.json', 'utf8'));
const html = renderHome(snapshot);
const escapeHtml = (text) => text.replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;').replaceAll('"', '&quot;').replaceAll("'", '&#39;');
const card = (id) => {
  const result = html.match(new RegExp(`<article class="polymer-card[^\"]*"[^>]*data-wop-id="${id}"[\\s\\S]*?<\\/article>`))?.[0];
  assert.ok(result, `Missing catalog card ${id}`);
  return result;
};

test('catalog retains every reviewed multi-item structure and its scientific scope', () => {
  for (const polymer of snapshot.polymers) {
    const depiction = polymer.structuralDepictions;
    if (depiction.items.length < 2 || depiction.representationType === 'no_unique_repeat') continue;
    const rendered = card(polymer.wopId);
    assert.ok(rendered.includes(escapeHtml(depiction.scopeNote)), `${polymer.wopId}: missing scope`);
    for (const item of depiction.items) {
      assert.ok(rendered.includes(`${encodeURIComponent(item.structureId)}.svg`), `${polymer.wopId}: missing ${item.structureId}`);
      assert.ok(rendered.includes(escapeHtml(item.label)), `${polymer.wopId}: missing label ${item.label}`);
      if (item.notation) assert.ok(rendered.includes(escapeHtml(item.notation)), `${polymer.wopId}: missing notation`);
    }
  }
});

test('catalog labels distinguish copolymer units, family alternatives and local modifications', () => {
  for (const id of ['wop-000138', 'wop-000142']) assert.match(card(id), /Illustrative local units/);
  assert.match(card('wop-000137'), /Representative structures/);
  for (const id of ['wop-000024', 'wop-000235']) assert.match(card(id), /Possible local motifs/);
  assert.match(card('wop-000033'), /Separate components/);
});

test('catalog exposes the definitions needed to interpret single Markush depictions', () => {
  const marked = snapshot.polymers.filter((polymer) => polymer.structuralDepictions.items.some((item) => item.notation));
  assert.ok(marked.some((polymer) => polymer.wopId === 'wop-000194'));
  for (const polymer of marked) {
    const rendered = card(polymer.wopId);
    for (const item of polymer.structuralDepictions.items.filter((value) => value.notation)) {
      assert.ok(rendered.includes(escapeHtml(item.notation)), `${polymer.wopId}: missing ${item.label} notation`);
    }
  }
});

test('catalog qualifies representative single structures that omit parts of a material', () => {
  for (const id of ['wop-000117', 'wop-000261']) {
    const depiction = snapshot.polymers.find((polymer) => polymer.wopId === id).structuralDepictions;
    const rendered = card(id);
    assert.ok(rendered.includes(escapeHtml(depiction.scopeNote)), `${id}: missing scope`);
    assert.ok(rendered.includes(escapeHtml(depiction.items[0].label)), `${id}: missing label`);
  }
  for (const polymer of snapshot.polymers) {
    const depiction = polymer.structuralDepictions;
    const item = depiction.items[0];
    if (!item || item.fidelity === 'exact' || depiction.representationType === 'no_unique_repeat') continue;
    assert.ok(card(polymer.wopId).includes(escapeHtml(depiction.scopeNote)), `${polymer.wopId}: missing scope`);
  }
});

test('catalog uses full width for a single structure and two columns for sets', async () => {
  assert.match(card('wop-000261'), /polymer-card__components--single/);
  assert.doesNotMatch(card('wop-000033'), /polymer-card__components--single/);
  const css = await fs.readFile('site-assets/catalog-refresh.css', 'utf8');
  assert.match(css, /\.polymer-card__components\s*\{[^}]*grid-template-columns:\s*repeat\(2,\s*minmax\(0,\s*1fr\)\)/);
  assert.match(css, /\.polymer-card__components--single\s*\{[^}]*grid-template-columns:\s*minmax\(0,\s*1fr\)/);
  assert.match(css, /@media \(max-width: 360px\)\s*\{\s*\.polymer-card__components\s*\{\s*grid-template-columns:\s*minmax\(0,\s*1fr\)/);
});
