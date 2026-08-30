# Wiki of Open Polymer Data

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
atomic imports, canonical and alias routes, a dependency-free static build,
search, a sitemap, maturity labels, and full-corpus regression tests.

Reaction-specific machinery was deliberately left behind: Markush reaction
schemes, mechanisms, electron-flow campaigns, SMILES rendering, procedure
policies, and reaction example evidence grades do not belong in this project.
This repository adds a polymer-specific taxonomy and a stricter rule that every
populated prose section must point to open supporting sources.

## Snapshot contract

The authoritative input is
`public-data/wop-publication-snapshot-v1/snapshot.json`. Its top-level fields are:

- `schema`: fixed to `wop-publication-snapshot-v1`.
- `methodology`: the seed-selection scope, limitations, source standard, and
  open methodology sources.
- `polymers`: canonical family/material records with stable WOP IDs.
- `aliases`: unambiguous one-hop route aliases.
- `searchTerms`: ambiguous, umbrella, or application terms used only in search.

Each polymer record separates identity and provisional taxonomy from sourced
article content. A new `stub` has empty article sections, no article sources,
`provisional` confidence, and an `open_sources_needed` review flag. Later
maturity states are `source_backed_draft`, `agent_corrected`, and
`open_source_reviewed`.

Article sections cover overview, nomenclature, feedstocks and synthesis,
mechanical properties, processing, structure and morphology, thermal and other
properties, applications, degradation and stability, recycling and end of
life, health/safety/regulation, and limitations and variability. Synthesis,
mechanical properties, and processing appear as progressively enhanced tabs on
every canonical polymer route; without JavaScript, all three remain readable.

Sources are typed records with a full-content URL, pinpoint, access date,
access status, reuse status, and exact supported sections. A non-empty section
without a supporting source is a schema error.

## Commands

```bash
npm run validate
npm test
npm run build
npm run coverage
npm run import:snapshot -- /absolute/path/to/wop-publication-snapshot-v1
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

## Licensing

- Code: Apache-2.0 (`LICENSE`)
- Original prose and diagrams: CC BY 4.0 (`LICENSE-CONTENT`)
- Original structured data: CC0 (`LICENSE-DATA`)

Those licenses apply only to original repository contributions. Linked source
material retains its own copyright and license. The wiki should normally cite
and independently summarize sources rather than reproduce them.
