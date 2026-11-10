# Degradation research coverage

Updated 8 September 2026 after the corpus completion pass. All 262 canonical articles expose the
Degradation tab with products and pathways, timescales, environmental persistence,
and reclamation/recycling headings.

The publication contains 262 nonempty degradation sections and 261 nonempty
recycling/end-of-life sections. The initial 7 September pass added 355 source
associations across 241 distinct full-content URLs. The subsequent
[corpus completion pass](completion-research-20260908.md) filled five degradation
and 55 end-of-life sections, alongside health and mechanism research. Sources
include original studies, public reports, theses, patents and manufacturer
technical documents.

These counts measure sourced section population, not complete knowledge of every
product or a validated recycling technology for every material. Many populated
sections explicitly state that molecular-product identification, ambient
mineralization, or a specific recovery route remains unresolved. Laboratory and
accelerated tests retain their conditions and endpoints; no universal
environmental lifetime is inferred. Patent scope and supplier reports are
distinguished from demonstrated or established processes.

## Current coverage by initial research batch

| Batch | Entries | Degradation | Recycling/end of life |
| --- | ---: | ---: | ---: |
| thermoplastics | 66 | 66 | 66 |
| engineering | 38 | 38 | 38 |
| networks-rubbers | 83 | 83 | 82 |
| bio-specialty | 75 | 75 | 75 |

## Unpopulated fields

The following are explicit research gaps, not assertions that no degradation or
recycling technology exists. Narrow variants do not inherit evidence from a
different polymer without an explicit scope statement. Additional gaps within
otherwise populated sections remain visible in the article prose.

| Stable identity | Polymer | Empty fields |
| --- | --- | --- |
| wop-000130 | Phthalonitrile resin | Reclamation and recycling |

## Authoring and validation

The [authoring contract](degradation.md) defines the required topic labels and
evidence boundaries. The [initial curated batches](../scripts/curated-degradation/README.md)
and [completion supplements](../scripts/curated-completion-20260908/README.md)
record the two research passes into the v2 input. Both preserve stable
identities, existing sources, chemical structures and the frozen v1 snapshot.
The completion report describes the additional health and mechanism edits.

Validation includes the snapshot and source schema, all 243 chemical structures,
strict structure coverage, the 51-test suite and a build of all 262 pages. Browser
checks cover the selected tab, citation navigation, preserved section deep links,
the explicit gaps on an initially empty Degradation tab, and a 390 px layout without
horizontal page overflow. All built article routes have the four requested topic
headings and unique section anchors.
