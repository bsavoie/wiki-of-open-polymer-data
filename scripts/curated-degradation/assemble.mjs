import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { validateSnapshot } from '../../lib/schema.mjs';
import { importSnapshot } from '../../lib/importer.mjs';

// Curated evidence patches target stable identities. The latest canonical v2
// snapshot remains the publication input; unrelated sections are retained.
const here = path.dirname(fileURLToPath(import.meta.url));
const repository = path.resolve(here, '../..');
const destination = path.join(repository, 'public-data/wop-publication-snapshot-v2');
const publicationFile = path.join(destination, 'snapshot.json');
const original = await fs.readFile(publicationFile, 'utf8');
const snapshot = JSON.parse(original);
const fields = ['degradationAndStability', 'recyclingAndEndOfLife'];
const batches = ['thermoplastics', 'engineering', 'networks-rubbers', 'bio-specialty'];
const additions = (await Promise.all(batches.map(async name =>
  JSON.parse(await fs.readFile(path.join(here, `${name}.json`), 'utf8'))))).flat();
const byId = new Map(snapshot.polymers.map(article => [article.wopId, article]));
const seen = new Set();
const documentUrl = value => {
  const url = new URL(value);
  url.search = '';
  url.hash = '';
  return url.href;
};
for (const addition of additions) {
  if (seen.has(addition.wopId)) throw new Error(`Duplicate degradation target ${addition.wopId}`);
  seen.add(addition.wopId);
  const article = byId.get(addition.wopId);
  if (!article) throw new Error(`Unknown degradation target ${addition.wopId}`);
  for (const key of fields) {
    if (typeof addition[key] !== 'string') throw new Error(`Missing ${key} for ${addition.wopId}`);
    // A new evidence gap must not erase previously sourced publication prose.
    if (addition[key].trim()) article.sections[key] = addition[key];
  }
  if (!Array.isArray(addition.sources) || addition.sources.some(source =>
    !source.sourceId.startsWith('deg-') || !source.supports.length ||
    source.supports.some(key => !fields.includes(key)))) {
    throw new Error(`Invalid degradation source scope for ${addition.wopId}`);
  }
  const incomingIds = new Set(addition.sources.map(source => source.sourceId));
  if (incomingIds.size !== addition.sources.length) throw new Error(`Duplicate source ID for ${addition.wopId}`);
  article.sources = article.sources.filter(source => {
    if (!incomingIds.has(source.sourceId)) return true;
    if (source.supports.some(key => !fields.includes(key))) {
      throw new Error(`Degradation source ID collides with other evidence: ${source.sourceId}`);
    }
    return false;
  });
  const lineages = new Map(article.sources.flatMap(source =>
    [source.url, source.contentUrl].filter(Boolean).map(url => [documentUrl(url), source.lineageId])));
  for (const source of structuredClone(addition.sources)) {
    const urls = [source.url, source.contentUrl].filter(Boolean).map(documentUrl);
    const existing = [...new Set(urls.map(url => lineages.get(url)).filter(Boolean))];
    if (existing.length > 1) throw new Error(`Conflicting document lineages for ${source.sourceId}`);
    source.lineageId = existing[0] || source.lineageId;
    for (const url of urls) lineages.set(url, source.lineageId);
    article.sources.push(source);
  }
  if (fields.some(key => !article.sections[key].trim()) &&
      !article.maturity.reviewFlags.includes('end_of_life_review_needed')) {
    article.maturity.reviewFlags.push('end_of_life_review_needed');
  }
}
const missing = [...byId.keys()].filter(id => !seen.has(id));
if (missing.length) throw new Error(`Missing degradation research records: ${missing.join(', ')}`);
validateSnapshot(snapshot);
const summary = {
  entries: seen.size,
  degradation: snapshot.polymers.filter(p => p.sections.degradationAndStability.trim()).length,
  recycling: snapshot.polymers.filter(p => p.sections.recyclingAndEndOfLife.trim()).length,
  newSourceAssociations: additions.reduce((n, p) => n + p.sources.length, 0),
  gaps: snapshot.polymers.filter(p => fields.some(key => !p.sections[key].trim()))
    .map(p => ({ wopId: p.wopId, name: p.canonicalName, fields: fields.filter(key => !p.sections[key].trim()) }))
};
console.log(JSON.stringify(summary, null, 2));
if (process.argv.includes('--write')) {
  const staged = await fs.mkdtemp(path.join(repository, 'public-data/.degradation-stage-'));
  try {
    await fs.writeFile(path.join(staged, 'snapshot.json'), `${JSON.stringify(snapshot, null, 2)}\n`);
    if (await fs.readFile(publicationFile, 'utf8') !== original) {
      throw new Error('Publication snapshot changed during preparation; rerun against the latest input.');
    }
    await importSnapshot(staged, destination);
    console.log(`Imported degradation evidence for ${seen.size} entries; all other article fields retained.`);
  } finally {
    await fs.rm(staged, { recursive: true, force: true });
  }
}
