import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createHash } from 'node:crypto';
import { validateSnapshot } from '../../lib/schema.mjs';
import { importSnapshot } from '../../lib/importer.mjs';

const here = path.dirname(fileURLToPath(import.meta.url));
const repository = path.resolve(here, '../..');
const destination = path.join(repository, 'public-data/wop-publication-snapshot-v2');
const publicationFile = path.join(destination, 'snapshot.json');
const original = await fs.readFile(publicationFile, 'utf8');
const snapshot = JSON.parse(original);
const batches = ['root', 'thermoplastics', 'networks', 'bio-specialty'];
const patches = (await Promise.all(batches.map(async batch =>
  JSON.parse(await fs.readFile(path.join(here, `${batch}.json`), 'utf8'))))).flat();
const baseValues = JSON.parse(await fs.readFile(path.join(here, 'base-values.json'), 'utf8'));
const hash = value => createHash('sha256').update(JSON.stringify(value)).digest('hex');
const articles = new Map(snapshot.polymers.map(p => [p.wopId, p]));
const written = new Set();
const sectionChanges = {};
const routeChanges = new Set();
const coverage = () => Object.fromEntries(Object.keys(snapshot.polymers[0].sections)
  .map(key => [key, snapshot.polymers.filter(p => p.sections[key].trim()).length]));
const before = coverage();
function assign(target, field, value, key) {
  if (written.has(key)) throw new Error(`Overlapping curation changes: ${key}`);
  written.add(key);
  if (hash(target[field]) !== baseValues[key] && hash(target[field]) !== hash(value)) {
    throw new Error(`Later work changed ${key}; reconcile this historical patch before replaying it.`);
  }
  target[field] = structuredClone(value);
}
const documentUrl = value => {
  const url = new URL(value);
  url.search = '';
  url.hash = '';
  return url.href;
};
for (const patch of patches) {
  const article = articles.get(patch.wopId);
  if (!article) throw new Error(`Unknown article ${patch.wopId}`);
  for (const [field, value] of Object.entries(patch.sections)) {
    if (!(field in article.sections) || typeof value !== 'string' || !value.trim()) {
      throw new Error(`Invalid or empty section patch ${patch.wopId}.${field}`);
    }
    assign(article.sections, field, value, `${patch.wopId}.sections.${field}`);
    sectionChanges[field] = (sectionChanges[field] || 0) + 1;
  }
  for (const update of patch.routeUpdates || []) {
    const route = article.synthesisRoutes?.find(r => r.routeId === update.routeId);
    if (!route) throw new Error(`Unknown route ${patch.wopId}.${update.routeId}`);
    for (const [field, value] of Object.entries(update)) {
      if (field === 'routeId') continue;
      if (!['mechanism', 'steps', 'sourceIds'].includes(field)) {
        throw new Error(`Unexpected route edit ${field}`);
      }
      assign(route, field, value, `${patch.wopId}.routes.${update.routeId}.${field}`);
    }
    routeChanges.add(`${patch.wopId}.${update.routeId}`);
  }
  const incomingIds = new Set(patch.sources.map(s => s.sourceId));
  if (incomingIds.size !== patch.sources.length || patch.sources.some(s => !s.sourceId.startsWith('comp-'))) {
    throw new Error(`Invalid completion source IDs for ${patch.wopId}`);
  }
  const previousSources = new Map(article.sources.filter(s => incomingIds.has(s.sourceId))
    .map(s => [s.sourceId, s]));
  article.sources = article.sources.filter(s => !incomingIds.has(s.sourceId));
  const lineages = new Map(article.sources.flatMap(s =>
    [s.url, s.contentUrl].filter(Boolean).map(url => [documentUrl(url), s.lineageId])));
  for (const source of structuredClone(patch.sources)) {
    const urls = [source.url, source.contentUrl].filter(Boolean).map(documentUrl);
    const existing = [...new Set(urls.map(url => lineages.get(url)).filter(Boolean))];
    if (existing.length > 1) throw new Error(`Conflicting document lineages for ${source.sourceId}`);
    source.lineageId = existing[0] || source.lineageId;
    const previous = previousSources.get(source.sourceId);
    if (previous && hash(previous) !== hash(source)) {
      throw new Error(`Later work changed source ${patch.wopId}.${source.sourceId}; reconcile before replaying.`);
    }
    for (const url of urls) lineages.set(url, source.lineageId);
    article.sources.push(source);
  }
}
validateSnapshot(snapshot);
const report = {
  entries: snapshot.polymers.length,
  articlesChanged: new Set(patches.filter(p => Object.keys(p.sections).length || p.routeUpdates?.length).map(p => p.wopId)).size,
  before,
  after: coverage(),
  sectionChanges,
  mechanismRoutesExpanded: routeChanges.size,
  newSourceAssociations: patches.reduce((n, p) => n + p.sources.length, 0),
  distinctSourceDocuments: new Set(patches.flatMap(p => p.sources.map(s => s.contentUrl || s.url))).size,
  gaps: snapshot.polymers.flatMap(p => Object.entries(p.sections).filter(([, value]) => !value.trim())
    .map(([field]) => ({ wopId: p.wopId, name: p.canonicalName, field })))
};
console.log(JSON.stringify(report, null, 2));
if (process.argv.includes('--write')) {
  const staged = await fs.mkdtemp(path.join(repository, 'public-data/.completion-stage-'));
  try {
    await fs.writeFile(path.join(staged, 'snapshot.json'), `${JSON.stringify(snapshot, null, 2)}\n`);
    if (await fs.readFile(publicationFile, 'utf8') !== original) {
      throw new Error('Publication input changed during preparation; rerun against the latest snapshot.');
    }
    await importSnapshot(staged, destination);
    console.log('Imported the validated completion batch; stable identities and chemical graphs retained.');
  } finally {
    await fs.rm(staged, { recursive: true, force: true });
  }
}
