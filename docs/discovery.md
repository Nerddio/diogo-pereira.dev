# Discovery — diogopereira.dev (working title)

| | |
|---|---|
| **Stage** | 1. Discovery |
| **Status** | Draft — awaiting product owner approval |
| **Product owner / tech lead** | Diogo Pereira |
| **Author** | Claude (developer) |
| **Date** | 3 September 2026 |
| **Target release** | v1.0.0, 8 September 2026 |

> **Discovery** is the lifecycle stage where the problem, the people affected and the
> conditions for success are written down before any solution is chosen. Its output is
> the input to Requirements, not a description of a design.

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
Diogo through one complete, small, real software lifecycle so the vocabulary becomes
automatic rather than rehearsed.

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

**Ordering note.** The recruiter is the *gating* reader (the engineer usually never sees
the site unless the recruiter passes the CV on), but the engineer is the *deciding*
reader and the expensive one to satisfy. The recruiter's needs are met by roughly six
lines of copy above the fold; everything else in the project serves Persona A. See
Open Decision D1 — this ordering contradicts `portfolio-goals.md` §2 and needs a ruling.

### Stakeholder C — Diogo in an interview (internal reader)

Not a persona, but a hard constraint on every artefact: **if a page or document cannot be
explained cold, in professional vocabulary, without preparation, it is wrong and must be
rewritten or cut.** This reader is the reason the process artefacts exist at all.

---

## 3. Success metrics

Split into four tiers. Only the first three are under our control.

> A **leading indicator** is measured during the work and predicts the outcome; a
> **lagging indicator** is measured after and confirms it. Portfolio projects have
> excellent leading indicators and almost no attributable lagging ones.

### Tier 1 — Delivery (binary, measured 8 September)

| # | Metric | Target |
|---|---|---|
| D1 | Live on the owned `.dev` domain over HTTPS | Yes |
| D2 | Public repository, all V1 gates passing on `main` | Yes |
| D3 | Five page types working; one case study live | Yes |
| D4 | ADRs 001–008 written, dated, public | 8 of 8 |
| D5 | `CHANGELOG.md` with a v1.0.0 entry, tagged in git | Yes |
| D6 | Retrospective written | Yes |

### Tier 2 — Quality (measured, and gated in CI)

| # | Metric | Target | Measured by |
|---|---|---|---|
| Q1 | Lighthouse accessibility | 100 | Lighthouse CI, mobile emulation |
| Q2 | Lighthouse performance | ≥ 95 | Lighthouse CI, mobile emulation |
| Q3 | Lighthouse best practices / SEO | ≥ 95 each | Lighthouse CI |
| Q4 | Automated accessibility violations | 0 | axe scan per route in Playwright |
| Q5 | Manual WCAG 2.2 AA checklist | Pass, signed off once per release | Human, documented |
| Q6 | Broken internal links | 0 | Link checker in CI |
| Q7 | Cold clone to running dev server, README only | Under 10 minutes, no undocumented step | Timed run in a clean container (see D4 open decision) |

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
| L1 | Glossary terms Diogo can define correctly, unprompted, in under 60 seconds, **with a project-specific example**, at the final rehearsal | 10 of 10 |
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

1. One of the candidate `.dev` domains is available and purchasable at an at-cost
   registrar with the payment method to hand, **on day 1**.
2. Nuxt 4 prerenders cleanly to Cloudflare Pages without adapter friction worth more than
   a few hours. M1 exists specifically to falsify this early.
3. The Nuxt 3 end-of-life date and the current pinned versions stated in the brief are
   correct. **These will be verified from primary sources before ADR-001 is written, not
   restated from the brief or from recall.**
4. Lighthouse CI can be run against Cloudflare Pages preview deployments from GitHub
   Actions without a paid tier.
5. The CV metrics cleared for publication are accurate as printed and remain cleared.

---

## 6. Risks

| # | Risk | Impact | Mitigation |
|---|---|---|---|
| R1 | The milestone plan is seven days long; six remain (3–8 September inclusive) | Slip or silent process-cutting | Compress M0 and M1 into day 1, or move the target to 9 September. Product owner call — see D2 |
| R2 | Domain purchase blocks everything downstream and sits on the critical path on day 1 | Whole plan stalls | Purchase before writing a single ADR; keep the fallback names in priority order; use the same provider for registration and DNS |
| R3 | Copy writing is the hardest and least parallelisable task and is scheduled at M3, day 5 | The About experience section ships rushed or thin — the one section carrying real career evidence | Draft About and Home copy from day 1; it has no dependency on any code |
| R4 | Lighthouse accessibility 100 is treated as WCAG 2.2 AA conformance | An accessibility claim the site cannot support, in front of the one reader who might check | NFR-04 requires a manual pass as a separate gate. See D3 |
| R5 | "Claude writes the code" means the TypeScript and Vue gaps are closed on paper only | A CV claim that collapses in a technical interview | See D5 — needs an explicit ruling on how the claim is worded and how much code Diogo writes |
| R6 | The projects index contains only itself | Reads as "has built nothing" | Already accepted and stated plainly on the page; mitigated by the About experience section doing the evidential work, and by flagship 2 starting immediately after v1.0.0 |

---

## 7. Open decisions (product owner)

| # | Decision needed | Blocking |
|---|---|---|
| D1 | Persona priority: this brief says engineer-first, `portfolio-goals.md` §2 says recruiter-first. Which governs, and does the other document get amended? | Requirements (epic ordering, home page copy) |
| D2 | Six days available versus a seven-day plan: compress, or move the date to 9 September? | The whole milestone plan |
| D3 | Does the manual WCAG 2.2 AA pass become a Definition of Done item, in addition to the Lighthouse gate? | Definition of Done, M4 scope |
| D4 | Who performs the cold README run (NFR-10)? A real second person, or a clean container run by Diogo, labelled as the weaker check it is? | M5 |
| D5 | How the TypeScript and Vue skill claims are worded given the "Claude writes the code" model | Nothing yet; blocks the CV and the case study copy |
| D6 | Whether copy drafting moves to day 1 in parallel with setup (R3) | Milestone plan |

---

## 8. Vocabulary introduced (for `GLOSSARY.md`)

- **Discovery** — the lifecycle stage that defines the problem, the affected people and the conditions for success, before any solution is chosen.
- **Persona** — a condensed, evidence-based description of one reader, used as a tool for settling design arguments.
- **Non-functional requirement (NFR)** — a constraint on how well the system must behave, as opposed to what it must do; testable, with a target and a verification method.
- **Quality attribute** — the category an NFR belongs to (performance, accessibility, security, operability, and so on).
- **Leading indicator** — a measure taken during the work that predicts the outcome.
- **Lagging indicator** — a measure taken after the work that confirms the outcome.
- **MoSCoW** — a prioritisation scheme classifying items as Must, Should, Could or Won't-have-this-time.
- **Verification method** — the specific, repeatable procedure that shows a requirement is met; the thing that separates a requirement from an aspiration.
