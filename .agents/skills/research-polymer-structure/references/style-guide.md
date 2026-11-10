# Polymer structure depiction style

## Choose the representation before drawing

Use the representation that matches the article's scientific boundary:

| Material case | Representation guidance |
| --- | --- |
| Defined linear homopolymer | `constitutional_repeat_unit`; show the smallest chemically meaningful SRU and its attachment bonds. |
| Tactic or stereoregular polymer | `stereochemical_repeat_segment`; use a sourced dyad/triad or other segment long enough to encode the relationship. Use wedge/hash bonds for specified stereo. Ordinary bonds are the default when configuration is simply not claimed; use an explicit wavy bond only when unknown configuration at that particular bond is itself important to the depiction, and explain it visibly. |
| Random, alternating, or otherwise sequence-defined copolymer | `copolymer_unit_set`; show a connected local chain or a clearly scoped set of comonomer-derived units with the supported COP/SRU semantics, without inventing order, ratio, or end groups. Do not present separate bracketed homopolymers unless they are genuinely separate components or blocks. |
| Block or graft copolymer | `block_or_graft_architecture`; show the sourced connectivity as a schematic architecture and distinguish blocks/backbone/grafts. Do not turn a block diagram into an exact atomistic claim. |
| Network, cured resin, or crosslinked material | `network_fragment`; show a representative sourced junction/fragment with open continuation points. Never present a finite fragment as the unique network repeat. |
| Blend | `component_set`; show components separately and do not draw a covalent bond between polymers. A compatibilizer is a separate component unless evidence establishes grafting or reaction. |
| Ionic polymer, ionomer, or polymer complex | Use the chemically appropriate unit/motif or `component_set`; show formal charges and relevant counterions/components explicitly. Do not invent ionization fraction, pairing, composition, or stoichiometry. |
| Variably substituted or modified polymer | `variable_substitution_motif`; identify the invariant backbone and bounded substitution possibilities. Treat degree/distribution as variable unless a defined material and source establish it. Prefer an unbracketed finite chain motif when repeat brackets would falsely imply uniform substitution. |
| Family with one invariant scaffold and bounded variable moieties | Use a source-bounded Markush motif with visible `R` atoms and an item `notation` defining every allowed variable. A single variable may remain `R`. Repeated unnumbered `R` is reserved for sites intentionally constrained as equivalent, and the notation must say so. Number independent or position-specific sites as R¹, R², etc. Do not use `R` to conceal different backbone architectures, regioisomers, or unconstrained chemistry. |
| Broad family with several repeat chemistries | `family_representative_set`; provide a small sourced set whose labels make clear that it illustrates, rather than exhausts, the family. Include multiple items when materially different constitutions, regioisomers, charge forms, or substitution patterns are necessary to disambiguate the article scope. |
| Irregular natural macromolecule | `macromolecular_motif`, `family_representative_set`, or `no_unique_repeat`, depending on the evidence. Use a motif only when recurring connectivity is supported. A sourced common sequence motif may represent a protein family only as an unbracketed, explicitly qualified segment; regular natural polymers may still use `constitutional_repeat_unit`. |
| Dendrimer or hyperbranched polymer | `macromolecular_motif` for a sourced core/branching motif, or `family_representative_set` for materially distinct architectures. State generation and terminal-group limits; do not imply a linear repeat unit. |
| No honest unique depiction | `no_unique_repeat` with a sourced explanation. Use this only after checking whether a component set, motif, representative set, or network fragment is informative and defensible. |

`exact` means the connection table exactly represents the constitution,
stereochemistry, charge, and sequence scope claimed by that item; it does not
claim a unique molar mass or chain length. `representative` is a real supported
unit, motif, or member chosen from a broader/variable scope. `schematic`
communicates architecture, continuation, or distribution without claiming a
complete atomistic structure.

## Connection-table drawing conventions

- Use explicit, chemically meaningful 2D coordinates; orient the main repeat
  path consistently and leave enough room for brackets, charges, labels, and
  stereobonds.
- Use SRU/COP S-groups rather than drawing brackets as decorative graphics.
  Confirm that bracket-crossing bonds identify the intended continuation.
- Show formal charge and necessary counterions. Separate disconnected blend or
  complex components rather than suggesting covalent attachment.
- Use conventional wedge/hash stereo only when the source and article scope
  support it. A plain bond makes no stereochemical assignment. Reserve an
  explicit wavy single bond (`CFG=2`) for an intentionally depicted unknown
  configuration at that bond, and a crossed double bond for intentionally
  unspecified E/Z geometry; each receives a visible reader explanation.
