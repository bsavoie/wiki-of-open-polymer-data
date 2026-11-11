import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { readAndValidateSnapshot } from '../lib/importer.mjs';
import { renderChemicalStructures } from '../lib/structure-renderer.mjs';

const escapeHtml = (value) => String(value)
  .replaceAll('&', '&amp;')
  .replaceAll('<', '&lt;')
  .replaceAll('>', '&gt;')
  .replaceAll('"', '&quot;');

const normalizeInitial = (value) => value.normalize('NFKD')
  .replace(/[\u0300-\u036f]/g, '')
  .match(/[A-Za-z]/)?.[0]
  ?.toUpperCase() || '';

export function parseInitialRange(value) {
  const match = /^\s*([A-Za-z])(?:\s*-\s*([A-Za-z]))?\s*$/.exec(value || '');
  if (!match) throw new Error('Batch must be one initial or an inclusive range such as A-C');
  const start = match[1].toUpperCase();
  const end = (match[2] || match[1]).toUpperCase();
  if (start > end) throw new Error(`Batch range ${start}-${end} is reversed`);
  return { start, end, label: start === end ? start : `${start}-${end}` };
}

export function selectInitialRange(polymers, range) {
  return polymers
    .filter((polymer) => {
      const initial = normalizeInitial(polymer.canonicalName);
      return initial >= range.start && initial <= range.end;
    })
    .sort((left, right) => left.canonicalName.localeCompare(right.canonicalName));
}

function depictionGroups(polymer) {
  return [
    { title: 'Article hero', kind: polymer.structuralDepictions.representationType, depiction: polymer.structuralDepictions },
    ...Object.entries(polymer.contextualStructures || {}).map(([key, depiction]) => ({
      title: key === 'processing' ? 'Processing-tab chemistry' : 'Synthesis-tab chemistry',
      kind: 'section_context',
      depiction
    }))
  ];
}

