import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import test from 'node:test';
import { validateSnapshot } from '../lib/schema.mjs';
import { renderArticle } from '../lib/site.mjs';
import { validateV3000Molfile } from '../lib/structure-renderer.mjs';

const snapshot = JSON.parse(await fs.readFile('public-data/wop-publication-snapshot-v2/snapshot.json', 'utf8'));
const sepsIndex = snapshot.polymers.findIndex(({ wopId }) => wopId === 'wop-000169');
assert.notEqual(sepsIndex, -1);
const createExample = () => {
  const copy = structuredClone(snapshot);
  const article = copy.polymers[sepsIndex];
  const sourceId = article.structuralDepictions.sourceIds[0];
  article.structuralDepictions.architecture = {
    kind: 'linear_blocks',
    blocks: ['Polystyrene', 'Hydrogenated polyisoprene', 'Polystyrene'],
    caption: 'One representative linear architecture; block lengths and middle-block sequence vary.',
    altText: 'A polystyrene block joined to a hydrogenated polyisoprene block and a second polystyrene block.',
    sourceIds: [sourceId]
  };
  return copy;
};

test('optional architecture requires a sourced block depiction and bounded, complete diagram', () => {
  const valid = createExample();
  assert.doesNotThrow(() => validateSnapshot(valid));
  const withoutArchitecture = structuredClone(snapshot);
  delete withoutArchitecture.polymers[sepsIndex].structuralDepictions.architecture;
  assert.doesNotThrow(() => validateSnapshot(withoutArchitecture), 'older records need no architecture field');
  const a = valid.polymers[sepsIndex].structuralDepictions;
  const reject = (edit, pattern) => {
    const copy = structuredClone(valid);
    edit(copy.polymers[sepsIndex].structuralDepictions, copy.polymers[sepsIndex]);
    assert.throws(() => validateSnapshot(copy), pattern);
  };
  reject(d => { d.architecture.kind = 'molecule'; }, /kind must be linear_blocks/);
  reject(d => { d.architecture.blocks = ['only one']; }, /blocks must contain 2–6/);
  reject(d => { d.architecture.blocks = Array(7).fill('block'); }, /blocks must contain 2–6/);
  reject(d => { d.architecture.blocks[1] = ' '; }, /blocks must contain 2–6/);
  reject(d => { d.architecture.altText = ''; }, /altText must be a non-empty string/);
  reject(d => { d.architecture.caption = ''; }, /caption must be a non-empty string/);
  reject(d => { d.architecture.sourceIds = []; }, /sourceIds must be an array/);
  reject(d => { d.architecture.sourceIds = ['not-a-source']; }, /unknown article source|must also be named/);
  reject(d => { d.architecture.sourceIds = [d.sourceIds[0], d.sourceIds[0]]; }, /must not contain duplicates/);
  reject(d => { d.representationType = 'constitutional_repeat_unit'; }, /requires a sourced block_or_graft_architecture/);
  reject(d => { d.architecture.connectionTable = 'pretend molfile'; }, /connectionTable is not permitted/);
  const unmatched = structuredClone(valid);
  const record = unmatched.polymers[sepsIndex];
  const another = record.sources.find(source => !a.sourceIds.includes(source.sourceId));
  assert.ok(another, 'test fixture needs another source');
  another.supports = [...new Set([...another.supports, 'structuralDepictions'])];
  record.structuralDepictions.architecture.sourceIds = [another.sourceId];
  assert.throws(() => validateSnapshot(unmatched), /must also be named in structuralDepictions.sourceIds/);
});