- Never add wavy bonds merely because a finite precursor contains an
  unspecified stereocenter. This creates visual noise and can be mistaken for
  a polymer continuation. Polymer continuations are shown by SRU crossings or
  open terminal bonds, not squiggles.
- A Markush `R` label is a chemically meaningful atom label, not a hidden
  continuation pseudoatom. Give it exactly one single bond and define its
  bounded meaning in the item's visible `notation`. Reserve repeated plain
  `R` labels for intentionally equivalent sites and state that constraint.
  Use standard numbered R-group metadata for independent or position-specific
  variables, and state whether those sites may be identical or different.
- Expand superatoms for publication output. Do not add decorative reaction
  arrows, conditions, mechanisms, trade names, property labels, or monomer
  synthesis to a repeat-unit depiction.
- Do not force a wide family, irregular chain, network, blend, or dendrimer
  into the visual grammar of a linear homopolymer.
- For post-modified polymers, preserve the constitutional constraints of the
  precursor backbone, including alternating site parity where it survives the
  modification. Added substitution cannot erase a substituent already present
  on the precursor repeat.
- For carbohydrate SRUs, trace the virtual join between both bracket crossings
  and verify the intended C–O–C glycosidic linkage. Do not place an oxygen at
  both the outgoing boundary and the next repeat's incoming boundary.

## Labels, captions, and alternative text

- `label` is a short reader-facing name that distinguishes multiple units,
  motifs, blocks, or components.
- `scopeNote` explains what the entire depiction set represents and what it
  omits. Mention family variability, tacticity, sequence, substitution,
  formulation, ionization, generation, or network limits when relevant.
- `caption` states whether the item is exact, representative, or schematic and
  names the important ambiguity or limitation. For multiple components, say
  whether they are disconnected constituents, possible units, or architectural
  parts. Never imply a ratio, order, or prevalence that is not sourced.
- `altText` is a concise literal chemical description: identify the polymer or
  component, the kind of unit/motif, and one distinguishing linkage or feature.
  Avoid “image of,” renderer colors, raw V3000/SMILES, citation prose, and
  unsupported interpretation.

Captions and alt text are independent prose, not copied source captions. Keep
alt text concise; put evidence and nuanced qualification in the visible scope
note and caption.

## Renderer acceptance gate

A publication renderer must consume the canonical V3000 record and retain all
of its depiction-bearing semantics: authored coordinates, atom and bond stereo,
explicit unknown/wavy stereo, formal charges, disconnected components, and
SRU/COP S-groups including block-copolymer subtype metadata. Reject a renderer
that recreates coordinates from SMILES, drops S-groups, changes an unknown
stereobond into a directed wedge, or substitutes query atoms for attachment
pseudoatoms. Visual polish cannot compensate for a semantic round-trip failure.

Renderer or style changes use a controlled, independently reviewed loop:

1. Render the same V3000 inputs for an isotactic polypropylene
   stereochemical segment, a PEDOT:PSS component set with one explicit,
   reviewed charge/protonation convention, and a connected SBS A-B-A block
   architecture. A neutral parent-connectivity test is acceptable only when it
   is named as such and does not claim to depict the ionic state.
2. Verify canonical-input parsing and a lossless semantic round trip before
   visual scoring. Comparisons with different charge states, protonation states,
   repeat definitions, or architectures are invalid.
3. Have a reviewer who did not implement the candidate score chemical
   truthfulness, legibility, visual balance, cross-case consistency, and
   article-hero suitability from 1 to 5. Chemical truthfulness is a hard gate;
   each other category must score at least 4 for all three cases.
4. Record the findings in this skill, revise the shared style or authored V3000
   geometry as appropriate, and repeat. Stop when the gate passes or after
   three total cycles; never weaken chemical fidelity to obtain a passing look.

Cycle 1 compared SmilesDrawer 2.4.1, RDKit MolDraw2D/ACS1996, and OpenChemLib
9.25.0. SmilesDrawer established a useful legibility target but failed the
publication gate because it regenerates coordinates and cannot render SRU/COP
S-groups, brackets, head-to-tail metadata, or explicit unknown stereo.
OpenChemLib failed because it dropped S-groups, changed attachment pseudoatoms,
and altered unknown stereo. RDKit was the only semantically viable base, but
its untuned cycle-1 output was too small for the article hero and exposed `*`
and `HT` implementation labels. The PEDOT:PSS visual comparison was not
controlled because its candidates used different charge/protonation states;
subsequent cycles must use one identical, explicitly qualified V3000 component
set.

