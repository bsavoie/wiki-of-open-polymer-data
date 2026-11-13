# Electronic and electrolyte polymer additions — 12 November 2026

This report records the initial ingestion. Its coverage and gap table are
superseded by the [second enrichment review](electronic-polymers-enrichment-20261112.md)
and the current authoritative snapshot.

The requested fifteen category selections resolve to fourteen distinct materials because BBL serves two categories. Ten new entries append stable identifiers wop-000267 through wop-000276; four existing entries were enriched. The authoritative v2 snapshot was edited through isolated staging and the validated atomic importer. The frozen v1 snapshot and all pre-existing chemical structure definitions were preserved.

## Selection basis

“Top three” is interpreted as a useful set of established, widely studied research benchmarks. These selections are not a measured global usage, sales, citation-count or current device-performance ranking. Different device architectures and formulations cannot be ranked by one intrinsic polymer value.

| Area | Selected materials |
| --- | --- |
| n-type organic transistors | N2200 / P(NDI2OD-T2), BBL, FBDPPV-1 |
| Organic solar cells | P3HT, PTB7-Th, PM6 |
| Organic mixed ionic/electronic conduction | PEDOT:PSS, p(g2T-TT), BBL |
| Polymer electrolyte hosts | PEO, PAN, PVDF-HFP |
| Radical conducting/redox polymers | PTMA, PTEO, PTNB |

PTMA is included as a benchmark radical/redox polymer despite conflicting and often very low neat-film electronic conductivity. PTEO and PTNB results also require specimen, length scale and environment qualifiers. Redox kinetics, electronic conduction, ion transport and composite-electrode performance remain distinct throughout these entries.

PVDF-HFP is described primarily as a scaffold for gel electrolytes and formulated membranes. The direct salt-host study cautions against assigning gel conductivity to the solvent-free fluoropolymer. The existing PAN and PEO articles retain their broader scientific scope while gaining electrolyte-specific formulation and preparation context.

## Article disposition

S means sourced prose is present, G means an explicit gap, and P means degradation/stability prose is present but dedicated recycling coverage remains a gap. These marks describe coverage, not comprehensive independent review. The four pre-existing articles retain their earlier content and evidence; this pass did not re-audit every legacy claim.

| Material | Stable ID | Overview | History | Synthesis | Mechanics | Processing | Applications | Degradation / recycling | References |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| PAN | wop-000039 | S | S | S | S | S | S | S | S |
| PEO | wop-000226 | S | S | S | S | S | S | S | S |
| P3HT | wop-000245 | S | S | S | S | S | S | S | S |
| PEDOT:PSS | wop-000247 | S | S | S | S | S | S | S | S |
| N2200 / P(NDI2OD-T2) | wop-000267 | S | G | S | S | S | S | G | S |
| BBL | wop-000268 | S | G | S | G | S | S | G | S |
| FBDPPV-1 | wop-000269 | S | S | G | G | G | S | P | S |
| p(g2T-TT) | wop-000270 | S | S | G | G | S | S | G | S |
| PTB7-Th | wop-000271 | S | G | S | S | S | S | P | S |
| PM6 | wop-000272 | S | G | S | S | S | S | P | S |
| PTMA | wop-000273 | S | S | S | G | S | S | G | S |
| PTEO | wop-000274 | S | S | S | G | S | S | G | S |
| PTNB | wop-000275 | S | G | S | G | G | S | G | S |
| PVDF-HFP | wop-000276 | S | S | S | S | S | S | G | S |

Every populated core field meets the two-document, two-lineage floor. Each non-empty article field has an explicitly mapped typed source. Sources record anonymous full-content access separately from reuse rights. Numerical examples retain the actual material, preparation, test and uncertainty limits.

Specific remaining gaps include:

- FBDPPV-1 synthesis and processing: the exact positional-isomer paper was available, but an independent exact-isomer lineage was not established. Generic FBDPPV studies were not assigned to this entry without confirming the isomer.
- p(g2T-TT) synthesis: the independent-source breadth requirement remains unmet.
- Mechanical properties: BBL, FBDPPV-1, p(g2T-TT), PTMA, PTEO and PTNB lack the required qualified coverage in this pass.
- PTNB processing: no two-lineage conversion account was established.
- Dedicated recycling and material-specific health/regulatory coverage remain gaps for all ten new entries. Several histories and environmental-fate sections also remain empty.

New mechanical evidence includes the source-qualified N2200 and PTB7-Th film-on-water moduli, PM6 film-on-water fracture strain, and two dry porous PVDF-HFP separator strengths. The N2200 and PTB7-Th modulus uncertainties are standard deviations; the PM6 source does not supply a full uncertainty/test envelope for its stated fracture result. None is a universal bulk-polymer design value.

## Structures and review

Ten new depictions use independently encoded Ketcher MDL V3000 data. They are representative open polymer motifs with visible scope limits; no exact chain length, end group, tacticity or composition is inferred from the finite segment. Independent chemical and visual review covered source connectivity, continuation bonds, substituents, charge/radical states, and rendered geometry. The PTNB motif retains the correct separated norbornene-derived bridgeheads and adjacent ester substituents. Radical oxygens retain their neutral open-shell encoding.

The structure registry increased from 286 to 296 definitions. All 276 hero records satisfy the reviewed structural-depiction gate; article maturity remains source_backed_draft with provisional flags. A reviewed depiction does not upgrade the whole article to open_source_reviewed.

## Validation and previews

- npm run check passed, including snapshot/schema, historical archive, V3000 rendering, strict structure coverage, all 272 tests and the atomic static build.
- Individual structure previews were generated for all ten new entries, and the new structures were inspected in the contact sheet.
- All fourteen completed article previews were opened and retained in the in-app browser. Overview, History, Synthesis, Mechanical properties, Processing, Applications, Degradation and References were inspected on each page; all structure images loaded.
- The local preview server serves the completed build at http://127.0.0.1:8766/ . Publication status is a local snapshot/build update and local previews; no remote release was performed.

Three corpus tests had assumed a permanently fixed 266-entry catalog and completed history/route coverage on every future addition. They now preserve all 266 baseline identifiers and that baseline’s history and route coverage, while allowing explicit draft gaps on later records. Source checks on all populated histories, route checks wherever routes exist, and reviewed structure acceptance across the entire growing catalog remain enforced. No schema, renderer or application code was changed.

Article references in the snapshot provide the complete source citations, full-content URLs, locators, access dates, reuse terms and section mappings. Research downloads and working review notes remain outside the public snapshot.
