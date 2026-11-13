# Focused polymer gaps and Applications review — 12 November 2026

This pass follows the [initial ingestion](electronic-polymers-20261112.md)
and [second enrichment](electronic-polymers-enrichment-20261112.md). Three
Terra agents researched mechanical, recovery and safety evidence in parallel,
then divided Applications work and cross-reviewed the findings. The parent
reviewed sources and rendered results and integrated isolated patches through
the validated atomic importer.

All fourteen entries changed. The pass made 26 section updates: one mechanical
section, five recycling sections, eight safety sections and twelve Applications
sections. Seven previously empty fields now have supported content, with 22 new
typed source occurrences. No identities, taxonomy, maturity, structures, routes,
aliases or search terms changed. Existing qualified measurement records remain
intact; the new p(g2T-TT) mechanics account is qualitative.

## Section dispositions

“Retained” means the existing scoped coverage was retained, rather than claiming
a new comprehensive audit of all its measurements. A “Gap” is the outcome of
this focused search, not evidence that the property or process does not exist.

| Material | Mechanics | Recycling and end of life | Safety | Applications |
| --- | --- | --- | --- | --- |
| PAN | Retained | Retained | Enriched | Retained; already substantive |
| PEO | Retained | Enriched; high-molar-mass patent proposal distinguished from PEG cleavage | Enriched | Enriched; current Roquette and industrial supply, drug-delivery and electrolyte roles |
| P3HT | Retained | Retained | Enriched | Retained; already substantive |
| PEDOT:PSS | Retained | Enriched; electrode redispersion and recasting | Enriched | Enriched; OECT example integrated into the three-paragraph format |
| N2200 | Retained | Gap | Retained | Enriched; all-polymer solar-cell example |
| BBL | Retained | Gap | Enriched; product-page guidance only | Enriched; live solid-polymer catalog and aqueous/textile devices |
| FBDPPV-1 | Gap | Gap | Gap | Enriched; exact-isomer field-effect-transistor role |
| p(g2T-TT) | Enriched; hydrated-film dissipation and viscoelastic response | Gap | Retained | Enriched; volumetric gating and ambipolar blend inverter |
| PTB7-Th | Retained | Enriched; explicitly a patent proposal for co-recovered active-layer mixtures | Enriched | Enriched; photovoltaic and spintronic multilayers |
| PM6 | Retained | Enriched; institutionally reported device-material separation and reuse | Retained | Enriched; blend formulation and verified research supply |
| PTMA | Retained | Enriched; composite-electrode reprocessing | Enriched; film-specific biological assays | Enriched; NEC prototype and antifouling-film study |
| PTEO | Gap | Gap | Gap | Enriched; memory/sensor simulation and P3HT-blend OECT |
| PTNB | Gap | Gap | Gap | Enriched; redox devices and lithium-interface protection |
| PVDF-HFP | Retained | Retained | Enriched | Enriched; industrial markets, stent, electrolyte and radiative-cooling examples |

Mechanical data remain insufficient for FBDPPV-1, PTEO and PTNB. Glass transition,
film casting, device transport and the flexibility of another electrolyte do
not establish their mechanical behavior. The p(g2T-TT) sources establish a
hydrated-film response, but do not supply a verified tensile modulus or strength.

Six recycling fields remain empty: N2200, BBL, FBDPPV-1, p(g2T-TT), PTEO and
PTNB. The exact-polymer safety fields remain empty for FBDPPV-1, PTEO and PTNB.
No monomer SDS, another TEMPO polymer, generic fluoropolymer process or thermal
destruction result was substituted for those missing material-specific data.

## Important evidence distinctions

- The PEO patent proposes dissolving specified high-molar-mass blends in cool
  water and precipitating PEO near boiling. It supplies neither a measured
  recycling yield nor evidence of a commercial operation.
- The PTB7-Th patent expressly includes named PTB7-Th/fullerene mixtures in its
  proposed recovery scope. Its actual examples concern other blends. The entry
  identifies that distinction and does not claim purified donor or monomer
  recovery.
- The accessible Wuhan University report describes separation of PM6 and Y6 and
  rebuilt devices containing a mixture of recovered and fresh PM6. The primary
  publisher URL was access-limited, so the entry cites the full institutional
  report with its own attribution and scope.
- The PTMA recovery study reprocesses a PTMA/carbon/PVDF electrode composite.
  Performance changes and losses remain explicit. Its full-cell example uses
  the different polymer PTAm.
