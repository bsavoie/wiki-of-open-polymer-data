# Degradation and recovery coverage

Every canonical article has a Degradation tab. It displays two existing v2
fields, `degradationAndStability` and `recyclingAndEndOfLife`; no new schema or
chemical-structure record is needed. The tab is available on empty stubs, with
research gaps displayed rather than inferred claims.

For population work, use the polymer entry skill and its source policy. Author
three paragraphs in `degradationAndStability` with these exact prefixes:

- `Degradation products and pathways:`
- `Timescales:`
- `Environmental persistence:`

The renderer promotes these labels to headings while keeping the public data
as plain text. Existing prose without the labels remains readable. Write
`recyclingAndEndOfLife` as ordinary paragraphs; it appears under Reclamation
and recycling. Sources must name the field they support. Their locators should
identify the applicable polymer, pathway, test conditions, and recovery route.

Describe known products in the context in which they were measured. Distinguish
polymer chain scission, crosslinking, additive release, and residual monomer;
do not label every leachable substance a degradation product. Products from
pyrolysis or catalytic depolymerization are not automatically products of
weathering in soil or water.

Every reported duration needs an endpoint and environment: molar-mass decline,
mechanical failure, mass loss, disintegration, or measured mineralization;
temperature, medium, illumination, specimen, formulation, and dimensions when
available. Dissolution and fragmentation are not proof of mineralization.
Do not substitute implant resorption, accelerated weathering, or industrial
composting for environmental residence time. Explicitly identify missing
ambient-fate data instead of inventing a universal lifetime.

Recovery coverage distinguishes reuse, mechanical reprocessing, solvent
purification, monomer recovery, feedstock recovery, and energy recovery. Record
whether an example is a laboratory experiment, pilot, vendor-reported process,
or established practice, with the polymer/formulation and contamination limits
supported by the source. Do not infer municipal acceptance from technical
recyclability or describe combustion as material recycling.

Variant entries may share a source when its scope actually includes them.
Clearly label family-level context and named representative examples rather
than assigning another polymer's products or lifetime to a narrow entry.
Keep unresolved coverage review flags. An empty field remains valid when no
eligible supporting source is found.

Run `npm run check` after publication or renderer changes. The existing
`npm run coverage` report counts both fields independently.
