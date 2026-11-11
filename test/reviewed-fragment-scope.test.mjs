import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import test from 'node:test';
import { validateV3000Molfile } from '../lib/structure-renderer.mjs';

test('phenolic examples and the poloxamer schematic preserve their source boundaries', async () => {
  const snapshot = JSON.parse(await fs.readFile('public-data/wop-publication-snapshot-v2/snapshot.json', 'utf8'));
  const entry = id => snapshot.polymers.find(item => item.wopId === id);
  for (const [id, source] of [
    ['wop-000114', 'furuta-cresol-novolac-structures-1989'],
    ['wop-000115', 'king-rf-structural-types-2006'],
  ]) {
    const polymer = entry(id);
    assert.ok(polymer.structuralDepictions.sourceIds.includes(source));
    assert.equal(polymer.synthesisRoutes[0].productMode, 'structural_reference');
    assert.match(polymer.synthesisRoutes[0].productNote, /separate|different/i);
    assert.ok(!polymer.synthesisRoutes[0].sourceIds.includes(source));
  }
  const poloxamer = entry('wop-000238');
  assert.equal(poloxamer.structuralDepictions.items[0].structureId, 'poloxamer-ideal-peo-ppo-peo-block-schematic');
  assert.match(poloxamer.structuralDepictions.scopeNote, /does not depict the propylene-glycol starter junction/i);
  assert.match(poloxamer.synthesisRoutes[0].productNote, /uniformly oriented PPO.*does not show.*starter junction/i);
});

test('polyoxazoline ideal repeat keeps one selected substituent', async () => {
  const snapshot = JSON.parse(await fs.readFile('public-data/wop-publication-snapshot-v2/snapshot.json', 'utf8'));
  const polymer = snapshot.polymers.find(item => item.wopId === 'wop-000236');
  assert.match(polymer.synthesisRoutes[0].productNote, /one selected R repeated/i);
  assert.match(polymer.synthesisRoutes[0].productNote, /does not specify.*composition or sequence/i);
  assert.ok(polymer.structuralDepictions.sourceIds.includes('poly2oxazoline-samaro-hme-tablet-processing-2022'));
  assert.ok(!polymer.sources.some(source => source.sourceId === 'luxenhofer-polyoxazoline-therapeutics-review'));
});

test('siloxane repeat and hydrolysis example have distinct, bounded scope', async () => {
  const snapshot = JSON.parse(await fs.readFile('public-data/wop-publication-snapshot-v2/snapshot.json', 'utf8'));
  const polymer = snapshot.polymers.find(item => item.wopId === 'wop-000256');
  const route = polymer.synthesisRoutes[0];
  assert.match(polymer.structuralDepictions.scopeNote, /one chosen pair.*repeated throughout/i);
  assert.match(route.productNote, /mixture of linear and cyclic dimethylsiloxanes/i);
  assert.deepEqual(route.sourceIds, ['polysiloxane-organohalosilane-hydrolysis-us6326452']);
  assert.ok(route.steps.every(step => step.sourceIds.length === 1 && step.sourceIds[0] === route.sourceIds[0]));
});

test('polyisocyanurate ring remains a reference for the selected oligomer preparation', async () => {
  const snapshot = JSON.parse(await fs.readFile('public-data/wop-publication-snapshot-v2/snapshot.json', 'utf8'));
  const polymer = snapshot.polymers.find(item => item.wopId === 'wop-000123');
  const route = polymer.synthesisRoutes[0];
  assert.equal(polymer.structuralDepictions.items[0].structureId, 'polyisocyanurate-network-junction');
  assert.equal(route.productMode, 'structural_reference');
  assert.match(route.productNote, /specific residue identities.*complete network.*not encoded/i);
  assert.deepEqual(route.sourceIds, ['ep3286244-pir-isocyanurate-example']);
});