Cycle 2 established the tuned RDKit visual baseline. The isotactic
polypropylene dyad passed the independent gate at 5/5 in every category.
PEDOT:PSS failed because a nested component SVG extended outside its parent
viewport, clipping the PSS sulfonic-acid group and colliding with explanatory
copy. SBS failed because continuation bonds crossing one outer bracket with an
`n` subscript conventionally state `[ABA]n`; a caption cannot negate that
chemical notation. Cycle 3 must therefore keep every nested item within an
explicit viewport, give disconnected components comparable optical weight,
reserve prose outside chemistry bounds, and depict a triblock once through as
three connected, independently delimited blocks such as PS_x-PB_y-PS_z. A
whole-ABA repeat bracket is forbidden for an A-B-A triblock.

Do not call a semantic round trip lossless when a serializer drops an input
stereo marker and a test adds it back afterward. If the selected renderer's
serializer is not fidelity-preserving, validate the immutable canonical input
with an independent semantic parser and directly assert the corresponding
rendered wedge, hash, wavy, or crossed-bond geometry. Report the serializer
limitation explicitly; an input-assisted reconstruction is not a pass.

Cycle 3 confirmed that the isotactic polypropylene reference is chemically
and visually correct. Its two stereogenic atoms parse as like-configured (an
`m` dyad); on a turning zigzag backbone, methyl bonds may appear on opposite
solid/hash marks without becoming an `r` dyad. Review tacticity from the
atom-centred relative configuration, not from a same-mark visual shortcut.
The initial cycle-3 PEDOT:PSS revision became complete and unclipped, but a
perfectly collinear PSS backbone forced RDKit to print an unnecessary carbon
label beside the unknown-stereo bond. Curated coordinates must instead provide
a conventional skeletal vertex while retaining the wavy bond and exact SRU
crossings. Audit phrases such as “test-only coordinates” belong in review
records, never reader captions. The first three-SRU SBS revision removed the
false whole-ABA repeat but overlapped adjacent block domains: along the chain,
each interface must encounter the prior block's exit stroke before the next
block's entry stroke. Separate those strokes visibly and align the independent
`x`, `y`, and `z` labels consistently.

The corrected cycle-3 pilot passed independent review. Scores for isotactic
polypropylene were 5/5 in truthfulness, legibility, balance, consistency, and
hero readiness; PEDOT:PSS scored 5/5/4/5/5; SBS scored 5/4/5/5/4. The accepted
PSS coordinates use a shallow skeletal vertex, keep the complete para
phenyl–SO3H motif inside the SRU, and cross only the two continuation bonds.
The accepted SBS record is one connected graph with ordered, visibly separated
PS-exit/PB-entry and PB-exit/PS-entry bracket strokes, aligned `x`/`y`/`z`
subscripts, and no outer `[ABA]n` group. These three cases are permanent golden
fixtures for future renderer or style changes.

The later A–C and full-corpus editorial rollout superseded the pilot's
PSS-specific unknown-single-bond convention. Readers repeatedly interpreted a
wavy backbone bond as a polymer continuation or variable connection, while
the article made no local stereochemical claim that required an explicit
unknown marker. The PEDOT:PSS golden therefore retains the reviewed component
separation, parent-acid connectivity, shallow PSS backbone vertex, complete
para-sulfonic-acid motif, and SRU crossings, but now uses an ordinary PSS
backbone bond. The SBS golden likewise uses ordinary bonds in both PS blocks
while retaining its intentionally crossed, E/Z-unspecified PB double bond.
Current-corpus acceptance requires zero single-bond `CFG=2` records unless a
future source and caption make the particular unknown configuration material
to the depiction. Specified cis/trans alkenes may encode E/Z through authored
2D V3000 geometry when a strict parser recovers the intended stereoisomer;
`CFG=2` remains reserved for deliberately crossed, unspecified double bonds.

## Renderer authority: `wop-structure-style-v5`

The renderer code, not this guide or individual records, is the machine
authority for visual style. `wop-structure-style-v5` uses the pinned RDKit JS
MolDraw2D renderer on curated V3000 coordinates and applies one repository-wide
style: 48 px average bond length, approximately 2 px bond strokes, 24 px visual
margins, standard heteroatom colors, heteroatom and necessary terminal labels,
a transparent background, conventional wedge/hash/wavy stereo, expanded
superatoms, and a maximum 960 x 480 canvas. Scale and crop the SVG viewBox so
the chemistry is prominent without clipping; do not leave a small structure in
a fixed empty canvas.

