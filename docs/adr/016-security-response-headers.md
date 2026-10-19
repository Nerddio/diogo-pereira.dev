# ADR-016 — Security response headers, and the deferred Content-Security-Policy

|                |                                     |
| -------------- | ----------------------------------- |
| **Status**     | **Accepted** — 19 October 2026      |
| **Date**       | 19 October 2026                     |
| **Deciders**   | Diogo Pereira (tech lead)           |
| **Depends on** | ADR-002, ADR-010 (accepted)         |
| **Relates to** | NFR-06, NFR-05, ADR-007, US-53, D25 |

## Context

NFR-06 asks for four response headers served from a `_headers` file, and for a header
assertion in CI. None of the four was set. The requirement had been written at discovery
and never implemented, and nothing in the pipeline noticed, because nothing asserted it.

The site has no backend, no database, no authentication and no user input, so most of
what response headers defend against has no entry point here. That is a reason to choose
carefully, not a reason to set none: three of the four cost one line each and one of them
is about what third parties learn.

A correction belongs in the record, because the first version of this argument was wrong.
The case initially made for `Referrer-Policy` was that without it the analytics beacon
receives the full URL of the page. That is not true in current browsers: Chrome has
defaulted to `strict-origin-when-cross-origin` since version 85, and Firefox and Safari
have comparable defaults, so a cross-origin request already carries only the origin. The
header is still worth setting, for weaker and more honest reasons recorded below.

## Decision

Serve three headers from `public/_headers`, on every route:

| Header                   | Value                                      |
| ------------------------ | ------------------------------------------ |
| `X-Content-Type-Options` | `nosniff`                                  |
| `Referrer-Policy`        | `strict-origin-when-cross-origin`          |
| `Permissions-Policy`     | `camera=(), microphone=(), geolocation=()` |

Assert all three, by exact value, on every route and on the 404, in
`tests/e2e/headers.spec.ts`, gated on every pull request.

**Defer the Content-Security-Policy.** Record the deferral here rather than leaving NFR-06
reading as an unmet requirement.

## Options considered

**`X-Content-Type-Options: nosniff`.** No alternative was considered. It instructs the
browser to trust the declared content type rather than inferring one from the bytes,
which is the mechanism by which a response served as data gets executed as script. There
is no cost and no configuration.

**`Referrer-Policy`.** Three candidates:

| Value                             | A linked site receives      | Cost                       |
| --------------------------------- | --------------------------- | -------------------------- |
| `strict-origin-when-cross-origin` | `https://diogo-pereira.dev` | none                       |
| `same-origin`                     | nothing                     | loses referral attribution |
| `no-referrer`                     | nothing, ever               | loses referral attribution |

Chosen: the first. The two stricter values conceal a public domain name, which is not
information worth concealing, and they would stop LinkedIn and GitHub seeing that a
visitor arrived from this site. Reaching for the strictest available value without asking
what it hides is how security settings become decoration. The value chosen is the current
browser default, stated explicitly so that it is a decision rather than an inheritance,
and so that it holds on a browser whose default is older.

**`Permissions-Policy`.** `()` is an empty allowlist: no origin may use the feature, this
site included. Three entries, for the three capabilities this site will never use. A
longer list was rejected. Lists of a dozen directives circulate widely and one of the
commonly copied entries, `interest-cohort`, targets a Google feature that no longer
exists — a control that defends against nothing while implying diligence.

**`Content-Security-Policy`, deferred.** A policy here would have to permit the two
Cloudflare analytics hosts and the inline JSON-LD on Home and About. It fails quietly:
when it is wrong, the browser blocks a request and the page carries on looking correct,
so the first symptom is analytics that stopped reporting. Against that, the attack it
mitigates — cross-site scripting, where attacker-supplied content executes as script in a
visitor's browser — has no entry point on a site with no input handler, no backend and,
since ADR-015, no client-side JavaScript of its own.

Writing it anyway was the other option, and it is defensible as defence in depth: a
control layered in before it is needed, so a later change does not quietly remove the only
protection. It was not chosen because the later change that would need it is identifiable
and tracked, not hypothetical.

## Consequences

**Accepted.** Three headers are served and verified on every pull request, and NFR-06 is
partially rather than fully met, stated plainly rather than quietly reclassified.

**Accepted.** `Referrer-Policy` matches what browsers already do, so for most visitors it
changes nothing today. Its value is that the behaviour is now specified by this site
rather than by a default that could change.

**Accepted, with a named trigger.** There is no Content-Security-Policy. The condition
that reopens this is any inline or first-party script shipping to the browser — and one is
already planned: D25 records that V1.1 dark mode will ship a visitor toggle persisting a
choice in `localStorage`. That ticket must write the policy, not inherit this deferral.

**Accepted.** The `_headers` mechanism is documented by Cloudflare for Workers static
assets, and documented as not applying to responses generated by Worker code. This site is
an assets-only Worker with no `main` entry (ADR-010), and Cloudflare does not state in so
many words that the file is honoured in that configuration. The end-to-end assertion is
what settles it. If it had failed, the alternative would have been adding a Worker script,
which cuts against ADR-010, and that would have been a decision rather than a fix.

**Accepted.** The test asserts exact values, so changing a header deliberately means
changing the test in the same commit. That is the intent: a header changed without the
assertion changing is a header changed by accident.
