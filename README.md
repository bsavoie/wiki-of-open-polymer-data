# Wiki of Open Polymer Data

[Browse the wiki](https://bsavoie.github.io/wiki-of-open-polymer-data/) ·
[Download the current data snapshot](https://bsavoie.github.io/wiki-of-open-polymer-data/data/wop-publication-snapshot-v2/snapshot.json)

The Wiki of Open Polymer Data is an experiment in using AI as an encyclopedist.
It is an open reference for polymer families and established polymer materials,
built by agents using publicly readable literature. The catalog covers commodity
and engineering plastics, thermosets, elastomers, fibers, natural and
semisynthetic polymers, biodegradable materials, and functional polymers. It is
a curated starting point, not a ranking of worldwide production.

Entries bring together structures, synthesis, mechanical properties, processing,
applications, degradation, and references. Coverage and review status vary:
empty sections and open research questions are intentional. Sources document the
scope of individual claims, and quantitative values retain their material and
measurement conditions. Verify the cited sources and the relevant grade and test
conditions before using the information for a specific application; agent-authored
content can contain errors or omissions.

The repository can be downloaded or forked. Updates are made from time to time
when new models are released or when Brett has spare resets.

## Run locally

Install Node.js 20 or newer and Python 3, then:

```bash
git clone https://github.com/bsavoie/wiki-of-open-polymer-data.git
cd wiki-of-open-polymer-data
npm ci
npm run check
python3 -m http.server 8000 --directory dist
```

Open <http://localhost:8000/>. `npm run check` validates the snapshot and
structures, runs the tests, and builds the static site in `dist/`. For a build
without the full test suite, use `npm run build`. The synthesis route guide
and `/synthesis-preview/` provide a route-review view after building; see
[illustrated synthesis routes](docs/synthesis-routes.md).

## Contributing

Issues and pull requests are welcome. Before proposing a content change, consult
[the research workflow](docs/research-workflow.md) and the repository's
[publication rules](AGENTS.md). Use anonymously accessible sources, cite the
sections they support, preserve stable polymer IDs, and retain material- and
test-specific limitations. A public source is not necessarily openly licensed;
source material keeps its own terms. Do not add private notes, credentials, or
copied figures to public records.

## Project design

The site is generated from a versioned snapshot with schema validation, stable
identifiers, canonical and alias routes, client-side search, and corpus-wide
regression tests. Rendering is static; readers do not need a database or a
chemistry runtime. The core data and its provenance are described below.

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
npm run structures:validate
npm run structures:preview -- wop-000044
npm run structures:review-batch -- A-Z outputs/structure-review/a-z
npm run structures:contact-sheet
npm run structures:update-goldens
npm run structures:coverage
npm run history:validate
npm run import:snapshot -- /absolute/path/to/wop-publication-snapshot-v2
npm run check
```

The original `structures:migrate-v2` command is retired: it reconstructed v2
from the frozen v1 snapshot and historical structure specifications. Current
work must use the authoritative v2 snapshot and the validated import workflow;
the retired command refuses to overwrite it.

`npm test` runs the maintained `test/*.test.mjs` suite. Isolated research and
preview artifacts under `outputs/` are not included in the release test run.

This repository’s GitHub Pages workflow also requires a sanitized structure-audit
release attestation. The audit ledger and readiness scripts are maintainer-local
and are not included in a fresh clone; they are not needed for `npm run check`
or a local preview. Once every current occurrence has independently documented
review and the local audit ledger is ready, maintainers run:

```bash
python3 outputs/structure-audit/check-release-readiness.py
python3 scripts/create-structure-audit-attestation.py
python3 scripts/verify-structure-audit-attestation.py
```

The generator refuses to issue an attestation unless the local readiness gate
passes. On a handled failure, it moves any earlier attestation out of the CI path into
the ignored local `outputs/structure-audit/quarantined-attestations/` directory.
The Git index can still contain a staged copy; stage the deletion before any
commit. The generator does not alter the index.
If that move fails, it warns that the earlier file may still be present and the
release must not proceed. A process termination or failure before the generator
starts cannot perform that quarantine. It writes only a schema version, the exact v2
snapshot hash, a hash of presentation/build inputs, occurrence counts, and a
completion flag to `.github/structure-audit-attestation.json`;
the private ledger and review evidence remain local. Pages CI rejects a missing,
incomplete, malformed, or stale attestation before building or deploying. Test
the clean-checkout release gate with `python3 test/test_structure_audit_attestation.py`.

The attestation is a maintainer assertion, not a cryptographic signature or an
independent check of the underlying scientific and visual evidence. When a
review finding is invalidated without changing snapshot bytes, remove the old
attestation before any release and issue a new one only after re-review. Any
change to the snapshot, regular files under `lib/`, `site-assets/`, or the
published history directory `public-data/structure-history/2026-11-10/`,
`scripts/build.mjs`, `scripts/validate-structure-history.py`, `package.json`, or
`package-lock.json` invalidates the
assertion automatically, as does a change to `.github/workflows/pages.yml` or
the attestation generator, helper, or verifier scripts; symlinks and missing
required inputs fail closed. The input hash detects later changes, but does not
itself prove that the current presentation was reviewed. Run the generator only
when the snapshot, local audit ledger, and presentation inputs are not being
edited concurrently.

Historical structure records from the 10 November 2026 deployment are kept in
the warning-bearing archive under `public-data/structure-history/2026-11-10/`.
Its registry records the old hashes, reasons, and corrected identifiers where
known. These historical records are not current chemical references. The site
build requires Python 3 and validates the archive's members, hashes, and coverage
of changed or withdrawn structures before copying it. The old unversioned download URLs for
withdrawn structures intentionally return 404 on GitHub Pages.

To refresh the archive after a reviewed structure change, update
`scripts/structure-history-reasons.json`, ensure the baseline commit recorded in
the registry is available locally, and generate into a fresh candidate directory:

```bash
python3 scripts/build-structure-history.py --reasons scripts/structure-history-reasons.json --output outputs/history-candidate
python3 scripts/validate-structure-history.py --bundle outputs/history-candidate
```

Review the candidate before replacing the checked-in history directory. The
validator uses the checked-in baseline inventory, so CI does not require the
historical commit to be present in a shallow checkout.

`npm run build` writes the static site to `dist/`. The builder stages a complete
replacement, recognizes prior output by its build marker, and restores the
previous site if replacement fails. Temporary staging directories are cleaned
and ignored rather than retained indefinitely. Concurrent builds targeting the
same output are rejected. A stopped process can leave `.dist.wop-build.lock`;
check that no builder is active before removing an abandoned lock.
The command checks the source snapshot bytes again before swapping the site;
canonical builds also hold the snapshot-import lock through the swap. Direct
external edits that do not use the import protocol are not locked out. A stopped
canonical build can leave `public-data/.wop-publication-snapshot-v2.import.lock`;
check for an active snapshot operation before removing an abandoned lock.

Set `WOP_SITE_URL=https://your-public-host.example/` when building a deployed
copy. A sitemap and absolute robots directive are emitted only when that public
base URL is supplied; local builds intentionally omit an invalid relative
sitemap.

The importer validates the entire incoming snapshot before touching the current
one, verifies the destination ownership marker and stable route lineage, writes
a staged sibling directory, and rolls back a failed swap. Its destination is
fixed to the authoritative public-data directory.

## Research workflow

The [research improvement workflow](docs/research-workflow.md) supports
maintainer-managed questions, qualified evidence, independent review, and
guarded local publication. Use `npm run research -- help` for the commands.
Article maturity does not automatically rise when a question is closed.

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
site. Repository-wide `wop-structure-style-v9` RDKit renderer settings remain
the machine authority for visual styling, with no per-record overrides.

## Licensing

- Code: [Apache-2.0](LICENSE)
- Original prose, tables, and diagrams: [CC BY 4.0](LICENSE-CONTENT)
- Original structured data: [CC0](LICENSE-DATA)
- Bundled Inter font: [SIL Open Font License 1.1](site-assets/inter.LICENSE)

Those licenses apply only to original repository contributions. Linked source
material retains its own copyright and license. The wiki should normally cite
and independently summarize sources rather than reproduce them.
