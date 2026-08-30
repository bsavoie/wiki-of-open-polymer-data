# Repository instructions

This repository is a completeness-first, open-source-grounded encyclopedia of
polymer families and established polymer materials.

Before adding or revising substantive polymer content, read and follow
`.agents/skills/research-polymer-entry/SKILL.md` and its two linked references.
For the three core evidence tabs, also use the matching specialist skill:
`research-polymer-synthesis`, `research-polymer-mechanical-properties`, or
`research-polymer-processing`.

## Non-negotiable publication rules

- `public-data/wop-publication-snapshot-v1/snapshot.json` is the authoritative
  publication input. Generated `dist/` output is never an authoring source.
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

Run `npm run check` before handing off changes. A failed import or build must
leave the prior validated snapshot or generated site intact.
