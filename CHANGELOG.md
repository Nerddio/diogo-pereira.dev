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

### Changed

- Host moved from Cloudflare Pages to Cloudflare Workers static assets. ADR-010 supersedes
  ADR-004.
- Release dates dropped in favour of milestones as sequencing containers.

### Fixed

- The 404 page shipped as an empty shell. Nuxt forces `404.html` to render without
  server-side rendering, so the error page only appeared after client-side JavaScript ran.
  It is now prerendered and readable with JavaScript disabled. See ADR-011.
- HTTPS was not actually enforced at the edge despite the domain being HSTS-preloaded.
- The document language attribute was missing, so assistive technology had no way to know
  which language to pronounce the page in.
- An invalid continuous integration workflow file, and a link checker that reported success
  while validating no links at all.

### Security

- `devalue` updated to 5.9.4, addressing six advisories including an information-disclosure
  bug in typed-array serialization.
- `serialize-javascript` updated to 7.1.2, addressing a cross-site scripting regression in
  its script-tag escaping.
- Install-time build scripts denied for every package, so no dependency runs code during
  installation on a runner that holds the deployment token.
- `actions/upload-artifact` pinned to a commit SHA rather than a mutable tag, so a change
  to that tag cannot alter what runs in continuous integration.
