---
title: diogo-pereira.dev
summary: This site. A deliberately simple static site with a deliberately thorough delivery process,
  built to be read by a hiring engineer rather than admired by a visitor.
stack:
  - Nuxt 4
  - TypeScript
  - Tailwind CSS v4
  - Playwright
  - GitHub Actions
  - Cloudflare Workers
repository: https://github.com/Nerddio/diogo-pereira.dev
liveUrl: https://diogo-pereira.dev
published: 2026-09-17
---

## What it is

A five-page static site. Every route is generated at build time; there is no server, no
database and no user input. That is the correct architecture for a personal site, and being
able to say why is worth more than bolting on infrastructure that would look impressive and
do nothing.

The site is not the artefact. The process behind it is: a dated architecture decision record
for every significant choice, user stories with testable acceptance criteria written before
any code, and a pipeline that refuses a merge until lint, type-checking, a production build,
end-to-end tests across three browser engines and a link check have all passed.

## How it is built

Nuxt 4 prerenders every route to HTML. The output is deployed to Cloudflare Workers as an
assets-only Worker, from GitHub Actions, on merge to `main`. Each pull request gets its own
preview deployment, and the end-to-end suite runs against that preview rather than against a
local server, so the tests exercise something that was really deployed.

Markdown is parsed, validated and rendered during the build. A file whose frontmatter does
not match its schema stops the build rather than rendering an empty card.

## What is written down

Every decision has a record, including the ones that were reversed. Cloudflare Pages was
chosen and then superseded. Nuxt Content was chosen, measured and rejected. The 404 page
turned out to ship empty and the fix has its own record.

The full case study follows, covering the stack decision and what was rejected, the pipeline
and its gates, the accessibility and performance budgets, and why there is no database, no
API and no container.