test('PAMAM branch omits unsupported distal nitrogen states', async () => {
  const snapshot = JSON.parse(await fs.readFile('public-data/wop-publication-snapshot-v2/snapshot.json', 'utf8'));
  const polymer = snapshot.polymers.find(item => item.wopId === 'wop-000239');
  const id = 'pamam-truncated-open-branch-environment';
  assert.equal(polymer.structuralDepictions.items[0].structureId, id);
  assert.equal(polymer.synthesisRoutes[0].products[0].structureId, id);
  assert.match(polymer.structuralDepictions.scopeNote, /distal nitrogens.*omitted/i);
  assert.ok(!snapshot.chemicalStructures.some(structure => structure.structureId === 'pamam-amidoamine-branching-motif'));
});

test('SIS block reference does not claim its ideal isoprene pattern for the sample', async () => {
  const snapshot = JSON.parse(await fs.readFile('public-data/wop-publication-snapshot-v2/snapshot.json', 'utf8'));
  const polymer = snapshot.polymers.find(item => item.wopId === 'wop-000167');
  assert.equal(polymer.structuralDepictions.items[0].structureId, 'sis-ideal-14-midblock-architecture');
  assert.match(polymer.structuralDepictions.scopeNote, /uniform 1,4-isoprene.*one connection sense/i);
  assert.match(polymer.synthesisRoutes[0].productNote, /does not establish.*distribution/i);
  assert.ok(!snapshot.chemicalStructures.some(structure => structure.structureId === 'sis-connected-aba-block-architecture'));
});

test('alkyd illustration retains a bounded source-specific glycerol environment', async () => {
  const snapshot = JSON.parse(await fs.readFile('public-data/wop-publication-snapshot-v2/snapshot.json', 'utf8'));
  const polymer = snapshot.polymers.find(item => item.wopId === 'wop-000125');
  const id = 'alkyd-central-glycerol-phthalate-open-fragment';
  assert.equal(polymer.structuralDepictions.items[0].structureId, id);
  assert.equal(polymer.synthesisRoutes[0].products[0].structureId, id);
  assert.ok(!snapshot.chemicalStructures.some(structure => structure.structureId === 'alkyd-glycerol-phthalate-fatty-motif'));
  const definition = snapshot.chemicalStructures.find(structure => structure.structureId === id);
  assert.equal(validateV3000Molfile(definition.molfileV3000, { structureId: id }).groups.length, 0);
});

test('precursor and oxadiazole examples retain bounded, source-qualified scope', async () => {
  const snapshot = JSON.parse(await fs.readFile('public-data/wop-publication-snapshot-v2/snapshot.json', 'utf8'));
  const entry = id => snapshot.polymers.find(item => item.wopId === id);
  const structure = id => snapshot.chemicalStructures.find(item => item.structureId === id);
  const melamine = 'hexamethylolmelamine-precursor-example';
  assert.equal(validateV3000Molfile(structure(melamine).molfileV3000, { structureId: melamine }).groups.length, 0);
  for (const id of ['wop-000118', 'wop-000119']) {
    const polymer = entry(id);
    assert.ok(polymer.structuralDepictions.items.some(item => item.structureId === melamine));
    assert.ok(polymer.synthesisRoutes[0].products.some(item => item.structureId === melamine));
    assert.match(polymer.structuralDepictions.scopeNote, /not (?:a unique resin repeat or an identified|established)/i);
    assert.match(polymer.structuralDepictions.scopeNote, /cured network.*not depicted/i);
  }
  const pod = entry('wop-000183');
  assert.deepEqual(pod.structuralDepictions.items.map(item => item.structureId), [
    'para-phenylene-oxadiazole-open-fragment', 'diphenyl-ether-oxadiazole-open-fragment',
  ]);
  assert.equal(pod.synthesisRoutes[0].products[0].structureId, 'diphenyl-ether-oxadiazole-open-fragment');
  assert.match(pod.synthesisRoutes[0].productNote, /does not establish exact sample composition/i);
  const novoloid = entry('wop-000187');
  assert.equal(novoloid.synthesisRoutes[0].products[0].structureId, 'novolac-ortho-para-open-phenol');
  assert.match(novoloid.synthesisRoutes[0].productNote, /not an identified product/i);
});

