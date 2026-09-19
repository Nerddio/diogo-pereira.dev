# Project status

The single place to look for where this project actually is. Updated at the end of every
milestone, and whenever a decision is accepted.

**Last updated:** 19 September 2026 · **Current milestone:** M2 · **Release:** no fixed
date; milestones are sequencing containers, not commitments (D14)

**Live:** https://diogo-pereira.dev

---

## Milestone board

| Milestone                                                                      | Points | State                              |
| ------------------------------------------------------------------------------ | ------ | ---------------------------------- |
| M0 — Discovery, requirements, planning, ADRs, domain, repository               | —      | **Complete**                       |
| M1 — E1: live on the real domain, gates green                                  | 23     | **Complete** — 9 of 10; #9 carried |
| M2 — All routes, real content, metadata, plus #9                               | 37     | **Next**                           |
| M4 — Tests, privacy assertions, accessibility pass, ADRs 007–008, case study   | 22     | Not started                        |
| M5 — README, C4, runbook, rollback rehearsal, CHANGELOG, v1.0.0, retrospective | 21     | Not started                        |

M3 dissolved into M2 (D6). Numbering gaps are deliberate — identifiers are allocated once
and never reused (D12). Total backlog: 103 points across 39 stories and 8 epics.

**M1 did not fully meet its own definition**, and that is recorded rather than rounded
off. The milestone was "every gate green"; the Lighthouse gate does not exist yet, because
two of its four thresholds fail against a third-party demo component that M2 deletes. See
D16.

---

## M1 — complete

| Issue | Story                                       | Points | State                                |
| ----- | ------------------------------------------- | ------ | ------------------------------------ |
| #4    | US-39 Scaffold the Nuxt application         | 3      | **Closed**                           |
| #5    | US-01 Live on the domain over HTTPS         | 3      | **Closed**                           |
| #6    | US-02 Public repository                     | 1      | **Closed** — satisfied at M0         |
| #7    | US-03 Static analysis gates the merge       | 5      | **Closed**                           |
| #8    | US-04 End-to-end tests against a deployment | 5      | **Closed**                           |
| #9    | US-05 Performance and accessibility budgets | 5      | **Carried to M2** — blocked, see D16 |
| #10   | US-06 No broken internal links              | 2      | **Closed**                           |
| #11   | US-07 Merges to main deploy automatically   | 2      | **Closed**                           |
| #12   | US-08 Preview deployment per branch         | 1      | **Closed**                           |
| #13   | US-09 Dependency updates as pull requests   | 1      | **Closed**                           |

**Delivered**

- Nuxt 4.5.2 scaffolded, every dependency pinned exactly, lockfile committed, pnpm and
  Node versions fixed by the repository rather than by a machine.
- Static generation confirmed: four routes prerendered, no server output.
- `diogo-pereira.dev` live over HTTPS. Apex canonical, `www` 301s to it with paths
  preserved, plain HTTP redirected. Verified by forcing each connection rather than
  trusting a browser.
- Deployed to Cloudflare Workers as an assets-only Worker (ADR-010, superseding ADR-004).
- Six CI jobs: lint, format, typecheck, build-and-links, preview, e2e — plus deploy on
  `main`. Four named as required status checks on the ruleset.
- End-to-end smoke suite across Chromium, Firefox and WebKit, plus a JavaScript-disabled
  project, running against a per-pull-request preview deployment.
- Dependabot live on the npm and github-actions ecosystems; first bump merged through the
  full pipeline.
- Install-time build scripts denied for every package, verified by building without them.

**Not done, and deliberately so**

- **Tailwind CSS is not installed.** ADR-005 is accepted but unimplemented: there is no
  markup to style yet. It arrives with M2, when the pages it is meant to style exist.
- Lighthouse budgets — see D16.

---

## M2 — next

E2 to E6 plus US-23 to US-26 and the carried #9. All routes, real content, metadata.

**Start here:** replacing `<NuxtWelcome />` is on the critical path for more than the home
page. Two of the four Lighthouse thresholds cannot be met while it is on the site, so #9
stays blocked until it is gone.

---

## Decision log

