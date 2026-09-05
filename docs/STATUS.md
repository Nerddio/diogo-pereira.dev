# Project status

The single place to look for where this project actually is. Updated at the end of every
milestone, and whenever a decision is accepted.

**Last updated:** 5 September 2026 · **Current milestone:** M1 · **Release target:**
live 11 September 2026, v1.0.0 tagged 18 September 2026

---

## Milestone board

| Milestone | Date | Points | State |
|---|---|---|---|
| M0 — Discovery, requirements, planning, ADRs, domain, repository | Fri 4 Sep | — | **Complete** |
| M1 — E1 in full: live on the real domain, every gate green | Fri 11 Sep | 28 | **In progress** |
| M2 — All routes, real content, metadata | Mon 14 – Wed 16 Sep | 32 | Not started |
| M4 — Tests, privacy assertions, accessibility pass, ADRs 006–008, case study | Thu 17 Sep | 22 | Not started |
| M5 — README, C4, runbook, rollback rehearsal, CHANGELOG, v1.0.0, retrospective | Fri 18 Sep | 21 | Not started |

M3 was dissolved into M2 when copy drafting moved to run in parallel from day 1 (D6). The
gap in the numbering is deliberate: identifiers are allocated once and never reused, so
existing references stay valid.

M1 is 28 points rather than 25 — US-39 (#4), scaffolding the application, was missing from
the original backlog. E1 had no story creating the thing its CI gates would run against.

Total backlog: 103 points across 39 stories and 8 epics.

---

## M0 — complete

**Delivered**

- Domain `diogo-pereira.dev` registered at Cloudflare Registrar; DNS zone in the same account. Apex canonical, `www` to redirect to it.
- Public repository at `github.com/Nerddio/diogo-pereira.dev`.
- Repository settings: squash-merge only, auto-delete head branches, Issues on, Wikis/Projects/Discussions off, GitHub Pages off.
- Actions: read-only default workflow permissions; Actions cannot create or approve pull requests; actions must be pinned to a full commit SHA; fork pull request workflows require approval from all external contributors.
- Security: private vulnerability reporting, Dependabot alerts, Dependabot security updates, secret scanning with push protection.
- Legacy `master` branch deleted; `main` is the default and only branch.
- Ruleset `main protection` active on `main`: pull request required, 0 approvals, conversation resolution required, linear history, squash-only merges, force pushes blocked, deletions restricted, empty bypass list. **Verified by attempting a direct push and confirming rejection (GH013)**, rather than by trusting the settings page.
- `docs/discovery.md`, `docs/requirements.md`, `docs/planning.md`, `docs/GLOSSARY.md`, `docs/STATUS.md`, `docs/adr/001–005` committed directly to `main` under the recorded GitHub Flow exception, before the ruleset was active.
- `LICENSE`, `.gitignore`, `.gitattributes`, stub `README.md`, pull request template, issue template.
- 20 labels on a `prefix:` convention; 4 milestones with due dates.
- Ten M1 issues opened (#4–#13) against the Definition of Ready.
- ADRs 001–005 and 009 accepted.
- Four pull requests merged through the full loop: branch, commit, push, PR, written review, squash merge.

**Deliberately outside this repository**

- The interview question bank. Its audience is the author rather than the reader, and the ADRs already carry the public reasoning (D8).

---

## M1 — in progress

| Issue | Story | Points | State |
|---|---|---|---|
| #4 | US-39 Scaffold the Nuxt application | 3 | Ready |
| #5 | US-01 Live on the domain over HTTPS | 3 | Ready |
| #6 | US-02 Public repository | 1 | **Closed** — satisfied during M0 |
| #7 | US-03 Static analysis gates the merge | 5 | Blocked by #4 |
| #8 | US-04 End-to-end tests against a real deployment | 5 | Ready |
| #9 | US-05 Performance and accessibility budgets | 5 | Ready |
| #10 | US-06 No broken internal links | 2 | Blocked by #4 |
| #11 | US-07 Merges to main deploy automatically | 2 | Ready |
| #12 | US-08 Preview deployment per branch | 1 | Ready |
| #13 | US-09 Dependency updates as pull requests | 1 | Blocked by #4 |

Start with #4. Everything else in E1 either depends on it or on the deployment it produces.

**Still to do at M1, not tracked as stories**

- Pass 3: add required status checks to the `main protection` ruleset, once the workflow has run once and GitHub knows the job names. A gate that is not named is not enforced.
- Create the Cloudflare API token, scoped to Account → Cloudflare Pages → Edit, and store it in GitHub Actions secrets. Never account-wide: an account-wide token reaches DNS, which is threat item 1.
- Disable Cloudflare's Git integration if it was ever connected; it cannot coexist with Direct Upload from Actions.
- Repository website field pointing at the live URL once it exists.

---

## Decision log

| # | Decision | Date | State |
|---|---|---|---|
| D1 | Engineer-first persona priority; `portfolio-goals.md` §2 to be amended to match | 4 Sep | Accepted |
| D2 | Release target moved to 9 September | 4 Sep | Accepted |
| D3 | Manual WCAG 2.2 AA pass added to the Definition of Done, scoped to seven items | 4 Sep | Accepted |
| D4 | README cold run performed by the developer in a clean container, labelled as the weaker check | 4 Sep | Accepted |
| D5 | Skill claims phrased as judgement and review, not authorship | 4 Sep | Accepted |
| D6 | Copy drafting moved to day 1, in parallel with setup | 4 Sep | Accepted |
| D7 | US-21 (this site's case study) moved from M2 to M4 | 4 Sep | Accepted |
| D8 | Interview bank kept private: its audience is me, not the reader, and the ADRs already carry the public reasoning. Publishing later is free; unpublishing is not | 4 Sep | Accepted |
| D9 | AI-assisted working method disclosed in the case study; artefact authorship remains Diogo Pereira. Half-disclosed is weaker than either fully stated or fully absent | 4 Sep | Accepted |
| D10 | Process documentation lives in `docs/`; the repository root holds only conventional files | 4 Sep | Accepted |
| D11 | MIT licence for the code, with written content and imagery carved out and reserved, stated in both `LICENSE` and the README | 4 Sep | Accepted |
| D12 | Identifiers are allocated once and never reused or renumbered — ADRs, decisions, open questions, milestones and stories alike. Gaps are information | 5 Sep | Accepted |
| D13 | Re-planned. M0 took roughly twice its estimate, most of it in learning rather than in the work itself. M1 committed to 11 September; v1.0.0 targeted 18 September. The live URL — the artefact with job-search value — still lands in week one; v1.0.0 is a documentation and quality milestone, not the point the site becomes visible. No scope cut: the projects index is retained at one entry, since the typed content collection is needed for the case study page regardless, and the URL belongs on the CV now rather than later | 5 Sep | Accepted |
| ADR-001 | Nuxt 4 as the framework | 4 Sep | Accepted |
| ADR-002 | Static site generation over SSR or SPA | 4 Sep | Accepted |
| ADR-003 | Markdown in the repository over a headless CMS | 4 Sep | Accepted |
| ADR-004 | Cloudflare Pages for v1.0.0, Workers Static Assets after | 4 Sep | Accepted |
| ADR-005 | Tailwind CSS v4 over hand-authored CSS | 4 Sep | Accepted |
| ADR-009 | GitHub Actions as the deployment trigger, over Cloudflare's Git integration | 5 Sep | Accepted |

ADRs 006, 007 and 008 are reserved and scheduled for M4: test strategy, cookieless
analytics, and contact information exposure.

---

## Open questions

| # | Question | Owner | Blocking |
|---|---|---|---|
| OQ-3 | Subdomain name for the tools project (`lab.` or `tools.`) — reserved, not built. Do not act on this before v1.0.0 | Diogo | Nothing |

---

## Live risks

| # | Risk | State |
|---|---|---|
| R-A | Nuxt static preset on Cloudflare Pages — unverified | Open, tested at M1 by #4 and #5 |
| R-B | TypeScript 6 pin against Nuxt's expectations — unverified either way | Open, tested at M1 by #4 |
| R-C | Nuxt Content v3 may ship a client-side bundle, breaching the JavaScript budget | Open, measured at M1 by #9 |
| R-D | M1 is 28 points in one day and carries every unverified technical assumption | Accepted deliberately — risk belongs at the front |
| R-E | Cloudflare Pages free-tier build quotas not yet read from primary source | Open, before M1 |
| R-F | Nuxt 5 supersedes Nuxt 4 within roughly a year | Accepted, scheduled post-launch |
| R-G | `wrangler-action` against a Nuxt 4 static build is untested; the older `pages-action` still appears in much documentation | Open, verified at M1 by #12 |

---

## Cut list, in order

If the schedule demands it: US-13 (recency signal), US-09 (dependency bot), US-08 (branch
previews — but #8, #9 and #11 depend on it), US-17 reduced to no photograph rather than a
placeholder.

**Never cut:** any ADR, any pull request review, the accessibility pass, the retrospective,
or maintaining the interview bank — kept outside this repository, see D8.

---

## For the retrospective

Recorded at the time rather than reconstructed at the end.

- The `main protection` ruleset was configured but never saved. A commit reached `main` through the gap, and it was only noticed because the control was tested rather than trusted. A control believed active but never applied is a common real-world failure.
- E1 had no story creating the application its CI gates would run against. The gap was invisible in the milestone plan and obvious the moment the tickets were written against the Definition of Ready.
- Estimating revealed that E7 and E8 were 42% of the backlog and sat entirely in the final two days of the original plan. The resequencing came from the estimate, not from the plan.
- Branch protection requires zero approvals because GitHub does not permit self-approval. The status checks are enforced; the review is disciplined. Knowing which is which is worth more than claiming both.
- The original plan assumed familiarity with git, GitHub Flow and the tooling. The real constraint was learning time, not writing time, and no estimate accounted for it. Re-planned openly at the point it became clear, rather than allowed to slip silently.
