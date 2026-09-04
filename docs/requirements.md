# Requirements — diogo-pereira.dev

| | |
|---|---|
| **Stage** | 2. Requirements |
| **Status** | Draft — awaiting product owner approval |
| **Date** | 3 September 2026 |
| **Release** | v1.0.0, target 9 September 2026 |
| **Depends on** | `discovery.md` (approved), ADR-001 (proposed) |

> A **user story** states a capability from one reader's point of view and why it matters,
> in the form *As a &lt;role&gt;, I want &lt;capability&gt;, so that &lt;benefit&gt;*. It is a placeholder
> for a conversation, not a specification.
>
> **Acceptance criteria** in **Given / When / Then** form state the precondition, the
> action and the observable result. If a criterion cannot be demonstrated, it is not a
> criterion — it is an opinion, and it is rewritten or removed.
>
> An **epic** is a group of stories delivering one coherent capability, too large to finish
> in a single branch.
>
> **MoSCoW** classifies scope as **Must** (v1.0.0 does not ship without it), **Should**
> (in v1.0.0, first to be cut under time pressure), **Could** (only if everything above is
> done), **Won't** (explicitly excluded this release, with the reason recorded).

Roles used below: **Recruiter** (Persona B), **Engineer** (Persona A), **Owner** (Diogo,
maintaining the site), **Visitor** (either reader, or anyone).

---

## E1 — Foundation and delivery pipeline

*The M1 epic. Everything else is downstream of it. Live before pretty.*

**US-01 · Must** — As a Recruiter, I want the site to load over HTTPS on a domain matching his name, so that I can trust the link came from him.
- **Given** the domain is registered and Pages is connected, **when** I request `http://diogo-pereira.dev`, **then** I am redirected to the `https://` apex with a valid certificate.
- **Given** the apex is canonical, **when** I request any `www.` URL, **then** I receive a permanent redirect to the same path on the apex.

**US-02 · Must** — As an Engineer, I want a public repository, so that I can inspect how the site was built.
- **Given** I am signed out of GitHub, **when** I open `github.com/Nerddio/diogo-pereira.dev`, **then** the repository, its commit history and `docs/` are readable.

**US-03 · Must** — As the Owner, I want static analysis to block merges, so that style and type errors cannot reach production.
- **Given** a pull request, **when** CI runs, **then** ESLint (zero warnings), the Prettier check, `vue-tsc` in strict mode (zero errors) and the production build all run.
- **Given** any of those fail, **when** I open the PR, **then** the merge button is blocked by a required status check.

**US-04 · Must** — As the Owner, I want end-to-end tests to run against a real deployment, so that they test the artefact rather than the dev server.
- **Given** a pull request, **when** its preview deployment is ready, **then** Playwright runs against that preview URL and the run is a required check.

**US-05 · Must** — As the Owner, I want performance and accessibility budgets enforced at merge, so that regressions cannot ship.
- **Given** a pull request, **when** Lighthouse CI runs under mobile emulation, **then** accessibility 100, performance ≥ 95, best practices ≥ 95 and SEO ≥ 95 are asserted from a committed budget file, and a breach fails the check.

**US-06 · Must** — As a Visitor, I want no broken internal links, so that I never hit a dead end.
- **Given** a pull request, **when** the link checker runs over the built output, **then** zero broken internal links are reported, and any failure blocks the merge.

**US-07 · Must** — As the Owner, I want merges to `main` to deploy automatically, so that releasing is not a manual ritual I can get wrong.
- **Given** an approved PR, **when** it merges to `main`, **then** production is rebuilt and deployed with no manual step, and the elapsed time is recorded in the runbook.

**US-08 · Should** — As the Owner, I want a preview deployment per branch, so that I can review a change at a URL before merging.
- **Given** a branch with an open PR, **when** it is pushed, **then** a preview URL is generated and linked from the PR.

**US-09 · Should** — As the Owner, I want dependency updates to arrive as pull requests, so that they pass the same gates as my own work.
- **Given** a new version of a pinned dependency, **when** the update bot runs, **then** a PR is opened and the full pipeline gates it.

---

## E2 — Home

**US-10 · Must** — As a Recruiter on a phone, I want his role, location and work rights without scrolling, so that I can screen him in under a minute.
- **Given** a 320px-wide viewport, **when** the page loads, **then** name, one-line role, "Gouda, Netherlands", and EU work rights are visible without scrolling and without interpretation.

**US-11 · Must** — As a Recruiter, I want an obvious way to contact him, so that I do not have to hunt.
- **Given** I am on the home page, **when** I look for contact, **then** a route to email is reachable in one interaction from anywhere on the page.

