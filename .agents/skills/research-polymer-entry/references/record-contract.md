# Polymer record contract

## Identity and scope

Every canonical record has a stable `wopId`, canonical name and slug,
alternate names, abbreviations, and an `entryKind`: `family`, `polymer`,
`subfamily`, `copolymer`, `network`, `modified_polymer`, or `grade_family`.
Established multi-polymer materials may instead use `polymer_blend` or
`polymer_complex`; do not mislabel a blend or ionically associated complex as
a chain copolymer.

Family and instance records may coexist when their research questions and
processing behavior differ. Use `relationships` (`broader`, `narrower`, or
`related`) rather than treating them as aliases. An alias is appropriate only
when two names identify the same scope.

## Taxonomy

`primaryClass` is a browsing convenience. The scientific classification is
multi-axis:

- `materialBehaviors`: thermoplastic, thermoset, elastomer, fiber, hydrogel,
  coating, adhesive, foam, ionomer, biopolymer, or functional material.
- `marketTiers`: commodity, engineering, high performance, or specialty.
- `origins`: synthetic, semisynthetic, natural, or bio-based.
- `chemistryClasses`: extensible structural/source-based class slugs.
- `functionalTags`: extensible, non-exclusive performance or material-state
  descriptors such as barrier, water-soluble, liquid-crystalline, or
  ion-conducting.

These arrays may overlap. Do not infer properties solely from the primary
browsing class.

## Article sections

All section keys are always present as strings: `overview`, `history`, `nomenclature`,
`feedstocksAndSynthesis`, `mechanicalProperties`, `processing`,
`structureAndMorphology`, `properties`, `applications`,
`degradationAndStability`, `recyclingAndEndOfLife`,
`healthSafetyAndRegulation`, and `limitationsAndVariability`. The dedicated
`mechanicalProperties` field holds measured mechanical behavior;
`properties` remains available for thermal, electrical, optical, barrier, and
other non-mechanical properties.

`history` distinguishes discovery or first synthesis, commercial introduction,
and later technical development; it traces researchers, companies, and major
historical uses within the record's scope. Natural polymers have histories of
use, isolation, and scientific understanding rather than invention dates.
Do not transfer a family invention date to a narrower variant, turn a patent
filing into proof of first invention, or hide conflicting historical accounts.
History evidence maps to `supports: ["history"]` and uses the same typed-source
access, reuse, and pinpoint requirements as other article prose.

Empty strings are explicit gaps. Every non-empty value requires at least one
article source whose `supports` array names that exact key.
The three core fields additionally require two distinct source documents and
two declared source lineages.

## Sources

Each article source records a stable source ID, controlled source type, complete
citation, optional bare `doi`, full-content public URL, locator, access date,
`anonymous_full_content` status, reuse status, permission/license basis, and
the exact article section keys directly supported.

Use `url` for the canonical public landing or citation page. When the full text
is at a distinct address, put that direct address in optional `contentUrl`.
Neither URL field implies permission to reproduce the source; `reuseStatus`,
`permissionBasis`, and optional `licenseUrl` record that separately.

Different uses of one document may share a URL but retain distinct locators and
support mappings. Do not merge distinct evidence occurrences merely because
they have the same publisher or lineage.

The validator proves that a populated section has a mapped source, not that the
prose is a faithful or properly scoped interpretation. Reviewers must check
claim meaning, family-versus-grade boundaries, conditions, and numerical
qualifiers against the cited locator.

## Quantitative records

Narrative sections may summarize well-supported values. The optional v2
`evidence` array now holds typed mechanical measurements and processing
examples with numeric bounds, units, material, conditions, method, source,
locator and limitations. Optional uncertainty must state its meaning or that
the source does not specify the statistic. Preserve sequential process
setpoints as such; do not turn them into a universal operating range.

## Research questions and reviews

Optional `research` metadata holds scoped questions, attempts, resolutions,
section reviews and public change history. Empty prose, measured evidence,
question closure, section review and article maturity are distinct states.
An access-limited search can close as `no_eligible_evidence` while leaving the
scientific section empty. Reopened questions retain prior outcomes.

Use the [research improvement workflow](../../../../docs/research-workflow.md)
for exact field contracts and the proposal/review/publication commands.
Review receipts and author/reviewer identities stay in private work files.
Section review hashes bind a review to the actual content and become stale
when that content changes. A bounded evidence extraction does not establish
that an entire section has been reviewed.

## Validation

The schema rejects duplicate IDs/slugs, dangling relationships, alias route
collisions, private/local paths, URLs outside typed source URL fields, closed or
unknown access states, unsupported prose sections, and non-empty prose on a
`stub` record.
