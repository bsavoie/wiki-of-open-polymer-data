import fs from 'node:fs/promises';
import path from 'node:path';
import { readAndValidateSnapshot } from '../lib/importer.mjs';
import { renderChemicalStructures } from '../lib/structure-renderer.mjs';

const escapeHtml = (value) => String(value)
  .replaceAll('&', '&amp;')
  .replaceAll('<', '&lt;')
  .replaceAll('>', '&gt;')
  .replaceAll('"', '&quot;');

const contextualPlacement = (sectionKey) => sectionKey === 'processing'
  ? 'Processing context'
  : 'Synthesis context';

function depictionGroups(polymer) {
  return [
    {
      placement: 'Article hero',
      representationType: polymer.structuralDepictions.representationType,
      depiction: polymer.structuralDepictions
    },
    ...Object.entries(polymer.contextualStructures || {}).map(([sectionKey, depiction]) => ({
      placement: contextualPlacement(sectionKey),
      representationType: 'section_context',
      depiction
    }))
  ];
}

function structureConventionNotes(item, structure) {
  return [
    item.notation,
    structure.conventions?.unknownSingleBondCount
      ? 'A wavy single bond means that configuration at that center is intentionally unspecified; it is not a polymer-continuation bond.'
      : null,
    structure.conventions?.unknownDoubleBondCount
      ? 'A crossed double bond means that E/Z geometry is intentionally unspecified.'
      : null
  ].filter(Boolean);
}