Style v4 displays validated generic `R` atoms and standard numbered V3000
`R#`/`RGROUPS` atoms as R with a superscript number. RDKit otherwise renders
those records with a duplicate isotope-like prefix, so a deterministic
display-only molfile copy converts each validated numbered atom to plain `R`
and supplies the intended vector superscript label. The canonical V3000 and
downloadable `.mol` remain unchanged. Every displayed R group requires
authored notation, and every numbered label must be named there. Style v4 does
not ask RDKit to turn every unspecified tetrahedral
center into a wavy bond: plain bonds remain plain unless the canonical V3000
explicitly contains unknown-stereo `CFG=2`. The current reviewed corpus has no
single-bond `CFG=2` records; any future exception must be source-material,
captioned, and independently reviewed. The site explains each explicit wavy
or crossed-unknown convention beside the corresponding figure.

For the generated SVG only, the renderer adapter may display a terminal `*`
pseudoatom as an unlabeled continuation endpoint and may suppress the internal
SRU `CONNECT=HT`, `HH`, or `EU` text label. It may also convert a validated
`R#` atom to plain `R` in the display-only copy solely to replace RDKit's
duplicate isotope-like output with the intended superscript group number. The
continuation bond, polymer bracket, repeat subscript, stereo, and all
chemically meaningful atom labels must remain visible. These presentation
transforms must be deterministic, restricted to validated terminal attachment
pseudoatoms, S-group connectivity labels, and numbered R labels, and must not
change the canonical V3000 or downloadable `.mol` file.

Composite presentations must calculate containment from each normalized child
viewBox. No child geometry may extend beyond the parent viewport, and captions,
labels, or architecture annotations must occupy a reserved band outside the
chemistry bounds. For a component set, use separate responsive figure cards
when that gives each item a clearer and more honest scale than nesting multiple
structures into one SVG. Likewise, show alternative family chemistries as
separate items when connecting them would visually assert an unsupported
sequence or co-occurrence.

On narrow screens, do not shrink a wide structure until heteroatom labels or
stereobonds become illegible. Apply one aspect-ratio-based mobile treatment:
retain a shared readable minimum width inside a keyboard-accessible horizontal
scroll region. This is a renderer-presentation rule, not a per-record style
override; compact figures should continue to fit their cards normally.

There are no per-record style overrides. Never edit generated SVG to change
color, fonts, spacing, viewBox, or clipping, and never invoke layout/`clean2d`
silently. Fix chemical geometry in the canonical V3000 and preview again; make
repository-wide renderer changes only as an explicit style-versioned change
with golden SVG and contact-sheet review.

### Synthesis-pilot bracket and subscript review

Style v5 retains the v4 chemistry and drawing scale. It uses RDKit's
`annotationFontScale: 1.2` for repeat labels and a deterministic vector-glyph
translation during rendering: each label begins 4 px to the right and 4 px
below its own exit bracket. The adapter checks the canonical SRU labels against
the glyph count and the expected RDKit bracket paths, and fails closed on
unrecognized output. It changes no atoms, bonds, brackets, or downloaded V3000
records. This label-only presentation transform is explicitly permitted in
addition to the v4 display transforms above. Multiple labels are positioned
independently, including the x/y/z of connected SBS.

The controlled comparison used identical input records for each v4/v5 pair.
An initial size-only trial exposed RDKit's bracket-tip/label collision; the
accepted candidate adds the clearance above. Independent final scores
(truthfulness/legibility/balance/consistency/hero readiness) were PP
5/5/5/5/5, PEDOT:PSS parent connectivity 5/5/4/5/5, and SBS 5/4/5/5/4.
Charge and stereo conventions are unchanged. Larger article figures complement
the renderer change; paired ABS components need full-width cards to keep the
rubber chain readable.

Short repeat brackets should intersect the two continuation bonds, without
running through pendant rings, ester groups, or other side groups. PS and PMMA
were explicitly reoriented for clear backbone crossings; PET needed bracket
geometry only. All three retained their original atoms, bond orders, stereo,
SRU membership, crossing-bond identifiers, connectivity code, and repeat label.
Ketcher reviewed the atom geometry but its tested export regenerated BRKXYZ and
dropped XBONDS. For this coordinate-only correction, retain the audited
canonical record and validate final bracket intersections and the rendered
figure; do not claim a lossless editor round trip or overwrite with that export.
