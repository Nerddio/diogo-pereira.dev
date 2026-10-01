# ADR-011 — Prerendering the 404 page

|                |                                        |
| -------------- | -------------------------------------- |
| **Status**     | Proposed — awaiting tech lead approval |
| **Date**       | 1 October 2026                         |
| **Deciders**   | Diogo Pereira (tech lead)              |
| **Depends on** | ADR-002, ADR-006, ADR-010 (accepted)   |

## Context

NFR-03 requires every route to return complete, readable content in the initial HTML
response with client-side JavaScript disabled. That requirement was false for unknown
routes from the moment `app/error.vue` was written, and nothing in the project noticed
for two weeks.

**The mechanism.** Nuxt 4.5.2 adds `/200.html` and `/404.html` to the prerender list
and then forces both to render _without_ server-side rendering. Both files ship as
empty shells: `data-ssr="false"` and an empty `<div id="__nuxt"></div>`. In the build
that was on `main`, `404.html` and `200.html` were byte-identical at 928 bytes against
3,276 for `index.html`. The error page content only ever appeared after JavaScript
ran in the browser, which is the single-page-application behaviour ADR-002 chose not
to have.

An empty shell is the correct artefact for `200.html`, whose job is to boot the
application for a client-side route. It is the wrong artefact for `404.html`, which a
visitor and a crawler both reach as a destination.

**How it surfaced, and what that says about the gates.** The end-to-end suite's 404
test failed in Chromium only, while Firefox and WebKit passed. Those two were not
passing — they were losing a race more slowly. With JavaScript enabled, hydration
fills the body before the assertion runs, and whether the test sees content depends on
engine timing. Rebuilding without the fix and re-running confirmed it: the original
test passes with the defect present.

The test that _should_ have caught this deterministically did not exist. The
JavaScript-disabled suite iterates `ROUTES`, which lists only routes returning 200, so
the one page that was not prerendered was the one page that suite never looked at.
This is the fourth control in this project found to be configured but not actually
verifying what it claimed, after the unsaved ruleset, the link checker reporting zero
successes, and "Always Use HTTPS" being off.

**The constraint that shapes the fix.** Cloudflare Workers static assets, configured
with `not_found_handling: "404-page"`, serves the nearest file _named_ `404.html` with
a 404 status. A `404/index.html` is never selected, `_redirects` cannot set a 404
status on an asset, and `_headers` cannot change a status code. The artefact therefore
has to be named `404.html`, and the fix has to happen in the build.

## Decision

**Add `app/pages/404.vue` and rename its prerendered output to `404.html` with a
Nitro `prerender:generate` hook.**

```ts
hooks: {
  'prerender:generate'(route) {
    if (route.route === '/404.html') route.skip = true
    if (route.route === '/404') route.fileName = '404.html'
  },
}
```

`app/error.vue` and `app/pages/404.vue` both render a shared `ErrorContent` component,
so the two are indistinguishable to a visitor and the hydration swap on an unknown URL
produces no visible change.

**This decision carries an explicit expiry.** Nuxt has merged
`experimental.prerenderErrorPages` for 4.6.0, which does this first-party by removing
`/404.html` from the no-SSR set. At the time of writing the npm `latest` tag is still
4.5.2 and 4.6.0 is unreleased. When it ships, this hook and `app/pages/404.vue` are
deleted and the flag replaces them. That is a tracked ticket, not an intention.

**The JavaScript-disabled suite now covers an unknown route**, which is the gate that
would have caught this on the day it was introduced.

## Options considered

**Wait for Nuxt 4.6 — rejected.** Cleanest configuration and no workaround to explain.
Rejected because the release date is unknown, M2 is blocked behind a red pipeline, and
the job search this project supports does not have open-ended time. Deferring to an
unreleased version is not a plan.

**Narrow NFR-03 to exclude unknown routes — rejected.** Honest, and it would have
turned the pipeline green in one line. Rejected because it weakens a requirement to fit
a tooling limitation rather than the other way round, and because the consequence is
real: a crawler or a JavaScript-disabled visitor following a dead link to this domain
would get a blank page on a site whose entire architectural argument is prerendering.

**`nitro.prerender.routes: ['/404.html']` — does not work.** Nuxt already adds that
route and forces it to no-SSR regardless, so the setting is a no-op. Verified by
building it.

**`nitro.prerender.routes: ['/404']` alone — breaks the build.** Nitro treats the
non-2xx response as a failed route and `failOnError: true` aborts. Verified.

**`prerender.autoSubfolderIndex: false` — rejected.** It does land content in
`404.html`, but it renames every route's output (`about/index.html` becomes
`about.html`) and depends on undocumented write ordering between two routes targeting
the same file. A large blast radius and a race, to avoid four lines.

**A Worker script that re-statuses an asset response — rejected.** Fetching `/404`
through the `ASSETS` binding and returning it with status 404 would work in principle,
but it converts the assets-only Worker into a scripted Worker, directly against
ADR-010, and Cloudflare documents no example of re-statusing an asset response.

## Consequences

**Gained**

- NFR-03 holds for every route, including unknown ones, and is verified rather than
  asserted.
- The JavaScript-disabled suite covers the case that previously had no coverage, and
  it fails deterministically rather than by engine timing.
- The 404 page is now indexable-quality HTML: a crawler following a dead link gets a
  real page with a heading, navigation and a route home.

**Accepted costs**

- `/404` is a real route and returns **200** when requested directly. A robots meta of
  `noindex, follow` keeps that copy out of search results, and US-26 will exclude it
  from the sitemap. It remains slightly odd and a reviewer will ask about it.
- Two components render the same content, which is duplication of intent even though
  the markup lives in one place.
- A build hook is non-obvious. It carries a comment pointing here, and the only way a
  future reader knows why it exists is this record.
- A stray `404/_payload.json` is left in the output. Harmless, unreferenced, and not
  worth a second hook to remove.
- The project now depends on a documented-but-secondary Nitro API. `route.fileName` is
  a public typed field on `PrerenderRoute`, but Nuxt's own documentation for this hook
  only demonstrates `route.skip`.

**Security**

No change to the threat model. The 404 page takes no input, stores nothing and runs no
code the rest of the site does not already run. Worth stating because it is the kind of
page that attracts reflected-content bugs on sites that echo the requested path back to
the visitor — this one does not, and deliberately so: echoing an unsanitised URL into
the page is how a static 404 page becomes a cross-site scripting vector.

**Verified before acceptance**

Built from this repository's own source with the pinned toolchain. `404.html` went from
1,080 bytes and `data-ssr="false"` to 3,179 bytes and `data-ssr="true"`, containing the
layout, skip link, `main` landmark, heading and footer. `200.html` stayed an empty
shell, which is correct. Lint, Prettier, `nuxt typecheck` and `nuxt generate` all pass.
Twelve end-to-end tests pass against the built output served through a local mimic of
Cloudflare's `not_found_handling: "404-page"`. Removing the hook and rebuilding makes
the new JavaScript-disabled test fail and leaves the original 404 test passing, which
is what establishes that the new test can fail and the old one was not sufficient.

Firefox and WebKit were not run locally — the pinned browser downloads are blocked in
the verification environment. CI covers all three engines on the pull request.

**Reversibility**

High. Deleting the hook and `app/pages/404.vue` returns the project to its previous
behaviour exactly, which is how the falsifiability check above was performed.
