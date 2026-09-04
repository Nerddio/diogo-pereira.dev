# Glossary

Every term, acronym and piece of shorthand introduced in this project, defined in one
sentence. Added to as the project proceeds. If a term is used in an artefact and is not
here, that is a defect.

Last updated: 4 September 2026.

---

## Process and delivery

**Acceptance criteria** — the testable conditions that must hold for a user story to be
considered delivered, written here in Given/When/Then form.

**ADR (Architecture Decision Record)** — a short dated document capturing one significant
technical decision: the context that forced it, the decision taken, and the consequences
accepted; never edited to look better later, only superseded by a newer record.

**Backlog** — the ordered list of everything not yet done.

**Conventional Commits** — a commit message convention (`type(scope): summary`) that makes
history machine-readable, so a changelog can be derived rather than hand-written.

**Definition of Done (DoD)** — the exit gate: the conditions that make "done" a fact rather
than an opinion, identical for every ticket so it cannot erode under deadline pressure.

**Definition of Ready (DoR)** — the entry gate: the conditions a ticket must satisfy before
work starts, so nothing stalls halfway through on an unanswered question.

**Discovery** — the lifecycle stage that defines the problem, the affected people and the
conditions for success, before any solution is chosen.

**Epic** — a group of related user stories delivering one coherent capability, too large to
finish in a single branch.

**Given/When/Then** — a format for acceptance criteria stating the precondition (Given), the
action (When) and the observable result (Then).

**GitHub Flow** — a branching strategy with one long-lived branch (`main`), short-lived
branches off it, and a pull request per change; simpler than Git Flow and appropriate where
there is one deployed version.

**Lagging indicator** — a measure taken after the work that confirms the outcome.

**Leading indicator** — a measure taken during the work that predicts the outcome.

**MoSCoW** — a prioritisation scheme classifying scope as Must, Should, Could, or
Won't-have-this-time.

**Persona** — a condensed, evidence-based description of one reader, used as a tool for
settling design arguments; if it cannot cause a feature to be cut, it is written wrong.

**Product owner** — the role that decides scope, priority and what counts as done.

**Retrospective** — a written review at the end of a piece of work recording what worked,
what did not, and what changes next time, written at the time rather than reconstructed
later.

**Story point** — a relative measure of size combining effort, complexity and uncertainty;
deliberately not a unit of time, and useless for forecasting without a measured velocity.

**Tech lead** — the role that owns technical direction and approves designs.

**Traceability** — the property that every item of work can be linked back to a requirement,
and every requirement to a reader who needs it.

**User story** — a capability stated from one reader's point of view in the form *As a
&lt;role&gt;, I want &lt;capability&gt;, so that &lt;benefit&gt;*; a placeholder for a conversation, not a
specification.

**Velocity** — the number of story points a team completes per iteration, measured from
history; cannot be claimed on a first project.

**WIP limit (work in progress)** — a cap on how many tickets may be in flight at once; here
it is one.

---

## Architecture and rendering

**C4 model** — a way of drawing software architecture at four zoom levels: system context
(L1), containers (L2), components (L3) and code (L4); this project uses L1 and L2 only.

**CDN (Content Delivery Network)** — a geographically distributed set of servers that cache
and serve content from a location near the visitor.

**Edge** — the CDN location nearest the visitor, where requests are served without reaching
an origin server.

**Frontmatter** — the structured metadata block at the top of a markdown file, used here to
carry typed project fields validated at build time.

**Headless CMS** — a content management system that stores and serves content through an API
with no front end of its own.

**Hydration** — the process by which client-side JavaScript attaches behaviour to
server-rendered HTML already in the browser.

**Hydration payload** — the JavaScript and serialised state shipped to the browser to make
hydration possible; the cost of choosing a hydrating framework over a zero-JavaScript one.

**ISR (Incremental Static Regeneration)** — a hybrid strategy that serves prerendered pages
and rebuilds them in the background on a schedule or on demand.

**Meta-framework** — a framework built on top of a UI library (here, Nuxt on Vue) that adds
routing, rendering strategies, build output and deployment presets.

**Nitro** — the server engine underneath Nuxt that produces deployment-specific build output.

**Preset** — a Nitro configuration that adapts the build output to a particular hosting
target.

**Prerendering** — generating a route's HTML at build time rather than per request.

**SPA (Single-Page Application)** — an application that renders content in the browser after
JavaScript loads, updating the page without full navigations.

**SSG (Static Site Generation)** — producing every route's HTML at build time, so production
has no runtime server.

**SSR (Server-Side Rendering)** — producing a route's HTML per request on a running server.

**Static assets** — files served exactly as built (HTML, CSS, JavaScript, images) with no
computation per request.

---

## Frontend

**Composable** — in Vue 3, a reusable function encapsulating stateful logic, the Composition
API's replacement for mixins.

**Composition API** — Vue 3's function-based way of organising component logic, as opposed to
the Options API's object of named sections.

**Design tokens** — the named primitive values of a design system (colours, spacing, type
scale) defined once and referenced everywhere.

**SFC (Single-File Component)** — a Vue `.vue` file containing template, script and style for
one component.

**`<script setup>`** — Vue 3 compile-time syntax that makes the Composition API terser inside
a single-file component.

**Utility-first CSS** — a styling approach composing small single-purpose classes in markup
rather than authoring semantic class names, as Tailwind does.

---

## Quality and testing

**Accessibility budget** — an enforced minimum accessibility score, breached builds failing
rather than warning.

**axe** — an automated accessibility testing engine, used here inside Playwright.

