---
name: research-polymer-synthesis
description: Populate a Wiki of Open Polymer Data entry’s feedstocks and synthesis section from open sources.
---

# Research Polymer Synthesis

Populate only `sections.feedstocksAndSynthesis`. First read and follow
[the shared polymer-entry skill](../research-polymer-entry/SKILL.md) and its two
linked references; they control source eligibility, public records, maturity,
and validation.

## Population target

Use at least two distinct open documents from two source lineages. Prefer an
open textbook, paper, thesis, public patent, institutional material, or official
technical source. The sources may play different roles: one can establish the
family chemistry while another supplies an industrial, historical, or route
example. Prefer that complementary pairing when it is readily available rather
than using two general reviews by default.

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

For a natural polymer, describe its biological source, biosynthesis, extraction,
purification, or derivatization as appropriate instead of forcing it into a
synthetic-polymer template. Keep later casting, molding, spinning, gelation, or
curing in the Processing tab.

For thermosets and elastomers, describe network-forming reactants and chemistry
here; put the article-shaping cure or vulcanization operation, schedule, and
equipment settings in Processing. A source may support both tabs when it
directly contains both kinds of evidence.

Do not invent a recipe from a conceptual mechanism or combine separate routes
into one procedure. Label laboratory, patent, historical, and catalyst-specific
examples when that scope is important. A compact population draft should cover
the principal feedstock, polymerization class, and at least one meaningful
route or control variable when the sources permit.

## Draft and review

Write an independent synthesis that separates established family chemistry
from source-specific examples. A useful population draft normally identifies:

- the principal monomer, precursor, or natural feedstock;
- the polymerization, network-forming, biosynthetic, extraction, or
  modification route that defines the material;
- at least one meaningful catalyst, initiator, medium, reaction control, route
  variant, or manufacturing example when the open sources provide it.

Map only sources that directly support `feedstocksAndSynthesis` and record a
useful locator and access/reuse status. Do not map an article-fabrication source
to synthesis merely because it identifies the starting resin. Do not block a
source-backed draft on exhaustive route coverage; leave broader comparison and
present-day prevalence checks for later hardening.

Run `npm run check` once after completing the requested article or batch.
