# Repository instructions

This repository is a completeness-first, open-source-grounded encyclopedia of
polymer families and established polymer materials.

For substantive polymer research or content changes, use
`.agents/skills/research-polymer-entry/SKILL.md`; load its source policy for
evidence work and record contract for record edits. Reuse unchanged context
already read; prose-only spelling or formatting fixes do not require a new
literature pass.
For the three core evidence tabs, also use the matching specialist skill:
`research-polymer-synthesis`, `research-polymer-mechanical-properties`, or
`research-polymer-processing`.
For chemical-structure content or renderer work, use
`.agents/skills/research-polymer-structure/SKILL.md` and the references applicable
to that mode. UI-only work does not trigger polymer literature research.

## Non-negotiable publication rules

- `public-data/wop-publication-snapshot-v2/snapshot.json` is the authoritative
  publication input. The v1 snapshot is a frozen legacy artifact whose public
  data URL must remain available. Generated `dist/` output is never an
  authoring source.
- Preserve stable `wop-NNNNNN` identifiers. Names and slugs may be corrected;
  identifiers must not be recycled.
- Empty, clearly labeled stubs are valid. Never fill a section with plausible
  model prose merely to make an entry look complete.
- Every non-empty article section must be supported by one or more typed,
  anonymously accessible sources whose `supports` list names that section.
- Publicly readable and openly licensed are different. Record both access and
  reuse status; paraphrase and cite when reuse rights are unclear.
- Quantitative processing and property claims must retain material/grade,
  specimen, test, and source limitations. Do not generalize a grade datasheet
  into a family-wide claim.
- Taxonomy axes overlap. Do not force a polymer into one exclusive scientific
  class merely because the interface has a primary browsing class.
- Trade names are not canonical family names. Add them only as clearly marked
  search terms or aliases when their scope is unambiguous and legally safe.
- Never publish private paths, credentials, internal research IDs, paywalled
  snippets, copied source prose, or copied source figures.
- MDL V3000 records in `chemicalStructures` are the canonical chemical
  structure data. Never infer a connection table from a name, substitute
  SMILES as the public record, copy a source figure, or hand-edit generated SVG
  and `.mol` assets.

Run `npm run check` for content snapshot, schema, rendering, or application
changes. Documentation-only edits need relevant link/contract checks rather
than a site rebuild. Do not repeat passing checks without new changes or an
unresolved concern. A failed import or build must leave the prior validated
snapshot or generated site intact.
