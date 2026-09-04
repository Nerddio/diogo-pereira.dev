# ADR-001 — Nuxt 4 as the framework

| | |
|---|---|
| **Status** | Proposed — awaiting tech lead approval |
| **Date** | 3 September 2026 |
| **Deciders** | Diogo Pereira (tech lead) |
| **Supersedes / superseded by** | — |

> An **Architecture Decision Record** captures one significant technical decision: the
> context that forced it, the decision taken, and the consequences accepted. It is
> written when the decision is made, not reconstructed afterwards, and it is never
> edited to look better later — it is superseded by a new record instead.

## Context

The site is five route types of static content with no data model, no API and no
authenticated user. It must be live on 9 September 2026, run at €0/month, and score
Lighthouse accessibility 100 and performance ≥ 95 on mobile emulation.

The framework choice constrains the build output, the deployment target, the test
strategy and every subsequent ADR, so it is taken first.

Two forces pull in opposite directions. The **artefact** wants the lightest possible
static output. The **curriculum** — the actual primary goal of this project — names Vue 3
Composition API and TypeScript as gaps to close. Those forces do not select the same tool.

Nuxt 3 reached end of life on 31 July 2026 and receives no further security patches, so
within the Nuxt ecosystem v4 is the only defensible major.

## Decision

Use **Nuxt 4**, pinned to exact versions, with TypeScript in strict mode.

Versions verified against the npm registry on 3 September 2026. Exact pins, no ranges;
the lockfile is committed and CI installs with `--frozen-lockfile`.

| Package | Pin | Published |
|---|---|---|
| `nuxt` | 4.5.2 | 2026-08-05 |
| `@nuxt/content` | 3.16.0 | 2026-08-27 |
| `tailwindcss` / `@tailwindcss/vite` | 4.3.3 | 2026-07-16 |
| `typescript` | 6.0.3 — **not** the npm `latest` tag, see risk R2 | 2026-04-16 |
| `vue-tsc` | 3.3.11 | 2026-08-21 |
| `@playwright/test` | 1.62.1 | 2026-07-30 |
| `eslint` | 10.9.1 | 2026-08-24 |
| `prettier` | 3.9.6 | 2026-07-21 |
| Node | 24.x (Active LTS) — exact patch pinned in `.nvmrc` at scaffold and mirrored in CI | — |
| pnpm | 11.25.0 | 2026-08-29 |

Nuxt 4.5.2 declares `engines.node: ^22.19.0 || ^24.11.0 || >=26.0.0`. Node 24 is the
current Active LTS line; Node 22 is in maintenance and Node 26 is not yet LTS. Node 24 is
therefore the only choice that is both supported by the framework and appropriate for a
production deployment.

## Options considered

**Astro — rejected.** The better technical fit. Ships zero JavaScript by default, which is
exactly what a content site of this shape wants, and would produce a measurably lighter
artefact. Rejected because the named skill gap is Vue 3 Composition API, and building this
site in Astro would teach Astro. This is a deliberate trade of a slightly worse artefact
for a better-trained engineer, and it is stated openly rather than dressed up as a
technical win.

**Next.js / React — rejected.** Would broaden reach into a larger share of the Randstad
market. Rejected because changing ecosystem in the front-door project costs more than it
earns on a six-day deadline, and half-learned React is worse in an interview than
competent Vue. React remains a deliberate later target, in a project chosen for it.

**Vite + Vue 3 SPA — rejected.** No file-based routing, no prerendering, worse SEO because
content arrives only after hydration. Would require hand-building routing, metadata and
static output — that is, reimplementing part of Nuxt with none of the maintenance.

**Hand-authored HTML and CSS — rejected.** Genuinely the fastest route to a live site and
the smallest possible payload, and it deserves to be recorded as a serious option rather
than dismissed. Rejected because it closes none of the named gaps and demonstrates nothing
about component architecture, typed data or a modern build. The site would be finished and
the project would have failed.

## Consequences

**Accepted costs**

- The site ships a Vue runtime and a hydration payload that Astro would not. Bounded by
  NFR-02: a first-load JavaScript budget set from the measured M1 baseline plus 20% and
  enforced by Lighthouse CI. The budget is the mitigation; without it this cost is
  unbounded.
- Nuxt Content adds a build-time dependency for what is currently a handful of markdown
  files. Bought deliberately: typed collection schemas fail the build on invalid
  frontmatter instead of rendering an empty page, and the projects index has to scale to
  flagship 2.
- Framework knowledge is transferable to any Vue role and to roughly nothing else.

**Risks**

- **R1 — Nuxt 5 is imminent.** The Nuxt team stated that with 4.5 their focus turns to
  stabilising v5, which brings Nitro v3. Each major is supported for a minimum of six
  months after its successor ships, so Nuxt 4 will need upgrading within roughly a year of
  Nuxt 5's release. Accepted, and worth more than it costs: a documented, changelogged
  framework major upgrade on a site with a full test and budget pipeline is a portfolio
  asset, not a liability. It becomes a V2 ticket the day Nuxt 5 is stable, not a surprise.
- **R2 — TypeScript 7 is the `latest` tag but is not what Nuxt builds against.** The npm
  `latest` tag resolves to TypeScript 7.0.2, while Nuxt 4.5.2 itself develops against
  6.0.3, and `vue-tsc` 3.3.11 declares only `>=5.0.0`. Installing `latest` would put the
  type-check gate on a compiler the framework is not yet tested against. Decision: pin
  6.0.3. A spike to move to 7.x is a post-v1.0.0 ticket, gated on evidence rather than on
  the tag being newer. Unverified either way today, and recorded as unverified.
- **R3 — Cloudflare Pages and the Nuxt static preset.** Unverified until M1. M1 exists to
  falsify it early; if the preset fights, fall back to a plain prerender and static upload
  rather than slipping the live date.

**Reversibility**

High for content, low for components. Markdown and frontmatter port to any framework in an
afternoon; Vue single-file components do not. This is the decision in this project that is
most expensive to unwind, which is why it is ADR-001.

**Follow-on decisions unlocked**

ADR-002 (static generation), ADR-003 (markdown over a CMS), ADR-005 (Tailwind), ADR-006
(test strategy) all now have a fixed framework to argue within.
