# Curated degradation evidence

The four JSON batches cover the 262 stable polymer identities in the initial
catalog. They contain paraphrased degradation and recovery evidence with typed
source records. The canonical publication input remains
`public-data/wop-publication-snapshot-v2/snapshot.json`.

These batches record the initial 7 September pass. The
[8 September completion pass](../curated-completion-20260908/README.md) adds
evidence to previously empty fields; see the current coverage notes below.

Review the proposed merge without changing publication data:

```sh
node scripts/curated-degradation/assemble.mjs
```

Apply the reviewed batches to the latest canonical snapshot:

```sh
node scripts/curated-degradation/assemble.mjs --write
npm run check
```

The assembler validates all 262 targets and source mappings before importing.
It preserves other article sections, structures, identities and existing
sources. Empty patch fields cannot erase previously sourced prose. It retains
review flags and adds the end-of-life flag where either evidence field remains
empty. Coordinate imports with other snapshot authors; the change check is a
guard against stale input, not a lock across concurrent processes.

An empty field records an unresolved research gap. A populated field may still
identify missing molecular products or environmental mineralization data.
Reactor residence times, thermal ramp measurements, mass loss and mechanical
failure are not interchangeable with environmental lifetime. Recovery examples
retain their material, formulation and development-stage limits.

See [the degradation authoring contract](../../docs/degradation.md) and
[coverage notes](../../docs/degradation-coverage.md). Update the coverage notes
when making a later research pass. Source access and reuse status are separate;
the batches do not redistribute source text or figures.
