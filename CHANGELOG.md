# Changelog

All notable changes to this project are documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/), and this
project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

Comparison links are added when v1.0.0 is tagged; until the first release there is nothing
to compare against.

## [Unreleased]

### Added

- Home, About and Contact pages, and a prerendered 404 page.
- Site shell: header with navigation marking the current page, footer with email, GitHub
  and LinkedIn, and a skip link as the first focusable element on every page.
- Live at https://diogo-pereira.dev over HTTPS. Apex canonical, `www` redirects to it with
  paths preserved, plain HTTP redirected.
- Static site generation with Nuxt 4 and Tailwind CSS v4, deployed to Cloudflare Workers as
  an assets-only Worker.
- Continuous integration gating every merge on ESLint, Prettier, `nuxt typecheck`, a
  production build and an internal link check.
- End-to-end smoke tests across Chromium, Firefox and WebKit, plus a project that runs with
  JavaScript disabled to verify content is present in the initial HTML response.
- A preview deployment per pull request, with the end-to-end suite running against it.
- Automated production deployment on merge to `main`.
- Dependabot for npm and GitHub Actions, including security updates.
- Project documentation: discovery, requirements, planning, a glossary, a status record,
  and architecture decision records 001-006 and 009-011.

- A projects index and a project detail page, driven by markdown files with typed
  frontmatter. An entry whose frontmatter does not match its schema fails the build rather
  than rendering an incomplete card.
- The site's own case study as the first and only entry, with the single-entry state stated
  on the page rather than disguised with placeholder cards. It covers the stack decision and
  what was rejected, the pipeline and its gates, the budgets, why there is no database, API or
  container, and the five controls that were found to be passing without working.

- A current-focus section on the home page linking to the projects index and the GitHub
  profile, and Projects added to the main navigation.

- Architecture decision record 012: markdown is rendered and validated at build time rather
  than through Nuxt Content, so an entry with invalid frontmatter fails the build instead of
  rendering an empty card.

- Architecture decision record 013: Lighthouse runs from a script in this repository rather
  than through Lighthouse CI, so the merge gate measures with the current Lighthouse rather
  than a version two majors behind.

- A canonical URL, Open Graph tags and a Twitter card on every route, with a site-wide
  social card image drawn from the site's own type and colour tokens. Every page sets them
  through one composable, so a page cannot ship without them by being forgotten.

- Lighthouse budgets as a merge gate, measured against the pull request's own preview
  deployment on mobile emulation: accessibility 100, best practices and SEO at least 95, a
  transfer budget on JavaScript, and a check that no page asks search engines not to index it.
  Every route is checked, and the median of three runs is taken so a single noisy run cannot
  block a merge.

### Changed

- Host moved from Cloudflare Pages to Cloudflare Workers static assets. ADR-010 supersedes
  ADR-004.
- Release dates dropped in favour of milestones as sequencing containers.

### Fixed

- Text no longer reflows when the web fonts load. The site shipped a single weight in six
  writing systems, so every heading rendered at the wrong weight and bold text inside
  markdown was synthesised, and the metric-matched fallbacks that should have hidden the
  swap resolved against fonts only Windows and macOS have. It now ships the four faces it
  uses, in the Latin subset, preloaded, and does not swap them in after the page is drawn.
  See ADR-014.

- The 404 page shipped as an empty shell. Nuxt forces `404.html` to render without
  server-side rendering, so the error page only appeared after client-side JavaScript ran.
  It is now prerendered and readable with JavaScript disabled. See ADR-011.
- HTTPS was not actually enforced at the edge despite the domain being HSTS-preloaded.
- The document language attribute was missing, so assistive technology had no way to know
  which language to pronounce the page in.
- An invalid continuous integration workflow file, and a link checker that reported success
  while validating no links at all.

- Architecture decision records now state their own status accurately. Seven of nine read
  "awaiting tech lead approval" for decisions accepted weeks earlier, and ADR-004 did not
  record that it had been superseded.

### Security

- `devalue` updated to 5.9.4, addressing six advisories including an information-disclosure
  bug in typed-array serialization.
- `serialize-javascript` updated to 7.1.2, addressing a cross-site scripting regression in
  its script-tag escaping.
- Install-time build scripts denied for every package, so no dependency runs code during
  installation on a runner that holds the deployment token.
- `actions/upload-artifact` pinned to a commit SHA rather than a mutable tag, so a change
  to that tag cannot alter what runs in continuous integration.
- `esbuild` forced to 0.28.1 or later. Earlier versions let any page open in the same
  browser read files from the machine through the development server.
