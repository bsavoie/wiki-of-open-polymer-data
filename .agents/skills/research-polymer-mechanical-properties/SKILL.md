---
name: research-polymer-mechanical-properties
description: Populate a Wiki of Open Polymer Data entry’s mechanical properties section with material- and test-qualified evidence.
---

# Research Polymer Mechanical Properties

Populate only `sections.mechanicalProperties`. The separate `properties` field
is reserved for thermal, electrical, optical, barrier, and other non-mechanical
behavior. First read and follow
[the shared polymer-entry skill](../research-polymer-entry/SKILL.md) and its two
linked references.

## Population target

Use at least two distinct open documents from two source lineages. When
possible, pair a source explaining family-level behavior with an open paper or
public manufacturer document containing measured examples. If broad evidence
is scarce, two independently bounded examples are still useful population
coverage. Two qualitative reviews may still be used when no suitable open
measurement source is found in the pass; keep the resulting gap visible.

## Useful mechanical coverage

Aim to report the important mechanical character of the polymer and relevant
endpoints such as tensile modulus or strength, elongation, impact response,
hardness, creep, fatigue, compression, or tear behavior. A useful population
draft normally contains:

- a concise account of the material's characteristic mechanical response and
  the main structural or formulation variables that change it;
- one focused attempt to find a bounded measured endpoint; include it when an
  open data-bearing source is readily available, otherwise state that this pass
  found only qualitative or neighboring-formulation evidence;
- enough context to show whether the example is a neat polymer, grade,
  compound, composite, fiber, film, gel, or cured network.

For quantitative examples, retain the most consequential information the
source provides without building a full evidence ledger:

- exact polymer, grade, formulation, reinforcement, additives, and morphology;
- specimen form, orientation, preparation process, and dimensions when
  consequential;
- dry/as-molded/conditioned state, humidity, moisture content, and temperature;
- test method, loading mode, speed or strain rate, and direction;
- statistic, range, or uncertainty when readily available.

Do not turn a grade value into a family constant or decode a formulation from a
trade designator without support. A population pass does not require listing
every absent specimen or test field; reserve that exhaustive envelope audit for
later hardening.

Mechanical properties are distinct from thermal, electrical, optical, barrier,
and rheological data; keep those outside this tab.

## Draft and review

Lead with qualitative structure–mechanics relationships, then give explicitly
bounded measured examples when available. Say when values from different
grades or methods should not be treated as one family range. Map a source to
`mechanicalProperties` only when its cited material contains mechanical
behavior or measurements; a synthesis or processing mention alone is not
enough. Normally retain `grade_variation_not_captured` and
`property_data_needed` during population. Detailed supplement, footnote,
conditioning, and uncertainty review is a later hardening task.

Run `npm run check` once after completing the requested article or batch.
