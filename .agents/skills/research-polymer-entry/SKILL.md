---
name: research-polymer-entry
description: Research, draft, correct, or review Wiki of Open Polymer Data entries using anonymously accessible sources, claim-to-section evidence mapping, polymer-specific scope controls, and the repository validation harness. Use for polymer family articles, processing data, source additions, taxonomy corrections, and stub expansion in this repository.
---

# Research Polymer Entry

Build source-backed polymer coverage without pretending that one grade,
formulation, morphology, or processing history represents an entire family.

## Before editing

Read both references:

- [Source policy](references/source-policy.md) for source eligibility, evidence
  priority, licensing, and quantitative data rules.
- [Record contract](references/record-contract.md) for identity, taxonomy,
  section, source, relationship, and maturity fields.

Inspect the current canonical record and search aliases before adding a new
entry. Prefer improving an existing stub when the proposed name describes the
same scientific scope. Treat a genuinely distinct family, copolymer, network,
or processing-relevant material variant as a separate record and connect it by
relationship when appropriate.

Resolve the edit target by stable `wopId`, not by matching repeated stub text or
array position. After editing, confirm that content and maturity changed only
for the intended identifiers. This check is especially important while many
records still have identical empty section blocks.

## Research loop

1. Define the record boundary: family versus specific polymer, copolymer,
   network, modified polymer, or grade family.
2. Establish names and class placement from an open nomenclature reference,
   open textbook, or public institutional source.
3. Search independently for foundational chemistry; structure and morphology;
   properties; processing; applications; degradation; end-of-life; and safety.
   Do not let one convenient review silently support every section.
4. Capture each source as a typed source record. Record the exact locator,
   access date, access/reuse status, and only the sections it directly supports.
5. Write an independent synthesis. Qualify values by grade/composition,
   specimen state, conditioning, test method, and processing history whenever
   the source does.
   Source-to-section validation cannot detect an overbroad paraphrase: the
   researcher must verify that every sentence stays within the cited material's
   polymer, grade, formulation, and process scope.
6. Leave unresolved sections empty and keep review flags. A visible gap is
   better than unsupported filler.
7. Reopen every exact serialized full-content link anonymously and confirm its
   document identity, revision, and locator. A cached search result is not a
   publication source.
8. Run `npm run validate`, `npm test`, and `npm run build` (or `npm run check`).

For the core Synthesis, Mechanical properties, and Processing tabs, load the
matching specialist skill. Each populated core tab requires two distinct
documents and two declared source lineages; this is a section-level provenance
gate, not proof that every sentence has been independently replicated.

## Maturity decisions

- `stub`: identity and provisional taxonomy only; all prose sections empty.
- `source_backed_draft`: at least one substantive section has direct open-source
  support, but important coverage or synthesis remains incomplete.
- `agent_corrected`: the entry has received a separate correction pass; this
  does not imply comprehensive literature review.
- `open_source_reviewed`: the principal sections and important quantitative
  claims have been checked against appropriate open sources and remaining gaps
  are explicit.

Never upgrade maturity because a source merely mentions the polymer or because
the article has many citations. Evaluate whether the cited passages actually
support the published scope and claims.

Keep `confidence: provisional` when only a narrow slice of the article has been
researched or its family/grade scope has not been checked. `medium` is
appropriate when every populated section has direct evidence and its important
qualifiers have been reviewed. Reserve `high` for an `open_source_reviewed`
entry whose principal claims have appropriate independent corroboration.

Retain `open_sources_needed` until the principal sections required for
`open_source_reviewed` are covered. Retain `processing_data_needed` until the
processing section has scope-appropriate evidence. Add or retain
`grade_variation_not_captured` whenever grade-specific facts appear without a
representative comparison across the record's claimed scope. Clearing a flag is
a review decision, not an automatic consequence of adding one source.

## Publication boundary

Keep research notes, downloaded files, credentials, reviewer identity, and
local paths out of the public snapshot. Do not copy source prose or figures.
Trade names belong only in clearly scoped alternate/search metadata, not as
silent synonyms for an entire family.
