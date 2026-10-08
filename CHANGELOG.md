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

- A photograph on the About page, so the page reads as a person rather than a CV.

- A `sitemap.xml` generated from the routes actually prerendered, a `robots.txt` that
  names it, and a JSON-LD `Person` block on Home and About. The sitemap cannot list a page
  that does not exist or omit one that does, and the build fails rather than shipping an
  empty one. The structured data carries no email address and no street address.

- A canonical URL, Open Graph tags and a Twitter card on every route, with a site-wide
  social card image drawn from the site's own type and colour tokens. Every page sets them
  through one composable, so a page cannot ship without them by being forgotten.

- Lighthouse budgets as a merge gate, measured against the pull request's own preview
  deployment on mobile emulation: accessibility 100, best practices and SEO at least 95, a
  transfer budget on JavaScript, and a check that no page asks search engines not to index it.
  Every route is checked, and the median of three runs is taken so a single noisy run cannot
  block a merge.

- A privacy test asserting, on every route and in all three browser engines, that the site
  sets no cookie, writes nothing to browser storage, and contacts no third party. It
  records attempted writes as well as what is left behind, so a value written and then
  removed is still caught. Third parties are governed by an allowlist with a reason per
  entry rather than a blanket prohibition, which would have to be deleted the first time
  one is added.

- Architecture decision record 007: cookieless analytics, shipped to previews as well as
  production so both merge gates measure what actually ships, and the reasoning for
  publishing no consent banner — that nothing is stored on or read from the visitor's
  device, asserted by the privacy test rather than taken from the vendor's documentation,
  rather than a claim that data protection law does not apply.

- Architecture decision record 008: contact information exposure. Email, LinkedIn and GitHub
  are published; a phone number, a postal address and a downloadable CV file are not, in the
  pages, the structured data, the working tree or git history. A print stylesheet on the
  About page gives a visitor a document to keep without one ever being committed, carrying
  metadata, or going stale. The published email moves to an address on the site's own domain,
  forwarded at no cost, because the personal account it replaces is also a login and could
  never have been retired if it were drowned. Records that the address is deliberately
  unobfuscated, because every available concealment costs a reader or an assistive
  technology more than it costs a scraper.

- The published contact address is now on this site's own domain, and every contact link --
  the email, LinkedIn and GitHub, in the Contact page, the footer and the home page -- is
  defined once in `app/utils/site.ts` rather than written into four templates. The readable
  labels on the Contact page are derived from those URLs, so a label cannot disagree with
  where its link goes.
  It replaces a personal account that was also a login, and which therefore could never have
  been retired if the published address were ever drowned -- the property ADR-008's case for
  publishing it unobfuscated depends on.

- Cookieless analytics, shipped to preview deployments as well as production so that both
  merge gates measure the configuration that actually reaches a visitor. The beacon sets no
  cookie and writes nothing to browser storage, which the privacy suite asserts on every
  route and every pull request rather than taking from the vendor's documentation. No
  consent banner: nothing is stored on or read from the device, which is what the
  requirement turns on. See ADR-007.

### Changed

- The JavaScript transfer budget is 12,500 bytes per route, down from 105,000. The old figure
  was derived from a baseline of 88,066 bytes that ADR-015 removed; against a site shipping
  10,311 it could not fail, so the framework runtime could have returned in full and the gate
  would have passed. The new figure is NFR-02's rule -- the measured baseline plus 20% --
  applied to what the site now actually weighs.

- Prerendered routes no longer ship framework JavaScript. Every route is rendered to complete
  HTML at build time and nothing on the site is interactive, so the hydration payload --
  91,104 bytes on the home page, 87% of the JavaScript budget -- existed to attach behaviour
  that does not exist. Transferred script fell to zero on every route and Lighthouse
  performance rose from 98 to 100, giving a perfect score in all four categories. Navigation
  is now a full page load rather than a client-side route change. See ADR-015.

- Host moved from Cloudflare Pages to Cloudflare Workers static assets. ADR-010 supersedes
  ADR-004.
- Release dates dropped in favour of milestones as sequencing containers.

### Fixed

- End-to-end tests that wait for network idle no longer time out under full parallel load.
  Reaching network idle on the heaviest route was measured at 24 seconds against Playwright's
  30-second default and failed once at 31.3. The budget is raised where the wait happens
  rather than the retry count in CI, which would have let an intermittent failure pass on a
  second attempt and hidden the instability instead of removing it.

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
