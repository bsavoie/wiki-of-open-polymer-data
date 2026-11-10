# Corpus completion research, 8 September 2026

This pass updates all 262 canonical articles, fills 322 previously empty
sections, and expands 107 of the 263 synthesis-route mechanism descriptions.
It adds 504 typed source associations representing 178 distinct full-content
URLs. The publication input is the v2 snapshot; stable identities are unchanged.

| Section or record | Before | After |
| --- | ---: | ---: |
| Health, safety, and regulation | 0 / 262 | 262 / 262 |
| Degradation and stability | 257 / 262 | 262 / 262 |
| Recycling and end of life | 206 / 262 | 261 / 262 |
| Other article sections | 262 / 262 each | 262 / 262 each |
| Synthesis routes expanded in this pass | — | 107 |

One existing feedstocks-and-synthesis section, phthalonitrile resin, also gains
a qualified explanation of curing chemistry. Existing History, Applications,
mechanical-property and processing text is preserved.

## Evidence and scope

Parallel class batches cover thermoplastics, networks and rubbers, and
biological and specialty polymers. Supplements address polyethers, conjugated
polymers and family entries. Each new source names the section it supports and
records its content location, access date, access status and reuse status.
Original studies, public technical guidance, patents, public preprints and
manufacturer documents retain their different evidentiary roles.

The new health sections address handling and processing exposure with
material-specific qualifications. They distinguish finished materials from
monomers, formulation ingredients and thermal decomposition products.
Food-contact and other regulatory statements retain their jurisdiction and
scope; a grade-specific statement is not approval of an entire polymer family.

Degradation text separates products and pathways, measured timescales, and
environmental persistence. For example, the PPV supplement reports a
photoluminescence endpoint under a specified illumination experiment, not a
mass-loss rate or environmental lifetime. Unresolved mineralization and
molecular-product questions remain explicit within populated sections.

End-of-life coverage includes demonstrated recovery, reuse, collection and
disposal constraints. These are not interchangeable. The CO/ECO examples
recover chlorine from specified polymer feedstocks; the P3HT example recovers
a semiconductor from a deliberately separable device and reports performance
losses. The fluorene example relies on engineered imine bonds and does not
establish cleavage of conventional carbon–carbon polyfluorene backbones.
Some entries, including MEH-PPV, contain only qualified device-level collection
guidance because polymer-specific recovery remains unresolved. Each article's
typed sources support its particular example.

Mechanism updates combine general bond-formation explanations from openly
readable teaching references with existing material-specific synthesis
evidence. They expand reaction descriptions and procedure outlines while
preserving reactants, processing conditions and structural references.
The phthalonitrile explanation identifies a proposed catalyst-dependent
pathway rather than assigning one universal network structure. No chemical
connection tables or mechanism drawings were invented or changed.

## Remaining work

Phthalonitrile resin (`wop-000130`) retains an empty recycling/end-of-life
section: this pass did not obtain eligible full-content evidence for a
material-specific recovery route. This is an evidence gap, not a claim that
recovery is impossible.

Populated sections are a starting point for continued research. Future passes
can improve environmental mineralization measurements, molecular-product
identification, formulation-specific handling evidence and recovery yields,
as well as replace narrow examples with broader demonstrated technologies.
All articles retain their research-draft maturity and review flags.

## Authoring and validation

The [curated batches and guarded assembler](../scripts/curated-completion-20260908/README.md)
record this pass. The assembler validates the complete snapshot before atomic
import and rejects replay over subsequently changed research fields or sources.

Preservation checks compare the complete publication against the pre-pass
snapshot: all stable identities, existing sources, chemical structures,
depictions and unrelated fields remain unchanged. Route edits are limited to
mechanism descriptions, steps and source references. The frozen v1 snapshot
and the existing interface files remain unchanged.

`npm run check` passed: snapshot validation, all 243 chemical structures,
strict structure coverage, all 51 tests and a build of all 262 article pages.
An existing test that assumed ABS still had an empty Overview field was updated
to check the populated page; its positive gap assertion now uses the empty-stub
fixture.

All 262 built pages have the four degradation topic headings, a health section,
unique anchors and valid local citation targets. Browser checks confirmed the
new PPV degradation text and citation navigation, and phthalonitrile health and
synthesis content. Current degradation coverage is tracked in
[the degradation coverage report](degradation-coverage.md).