- The PTMA biological source is an actual open QUT-hosted manuscript. Its PTMA
  homopolymer film reduced bacterial attachment, and a 48-hour 3T3 fibroblast
  MTS assay found no statistically significant difference from the stated
  controls. Neither observation establishes general toxicity, systemic safety
  or medical-device approval.
- The live F 020 PEDOT:PSS SDS is revision 2, dated 13 October 2026. It differs
  in composition and warnings from indexed revision-1 text at the same URL.
  The downloaded and rendered current PDF supplied the final account, including
  the epoxy-allergy warning. An unavailable BBL SDS was replaced by narrowly
  attributed protective-equipment information on the accessible product page.

The Applications review added roles and demonstrations rather than relying on
sector names alone. It also corrected the PEO purchasing account to identify
current Roquette offerings while retaining the older IFF announcement as a
historical source. BBL's live catalog disproved the usefulness of leaving its
purchasing paragraph as a generic unresolved-stock statement.

## Verification

The final `npm run check` passes snapshot/schema validation, historical archive
checks, V3000 rendering, strict structural coverage, all 272 tests and the atomic
build of 276 entries. The first staged import rejected two source occurrences
that incorrectly assigned different lineages to one BBL catalog page; the
origin was corrected before successful import, preserving the prior snapshot.

All fourteen previews were refreshed and retained in the in-app browser.
Overview (including safety), Mechanical properties, Applications, Degradation
(including recycling) and References were inspected on each page. Applications
headings and citation targets were checked; no missing internal citation target
was found. The local preview remains at http://127.0.0.1:8766/ . No remote release
was performed. Working source and search ledgers remain outside the publication
snapshot.

## Reflection on the initial ingestion

The initial result was insufficiently developed. This was primarily an
execution and editorial-review failure: I accepted a valid, source-backed draft
as a satisfactory completed article. The installed `add-polymer` skill already
directs research of every article element, useful material-specific explanation,
avoidance of one-sentence subsections when meaningful evidence exists, and a
per-tab disposition at handoff. Those directions should have caught much of
the sparseness. The shared [polymer-entry workflow](../.agents/skills/research-polymer-entry/SKILL.md)
also makes complementary context plus measured evidence sufficient for the
core breadth floor; two independent repetitions of an exact experiment are not
required.

The session's snapshots show the problem clearly:

| Stage | Empty mechanical fields | Empty recycling fields | Empty safety fields | Empty Applications fields |
| --- | ---: | ---: | ---: | ---: |
| Initial ingestion | 6 | 10 | 10 | 0 |
| After second enrichment | 4 | 9 | 6 | 0 |
| After this focused pass | 3 | 6 | 3 | 0 |

Applications was populated throughout, yet several sections remained generic.
An empty/nonempty coverage count therefore could not detect the user's central
complaint. Source counts and passing tests likewise establish neither useful
explanation nor an adequate search.

Several failures combined:

1. **The gap allowance became an early stopping rule.** Keeping unsupported
   sections empty is essential, but I used that permission before sufficiently
   searching original studies, theses, product documents and alternate legal
   full-text locations. Later passes found readily usable material.
2. **The breadth floor was applied too narrowly in some searches.** Requiring
   two exact-material experimental repetitions excluded useful, explicitly
   bounded family context. The policy permits complementary evidence.
3. **Source discovery and editorial synthesis were uneven.** Strong attention
   went to identity, structures, stable IDs, imports and tests. Short generic
   application paragraphs and unverified purchasing gaps survived review even
   when the available literature or catalogs could support more.
4. **The handoff lacked a decisive editorial acceptance step.** The skill
   requests a ledger and per-tab reporting, but the process did not require a
   substantive disposition for every field before calling the batch complete.
   Visiting every tab established rendering and navigation, while leaving
   adequacy insufficiently assessed.
5. **Source access needed a more systematic fallback.** Failed publisher or
   supplementary links sometimes ended a search too soon. This pass found a
   working institutional manuscript for PTMA and also caught the opposite
   problem: indexed full text can be stale or remain visible after a live URL
   fails. Actual full documents and their identity must control the claims.

A better ingestion acceptance record would require one disposition per section:
enriched with a supported material-specific explanation and example; already
adequate with a reason; or a scoped evidence gap with the search tracks and
access limitations recorded. A reviewer should then check that each Applications
section explains a real material role and demonstration or product, that supplier
claims were actually checked, and that supported mechanical numbers reach the
measurement table. Sparse sections should trigger an editorial follow-up, not
automatic filler or rejection of legitimate gaps. A machine-generated coverage
summary can assist that review but cannot replace it with a word-count target.

These are workflow recommendations from the retrospective. The installed
personal skill was not modified in this task.