**US-12 · Must** — As an Engineer, I want a route into the projects, so that I can start evaluating within seconds.
- **Given** I am on the home page, **when** I scan below the fold, **then** a link to the projects index and a link to the GitHub profile are present.

**US-13 · Should** — As a Recruiter, I want evidence the site is current, so that I do not dismiss it as abandoned.
- **Given** the home page, **when** it renders, **then** a dated recency signal (last updated, or the current release) is present and generated from the build rather than hand-edited.

---

## E3 — About

**US-14 · Must** — As an Engineer, I want a professional narrative, so that I understand what he has actually done.
- **Given** the About page, **when** I read it, **then** it states his track, his focus, and what he is currently building, in specific rather than promotional language.

**US-15 · Must** — As an Engineer, I want his experience as indexable HTML, so that I can read it without downloading anything.
- **Given** the About page, **when** the experience section renders, **then** the Foldaco role appears as semantic HTML with the outcome metrics already cleared on the public CV.
- **Given** the confidentiality boundary, **when** any item is drafted, **then** it contains no source code, schema, screenshot, internal URL, customer or supplier name, or revenue figure beyond the CV.

**US-16 · Must** — As a Recruiter, I want languages and work rights stated plainly, so that I can rule out a sponsorship problem.
- **Given** the About page, **when** I scan it, **then** Portuguese (native), English C2, French B2, Spanish B2, Dutch A2, EU work rights and Netherlands residency are stated.

**US-17 · Should** — As a Visitor, I want a photograph, so that the page reads as a person.
- **Given** no professional photograph exists yet, **when** About renders, **then** a placeholder appears with a meaningful `alt` attribute, and a V1.1 ticket exists for the real one.

---

## E4 — Projects index

**US-18 · Must** — As an Engineer, I want a projects list, so that I can choose what to open.
- **Given** the markdown collection, **when** the index builds, **then** each entry renders from typed frontmatter with title, summary, stack and links.
- **Given** an entry with invalid or missing frontmatter, **when** the build runs, **then** **the build fails** rather than rendering an incomplete card.

**US-19 · Must** — As an Engineer, I want the single-entry state acknowledged, so that I read it as deliberate rather than empty.
- **Given** one published project, **when** the index renders, **then** a plain sentence states that this is the only completed entry and that the next flagship is in progress.
- **Given** the same page, **when** it renders, **then** no placeholder or "coming soon" project card is present.

---

## E5 — Project detail and the first case study

**US-20 · Must** — As an Engineer, I want a case study page, so that I can judge the reasoning behind a project.
- **Given** a project markdown file, **when** I open its route, **then** the template renders its content with the repository link and the live URL.

**US-21 · Must** — As an Engineer, I want this site's own case study, so that I can evaluate the decisions rather than the pixels.
- **Given** the case study, **when** I read it, **then** it covers the stack decision and what was rejected, the pipeline and its gates, the accessibility and performance budgets, and links to the ADRs and the repository.
- **Given** the case study, **when** it describes the architecture, **then** it states plainly why there is no database, no API and no container, rather than omitting the subject.

---

## E6 — Contact

**US-22 · Must** — As a Recruiter, I want to email him directly, so that I can move without friction.
- **Given** the contact page, **when** it renders, **then** a `mailto:` link, a LinkedIn link and a GitHub link are present, and no form, phone number, postal address or CV download appears.

---

## E7 — Cross-cutting quality

**US-23 · Must** — As a keyboard user, I want to skip repeated navigation, so that I can reach content without tabbing through the header on every page.
- **Given** any page, **when** I press Tab from the top, **then** a visible skip link is the first focusable element and it moves focus to the main landmark.

**US-24 · Must** — As a Visitor, I want a useful 404, so that a wrong URL does not end the visit.
- **Given** an unknown route, **when** it is requested, **then** a styled 404 page renders with navigation back to Home and Projects.

**US-25 · Must** — As a Recruiter, I want the link to preview properly when shared, so that it looks credible in a message.
- **Given** any route, **when** it is shared, **then** it has a unique title, a unique meta description, a canonical URL and Open Graph tags.

**US-26 · Must** — As a search engine, I want to crawl the site correctly, so that his name resolves to this page.
- **Given** the built site, **when** crawled, **then** a valid `sitemap.xml` and `robots.txt` are served and JSON-LD `Person` data is present on Home and About.

**US-27 · Must** — As a Visitor, I want the site to work without client-side JavaScript, so that content is never contingent on a script.
- **Given** JavaScript is disabled, **when** I open any V1 route, **then** the full content is present and readable in the initial HTML response.

