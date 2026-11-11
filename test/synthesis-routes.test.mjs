import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import { validateSnapshot } from '../lib/schema.mjs';
import { validateSynthesisRoutes } from '../lib/synthesis-routes.mjs';
import { renderArticle } from '../lib/site.mjs';
const snapshot = JSON.parse(await fs.readFile('public-data/wop-publication-snapshot-v2/snapshot.json', 'utf8'));
const pilot = () => structuredClone(snapshot.polymers.find(p => p.wopId === 'wop-000033'));

test('route evidence and chemical references fail closed', () => {
  for (const change of [
    p => p.synthesisRoutes[0].sourceIds = ['missing-evidence'],
    p => p.synthesisRoutes[0].sourceIds = {},
    p => p.synthesisRoutes[0].steps[0].sourceIds = ['abs-reagent-connectivity-pubchem'],
    p => p.synthesisRoutes[0].inputs[0].structureId = 'not-an-article-structure',
    p => p.synthesisRoutes[0].reagents[0].role = 'magic',
    p => p.synthesisRoutes.push(structuredClone(p.synthesisRoutes[0])),
    p => p.synthesisRoutes[0].steps = [],
    p => p.synthesisRoutes[0].basis = 'universal_recipe'
  ]) {
    const p = pilot(); change(p); const errors = [];
    validateSynthesisRoutes(p, p.wopId, errors);
    assert.ok(errors.length, 'Invalid route must be rejected');
  }
});

test('routes cannot bypass publication privacy or source boundaries', () => {
  const s = structuredClone(snapshot);
  s.polymers.find(p => p.wopId === 'wop-000033').synthesisRoutes[0].steps[0].body = 'Read /Users/example/private/recipe.txt';
  assert.throws(() => validateSnapshot(s), /private|path|legacy/i);
});

test('route definitions reference existing depiction metadata and stable identities', () => {
  assert.doesNotThrow(() => validateSnapshot(snapshot));
  for(const p of snapshot.polymers.filter(p => p.synthesisRoutes)) {
    const errors = []; validateSynthesisRoutes(p, p.wopId, errors);
    assert.deepEqual(errors, []);
  }
});

test('every illustrated route renders in a synthesis tab with working evidence targets', () => {
  for (const article of snapshot.polymers.filter(p => p.synthesisRoutes)) {
    const html = renderArticle(article, snapshot);
    assert.match(html, /data-article-profile/);
    const synthesis = html.slice(html.indexOf('id="feedstocksAndSynthesis"'), html.indexOf('id="mechanicalProperties"'));
    for (const route of article.synthesisRoutes) {
      assert.ok(synthesis.includes(`id="synthesis-route-${route.routeId}"`));
      for (const id of route.sourceIds) assert.ok(html.includes(`id="source-${id}"`));
    }
    assert.equal((html.match(/id="feedstocksAndSynthesis"/g) || []).length, 1);
  }
});

test('corpus routes cover every article without equating reference motifs to coproducts', () => {
  for (const article of snapshot.polymers) {
    assert.ok(article.synthesisRoutes?.length, `${article.wopId}: missing preparation outline`);
    for (const route of article.synthesisRoutes.filter(r => r.productMode === 'structural_reference')) {
      const html = renderArticle(article, snapshot);
      const start = html.indexOf(`id="synthesis-route-${route.routeId}"`);
      const productSide = html.slice(html.indexOf('Product / structural reference', start), html.indexOf('class="reaction-mechanism"', start));
      assert.ok(productSide.includes(route.productNote.replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;').replaceAll('"','&quot;')));
      assert.doesNotMatch(productSide, /class="reaction-plus"/);
    }
  }
});

test('structural-reference routes require a visible, valid boundary', () => {
  for (const change of [r => {r.productMode='structural_reference';delete r.productNote;}, r => r.productMode='inferred_network']) {
    const article = pilot();change(article.synthesisRoutes[0]);const errors=[];
    validateSynthesisRoutes(article,article.wopId,errors);assert.ok(errors.length);
  }
});

test('synthesis presents material-specific limitations without editorial boilerplate', () => {
  const article = pilot();
  article.synthesisRoutes[0].limitations = 'Only the specified grade and conditions apply.';
  const html = renderArticle(article, snapshot);
  assert.match(html, /Only the specified grade and conditions apply\./);
  assert.doesNotMatch(html, /Scope and limits\./);
  const generic = snapshot.polymers.find(p => p.synthesisRoutes?.some(r => r.limitations.startsWith('This outline does not specify a universal recipe')));
  assert.doesNotMatch(renderArticle(generic, snapshot), /This outline does not specify a universal recipe/);
});
