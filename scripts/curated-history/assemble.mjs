import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { validateSnapshot } from '../../lib/schema.mjs';
import { importSnapshot } from '../../lib/importer.mjs';
import first from './history-001-090.mjs';
import second from './history-091-175.mjs';
import elastomers from './history-166-175.mjs';
import third from './history-176-250.mjs';
import conducting from './history-241-250.mjs';
import families from './history-251-262.mjs';

// Curated history additions are applied by stable identity; the public v2
// snapshot remains the publication input and all unrelated data is retained.
const repository = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const destination = path.join(repository, 'public-data/wop-publication-snapshot-v2');
const publicationFile = path.join(destination, 'snapshot.json');
const original = await fs.readFile(publicationFile, 'utf8');
const snapshot = JSON.parse(original);
const additions = [...first, ...second, ...elastomers, ...third, ...conducting, ...families];
const byId = new Map(snapshot.polymers.map(article => [article.wopId, article]));
const seen = new Set();
const documentUrl = value => {
  const url = new URL(value);
  url.search = '';
  url.hash = '';
  return url.href;
};

for (const addition of additions) {
  if (seen.has(addition.wopId)) throw new Error(`Duplicate history for ${addition.wopId}`);
  seen.add(addition.wopId);
  const article = byId.get(addition.wopId);
  if (!article) throw new Error(`Unknown history target ${addition.wopId}`);
  if (!addition.history?.trim()) throw new Error(`Empty history for ${addition.wopId}`);
  if (!addition.sources?.length || addition.sources.some(source =>
    source.supports.length !== 1 || source.supports[0] !== 'history')) {
    throw new Error(`History sources must support only history for ${addition.wopId}`);
  }
  article.sections.history = addition.history;
  // Repeatable authoring: replace only the exact history-only evidence IDs.
  const incomingIds = new Set(addition.sources.map(source => source.sourceId));
  article.sources = article.sources.filter(source => {
    if (!incomingIds.has(source.sourceId)) return true;
    if (source.supports.length !== 1 || source.supports[0] !== 'history') {
      throw new Error(`History source ID collides with other evidence: ${source.sourceId}`);
    }
    return false;
  });
  const lineages = new Map(article.sources.flatMap(source =>
    [source.url, source.contentUrl].filter(Boolean).map(url => [documentUrl(url), source.lineageId])));
  for (const source of structuredClone(addition.sources)) {
    const urls = [source.url, source.contentUrl].filter(Boolean).map(documentUrl);
    const existing = [...new Set(urls.map(url => lineages.get(url)).filter(Boolean))];
    if (existing.length > 1) throw new Error(`Conflicting existing document lineages for ${source.sourceId}`);
    source.lineageId = existing[0] || source.lineageId;
    for (const url of urls) lineages.set(url, source.lineageId);
    article.sources.push(source);
  }
}
const missing = [...byId.keys()].filter(id => !seen.has(id));
if (missing.length) throw new Error(`Missing histories: ${missing.join(', ')}`);
validateSnapshot(snapshot);
const staged = await fs.mkdtemp(path.join(repository, 'public-data/.history-stage-'));
try {
  await fs.writeFile(path.join(staged, 'snapshot.json'), `${JSON.stringify(snapshot, null, 2)}\n`);
  if (await fs.readFile(publicationFile, 'utf8') !== original) {
    throw new Error('Publication snapshot changed during history preparation; rerun against the new input.');
  }
  await importSnapshot(staged, destination);
  console.log(`Imported ${seen.size} sourced histories; all other article fields retained.`);
} finally {
  await fs.rm(staged, { recursive: true, force: true });
}
