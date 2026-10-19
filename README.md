# diogo-pereira.dev

[![CI](https://github.com/Nerddio/diogo-pereira.dev/actions/workflows/ci.yml/badge.svg)](https://github.com/Nerddio/diogo-pereira.dev/actions/workflows/ci.yml)

Personal site and portfolio index for Diogo Pereira, full-stack engineer, based in the
Netherlands. **Live at [diogo-pereira.dev](https://diogo-pereira.dev).**

## What this is

A static site built to be the front door for recruiters and hiring engineers, and the index
that future projects link back to. The site itself is deliberately simple; its engineering
interest is in the delivery pipeline and the decision trail, not in architectural
complexity.

That choice is argued rather than assumed: there is no backend, no database and no API
here, and [the architecture notes](docs/architecture.md) say why those artefacts are absent
instead of leaving the gap unexplained.

## Running locally

**Requirements**

|      |                                                                                               |
| ---- | --------------------------------------------------------------------------------------------- |
| Node | `24.16.0`, pinned in [`.nvmrc`](.nvmrc). With `nvm` or `fnm` installed, `nvm use` picks it up |
| pnpm | `11.25.0`, pinned by `packageManager` in `package.json` and installed by Corepack             |

```bash
git clone https://github.com/Nerddio/diogo-pereira.dev.git
cd diogo-pereira.dev
corepack enable
pnpm install
pnpm dev
```

The development server prints its own URL, usually `http://localhost:3000`.

To build the site as it is deployed, and serve the result with any static file server:

```bash
pnpm generate
```

The output lands in `.output/public`. Every route is a complete HTML file; there is no
server component to run.

**Verified 19 October 2026:** clean Linux container, nothing pre-installed, **25 seconds**
from clone to a running development server, with no step requiring guesswork. Two caveats
worth stating rather than leaving for you to discover: the reader was not independent — the
run was performed by the same pair that wrote these instructions — and only Linux was
exercised. Nobody has run this on macOS.

> **If the site looks wrong locally, check the fonts.** `@nuxt/fonts` fetches the web fonts
> at build time. On a network that blocks Google Fonts — a corporate proxy, a restricted
> container — it emits a warning, produces no `@font-face` rules at all, and **the build
> still succeeds**. The result is a correct site rendered entirely in fallback fonts.
> `grep -r @font-face .output/public` returning nothing is the symptom.

### What you can and cannot run from a clone

Four of this project's six quality gates run anywhere. Two do not, and that is by design
rather than by omission.

| Command             | Works from a clone? |                                                     |
| ------------------- | ------------------- | --------------------------------------------------- |
| `pnpm lint`         | Yes                 | ESLint, no warnings allowed                         |
| `pnpm format:check` | Yes                 | Prettier                                            |
| `pnpm typecheck`    | Yes                 | `nuxt typecheck`, strict                            |
| `pnpm build`        | Yes                 | Production build, including the internal link check |
| `pnpm test:e2e`     | **No**              | Needs `PLAYWRIGHT_BASE_URL`                         |
| `pnpm lighthouse`   | **No**              | Needs `LIGHTHOUSE_BASE_URL`                         |

The last two assert properties of a **deployment**: real HTTP responses, real headers, real
transferred bytes over a real network. There is deliberately no `webServer` block in
`playwright.config.ts`, because [ADR-002](docs/adr/002-static-site-generation.md) produces
no server output for `nuxt preview` to serve. In continuous integration they run against
the per-pull-request preview deployment. Locally you can point them at any deployed URL:

```bash
PLAYWRIGHT_BASE_URL=https://diogo-pereira.dev pnpm test:e2e
```

Running them against production tests production, not your branch. That is useful for
checking the suite itself and useless for checking your changes.

## Quality gates

No merge to `main` is possible until all of these pass against the pull request's own
preview deployment:

- ESLint with zero warnings, and Prettier formatting.
- `nuxt typecheck` in strict mode, zero errors.
- A production build, plus an internal link check with zero broken links.
- Playwright end-to-end tests across Chromium, Firefox and WebKit, plus a project that runs
  with JavaScript disabled to prove every route is complete in the initial HTML response.
- An axe scan of every route against the 70 rules carrying a WCAG 2.2 A or AA tag, zero
  violations. A [manual accessibility pass](docs/accessibility-review.md) covers the things
  no scanner can check.
- A privacy suite asserting no cookies, no browser storage, and no network request to any
  host not on a written allowlist.
- Lighthouse budgets under mobile emulation: accessibility 100, performance 95, best
  practices 95, SEO 95, and a 12,500-byte script transfer budget.

Production currently measures 99 / 100 / 100 / 100 with zero layout shift on every route.

## Stack

Nuxt 4 and Vue 3 with TypeScript in strict mode, prerendered to static HTML. Tailwind CSS
v4. Content is markdown parsed at build time and validated against a zod schema, so invalid
frontmatter fails the build rather than rendering blank — the first-party module was
rejected on exactly that requirement, after measuring it
([ADR-012](docs/adr/012-build-time-markdown-over-nuxt-content.md)).

Deployed to Cloudflare Workers as an assets-only Worker
([ADR-010](docs/adr/010-cloudflare-workers-static-assets.md)) by GitHub Actions on merge to
`main`. Prerendered routes ship no first-party JavaScript at all
([ADR-015](docs/adr/015-no-client-side-javascript.md)); the only script delivered is a
cookieless analytics beacon.

Every dependency is pinned exactly and the lockfile is committed. `pnpm install
--frozen-lockfile` in CI means the build cannot silently resolve a different version from
the one that was tested.

## Documentation

|                                                      |                                                                                   |
| ---------------------------------------------------- | --------------------------------------------------------------------------------- |
| [Discovery](docs/discovery.md)                       | Problem statement, reader personas, success metrics, non-functional requirements  |
| [Requirements](docs/requirements.md)                 | User stories with acceptance criteria, MoSCoW priorities                          |
| [Planning](docs/planning.md)                         | Definition of Ready and Done, estimates, milestones                               |
| [Architecture](docs/architecture.md)                 | C4 context and container diagrams, and which artefacts are deliberately absent    |
| [Decision records](docs/adr/)                        | Every significant technical decision, with what it gave up                        |
| [Runbook](docs/runbook.md)                           | Rollback, domain renewal, credential rotation — rollback rehearsed, not described |
| [Accessibility review](docs/accessibility-review.md) | The manual WCAG 2.2 AA pass, signed and dated                                     |
| [Retrospective](docs/retrospective.md)               | What worked, what did not, and what changes next time                             |
| [Status](docs/STATUS.md)                             | Current milestone, decision log, open questions, live risks                       |
| [Glossary](docs/GLOSSARY.md)                         | Every term used in this repository                                                |

## Known limitations

Stated here rather than discovered by a reader.

- **No Content-Security-Policy.** Three security response headers ship; the fourth is
  deferred with its reasoning and its reopening condition in
  [ADR-016](docs/adr/016-security-response-headers.md).
- **The 404 page is prerendered by a build hook**, because Nuxt ships `404.html` empty.
  The workaround carries an explicit expiry and a ticket to remove it when the first-party
  feature lands ([ADR-011](docs/adr/011-prerendering-the-404-page.md)).
- **`build/vite-font-display.ts` rewrites CSS that `@nuxt/fonts` generates**, so it is
  coupled to what that module emits. It throws when it finds nothing to rewrite, so the
  coupling fails the build loudly rather than silently reverting to a layout shift.
- **No unit tests, deliberately.** The test strategy and what it gives up are argued in
  [ADR-006](docs/adr/006-test-strategy.md).

## Licence

The **code** is MIT licensed. The **written content and imagery** — case studies,
professional narrative, biography and documentation prose — are not covered by that licence
and remain all rights reserved. See [LICENSE](LICENSE).