test('semi-aromatic polyamide routes keep alternative patent procedures separate', async () => {
  const snapshot = JSON.parse(await fs.readFile('public-data/wop-publication-snapshot-v2/snapshot.json', 'utf8'));
  const entry = id => snapshot.polymers.find(item => item.wopId === id);
  const route9 = entry('wop-000063').synthesisRoutes[0];
  assert.match(route9.title, /salt and solid-phase/i);
  assert.match(route9.steps[0].body, /crystallize and filter/i);
  assert.match(route9.steps[1].body, /sealed drum/i);
  assert.ok(route9.steps.every(step => step.sourceIds.includes('pa9t-polymerization-cn111217995')));
  assert.ok(!route9.sourceIds.includes('pa9t-salt-cn212819930'));
  const route10 = entry('wop-000064').synthesisRoutes[0];
  assert.match(route10.steps[2].body, /dried nylon salt in the solid state/i);
  assert.ok(!route10.sourceIds.includes('kuraray-pa10t-terephthalate-decanediamine-2016'));
});

test('BPA melt and epoxy route citations support the selected preparations', async () => {
  const snapshot = JSON.parse(await fs.readFile('public-data/wop-publication-snapshot-v2/snapshot.json', 'utf8'));
  const route = id => snapshot.polymers.find(item => item.wopId === id).synthesisRoutes[0];
  const melt = route('wop-000068');
  assert.ok(melt.sourceIds.includes('polycarbonate-bpa-routes-us6197916'));
  for (const step of melt.steps) {
    assert.ok(step.sourceIds.includes('polycarbonate-bpa-routes-us6197916'));
    assert.ok(!step.sourceIds.includes('schnell-bpa-pc-interfacial-patent-1962'));
  }
  const epoxy = route('wop-000098');
  assert.deepEqual(epoxy.sourceIds, ['dgeba-liquid-resin-us4132718']);
  assert.ok(epoxy.steps.every(step => step.sourceIds.includes('dgeba-liquid-resin-us4132718')));
  assert.match(epoxy.steps[1].body, /sodium hydroxide/i);
});

test('copolyester example does not assign unsupported volatile composition', async () => {
  const snapshot = JSON.parse(await fs.readFile('public-data/wop-publication-snapshot-v2/snapshot.json', 'utf8'));
  const polymer = snapshot.polymers.find(item => item.wopId === 'wop-000174');
  const route = polymer.synthesisRoutes[0];
  assert.ok(route.inputs.some(item => item.structureId === 'dimethyl-terephthalate-monomer'));
  assert.ok(!route.sourceIds.includes('tpc-pta-direct-esterification-us11267933'));
  assert.match(route.steps[2].body, /reduce pressure.*extrude.*pelletize/i);
  assert.doesNotMatch(route.steps[2].body, /glycol|methanol/i);
});

test('propylene-carbonate evidence preserves the article reuse restrictions', async () => {
  const snapshot = JSON.parse(await fs.readFile('public-data/wop-publication-snapshot-v2/snapshot.json', 'utf8'));
  const polymer = snapshot.polymers.find(item => item.wopId === 'wop-000069');
  const source = polymer.sources.find(item => item.sourceId === 'zinc-glutarate-co2-po-chain-transfer-study-2019');
  assert.equal(source.licenseUrl, 'https://creativecommons.org/licenses/by-nc-nd/4.0/');
  assert.equal(source.contentUrl, 'https://www.ebi.ac.uk/europepmc/webservices/rest/PMC6604238/fullTextXML');
});

