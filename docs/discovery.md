# Discovery — diogo-pereira.dev

| | |
|---|---|
| **Stage** | 1. Discovery |
| **Status** | **Accepted** — 4 September 2026 |
| **Owner** | Diogo Pereira (product owner and tech lead) |
| **Author** | Diogo Pereira |
| **Date** | 4 September 2026 |
| **Target release** | v1.0.0, 9 September 2026 |

> **Discovery** is the lifecycle stage where the problem, the people affected and the
> conditions for success are written down before any solution is chosen. Its output is
> the input to Requirements, not a description of a design.

**Identifier convention.** `DEL-n` are delivery metrics in §3. `NFR-n` are non-functional
requirements in §4. `D-n` refers to accepted decisions, which live in the decision log in
`docs/STATUS.md` and nowhere else. `US-n` are user stories in `docs/requirements.md`.

---

## 1. Problem statement

**Situation.** Diogo Pereira is a full-stack engineer resident in the Netherlands with
EU work rights, whose most recent role (Foldaco) ended in June 2026. The job search is
active and targets product companies and mid-size organisations of roughly 100–500
people in the Randstad.

**Problem.** There is currently no public, verifiable artefact that a hiring engineer can
inspect. The CV *asserts* range and business impact; nothing *demonstrates* how the work
was done. Simultaneously, the strongest available evidence — a booking platform, EU VIES
VAT automation, 40+ WooCommerce sites — is bound by confidentiality and cannot be shown
as code, screenshots or data. A second problem compounds the first: the professional
process vocabulary (requirements, ADRs, quality gates, release management) was never
imposed by an employer, so it cannot yet be spoken fluently under interview conditions.

**Consequence of doing nothing.** Applications are evaluated on a document that looks the
same as every other document, during an employment gap, in a market where the
differentiator at this level is evidence of process rather than evidence of syntax.

**What this project changes.** It produces a live, owned URL that (a) answers a
recruiter's screening questions in under a minute, (b) gives a hiring engineer a
repository with a public decision trail and a running pipeline to judge, and (c) forces
one complete, small, real software lifecycle to be walked end to end, so the vocabulary
becomes automatic rather than rehearsed.

**Explicit non-goal.** This site is not the impressive artefact. Its architecture is
deliberately unambitious. Credibility comes from the pipeline, the decision records and
the honesty of the claims, not from technical complexity. Flagship 2 carries the
system-design weight.

---

## 2. Readers and stakeholders

> A **persona** is a condensed, evidence-based description of one reader used to settle
> design arguments. It is a decision tool, not a character study: if it cannot cause a
> feature to be cut, it is written wrong.

### Persona A — The hiring engineer (deciding reader)

| | |
|---|---|
| **Who** | Senior or lead engineer at a 100–500 person product company. Will be on the interview panel and often owns the technical yes/no. |
| **Arrives from** | A link in the CV, a LinkedIn profile, or the GitHub profile. Desktop, second monitor, between meetings. |
| **Time budget** | 10 minutes if convinced in the first 60 seconds; roughly 90 seconds if not. |
| **Questions to answer** | Can he reason about a system, or did he glue tutorials together? Does he understand *why* he chose things? Would code review with him be productive? Has he ever worked inside a real process, or will we have to install one? |
| **Path through the site** | Home (skim) → Projects → the case study → **the repository**. Most of the evaluation happens outside the site, in the repo. |
| **Wins the reader** | A short defensible stack rationale with named rejected alternatives; a green pipeline with real gates; ADRs that record what a decision *gave up*; a commit history with human-sized commits; a README that runs. |
| **Loses the reader** | A logo wall. "Passionate about clean code." A README with an undocumented step. ADRs written as marketing. A test suite that cannot fail. Claimed technologies with nothing behind them. |
| **Leaves with** | "Worth an hour." Or: "This is a tutorial with a domain name." |

### Persona B — The recruiter (gating reader)

