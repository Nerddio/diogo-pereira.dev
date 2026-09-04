# diogo-pereira.dev

Personal site and portfolio index for Diogo Pereira, full-stack engineer,
based in the Netherlands.

**Status:** in development. Not yet deployed. Target v1.0.0: 9 September 2026.

## What this is

A static site built to be the front door for recruiters and hiring engineers,
and the index that future projects link back to. The site itself is
deliberately simple; its engineering interest is in the delivery pipeline and
the decision trail, not in architectural complexity.

## Stack

Nuxt 4, TypeScript in strict mode, Nuxt Content, Tailwind CSS v4. Prerendered
to static HTML and deployed to Cloudflare Pages. Playwright end-to-end tests
and Lighthouse budgets gate every merge.

Exact versions are pinned and recorded in [ADR-001](docs/adr/001-nuxt-4-as-the-framework.md).

## Documentation

| | |
|---|---|
| [Discovery](docs/discovery.md) | Problem statement, reader personas, success metrics, non-functional requirements |
| [Requirements](docs/requirements.md) | User stories with acceptance criteria, MoSCoW priorities |
| [Planning](docs/planning.md) | Definition of Ready and Done, estimates, milestones |
| [Decision records](docs/adr/) | Every significant technical decision, with what it gave up |
| [Status](docs/STATUS.md) | Current milestone, decision log, open questions, live risks |
| [Glossary](docs/GLOSSARY.md) | Every term used in this repository |

## Running locally

Setup instructions will be added when the application is scaffolded. Nothing
is runnable yet — this repository currently contains documentation only.

## Licence

The **code** is MIT licensed. The **written content and imagery** — case
studies, professional narrative, biography and documentation prose — are not
covered by that licence and remain all rights reserved. See [LICENSE](LICENSE).