test('SBS sequential route cites a source that specifies the monomer order', async () => {
  const snapshot = JSON.parse(await fs.readFile('public-data/wop-publication-snapshot-v2/snapshot.json', 'utf8'));
  const polymer = snapshot.polymers.find(item => item.wopId === 'wop-000166');
  const route = polymer.synthesisRoutes[0];
  assert.ok(route.sourceIds.includes('sbs-sequential-route-us20120208909'));
  assert.ok(route.steps.every(step => step.sourceIds.includes('sbs-sequential-route-us20120208909')));
  assert.ok(!route.sourceIds.includes('sbs-living-diblock-coupling-us8349950'));
  assert.match(route.steps[2].body, /further styrene charge/i);
});

test('benzoguanamine processing figure identifies its substituted research example', async () => {
  const snapshot = JSON.parse(await fs.readFile('public-data/wop-publication-snapshot-v2/snapshot.json', 'utf8'));
  const polymer = snapshot.polymers.find(item => item.wopId === 'wop-000121');
  const context = polymer.contextualStructures.processing;
  assert.equal(context.items[0].structureId, 'tetramethylol-ortho-hydroxybenzoguanamine-example');
  assert.match(context.scopeNote, /separate research example/i);
  assert.match(context.scopeNote, /presence.*not established/i);
  assert.match(context.scopeNote, /cured network.*not depicted/i);
  assert.ok(context.sourceIds.includes('giori-yamauchi-hydroxybenzoguanamine-nasa-1977'));
});

test('cellulose mixed-anhydride routes cite their own methods', async () => {
  const snapshot = JSON.parse(await fs.readFile('public-data/wop-publication-snapshot-v2/snapshot.json', 'utf8'));
  for (const [id, selected, alternative] of [
    ['wop-000192', 'cab-ambrosio-silica-stationary-phase-2025', 'cab-wuxi-cotton-linter-patent-2013'],
    ['wop-000193', 'cap-daicel-ep0822201-patent-2003', 'cap-ruijia-solid-acid-patent-2020'],
  ]) {
    const entry = snapshot.polymers.find(item => item.wopId === id);
    const route = entry.synthesisRoutes[0];
    assert.ok(entry.sources.some(source => source.sourceId === alternative));
    for (const item of [route, ...route.steps]) {
      assert.ok(item.sourceIds.includes(selected));
      assert.ok(!item.sourceIds.includes(alternative));
    }
  }
});

test('PAEK family example distinguishes PEEK reference from the selected route', async () => {
  const snapshot = JSON.parse(await fs.readFile('public-data/wop-publication-snapshot-v2/snapshot.json', 'utf8'));
  const entry = snapshot.polymers.find(item => item.wopId === 'wop-000081');
  const review = entry.sources.find(item => item.doi === '10.3390/polym15193943');
  assert.match(review.citation, /Korycki/);
  assert.match(entry.synthesisRoutes[0].productNote, /not an identified product/i);
  assert.ok(!entry.synthesisRoutes[0].sourceIds.includes('paek-electrophilic-preparation-patent-1987'));
});

test('sulfonated PEEK fragment leaves chain-wide substitution open', async () => {
  const snapshot = JSON.parse(await fs.readFile('public-data/wop-publication-snapshot-v2/snapshot.json', 'utf8'));
  const polymer = snapshot.polymers.find(item => item.wopId === 'wop-000235');
  const id = 'speek-sulfonated-open-local-fragment';
  const definition = snapshot.chemicalStructures.find(item => item.structureId === id);
  assert.equal(validateV3000Molfile(definition.molfileV3000, { structureId: id }).groups.length, 0);
  assert.ok(polymer.structuralDepictions.items.some(item => item.structureId === id));
  assert.ok(polymer.synthesisRoutes[0].products.some(item => item.structureId === id));
  assert.match(polymer.synthesisRoutes[0].productNote, /do not specify chain-wide sulfonation degree/i);
});

