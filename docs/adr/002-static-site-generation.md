# ADR-002 — Static site generation over SSR or SPA

| | |
|---|---|
| **Status** | Proposed — awaiting tech lead approval |
| **Date** | 3 September 2026 |
| **Deciders** | Diogo Pereira (tech lead) |
| **Depends on** | ADR-001 (accepted) |

## Context

Five route types of content authored by one person. No authenticated users, no per-visitor
content, no data that changes without a human editing a file. Nuxt supports several
rendering strategies, and the choice determines the hosting bill, the operational surface,
the SEO outcome and whether the site can meet its performance budget.

The strategies differ in *when* HTML is produced. **Static site generation (SSG)** produces
it at build time. **Server-side rendering (SSR)** produces it per request. A **single-page
application (SPA)** produces it in the browser after JavaScript loads.

## Decision

**Prerender every route at build time.** `ssr: true` with full prerendering, producing
static HTML, CSS and a hydration bundle. No runtime server exists in production.

## Options considered

**SSR — rejected.** Requires a running server, which means a hosting cost, cold starts, an
uptime concern and an operational story. It buys per-request freshness and personalisation,
neither of which this site has any use for: the content changes only when its author edits
a markdown file. Paying a permanent operational cost for a capability with no consumer is
the definition of over-engineering.

**SPA — rejected.** Content would arrive only after the JavaScript bundle loads and
executes. Worse Largest Contentful Paint, worse crawlability, and it directly violates
NFR-03: the requirement that every route is readable in the initial HTML response. For a
site whose entire job is to be read by a recruiter on a phone and a crawler indexing a
name, this is the wrong end of every trade-off.

**Hybrid / incremental static regeneration — rejected.** Nuxt's `routeRules` can mix
strategies per route. Powerful, and solves a problem this site does not have. Adding it now
would be complexity chosen to look sophisticated.

## Consequences

**Gained**

- Zero runtime attack surface. There is no server to exploit, patch or misconfigure.
- €0/month hosting is achievable, satisfying NFR-13.
- The performance budget becomes realistic rather than aspirational: HTML arrives from a
  CDN edge with no origin round trip.
- The full-content-without-JavaScript claim in NFR-03 is true by construction rather than
  by effort.

**Accepted costs**

- A content change requires a rebuild and a deploy. Acceptable because deployment is
  automated (US-07) and the author is the developer.
- Build time grows with page count. Irrelevant at five routes; would matter at ten
  thousand, and knowing that boundary is part of the point.
- Personalisation is impossible without re-architecting. Correct: there is nobody to
  personalise for.

**Operational consequence, stated rather than hidden**

There is no server, so there are no server metrics, no logs, no traces and no meaningful
uptime SLO to own. The operations section of this project is therefore genuinely thin, and
it will say so. Inventing an observability story for a static site on a managed CDN would
be the kind of theatre this project exists to avoid. Observability is a flagship-2 gap.

**Interview value**

The useful half of this decision is knowing when it inverts: prerendering is wrong for
per-user content, for data that changes faster than you can rebuild, and for page counts
where build time exceeds the deploy cadence.
