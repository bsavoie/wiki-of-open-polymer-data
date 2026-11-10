# Synthesis structure review — 4 September 2026

The five synthesis pilot articles were reviewed in both their article headers
and synthesis tabs. The preview now offers an Article header/Synthesis selector
alongside the desktop, tablet, and phone widths.

- **PS:** reoriented the existing backbone and pendant phenyl coordinates;
  shortened brackets so each crosses only one continuation bond.
- **PMMA:** separated the backbone crossings from the methyl and ester groups;
  shortened and aligned both brackets.
- **PET:** retained every atom coordinate and shortened the two brackets.
- **ABS:** retained the separate SAN and rubber motifs; stacked header cards
  at every breakpoint so the rubber chain remains readable.
- **DGEBA:** retained the sourced structural-boundary explanation. The finite
  DGEBA precursor belongs in synthesis, rather than representing the cured
  polymer as one unique repeat unit.

Style v5 increases repeat-label size and places each n, x, y, or z below and
to the right of its own exit bracket. The adapter preserves all chemical
geometry and canonical downloads; unknown output shapes fail validation.
Header and reaction figures have more display space.

The three coordinate corrections preserve atom identities, bond orders,
stereochemistry, charge, S-group membership, XBONDS, HT connectivity, and n.
An independent intersection audit confirms PS bonds 1/9, PMMA 1/8, and PET
1/13 are the only bonds crossed. The shared records occur in 17 articles;
their metadata was inspected and their individual previews regenerated.

Independent review passed the PP stereochemical dyad, PEDOT:PSS parent
connectivity, SBS three-block architecture, and all five pilot headers.
Phone-width review confirmed the revised pilot headers and stacked ABS cards.
The full check passes 44 tests and builds all 262 articles. The 226 generated
molfile downloads match their canonical records.

Ketcher reviewed the atom geometry, but its tested export regenerated bracket
coordinates and omitted XBONDS. Final bracket verification therefore uses the
original canonical records, explicit coordinate corrections, bond-intersection
checks, and publication rendering; it is not a lossless Ketcher round trip.
The skill and style guide record this limitation for subsequent corrections.

The scope limitations of the synthesis examples remain: graft and network
schemes are representative, and the PMMA source leaves one dosing split
unspecified. No chemistry or procedure claims changed in this display pass.

## Corpus expansion — 4 September 2026

The shared synthesis presentation now covers all 262 articles, with 263 routes.
The six pilot routes remain intact. The other 257 articles have bounded,
source-linked preparation outlines derived from their curated synthesis
sections. Routes distinguish polymerization, post-modification, extraction,
biological production, and physical compounding. Four sparse natural-material
entries (amylose, amylopectin, alginate, and agarose) received additional public
patent evidence for their selected preparation outlines.

All 243 canonical structures were inspected: independent reviewers accepted
150 corrected definitions and 17 new finite feedstocks; the remaining 76
existing definitions were checked in a contact sheet of the publication SVGs.
The 150 corrections shorten or align repeat brackets at the declared crossing
bonds. Two connected block architectures also received ring-coordinate
corrections: TPC PBT/PTMEG and TPU PTMEG/MDI/PTMEG. Connectivity, charge,
stereochemical assignments, group membership, and crossing-bond identities
are unchanged. All 170 SRU groups pass an exact bracket/bond intersection
check. Coordinate corrections are reflected in both header and synthesis uses
of each shared definition.

The new feedstocks are ethylene, propylene, isoprene, vinyl chloride, vinyl
acetate, acrylic acid, methacrylic acid, terephthalic acid, adipic acid,
caprolactam, ethylene oxide, propylene oxide, formaldehyde, phenol, 1-butene,
tetrahydrofuran, and furfuryl alcohol. PubChem connectivity was checked before
Ketcher authoring; independent graph and final-SVG review passed all 17.
No enantiomer is assigned to propylene oxide. The formaldehyde drawing denotes
the molecule rather than the speciation of aqueous formalin.

Product references have a separate display mode. A copolymer unit set, blend
component set, or family representative set is not joined with plus signs as
if each card were an independent reaction product. The product scope appears
beside the corresponding figures. Route evidence and molecular-connectivity
evidence have separate citation groups.

Coverage is 135 articles with at least one drawn starting material, 256 with
a drawn product/reference, and 261 with a drawing directly in their route.
Phthalonitrile precursor preparation remains textual; its independently
reviewed cure-promoter drawing remains in the Processing context. All articles
have a reviewed hero drawing or an explicit no-unique-structure boundary with
contextual chemistry. Seventeen retain that boundary rather than an invented
universal repeat or cured network.

The preview includes name/abbreviation search, previous/next navigation,
Synthesis/Header views, and desktop/tablet/phone widths. A browser audit of all
262 phone layouts found four overflowing systematic names; the shared header
wrapping rule was corrected. This pass does not claim that every feedstock has
a drawing or that every outline is a complete experimental protocol. Reagent
identities and operating details remain bounded by the evidence; broad
initiator/catalyst classes are not silently turned into exact formulations.

Final verification: `npm run check` passes all 46 tests and builds 262 articles.
Browser DOM checks covered all 262 routes at 390, 768, and 1280 px (786 page
checks), with no remaining document overflow, missing route, or detected broken
image. Targeted screenshots checked phone headers and the corrected figure
layout. All 243 generated `.mol` downloads equal their canonical V3000 records;
all existing section prose, article identities, hero metadata, and pilot routes
are preserved. This is a rendering and route-integration review, not a fresh
experimental validation of the corpus procedures.
