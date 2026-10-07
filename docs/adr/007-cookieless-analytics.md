# ADR-007 — Cookieless analytics, and the resulting consent-banner position

|                |                                      |
| -------------- | ------------------------------------ |
| **Status**     | **Accepted** — 7 October 2026        |
| **Date**       | 6 October 2026                       |
| **Deciders**   | Diogo Pereira (tech lead)            |
| **Depends on** | ADR-002, ADR-010 (accepted)          |
| **Relates to** | NFR-05, US-28 (merged), US-29, US-47 |

## Context

The site has been live since M1 and the job search that motivates it is active. Nothing
measures whether anyone reads it. The success metrics in `docs/discovery.md` are delivery
facts — live on the domain, gates passing, five page types working — all of which are now
true and none of which answer the only question that matters after launch: does a recruiter
who opens this reach the projects index, or stop at the home page.

NFR-05 anticipated this. It is a Must, and it reads: "No cookies set on any route. No
personal data collected or stored. All fonts and assets self-hosted; **no request leaves the
site's own origin except the analytics beacon**." The beacon was in the requirements at M0.
No user story ever delivered it, and the omission was silent: US-28 asserts that no request
goes to any origin other than the site's own and the analytics endpoint, which a site making
no third-party requests at all satisfies trivially. Every gate would have stayed green
through a release that quietly dropped a Must.

Two questions are tangled together here and are worth separating, because the second is more
often asserted than reasoned.

**Should this site measure anything at all?** A site that measures nothing has the strongest
privacy claim available and the shortest privacy note. That is a real option, not a straw
one.

**If it does, is a consent banner required?** The usual answer — "it's cookieless, so no" —
is a conclusion with the reasoning removed. The reasoning is what makes it defensible, and
what makes it possible to tell when it stops being true.

There is also a threat-model consequence. This site has no backend, no input handler and no
stored data, and its only supply-chain exposure is at build time: a compromised npm package
runs during the build. A third-party script is a different category — a runtime supply chain
— and this would be the first one.

## Decision

**Ship Cloudflare Web Analytics, on every deployment including previews, and publish no
consent banner.**

### Why this tool

Free, which the €0/month constraint requires. Served by the CDN already in front of the
site, so it adds no vendor relationship, no account, no API token and no secret. Stores
nothing on the visitor's device, which is what the consent position below rests on.

### Why previews too, not production only

Both merge gates run against the per-pull-request preview. A beacon present only in
production would mean the privacy test never observes it — so the allowlist entry would pass
because the beacon is absent rather than because it is permitted — and the Lighthouse
transfer budget would never weigh its bytes. Both controls would be measuring a
configuration that does not ship. That is this project's recurring failure and there is no
reason to build it in deliberately.

The cost is that continuous integration traffic enters the raw data: the end-to-end suite is
120 tests, and Lighthouse adds three runs per route per pull request. `Host` is a documented
dimension in Web Analytics, and previews are served from `*.workers.dev` while production is
the apex, so the dashboard separates the two. Read the apex.

### The consent position, with its reasoning

**No banner is warranted, on the grounds that nothing is stored on or read from the
visitor's device.** Not on the grounds that data protection law does not apply.

The consent requirement people mean when they say "cookie banner" comes from the ePrivacy
Directive, whose Article 5(3) is triggered by _storing information on, or gaining access to
information already stored in, a subscriber's terminal equipment_ — the device, not the
server. Cookies are the common case, not the rule itself; `localStorage` and a fingerprint
read from the device engage it equally, and a cookie-free tool that writes an identifier to
`localStorage` would need consent exactly as a cookie would.

Cloudflare's documentation states that the beacon "does not store any data in the browser or
access any storage data, such as cookies, localStorage, sessionStorage, IP address, or
IndexedDB". That is a vendor claim, and this project does not accept vendor claims as
verification. US-28 was written and merged **before** this decision for that reason: it
asserts on every route, in three browser engines, on every pull request, that no cookie is
set and that nothing is written to `localStorage`, `sessionStorage` or IndexedDB. If
Cloudflare ever changes what that script does, the build fails before a visitor is affected.

The GDPR is a separate instrument and is not disposed of by the above. It governs the
processing of personal data, and a request to Cloudflare carries an IP address at the
network layer — as does every request to every server, including the ones serving this
site's HTML. Whether the resulting processing requires a lawful basis, and whether
legitimate interest is the right one, is a question of law that this record does not claim
to settle and its author is not placed to settle. What this record states is the factual
basis a lawyer would need: what is executed, what is stored on the device (nothing, asserted
by test), what leaves the browser, and to whom.

