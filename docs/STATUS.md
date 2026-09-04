# Project status

The single place to look for where this project actually is. Updated at the end of every
milestone, and whenever a decision is accepted.

**Last updated:** 4 September 2026 · **Current milestone:** M0 · **Release target:**
v1.0.0 on 9 September 2026

---

## Milestone board

| Milestone | Date | Points | State |
|---|---|---|---|
| M0 — Discovery, requirements, planning, ADRs, domain, repository | Fri 4 Sep | — | **In progress** |
| M1 — E1 in full: live on the real domain, every gate green | Sat 5 Sep | 25 | Not started |
| M2 — All routes, real content, metadata | Sun 6 – Mon 7 Sep | 32 | Not started |
| M4 — Tests, privacy assertions, accessibility pass, ADRs 006–008, case study | Tue 8 Sep | 22 | Not started |
| M5 — README, C4, runbook, rollback rehearsal, CHANGELOG, v1.0.0, retrospective | Wed 9 Sep | 21 | Not started |

M3 was dissolved into M2 when copy drafting moved to run in parallel from day 1. Total
backlog: 100 points across 38 stories and 8 epics.

---

## M0 — detail

**Done**

- Domain `diogo-pereira.dev` registered at Cloudflare Registrar; DNS zone exists in the same account.
- Repository created public at `github.com/Nerddio/diogo-pereira.dev`.
- Repository settings: squash-merge only, auto-delete head branches, Issues on, Wikis/Projects/Discussions off, GitHub Pages off.
- Actions: read-only default workflow permissions; Actions cannot create or approve pull requests; actions required to be pinned to a full commit SHA; fork PR workflows require approval for all external contributors.
- Security: private vulnerability reporting, Dependabot alerts, Dependabot security updates, secret scanning with push protection — all enabled.
- `docs/discovery.md`, `docs/requirements.md`, `docs/planning.md`, `docs/adr/001–005`, `docs/GLOSSARY.md`, `docs/STATUS.md` and `.gitattributes` committed directly to `main` under the recorded GitHub Flow exception, before the `main protection` ruleset was active.
- Legacy `master` branch deleted; `main` is the default and only branch.
- Ruleset `main protection` active on `main`: pull request required, 0 approvals, conversation resolution required, linear history, squash-only merges, force pushes blocked, deletions restricted, empty bypass list. Verified by attempting a direct push and confirming rejection (GH013), rather than by trusting the settings page.
- ADRs 001–005 accepted.
- `GLOSSARY.md` and `docs/STATUS.md` committed. The interview question bank is deliberately outside this repository — see D8.
- Legacy `master` branch deleted; `main` is the default branch and the only branch.
- Ruleset `main protection` active on `main`: pull request required, 0 approvals, conversation resolution required, linear history, squash-only merges, force pushes blocked, deletions restricted, empty bypass list.

**In progress**

- `.gitignore`, `LICENSE`, stub `README.md`, pull request template, issue template.

**Not started**

- US-01 to US-09 opened as issues.
- Labels and milestones.

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
| D10 | Process documentation lives in `docs/`; the repository root holds only conventional files (`README.md`, `LICENSE`, `CHANGELOG.md`, `.gitattributes`, `.gitignore`) | 4 Sep | Accepted |
| ADR-001 | Nuxt 4 as the framework | 4 Sep | Accepted |
| ADR-002 | Static site generation over SSR or SPA | 4 Sep | Accepted |
| ADR-003 | Markdown in the repository over a headless CMS | 4 Sep | Accepted |
| ADR-004 | Cloudflare Pages for v1.0.0, Workers Static Assets after | 4 Sep | Accepted |
| ADR-005 | Tailwind CSS v4 over hand-authored CSS | 4 Sep | Accepted |

---

## Open questions

| # | Question | Owner | Blocking |
|---|---|---|---|
| OQ-1 | Licence: MIT plus a README note excluding written content and photograph, or none | Diogo | `LICENSE`, first ticket |
| OQ-2 | Deployment trigger: Cloudflare's own Git connection versus GitHub Actions with an API token. Determines whether a red pipeline can block a deploy, and which secrets exist. Probably ADR-worthy | Diogo, with verified options from Claude | M1, US-04/05/07/08 |
| OQ-3 | Subdomain name for the tools project (`lab.` or `tools.`) — reserved, not built. Do not act on this before v1.0.0 | Diogo | Nothing |

---

## Live risks

| # | Risk | State |
|---|---|---|
| R-A | Nuxt static preset on Cloudflare Pages — unverified | Open, tested at M1 |
| R-B | TypeScript 6 pin against Nuxt's expectations — unverified either way | Open, tested at M1 |
| R-C | Nuxt Content v3 may ship a client-side bundle, breaching the JavaScript budget | Open, measured at M1 |
| R-D | M1 is 25 points in one day and carries all three unverified risks | Accepted deliberately — risk belongs at the front |
| R-E | Cloudflare Pages free-tier build quotas not yet read from primary source | Open, before M1 |
| R-F | Nuxt 5 supersedes Nuxt 4 within roughly a year | Accepted, scheduled post-launch |

---

## Cut list, in order

If the schedule demands it: US-13 (recency signal), US-09 (dependency bot), US-08 (branch
previews if not free), US-17 reduced to no photograph rather than a placeholder.

**Never cut:** any ADR, any pull request review, the accessibility pass, the retrospective,
or maintaining the interview bank — kept outside this repository, see D8.
