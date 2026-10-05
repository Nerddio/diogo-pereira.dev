# ADR-013 — Driving Lighthouse directly rather than through Lighthouse CI

|                |                                                                |
| -------------- | -------------------------------------------------------------- |
| **Status**     | **Accepted** — 5 October 2026                                  |
| **Date**       | 5 October 2026                                                 |
| **Deciders**   | Diogo Pereira (tech lead)                                      |
| **Depends on** | ADR-002, ADR-006 (accepted)                                    |
| **Refines**    | ADR-006, which decided that budgets gate the merge but not how |
| **Closes**     | OQ-4, R-H                                                      |

## Context

ADR-006 decided that performance and accessibility budgets gate the merge. It did not decide
what runs them, and the brief left the tooling open with a warning attached: `@lhci/cli` had
gone a long time without a release. That became OQ-4, deferred with #9 and marked to be
re-verified before implementing rather than assumed.

Re-verified on 5 October 2026, three things turned out to matter.

**Lighthouse stopped enforcing anything in version 12.0.0.** Budget support was removed from
core. Checked by unpacking the published tarballs: version 11.7.1 contains six budget-related
files, 12.0.0 contains none, 13.5.0 contains none, and `--budget-path` is absent from the
current command-line help. Lighthouse measures; something else has to assert. Any design that
assumed one tool does both is wrong before it is written.

**`@lhci/cli` is stale and version-locked, but it is not broken.** Latest release 0.15.1,
published 25 June 2025 — sixteen months. It declares no supported Node range and depends on
`"lighthouse": "12.6.1"` as an exact pin rather than a range, so it cannot pick up Lighthouse
13 even in principle. R-H guessed it might not run on Node 24; it does, verified. The problem
is not that it fails, it is that it silently measures with a two-major-version-old analyser.

That is not academic. Lighthouse 13 replaced sixteen performance audits with insight audits
and removed seven others. A gate on 12.6.1 and a score read from PageSpeed Insights are no
longer measuring the same thing, which defeats the point of having a number to compare.

**Score variance is real but concentrated.** Measured ten runs on identical content. A heavy
page scoring in the sixties swung between 61 and 80 — nineteen points on the same bytes. A
prerendered page of this project's shape scored 100 on all ten. Accessibility, best practices
and SEO were 100 in every run of both, because they are rule-based rather than timing-based.
The flakiness risk lives almost entirely in the performance category, and a prerendered static
site with a 95 floor and a real score of 99 has room to absorb it.

## Decision

**Run Lighthouse 13.5.0 from a script in this repository, three times per route, and assert
the median.** The script exits non-zero when a category falls below its threshold or the
transferred JavaScript exceeds its budget.

| Category       | Threshold |
| -------------- | --------- |
| Accessibility  | 100       |
| Performance    | >= 95     |
| Best practices | >= 95     |
| SEO            | >= 95     |

Mobile emulation and simulated throttling, both of which are Lighthouse's defaults — the
settings are left alone rather than configured, so there is less to drift.

**The JavaScript budget is 105,000 bytes transferred per route.** Measured against the built
site served with compression: 83,275 bytes on the home page and 88,066 on the project routes,
with no variation across runs. The budget is the larger figure plus the twenty per cent
headroom NFR-02 asks for.

Two honest notes about that number. NFR-02 says the baseline is measured at M1; a baseline on
this basis was never captured, because the figure recorded then was the main chunk rather than
total transferred script. This budget is therefore anchored at M2 and includes the content
layer M2 added, which is more generous than NFR-02 intended. Recording that is better than
quietly treating a later measurement as the original. And the measurement used gzip, while the
production edge also offers brotli, which compresses better — so the real figure is likely
lower and the budget is conservative in the safe direction.

**Three runs, asserting the median.** Lighthouse's own variability guidance notes the median of
five runs is twice as stable as one. Three was enough for the median to hold steady even on
the unstable page in the measurements above, and each run costs about six seconds.

**No Chrome installation step.** The GitHub Actions Ubuntu image ships Chrome, and Lighthouse's
launcher finds it on `PATH` without configuration. The existing Playwright install is
deliberately not reused: recent Playwright ships a headless shell for its chromium channel,
which is a different build from the Chrome that Lighthouse is designed around.

