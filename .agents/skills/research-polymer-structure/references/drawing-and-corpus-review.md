# Polymer drawing and corpus review

Use this protocol when a user requests a careful structural audit or redraw,
including a corpus-wide quality pass. It supplements the structure contract
and style guide; it does not authorize unsupported claims or change the
canonical snapshot boundary. Start with the actual rendered work and its
underlying V3000, not a presumption that a previous `reviewed` value or a
successful parse means the drawing is correct or clear.

## Define the goal and inventory

The goal for each item is a source-supported depiction that a reader can
recognize as the scoped polymer, with chemically valid connectivity and no
implied stereochemical, sequence, composition, or architecture claim beyond
the evidence. A clear scope boundary is a valid result when a unique structure
would be misleading. Representative and schematic items can be correct when
clearly identified; making every material look like one linear repeat is not
the objective.

Freeze the work list to the snapshot under review: record its byte hash, every
`wopId`, each hero and contextual depiction group, synthesis-route participant
references and their roles, and their referenced `structureId` values.
Separately inventory unique definitions and all their
references. The number of entries, unique structures, and rendered uses are
different denominators. Include no-unique-repeat entries, every item of
multi-component figures, and contextual monomers or crosslinkers. A shared
structure must be chemically correct for *each* referenced scope, not only its
first article. Research the cited source and its exact locator for each claim;
inspect additional anonymous open sources when evidence is missing or
ambiguous. Respect source access and reuse policy, independently encode the
facts, and never copy source drawings.

Create an ignored local review ledger or equivalent work artifact, keyed by
`wopId`, group (and route/participant where applicable) and `structureId`, with source/locator, snapshot or definition
hash, scope, proposed decision, defect, evidence, action, preview location,
reviewer outcome, and unresolved limitations. Use explicit states such as
`uninspected`, `evidence-needed`, `revise`, `independent-review`, `accepted`,
and `unresolved`; do not overwrite published schema status to manufacture a
pass. Track source problems separately from figure problems. Recheck any item
whose record, source claim, connection table, or renderer changed after review.
Do not publish private paths, review identities, or local notes in the snapshot.

## Inspect the scientific object

For each use, compare the article or synthesis-route scope, representation, visible figure, scope
note, caption and legend to the primary evidence and connection table. Treat
these as separate checks:

1. **Representation.** Decide whether an exact constitutional or stereochemical
   repeat, a variable scaffold, set of possible repeat units, connected block
   architecture, network fragment, disconnected components, or a no-unique
   boundary describes the material. A monomer or capped finite molecule must
   not read as a polymer repeat. A finite fragment can be useful when it is
   explicitly labeled as such and its continuation/limits are honest.
2. **Continuity.** Trace the polymer backbone through both SRU crossing bonds
   and mentally join at least two copies. Check resulting bonds, atom and bond
   types, valences, oxygen counts, head/tail orientation, and substituent
   placement; no terminal capping atom or dangling end should be mistaken for a
   repeat continuation. For multi-SRU blocks trace each adjacent junction in
   order. Where meaningful, independently compute/inspect an expanded local
   chain graph from the validated V3000; do not use expansion to rewrite it.
3. **Connectivity and scope.** Check linkages, functional groups, substitution
   positions, aromaticity, charge, counterions, bond order, atom valence and
   actual polymerized form against the source; verify the depiction is not a
   precursor. For copolymers distinguish possible units from connected
   sequences, blocks, blends and compositions. Repetition of an entire block
   architecture must not be implied unless supported.
4. **Stereochemistry.** A constitutional repeat and a stereorepeating unit
   answer different questions. Check the cited stereochemical scope, geometry,
   V3000 bond orientation and parser-assigned atom-centered configurations;
   examine at least a dyad when a relationship between adjacent stereocenters
   is claimed. Trace the same orientation and equivalent substituents when
   interpreting meso/racemo and tactic sequences; equal wedge marks or equal
   R/S labels alone do not prove a tactic relationship. Check alkene geometry
   independently. Do not invent tacticity, universal stereo, sequence,
   distribution, or an unspecified-molecular-weight end group.
5. **Variables and components.** Inspect each `R`/`R#` site, its bond and
   visible definition, whether repeated labels denote equivalent variables,
   and whether the range is supported. Number independent sites. Check whether
   omitted substitution, counterions, charges, co-components, crosslinks or
   degree of substitution make the material materially misleading. Do not make
   ionic material look covalently bonded merely to fill a drawing.
6. **Reader view.** Inspect the actual generated SVG in its article context and
   at readable scale, not just a contact-sheet thumbnail. Confirm visible
   bracket strokes and repeat label, crossing positions, no bracket through a
   substituent, credible skeletal bond lengths/angles, legible stereo and atom
   labels, no collisions, clipping or false shared bonds, and clear captions
   and scope. Check compact and narrow views for representative complex cases.
   The point of recognizable polymer notation is to show valid continuity, not
   to add decorative brackets to a non-repeating object.

The IUPAC definitions of [constitutional repeating unit](https://goldbook.iupac.org/terms/view/C01286),
[stereorepeating unit](https://goldbook.iupac.org/terms/view/S05988),
[tacticity](https://goldbook.iupac.org/terms/view/T06244), and
[r diad](https://goldbook.iupac.org/terms/view/09586) clarify these distinctions;
material-specific structure and stereochemistry still require material-specific
evidence. Use source-local terminology when reporting a finding.

## Goal–inspect–improve loop

1. Select a bounded, nonoverlapping batch by `wopId` and representation class.
   Give independent reviewers the rendered article, canonical V3000 and source
   location, without telling them the expected conclusion. When delegation is
   available, divide batches by record ownership and keep a separate reviewer
   from the author. Do not have agents simultaneously edit the snapshot; merge
   proposals serially against its current hash.
2. Inspect using the six checks above. Capture concrete defects with the exact
   atom, bond, bracket, source and scope as applicable; distinguish a proven
   defect from an unresolved question. A validator, contact sheet, prior
   review marker, or numerical score cannot substitute for this inspection.
3. Fix the source V3000 or metadata, or leave an evidence-bounded gap if no
   defensible correction can be established. Review every use before modifying
   a shared definition; if one change cannot satisfy all uses, separate the
   definition with stable, unambiguous identity. Preserve identifiers, routes,
   data lineage, and other unrelated record content. Follow the Ketcher and
   bracket-coordinate cautions in the main skill and style guide; never edit
   generated SVG or `.mol` files.
4. Render again, compare before/after at article and contact-sheet scale, and
   have an independent reviewer recheck the complete affected object and its
   evidence, not just the original defect. Iterate while findings remain; if a
   question needs unavailable evidence, mark it unresolved rather than
   guessing. Do not impose the renderer's three-cycle comparison limit on
   ordinary scientific fixes: continue meaningful review until the drawing is
   defensible or state the specific blocker.
5. Run the required per-entry/batch checks and the repository-wide check after
   the final edit. Reconcile the frozen inventory and the live snapshot before
   claiming completion: identify accepted, changed, unchanged, unresolved and
   not-yet-reviewed uses, plus unique definitions and any source gaps. Only
   declare the corpus complete when no targeted use is silently skipped.

For user review, select a small, diverse set of final examples—e.g. a regular
unit, a tactic dyad, a variable R-group scaffold, a copolymer architecture,
and an irregular or no-unique case—with article links and one-sentence scope
notes. Offer the actual evidence and current depictions, not unrendered claims;
a few examples for user feedback are not a substitute for the complete review.