const [requestedOutput, requestedSource, unexpected] = process.argv.slice(2);
if (unexpected) {
  console.error('Usage: npm run structures:contact-sheet -- [output-file] [snapshot-directory]');
  process.exitCode = 1;
} else {
  const source = path.resolve(requestedSource || 'public-data/wop-publication-snapshot-v2');
  const output = path.resolve(requestedOutput || path.join('outputs', 'structure-contact-sheet.html'));
  if (path.extname(output).toLowerCase() !== '.html') throw new Error('Contact-sheet output must be an .html file');
  const assetDirectory = path.join(path.dirname(output), `${path.basename(output, '.html')}-assets`);
  const snapshot = await readAndValidateSnapshot(source);
  const rendered = await renderChemicalStructures(snapshot.chemicalStructures, assetDirectory);
  const expectedAssets = new Set(snapshot.chemicalStructures.flatMap(({ structureId }) => [
    `${structureId}.svg`,
    `${structureId}.mol`
  ]));
  for (const entry of await fs.readdir(assetDirectory, { withFileTypes: true })) {
    if (entry.isFile() && /\.(?:svg|mol)$/i.test(entry.name) && !expectedAssets.has(entry.name)) {
      await fs.unlink(path.join(assetDirectory, entry.name));
    }
  }
  const renderedById = new Map(rendered.structures.map((structure) => [structure.structureId, structure]));
  const usage = new Map(snapshot.chemicalStructures.map(({ structureId }) => [structureId, []]));
  for (const polymer of snapshot.polymers) {
    for (const { placement, representationType, depiction } of depictionGroups(polymer)) {
      for (const item of depiction.items) usage.get(item.structureId)?.push({
        wopId: polymer.wopId,
        canonicalName: polymer.canonicalName,
        placement,
        reviewStatus: depiction.reviewStatus,
        representationType,
        scopeNote: depiction.scopeNote,
        sourceIds: depiction.sourceIds,
        item
      });
    }
  }
  const heroItemCount = snapshot.polymers.reduce((count, polymer) => count + polymer.structuralDepictions.items.length, 0);
  const contextualItemCount = snapshot.polymers.reduce((count, polymer) => count + Object.values(polymer.contextualStructures || {})
    .reduce((groupCount, depiction) => groupCount + depiction.items.length, 0), 0);
  const assetUrl = encodeURIComponent(path.basename(assetDirectory));
  const cards = snapshot.chemicalStructures.map(({ structureId }) => {
    const structure = renderedById.get(structureId);
    const diagnostics = JSON.stringify(structure.diagnostics, null, 2);
    const usedBy = usage.get(structureId).map((entry) => {
      const notation = structureConventionNotes(entry.item, structure);
      return `<li class="usage"><strong>${escapeHtml(entry.wopId)} — ${escapeHtml(entry.canonicalName)}</strong><span class="usage__placement">${escapeHtml(entry.placement)}</span>
      <dl><div><dt>Placement</dt><dd>${escapeHtml(entry.placement)}</dd></div><div><dt>Review</dt><dd>${escapeHtml(entry.reviewStatus)}</dd></div><div><dt>Representation</dt><dd>${escapeHtml(entry.representationType)}</dd></div><div><dt>Item</dt><dd>${escapeHtml(entry.item.label)} · ${escapeHtml(entry.item.fidelity)}</dd></div><div><dt>Scope</dt><dd>${escapeHtml(entry.scopeNote)}</dd></div>${notation.length ? `<div><dt>Notation</dt><dd><ul class="notation">${notation.map((note) => `<li>${escapeHtml(note)}</li>`).join('')}</ul></dd></div>` : ''}<div><dt>Caption</dt><dd>${escapeHtml(entry.item.caption)}</dd></div><div><dt>Evidence</dt><dd>${escapeHtml(entry.sourceIds.join(', '))}</dd></div></dl></li>`;
    }).join('');
    return `<article id="${escapeHtml(structureId)}"><h2>${escapeHtml(structureId)}</h2>
      <img src="${assetUrl}/${encodeURIComponent(structureId)}.svg" width="${structure.width}" height="${structure.height}" alt="Rendered chemical structure ${escapeHtml(structureId)}">
      <p>${structure.atomCount} atoms · ${structure.width}×${structure.height}px · <a href="${assetUrl}/${encodeURIComponent(structureId)}.mol" download>V3000 molfile</a></p>
      ${diagnostics ? `<details><summary>Renderer diagnostics</summary><pre><code>${escapeHtml(diagnostics)}</code></pre></details>` : '<p>No renderer diagnostics.</p>'}
      <details><summary>Used in ${usage.get(structureId).length} article placement(s)</summary><ul>${usedBy}</ul></details></article>`;
  }).join('\n');
  const html = `<!doctype html>
<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>Wiki of Open Polymer Data structure contact sheet</title>
<style>body{font:15px/1.45 system-ui,sans-serif;margin:0;padding:2rem;color:#17202a;background:#eef2f4}header{max-width:90rem;margin:auto}.grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(min(100%,30rem),1fr));gap:1rem;max-width:90rem;margin:auto}article{background:white;border:1px solid #ccd4dc;border-radius:.6rem;padding:1rem;break-inside:avoid}h2{overflow-wrap:anywhere;font-size:1.1rem}img{display:block;max-width:100%;height:auto;margin:auto}summary{cursor:pointer}pre{max-height:24rem;overflow:auto;padding:.75rem;background:#f4f6f7;white-space:pre-wrap;overflow-wrap:anywhere}code{font-size:.9em}.usage{margin-block:1rem}.usage__placement{display:inline-block;margin-left:.5rem;padding:.15rem .45rem;border-radius:999px;background:#dcecea;color:#184f65;font-size:.78rem;font-weight:700}.usage dl{display:grid;gap:.35rem;margin:.5rem 0}.usage dl div{display:grid;grid-template-columns:7rem 1fr;gap:.5rem}.usage dt{font-weight:700}.usage dd{margin:0}.notation{margin:0;padding-left:1.1rem}@media print{body{background:white;padding:0}.grid{display:block}article{page-break-inside:avoid;margin-bottom:1rem}}</style>
</head><body><header><h1>Chemical structure contact sheet</h1><p>${snapshot.chemicalStructures.length} canonical V3000 definitions · ${heroItemCount + contextualItemCount} article placements (${heroItemCount} hero, ${contextualItemCount} contextual) · ${rendered.rendererVersion} · ${rendered.styleId}</p></header><main class="grid">${cards}</main></body></html>\n`;
  await fs.mkdir(path.dirname(output), { recursive: true });
  await fs.writeFile(output, html, 'utf8');
  console.log(`Rendered ${snapshot.chemicalStructures.length} structures to ${output}`);
}
