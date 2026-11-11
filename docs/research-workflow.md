# Research improvement workflow

The improvement cycle is: identify a section-specific question, collect open
evidence, propose bounded changes, independently review the exact candidate,
publish locally, and record the outcome. Population, quantitative evidence,
question resolution, section review, and article maturity are distinct measures.

The v2 publication snapshot remains authoritative. Research metadata and
structured evidence are optional additions; existing entries remain valid.
Stable polymer identities, chemical connection tables, and frozen v1 data are
unchanged by this workflow. No new service, account, or deployment is required.

## Curator handoff

The published static wiki shows article evidence and recorded review history;
it does not offer a live research queue or submit requests. Broad inherited
review flags remain visible in each article, and absence of a tracked question
does not imply that an article is complete. Catalog search and filters survive
navigation through URL state.

A maintainer may prepare a request received through the project's normal
collaboration channel for review using:

```sh
npm run research -- request request.json --author researcher --out outputs/request-proposal.json
npm run research -- inspect outputs/request-proposal.json
```

The request format is `wop-research-request-v1` with `wopId`, `section`,
`question`, `scope`, and `acceptanceCriteria`. It contains no author identity.
Requests pass through the same validation and review flow as other changes.
Importing an already tracked identical request is rejected.

## Research and propose

Use the polymer-entry and matching specialist skills. Open exact full-content
links anonymously, retain material and test boundaries, and keep source access
and reuse rights separate. Private notes, downloads and reviewer identities
belong under ignored `outputs/`, never in public records.

```sh
npm run research -- queue --status open --priority high
npm run research -- prepare outputs/patch.json --author researcher --out outputs/proposal.json
npm run research -- inspect outputs/proposal.json
npm run research -- preview outputs/proposal.json --out outputs/research-preview
```

A patch contains a public `summary` and `changes`, each addressing a stable
`wopId`. Allowed change fields are:

- `sections`: only the section strings being changed.
- `sources`: typed source records to add or replace by `sourceId`.
- `evidence`: qualified records to add or replace by `evidenceId`.
- `questions`: questions to add or update by `questionId`.
- `reviewSections`: sections for which the reviewer will check the entire
  current content, evidence and source mappings.

Arrays are merged by stable ID. Unmentioned records and fields survive.
Question scope and acceptance criteria cannot be silently replaced; a different
research question needs a new ID. Prior attempts cannot be removed. Reopening
or changing a closed outcome automatically archives its previous resolution.
Each publication appends a public change summary; proposal IDs cannot be reused.

Example question patch:

```json
{
  "summary": "Track a specific mechanical evidence gap.",
  "changes": [{
    "wopId": "wop-000044",
    "questions": [{
      "questionId": "pet-grade-conditioned-tensile",
      "section": "mechanicalProperties",
      "question": "Which tensile measurements represent a named virgin PET grade?",
      "scope": "One named grade, specimen form, and conditioning history.",
      "priority": "normal",
      "status": "open",
      "acceptanceCriteria": "Locate eligible full text and retain grade, method, conditions, values and limitations.",
      "attempts": []
    }]
  }]
}
```

Question states are `open`, `in_progress`, `in_review`, `resolved`, and
`no_eligible_evidence`. Attempts contain `date`, a public `summary`, and
`sourceIds` for eligible evidence supporting the question's section. Inaccessible
leads stay in private notes; they must not become public supporting sources.

Closed questions require at least one attempt and a `resolution` containing
`date`, `summary`, `sourceIds`, and `evidenceIds`. A resolved question requires
supporting sources. `no_eligible_evidence` may have empty source/evidence lists:
it closes that search attempt while explicitly preserving the scientific gap.
`previousResolutions` retains earlier outcomes when a question is reopened.

## Independent review and local publication

Reviewers inspect the actual sources and the candidate, including its rendered
preview. A numerical extraction review alone does not justify `reviewSections`
or an article maturity upgrade. Record the decision only after doing the review:

```sh
npm run research -- review outputs/proposal.json --reviewer independent-reviewer --decision approve --note "Checked cited passages, material scope, values, retained gaps and rendered evidence." --out outputs/review.json
npm run research -- publish outputs/proposal.json --review outputs/review.json
```

Use `--decision request_changes` when corrections are needed. A new proposal or
changed base snapshot requires a new review. The reviewer must differ from the
author. The receipt is bound to the proposal and candidate hashes. This is an
auditable review attestation in a local trusted repository, not an authenticated
identity system or an automated check that a person read the literature.

Publication validates the candidate and completes a staged static build before
changing the snapshot. A guarded import runs immediately before the site swap.
Failures restore the prior snapshot and generated site; stale proposals and
concurrent publication attempts are rejected. Private proposal/review files are
never copied into the public site. `publish` updates local files only; normal
hosting/deployment remains a separate operation. The canonical preview and
publication also validate and include the warning-bearing historical-structure
archive; if it is missing or stale, publication leaves the prior snapshot and
site intact. Use `WOP_SITE_URL` as with the
existing build command when preparing a deployed build.

Run `npm run check` after a completed implementation/content batch. Review the
public diff for intended IDs and browser behavior before deployment. If a
process is killed while holding a publication/import lock, inspect current
snapshot/site state and any retained recovery directory before removing that
stale lock; do not automatically bypass a lock held by an active writer.

## Structured evidence and review freshness

`evidence` records hold `evidenceId`, `section`, `kind`, `attribute`, `material`,
`value`, `conditions`, `method`, `sourceId`, `locator`, and `limitations`.
Mechanical records use `measurement`; processing records use `operating_window`.
A value contains finite `min`, `max`, and `units`. Equal bounds represent a point
or operating setpoint. Optional `uncertainty` requires an `uncertaintyNote`;
never infer a statistical definition absent from the source. A sequence of cure
temperatures must not become a spurious min–max operating range.

The UI keeps the material, conditions, method, limits and exact source locator
with each value. Those fields are required even when the honest value is
"not reported in the cited methods". Evidence records are included in the
versioned snapshot download and can be reused without extracting prose.

`research.sectionReviews` contains `section`, `reviewedDate`, `summary`, and
`contentHash`. Hashes cover prose, supporting sources, evidence, and relevant
route/contextual-structure records. Later changes mark the review stale until
the new content is reviewed. Whole-article maturity remains conservative and
does not change automatically when a question is resolved.

`npm run coverage` and the queue report structured evidence, current/stale
section reviews, tracked articles, and question outcomes alongside populated
section counts. These metrics describe work performed and limits retained;
none asserts complete scientific knowledge.
