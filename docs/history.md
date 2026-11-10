# Polymer histories

Every canonical article has a History tab immediately after Overview. Its text
is stored in `sections.history` in the authoritative v2 publication snapshot.
An empty history remains a valid, visibly labeled research gap. The other tabs
and the frozen v1 data URL retain their existing roles.

Histories distinguish early observation or synthesis, process development,
commercial introduction, and subsequent uses. They identify researchers and
companies where the evidence permits. For natural polymers, describe use,
isolation, and scientific understanding rather than assigning an invention
date. A family milestone does not date every variant, and a patent establishes
a documented contribution rather than automatically proving first invention.
Unresolved first dates and conflicting accounts should be stated explicitly.

Each nonempty history has typed sources mapped to `history`, with an
anonymously accessible full-content address, a passage or page locator, access
date, and a separate reuse-rights statement. Corporate retrospectives support
the identified company's lineage; proposed patent applications do not by
themselves demonstrate commercial adoption. Consult the repository's polymer
entry skill and source policy before revising the evidence.

The initial catalog research is preserved in `scripts/curated-history/` as
scoped authoring modules. The publication snapshot remains authoritative.
After editing those modules, apply the complete batch with:

```sh
node scripts/curated-history/assemble.mjs
npm run check
```

The assembler matches stable polymer IDs, requires a history for every current
catalog record, validates the candidate before import, and retains unrelated
sections and sources. It rejects a publication input changed during preparation
so the operation can be rerun against the newest data. Coordinate snapshot
imports when another author is working in the same checkout. An invalid batch
leaves the previous publication snapshot intact.
