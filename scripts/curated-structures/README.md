# Curated migration inputs

These coordinate-bearing V3000 files are exceptional authoring inputs for
structures that cannot be laid out unambiguously by the migration scaffold.
They are not runtime assets: the v2 snapshot remains canonical, and the static
build renders only from its `chemicalStructures` registry.

`agarose-sru.mol` preserves the connection table, stereochemistry, SRU group,
and manually curated coordinates of the public ChEBI agarose record
CHEBI:2511 after removal of explicit hydrogen atoms and lossless V3000
serialization. Its connectivity and RDKit rendering are reviewed through the
same evidence, validation, and contact-sheet workflow as every other record.
No source SVG or raster figure is copied.

`polystyrene-sulfonic-acid-unit.mol` retains the reviewed neutral parent-acid
connectivity used for the PSS component of PEDOT:PSS. Its shallow, noncollinear
backbone preserves a conventional skeletal vertex without forcing an explicit
carbon label; the unspecified backbone configuration uses an ordinary bond,
and the para phenyl sulfonic-acid motif remains wholly inside the SRU.

`sbs-connected-aba-block-architecture.mol` is a once-through connected
PS_x–PB_y–PS_z architecture. Its three SRU groups have independently aligned
brackets and ordered, separated strokes at both block interfaces. It contains
no outer `[ABA]n` group, which would incorrectly imply repetition of the whole
triblock molecule. The two PS blocks use ordinary bonds; only the central
E/Z-unspecified PB double bond retains `CFG=2` crossed-bond notation.

`organosiloxane-r2sio-markush-sru.mol` preserves standard numbered R-group
metadata while placing both R¹ and R² labels wholly inside the SRU brackets.
The adjusted R² coordinate prevents the right bracket from being mistaken for
a bond through the variable substituent; connectivity and the canonical
`-O-Si(R¹)(R²)-` scaffold are unchanged.

`poly-2-oxazoline-markush-unit.mol` keeps the carbonyl-linked generic `R`
substituent wholly inside the SRU bracket while preserving the two true
backbone crossings. The right terminal atom is displaced only to make room for
the bracket; the tertiary-amide repeat connectivity is unchanged.

`poly-r-3-hydroxyalkanoate-markush-unit.mol` separates the carbonyl oxygen
and backbone oxygen from their adjacent SRU brackets and retains the reviewed
stereobond and generic side-chain `R`. Its extended terminal bonds change only
the drawing geometry, not the represented x = 1 hydroxyalkanoate connectivity.
