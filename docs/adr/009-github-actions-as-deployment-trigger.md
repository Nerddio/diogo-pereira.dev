# ADR-009 — GitHub Actions as the deployment trigger

| | |
|---|---|
| **Status** | **Accepted** — 5 September 2026 |
| **Date** | 5 September 2026 |
| **Deciders** | Diogo Pereira (tech lead) |
| **Depends on** | ADR-002, ADR-004 (accepted) |
| **Unblocks** | #8, #9, #11, #12 |

## Context

ADR-004 fixed Cloudflare Pages as the host. Pages accepts a deployment by two
routes, and the choice determines where the build runs, whether a secret exists in
this project at all, and how the end-to-end and Lighthouse jobs find a URL to test
against.

Four stories depend on the answer: #8 (Playwright against a preview), #9
(Lighthouse budgets), #11 (automatic production deploy) and #12 (preview per
branch).

**A correction to how this was framed earlier.** The argument for driving deploys
from Actions was stated as "otherwise a red pipeline cannot block a deploy." That
is wrong for production, and worth recording rather than quietly dropping.
Production only ever deploys from `main`, and the `main protection` ruleset will
require status checks to pass before a merge is possible. Nothing red reaches
`main`, so nothing red reaches production, regardless of which route deploys it.
The gate is the merge, not the deploy. What actually separates the two options is
where the build runs and how a preview URL reaches the test jobs.

## Decision

**Build and deploy from GitHub Actions**, using the official
`cloudflare/wrangler-action` to perform a Direct Upload to the Pages project. The
Cloudflare Git integration is disabled.

## Options considered

**Cloudflare Git integration — rejected.** Cloudflare watches the repository and
builds it itself. <cite index="10-1">Once linked, every pull request automatically generates a unique, isolated preview URL</cite>, with no configuration
and — decisively for the threat model — **no API token anywhere in this project**.
Genuinely attractive.

Rejected on one point: the test jobs cannot easily reach the preview. Cloudflare's
build finishes independently of the Actions run, so Playwright and Lighthouse would
have to wait for a deployment they do not control and then discover its URL, by
polling the API or by reacting to a deployment webhook. That is real machinery to
build and debug on the one milestone that cannot slip. It also splits the build
across two environments, so a build that passes in Actions and fails at Cloudflare
is possible.

**GitHub Actions with `wrangler-action` — chosen.** One pipeline. Lint, type-check
and build run first; the deploy step runs only if they pass; the deploy step
returns the deployment URL as an output; Playwright and Lighthouse consume that
output directly. <cite index="6-1">Pushing a non-production branch deploys as a preview deployment</cite>, so per-branch previews survive the move. The
artefact that is tested is byte-for-byte the artefact that was built.

Note that <cite index="12-1">an existing Cloudflare Pages Git integration must be disabled before this is used</cite> — the two routes cannot both
be connected.

**Manual deploy — rejected.** Manual deployment is the gap this project exists to
close.

## Consequences

**Gained**

- One build, one artefact, one environment. What is tested is what deploys.
- The preview URL is a step output, not something to discover.
- Deploy sits inside the pipeline, so its history, timing and failures are visible
  in the same place as everything else. NFR-12's elapsed-time measurement comes free.

**Accepted costs**

- More configuration than the zero-config alternative, on M1.
- Build minutes now come from the GitHub Actions allowance rather than Cloudflare's.
- If Actions is unavailable, there is no second route to deploy. Acceptable: the
  Git integration can be re-enabled in minutes, and there is no availability
  commitment to breach.

**Security — this introduces the only real secret in the project**

A Cloudflare API token, scoped to **Account → Cloudflare Pages → Edit** and nothing
else, stored in GitHub Actions secrets and referenced as
`${{ secrets.CLOUDFLARE_API_TOKEN }}`.

What the scoping prevents: an account-wide token, which is the naive choice because
it is one click simpler, would let anyone who obtained it edit DNS for
`diogo-pereira.dev`. That is threat item 1 in the project's threat model — the
highest-impact realistic attack, redirecting a domain a recruiter is about to
visit. A Pages-scoped token can, at worst, deface the site. Same convenience,
enormously smaller blast radius.

Handling rules, which are not optional:

- The token is never written to a file in this repository, including
  `wrangler.toml`. It exists only in GitHub Actions secrets.
- The deploy job is granted the minimum `permissions:` block it needs, rather than
  inheriting write access.
- If it ever appears in a log, a commit or a screenshot, it is **rotated at
  Cloudflare, not deleted from the repository**. A committed secret remains in git
  history permanently; revoking it at the source is the only remedy that works.
- `wrangler-action` is pinned to a full commit SHA like every other action, so the
  code holding the token cannot change under us.

**Reversibility**

High. Reverting means deleting the workflow's deploy job, re-enabling the Git
integration in the Cloudflare dashboard, and revoking the token. Under an hour.