test('interfacial polyester-carbonate route does not claim PET as its product', async () => {
  const snapshot = JSON.parse(await fs.readFile('public-data/wop-publication-snapshot-v2/snapshot.json', 'utf8'));
  const entry = snapshot.polymers.find(item => item.wopId === 'wop-000072');
  const route = entry.synthesisRoutes[0];
  assert.ok(entry.structuralDepictions.items.some(item => item.structureId === 'polyethylene-terephthalate-sru'));
  assert.ok(!route.products.some(item => item.structureId === 'polyethylene-terephthalate-sru'));
  assert.match(route.productNote, /separate PET\/polycarbonate transesterification example/i);
  assert.ok(!route.sourceIds.includes('polyester-pc-block-ep3406648'));
});

test('PC/ABS blend uses bounded open ABS examples and a melt-compounding route', async () => {
  const snapshot = JSON.parse(await fs.readFile('public-data/wop-publication-snapshot-v2/snapshot.json', 'utf8'));
  const entry = snapshot.polymers.find(item => item.wopId === 'wop-000258');
  const ids = entry.structuralDepictions.items.map(item => item.structureId);
  assert.deepEqual(ids, ['bisphenol-a-polycarbonate-sru', 'san-styrene-acrylonitrile-local-segment', 'abs-butadiene-rich-local-segment']);
  for (const id of ids.slice(1)) {
    const definition = snapshot.chemicalStructures.find(item => item.structureId === id);
    assert.equal(validateV3000Molfile(definition.molfileV3000, { structureId: id }).groups.length, 0);
  }
  const route = entry.synthesisRoutes[0];
  assert.match(route.title, /melt-compounded/i);
  assert.match(route.productNote, /MBS modifier.*not depicted/i);
});

test('corn starch route does not cite a separate cassava process', async () => {
  const snapshot = JSON.parse(await fs.readFile('public-data/wop-publication-snapshot-v2/snapshot.json', 'utf8'));
  const entry = snapshot.polymers.find(item => item.wopId === 'wop-000201');
  const alternative = 'starch-cassava-recovery-us3029168';
  assert.ok(entry.sources.some(source => source.sourceId === alternative));
  for (const item of [entry.synthesisRoutes[0], ...entry.synthesisRoutes[0].steps]) {
    assert.ok(!item.sourceIds.includes(alternative));
  }
});

test('glycidylamine route distinguishes different cited amine substrates', async () => {
  const snapshot = JSON.parse(await fs.readFile('public-data/wop-publication-snapshot-v2/snapshot.json', 'utf8'));
  const entry = snapshot.polymers.find(item => item.wopId === 'wop-000102');
  const route = entry.synthesisRoutes[0];
  assert.deepEqual(route.sourceIds, ['glycidylamine-shell-2951822']);
  assert.match(route.scopeNote, /4,4′-diaminodiphenylmethane.*N-alkylated m-xylylenediamine.*separate alternative/i);
  assert.match(route.productNote, /four oxirane stereocenters.*unspecified/i);
  const figureSources = entry.contextualStructures.feedstocksAndSynthesis.sourceIds;
  assert.ok(figureSources.includes('nist-epichlorohydrin-finite'));
  assert.ok(figureSources.includes('seo-tgddm-nasa-figure'));
});

test('polycarbonate–siloxane route cites its staged feed sequence', async () => {
  const snapshot = JSON.parse(await fs.readFile('public-data/wop-publication-snapshot-v2/snapshot.json', 'utf8'));
  const entry = snapshot.polymers.find(item => item.wopId === 'wop-000071');
  const route = entry.synthesisRoutes[0];
  assert.ok(entry.sources.some(source => source.sourceId === 'pc-siloxane-composition-us20240018353'));
  for (const item of [route, ...route.steps]) {
    assert.ok(item.sourceIds.includes('pc-siloxane-block-us5530083'));
    assert.ok(!item.sourceIds.includes('pc-siloxane-composition-us20240018353'));
  }
});

