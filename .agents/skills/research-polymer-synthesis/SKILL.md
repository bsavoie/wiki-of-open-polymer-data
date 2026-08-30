---
name: research-polymer-synthesis
description: Research or review feedstocks and synthesis for a Wiki of Open Polymer Data entry, with polymer-boundary controls, independent open-source corroboration, and claim-to-section source mapping. Use for the Synthesis tab; do not use it as evidence for processing or properties unless those claims are separately researched and mapped.
---

# Research Polymer Synthesis

Populate only `sections.feedstocksAndSynthesis`. First read and follow
[the shared polymer-entry skill](../research-polymer-entry/SKILL.md) and its two
linked references; they control source eligibility, public records, maturity,
and validation.

## Evidence target

Use at least two distinct documents from two independent source lineages. A
source counts only when its exact locator directly supports a published claim.
Prefer an open textbook, open paper, thesis, public patent, or institutional
course material over generic explanatory pages. A single review may orient the
search but must not become the only evidence lineage.

## Scope the chemistry

Before drafting, resolve whether the entry is a family, one polymer, a
copolymer, a network, a modified polymer, or a grade family. Report only what
the sources establish for that boundary. Cover, when evidence permits:

- monomer or precursor identities and their industrially relevant origins;
- polymerization class, initiator/catalyst system, and the role of key
  reagents;
- reaction phase or medium, broad operating mode, and molecular-weight or
  architecture controls;
- meaningful route variants and which material structures they produce;
- isolation or finishing only when it is part of polymer manufacture rather
  than downstream article processing.

Do not invent a recipe from a conceptual mechanism. Do not combine conditions
from separate routes into a synthetic procedure. If a source describes a
laboratory demonstration, patent example, or particular catalyst technology,
label that scope rather than presenting it as the universal commercial route.
Treat old process surveys as historical evidence and patents as disclosed
embodiments: neither establishes present-day prevalence without a separate,
current source.

## Draft and review

Write an independent synthesis that separates well-established family-level
chemistry from source-specific examples. Map every used source to
`feedstocksAndSynthesis`, record an exact locator and access/reuse status, and
keep unresolved details out of the prose. Before publication, run an
overbreadth pass: challenge monomer scope, catalyst generality, route
prevalence, and any assertion that a method is industrial or dominant.

Run `npm run check` after updating the authoritative snapshot.
