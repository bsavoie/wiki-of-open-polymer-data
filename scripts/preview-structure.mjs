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

const [wopId, requestedOutput, requestedSource, unexpected] = process.argv.slice(2);
if (!wopId || unexpected) {
  console.error('Usage: npm run structures:preview -- <wopId> [output-directory] [snapshot-directory]');
  process.exitCode = 1;
} else {
  const source = path.resolve(requestedSource || 'public-data/wop-publication-snapshot-v2');
  const output = path.resolve(requestedOutput || path.join('outputs', 'structure-preview', wopId));
  const snapshot = await readAndValidateSnapshot(source);
  const polymer = snapshot.polymers.find((entry) => entry.wopId === wopId);
  if (!polymer) throw new Error(`Unknown polymer identifier ${wopId}`);

  const groups = depictionGroups(polymer);
  const items = groups.flatMap(({ depiction }) => depiction.items);
  if (!items.length) throw new Error(`${wopId} has no hero or contextual structure items to preview`);
  const definitionsById = new Map(snapshot.chemicalStructures.map((definition) => [definition.structureId, definition]));
  const structureIds = [...new Set(items.map((item) => item.structureId))];
  const definitions = structureIds.map((structureId) => {
    const definition = definitionsById.get(structureId);
    if (!definition) throw new Error(`${wopId} references missing chemical structure ${structureId}`);
    return definition;
  });
  const rendered = await renderChemicalStructures(definitions, output);
  const expectedAssets = new Set(structureIds.flatMap((structureId) => [
    `${structureId}.svg`,
    `${structureId}.mol`
  ]));
  for (const entry of await fs.readdir(output, { withFileTypes: true })) {
    if (entry.isFile() && /\.(?:svg|mol)$/i.test(entry.name) && !expectedAssets.has(entry.name)) {
      await fs.unlink(path.join(output, entry.name));
    }
  }
  const metadata = new Map(rendered.structures.map((structure) => [structure.structureId, structure]));
  const groupSections = groups.map(({ placement, representationType, depiction }) => {
    const figures = depiction.items.map((item) => {
      const structure = metadata.get(item.structureId);
      const notation = structureConventionNotes(item, structure);
      return `<figure>
        <img src="${encodeURIComponent(item.structureId)}.svg" width="${structure.width}" height="${structure.height}" alt="${escapeHtml(item.altText)}">
        ${notation.length ? `<div class="notation"><strong>Notation</strong><ul>${notation.map((note) => `<li>${escapeHtml(note)}</li>`).join('')}</ul></div>` : ''}
        <figcaption><strong>${escapeHtml(item.label)}</strong> <span>${escapeHtml(item.fidelity)}</span><br>${escapeHtml(item.caption)}<br><a href="${encodeURIComponent(item.structureId)}.mol" download>Download V3000 molfile</a></figcaption>
      </figure>`;
    }).join('\n');
    const content = depiction.items.length
      ? `<div class="grid">${figures}</div>`
      : `<div class="empty-state"><strong>No rendered item in this placement</strong><p>The hero scope may intentionally describe why no unique structure is shown, or the chemistry may instead appear in a section-specific context below.</p></div>`;
    return `<section class="depiction-group"><div class="depiction-group__heading"><h2>${escapeHtml(placement)}</h2><span>${escapeHtml(depiction.reviewStatus)}</span><span>${escapeHtml(representationType)}</span></div><p class="scope">${escapeHtml(depiction.scopeNote)}</p>${content}<p class="evidence"><strong>Structure evidence:</strong> ${escapeHtml(depiction.sourceIds.join(', ') || 'none mapped')}</p></section>`;
  }).join('\n');
  const html = `<!doctype html>
<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>${escapeHtml(polymer.canonicalName)} structure preview</title>
<style>body{font:16px/1.5 system-ui,sans-serif;margin:0 auto;max-width:1100px;padding:2rem;color:#17202a}header{border-bottom:1px solid #ccd4dc;margin-bottom:2rem}.depiction-group{margin-top:2rem;padding-top:1rem;border-top:1px solid #ccd4dc}.depiction-group__heading{display:flex;align-items:center;gap:.5rem;flex-wrap:wrap}.depiction-group__heading h2{margin-right:auto}.depiction-group__heading span{padding:.2rem .5rem;border-radius:999px;background:#dcecea}.grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(min(100%,28rem),1fr));gap:1.5rem}figure{border:1px solid #ccd4dc;border-radius:.6rem;margin:0;padding:1rem}img{display:block;max-width:100%;height:auto;margin:auto}figcaption{margin-top:1rem}.scope{background:#f2f5f7;padding:1rem;border-radius:.4rem}.notation{margin-top:1rem;padding:.75rem;border-left:3px solid #184f65;background:#dcecea;color:#43515b}.notation ul{margin:.3rem 0 0;padding-left:1.1rem}.empty-state{padding:1rem;border-left:4px solid #d79a3b;background:#f6e7ca}.empty-state p{margin-bottom:0}.evidence{font-size:.9rem;color:#53606c}span{color:#53606c;font-size:.9em}</style>
</head><body><header><p>${escapeHtml(polymer.wopId)}</p><h1>${escapeHtml(polymer.canonicalName)}</h1></header>
<main>${groupSections}</main></body></html>\n`;
  await fs.writeFile(path.join(output, 'index.html'), html, 'utf8');
  const heroItemCount = polymer.structuralDepictions.items.length;
  console.log(`Rendered ${items.length} structure item(s) (${heroItemCount} hero, ${items.length - heroItemCount} contextual) for ${wopId} to ${path.join(output, 'index.html')}`);
}