test('CMC examples identify the illustrated substitution and separate acid form', async () => {
  const snapshot = JSON.parse(await fs.readFile('public-data/wop-publication-snapshot-v2/snapshot.json', 'utf8'));
  const entry = snapshot.polymers.find(item => item.wopId === 'wop-000200');
  assert.ok(entry.structuralDepictions.items.every(item => /at C3/i.test(item.caption)));
  assert.match(entry.synthesisRoutes[0].productNote, /acid-form fragment.*separate family form/i);
  assert.match(entry.synthesisRoutes[0].productNote, /not identified as a product/i);
});

test('PVC route sources match chlorination and finished formulations', async () => {
  const snapshot = JSON.parse(await fs.readFile('public-data/wop-publication-snapshot-v2/snapshot.json', 'utf8'));
  for (const [id, unrelated] of [
    ['wop-000024', 'cpvc-bfgoodrich-5216088'],
    ['wop-000260', 'upvc-vcm-suspension-polymerization-us3488328'],
    ['wop-000261', 'plasticizedpvc-ashland-4526946'],
  ]) {
    const entry = snapshot.polymers.find(item => item.wopId === id);
    assert.ok(entry.sources.some(source => source.sourceId === unrelated));
    for (const item of [entry.synthesisRoutes[0], ...entry.synthesisRoutes[0].steps]) {
      assert.ok(!item.sourceIds.includes(unrelated));
    }
  }
});

test('ethylene–octene example separates the vanadium review from its metallocene route', async () => {
  const snapshot = JSON.parse(await fs.readFile('public-data/wop-publication-snapshot-v2/snapshot.json', 'utf8'));
  const entry = snapshot.polymers.find(item => item.wopId === 'wop-000165');
  assert.ok(entry.sources.some(source => source.sourceId === 'eto-bialek-fryga-2021'));
  for (const item of [entry.synthesisRoutes[0], ...entry.synthesisRoutes[0].steps]) {
    assert.ok(!item.sourceIds.includes('eto-bialek-fryga-2021'));
    assert.ok(item.sourceIds.includes('eto-borealis-2933277'));
  }
});

test('PTFE route and CSPE precursor retain their distinct process scopes', async () => {
  const snapshot = JSON.parse(await fs.readFile('public-data/wop-publication-snapshot-v2/snapshot.json', 'utf8'));
  const ptfe = snapshot.polymers.find(item => item.wopId === 'wop-000089');
  assert.ok(ptfe.sources.some(source => source.sourceId === 'ptfe-aqueous-dispersion-us5403900'));
  for (const item of [ptfe.synthesisRoutes[0], ...ptfe.synthesisRoutes[0].steps]) {
    assert.ok(!item.sourceIds.includes('ptfe-aqueous-dispersion-us5403900'));
  }
  const cspe = snapshot.polymers.find(item => item.wopId === 'wop-000156');
  assert.match(cspe.contextualStructures.feedstocksAndSynthesis.scopeNote, /uses prechlorinated polyethylene/i);
});

test('polysulfone family route selects an accessible BPA oligomer example', async () => {
  const snapshot = JSON.parse(await fs.readFile('public-data/wop-publication-snapshot-v2/snapshot.json', 'utf8'));
  const entry = snapshot.polymers.find(item => item.wopId === 'wop-000252');
  const route = entry.synthesisRoutes[0];
  assert.deepEqual(route.sourceIds, ['dizman-psu-oligomer-2010']);
  assert.match(route.scopeNote, /oligomer preparation/i);
  assert.match(route.productNote, /separate family references/i);
  assert.ok(route.steps.every(step => step.sourceIds.includes('dizman-psu-oligomer-2010')));
});

test('PPE–polystyrene blend cites the foundational procedure and distinct structures', async () => {
  const snapshot = JSON.parse(await fs.readFile('public-data/wop-publication-snapshot-v2/snapshot.json', 'utf8'));
  const entry = snapshot.polymers.find(item => item.wopId === 'wop-000259');
  assert.deepEqual(entry.structuralDepictions.items.map(item => item.structureId), ['poly-2-6-dimethyl-phenylene-ether-sru', 'polystyrene-sru']);
  assert.ok(entry.sources.some(source => source.sourceId === 'modified-ppe-ps-blend-process-patent-2000'));
  assert.ok(!entry.synthesisRoutes[0].sourceIds.includes('modified-ppe-ps-blend-process-patent-2000'));
});

