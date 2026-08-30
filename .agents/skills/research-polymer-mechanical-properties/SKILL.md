---
name: research-polymer-mechanical-properties
description: Research or review mechanical-property evidence for a Wiki of Open Polymer Data entry, preserving grade, composition, specimen, conditioning, test-method, and processing limitations. Use for the Mechanical properties tab; do not generalize a datasheet or one experiment to an entire polymer family.
---

# Research Polymer Mechanical Properties

Populate only `sections.mechanicalProperties`. The separate `properties` field
is reserved for thermal, electrical, optical, barrier, and other non-mechanical
behavior. First read and follow
[the shared polymer-entry skill](../research-polymer-entry/SKILL.md) and its two
linked references.

## Evidence target

Use at least two distinct documents from two independent source lineages. Seek
one source that explains the material-level behavior and a second that provides
independent measurements or a comparably scoped dataset. Public manufacturer
documents are acceptable for a named grade, but label them as vendor evidence
and do not use two documents from the same supplier as independent
corroboration.

## Preserve the measurement envelope

For every quantitative value or range, retain as much of the following as the
source reports:

- exact polymer, grade, formulation, reinforcement, additives, and morphology;
- specimen form, orientation, preparation process, and dimensions when
  consequential;
- dry/as-molded/conditioned state, humidity, moisture content, and temperature;
- test method, loading mode, speed or strain rate, and direction;
- statistic, range, uncertainty, or sample limitation.

Run an explicit unreported-fields pass. If the source omits grade identity,
composition, conditioning protocol, specimen geometry, direction or rate, or
replicate/statistical basis, state that omission beside the affected numbers.
Do not decode a formulation or filler fraction from a material designator such
as `PA6-GB30` unless a separate source defines it.

Prioritize tensile modulus, tensile strength and yield behavior, elongation,
flexural response, impact response, compressive or tear behavior, creep,
fatigue, and hardness only as relevant to the material. Mechanical properties
are distinct from thermal, electrical, optical, barrier, and rheological data;
do not fill this tab with a general property catalog.

## Draft and review

Lead with qualitative structure–mechanics relationships that survive across
the claimed scope. Put grade-specific numbers in explicitly bounded examples,
not family-wide ranges. Say when methods or conditioning differ so values
should not be compared directly. Map every used source to
`mechanicalProperties` and add `grade_variation_not_captured` unless the
evidence genuinely compares a representative breadth of the entry.

Before publication, run an adversarial pass for hidden filler, reinforcement,
orientation, crystallinity, moisture, temperature, strain-rate, and process
history effects. If a paper reports only two tests, ambiguous specimen
conditioning, or internally non-monotonic results, retain those limitations and
do not promote the trend to a family rule. State explicitly which material and
process subsets were actually varied before reporting a trend. Run
`npm run check` after updating the authoritative snapshot.
