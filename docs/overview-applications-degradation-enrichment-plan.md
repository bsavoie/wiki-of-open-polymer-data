# Research plan: enriching polymer article tabs

This document records the workflow for reviewing Overview, Applications, and Degradation across the Wiki of Open Polymer Data. The authoritative authoring input is `public-data/wop-publication-snapshot-v2/snapshot.json`.

## Editorial target

A useful passage tells the reader **what the material does, how or why, and under what conditions**. Replace unsupported or vague statements such as “composition affects performance” with a source-qualified direction, mechanism, comparison, or representative example. Explain the relevant technical term when that helps. Quantities are useful when the source identifies the material, specimen, conditions, endpoint, and units; they are not required merely to make a passage look detailed. Aim for several substantive sentences in each populated topic, but preserve a clearly stated research gap when adequate evidence is unavailable.

- **Overview:** Explain the family or material boundary, salient chemistry and morphology, properties and variability. Enrich `nomenclature` and `healthSafetyAndRegulation` when they appear in Overview, with jurisdiction-, route-, material-, and population-specific safety claims. The structure-figure scope note should help readers interpret what the actual depiction shows and does not show. Chemical-structure work requires the structure specialist skill; do not embellish a caption beyond the displayed chemistry.
- **Applications:** Identify specific products and uses, explain why an identified grade, component, property, or processing method fits the use, and distinguish established use from a laboratory demonstration. Keep the existing authoring contract's three paragraph labels: `Products and industries.`, `Purchasing.`, and `Scale and evidence limits.` Give a verified buying route or precise gap; distinguish catalog pack size, purchases, production, installed capacity, and market share. Label years, geography, calculations, and family-versus-grade boundaries.
- **Degradation:** Keep `Degradation products and pathways:`, `Timescales:`, and `Environmental persistence:` in `degradationAndStability`. Identify the exposure and material and describe a supported pathway or observed effect; distinguish products, oxidation, crosslinking, scission, dissolution, fragmentation, and mineralization. Give a duration only with its endpoint and relevant conditions; accelerated tests, controlled composting, and analytical pyrolysis do not establish ambient environmental lifetimes.
- **Reclamation and recycling:** In `recyclingAndEndOfLife`, explain the actual route and what is recovered. Distinguish reuse, mechanical reprocessing, solvent separation, chemical/feedstock recovery, composting, and energy recovery. Identify feedstock, stage of development, contamination and output limitations, and whether local collection or acceptance is established. Do not label adsorption/desorption reuse of an entire composite as recovery of its polymer component.

Preserve the existing presentation and section anchors. See [Applications authoring](applications.md), [Degradation and recovery coverage](degradation.md), and the repository's `AGENTS.md` and polymer-entry skill for the complete contracts. For synthesis, mechanical-properties, processing, or chemical-structure changes, use the matching specialist skill as well.

## Reusable worker prompt

Replace the bracketed values and assign disjoint stable IDs to one worker. The coordinator should pass the current snapshot state and any user-approved changes in scope.

```text
Enrich [TARGET SECTIONS] for [WOP IDS AND NAMES] in the Wiki of Open Polymer Data.

Read AGENTS.md, .agents/skills/research-polymer-entry/SKILL.md, its source-policy
and record-contract references, and docs/applications.md and/or docs/degradation.md
as applicable. Use the matching specialist skill if editing a core evidence tab or
chemical structures. The v2 publication snapshot is authoritative. Inspect each
record's actual scope, existing prose, sources, and relationships before researching.

For each requested section, replace thin or generic claims with a few substantive,
independently paraphrased sentences. Explain directional effects and mechanisms
when supported, and give a concrete representative example. Identify the specific
polymer or grade, formulation, specimen, environment, test or process, endpoint,
units, date and jurisdiction whenever they matter. Separate established practice
from laboratory, pilot, patented, historical, and supplier-reported examples. Do not
invent claims to meet a length target; preserve and report real evidence gaps.

Read the exact anonymous full-content URL for each source you use. Prefer original
studies, public authorities, technical standards, institutional theses, and suitable
reviews; use suppliers only for the named material or product. Record citation,
source type, stable URL, direct contentUrl if needed, precise locator, access date,
access/reuse status, license basis, lineage, and only supported section keys.
Confirm source identity and actual applicability, including existing mappings.

For Applications retain the exact labels in docs/applications.md. For degradation
retain the three exact labels in docs/degradation.md and write recycling as ordinary
paragraphs. Preserve stable IDs, related records, unassigned sections, v1, structure
data and maturity/review status unless a specifically scoped correction is necessary.

Do not write the shared canonical snapshot. Produce a guarded, reviewable patch
against the current values for only your assigned IDs, with source additions and
mapping corrections. Validate an isolated copy with scripts/validate-snapshot.mjs.
Return the patch path, IDs and sections changed, full-text sources and claim/condition
summary, any conflicting or inaccessible evidence, and any unresolved gaps. Flag
cross-record or shared-source corrections for the coordinator.
```

