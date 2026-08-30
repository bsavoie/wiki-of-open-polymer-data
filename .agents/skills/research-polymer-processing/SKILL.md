---
name: research-polymer-processing
description: Research or review conversion and processing for a Wiki of Open Polymer Data entry, separating family-level processability from grade-specific drying, temperature, pressure, residence-time, and tooling guidance. Use for the Processing tab, not upstream polymer synthesis.
---

# Research Polymer Processing

Populate only `sections.processing`. First read and follow
[the shared polymer-entry skill](../research-polymer-entry/SKILL.md) and its two
linked references.

## Evidence target

Use at least two distinct documents from two independent source lineages. Pair
family-level process evidence from open literature, courseware, or an
institutional reference with independently published operating guidance when
that broader evidence is available. Otherwise use independently scoped process
examples, do not synthesize them into a family window, and retain
`processing_data_needed`. Two grade sheets from one supplier are one lineage.

## Define the processing boundary

This tab covers conversion of polymer resin, latex, solution, prepolymer, or
compound into an article. Upstream monomer-to-polymer manufacture belongs in
the Synthesis tab. Cover, when directly supported:

- suitable operations such as extrusion, injection molding, blow molding,
  thermoforming, fiber spinning, casting, coating, vulcanization, or curing;
- feed preparation, drying and moisture control, compounding, and preheating;
- melt, mold, die, tool, or cure temperatures and other operating windows;
- shear, pressure, residence-time, cooling, shrinkage, annealing, orientation,
  or degradation constraints;
- how molecular mass, branching, crystallinity, reinforcement, plasticizer,
  or grade design changes processability.

Never publish an unsupported family-wide window. Attribute numbers to the
named grade, formulation, machine/setup, and source. Treat vendor guidance as a
starting window, not a guarantee, and preserve warnings about moisture,
thermal history, residence time, shear, fumes, or decomposition.
When guidance is grouped by melt-flow band or another grade selector, preserve
the band-to-setting mapping instead of collapsing the table into a single broad
range. Scope statements such as “predrying is unnecessary” to the supplier's
covered resin set unless independent evidence supports the whole entry.
The nearest table or subsection heading controls scope: a named-grade page may
embed guidance explicitly labeled for a broader or different resin set. Do not
decode composition from designators such as `PA6-GB30` without a supporting
nomenclature source. For moisture targets, retain the stated basis, measurement
point, and method, or explicitly say which of them the source leaves unstated.

## Draft and review

Separate generally suitable processes from bounded operating examples. Map
every used source to `processing`, record exact locators and access/reuse
status, and keep `grade_variation_not_captured` when the entry is broader than
the compared evidence. Before publication, challenge whether each numeric
window is really portable across grades and whether synthesis has been
mistaken for article conversion.

Run `npm run check` after updating the authoritative snapshot.
