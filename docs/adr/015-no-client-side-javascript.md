# ADR-015 — Prerendered routes ship no client-side JavaScript

|                |                                                              |
| -------------- | ------------------------------------------------------------ |
| **Status**     | **Accepted** — 8 October 2026                                |
| **Date**       | 8 October 2026                                               |
| **Deciders**   | Diogo Pereira (tech lead)                                    |
| **Depends on** | ADR-002, ADR-006, ADR-011 (accepted)                         |
| **Refines**    | ADR-002, which chose prerendering but not what ships with it |
| **Relates to** | NFR-01, NFR-02, NFR-03, US-50, US-47, D25                    |

## Context

This was found by a gate refusing a merge, which is worth recording because it is the
clearest evidence so far that the gates are worth their cost.

US-47 adds a cookieless analytics beacon, measured at 10,224 bytes gzipped. The Lighthouse
gate rejected it: the two markdown routes went from 96,316 bytes of transferred JavaScript
to 107,29x against a 105,000-byte budget, about 2,300 over. The obvious responses were to
raise the budget or to drop the analytics. Both were available, both were defensible, and
both would have left the actual question unasked.

The question is what the 96,316 bytes already there were doing.

**They were hydrating pages that have nothing to hydrate.** ADR-002 chose static site
generation: every route is rendered to complete HTML at build time and there is no runtime
server. Nuxt nevertheless ships a client-side runtime whose job is hydration -- attaching
Vue to markup the server already produced, so that the page can become interactive.

Nothing on this site is interactive. A scan of `app/` finds no event handlers, no `v-model`,
no `onMounted`, no `watch`, no plugins, no middleware, no client-only components and no
interactive islands. The single `computed()` derives a boolean from a prop and is evaluated
during render. The nine `<NuxtLink>`s are navigation, which plain anchors do.

So the framework runtime existed to turn a document that already worked into a document that
already worked, at a cost of 91,104 bytes on the home page -- 87% of the entire JavaScript
budget, spent on nothing.

The evidence that removing it was safe had been green since M1 and nobody had read it that
way. NFR-03 requires every route to be complete and readable with JavaScript disabled, and
a dedicated Playwright project has asserted exactly that on every pull request for weeks.
A suite proving the site works without JavaScript is also a suite proving the JavaScript is
unnecessary. The same fact, pointed the other way.

## Decision

**Prerendered routes ship no framework JavaScript.**

```ts
routeRules: {
  '/**': { noScripts: true },
}
```

Nuxt omits the entry scripts, the import map, the payload script and the JavaScript resource
hints. CSS is untouched. Scripts declared in `app.head` are the author's rather than Nuxt's
and are kept, which is what allows the JSON-LD `Person` block and the US-47 analytics beacon
to survive.

### Measured

Both columns measured by the same gate, three runs per route, median taken, mobile emulation.
Before is production on 7 October 2026; after is this change's preview deployment on
8 October 2026.

| route                      | performance before | after   | script bytes before | after |
| -------------------------- | ------------------ | ------- | ------------------- | ----- |
| `/`                        | 98                 | **100** | 91,104              | **0** |
| `/about`                   | 98                 | **100** | 91,145              | **0** |
| `/contact`                 | 98                 | **100** | 91,152              | **0** |
| `/projects`                | 98                 | **100** | 96,316              | **0** |
| `/projects/portfolio-site` | 98                 | **100** | 96,248              | **0** |

Not "less JavaScript" -- none. Accessibility, best practices and SEO were already 100 and
stayed there. The site now scores 100 in all four categories on every route under mobile
emulation.

## Options considered

**Raise the script budget — rejected.** The direct response to the failing gate, and the one
that required no thought. It would have raised a ceiling to make room for weight whose
purpose nobody had established, and weakened the control that found the problem. A budget
raised to accommodate an accident is not a budget.

**Drop the analytics — rejected, and it was the recommendation until this was measured.** It
would have traded a feature the owner wanted against a payload that buys nothing, leaving the
real cost in place and unexamined.

