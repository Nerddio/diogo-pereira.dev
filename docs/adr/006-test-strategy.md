# ADR-006 — Test strategy: smoke tests and budgets, no coverage target

|                |                                        |
| -------------- | -------------------------------------- |
| **Status**     | Proposed — awaiting tech lead approval |
| **Date**       | 19 September 2026                      |
| **Deciders**   | Diogo Pereira (tech lead)              |
| **Depends on** | ADR-002, ADR-010 (accepted)            |
| **Governs**    | #8, #9, and US-27 to US-30             |

## Context

This site has no data model, no API, no authentication, no user input and no business
logic. It is prerendered HTML served from a CDN. Most of what a test suite normally
protects does not exist here.

The scarce resource is attention, not CI minutes. A suite that is large but asserts
little costs review time on every pull request and buys false confidence, which is worse
than no suite at all.

The project also names automated testing as a skill gap, with "partial" as the honest
word. This ADR decides what the partial half is.

## Decision

**End-to-end smoke tests asserting properties of the deployment, plus performance and
accessibility budgets as a separate merge gate. No unit tests and no coverage target.**

Tests run against a real preview deployment (#12), across **Chromium, Firefox and
WebKit**, because NFR-09 claims those browsers and a claim the suite does not exercise is
an assertion rather than evidence.

### What the smoke tests assert

Properties that stay true as content changes:

- Every route returns 200.
- Content is present in the initial HTML response with JavaScript disabled (NFR-03).
- An unknown route serves the 404 page rather than a server error or an empty body.
- No console errors on load.
- No cookies are set, and no request reaches an origin outside the allowlist (NFR-05).

### What they deliberately do not assert

The text on any page. The site currently renders a framework welcome screen and every
route gains real content in M2. A test written against today's copy would be deleted next
week, and a test written to be deleted is padding — which the working agreements prohibit.

### Automated accessibility scanning

`@axe-core/playwright` belongs in this suite rather than in a separate tool: an
accessibility violation is a defect, and defects belong with the other defect checks. It
is decided here and implemented with US-30 at M4 rather than pulled into #8, so ticket
boundaries hold.

## Options considered

**Unit tests with a coverage target — rejected.** There are no units. The functions in
this codebase are framework configuration and template rendering; testing them would test
Nuxt. A coverage percentage here would be a number with nothing behind it, and chasing it
would mean writing tests that cannot fail. Rejected for this project specifically, not as
a general position — flagship 2 has business logic and inverts this decision.

**Visual regression testing — rejected.** Would catch a CSS change that breaks layout,
which nothing else here does. Rejected on cost: screenshot baselines need updating on
every intentional design change, and on a site whose design is still being written that is
a maintenance burden with a poor ratio to what it catches.

**Chromium only — rejected.** Would cut install time and CI minutes by roughly two thirds.
Rejected because NFR-09 names four browser engines as a compatibility requirement, and a
requirement verified on one engine is not verified. The cost is CI minutes, which this
project has in surplus; the benefit is that the compatibility claim is evidence.

**No automated tests, relying on Lighthouse alone — rejected.** Lighthouse reports scores,
not correctness. It would not notice a route returning 500 as long as the homepage scored
well.

## Consequences

**What this gives up, stated plainly**

- No refactoring safety net. Changing how something is built has no test to confirm
  behaviour held — acceptable while there is almost no behaviour, and a real cost the
  moment there is.
- No coverage figure. Asked what the coverage is, the honest answer is that there is none
  and why: the question is the wrong one for a codebase with no logic to cover.
- Content errors pass. A typo, a wrong link label or a misleading heading ships. Human
  review catches those, and the suite does not pretend otherwise.
- A CSS change that breaks layout passes, subject to what the manual accessibility pass
  catches.

**What it buys**

- Every test can fail, and a failure means something is genuinely broken.
- The suite survives M2 unchanged, because it asserts nothing about content.
- Three browser engines are exercised on every pull request, so NFR-09 is evidence rather
  than an assertion.
- The gates are honest: this is a static site, and the tests match what a static site can
  meaningfully be wrong about.

**Interview value**

The useful half is knowing when this inverts. Unit tests earn their place where logic has
branches worth enumerating — validation, calculation, state transitions, error handling.
None of those exist here. Being able to say which tests were not written, and why, is a
stronger signal than a coverage badge.