| #       | Decision                                                                                                                                                                                                                                                                | Date   | State                            |
| ------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------ | -------------------------------- |
| D1      | Engineer-first persona priority; `portfolio-goals.md` §2 to be amended to match                                                                                                                                                                                         | 4 Sep  | Accepted                         |
| D2      | Release target moved to 9 September                                                                                                                                                                                                                                     | 4 Sep  | Accepted                         |
| D3      | Manual WCAG 2.2 AA pass added to the Definition of Done, scoped to seven items                                                                                                                                                                                          | 4 Sep  | Accepted                         |
| D4      | README cold run performed by the developer in a clean container, labelled as the weaker check                                                                                                                                                                           | 4 Sep  | Accepted                         |
| D5      | Skill claims phrased as judgement and review, not authorship                                                                                                                                                                                                            | 4 Sep  | Accepted                         |
| D6      | Copy drafting moved to day 1, in parallel with setup                                                                                                                                                                                                                    | 4 Sep  | Accepted                         |
| D7      | US-21 (this site's case study) moved from M2 to M4                                                                                                                                                                                                                      | 4 Sep  | Accepted                         |
| D8      | Interview bank kept private: its audience is me, not the reader, and the ADRs already carry the public reasoning. Publishing later is free; unpublishing is not                                                                                                         | 4 Sep  | Accepted                         |
| D9      | AI-assisted working method disclosed in the case study; artefact authorship remains Diogo Pereira                                                                                                                                                                       | 4 Sep  | Accepted                         |
| D10     | Process documentation lives in `docs/`; the repository root holds only conventional files                                                                                                                                                                               | 4 Sep  | Accepted                         |
| D11     | MIT licence for the code, with written content and imagery carved out and reserved, stated in both `LICENSE` and the README                                                                                                                                             | 4 Sep  | Accepted                         |
| D12     | Identifiers are allocated once and never reused or renumbered. Gaps are information                                                                                                                                                                                     | 5 Sep  | Accepted                         |
| D13     | Re-planned. M1 committed to 11 September, v1.0.0 targeted 18 September                                                                                                                                                                                                  | 5 Sep  | Accepted                         |
| D14     | Deadlines dropped. Two re-plans in two weeks, both missed, while interview preparation took priority — which is the correct priority. Milestones remain as sequencing containers. A plan with dates that have passed is worse evidence than one that is not date-driven | 17 Sep | Accepted                         |
| D15     | Custom domain live: apex canonical, `www` 301s with paths preserved, plain HTTP redirected. Verified by forcing the connection rather than trusting the browser, which is how it emerged that HTTPS was not in fact enforced                                            | 17 Sep | Accepted                         |
| D16     | Lighthouse budgets gated at target and #9 blocked until M2, rather than ratcheted from the current score. Two of four thresholds fail on `<NuxtWelcome />`, a demo component M2 deletes; a gate set to 88 accepts the failure permanently and nothing forces tightening | 19 Sep | Accepted                         |
| ADR-001 | Nuxt 4 as the framework                                                                                                                                                                                                                                                 | 4 Sep  | Accepted                         |
| ADR-002 | Static site generation over SSR or SPA                                                                                                                                                                                                                                  | 4 Sep  | Accepted                         |
| ADR-003 | Markdown in the repository over a headless CMS                                                                                                                                                                                                                          | 4 Sep  | Accepted                         |
| ADR-004 | Cloudflare Pages as the host                                                                                                                                                                                                                                            | 4 Sep  | **Superseded by ADR-010**        |
| ADR-005 | Tailwind CSS v4 over hand-authored CSS                                                                                                                                                                                                                                  | 4 Sep  | Accepted, unimplemented until M2 |
| ADR-006 | Test strategy: smoke tests and budgets, no coverage target, three browser engines                                                                                                                                                                                       | 19 Sep | Accepted                         |
| ADR-009 | GitHub Actions as the deployment trigger                                                                                                                                                                                                                                | 17 Sep | Accepted                         |
| ADR-010 | Cloudflare Workers static assets as the host, superseding ADR-004                                                                                                                                                                                                       | 17 Sep | Accepted                         |

ADRs 007 and 008 are reserved and scheduled for M4: cookieless analytics, and contact
information exposure.

---

## Open questions

| #    | Question                                                                                                                                                          | Owner | Blocking |
| ---- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----- | -------- |
| OQ-3 | Subdomain name for the tools project (`lab.` or `tools.`) — reserved, not built. Do not act before v1.0.0                                                         | Diogo | Nothing  |
| OQ-4 | Lighthouse tooling: `@lhci/cli` pinned to Lighthouse 12.6.1, or Lighthouse 13.5.0 driven by a script we own. Deferred with #9 and re-verified before implementing | Diogo | #9       |

---

## Live risks

| #   | Risk                                                                                               | State                                                                                 |
| --- | -------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------- |
| R-A | Nuxt static preset on the host                                                                     | **Closed 7 Sep** — prerenders cleanly, four routes, no server output                  |
| R-B | TypeScript 6 pin against Nuxt's expectations                                                       | **Closed 17 Sep** — `vue-tsc` strict, zero errors                                     |
| R-C | Nuxt Content v3 may ship a client-side bundle, breaching the JavaScript budget                     | Open — Content is not installed until M2; measured then                               |
| R-E | Cloudflare Pages free-tier build quotas never read from primary source                             | **Closed 17 Sep** — moot. ADR-010 moved off Pages, and builds run on GitHub Actions   |
| R-F | Nuxt 5 supersedes Nuxt 4 within roughly a year                                                     | Accepted, scheduled post-launch                                                       |
| R-G | `wrangler` against a Nuxt 4 static build untested                                                  | **Closed 17 Sep** — assets-only Worker deploys and serves correctly                   |
| R-H | `@lhci/cli` has had no release since June 2025 and pins Lighthouse 12.6.1 against a current 13.5.0 | Open — see OQ-4. Scores will not match Chrome DevTools, and it may not run on Node 24 |

---

## Measured baselines

Recorded so later numbers have something to be compared against.

| What                               | Value                            | Measured                                                 |
| ---------------------------------- | -------------------------------- | -------------------------------------------------------- |
| First-load JavaScript, main chunk  | 157.93 kB raw / 57.67 kB gzipped | 7 Sep, build output, empty page                          |
| Main chunk transferred             | 56.9 KiB                         | 19 Sep, PageSpeed Insights against production            |
| Lighthouse Performance (mobile)    | 100                              | 19 Sep, PageSpeed Insights                               |
| Lighthouse Accessibility (mobile)  | 88                               | 19 Sep — three failures, two of them `<NuxtWelcome />`'s |
| Lighthouse Best Practices (mobile) | 100                              | 19 Sep                                                   |
| Lighthouse SEO (mobile)            | 91                               | 19 Sep                                                   |

NFR-02's budget is set from the measured figure plus 20% when #9 is implemented, not before.

---

## Cut list, in order

US-13 (recency signal), US-09 (dependency bot — now delivered, so no longer available to
cut), US-08 (branch previews — delivered, and #8 and #9 depend on it), US-17 reduced to no
photograph rather than a placeholder.

**Never cut:** any ADR, any pull request review, the accessibility pass, the retrospective,
or maintaining the interview bank — kept outside this repository, see D8.

---

## For the retrospective

Recorded at the time rather than reconstructed at the end.

- The `main protection` ruleset was configured but never saved. A commit reached `main`
  through the gap, and it was only noticed because the control was tested rather than
  trusted. On 19 September the identical mistake — committing to `main` directly — was
  rejected with GH013. Same error, two outcomes, because the second time the control was
  real.
- Required status checks could only be added after the workflow had run once, so the
  pipeline was advisory for its first several merges — including the one that put an
  invalid workflow file on `main`. The ordering is forced by GitHub; the gap is worth
  knowing about rather than assuming protection from the moment a ruleset exists.
- E1 had no story creating the application its CI gates would run against. Invisible in the
  milestone plan, obvious the moment the tickets were written against the Definition of
  Ready.
- Estimating revealed that E7 and E8 were 42% of the backlog and sat entirely in the final
  two days of the original plan. The resequencing came from the estimate, not the plan.
- Branch protection requires zero approvals because GitHub does not permit self-approval.
  The status checks are enforced; the review is disciplined. Knowing which is which is
  worth more than claiming both.
- Two re-plans in two weeks, both missed, before dropping dates entirely. The estimates
  were not wrong about the work; they were wrong about how much of it a person job-hunting
  would do in a week. Available hours were never the constraint the plan modelled.
- Three controls were configured but not working: the ruleset gap, a link checker reporting
  Successful 0 while passing, and Always Use HTTPS switched off with `.dev` HSTS preload
  hiding it in browsers. All three surfaced by testing behaviour rather than reading
  settings.
- Writing the 404 test surfaced a missing `not_found_handling` in the Worker config before
  the test had ever run in CI. An unknown path was returning a bare 404 with no body.
- The same defect appeared three different ways across three browser engines: Chromium and
  WebKit rendered an empty page, Firefox rejected the response outright with
  NS_ERROR_NET_EMPTY_RESPONSE. Running one engine would have shown half of it. This is the
  concrete answer to why NFR-09 names four engines.
- A pull request description reading `Closes #7, #10 and #13` closed only #7. GitHub needs
  the keyword before each number. The work shipped, the tracker silently drifted, and three
  issues sat open for two weeks.
- Two tools named in the original brief had aged by the time they were used: Cloudflare
  Pages now carries a "legacy" label in its own dashboard, and `@lhci/cli` has had no
  release in fifteen months. Verifying a specification against its primary source before
  building on it caught both.