export async function buildStructureReviewBatch({
  requestedBatch,
  requestedOutput,
  requestedSource
}) {
  const range = parseInitialRange(requestedBatch);
  const source = path.resolve(requestedSource || 'public-data/wop-publication-snapshot-v2');
  const output = path.resolve(requestedOutput || path.join('outputs', 'structure-review', range.label.toLowerCase()));
  const assetDirectory = path.join(output, 'assets', 'structures');
  const snapshot = await readAndValidateSnapshot(source);
  const polymers = selectInitialRange(snapshot.polymers, range);
  if (!polymers.length) throw new Error(`No canonical polymer names fall in ${range.label}`);

  const structureIds = [...new Set(polymers.flatMap((polymer) =>
    depictionGroups(polymer).flatMap(({ depiction }) => depiction.items.map((item) => item.structureId))
  ))];
  const definitionsById = new Map(snapshot.chemicalStructures.map((definition) => [definition.structureId, definition]));
  const definitions = structureIds.map((structureId) => {
    const definition = definitionsById.get(structureId);
    if (!definition) throw new Error(`Batch entry references missing structure ${structureId}`);
    return definition;
  });
  const rendered = await renderChemicalStructures(definitions, assetDirectory);
  const renderedById = new Map(rendered.structures.map((structure) => [structure.structureId, structure]));
  const expectedAssets = new Set(structureIds.flatMap((structureId) => [
    `${structureId}.svg`,
    `${structureId}.mol`
  ]));
  for (const entry of await fs.readdir(assetDirectory, { withFileTypes: true })) {
    if (entry.isFile() && /\.(?:svg|mol)$/i.test(entry.name) && !expectedAssets.has(entry.name)) {
      await fs.unlink(path.join(assetDirectory, entry.name));
    }
  }

  const articles = polymers.map((polymer) => {
    const sourcesById = new Map(polymer.sources.map((source) => [source.sourceId, source]));
    const groups = depictionGroups(polymer).map(({ title, kind, depiction }) => {
      const evidence = depiction.sourceIds.map((sourceId) => {
        const sourceRecord = sourcesById.get(sourceId);
        const target = sourceRecord?.contentUrl || sourceRecord?.url;
        return target
          ? `<a href="${escapeHtml(target)}" rel="external noreferrer">${escapeHtml(sourceId)}</a>`
          : `<span>${escapeHtml(sourceId)}</span>`;
      }).join(', ');
      const figures = depiction.items.map((item) => {
        const structure = renderedById.get(item.structureId);
        const asset = encodeURIComponent(item.structureId);
        const isWide = Number(structure.width) / Number(structure.height) >= 3.2;
        const imageClass = `structure-card__image${isWide ? ' structure-card__image--wide' : ''}`;
        const scrollAttributes = isWide ? ' tabindex="0" aria-label="Wide chemical structure; scroll horizontally on a small screen"' : '';
        const notation = [
          item.notation,
          structure.conventions?.openAttachmentCount
            ? 'Short waves across bond ends mark connections to omitted portions; they are not wavy stereobonds.'
            : null,
          structure.conventions?.unknownSingleBondCount
            ? 'A wavy single bond means that configuration is intentionally unspecified; it is not a polymer-continuation bond.'
            : null,
          structure.conventions?.unknownDoubleBondCount
            ? 'A crossed double bond means that E/Z geometry is intentionally unspecified.'
            : null
        ].filter(Boolean);
        return `<figure class="structure-card">
          <div class="structure-card__heading"><h3>${escapeHtml(item.label)}</h3><span>${escapeHtml(item.fidelity)}</span></div>
          <div class="${imageClass}"${scrollAttributes}><img src="assets/structures/${asset}.svg" width="${structure.width}" height="${structure.height}" loading="eager" decoding="async" alt="${escapeHtml(item.altText)}"></div>
          ${notation.length ? `<div class="notation"><strong>Notation</strong><ul>${notation.map((note) => `<li>${escapeHtml(note)}</li>`).join('')}</ul></div>` : ''}
          <figcaption><p>${escapeHtml(item.caption)}</p><a href="assets/structures/${asset}.mol" download>Download V3000</a></figcaption>
        </figure>`;
      }).join('');
      const state = depiction.items.length
        ? `<div class="structure-grid${depiction.items.length === 1 ? ' structure-grid--single' : ''}">${figures}</div>`
        : `<div class="empty-state"><strong>No rendered hero item</strong><p>The sourced scope does not support one unique repeat unit or network drawing.</p></div>`;
      return `<section class="depiction-group"><h3>${escapeHtml(title)}</h3><div class="badges"><span>${escapeHtml(depiction.reviewStatus)}</span><span>${escapeHtml(kind)}</span><span>${depiction.items.length} render${depiction.items.length === 1 ? '' : 's'}</span></div><p class="scope">${escapeHtml(depiction.scopeNote)}</p>${state}<p class="evidence"><strong>Structural evidence:</strong> ${evidence || 'none mapped'}</p></section>`;
    }).join('');
    const articleItemCount = depictionGroups(polymer)
      .reduce((count, { depiction }) => count + depiction.items.length, 0);
    return `<article class="entry" id="${escapeHtml(polymer.wopId)}">
      <header><div><span class="wop-id">${escapeHtml(polymer.wopId)}</span><h2>${escapeHtml(polymer.canonicalName)}</h2></div><a class="article-link" href="../../../dist/polymers/${encodeURIComponent(polymer.canonicalSlug)}/#structural-depictions">Open article integration</a></header>
      <div class="badges"><span>${articleItemCount} total render${articleItemCount === 1 ? '' : 's'}</span></div>
      ${groups}
    </article>`;
  }).join('\n');

  const renderedItemCount = polymers.reduce((count, polymer) => count + depictionGroups(polymer)
    .reduce((groupCount, { depiction }) => groupCount + depiction.items.length, 0), 0);
  const html = `<!doctype html>
<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>${escapeHtml(range.label)} polymer structure review</title>
<style>
:root{font-family:Inter,ui-sans-serif,system-ui,sans-serif;color:#17242c;background:#f5f3ed}*{box-sizing:border-box}body{margin:0}a{color:#184f65;text-underline-offset:.18em}.page-header{padding:3rem max(1rem,calc((100% - 1180px)/2));background:#0e3546;color:white}.page-header h1{margin:.35rem 0;font:500 clamp(2.4rem,6vw,5rem)/.98 Georgia,serif}.page-header p{max-width:72ch;color:#c8d5d9}.summary{font-weight:700}.entries{width:min(1180px,calc(100% - 2rem));margin:2rem auto 5rem;display:grid;gap:1.5rem}.entry{padding:clamp(1rem,3vw,2rem);border:1px solid #cfd6d3;border-radius:18px;background:#fffefa}.entry>header{display:flex;justify-content:space-between;align-items:start;gap:1rem}.entry h2{margin:.25rem 0;font:500 clamp(1.7rem,4vw,2.6rem)/1.05 Georgia,serif}.wop-id{font-size:.75rem;font-weight:800;letter-spacing:.1em;text-transform:uppercase;color:#184f65}.article-link{flex:0 0 auto;font-weight:700}.depiction-group{margin-top:1.25rem;padding-top:1.25rem;border-top:1px solid #cfd6d3}.depiction-group>h3{margin:0;font:600 1rem/1.2 system-ui,sans-serif;color:#184f65}.badges{display:flex;flex-wrap:wrap;gap:.4rem;margin:1rem 0}.badges span,.structure-card__heading span{padding:.35rem .55rem;border-radius:999px;background:#dcecea;font-size:.68rem;font-weight:800;text-transform:uppercase}.scope{max-width:90ch;color:#4c5d66;line-height:1.6}.structure-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(min(100%,300px),1fr));gap:1rem}.structure-grid--single{grid-template-columns:1fr}.structure-card{min-width:0;margin:0;padding:1rem;border:1px solid #cfd6d3;border-radius:14px;background:white}.structure-card__heading{display:flex;justify-content:space-between;align-items:start;gap:1rem}.structure-card h3{margin:0;font:500 1.3rem Georgia,serif}.structure-card__image{min-height:220px;padding:.5rem;display:grid;place-items:center;overflow:hidden}.structure-card img{display:block;width:100%;height:auto;max-height:360px;object-fit:contain}.notation{margin:.25rem 0 1rem;padding:.75rem;border-left:3px solid #184f65;background:#dcecea;color:#4c5d66;font-size:.8rem;line-height:1.5}.notation ul{margin:.3rem 0 0;padding-left:1.1rem}.structure-card figcaption{padding-top:1rem;border-top:1px solid #cfd6d3;color:#4c5d66;line-height:1.5}.structure-card figcaption p{margin-top:0}.evidence{padding-top:1rem;border-top:1px solid #cfd6d3;font-size:.8rem;overflow-wrap:anywhere}.empty-state{padding:1rem;border-left:4px solid #d79a3b;background:#f6e7ca}.empty-state p{margin-bottom:0}@media(max-width:600px){.entry>header,.structure-card__heading{flex-direction:column}.article-link{flex:auto}.structure-card__image{min-height:170px}.structure-card__image--wide{justify-content:start;overflow-x:auto;overscroll-behavior-inline:contain}.structure-card__image--wide img{width:560px;max-width:none}}@media print{.page-header{padding:1rem;background:white;color:#17242c}.page-header p{color:#4c5d66}.entry,.structure-card{break-inside:avoid}.article-link{display:none}}
.entry{min-width:0}.entry>header>div{min-width:0;max-width:100%}.entry h2{overflow-wrap:anywhere}
</style></head><body>
<header class="page-header"><span class="wop-id">Focused structural-depiction review</span><h1>${escapeHtml(range.label)} polymers</h1><p>Article-centric review of canonical V3000 structures, representation boundaries, captions, evidence mapping, and the figures readers see in each article hero.</p><p class="summary">${polymers.length} articles · ${structureIds.length} shared definitions · ${renderedItemCount} rendered items · ${escapeHtml(rendered.rendererVersion)} · ${escapeHtml(rendered.styleId)}</p></header>
<main class="entries">${articles}</main></body></html>\n`;
  await fs.mkdir(output, { recursive: true });
  await fs.writeFile(path.join(output, 'index.html'), html, 'utf8');
  await fs.writeFile(path.join(output, 'batch.json'), `${JSON.stringify({
    schema: 'wop-structure-review-batch-v1',
    range: range.label,
    wopIds: polymers.map((polymer) => polymer.wopId),
    polymerCount: polymers.length,
    structureDefinitionCount: structureIds.length,
    renderedItemCount,
    rendererVersion: rendered.rendererVersion,
    styleVersion: rendered.styleId
  }, null, 2)}\n`, 'utf8');
  console.log(`Rendered ${polymers.length} ${range.label} article depictions to ${path.join(output, 'index.html')}`);
  return { output, polymers, structureIds, renderedItemCount };
}

const isDirectInvocation = process.argv[1]
  ? path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)
  : false;

if (isDirectInvocation) {
  const [requestedBatch, requestedOutput, requestedSource, unexpected] = process.argv.slice(2);
  if (!requestedBatch || unexpected) {
    console.error('Usage: npm run structures:review-batch -- <A-C> [output-directory] [snapshot-directory]');
    process.exitCode = 1;
  } else {
    await buildStructureReviewBatch({ requestedBatch, requestedOutput, requestedSource });
  }
}
