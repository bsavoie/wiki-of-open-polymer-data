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

All section keys are always present as strings: `overview`, `nomenclature`,
`feedstocksAndSynthesis`, `mechanicalProperties`, `processing`,
`structureAndMorphology`, `properties`, `applications`,
`degradationAndStability`, `recyclingAndEndOfLife`,
`healthSafetyAndRegulation`, and `limitationsAndVariability`. The dedicated
`mechanicalProperties` field holds measured mechanical behavior;
`properties` remains available for thermal, electrical, optical, barrier, and
other non-mechanical properties.

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

Narrative sections may summarize well-supported values, but reusable property
or processing datasets should be added as typed records in a future schema
revision. Such a revision should capture value/range, units, material grade and
composition, specimen and conditioning, test method, process, source and
pinpoint, plus limitations. Do not put an untyped bag of numbers into a prose
field and call it machine-readable data.

## Validation

The schema rejects duplicate IDs/slugs, dangling relationships, alias route
collisions, private/local paths, URLs outside typed source URL fields, closed or
unknown access states, unsupported prose sections, and non-empty prose on a
`stub` record.
