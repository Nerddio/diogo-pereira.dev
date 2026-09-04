# ADR-004 — Cloudflare Pages as the host

| | |
|---|---|
| **Status** | Proposed — **tech lead ruling required**, see "The finding" below |
| **Date** | 3 September 2026 |
| **Deciders** | Diogo Pereira (tech lead) |
| **Depends on** | ADR-002 (accepted) |

## Context

ADR-002 fixed the build output as static files. The host must serve them over HTTPS on a
custom apex domain, deploy automatically on merge (US-07), provide a preview URL per branch
so Playwright and Lighthouse can run against a real deployment (US-04, US-05, US-08), and
cost nothing (NFR-13).

The `.dev` TLD is HSTS-preloaded, so HTTPS is not optional and the host must provision a
certificate automatically. The domain is already registered at Cloudflare Registrar, so its
DNS zone exists in the same account.

## The finding

The brief specified Cloudflare Pages. Verification on 3 September 2026 shows Cloudflare's
own guidance has moved: <cite index="34-3">for new projects in 2026, Cloudflare recommends Workers with static assets, because it unifies frontend and backend in one deployment, while Pages remains fully supported with no need to rush an existing project off it</cite>. <cite index="30-1">Workers reached feature parity with Pages for static assets, SSR and custom domains in March 2026</cite>, and <cite index="32-1">static asset requests are free on both platforms</cite>.

This does not make Pages wrong. It does mean choosing Pages is now a decision that has to be
argued rather than assumed, and an interviewer who follows Cloudflare may ask about it.

## Decision (recommended)

**Cloudflare Pages for v1.0.0**, with migration to Workers Static Assets recorded as a
post-launch ticket rather than left to be discovered later.

Reasoning: M1 — live, ugly, deployed — is the one non-negotiable milestone, and Pages is the
shortest verified path to it. Git-connected builds and per-branch preview URLs work with no
`wrangler` configuration, which is precisely the machinery US-04, US-05 and US-08 depend on.
The site is 100% static, so none of the capabilities Workers adds — bindings, server routes,
Durable Objects — has a consumer here. Cloudflare has committed to continued support, and
the migration path is documented and short.

The honest counter-argument, which is the reason this needs a ruling rather than an
assumption: Workers is where the roadmap is, flagship 2 will have a server and will want
Workers anyway, and "I deployed to the platform the vendor recommends" needs no defending.
The cost is unverified `wrangler` configuration on day 2 of a six-day schedule, against the
one milestone that cannot slip.

## Options considered

**Cloudflare Workers with Static Assets — the live alternative.** See above. Same network,
same free static serving, Cloudflare's recommended path, more configuration to verify.

**GitHub Pages — rejected.** Free and simple, but weaker custom-domain and header control,
and no per-branch preview deployments, which US-08 and the CI design depend on.

**Netlify or Vercel — rejected.** Both would work well. Rejected because the domain and DNS
already live at Cloudflare, and splitting registrar, DNS and host across vendors adds a
failure mode for no gain.

**Self-administered VPS — rejected.** Costs money, requires patching, TLS renewal, a web
server configuration and an actual uptime responsibility, to serve files a CDN serves free.
It would manufacture an operations story rather than earn one. The operations gap belongs to
flagship 2, which will have a server for real reasons.

## Consequences

**Gained**

- Deployment is a merge, not a ritual (US-07). This is the CI/CD gap closing.
- Preview URL per branch, which is what makes end-to-end tests and Lighthouse budgets run
  against a real artefact rather than a dev server.
- Registrar, DNS, host, TLS and analytics in one account with one failure domain.

**Accepted costs**

- Vendor concentration. Mitigated by ADR-002 and ADR-003: static output plus markdown means
  the site can move to any static host in an afternoon. Reversibility here is high, which is
  what makes accepting the platform risk reasonable.
- Build limits exist on the free plan. The specific quotas are **not verified** and are to be
  read from Cloudflare's own pricing page before M1, not from third-party summaries.

**Recorded for later**

Migration to Workers Static Assets becomes a V1.1 or V2 ticket, alongside the Nuxt 5 upgrade
from ADR-001. Both are known, dated and scheduled rather than discovered.
