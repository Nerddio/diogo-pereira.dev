# Planning — diogo-pereira.dev v1.0.0

|                |                                                                      |
| -------------- | -------------------------------------------------------------------- |
| **Stage**      | 4. Planning                                                          |
| **Status**     | Draft — awaiting product owner approval                              |
| **Date**       | 4 September 2026                                                     |
| **Release**    | v1.0.0, target 9 September 2026                                      |
| **Depends on** | `discovery.md`, `requirements.md`, ADR-001 to ADR-005 (all accepted) |

---

## 1. Definition of Ready

> The **Definition of Ready** is the entry gate: the conditions a ticket must satisfy before
> anyone starts it. Its purpose is to stop work beginning on a ticket that will stall
> halfway through because a question was never answered.

A ticket may not move to In Progress until all of these hold.

1. It has a user story in _As a / I want / so that_ form, naming a real role from `discovery.md` §2.
2. It has Given/When/Then acceptance criteria that can be demonstrated. A criterion nobody could fail is rewritten or removed.
3. Its MoSCoW priority is set.
4. Every design decision it depends on has an **accepted** ADR. Not a drafted one.
5. It is small enough to finish in one branch — 5 points or fewer. Larger tickets are split before they start, not during.
6. Any product owner decision it needs (scope, wording, visual direction, anything with a legal or privacy dimension) has been answered, not assumed.

## 2. Definition of Done

> The **Definition of Done** is the exit gate: the conditions that make "done" a fact rather
> than an opinion. It is identical for every ticket, which is what stops it eroding under
> deadline pressure.

A ticket is not done until all of these hold.

1. Acceptance criteria demonstrably met — demonstrated, not asserted.
2. Lint, format check, `vue-tsc` strict and production build all pass locally before the PR is opened.
3. End-to-end coverage added or updated if the ticket changed a user-facing route.
4. Documentation updated if behaviour or setup changed.
5. Any term, acronym or piece of shorthand introduced by this ticket is defined in `docs/GLOSSARY.md`.
6. Any new dependency justified in the PR: what it is for, what it weighs, what it replaces.
7. PR opened with: the ticket link, what changed, how it was verified, a review checklist, and **what the author is least confident about** in this change. If nothing, the PR says why not.
8. Reviewed by Diogo with a written comment, all CI gates green, merged.
9. `CHANGELOG.md` updated under `Unreleased`.
10. Branch deleted.

**Work-in-progress limit: 1.** One ticket in flight. The next does not start until the current one is merged.

## 3. Estimation

> A **story point** is a relative measure of size, combining effort, complexity and
> uncertainty. It is deliberately not a unit of time. Points are used here for **relative
> sizing and risk-spotting** — finding the tickets that are larger than they look — and
> **not for forecasting**, because forecasting requires a measured velocity and this project
> has no history to measure. Claiming a velocity on the first project would be inventing
> data, which is the failure mode this whole exercise exists to avoid.

Scale: 1, 2, 3, 5, 8 (Fibonacci). Anchor: **US-24, the 404 page, is 2 points.** Everything
else is sized against it. An 8 means "split this before starting", so nothing here is an 8.

| Epic                             | Stories   | Points  |
| -------------------------------- | --------- | ------- |
| E1 Foundation and pipeline       | US-01…09  | **25**  |
| E2 Home                          | US-10…13  | **7**   |
| E3 About                         | US-14…17  | **10**  |
| E4 Projects index                | US-18…19  | **6**   |
| E5 Project detail and case study | US-20…21  | **8**   |
| E6 Contact                       | US-22     | **2**   |
| E7 Cross-cutting quality         | US-23…30  | **20**  |
| E8 Documentation and release     | US-31…38  | **22**  |
|                                  | **Total** | **100** |

Per-story points, largest first, are the ones worth arguing about:

**5 points:** US-03 (static analysis gates), US-04 (Playwright against preview), US-05
(Lighthouse budgets), US-15 (About experience section — large because of the confidentiality
boundary, not the markup), US-18 (typed collection that fails the build), US-21 (this site's
case study), US-30 (WCAG 2.2 AA including the manual pass), US-31 (ADRs 006–008).

**3 points:** US-01, US-10, US-14, US-20, US-25, US-28, US-32, US-33, US-36.

Everything else is 1 or 2.

**What the estimate revealed.** E7 and E8 together are 42 points — 42% of the backlog — and
under the original plan they sat entirely in the last two days. That is the finding that
justifies having estimated at all, and §4 responds to it.

---

## 4. Milestone plan

Milestones are sequencing containers, not commitments (D14). Each is a coherent
block of work; the order matters and the timing does not.

M3 dissolved into M2 when copy drafting moved to run in parallel (D6). The gap in
the numbering is deliberate — identifiers are allocated once and never reused (D12).

| Milestone | Content | Points |
|---|---|---|
| **M0** | Discovery, requirements, planning, ADRs 001–005 and 009, domain, repository | — |
| **M1** | E1 in full. **Live, ugly, deployed on the real domain with every gate green.** | 28 |
| **M2** | E2, E3, E4, E5, E6 plus US-23 to US-26. All routes, real content, metadata | 32 |
| **M4** | US-27 to US-30. Playwright suite, privacy assertions, accessibility pass. ADRs 006–008 | 22 |
| **M5** | README, C4 diagrams, glossary, runbook, rollback rehearsal, CHANGELOG, tag v1.0.0, retrospective | 21 |

M1 carries the most unverified assumptions and is sequenced first deliberately.
Risk belongs at the front, where there is still time to respond to it.

**If M1 stalls**, the response is to cut E2/E3 polish and V1.1 items, never to cut
a gate. A live site with one thin page and a green pipeline beats a beautiful
undeployed one, because the pipeline is the artefact and the page is not.

**Cut list, in order:** US-13 (recency signal), US-09 (dependency bot), US-08
(branch previews — but #8, #9 and #11 depend on it), US-17 reduced to no
photograph rather than a placeholder. Never cut: any ADR, any pull request
review, the accessibility pass, the retrospective.

## 5. Immediate next actions

1. Correct the date on ADRs 001–005 to 4 September before the first commit.
2. Commit `discovery.md`, `requirements.md`, `planning.md` and `docs/adr/001–005` directly to `main` — the one deliberate exception to GitHub Flow, since there is nothing to branch from yet. The exception is recorded in the retrospective.
3. Open US-01 through US-09 as issues.
4. Start US-01. One ticket at a time.
