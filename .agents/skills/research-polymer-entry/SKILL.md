---
name: research-polymer-entry
description: Research or revise Wiki of Open Polymer Data entries with open sources and polymer-specific scope controls.
---

# Research Polymer Entry

Build broad, source-backed polymer coverage efficiently. The default workflow
is a completeness-first population pass: fill useful sections from multiple
open sources, label narrow examples honestly, and leave systematic evidence
hardening to later review agents.

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

## Working modes

Use a **population pass** unless the user explicitly asks for correction,
verification, or publication hardening. In a population pass:

- prioritize the three core tabs: Synthesis, Mechanical properties, and
  Processing;
- use at least two accessible documents from two source lineages for each
  populated core tab;
- prefer complementary sources—family context plus measured or operating data
  when readily available—and map each source only to the tabs it actually
  supports rather than defaulting every source to all three;
- write a compact family-level account plus useful bounded examples;
- retain review flags and `source_backed_draft` maturity rather than delaying
  coverage for exhaustive corroboration.

A **hardening pass** may later audit every quantitative qualifier, resolve
conflicts, replace fragile links, broaden grade coverage, and raise maturity.
Do not silently turn an ordinary population request into that heavier mode.
When such a pass is explicitly requested, use the staged
[hardening roadmap](references/hardening-roadmap.md) rather than adding its
checks to ordinary population work.

## Population loop

1. Define the record boundary: family versus specific polymer, copolymer,
   network, modified polymer, or grade family.
2. Establish names and class placement from an open nomenclature reference,
   open textbook, or public institutional source.
3. Search independently for synthesis, mechanical behavior, and processing.
   For mechanics and processing, prefer at least one data-bearing paper,
   dataset, thesis, or technical document when one is readily available. Other
   sections may remain empty unless they are in scope for the request.
4. Capture each source as a typed source record. Record the exact locator,
   access date, access/reuse status, and only the sections it directly supports.
   A source may support all three core tabs, but do not assign all three merely
   because the document mentions the polymer broadly.
5. Write an independent synthesis. Preserve the qualifiers needed to avoid
   presenting a named grade, formulation, test, or processing trial as a
   universal family value. Aim for at least one concrete attribute or bounded
   example in each tab when the sources provide one. If they do not, say what
   useful evidence was found without holding back the draft. A population pass
   does not require an inventory of every field the source leaves unreported.
6. Leave unresolved sections empty and keep review flags. A visible gap is
   better than unsupported filler.
7. Open each new full-content link at least once without an account and confirm
   that it contains the cited material. Replace login-only, paywalled, or dead
   links; no separate access receipt is required for a population pass.
8. Run `npm run validate`, `npm test`, and `npm run build` (or `npm run check`).

For the core tabs, load the matching specialist skill. The two-document,
two-lineage rule is a breadth floor, not a demand that every sentence or number
be independently replicated.

## Maturity decisions

For tracked research questions, quantitative evidence extraction or independent
review, use the [research improvement workflow](../../../docs/research-workflow.md).
It preserves attempts and outcomes and publishes hash-bound reviewed proposals.
This does not add a whole-article hardening requirement to ordinary population
work. Resolve the scoped question and retain broader limitations separately.

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

Keep `confidence: provisional` when even the populated tabs are narrow or
uncertain. `medium` is appropriate for a multi-source population pass whose
three core tabs are directly supported and plainly scoped. Reserve `high` for
an `open_source_reviewed` entry.

During a population pass, normally retain `open_sources_needed`,
`processing_data_needed`, `property_data_needed`, and
`grade_variation_not_captured`. Those flags invite future expansion; they do
not mean the populated draft failed.

## Publication boundary

Keep research notes, downloaded files, credentials, reviewer identity, and
local paths out of the public snapshot. Do not copy source prose or figures.
Trade names belong only in clearly scoped alternate/search metadata, not as
silent synonyms for an entire family.
