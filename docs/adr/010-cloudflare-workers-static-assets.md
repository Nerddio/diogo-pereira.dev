# ADR-010 — Cloudflare Workers static assets as the host

|                |                                        |
| -------------- | -------------------------------------- |
| **Status**     | Proposed — awaiting tech lead approval |
| **Date**       | 17 September 2026                      |
| **Deciders**   | Diogo Pereira (tech lead)              |
| **Supersedes** | ADR-004                                |
| **Depends on** | ADR-002, ADR-009 (accepted)            |

## Context

ADR-004 chose Cloudflare Pages for v1.0.0 and recorded migration to Workers static
assets as a post-launch ticket. Two things have changed since it was accepted, and
together they remove the reason to wait.

**The Cloudflare interface now labels Pages as legacy.** Creating an application
offers Workers paths first, with Pages reachable only through a "Need to use the
legacy Pages workflow?" link. That is a stronger signal than the documentation
wording ADR-004 was written against.

**ADR-009 cancelled ADR-004's main practical argument.** Pages was chosen partly for
git-connected builds and zero-configuration branch previews. ADR-009 then chose
Direct Upload from GitHub Actions and disabled the git integration, discarding
exactly those advantages. What remained was inertia.

Migrating later would mean reopening a finished project, which the project's own
working agreements discourage.

## Decision

**Deploy to Cloudflare Workers as an assets-only Worker**, superseding ADR-004.

`nitro.preset` stays `static`. ADR-002 is unaffected: every route is still
prerendered at build time and there is still no server in production.

The Worker is configured by a `wrangler.jsonc` that declares an `assets.directory`
and **no `main` entry**. With no entry point there is no Worker script — Cloudflare
serves the prerendered files directly.

Deployment runs `wrangler` as a pinned dev dependency rather than through
`cloudflare/wrangler-action`. One fewer third-party action to SHA-pin and maintain,
and the version is governed by the lockfile and Dependabot like every other
dependency.

## Options considered

**Cloudflare Pages — superseded.** Still supported and still works. Rejected because
its remaining advantage over Workers was removed by ADR-009, and because building
now on something the vendor labels legacy means doing this migration anyway, later,
against a larger site.

**Workers with the `cloudflare_module` Nitro preset — rejected, and the more
interesting rejection.** This is the path most Nuxt-on-Workers documentation
describes. It is also broken for this project: Nuxt issue #34186 reports that a
static build deployed this way fails because wrangler looks for a server entry point
that a purely static site does not produce. The preset exists to deploy a Nitro
server bundle as a Worker script, which is precisely what ADR-002 decided not to
have. Choosing the assets-only configuration avoids the defect by never using the
integration that carries it.

**Staying on Pages until v1.0.0, migrating after — rejected.** The original ADR-004
plan. Rejected once the migration turned out to be a single configuration file
rather than a project of its own.

## Consequences

**Gained**

- Deployment target matches where the vendor is investing, so no migration is owed.
- One fewer third-party GitHub Action in the supply chain.
- `nitro.preset: static` and ADR-002 are untouched.

**Accepted costs**

- Preview deployments work differently. Pages gives a URL per branch; Workers gives
  a version preview URL from `wrangler versions upload`. Same outcome for #12,
  different mechanism, and it is the part of this change carrying the most
  uncertainty.
- The Nuxt ecosystem's documentation and tooling still assume Pages or the
  `cloudflare_module` preset, so the assets-only path has less written about it.
  Being able to explain why the documented path was wrong here is worth more than
  following it would have been.

**Security**

Unchanged in shape from ADR-009, with one substitution: the deploy token is scoped
to **Account → Workers Scripts → Edit** rather than Cloudflare Pages. Still not
account-wide, for the same reason — an account-wide token reaches DNS, and
redirecting the domain is the highest-impact realistic attack in the threat model.
Static assets are served by the Workers runtime rather than stored in R2, so no
storage permission is required; the scope was confirmed from the permission
descriptions rather than granted speculatively to clear an error.

**Verified before acceptance**

A manual upload of `.output/public` deployed successfully and served the prerendered
site. R-G is closed to the extent that the target works; the automated path is
verified by the pull request that adds it.

**Reversibility**

High. Reverting means creating a Pages project and changing the deploy command.
ADR-004 remains in the record as superseded rather than deleted.
