# Wiki of Open Polymer Data

Illustrated synthesis routes and the five-article pilot are documented in
[the synthesis route guide](docs/synthesis-routes.md). After building, open
`/synthesis-preview/` to compare the articles and their phone/tablet layouts.

Wiki of Open Polymer Data is a completeness-first public reference for polymer
families and established polymer materials. It begins with a broad catalog of
research stubs and is designed for later agents to strengthen one section at a
time using sources that anyone can read: open textbooks, public lecture notes,
open journals, institutional references, public reports, research-group notes,
expert technical writing, patents, and public manufacturer documents.

The initial catalog intentionally favors coverage over false precision. Its 262
entries include major commodity plastics, engineering and high-performance
thermoplastics, thermosets, elastomers, fibers, natural and semisynthetic
polymers, degradable and biomedical polymers, and functional materials. This is
a curated high-priority seed set, not a claimed worldwide production ranking.

## What was adapted

The linked Wiki of Open Reactions project contributed the useful shape of the
harness: a versioned public snapshot, strict schema validation, stable IDs,
atomic imports, canonical and alias routes, a reader-side dependency-free
static build, search, a sitemap, maturity labels, and full-corpus regression
tests.

Reaction-specific machinery was deliberately left behind: Markush reaction
schemes, mechanisms, electron-flow campaigns, SMILES rendering, procedure
policies, and reaction example evidence grades do not belong in this project.
This repository adds a polymer-specific taxonomy and a stricter rule that every
populated prose section must point to open supporting sources.

## Snapshot and structure contract

The authoritative input is
`public-data/wop-publication-snapshot-v2/snapshot.json`. The frozen v1 snapshot
remains in the repository and continues to be published at its versioned data
URL; `public-data/wop-publication-snapshot-v1/snapshot.sha256` and the test suite
enforce its byte-for-byte freeze. The v2 top-level fields are:

- `schema`: fixed to `wop-publication-snapshot-v2`.
- `methodology`: the seed-selection scope, limitations, source standard, and
  open methodology sources.
- `chemicalStructures`: reusable, stable MDL V3000 connection tables.
- `polymers`: canonical family/material records with stable WOP IDs.
- `aliases`: unambiguous one-hop route aliases.
- `searchTerms`: ambiguous, umbrella, or application terms used only in search.

Each polymer record separates identity and provisional taxonomy from sourced
article content. A new `stub` has empty article sections, no article sources,
`provisional` confidence, and an `open_sources_needed` review flag. Later
maturity states are `source_backed_draft`, `agent_corrected`, and
`open_source_reviewed`.

Article sections cover overview, history, nomenclature, feedstocks and synthesis,
mechanical properties, processing, structure and morphology, thermal and other
properties, applications, degradation and stability, recycling and end of
life, health/safety/regulation, and limitations and variability. Overview,
history, synthesis, mechanical properties, processing, applications, degradation, and references appear
as progressively enhanced tabs on every canonical polymer route, including
empty stubs; without JavaScript, every panel remains readable. History
distinguishes discovery or first synthesis from commercialization, traces
researchers and companies, and describes changes in major uses. Natural
polymers have histories of use and scientific discovery rather than invention
dates. Variant entries distinguish family milestones from their own history.
See [history authoring](docs/history.md) for evidence scope and batch updates.

The Applications tab groups products and industries, purchasing forms and
channels, and scale with evidence limits. Reported consumption, production,
supplier sales, plant capacity, and package sizes retain their distinct scope;
missing tonnage is labeled explicitly. See [applications authoring](docs/applications.md).

The Degradation tab brings together `degradationAndStability` and
`recyclingAndEndOfLife`, retaining their separate source mappings and existing
fragment links. It covers products and pathways, condition-qualified timescales,
environmental persistence, and reclamation or recycling. Fragmentation,
dissolution, property loss, and mineralization are distinct endpoints;
accelerated aging, biomedical resorption, and chemical recycling conditions
must not be presented as ambient environmental lifetimes. Named paragraph
prefixes in degradation prose become topic headings; older unstructured prose
and empty stubs remain readable. See [the authoring guide](docs/degradation.md)
and [research coverage and remaining gaps](docs/degradation-coverage.md).