**CLS (Cumulative Layout Shift)** — a Core Web Vital measuring how much visible content moves
unexpectedly during load.

**E2E (end-to-end) test** — a test driving the real application through a browser as a user
would, rather than testing a unit in isolation.

**Lighthouse** — an automated auditing tool scoring performance, accessibility, best
practices and SEO.

**LCP (Largest Contentful Paint)** — a Core Web Vital measuring when the largest visible
element finishes rendering.

**Performance budget** — an enforced limit on a performance metric or resource size, checked
automatically so regressions cannot merge.

**Playwright** — a browser automation library used here for end-to-end tests.

**Quality gate** — an automated check that must pass before a change can merge.

**Smoke test** — a shallow test confirming the critical paths work at all, rather than
testing them exhaustively.

**WCAG 2.2 AA** — the Web Content Accessibility Guidelines at conformance level AA, the level
commonly required by European public-sector and procurement rules.

---

## CI/CD, release and operations

**Artifact** — a file produced by a build or test run and stored, such as a Playwright trace.

**Branch protection / ruleset** — repository rules constraining what may happen to a branch,
such as requiring a pull request or blocking force pushes.

**CI/CD (Continuous Integration / Continuous Delivery)** — automatically building and testing
every change as it is integrated, and automatically delivering it to an environment.

**Changelog** — a human-readable, curated record of what changed in each release; this project
follows the Keep a Changelog format.

**Force push** — overwriting a remote branch's history; `--force-with-lease` is the safe form,
which aborts if the remote moved since you last saw it.

**Linear history** — a commit history with no merge commits, produced here by squash merging.

**Lockfile** — a file recording the exact resolved version of every dependency, so an install
is reproducible; `--frozen-lockfile` makes CI fail rather than silently update it.

**LTS (Long-Term Support)** — a release line receiving fixes for an extended period; Node's
Active LTS is the appropriate choice for production.

**Pinning** — fixing a dependency to one exact version rather than a range that can move.

**Preview deployment** — a deployment of a branch to its own URL, so a change can be reviewed
and tested as a real artefact before merging.

**Rebase** — replaying commits onto a new base; `rebase -i` (interactive) additionally allows
reordering, squashing or rewording them.

**Required status check** — a CI job whose success is a precondition for merging; a gate not
named in the ruleset is not enforced.

**Rollback** — returning production to a previous known-good state.

**RTO (Recovery Time Objective)** — the target time to restore service after a failure.

**Runbook** — short operational instructions for recurring or emergency tasks.

**Semantic versioning (SemVer)** — the `MAJOR.MINOR.PATCH` scheme where major means a
breaking change, minor a backwards-compatible feature, and patch a fix.

**SLO (Service Level Objective)** — a target for a measurable aspect of service, such as
availability; none is claimed here, deliberately.

**Squash merge** — combining all commits on a branch into one commit on the target branch.

---

## Security and privacy

**Authentication** — proving who you are.

**Authorization** — determining what you are allowed to do once authenticated.

**Dependabot** — GitHub's tool for alerting on vulnerable dependencies and opening update
pull requests.

**GDPR (General Data Protection Regulation)** — the EU regulation governing processing of
personal data.

**HSTS (HTTP Strict Transport Security)** — a mechanism instructing browsers to use HTTPS
only; the `.dev` TLD is preloaded, so HTTPS is mandatory and not merely preferred.

**Least privilege** — granting only the permissions actually required, so a compromise has
the smallest possible blast radius.

**MFA (Multi-Factor Authentication)** — requiring a second proof of identity beyond a
password.

**Push protection** — GitHub's blocking of a push containing a detected credential, before it
enters history; it matches credential patterns, not arbitrary personal data.

**Registrar lock** — a registrar setting preventing a domain from being transferred away
without deliberate unlocking.

**Secret scanning** — detecting credentials committed to a repository.

**SHA pinning** — referencing a GitHub Action by full commit hash rather than a moving tag,
so the code that runs cannot be changed under you.

**Supply chain** — the set of third-party code and tools a build depends on, and a realistic
attack path into any project that has one.

**Threat model** — an explicit statement of who might realistically attack a system, what
they would want, and what is therefore worth defending; being able to say why a control is
unnecessary is as strong a signal as implementing one.

**TLS certificate** — the credential proving a domain's identity, enabling HTTPS.

---

## Web, SEO and domains

**Apex domain** — the domain without a subdomain prefix (`diogo-pereira.dev` rather than
`www.diogo-pereira.dev`).

**Canonical URL** — the declared preferred address of a page, so search engines do not treat
variants as duplicates.

**Cookieless analytics** — visitor measurement that sets no cookies and stores no per-visitor
identifier.

**DNS (Domain Name System)** — the system translating domain names into server addresses.

**JSON-LD** — a format for embedding structured data in a page so machines can interpret it.

**Landmark** — a semantic region of a page (`main`, `nav`, `header`, `footer`) that assistive
technology can navigate between.

**Open Graph** — metadata tags controlling how a link is presented when shared.

**Registrar** — the company through which a domain is registered.

**`robots.txt`** — a file telling crawlers which paths they may request.

**Semantic HTML** — using elements for their meaning rather than their appearance, which is
what makes a page usable by assistive technology.

**Sitemap** — an XML file listing a site's URLs to aid crawling.

**Skip link** — a link, first in tab order, allowing a keyboard user to jump past repeated
navigation to the main content.

**TLD (Top-Level Domain)** — the final segment of a domain name, such as `.dev`.
