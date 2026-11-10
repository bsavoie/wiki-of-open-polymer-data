---
name: research-polymer-processing
description: Populate a Wiki of Open Polymer Data entry’s processing section with source-qualified manufacturing information.
---

# Research Polymer Processing

Populate only `sections.processing`. First read and follow
[the shared polymer-entry skill](../research-polymer-entry/SKILL.md) and its two
linked references.

## Population target

Use at least two distinct open documents from two source lineages. Pair broad
process information with independently published operating guidance when
available. Otherwise, two clearly labeled grade, laboratory, or process
examples can establish useful initial coverage. Two sheets from one supplier
remain one lineage. Prefer at least one source that contains an actual
conversion method, operating example, or handling constraint rather than two
documents that only list applications.

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

For thermosets and elastomers, network-forming reactants and chemistry belong
in Synthesis; article shaping plus the cure or vulcanization operation,
schedule, and equipment settings belong here. A source may support both tabs
when it directly covers both.

Do not present a grade window as universal. Attribute numeric settings to the
named grade, formulation, experiment, or supplier guidance and retain important
warnings such as drying, residence-time, shear, or decomposition limits. Keep
grouped grade-to-setting mappings when they materially change the advice. A
population pass need not inventory every unreported machine, moisture, or test
detail.

## Draft and review

Separate generally suitable processes from bounded operating examples. A useful
population draft normally contains:

- one or more suitable article-conversion routes;
- feed preparation, compounding, drying, cure, cooling, orientation, or other
  major handling requirements when relevant;
- one focused attempt to find a bounded operating example or constraint;
  include it when an open source readily provides it, otherwise give a clear
  qualitative description of what was found.

Map a source to `processing` only when it describes conversion of resin, latex,
solution, prepolymer, or compound into an article. Polymerization, extraction,
halogenation, or other upstream manufacture belongs in Synthesis even when an
industrial paper calls it a process. Record useful locators and access/reuse
status, and normally retain `processing_data_needed` and
`grade_variation_not_captured`. Exhaustive equipment and grade-portability
review belongs to later hardening.

Run `npm run check` once after completing the requested article or batch.
