# Polymer-entry hardening roadmap

Read this only for an explicitly requested review, correction, or hardening
pass. It is not an acceptance checklist for completeness-first population.

The first 20-record alphabetical population test produced all three core tabs
for every entry from 45 open source records. It also showed predictable draft
limitations: many sources were mapped broadly across all three tabs, most
mechanical and processing prose remained qualitative, and several initial
citations needed lightweight metadata or access correction.

## Stage 1: low-friction cleanup

The population skills already encourage complementary sources, narrow support
mapping, concrete examples, open full text, and clean synthesis/processing
boundaries. During an explicitly requested review, check those defaults
systematically without requiring a schema change:

- Check whether each source locator actually supports every listed `supports`
  key; give extra attention to sources mapped to all three core tabs.
- Prefer a complementary source pair: one for family context and one carrying
  mechanical measurements or processing practice when openly available.
- Improve thin tabs with one bounded mechanical endpoint and one bounded
  processing example when a suitable source is easy to obtain. Otherwise state
  the data gap rather than holding back the article.
- Separate polymer manufacture from article conversion and distinguish natural
  feedstock extraction from downstream film, gel, or fiber preparation.
- Replace abstract-only or unstable direct links with a canonical landing page
  plus a working `contentUrl` when available.
- Preserve existing article sources when merging later overlays.

## Stage 2: structured evidence

Add this only when reusable quantitative data becomes a project priority:

- Introduce optional typed mechanical evidence with endpoint, value/range,
  units, material or grade, specimen, conditioning, method, source, locator,
  and limitations.
- Introduce optional typed processing evidence with operation, material or
  grade, parameter, value/range, units, equipment or setup, source, locator,
  and limitations.
- Record source roles such as family context, measured dataset, vendor window,
  experimental preparation, historical route, or review.
- Build claim-to-locator mappings for important or disputed statements rather
  than requiring them for every population paragraph.
- Expand representative grade/formulation breadth and document conflicts where
  values are not portable.

## Stage 3: mature-publication review

Reserve these checks for entries being considered for
`open_source_reviewed`:

- Recheck live anonymous access, document identity, exact locators, reuse
  status, and license claims.
- Review supplements, footnotes, uncertainty, specimen and test conditions,
  formulation details, and important omitted qualifiers.
- Review identity, aliases, taxonomy, relationships, maturity, confidence, and
  unresolved flags.
- Add current safety and regulatory sources with explicit jurisdiction and
  dates when those sections are populated.
- Run the full repository validation, tests, build, and a focused public diff
  before raising maturity.
