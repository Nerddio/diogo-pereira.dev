# Planning — diogo-pereira.dev v1.0.0

| | |
|---|---|
| **Stage** | 4. Planning |
| **Status** | Draft — awaiting product owner approval |
| **Date** | 4 September 2026 |
| **Release** | v1.0.0, target 9 September 2026 |
| **Depends on** | `discovery.md`, `requirements.md`, ADR-001 to ADR-005 (all accepted) |

---

## 1. Definition of Ready

> The **Definition of Ready** is the entry gate: the conditions a ticket must satisfy before
> anyone starts it. Its purpose is to stop work beginning on a ticket that will stall
> halfway through because a question was never answered.

A ticket may not move to In Progress until all of these hold.

1. It has a user story in *As a / I want / so that* form, naming a real role from `discovery.md` §2.
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
5. Any new dependency justified in the PR: what it is for, what it weighs, what it replaces.
6. PR opened with: the ticket link, what changed, how it was verified, a review checklist, and **what the author is least confident about** in this change. If nothing, the PR says why not.
7. Reviewed by Diogo with a written comment, all CI gates green, merged.
8. `CHANGELOG.md` updated under `Unreleased`.
9. Branch deleted.

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

| Epic | Stories | Points |
|---|---|---|
| E1 Foundation and pipeline | US-01…09 | **25** |
| E2 Home | US-10…13 | **7** |
| E3 About | US-14…17 | **10** |
| E4 Projects index | US-18…19 | **6** |
| E5 Project detail and case study | US-20…21 | **8** |
| E6 Contact | US-22 | **2** |
| E7 Cross-cutting quality | US-23…30 | **20** |
| E8 Documentation and release | US-31…38 | **22** |
| | **Total** | **100** |

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

## 4. Revised milestone plan

The original plan was seven days. Six remain. Two changes absorb the difference, and neither
of them cuts process.

**Change 1 — M3 dissolves into M2.** D6 moved copy drafting to day 1, in parallel with
setup. Content is therefore no longer a milestone that waits for pages to exist; it arrives
with them. M3 as a separate day was only ever a consequence of the sequencing D6 removed.

**Change 2 — cheap cross-cutting work moves forward.** US-23 (skip link), US-24 (404),
US-25 (metadata) and US-26 (sitemap and robots) are page-adjacent and small. Building them
alongside the pages costs almost nothing; deferring them to M4 concentrates risk in the
narrowest part of the schedule. ADRs 006–008 also move earlier, while the reasoning is fresh
rather than reconstructed on the last day.

| Milestone | Date | Content | Points |
|---|---|---|---|
| **M0** | Fri 4 Sep | Discovery, requirements, planning, ADRs 001–005, domain, repo. *Substantially complete.* | — |
| **M1** | Sat 5 Sep | E1 in full. **Live, ugly, deployed on the real domain with every gate green.** Non-negotiable. | 25 |
| **M2** | Sun 6 – Mon 7 Sep | E2, E3, E4, E5, E6 plus US-23 to US-26. All routes, real content, metadata. | 37 |
| **M4** | Tue 8 Sep | US-27, US-28, US-29, US-30. Playwright suite complete, privacy assertions, accessibility pass. ADRs 006–008. | 17 |
| **M5** | Wed 9 Sep | README, C4 diagrams, glossary, runbook, rollback rehearsal, CHANGELOG, tag v1.0.0, retrospective. | 21 |

M1 remains the single largest day at 25 points and the one with the most unverified
assumptions in it — the Nuxt static preset on Pages (ADR-004 R3), the TypeScript 6 pin
(ADR-001 R2), and the Nuxt Content bundle question (ADR-003). This is intentional. Risk
belongs at the front, where there is still time to respond to it.

**If M1 slips**, the response is to cut E2/E3 polish and V1.1 items, never to cut a gate. A
live site with one thin page and a green pipeline beats a beautiful undeployed one, because
the pipeline is the artefact and the page is not.

**Cut list, in order**, if the schedule demands it: US-13 (recency signal), US-09
(dependency bot), US-08 (branch previews, if Pages does not give them free), US-17 reduced
to no photograph at all rather than a placeholder. Never cut: any ADR, any PR review, the
accessibility pass, the retrospective.

---

## 5. Immediate next actions

1. Correct the date on ADRs 001–005 to 4 September before the first commit.
2. Commit `discovery.md`, `requirements.md`, `planning.md` and `docs/adr/001–005` directly to `main` — the one deliberate exception to GitHub Flow, since there is nothing to branch from yet. The exception is recorded in the retrospective.
3. Open US-01 through US-09 as issues.
4. Start US-01. One ticket at a time.