## Coordinated corpus pass

1. **Inventory and partition.** Compare the current v2 snapshot with the approved pilots; inventory the assigned fields, existing sources, genuine gaps and material boundaries by stable `wopId`. Partition the corpus into disjoint batches, balancing family breadth and source difficulty. The three pilot records are examples, not a substitute for reviewing the remaining records.
2. **Parallel research, isolated outputs.** Give each worker explicit IDs and fields, the prompt above, and the source and rendering contracts. Workers read full sources, produce guarded per-entry or small-batch patches against isolated copies, and report unresolved cases. They must not concurrently write the canonical snapshot.
3. **Editorial and evidence review.** A coordinator checks each patch for useful detail, directional claims, precise source mappings and locators, independent paraphrase, source accessibility and licensing, and material/test/route scope. Reviewers distinguish technical recyclability from documented collection, lab weathering from environmental persistence, and prototype use from commercial adoption. Send unsupported or ambiguous claims back for correction; preserve gaps when sources do not establish an answer.
4. **Serial integration and checks.** Apply disjoint patches to a staged copy, validate that only assigned IDs and fields changed, run snapshot validation, then import atomically. For each coherent integrated batch, run `npm run check`; perform the additional structure validations and visual review when structural depiction metadata changes. Keep the frozen v1 snapshot, generated output, unrelated worktree changes, and stable IDs intact.
5. **Review and handoff.** Before declaring the pass complete, independently inspect each requested tab, not just each entry. Record whether each tab was enriched, already met the target, or remains limited by a specific evidence gap. Screen short product-and-industry paragraphs and unchanged fields as review candidates; sentence counts and comparisons with a repository commit are triage signals, not proof of quality or of what changed in a given turn. Sample the rendered results across classes and compare them with the approved pilots, checking that concrete uses explain why the material or formulation is suitable. Build and open representative pages, verify links and displayed section labels, and report the tab-level disposition, unresolved gaps, and access problems. Do not claim a corpus-wide enrichment solely because each entry was touched or the schema and tests pass. Record the research scope and limitations without upgrading maturity solely because text is longer.

## Pilot evidence and lessons

The current pilots are polyethylene (`wop-000001`), carboxymethyl cellulose (`wop-000200`), and polythiophene (`wop-000244`). They deliberately span a high-volume thermoplastic family, a variably substituted cellulose ether, and a family of functional electronic polymers. The Overview pilots show why named comparisons matter: PE crystallinity and permeability are specimen- and temperature-specific; CMC solution behavior depends on concentration and substitution; doping can stiffen one polythiophene formulation and soften another. CMC food-additive assessments require particular attention to form, population, jurisdiction, and dates.

The Applications and Degradation pilots add further distinctions:

- **Polyethylene:** A film resin’s heat-seal behavior helps explain its application, while a world production estimate must retain the year and included density classes. Accelerated UVA cracking, fungal attachment, and mineralization are different endpoints. The solvent separation of an industrial multilayer film is a laboratory demonstration and does not establish household collection or recycling.
- **CMC:** Water-soluble sodium CMC has particular roles in food formulations and in water-based electrode slurries; a laboratory electrode does not establish a market share. Reducing-sugar release during an enzyme assay, visible disintegration in hot compost, and CO₂ evolution in a separate controlled test measure different outcomes. Repeated dye adsorption by a CMC-containing hydrogel reuses the composite rather than recovering CMC itself.
- **Polythiophene:** A parent-polymer battery coating and a P3HT-based solar-cell film are distinct laboratory examples. Analytical pyrolysis, P3HT optical aging, and environmental persistence cannot be treated as the same process. A recoverable, specially designed PCAT-K coating and a regenerable mercury adsorbent do not establish commercial recycling or recovery of the unsubstituted polymer.

The pilot sources and their exact claim mappings are recorded in the three entries. Before scaling, a coordinator should recheck the user’s feedback on the depth, balance, source choices and presentation of those entries, then adapt the worker prompt rather than imposing unsupported uniform examples.
