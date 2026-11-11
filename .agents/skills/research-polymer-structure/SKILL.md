---
name: research-polymer-structure
description: Author or review polymer structures and repeat-unit depictions in Wiki of Open Polymer Data.
---

# Research Polymer Structure

Create chemically defensible structural depictions without implying precision
that the article's scope or evidence does not support.

## Before editing

Read and follow the shared
[polymer-entry skill](../research-polymer-entry/SKILL.md) and its source-policy
and record-contract references. Then read both references for this skill:

- [Structure contract](references/structure-contract.md) defines the snapshot
  fields, evidence mapping, review states, and canonical V3000 requirements.
- [Style guide](references/style-guide.md) defines representation choices,
  drawing conventions, captions, accessibility text, and the renderer boundary.
- For a careful redraw or corpus audit, read [drawing and corpus review](references/drawing-and-corpus-review.md) for the inventory, chemistry checks, independent inspection, and goal–inspect–improve loop.

Edit only the authoritative publication snapshot. Generated SVG, `.mol`, and
`dist/` files are build products, never authoring sources.

## Entry workflow

1. Resolve the target by exact stable `wopId`. Inspect its canonical scope,
   `entryKind`, relationships, nomenclature, `structureAndMorphology` text,
   sources, and existing depiction before choosing a representation. Never
   target an array position, repeated stub text, slug alone, or trade name.
2. Establish connectivity, stereochemistry, charge, architecture, and the
   limits of the depiction from anonymously accessible sources. Existing
   `structureAndMorphology` mappings are leads; structural evidence must be
   mapped explicitly to `structuralDepictions`.
3. Choose the narrowest honest `representationType` and `fidelity`. Use an
   explicit representative motif, component set, or sourced no-unique-repeat
   explanation when an exact repeat unit would overstate the material.
4. Choose placement by the role of the chemistry. The article hero must
   describe the polymeric material itself: a repeat unit, stereochemical
   segment, architecture, network fragment, component set, bounded Markush
   motif, or an honest `no_unique_repeat` explanation. Put finite monomers,
   oligomeric precursors, and prepolymers under
   `contextualStructures.feedstocksAndSynthesis`; put curing agents and
   crosslinkers under `contextualStructures.processing`. A contextual figure
   supplements its section and does not substitute for an honest hero state.
5. Draw or review the connection table in Ketcher as MDL V3000 with explicit
   curated 2D coordinates. Use SRU or COP S-groups where chemically applicable.
   Check bracket-crossing bonds, attachment points, valence, formal charges,
   counterions, stereobonds, sequence claims, substitution, and labels before
   serializing it in `chemicalStructures`. For Markush motifs, use one plain
   `R` only for a single variable or explicitly equivalent repeated sites; use
   standard numbered `R#`/`RGROUPS` records when sites are independent or
   position-specific, and define every visible label in item `notation`.
6. Populate `structuralDepictions` and any contextual groups with a visible
   scope note, source IDs, and complete item labels, fidelity, alt text, and
   captions. Reuse a structure
   definition only when its constitution, stereochemistry, charge state, and
   S-group meaning are identical. Before changing a shared definition, find
   and review every referencing `wopId`.
7. Review the diff by `wopId` and confirm that only intended entries and
   deliberately shared definitions changed. Stable polymer IDs and routes must
   remain unchanged.

Do not infer a connection table from a polymer name, guess missing stereo or
sequence, copy or trace a source figure, use SMILES as the canonical record,
or hand-author/edit generated SVG. A visible research gap is preferable to a
plausible but unsupported structure.

## Renderer changes

Treat a renderer change as a scientific-data migration, not a cosmetic swap.
The candidate must parse canonical MDL V3000 directly and preserve authored 2D
coordinates, atom and bond stereo (including explicit unknown stereo), formal
charges, disconnected components, and SRU/COP S-groups. A SMILES-only renderer
may be used as a visual benchmark, but it cannot produce publication assets
because SMILES does not carry the complete repository depiction contract.

Before changing the repository-wide style or renderer, run the controlled
three-case trial and independent-review loop defined in the style guide. Use
chemically identical V3000 inputs for every candidate in a comparison. Update
this skill and its style reference with the review findings before beginning
the next cycle, and stop after three cycles rather than relaxing a chemical
fidelity requirement. Renderer adapters may change presentation only where the
style guide explicitly permits it; they must never rewrite the downloadable
canonical `.mol` record.

Keep the independently accepted isotactic-polypropylene dyad, PEDOT:PSS
two-component presentation, and connected PS_x–PB_y–PS_z architecture in the
renderer golden set. Any future renderer or style version must pass all three
again; a normalized hash match does not replace chemical and visual review.

The accepted style v6 adds a perpendicular free-valence mark at each terminal
attachment that is not already identified by a repeat-group boundary. It does not
change a stereobond or canonical V3000; see the style guide for the trial and
visible notation.

The synthesis-pilot bracket review established style v5: readable repeat
subscripts are positioned independently below/right of their own exit bracket,
and compact article headers must not shrink the chemical labels into thumbnails.
PS and PMMA use short backbone-crossing brackets; PET brackets exclude unrelated
vertical extents. Do not derive bracket height from the whole molecule's bounds.
For corrections to an existing canonical record, explicit coordinate-only edits
may follow Ketcher atom-geometry review when the editor does not retain authored
BRKXYZ. Preserve the original graph, stereo, membership, and XBONDS; verify the
actual final bracket/bond intersections and rendered figure independently.
Ketcher 3.12's tested V3000 export regenerated bracket coordinates and omitted
XBONDS; it is not a lossless replacement for these corrected canonical records.

## Validate and preview

Run these checks after one entry or a coherent batch:

```bash
npm run structures:validate
npm run structures:preview -- wop-NNNNNN
npm run structures:coverage
npm run structures:contact-sheet
npm run check
```

Inspect the single-entry preview for every edited depiction. For a batch,
inspect the contact sheet as well as machine validation. Confirm bracket and
attachment geometry, stereochemistry, charges, readable labels, unclipped
content, caption fidelity, complete R-group restrictions, differentiation of
non-equivalent R sites, and the absence of unintended structure sharing.
For tactic segments, verify atom-centred relative configuration rather than
inferring `m`/`r` from wedge/hash appearance alone. For adjacent block SRUs,
trace the chain through each exit stroke and then the next entry stroke; their
visual domains must not overlap or reverse. Use ordinary bonds for unclaimed
local configuration and reject avoidable explicit carbon labels created by
poor collinear geometry; correct the authored coordinates instead. For
carbohydrate SRUs, mentally close the two repeat
crossings and confirm that the virtual stitch contains exactly the intended
glycosidic oxygen; an extra terminal oxygen can silently turn a C–O–C linkage
into O–O or C–O–O–C.
Preview output does not authorize editing the generated SVG or `.mol`; correct
the V3000 source or metadata and render again.