**Apply `noScripts` per route rather than site-wide — rejected.** It is the cautious-looking
option. There is no route that needs hydration, so the exception list would have been empty,
and an empty exception list is a mechanism to maintain in exchange for nothing. If a route
ever does need interactivity, it gets its own rule then, visibly.

**Move to Astro, which ships zero JavaScript by default — rejected, again.** ADR-001 rejected
Astro because the named learning gap was Vue 3 and the Composition API, accepting a slightly
worse artefact for a better-trained engineer. This reaches the same output without reopening
that, and is in fact the stronger answer to "why not Astro": the gap Astro would have closed
turns out to be four lines of configuration in the framework already chosen.

## Consequences

**Gained**

- The claim this site makes about itself becomes literally true. "A static site" previously
  meant static HTML with a framework runtime attached; it now means static HTML.
- Performance reaches 100 on every route, from 98. The remaining two points were the
  framework runtime, which is a more interesting sentence than the score.
- The script budget stops being the binding constraint. The analytics beacon of US-47 fits
  with roughly 94,000 bytes to spare, and the conversation about raising the budget to
  accommodate it is simply over.
- Less code executes in a visitor's browser, which is a smaller attack surface as well as a
  faster page.

**Accepted costs**

- **Pages no longer hydrate**, so `<NuxtLink>` stops prefetching and every navigation is a
  full page load rather than a client-side route change. Five prerendered pages behind a CDN
  make this a fraction of a second, and arguably the honest behaviour for a document site,
  but it is a real change in how the site feels and it is not reversible by accident.
- **Any future interactive component needs scripts re-enabled on its route**, deliberately,
  with the weight that implies. That is a feature of this decision rather than a limitation:
  the cost becomes visible at the moment it is incurred.
- ⚠️ **D25 is now in tension.** It decided dark mode (V1.1) would ship a visitor toggle
  persisting the choice in `localStorage`. A toggle needs JavaScript, and this removes the
  framework that would have provided it. The options are a small hand-written inline script,
  which `noScripts` does not strip, or `prefers-color-scheme` with no toggle at all. That
  decision should be revisited explicitly rather than discovered in V1.1.

**Security**

The only script now reaching a visitor is the analytics beacon of US-47, which the privacy
suite's allowlist governs by name. Everything else is HTML and CSS. A site that executes
almost no JavaScript has correspondingly little for a supply-chain compromise to use, which
is not the reason this was done but is worth being able to say.

**Verified before acceptance**

The built output was inspected rather than trusted to a configuration flag: zero references
to `/_nuxt/*.js` across all six prerendered pages, the stylesheet link intact on each, and an
`<h1>` present on each — the failure mode worth checking being a page that builds
successfully and ships empty. The JSON-LD block survives, which is what established that
`app.head` scripts are kept and therefore that the beacon will survive too.

`tests/e2e/no-hydration.spec.ts` asserts the property on every route and on an unknown route,
by observing what the browser requests rather than by reading configuration. Deleting the
route rule turns it red.

One existing test was removed rather than left passing. `routes.spec.ts` asserted that the
404 page hydrated without throwing; with no scripts on the page there is nothing to hydrate
and nothing that can throw, so it had become a test that could not fail while still reporting
a pass. That is the defect this project has now found six times, and leaving it in place
because it was green would have been the seventh.

⚠️ **The script budget is now vacuous and must be reset.**

NFR-02 set the budget at the M1 baseline plus 20% headroom, and ADR-013 turned that into
105,000 bytes. Against a baseline of zero it will never fire: the entire framework runtime
could be reintroduced tomorrow and the gate would pass, which makes it exactly the kind of
control this project keeps finding -- green, enforced, and incapable of catching the thing
it exists to catch.

The number should be reset once US-47 lands, so it accounts for the beacon and nothing else.
Deliberately not done here: the correct figure depends on a change that has not merged, and
guessing it would repeat the stale-baseline mistake that produced the wrong arithmetic in
the first place. Carried as its own ticket.

**Reversibility**

High. Four lines of configuration, and the test that asserts their effect.