**What would reopen this.** Any change that causes an identifier to be written to or read
from the device. That includes replacing this tool, and it includes the `localStorage` theme
toggle planned for V1.1 dark mode under D25 — which is first-party functional storage the
visitor chose rather than an identifier assigned to them, a materially different thing, but
a thing that touches the same Article and so deserves the same explicit treatment rather
than being waved through. In every such case US-28 fails first, which is the mechanism by
which this decision cannot quietly stop being true.

## Options considered

**No analytics at all — rejected, and it was close.** It gives the strongest privacy claim
available, the shortest privacy note, zero third-party scripts, and leaves the threat model
untouched. Rejected because the project's stated purpose is an active job search and
"I don't know whether anyone reads it" is a worse position than a coarse number. The
decision is reversible in one commit if the data turns out to be worthless, and it should be
revisited rather than kept out of inertia if it is.

**Plausible, Fathom or Simple Analytics — rejected on budget.** All three are more capable
than Cloudflare's offering and are privacy-first by design. All three are paid. The €0/month
constraint for this site is firm, and the €10/month portfolio budget is reserved for
flagship 2, which has a server and will need it.

**Self-hosting Umami or GoatCounter — rejected on architecture.** Both need a server and a
database. ADR-002 and ADR-003 removed both deliberately, and the case study argues that
removing them was correct. Reintroducing a database to count page views would contradict the
site's own published reasoning for the sake of a readership counter.

**Analysing server logs — rejected, with one half unverified.** There is no origin server to
produce logs; a static site behind a CDN has only the CDN's. Whether Cloudflare's log export
is available on the free tier was not verified, so this is recorded as not pursued rather
than as impossible.

## Consequences

**Gained**

- A measured answer to whether the site is read, and which pages, instead of a guess.
- No cookie, no banner, no consent machinery, and a privacy note that is short because the
  truth is short.
- No new vendor, account, API token or secret. The one real secret in this project remains
  the deploy credential.
- €0/month, unchanged.

**Accepted costs**

- **The first runtime third party.** Cloudflare will execute JavaScript in the browser of
  every reader, on every visit. The counter-argument is that Cloudflare already serves every
  byte of this site and could alter it at will, so no new party gains capability. That is a
  reason, and it is a good one, but it is not the same as there being nothing to accept: the
  build-time supply chain was previously the whole of the exposure and no longer is.
- **Script budget.** The project routes measure 89,208 bytes against a 105,000-byte budget,
  leaving roughly 15.8 kB. The beacon's size could not be measured in advance from any
  available network. If it breaches, raising the budget is a decision with a stated reason,
  not an edit to the gate.
- **Coarse data.** Page views, paths, countries, referrers, device and browser. No funnels,
  no attribution, no session reconstruction. That is adequate for the question being asked
  and is a consequence of the privacy position rather than a limitation to work around.
- **Continuous integration traffic is in the raw data** and must be filtered by `Host`. A
  reading taken without that filter is wrong in a way that looks plausible.
- **The privacy note now depends on this.** US-29 cannot be written accurately until this is
  shipped and verified, which is why it is sequenced last.

**Security**

Subresource Integrity was considered and rejected. A hash pinned in the script tag would
stop a modified file executing, but Cloudflare updates the beacon without notice, so the
pin would break analytics silently on the day they ship a legitimate change — trading a
threat that has not occurred for a failure mode that certainly will, and which nothing would
report.

A Content-Security-Policy is the control that would genuinely bound this, by restricting
which origins may serve scripts at all. NFR-06 already asks for one, as a Should, delivered
through a `_headers` file, and it is not implemented. This decision raises its value: with a
third-party script on the page, a CSP is the difference between one trusted external origin
and any external origin. It belongs in its own ticket rather than being smuggled in here.

No secret is introduced. The site token in the snippet identifies which site is reporting
and is public by construction — it ships in the HTML of every page. It is not a credential
and must not be treated as one, which is worth stating because a long opaque string in a
script tag looks exactly like something that should have been in an environment variable.

**Verified before acceptance**

- Cloudflare's storage claim read on 6 October 2026 and quoted above, and — more to the
  point — asserted independently by US-28 on every route and every build, so acceptance does
  not rest on the vendor's word.
- `Host` confirmed as a Web Analytics dimension, which is what makes shipping the beacon to
  previews compatible with usable data.
- **Not verified:** the beacon's transferred size, which no available network would return.
  The Lighthouse gate measures it when US-47 lands and the budget decides.
- **Not verified:** whether Playwright is classified under the "Exclude Bots" dimension. If
  it is, preview traffic filters itself out and the `Host` filter is redundant. Do not rely
  on it.

**Reversibility**

High. Removing this means deleting a script tag and an allowlist entry. No data migration,
no contract, no account to close, nothing that outlives the commit.