**US-28 · Must** — As a Visitor, I want no tracking, so that my visit is not recorded against me.
- **Given** any route, **when** it loads, **then** zero cookies are set and no request goes to any origin other than the site's own and the cookieless analytics endpoint, asserted in an automated test.

**US-29 · Must** — As a Visitor, I want an accurate privacy note, so that the no-tracking claim is verifiable.
- **Given** the site, **when** I look for a privacy statement, **then** a short, specific note states what is and is not collected, with no boilerplate and no claim the site does not honour.

**US-30 · Must** — As a Visitor using assistive technology, I want WCAG 2.2 AA conformance, so that I can use the site at all.
- **Given** each route, **when** an automated axe scan runs, **then** zero violations are reported.
- **Given** a release candidate, **when** the manual checklist is run, **then** all seven items pass and the result is recorded with a date: keyboard traversal with no trap, visible focus on every interactive element, 200% zoom and 320px reflow, non-text contrast, `prefers-reduced-motion`, landmark and heading structure, skip link.

---

## E8 — Documentation and release

**US-31 · Must** — As an Engineer, I want the decision record, so that I can judge how he reasons.
- **Given** `docs/adr/`, **when** I open it, **then** ADRs 001–008 are present, dated, numbered, and each states context, decision and consequences including what was given up.

**US-32 · Must** — As an Engineer, I want architecture diagrams in version control, so that I can see they are maintained rather than drawn once.
- **Given** the repository, **when** I open the architecture docs, **then** C4 Level 1 and Level 2 diagrams exist as committed text, not images.

**US-33 · Must** — As a stranger, I want to clone and run the project from the README, so that I can verify it actually works.
- **Given** a clean container with only Node and pnpm, **when** I follow the README, **then** the dev server runs with no undocumented step, in under 10 minutes, and the timed result is recorded — including that the run was performed by the developer rather than an independent stranger, which is the weaker check.

**US-34 · Must** — As the Owner, I want a versioned, changelogged release, so that I can talk about release management with evidence.
- **Given** v1.0.0, **when** I open `CHANGELOG.md`, **then** a Keep a Changelog entry exists for it and the commit is tagged `v1.0.0` in git.

**US-35 · Must** — As the Owner, I want a runbook, so that recovery is not improvised.
- **Given** the runbook, **when** I read it, **then** it covers rollback (rehearsed once before release, with the observed time recorded), domain renewal, and a statement that no independent availability target is claimed.

**US-36 · Must** — As the Owner, I want a retrospective written at the time, so that it is honest rather than reconstructed for an interview.
- **Given** the close of v1.0.0, **when** the retrospective is written, **then** it records what worked, what did not, and what changes for flagship 2 — including the enforced-versus-disciplined distinction in the PR review gate.

**US-37 · Must** — As the Owner, I want a glossary, so that the vocabulary is written down where it can be revised.
- **Given** `docs/GLOSSARY.md`, **when** v1.0.0 ships, **then** every term introduced across the artefacts has a one-sentence definition.

**US-38 · Should** — As the Owner, I want the contact surface verified before release, so that nothing unwanted is committed permanently.
- **Given** a release candidate, **when** the repository and its full history are searched, **then** no phone number, postal address or CV file is present in the working tree, the build output or `git log -p`.

---

## Won't have this release

Recorded so the boundary is a decision rather than an omission.

| Item | Reason |
|---|---|
| Real professional photograph | Does not exist yet. V1.1 — shipping it after launch is visible activity, not a delay |
| Per-page Open Graph images | V1.1. A single site-wide OG image satisfies US-25 |
| Dark mode | V1.1. Polish, and the first thing cut under time pressure |
| Foldaco case studies | Unverifiable without artefacts that confidentiality forbids. About covers the ground honestly. Closed — do not reopen |
| Downloadable CV, phone number, postal address | ADR-008 |
| Contact form or any backend | ADR-003, ADR-008. A `mailto:` is correct for two fields |
| Blog | A commitment the schedule cannot honour, and abandoned blogs read worse than none |
| Unit test coverage target | ADR-006 |
| Docker, database, authentication | Nothing to containerise or store. Flagship 2 owns these gaps |
| Dutch/English internationalisation | V2, gated on Dutch level |
| Any redesign before launch | Live before pretty |

---

## Traceability

Every story above serves at least one of the three conclusions in `portfolio-goals.md` §3
and at least one discovery metric. E1 and E8 carry conclusion 2 (works professionally),
E3 and E5 carry conclusion 3 (delivers business value), and E4, E5 and E7 carry
conclusion 1 (builds complete systems). No story exists without a reader who needs it.

**Next artefact:** planning — Definition of Ready, Definition of Done, story point
estimates, and the mapping of these epics onto M1–M5.