| | |
|---|---|
| **Who** | Agency recruiter or internal talent partner. Non-technical or semi-technical. Screening a shortlist. |
| **Arrives from** | The CV or LinkedIn. **Mobile, frequently, on a mediocre connection.** |
| **Time budget** | 60 seconds, and that is generous. |
| **Questions to answer** | What does he do (one label)? Where is he? Can he legally work here without sponsorship? Is this current, or abandoned in 2023? How do I contact him? |
| **Path through the site** | Home, above the fold. Possibly Contact. Rarely anything else. |
| **Wins the reader** | Role, location, work rights, availability and contact route visible without scrolling or interpreting. Fast on mobile. Recent dates visible. |
| **Loses the reader** | Jargon-first headline. Work rights buried on About. No email. Slow load. Anything that looks stale. |
| **Leaves with** | A yes/no on forwarding the CV to the hiring manager. |

**Ordering.** The recruiter is the *gating* reader — the engineer usually never sees the
site unless the recruiter passes the CV on — but the engineer is the *deciding* reader and
the expensive one to satisfy. The recruiter's needs are met by roughly six lines of copy
above the fold; everything else in the project serves Persona A. **Resolved 4 September
(D1): engineer-first governs, and `portfolio-goals.md` §2 is to be amended to match.**

### Stakeholder C — The interview (internal reader)

Not a persona, but a hard constraint on every artefact: **if a page or document cannot be
explained cold, in professional vocabulary, without preparation, it is wrong and must be
rewritten or cut.** This reader is the reason the process artefacts exist at all.

---

## 3. Success metrics

Split into four tiers. Only the first three are under our control.

> A **leading indicator** is measured during the work and predicts the outcome; a
> **lagging indicator** is measured after and confirms it. Portfolio projects have
> excellent leading indicators and almost no attributable lagging ones.

### Tier 1 — Delivery (binary, measured 9 September)

| # | Metric | Target |
|---|---|---|
| DEL-1 | Live on the owned `.dev` domain over HTTPS | Yes |
| DEL-2 | Public repository, all V1 gates passing on `main` | Yes |
| DEL-3 | Five page types working; one case study live | Yes |
| DEL-4 | ADRs 001–008 written, dated, public | 8 of 8 |
| DEL-5 | `CHANGELOG.md` with a v1.0.0 entry, tagged in git | Yes |
| DEL-6 | Retrospective written | Yes |

### Tier 2 — Quality (measured, and gated in CI)

| # | Metric | Target | Measured by |
|---|---|---|---|
| Q1 | Lighthouse accessibility | 100 | Lighthouse CI, mobile emulation |
| Q2 | Lighthouse performance | ≥ 95 | Lighthouse CI, mobile emulation |
| Q3 | Lighthouse best practices / SEO | ≥ 95 each | Lighthouse CI |
| Q4 | Automated accessibility violations | 0 | axe scan per route in Playwright |
| Q5 | Manual WCAG 2.2 AA checklist | Pass, signed off once per release | Human, documented |
| Q6 | Broken internal links | 0 | Link checker in CI |
| Q7 | Cold clone to running dev server, README only | Under 10 minutes, no undocumented step | Timed run in a clean container, performed by the developer and labelled as the weaker check — see D4 in the decision log |

### Tier 3 — Process (the actual curriculum)

| # | Metric | Target |
|---|---|---|
| P1 | Tickets started with a user story and Given/When/Then acceptance criteria already written | 100% |
| P2 | Changes reaching `main` via a reviewed pull request | 100% |
| P3 | PR descriptions containing a stated low-confidence item | 100% |
| P4 | Significant technical decisions with an accepted ADR before the dependent ticket starts | 100% |
| P5 | Commits following Conventional Commits | 100% |

### Tier 4 — Learning (the primary goal)

| # | Metric | Target |
|---|---|---|
| L1 | Glossary terms definable correctly, unprompted, in under 60 seconds, **with a project-specific example**, at the final rehearsal | 10 of 10 |
| L2 | Interview rehearsals completed | 3 (after ADR-001, after first green pipeline, at retrospective) |
| L3 | Terms corrected in rehearsal 3 that were also wrong in rehearsal 1 | 0 |