test('polyphthalamide salt-only source is not used for subsequent polymerization', async () => {
  const snapshot = JSON.parse(await fs.readFile('public-data/wop-publication-snapshot-v2/snapshot.json', 'utf8'));
  const entry = snapshot.polymers.find(item => item.wopId === 'wop-000066');
  const route = entry.synthesisRoutes[0];
  assert.ok(route.steps[0].sourceIds.includes('ppa-aromatic-nylon-salt-ep0411790'));
  assert.ok(route.steps.slice(1).every(step => !step.sourceIds.includes('ppa-aromatic-nylon-salt-ep0411790')));
  assert.ok(route.steps.slice(1).every(step => step.sourceIds.includes('ppa-salt-polycondensation-us5550208')));
});

test('cycloepoxy and polyisoprene routes retain source-specific limits', async () => {
  const snapshot = JSON.parse(await fs.readFile('public-data/wop-publication-snapshot-v2/snapshot.json', 'utf8'));
  const cyclo = snapshot.polymers.find(item => item.wopId === 'wop-000103').synthesisRoutes[0];
  assert.ok(!cyclo.sourceIds.includes('cycloepoxy-henkel-2016119848'));
  assert.match(cyclo.scopeNote, /peracetic acid/i);
  const isoprene = snapshot.polymers.find(item => item.wopId === 'wop-000253');
  assert.match(isoprene.synthesisRoutes[0].productNote, /does not specify its cis fraction/i);
  assert.doesNotMatch(isoprene.sections.feedstocksAndSynthesis, /high-cis rubber/i);
  assert.ok(isoprene.sources.some(source => source.sourceId === 'fetters-isoprene-nist-1965'));
});

test('fluoropolymer family caption distinguishes a shown local adjacency from chain sequence', async () => {
  const snapshot = JSON.parse(await fs.readFile('public-data/wop-publication-snapshot-v2/snapshot.json', 'utf8'));
  const entry = snapshot.polymers.find(item => item.wopId === 'wop-000254');
  const item = entry.structuralDepictions.items.find(item => item.structureId === 'vdf-hfp-local-chain-segment');
  assert.match(item.caption, /local VDF\/HFP adjacency/i);
  assert.match(item.caption, /chain-wide sequence beyond this segment/i);
});

test('thermotropic copolyester depicts open constituents and sources the selected route', async () => {
  const snapshot = JSON.parse(await fs.readFile('public-data/wop-publication-snapshot-v2/snapshot.json', 'utf8'));
  const entry = snapshot.polymers.find(item => item.wopId === 'wop-000051');
  assert.deepEqual(entry.structuralDepictions.items.map(item => item.structureId), [
    'lcp-hydroxybenzoate-open-residue', 'lcp-hydroxynaphthoate-open-residue',
  ]);
  for (const item of entry.structuralDepictions.items) {
    const structure = snapshot.chemicalStructures.find(candidate => candidate.structureId === item.structureId);
    assert.doesNotMatch(structure.molfileV3000, /BEGIN SGROUP/, 'a constituent is not a separately n-bracketed homopolymer');
    assert.equal((structure.molfileV3000.match(/\s\*\s+[-\d.]/g) || []).length, 2, 'both open continuations remain explicit');
  }
  const route = entry.synthesisRoutes[0];
  assert.deepEqual(route.sourceIds, ['tlcp-hba-hna-in-situ-acetylation-us4429105']);
  assert.match(route.productNote, /without specifying sample composition, chain-wide sequence/i);
  assert.match(route.reagents[0].name, /naphthalenesulfonic acid/i);
});

