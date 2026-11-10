# Structural depiction contract

## Record boundary

The authoritative snapshot has a top-level `chemicalStructures` registry of
reusable records:

```text
{ structureId, molfileV3000 }
```

Each polymer has a required `structuralDepictions` object:

```text
reviewStatus: pending | draft | reviewed
representationType: undetermined | constitutional_repeat_unit |
  stereochemical_repeat_segment | copolymer_unit_set |
  block_or_graft_architecture | variable_substitution_motif |
  family_representative_set | network_fragment | component_set |
  macromolecular_motif | no_unique_repeat
scopeNote: string
sourceIds: string[]
items: [{ structureId, label, fidelity, altText, caption, notation? }]
fidelity: exact | representative | schematic
```

A polymer may also have an optional `contextualStructures` object with
`feedstocksAndSynthesis` and/or `processing` groups:

```text
reviewStatus: draft | reviewed
scopeNote: string
sourceIds: string[]
items: [{ structureId, label, fidelity, altText, caption, notation? }]
```

The hero `structuralDepictions` record describes the polymeric material.
Finite monomers, oligomeric precursors, and prepolymers belong in
`feedstocksAndSynthesis`; curing agents and crosslinkers belong in
`processing`. A contextual group may accompany a reviewed hero
`no_unique_repeat` explanation, but it must not be used to make a precursor
look like the material's repeat unit. `notation` is required whenever a
visible generic or numbered `R` atom appears; it must bound the allowed
meaning and name every numbered label.

`structureId` values are unique, stable lowercase slugs. Every item must resolve
to exactly one definition, and every definition must be referenced. Do not
duplicate an identical definition for formulation, grade, or article variants;
do not share a definition when stereo, charge, constitution, coordinates, or
S-group semantics differ. Audit all referencing entries before modifying a
shared definition.

## Review-state invariants

- `pending` is valid only for a true stub whose structural research is not yet
  complete. Use `undetermined`; do not attach a speculative item.
- `draft` identifies sourced work that still needs chemical or editorial
  review. It is not a way to publish an unsupported guess.
- `reviewed` means a reviewer checked the evidence, connection table,
  stereochemistry/architecture, V3000 encoding, coordinates, captions, and
  article scope.
- Every `draft` or `reviewed` object cites at least one article source through
  `sourceIds`. Each cited source must declare `structuralDepictions` in its
  `supports` list and provide the exact useful locator.
- Contextual groups use the same `structuralDepictions` evidence support and
  review standard. Their sources, items, and scope note must all be non-empty.
- `no_unique_repeat` may have an empty `items` array only when its non-empty,
  sourced `scopeNote` explains why no honest unique depiction applies. Do not
  use it merely because the chemistry is difficult to draw.

Use the `reviewStatus`, `representationType`, and item invariants implemented by
the schema as the final machine authority. Do not weaken them to accommodate an
unfinished record.

## Evidence rules

Verify the structural claim against anonymously readable full content at a
stable public URL. Prefer nomenclature authorities, primary open literature,
public patents, theses, open textbooks, institutional sources, and official
technical documentation suited to the claim. Record access and reuse status
under the shared source policy.

One directly supporting source is the minimum; the two-document/two-lineage
floor for core prose tabs does not apply to `structuralDepictions`. Use more
sources when one does not establish all claimed connectivity, stereochemistry,
sequence, composition, or scope. A source mapped to `structureAndMorphology`
does not support a connection table until its cited material is checked and
its `supports` list explicitly includes `structuralDepictions`.

Treat connectivity as a fact to independently encode. Do not copy, trace, or
republish a source drawing, coordinates, layout, caption, or figure. Never use
search snippets, paywalled text, private files, model recollection, or a trade
name by itself as structural evidence.

## Canonical connection tables

MDL V3000 is the only canonical structure format. Author in Ketcher, export
V3000, and preserve explicit curated 2D atom coordinates. Encode repeating
groups with correct SRU S-groups and copolymer groups with correct COP S-groups
when they apply. Verify:

- atoms, bond orders, aromaticity choices, valence, isotope and formal charge;
- bonds crossing repeat brackets and their head/tail attachment meaning;
- wedge/hash or unknown stereobonds and the stereochemical claim they encode;
- component separation, counterions, and any stated stoichiometry;
- copolymer sequence/block/graft semantics and variable substitution limits;
- every generic or numbered Markush `R` atom has exactly one single bond and a
  bounded, reader-visible item `notation` defining the allowed substituent
  class and the relationship among repeated sites;
- all V3000 and S-group references after export.

Use a Markush `R` atom only when the evidence establishes an invariant family
scaffold and a bounded variable moiety. A lone variable uses generic V3000
`R`. When multiple sites are not intended to be one equivalent variable, use
standard V3000 `R#` atoms carrying exactly one `RGROUPS=(1 n)` label from 1 to
32; position-derived numbers such as cellulose R²/R³/R⁶ need not be
contiguous. Reusing a number means the same variable constraint applies at
each occurrence. Never encode a display label as the atom symbol `R1`, an
isotope `MASS`, or an atom map. Do not use R groups to hide materially
different architectures, regioisomers, charge states, or unknown connectivity.

Do not silently run layout or `clean2d`; coordinate changes require visual
review. Do not store SMILES as a substitute, authored SVG, or hand-written
`.mol` download assets. The build parses V3000 and derives sanitized SVG and
downloadable `.mol` files; any parse or render error is a hard failure.

## Scope-safe writing

`scopeNote` qualifies the depiction set as a whole and is visible to readers.
State whether it is an exact constitutional unit, a stereochemical segment, a
set of possible units/components, a representative fragment or motif, or an
honest unavailable case. Preserve material-specific limits such as tacticity,
sequence, substitution distribution, ionization, generation, curing, or
formulation. An item's caption cannot silently broaden the article boundary or
repair a mismatched connection table.