L1 is the definition of success for this project. Everything else is the vehicle.

### Explicitly not measured

Interviews obtained, replies received, or conversion of any kind. Cookieless analytics
gives page views and referrers, not people or funnels, and attribution between "the site
worked" and "the CV worked" is not recoverable. Setting a target here would invite
optimising for traffic, which is not the goal. The one honest lagging signal is
qualitative: **whether an interviewer opens the repository or asks about an ADR.** Record
those occurrences; do not turn them into a number.

---

## 4. Non-functional requirements

> A **non-functional requirement** constrains *how well* the system must behave rather
> than *what* it does. An NFR without a stated target and a verification method is a
> wish; each row below has both. Priorities use MoSCoW.

| ID | Quality attribute | Requirement and target | Verification | Priority |
|---|---|---|---|---|
| NFR-01 | Performance | Lighthouse Performance ≥ 95 under mobile emulation on Home, About and a project detail route | Lighthouse CI budget file, merge gate | Must |
| NFR-02 | Performance | First-load JavaScript transferred stays within the M1 baseline + 20% headroom. **Baseline to be measured at M1, not assumed now** | Lighthouse CI resource-size budget | Should |
| NFR-03 | Robustness | Every V1 route returns complete, readable content in the initial HTML response, with client-side JavaScript disabled | Playwright project with JS disabled, one test per route type | Must |
| NFR-04 | Accessibility | Conforms to WCAG 2.2 AA. Automated scanning is necessary but not sufficient; a manual pass covering keyboard-only traversal, visible focus, 200% zoom / 320px reflow, non-text contrast, `prefers-reduced-motion`, landmark structure and skip link is required before release | axe in Playwright (0 violations) + Lighthouse a11y 100 + documented manual checklist | Must |
| NFR-05 | Privacy | No cookies set on any route. No personal data collected or stored. All fonts and assets self-hosted; no request leaves the site's own origin except the analytics beacon | Playwright asserts an empty cookie jar and an origin allowlist for all network requests | Must |
| NFR-06 | Security | HTTPS only (`.dev` is HSTS-preloaded). Response headers set via `_headers`: Content-Security-Policy, Referrer-Policy, X-Content-Type-Options, Permissions-Policy | Header assertion in CI; Lighthouse Best Practices ≥ 95 | Should |
| NFR-07 | Supply chain | Lockfile committed; Node and pnpm versions pinned and identical locally and in CI; dependency updates arrive as PRs gated by the full pipeline | `pnpm install --frozen-lockfile` in CI | Should |
| NFR-08 | Discoverability | Unique title and meta description per route; canonical URL; Open Graph and Twitter tags; JSON-LD `Person` on Home and About; valid `sitemap.xml` and `robots.txt` | Lighthouse SEO ≥ 95 + link check + manual validation once | Must |
| NFR-09 | Compatibility | Current and previous major versions of Chrome, Edge, Firefox and Safari, desktop and iOS. Usable from a 320px viewport upward | Playwright across chromium/firefox/webkit; reflow in the manual pass | Should |
| NFR-10 | Reproducibility | A clean clone builds and runs following the README alone, with no undocumented step | Timed cold run in a clean container before v1.0.0; the result is recorded honestly, including any step that required guessing | Must |
| NFR-11 | Operability | No independent availability target is claimed; the site inherits Cloudflare Pages' availability. Recovery is by rollback to the previous deployment, target ≤ 15 minutes, manual, documented in the runbook | Rollback **rehearsed once** before v1.0.0 and the outcome written down | Should |
| NFR-12 | Deployability | Merge to `main` reaches production without manual intervention. Elapsed time to be measured at M1 and recorded, not asserted in advance | Observed and recorded in the runbook | Must |
| NFR-13 | Cost | €0/month recurring. Domain ≤ €15/year, verified against the actual registrar invoice | Invoice; Cloudflare account on free tier | Must |
| NFR-14 | Confidentiality and contact surface | No phone number, postal address, CV file, or employer-internal material anywhere in the working tree, the build output, **or the git history**. Because history is permanent, this is checked before the first push and at every release, not only at release | Repository-wide search of `git log -p`; release checklist item | Must |

