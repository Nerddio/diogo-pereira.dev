# ADR-003 — Markdown in the repository over a headless CMS

| | |
|---|---|
| **Status** | Proposed — awaiting tech lead approval |
| **Date** | 3 September 2026 |
| **Deciders** | Diogo Pereira (tech lead) |
| **Depends on** | ADR-001, ADR-002 (accepted) |

## Context

The site has two kinds of content: page copy that changes rarely, and project entries that
must render consistently on both the index and a detail page. There is exactly one author,
who is also the developer. The projects collection must grow to include flagship 2 without
the index needing to be rewritten.

The failure mode to design against is a project entry missing a field and rendering a card
with a blank space in it — the kind of defect nobody notices until a hiring engineer does.

## Decision

Store all content as **markdown files in the repository**, managed by **Nuxt Content
v3.16.0** with **typed collection schemas**. Frontmatter is validated at build time; an
entry that does not satisfy its schema fails the build rather than rendering.

## Options considered

**Headless CMS (Sanity, Contentful, Strapi) — rejected.** Introduces an external service, an
account, a probable monthly cost once past a free tier, a second source of truth, and build
webhooks to keep the two in sync. All of that to give a non-technical editor a friendly
interface, for a site whose only editor writes TypeScript. It also breaks the property that
makes this project work as a portfolio piece: that the repository contains the whole system.

**Git-based CMS UI (Decap or similar) — rejected.** Edits the same markdown files through a
web form, so the source of truth stays correct. Rejected because it adds an authentication
configuration and a deployment surface to solve a problem — editing without a text editor —
that the sole author does not have.

**Content hardcoded in Vue components — rejected.** Zero dependencies and the fastest route
to M2. Rejected because a typo becomes a code change with no schema behind it, and the
projects index would have no data model to iterate over, so adding flagship 2 would mean
editing a component rather than adding a file.

## Consequences

**Gained**

- Invalid or missing frontmatter breaks the build (US-18). This single property is the
  entire justification for taking the dependency; without it, plain markdown parsing would
  do.
- Content changes flow through the same pipeline as code: a branch, a pull request, a
  review, a changelog entry. A typo fix gets the same treatment as a feature.
- Content is portable. Markdown and frontmatter move to any framework in an afternoon,
  which is what keeps ADR-001's low component-level reversibility tolerable.

**Accepted costs**

- No editing without a checkout and a commit. Correct for an audience of one; wrong the
  moment a marketing colleague exists.
- A build-time dependency for a handful of files today.

**Risk — unverified**

Nuxt Content v3 uses a SQL-backed content store, and depending on how the collection is
queried it can ship a client-side database bundle to support navigation without a round
trip. Whether that happens for a fully prerendered site of this size is **not verified
today**. It is measured at M1 against the NFR-02 first-load JavaScript budget. If it
breaches the budget, the mitigation is to query only at build time and pass plain
serialisable data to components; if that fails, this ADR is superseded rather than quietly
worked around.