test('DGEBA example distinguishes para DDS hardener from meta DDS simulation', async () => {
  const snapshot = JSON.parse(await fs.readFile('public-data/wop-publication-snapshot-v2/snapshot.json', 'utf8'));
  const entry = snapshot.polymers.find(item => item.wopId === 'wop-000099');
  const route = entry.synthesisRoutes.find(item => item.routeId === 'dgeba-amine-network');
  assert.ok(route.sourceIds.includes('varganici-dgeba-44dds-cure-2024'));
  assert.match(route.scopeNote, /4,4′-DDS.*3,3′-DDS/s);
  assert.match(route.steps.at(-1).body, /3,3′-DDS.*not a laboratory preparation schedule.*4,4′-DDS/s);
  for (const section of ['feedstocksAndSynthesis', 'mechanicalProperties', 'processing']) {
    assert.match(entry.sections[section], /DGEBA\/3,3′-DDS/);
  }
});

test('polyamide-imide local example remains distinct from the MDI preparation', async () => {
  const snapshot = JSON.parse(await fs.readFile('public-data/wop-publication-snapshot-v2/snapshot.json', 'utf8'));
  const entry = snapshot.polymers.find(item => item.wopId === 'wop-000085');
  const item = entry.structuralDepictions.items[0];
  assert.equal(item.structureId, 'pai-meta-phenylene-open-example');
  const structure = snapshot.chemicalStructures.find(candidate => candidate.structureId === item.structureId);
  assert.doesNotMatch(structure.molfileV3000, /BEGIN SGROUP/);
  assert.equal((structure.molfileV3000.match(/\s\*\s+[-\d.]/g) || []).length, 2);
  const route = entry.synthesisRoutes[0];
  assert.deepEqual(route.sourceIds, ['pai-tma-diisocyanate-us10913249']);
  assert.match(route.productNote, /separate source-supported PAI example.*not depicted/s);
});

test('polyaniline ideal reduced repeat is distinct from oxidative product', async () => {
  const snapshot = JSON.parse(await fs.readFile('public-data/wop-publication-snapshot-v2/snapshot.json', 'utf8'));
  const entry = snapshot.polymers.find(item => item.wopId === 'wop-000242');
  const item = entry.structuralDepictions.items[0];
  assert.equal(item.structureId, 'polyaniline-ideal-leucoemeraldine-repeat');
  assert.match(entry.structuralDepictions.scopeNote, /ideal neutral, fully reduced leucoemeraldine repeat/i);
  assert.match(entry.synthesisRoutes[0].productNote, /not an identification of the oxidation or protonation state/i);
  assert.ok(!snapshot.chemicalStructures.some(candidate => candidate.structureId === 'polyaniline-benzenoid-amine-motif'));
});

test('epoxy novolac illustrations preserve their precise source limitations', async () => {
  const snapshot = JSON.parse(await fs.readFile('public-data/wop-publication-snapshot-v2/snapshot.json', 'utf8'));
  const phenolic = snapshot.polymers.find(item => item.wopId === 'wop-000101');
  const cresol = snapshot.polymers.find(item => item.wopId === 'wop-000110');
  const cases = [
    [phenolic, 'epoxy-cresol-li-fig1-open-motif', 2],
    [cresol, 'novolac-methacrylate-open-side-chain', 1],
  ];
  for (const [entry, id, ends] of cases) {
    const item = entry.contextualStructures.feedstocksAndSynthesis.items[0];
    assert.equal(item.structureId, id);
    const graph = snapshot.chemicalStructures.find(candidate => candidate.structureId === id).molfileV3000;
    assert.doesNotMatch(graph, /BEGIN SGROUP/);
    assert.equal((graph.match(/\s\*\s+[-\d.]/g) || []).length, ends);
  }
  assert.match(phenolic.synthesisRoutes[0].productNote, /separate/i);
  assert.match(cresol.contextualStructures.feedstocksAndSynthesis.scopeNote, /does not show its substitution pattern, novolac backbone/i);
});