The [8 September corpus completion report](docs/completion-research-20260908.md)
records the subsequent health, end-of-life and synthesis-mechanism research pass.

Sources are typed records with a full-content URL, pinpoint, access date,
access status, reuse status, and exact supported sections. A non-empty section
without a supporting source is a schema error.

Every polymer also has a `structuralDepictions` review record. It identifies
the representation type, visible scope limit, supporting article sources, and
ordered depiction items. Exact repeat units, stereochemical segments,
copolymer unit sets, network fragments, blend components, representative
family motifs, and honest no-unique-repeat cases are distinguished explicitly.
Optional `contextualStructures` put finite monomers and precursors in the
synthesis tab and curing agents or crosslinkers in the processing tab, instead
of presenting them as the polymer itself in the article hero. Source-bounded
Markush motifs may express a variable family scaffold when every `R` or
numbered R-group label is defined in visible notation.
V3000 is canonical; SVG and downloadable `.mol` files are deterministic build
products. Pinned RDKit JS renders them during the staged build, and no
chemistry JavaScript or WebAssembly is shipped to readers.

## Commands

```bash
npm run validate
npm test
npm run build
npm run coverage
npm run structures:migrate-v2
npm run structures:validate
npm run structures:preview -- wop-000044
npm run structures:review-batch -- A-Z outputs/structure-review/a-z
npm run structures:contact-sheet
npm run structures:update-goldens
npm run structures:coverage
npm run import:snapshot -- /absolute/path/to/wop-publication-snapshot-v2
npm run check
```

`npm run build` writes the static site to `dist/`. The builder stages a complete
replacement, recognizes prior output by its build marker, and restores the
previous site if replacement fails. Temporary staging directories are cleaned
and ignored rather than retained indefinitely.

Set `WOP_SITE_URL=https://your-public-host.example/` when building a deployed
copy. A sitemap and absolute robots directive are emitted only when that public
base URL is supplied; local builds intentionally omit an invalid relative
sitemap.

The importer validates the entire incoming snapshot before touching the current
one, verifies the destination ownership marker and stable route lineage, writes
a staged sibling directory, and rolls back a failed swap. Its destination is
fixed to the authoritative public-data directory.

## Research workflow

The [research improvement workflow](docs/research-workflow.md) connects the
public question queue, section-specific reader requests, qualified evidence
tables, independent review and guarded local publication. Use
`npm run research -- help` for the commands. Progress counts distinguish
populated sections, structured evidence, current or stale section reviews,
and resolved or access-limited research attempts. Article maturity does not
automatically rise when a question is closed.

The repository-local skill at
`.agents/skills/research-polymer-entry/SKILL.md` describes the research and
publication loop. Select an existing stub before creating an overlapping entry,
research the major sections in separate source passes, capture exact pinpoints,
keep grade-specific data qualified, leave unresolved sections empty, and update
maturity conservatively.

Three specialist skills make the core route tabs independently researchable:
`research-polymer-synthesis`, `research-polymer-mechanical-properties`, and
`research-polymer-processing`. Each requires two distinct documents and source
lineages for its tab and adds attribute-specific checks for route scope,
measurement conditions, and grade-bound processing windows.

`.agents/skills/research-polymer-structure/SKILL.md` governs structure-specific
scientific decisions and evidence. Ketcher is the reference external curator
for coordinate-bearing V3000 and SRU/COP S-groups; it is not embedded in the
site. Repository-wide `wop-structure-style-v5` RDKit renderer settings remain
the machine authority for visual styling, with no per-record overrides.

## Licensing

- Code: Apache-2.0 (`LICENSE`)
- Original prose and diagrams: CC BY 4.0 (`LICENSE-CONTENT`)
- Original structured data: CC0 (`LICENSE-DATA`)
- Bundled Inter font: SIL Open Font License 1.1 (`site-assets/inter.LICENSE`)

Those licenses apply only to original repository contributions. Linked source
material retains its own copyright and license. The wiki should normally cite
and independently summarize sources rather than reproduce them.
