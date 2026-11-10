# Applications authoring

The publication input is `public-data/wop-publication-snapshot-v2/snapshot.json`.
Applications remain in `polymers[].sections.applications`, with typed sources
whose `supports` includes `applications`. The section has its own tab on every
canonical route, including empty stubs. Existing `#applications` links remain
valid. Without JavaScript, the full article stays readable.

This catalog pass covers all 262 existing entries. Each populated entry uses
three blank-line-separated paragraphs, beginning with these exact labels:

- `Products and industries.` identifies documented products, downstream sectors,
  and whether an application is commercial, historical, or research-stage.
- `Purchasing.` identifies verified material forms and supplier or converter
  routes. Grade, copolymer, blend, precursor, and finished-product distinctions
  remain explicit. Supplier names are examples, not endorsements or new aliases.
- `Scale and evidence limits.` gives source-qualified quantities or states the
  missing evidence. A source's year, geography, material scope, and metric stay
  with its number. A calculated quantity is labeled as calculated.

The renderer turns these labels into subheadings. Older unstructured prose
continues to render normally, and an empty field produces a labeled research
gap. No extra schema fields are required.

Production, apparent consumption, supplier sales, announced or operating
capacity, and catalog pack sizes are different measures. Revenue alone is not
tonnage. Package size is not a minimum order or annual demand. Wet dispersion,
precursor, filled compound, dry polymer, film area, and device count must not be
combined without a documented conversion basis. Broad family totals must not
be assigned to individual homopolymers, grades, or architectures.

All sources added in this pass were checked for anonymous full-content access.
Their reuse status is recorded separately. Historical catalogs and future
capacity announcements are dated and qualified; they do not establish current
stock, delivered volume, or completion of planned expansion. Where no reliable
standalone purchase volume or end-use split was available, the entry records
that limitation rather than inventing a market estimate.

Future revisions should use the repository's polymer-entry research skill and
source policy, preserve stable identifiers, and validate the incoming snapshot
before replacement. Run `npm run check` for content or renderer changes.