test('article displays sourced ordered blocks alongside, not as, a chemical structure', () => {
  const copy = createExample();
  const article = copy.polymers[sepsIndex];
  const html = renderArticle(article, copy);
  const start = html.indexOf('<figure class="block-architecture">');
  const end = html.indexOf('</figure>', start);
  assert.ok(start > html.indexOf('id="overview" data-article-panel') && end < html.indexOf('id="history" data-article-panel'), 'architecture is visible in the Overview tab');
  assert.match(html.slice(html.indexOf('id="structural-depictions"'), start), /<h3 id="structural-depictions-title">Structure<\/h3>/);
  const diagram = html.slice(start, end);
  assert.match(diagram, /role="img" aria-label="A polystyrene block joined to a hydrogenated polyisoprene block and a second polystyrene block\./);
  assert.match(diagram, /<ol class="block-architecture__blocks" aria-hidden="true">/);
  assert.deepEqual([...diagram.matchAll(/<li class="block-architecture__block">([^<]+)<\/li>/g)].map(x => x[1]), ['Polystyrene', 'Hydrogenated polyisoprene', 'Polystyrene']);
  assert.match(diagram, /Block widths do not represent their lengths or proportions/);
  assert.match(diagram, new RegExp(`href="#source-${article.structuralDepictions.architecture.sourceIds[0]}"`));
  assert.doesNotMatch(diagram, /\.mol|assets\/structures|<img/);
  assert.ok(html.indexOf('structure-card__image', end) > end, 'chemical items remain separate');
  assert.doesNotMatch(html, /Download V3000 molfile/, 'canonical chemical records remain in the repository rather than the reader view');
  // The diagram is rendered from escaped text, not markup authored in the snapshot.
  article.structuralDepictions.architecture.blocks[1] = '<script>alert(1)</script>';
  assert.match(renderArticle(article, copy), /&lt;script&gt;alert\(1\)&lt;\/script&gt;/);
  assert.doesNotMatch(renderArticle(article, copy), /<script>alert\(1\)<\/script>/);
});


test('SEPS separates the variable architecture from its bounded chemical examples', () => {
  const article = snapshot.polymers[sepsIndex];
  const depiction = article.structuralDepictions;
  assert.deepEqual(depiction.architecture.blocks, ['Polystyrene', 'Hydrogenated polyisoprene', 'Polystyrene']);
  assert.ok(depiction.architecture.sourceIds.every(id => depiction.sourceIds.includes(id)));
  const item = depiction.items.find(x => x.structureId === 'tpo-ethylene-propylene-elastomer-local-segment');
  assert.ok(item);
  const definition = snapshot.chemicalStructures.find(x => x.structureId === item.structureId);
  const molecule = validateV3000Molfile(definition.molfileV3000, { structureId: item.structureId });
  assert.equal(molecule.groups.length, 0, 'the short midblock example must not be a periodic repeat');
  assert.equal(molecule.pseudoatomIndices.size, 2);
  assert.match(item.caption, /not a fixed midblock repeat/);
  assert.ok(article.synthesisRoutes[0].products.every(product => !product.structureId), 'the example route must not assert the illustration is its precise product');
});

test('TPC separates a qualified hard–soft architecture from its chemical repeats', () => {
  const article = snapshot.polymers.find(({ wopId }) => wopId === 'wop-000174');
  const depiction = article.structuralDepictions;
  assert.deepEqual(depiction.architecture.blocks, ['PBT-derived hard segment', 'PTMEG-containing polyether–ester soft segment', 'PBT-derived hard segment']);
  assert.deepEqual(depiction.items.map(item => item.structureId), ['polybutylene-terephthalate-sru', 'polytetramethylene-ether-unit']);
  assert.match(depiction.items[1].caption, /aromatic ester units, junctions and segment length are not shown/);
  assert.ok(article.synthesisRoutes[0].products.every(product => !product.structureId));
});

test('elastane separates a qualified segment architecture from its local chemistry', () => {
  const article = snapshot.polymers.find(({ wopId }) => wopId === 'wop-000186');
  const depiction = article.structuralDepictions;
  assert.deepEqual(depiction.architecture.blocks, ['Urethane/urea-containing hard segment', 'PTMEG-derived soft segment', 'Urethane/urea-containing hard segment']);
  assert.deepEqual(depiction.items.map(item => item.structureId), ['polyurea-open-linkage', 'polytetramethylene-ether-unit']);
  assert.match(depiction.scopeNote, /not separate products or complete junctions/);
  assert.ok(article.synthesisRoutes[0].products.every(product => !product.structureId));
  assert.ok(!snapshot.chemicalStructures.some(item => item.structureId === 'elastane-mdi-urea-ptmeg-connected-architecture'));
});

test('SEBS and SEEPS depict variable midblocks as bounded open local examples', () => {
  const id = 'hydrogenated-butadiene-ethyl-open-segment';
  const definition = snapshot.chemicalStructures.find(x => x.structureId === id);
  const graph = validateV3000Molfile(definition.molfileV3000, { structureId: id });
  assert.equal(graph.groups.length, 0);
  assert.equal(graph.pseudoatomIndices.size, 2);
  for (const wopId of ['wop-000168', 'wop-000170']) {
    const e = snapshot.polymers.find(x => x.wopId === wopId);
    assert.equal(e.structuralDepictions.architecture.blocks.length, 3);
    assert.ok(e.structuralDepictions.items.some(x => x.structureId === id));
    assert.ok(e.synthesisRoutes[0].products.every(x => !x.structureId));
  }
  const seeps = snapshot.polymers.find(x => x.wopId === 'wop-000170');
  assert.ok(seeps.structuralDepictions.items.some(x => x.structureId === 'tpo-ethylene-propylene-elastomer-local-segment'));
});
