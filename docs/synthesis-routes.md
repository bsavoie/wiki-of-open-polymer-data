# Illustrated synthesis routes

The optional `synthesisRoutes` array extends the v2 article record. The
publication snapshot remains authoritative. Route diagrams compose existing
V3000 assets and HTML arrows; they do not change the chemical renderer, infer
connection tables or encode an atom-mapped mechanism.

Each route contains:

- `routeId`, `title`, `basis`, `scopeNote`, `sourceIds`;
- `inputs` and `products`: non-empty arrays of `{label, structureId?}`;
- `reagents`: `{name, role, detail, structureId?}` records;
- `conditions` and `mechanism`: source-backed text;
- `steps`: ordered `{title, body, sourceIds}` records;
- `limitations`: a visible statement of the example and diagram boundaries.

`basis` is `patent_example`, `laboratory_example`, or `representative_route`.
Supported reagent roles are `initiator`, `catalyst`, `ligand`, `reductant`,
`crosslinker`, `chain_transfer_agent`, `emulsifier`, `medium`, and `additive`.
An empty reagent array is allowed when no auxiliary reagent is called for.
A stoichiometric base can be an `additive` with its function stated explicitly;
do not call it a catalyst merely to fit a label.

Every source named by a route or step must support `feedstocksAndSynthesis`.
Step sources must belong to that route. Every referenced structure must also
have an article depiction item, complete caption and alt text, and structural
evidence through the existing hero/contextual contract. A compound database
can establish reagent connectivity; it cannot establish the reagent's role in
a polymerization. A textual product is appropriate for a sourced network
boundary when a finite diagram would falsely specify one topology.

## Reusable authoring workflow

1. Read the polymer entry, synthesis and structure skills and their references.
   Resolve the article by stable `wopId` and inspect the current record.
2. Choose one source-defined route or exact experimental/patent example. Keep
   family context supported by two independent lineages. Open the cited full
   text; verify all quantities, temperature/pressure bases and reagent roles.
3. Independently verify molecular connectivity, author/review in Ketcher, and
   export V3000. Preserve the exported coordinates and review the rendered
   chemical assets. Connectivity strings may serve as verified editor inputs;
   they are never the canonical publication format.
4. `scripts/import-synthesis-components.mjs` can split a reviewed Ketcher export
   of disconnected finite molecules into candidate definitions, preserving
   coordinates. It rejects S-groups, collections and wrapped records; use the
   existing structure workflow for polymers, Markush chemistry and stereo.
   For salts, keep the entire ionic structure together; do not use this splitter
   to separate a counterion from its molecular partner.
5. `scripts/synthesis-authoring.mjs` supplies item, participant, reagent, source
   and step constructors plus a validated atomic snapshot save. Its `save`
   function checks the intended IDs and detects concurrent snapshot edits.
   Helper constructors do not replace chemical or source review.
6. Add monomers/precursors to `contextualStructures.feedstocksAndSynthesis`.
   A hardener may stay in `contextualStructures.processing` while a synthesis
   route references it to explain network formation. Keep actual shaping and
   cure schedules in Processing.
7. Build and inspect the article synthesis tab and single-entry structure
   preview. Test citations, caption scope, downloads and small screens. Correct
   the source record or shared presentation, never a generated SVG or molfile.
8. Run `npm run check`, `npm run structures:contact-sheet`, and review the
   affected structures. Repeat on the next article, carrying forward fixes.

`/synthesis-preview/` is a generated review page with links to every article
that has routes, plus desktop, tablet and phone iframe widths. The articles use
the tabbed article profile. The review page declares `noindex` and does not
change catalog routes or stable identifiers.

## Five-cycle pilot, 2026-09-04

| Cycle | Article | Test and resulting refinement |
| --- | --- | --- |
| 1 | ABS, `wop-000033` | Preserved the patent's styrene-containing rubber feed and distinction between graft concentrate and final ABS. Displayed radical initiator chemistry, staged feeds and separately sourced blending. |
| 2 | Polystyrene, `wop-000030` | Reused the styrene definition and tested a simple monomer-to-SRU scheme. Selected the no-pentane patent example. Enabled the same article tabs for route-bearing entries; scoped the existing hero-figure test to the hero. Removed an ambiguous duplicate product plus from ABS. |
| 3 | PMMA, `wop-000038` | Separated initiator, copper catalyst, ligand and reducing-agent roles. Preserved E4 conditions and the source's unreported ascorbic-acid split. Added a family-context heading after the route. |
| 4 | PET, `wop-000044` | Distinguished methanol from glycol removal and assigned catalysts to the correct stages. Retained elemental-ppm and pressure bases; kept the acid route out of the DMT procedure. |
| 5 | DGEBA epoxy, `wop-000099` | Separated precursor manufacture from network formation. Reused the existing DGEBA molecule and explicitly drew the DDS hardener. Preserved the absence of a unique cured repeat; excluded simulated post-cure schedules from experimental instructions. |

The pilot adds six route records and twelve finite reagent structures. Existing
polymer structures, identities, slugs, maturity and non-synthesis prose are
preserved. These are sourced procedure outlines. Graft topology, atom-mapped
electron-flow mechanisms, complete laboratory SOPs and a fully specified PMMA
reducing-agent split are not claimed as completed work.

## Corpus route authoring

`scripts/curated-synthesis/routes-*.mjs` contains the reviewed route outlines
for the 257 articles beyond the five pilot articles. `assemble.mjs` resolves
stable article IDs, reuses reviewed structure items with their source mappings,
and attaches independently reviewed finite feedstocks. It refuses an existing
route target and is an authoring helper, not part of the publication build.
The snapshot remains the authoritative record after authoring; later changes
must be applied there and validated with `synthesis-authoring.mjs`.

Two optional route fields support bounded product figures:

- `productMode`: `products` (default behavior) or `structural_reference`.
- `productNote`: a non-empty visible scope note, required for
  `structural_reference`.

Use the reference mode for unit sets, family examples, component sets, and
network motifs. The renderer omits plus signs between those reference cards
and labels them as structural references. A named textual product is valid when
the available chemical evidence cannot define a single structure. Finite
precursors must not replace a cured-polymer header. New finite feedstocks
require their own connectivity evidence; synthesis sources establish their
reaction role separately.

The corpus contact sheet and bracket-intersection regression test cover every
canonical drawing and SRU group. The review page at `/synthesis-preview/`
provides searchable navigation across every route-bearing article. Preserve
the five pilot examples when expanding the helper; additional broad outlines
do not supersede their narrower experimental or patent detail.