## Options considered

**`@lhci/cli`, the conventional answer — rejected.** It is the only tool that provides
assertions out of the box, and its `resource-summary` assertions would cover the JavaScript
budget. Rejected because it pins Lighthouse 12.6.1 exactly, has had no release in sixteen
months, and declares no supported Node range. Adopting it means the gate measures with an
analyser two majors behind the one the scores are compared against, and the fix is to wait for
a maintainer who has not shipped since June 2025.

**Lighthouse 13.5.0 for collection with `lhci assert` for gating — rejected, and it was
close.** Verified working: three reports generated by 13.5.0, read and asserted correctly by
0.15.1. It buys declarative thresholds in a configuration file rather than in code. Rejected
because it keeps an unmaintained dependency for one step, and because a configuration file is
not obviously easier to explain than sixty lines of script in a project whose argument is that
its author can explain it.

**`treosh/lighthouse-ci-action` — rejected.** The usual GitHub Action. It wraps `@lhci/cli`, so
it inherits Lighthouse 12.6.1, and its advertised `budgetPath` input cannot work against any
Lighthouse since 12.0.0 removed budgets — it would appear to enforce the JavaScript budget
while enforcing nothing. That failure mode is this project's recurring one and is reason enough
on its own.

**The PageSpeed Insights API — rejected as a gate.** It would need an API key, which is a
secret, which GitHub withholds from Dependabot pull requests — so the gate would break on
exactly the pull requests this project has already arranged to keep clean. Google also upgrades
Lighthouse underneath it, so the gate's meaning would drift without a commit, and the response
carries no resource-size data so the JavaScript budget would need separate machinery anyway. It
remains a reasonable way to check production by hand.

**`unlighthouse` — rejected.** Actively maintained and the only tool found that runs Lighthouse
13 out of the box, but it is built for crawling a whole site and offers global score thresholds
rather than per-route assertions and resource budgets.

## Consequences

**Gained**

- The gate measures with the current Lighthouse, so its numbers mean the same thing as a
  PageSpeed Insights run against production.
- The JavaScript budget is enforced rather than described. Lighthouse alone cannot do this at
  any version since 12.0.0.
- No third-party action to pin, audit or trust, no secrets, no server, no token, nothing to
  pay for.
- The gate skips cleanly on pull requests without a preview, in lockstep with the end-to-end
  job, because it needs no secrets of its own.

**Accepted costs**

- About sixty lines of gate code to maintain. The same trade as ADR-012, and the same defence:
  small enough to read beats maintained by someone else, for a gate whose behaviour has to be
  explainable.
- Thresholds live in code rather than in a configuration file. Changing one is a commit, which
  is arguably the right friction for a quality gate but is friction.
- Lighthouse is a large dependency and a fast-moving one. It is build-time only and never
  reaches a visitor, but it will generate Dependabot traffic.
- The performance category can still vary. Three runs and a median reduce it; they do not
  eliminate it. If a build ever fails on performance alone while the content did not change,
  the first thing to check is the runner rather than the site.

**Security**

The gate adds no secret and no network surface: it drives a browser already present on the
runner against a URL the pipeline already produced. This is deliberately unlike the convenient
path — `temporaryPublicStorage` in the usual action uploads the full report to a public
Google-hosted URL, which for this site would leak nothing, but is an outbound publish that
should be chosen rather than inherited from a copied snippet.

**Verified before acceptance**

Both candidate tools were installed and run on Node 24.16.0, the version this project pins.
`@lhci/cli` completed a full collect-and-assert cycle and failed correctly on a tightened
budget, which is how its continued viability was established rather than assumed. Lighthouse
13.5.0 was driven from a script against the built site: three runs per route, medians taken,
thresholds and a byte budget asserted, exit codes confirmed in both directions. Budget removal
was confirmed by unpacking four published tarballs rather than by reading release notes.

**Reversibility**

High. The thresholds and the budget are data; the script around them is small. Moving to
`@lhci/cli` later, if it is revived, means writing a configuration file and deleting a script.
