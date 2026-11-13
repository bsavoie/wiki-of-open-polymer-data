# Electronic and electrolyte polymers: second enrichment pass

The [focused mechanical, recovery, safety and Applications review](electronic-polymers-focused-review-20261112.md)
records the subsequent pass and supersedes this report's remaining-gap inventory.

This review revisits the fourteen unique entries selected in
[the initial ingestion](electronic-polymers-20261112.md). Three Terra agents
researched and cross-reviewed the electronic, solar, radical and electrolyte
materials in parallel. The parent agent researched PVDF-HFP, reconciled the
findings, and integrated full records through the validated atomic importer.
The authoritative v2 snapshot contains the result; generated HTML is not an
authoring source.

## Result

- Reviewed all fourteen entries and filled 23 previously empty article fields.
- Increased structured measurement records across these entries from 20 to 34.
- Increased synthesis routes from 4 to 15, adding eleven route outlines.
- Increased typed source occurrences from 124 to 158. These are article source
  occurrences, not 158 unique publications.
- Preserved all stable identifiers, names, slugs, aliases, search terms and
  canonical V3000 structures. No structure was newly inferred or drawn.

| Material | Stable ID | Substantive additions or corrections |
| --- | --- | --- |
| PAN | wop-000039 | Nitrile cyclization and thermal-processing limits; formulation-qualified ionic and electronic transport; independent gel processing; homopolymer powder supply; fiber strength moved to mechanics. |
| PEO | wop-000226 | High-molar-mass polymerization sources and route; electrolyte history; crystalline versus segmental transport; DSC transitions; salt/blend composition and conductivity; melt processing and lithium-interface chemistry. |
| P3HT | wop-000245 | Explicit oxidative versus GRIM synthesis comparison and sample-qualified optical absorption. Existing substantial mechanical, processing and environmental coverage retained. |
| PEDOT:PSS | wop-000247 | Rechecked existing broad coverage and corrected the He et al. mechanical-source citation and DOI. |
| N2200 | wop-000267 | History, alignment-qualified field-effect mobility, synthesis route, supplier listing, ambient device stability and dated product-specific safety information. |
| BBL | wop-000268 | History and condensation route; independent fiber mechanics and processing; morphology, OECT transport and bounded UV/cycling retention. |
| FBDPPV-1 | wop-000269 | Exact-isomer monomer/coupling outline; film casting and annealing; qualified mean/best mobility; explicitly separate related-family synthesis and processing context. |
| p(g2T-TT) | wop-000270 | Named Stille monomers and route; swelling, capacitance, extracted mobility and cycling; research supply and supplier-specific safety. |
| PTB7-Th | wop-000271 | Historical accounts, optical properties, synthesis route, deposition and four qualified blend mechanical measurements; supplier context. |
| PM6 | wop-000272 | History and identity, independent synthesis and route, optical/device results, preparation and morphology, four blend mechanical measurements, light-soaking loss and product SDS. |
| PTMA | wop-000273 | Independent dry-film indentation and electrolyte-swollen shear-response coverage; measurement uncertainty; conductivity scope, radical persistence and synthesis route. |
| PTEO | wop-000274 | Short-channel conductivity and annealing conditions; synthesis route; memory-state retention, cycling and ambient storage, separated from polymer decomposition. |
| PTNB | wop-000275 | History, two-source coating/processing, ROMP route, transport context and post-cycling interface observations. |
| PVDF-HFP | wop-000276 | Official grade-level thermal/mechanical data and powder/pellet supply; dry versus gel ionic transport; sequential-feed route; ramped thermal loss, dated safety information and direct laboratory fluorine recovery. |

## Evidence decisions

Each populated core section has two distinct documents and independent source
origins. A second source may establish material-family context or variability;
it need not repeat an exact numerical experiment. FBDPPV-1's independent
benzodifuranone–isatin family context is visibly distinguished from the exact
fluorinated positional isomer. It is not claimed as an independent repetition
of that isomer's preparation. The generic Stille-coupling thesis initially
proposed for this role was removed.

High-molar-mass PEO is now supported by direct calcium- and zinc-catalyst
patents. The unrelated polyacetal source was removed, while the low-molar-mass
PEG ethoxylation example remains explicitly identified as such. PAN's gel and
PAN/PEO composite transport results are not assigned to neat PAN. PVDF-HFP's
dry-host results are separated from salt/solvent-containing gel measurements.

The Tan PAN-gel paper reports different conductivity values in its abstract
and results; both are disclosed. The Zhang PVDF-HFP paper likewise gives
different lithium-transference values, and the entry identifies that conflict.
Its tensile specimen is called a gel electrolyte by the authors, but the exact
liquid state during testing is not established; the evidence rows retain this
limitation. PTMA and Hofmann membrane uncertainties now appear in the rendered
measurement values, with their distinct statistics identified.

An inaccessible PM6 supplement and the exact claims dependent on it were
removed. The route uses the accessible 2024 primary method instead. The
PTB7-Th measurement row dependent on a blocked supplement was also removed;
the new blend-specific measurements have directly readable methods and tables.
Cornell and Waseda full theses were read anonymously during this session;
subsequent independent requests encountered intermittent access errors. Their
actual full-content reads, rather than search snippets, supplied the claims.
Reuse metadata distinguishes open licenses, restrictive notices and
citation-only access.

## Remaining research limits

Mechanical sections remain empty for FBDPPV-1, p(g2T-TT), PTEO and PTNB because
the required qualified coverage was not established. Recycling and safety
coverage remains incomplete for several research polymers. Device cycling,
EPR persistence, memory retention and surface XPS do not establish backbone
decomposition rates or environmental mineralization. No annual material
production ranking or universal service lifetime was inferred.

The entries retain their draft maturity and unresolved review flags. The
initial report is a record of the first pass; its gap table is superseded by
this review and the current snapshot.

## Validation and previews

The final `npm run check` passes snapshot/schema validation, historical-archive
verification, V3000 rendering, strict structure coverage, all 272 tests and the
atomic build of 276 entries. The first attempted staged import rejected two
metadata-contract errors before replacing the authoritative snapshot; both
were corrected before successful integration.

All fourteen article previews were refreshed and retained in the in-app
browser. All eight tabs were inspected on each page. Additional visual checks
covered route displays and the PTMA uncertainty table; citation navigation
was checked against the rendered reference panel. The preview build is served
locally at http://127.0.0.1:8766/ . No remote release was performed.

Complete claim citations, section mappings, source locators, access dates and
reuse terms are in the public article records. Working claim ledgers remain
outside the published snapshot.
