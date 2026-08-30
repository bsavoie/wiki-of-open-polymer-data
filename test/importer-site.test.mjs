import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import test from 'node:test';
import { importSnapshot, readAndValidateSnapshot } from '../lib/importer.mjs';
import { buildSite, renderArticle, renderHome } from '../lib/site.mjs';

const publicDirectory = path.resolve('public-data/wop-publication-snapshot-v1');
const fixtureDirectory = path.resolve('fixtures/wop-publication-snapshot-v1');
const snapshot = await readAndValidateSnapshot(publicDirectory);
const fixture = await readAndValidateSnapshot(fixtureDirectory);

const temporaryDirectory = () => fs.mkdtemp(path.join(os.tmpdir(), 'wop-test-'));

test('snapshot import validates before mutation and rolls back an invalid replacement', async () => {
  const root = await temporaryDirectory();
  const destination = path.join(root, 'wop-publication-snapshot-v1');
  await importSnapshot(fixtureDirectory, destination);
  const prior = await fs.readFile(path.join(destination, 'snapshot.json'), 'utf8');
  const invalidDirectory = path.join(root, 'invalid');
  await fs.mkdir(invalidDirectory);
  const invalid = structuredClone(fixture);
  invalid.polymers[0].canonicalSlug = 'Not a slug';
  await fs.writeFile(path.join(invalidDirectory, 'snapshot.json'), JSON.stringify(invalid));
  await assert.rejects(importSnapshot(invalidDirectory, destination), /Snapshot validation failed/);
  assert.equal(await fs.readFile(path.join(destination, 'snapshot.json'), 'utf8'), prior);
});

test('the static build emits canonical pages, unique aliases, local search, data, and no ambiguous routes', async () => {
  const root = await temporaryDirectory();
  const output = path.join(root, 'site');
  await buildSite(snapshot, output, { allowExternal: true, siteUrl: 'https://polymers.example.org/' });

  const home = await fs.readFile(path.join(output, 'index.html'), 'utf8');
  const polyethylene = await fs.readFile(path.join(output, 'polymers', 'polyethylene-family', 'index.html'), 'utf8');
  const hdpe = await fs.readFile(path.join(output, 'polymers', 'high-density-polyethylene', 'index.html'), 'utf8');
  const pa6 = await fs.readFile(path.join(output, 'polymers', 'polyamide-6', 'index.html'), 'utf8');
  const alias = await fs.readFile(path.join(output, 'polymers', 'pe', 'index.html'), 'utf8');
  const redirects = await fs.readFile(path.join(output, '_redirects'), 'utf8');
  const sitemap = await fs.readFile(path.join(output, 'sitemap.xml'), 'utf8');
  const search = await fs.readFile(path.join(output, 'assets', 'search.js'), 'utf8');
  const articleScript = await fs.readFile(path.join(output, 'assets', 'article.js'), 'utf8');
  const style = await fs.readFile(path.join(output, 'assets', 'site.css'), 'utf8');
  const publishedData = JSON.parse(await fs.readFile(path.join(output, 'data', 'wop-publication-snapshot-v1', 'snapshot.json'), 'utf8'));
  const marker = JSON.parse(await fs.readFile(path.join(output, '.wop-build.json'), 'utf8'));

  assert.match(home, /Polymer knowledge, built in the open/);
  assert.match(home, /data-catalog-controls/);
  assert.match(home, new RegExp(`${snapshot.polymers.length}<\\/strong> canonical entries`));
  assert.match(polyethylene, /Open-source research needed/);
  assert.match(polyethylene, /Record boundary/);
  assert.match(polyethylene, /<nav class="core-attribute-tabs" aria-label="Core polymer attributes" data-core-tablist>/);
  assert.doesNotMatch(polyethylene, /role="tablist"/);
  assert.doesNotMatch(polyethylene, /role="tabpanel"/);
  assert.match(polyethylene, /Mechanical properties/);
  assert.match(polyethylene, /data-core-panel/);
  assert.equal((polyethylene.match(/id="feedstocksAndSynthesis"/g) || []).length, 1);
  assert.equal((polyethylene.match(/id="mechanicalProperties"/g) || []).length, 1);
  assert.ok(polyethylene.indexOf('id="overview"') < polyethylene.indexOf('id="nomenclature"'));
  assert.ok(polyethylene.indexOf('id="nomenclature"') < polyethylene.indexOf('id="core-attributes"'));
  assert.ok(polyethylene.indexOf('id="core-attributes"') < polyethylene.indexOf('id="structureAndMorphology"'));
  assert.match(polyethylene, /assets\/article\.js/);
  assert.match(polyethylene, /No article sources yet/);
  for (const [page, id] of [[hdpe, 'wop-000005'], [pa6, 'wop-000053']]) {
    assert.match(page, new RegExp(id, 'i'));
    assert.match(page, /Source Backed Draft/);
    assert.equal((page.match(/data-core-panel/g) || []).length, 3);
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
  assert.match(articleScript, /pushState/);
  assert.match(articleScript, /tabForHash\(\) \|\| defaultTab/);
  assert.match(style, /--blue-dark/);
  assert.equal(publishedData.polymers.length, snapshot.polymers.length);
  assert.deepEqual(marker, {
    schema: 'wop-static-build-v1',
    generator: 'wiki-of-open-polymer-data',
    polymerCount: snapshot.polymers.length
  });
  await assert.rejects(fs.access(path.join(output, 'polymers', 'pei')));

  await buildSite(fixture, output, { allowExternal: true });
  const replacedMarker = JSON.parse(await fs.readFile(path.join(output, '.wop-build.json'), 'utf8'));
  assert.equal(replacedMarker.polymerCount, 1);
  const leftovers = (await fs.readdir(root)).filter((name) => name.startsWith('.site-build-'));
  assert.deepEqual(leftovers, []);
});

test('renderers escape imported prose, names, and embedded search JSON', () => {
  const copy = structuredClone(fixture);
  copy.polymers[0].canonicalName = '<img src=x onerror=alert(1)>';
  copy.polymers[0].alternateNames = ['</script><script>alert(2)</script>'];
  copy.searchTerms = [{ term: '</script><script>alert(3)</script>', kind: 'umbrella', wopIds: [copy.polymers[0].wopId] }];
  const article = renderArticle(copy.polymers[0], copy);
  const home = renderHome(copy);
  assert.doesNotMatch(article, /<img src=x/);
  assert.match(article, /&lt;img src=x onerror=alert\(1\)&gt;/);
  assert.doesNotMatch(home, /<script>alert\(2\)<\/script>/);
  assert.match(home, /\\u003c\/script>/);
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

test('the importer refuses unowned destinations and stable-route reassignment', async () => {
  const root = await temporaryDirectory();
  const unowned = path.join(root, 'unowned', 'wop-publication-snapshot-v1');
  await fs.mkdir(unowned, { recursive: true });
  await fs.writeFile(path.join(unowned, 'keep.txt'), 'user data');
  await assert.rejects(importSnapshot(fixtureDirectory, unowned), /not marked/);
  assert.equal(await fs.readFile(path.join(unowned, 'keep.txt'), 'utf8'), 'user data');

  await assert.rejects(importSnapshot(fixtureDirectory, root), /directory named/);

  const destination = path.join(root, 'owned', 'wop-publication-snapshot-v1');
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
});
