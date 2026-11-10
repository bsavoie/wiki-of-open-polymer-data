# Corpus completion research, 8 September 2026

This population pass addresses the remaining empty health/handling,
degradation and end-of-life sections, and expands concise synthesis mechanism
descriptions. The canonical publication input remains
`public-data/wop-publication-snapshot-v2/snapshot.json`.

The class batches contain only changed sections and new typed sources:

| Batch | Assigned stable IDs |
| --- | --- |
| thermoplastics | 1–97, 254, 258–261 |
| networks | 98–175, 253, 255–257, 262 |
| bio-specialty | 176–250 |
| root | Family entries 251–252, polyether and PPV supplements, and selected synthesis routes across classes |

Every source records its full-content URL, locator, access status, reuse status
and the section it supports. Supplier handling guidance retains its material
scope. Process fume guidance does not classify a finished polymer as hazardous,
and use in food-contact or medical products does not establish blanket approval.
Regulatory statements retain their jurisdiction and access date.

Recycling sections distinguish material recovery from disposal and energy
recovery. A sourced end-of-life section can describe disposal constraints while
identifying an unresolved material-recovery route. Laboratory recovery is not
presented as an established collection or commercial recycling system.

Mechanism updates pair openly readable teaching references for general bond
formation with the existing material-specific preparation evidence. They expand
the mechanism text and procedure outline, preserving reactants, conditions,
structural references and the canonical V3000 graphs. They are explanatory
reaction outlines, not new atom-mapped elementary-mechanism drawings.

Review the merge:

```sh
node scripts/curated-completion-20260908/assemble.mjs
```

Apply and validate:

```sh
node scripts/curated-completion-20260908/assemble.mjs --write
npm run check
```

The assembler checks source mappings and route references before using the
atomic snapshot importer. `base-values.json` contains hashes of the fields at
the start of this pass. Replaying the batch accepts the original or already
applied values and rejects a field subsequently changed by another research
pass. Reconcile such later work in the canonical snapshot instead of replacing
the hashes simply to force an old patch through.

All articles retain their research-draft maturity. Section population is useful
coverage, not a claim that every product, exposure, environmental lifetime or
recovery technology has been exhaustively established. Remaining scientific
questions are recorded in the prose and the
[corpus coverage report](../../docs/completion-research-20260908.md).
