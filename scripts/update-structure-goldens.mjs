import { createHash } from 'node:crypto';
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  STRUCTURE_RENDERER_VERSION,
  STRUCTURE_STYLE_ID,
  renderChemicalStructure
} from '../lib/structure-renderer.mjs';

const scriptDirectory = path.dirname(fileURLToPath(import.meta.url));
const repository = path.resolve(scriptDirectory, '..');
const snapshot = JSON.parse(await fs.readFile(
  path.join(repository, 'public-data', 'wop-publication-snapshot-v2', 'snapshot.json'),
  'utf8'
));
const output = path.join(repository, 'test', 'fixtures', 'structure-goldens');
const fixtureDirectory = path.join(repository, 'test', 'fixtures', 'structures');
const byId = new Map(snapshot.chemicalStructures.map((definition) => [definition.structureId, definition]));

const cases = [
  { category: 'carbon-only', structureIds: ['polyethylene-sru'] },
  { category: 'heteroatom-rich', structureIds: ['polyethylene-terephthalate-sru'] },
  { category: 'stereoregular', structureIds: ['isotactic-polypropylene-corrected-dyad'] },
  {
    category: 'copolymer',
    fixtures: ['cop-sgroup'],
    structureIds: [
      'pedot-neutral-unit',
      'polystyrene-sulfonic-acid-unit',
      'sbs-connected-aba-block-architecture'
    ]
  },
  { category: 'ionic', structureIds: ['pnass-two-unit-sodium-segment'] },
  { category: 'silicon-containing', structureIds: ['polydimethylsiloxane-sru'] },
  {
    category: 'generic-markush',
    structureIds: [
      'poly-2-oxazoline-markush-unit',
      'poly-r-3-hydroxyalkanoate-chiral-markush-unit'
    ]
  },
  { category: 'numbered-markush', structureIds: ['cellulose-trisubstitution-corrected-markush-motif'] },
  { category: 'network', structureIds: ['pex-carbon-carbon-junction'] },
  {
    category: 'blend',
    structureIds: [
      'bisphenol-a-polycarbonate-sru',
      'polystyrene-sru',
      'polyacrylonitrile-sru',
      'polybutadiene-1-4-sru'
    ]
  },
  { category: 'irregular-motif', structureIds: ['lignin-guaiacyl-beta-o-4-open-macromolecular-motif'] }
];

await fs.rm(output, { recursive: true, force: true });
await fs.mkdir(output, { recursive: true });
const manifest = {
  rendererVersion: STRUCTURE_RENDERER_VERSION,
  styleVersion: STRUCTURE_STYLE_ID,
  cases: []
};

for (const goldenCase of cases) {
  const inputs = [];
  for (const structureId of goldenCase.structureIds || []) {
    const definition = byId.get(structureId);
    if (!definition) throw new Error(`Golden case ${goldenCase.category} names missing ${structureId}`);
    inputs.push(definition);
  }
  for (const fixture of goldenCase.fixtures || []) {
    inputs.push({
      structureId: fixture,
      molfileV3000: await fs.readFile(path.join(fixtureDirectory, `${fixture}.mol`), 'utf8')
    });
  }
  const outputs = [];
  for (const definition of inputs) {
    const rendered = await renderChemicalStructure(definition);
    const filename = `${goldenCase.category}--${definition.structureId}.svg`;
    await fs.writeFile(path.join(output, filename), rendered.svg);
    outputs.push({
      structureId: definition.structureId,
      filename,
      sha256: createHash('sha256').update(rendered.svg).digest('hex')
    });
  }
  manifest.cases.push({ category: goldenCase.category, outputs });
}

await fs.writeFile(path.join(output, 'manifest.json'), `${JSON.stringify(manifest, null, 2)}\n`);
console.log(`Updated ${manifest.cases.length} structure golden categories in ${output}`);