---

## 5. Assumptions

Each of these could be wrong and would change the plan.

| # | Assumption | State |
|---|---|---|
| A1 | A suitable `.dev` domain is available and purchasable at an at-cost registrar on day 1 | **Settled 4 Sep** — `diogo-pereira.dev` registered at Cloudflare Registrar |
| A2 | Nuxt 4 prerenders cleanly to Cloudflare Pages without adapter friction worth more than a few hours | Open — M1 exists specifically to falsify this early. Tracked as R-A in `docs/STATUS.md` |
| A3 | The Nuxt 3 end-of-life date and the current stack versions are as stated in the brief | **Settled 4 Sep** — verified against the npm registry and the Nuxt roadmap before ADR-001. Two corrections resulted: Nuxt 5 is imminent, and the TypeScript `latest` tag is ahead of the version Nuxt builds against |
| A4 | Lighthouse CI can run against Cloudflare Pages preview deployments from GitHub Actions without a paid tier | Open — verified at M1 |
| A5 | The CV metrics cleared for publication are accurate as printed and remain cleared | Open — confirmed before the About copy ships |

---

## 6. Risks

| # | Risk | Impact | Mitigation | State |
|---|---|---|---|---|
| R1 | The milestone plan was seven days long; six days remained | Slip, or silent process-cutting | Target moved to 9 September (D2) and M3 dissolved into M2 once copy drafting moved to day 1 (D6) | **Resolved 4 Sep** |
| R2 | Domain purchase blocks everything downstream and sits on the critical path on day 1 | Whole plan stalls | Purchased before any other M0 work, at the same provider as DNS | **Resolved 4 Sep** |
| R3 | Copy writing is the hardest and least parallelisable task and was scheduled late | The About experience section ships rushed or thin — the one section carrying real career evidence | Copy drafting moved to day 1, in parallel with setup (D6) | **Resolved 4 Sep** |
| R4 | Lighthouse accessibility 100 treated as WCAG 2.2 AA conformance | An accessibility claim the site cannot support, in front of the one reader who might check | Manual seven-item pass added to the Definition of Done as a separate gate (D3) | **Resolved 4 Sep** |
| R5 | Skill claims stronger than what was actually done | A CV claim that collapses in a technical interview | Claims phrased as judgement and review rather than authorship (D5) | **Resolved 4 Sep** |
| R6 | The projects index contains only itself | Reads as "has built nothing" | Accepted and stated plainly on the page; the About experience section carries the evidential weight, and flagship 2 starts immediately after v1.0.0 | Open, accepted |
| R7 | M1 is 25 story points in one day and carries every unverified technical assumption | The one non-negotiable milestone slips | Deliberate: risk belongs at the front, where there is still time to respond to it. Cut list defined in `docs/planning.md` | Open, accepted |

Live technical risks are tracked in `docs/STATUS.md` rather than duplicated here.

---

## 7. Decisions

Product owner decisions arising from this document were resolved on 4 September 2026 and
are recorded in the decision log in **`docs/STATUS.md`** — D1 (persona priority), D2
(release date), D3 (manual accessibility pass), D4 (README cold-run verifier), D5 (skill
claim wording) and D6 (copy drafting sequence).

The decision log is the single source of truth for decisions. This section is a pointer,
deliberately, so the two cannot drift apart.

---

## 8. Vocabulary

Every term introduced in this document is defined in **`docs/GLOSSARY.md`**: discovery,
persona, non-functional requirement, quality attribute, leading and lagging indicator,
MoSCoW, and verification method. If a term appears in an artefact and is not in the
glossary, that is a defect.