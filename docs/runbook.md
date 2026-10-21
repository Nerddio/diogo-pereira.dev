# Runbook

What to do when something needs doing to the live site. US-35.

**Operations here are minimal, and that is a design consequence rather than an omission.**
There is no server, no database, no queue and no background job, so there is nothing to
restart, drain or scale. NFR-11 claims no independent availability target: the site
inherits Cloudflare's. Three things can actually go wrong and are worth a written
procedure — a bad deployment, a lapsed domain, and an exposed deploy credential.

---

## 1. Rollback

### When

Production is serving something wrong and you want it to stop before you understand why.
Fixing forward is better when you already know the fix and it is small; rolling back is
better when you do not.

### Step 1 — stop the bleeding

Cloudflare dashboard → **Workers & Pages** → **diogo-pereira-dev** → **Deployments** → the
**⋯** menu beside the last known good version → **Rollback**.

This creates a new deployment from that version, live on every route immediately. You can
roll back to any of the **100 most recent versions**.

No credential is needed beyond your Cloudflare login, which is the point — see "Why not
wrangler" below.

### Step 2 — make git true again

**Do not stop at step 1.** A dashboard rollback leaves `main` ahead of production: git
claims one thing and production serves another. The next merge to `main` redeploys from
`main` and silently resurrects whatever you just rolled back from.

So, through the normal flow:

```bash
git checkout main
git pull
git checkout -b fix/revert-<what>
git revert <the offending commit>
git push -u origin fix/revert-<what>
```

Open a pull request, let the gates run, merge. The deploy job runs on merge to `main` and
production is back in agreement with the repository.

**Note what the revert's safety actually rests on.** The `deploy` job depends on lint,
format, typecheck and build-and-links only. The end-to-end suites and the Lighthouse
budgets run on pull requests, against a preview deployment — they do not run again at
deploy time. A revert is therefore verified by its pull request, not by its deployment,
which is a reason to open one rather than to push to `main` even if you could.

### Why not `wrangler rollback`

It exists and it works. It is not the documented path here because it needs a Cloudflare
API token on the machine running it, and the threat model names that token as the one real
secret in this project. It lives in GitHub Actions secrets, scoped to the minimum that
works. A second copy on a laptop doubles the places it can leak from, and a rollback is
exactly the moment you are least careful. The dashboard costs nothing extra and is already
behind multi-factor authentication.

### What rollback cannot do here, and why that list is short

Cloudflare blocks a rollback when Durable Object migrations happened between versions, or
when the target version binds an R2 bucket, KV namespace, queue or D1 database that no
longer exists.

**None of those apply.** This Worker binds nothing at all — it is an assets-only Worker
with no `main` entry (ADR-010). The reason rollback is simple here is the same reason the
container diagram in `docs/architecture.md` has one box.

### Which version to roll back to

The list shows every version, and a production deployment looks identical to a preview
upload from a pull request: both read `Wrangler`, both read "Manually deployed", both by
the same account. **Do not pick by position in the list.** Promoting a branch preview to
production is the opposite of what a rollback is for.

Two ways to be sure:

- The **Message** column carries a description for anything done from the dashboard.
  Deployments made by CI leave it blank, which is the gap that makes this hard. See US-55.
- Verify after acting rather than reasoning before it: roll back, then check that
  production actually changed in the way you expected. The signal is free and instant.

### Rehearsal record

Rehearsed against production on **19 October 2026**, per the ticket, because a rollback
nobody has performed is a guess.

The signal was the `X-Content-Type-Options` response header, added hours earlier by US-53:
rolling back past it removes the header, which is unambiguous and checkable in one request.
Both versions served identical page content, so a visitor during the window saw the same
site missing three headers.

| Event                              | Time (CEST) |
| ---------------------------------- | ----------- |
| Rollback to `c6d54d70` applied     | 17:14:22    |
| Header gone from production        | 17:14:26    |
| Roll forward to `58386cbb` applied | 17:15:45    |
| Header back, first response        | 17:15:50    |
| Header back on every response      | 17:15:58    |

**The platform takes about five seconds.** Four seconds to roll back, five for the first
restored response. NFR-11 sets a recovery target of fifteen minutes; the mechanism uses
none of it. That budget is spent on noticing and deciding, not on the rollback itself,
which is worth knowing before anyone tries to optimise the wrong half.

**The switch back was not atomic.** Between 17:15:50 and 17:15:58, consecutive requests to
the same URL got different versions — header present, absent, absent, then present for
good. Thirteen seconds from the action to consistency.

The likely cause is in the label: the restore was recorded as "Promote version to 100%",
which suggests traffic is ramped onto the new version rather than switched. That is
consistent with what was observed and it is not established — the first rollback showed no
such window. Treat it as: **expect several seconds during which both versions are live.**
If you are rolling back because production is serving something harmful, it is still
reaching some visitors after the dashboard says done. Do not refresh once and walk away.

**There was no downtime.** Every request returned 200 throughout both transitions,
including inside the inconsistent window. A rollback does not take the site offline.

**Rollback covers static assets.** Cloudflare's documentation describes rollbacks for
Workers without stating whether the assets of an assets-only Worker roll back with the
version. They do. That was the one thing about this procedure that could not be established
by reading, and it is now established by doing.

---

## 2. Domain renewal

`diogo-pereira.dev` is registered at Cloudflare Registrar and renews annually at cost. It
is the only recurring expense in the project.

Cloudflare dashboard → **Domain Registration** → `diogo-pereira.dev` → **Settings**.

Verified 19 October 2026:

| Item            | State                                                       |
| --------------- | ----------------------------------------------------------- |
| Registrar       | Cloudflare, status Active                                   |
| Expires         | 3 September 2027                                            |
| Auto-renew      | **On** — scheduled 4 August 2027, a month before expiry     |
| Renewal price   | $12.20/yr, inside NFR-13's €15/year ceiling                 |
| WHOIS redaction | **Enabled**                                                 |
| Transfer lock   | **On**, by ICANN's mandatory 60-day hold after registration |
| DNSSEC          | **Enabled** 21 October 2026 — see US-56                     |

**WHOIS redaction was checked from outside, not from the dashboard.** The registrar's
settings page says what Cloudflare intends; a public lookup at `lookup.icann.org` says what
anyone querying the domain actually receives. They agreed. This matters more than it looks:
NFR-14 and ADR-008 forbid a postal address or phone number in the working tree, the build
output and git history, and neither covers WHOIS — which is a public record that would
carry exactly those fields by default. The rule had a surface nobody had written a
requirement for.

**DNSSEC was checked from outside, not from the dashboard.** Cloudflare's panel reports the
zone as signed; an external validator walks the chain of trust from the root through `.dev`
to this zone, which is what a visitor's resolver actually does. Cloudflare is both DNS host
and registrar here, so it publishes the DS record at the registry itself, removing the
mismatch between signing key and DS record that causes most DNSSEC outages. The failure mode
is worth stating because it is not gradual: a broken chain makes validating resolvers refuse
the zone outright rather than fall back to trusting it, so the domain stops resolving rather
than degrading. If the chain ever breaks, disable DNSSEC at Cloudflare and expect removal to
take minutes rather than seconds, because the DS record at the parent has its own cache
lifetime.

🔒 **The transfer lock changes character around 3 November 2026.** Today it is enforced by
ICANN policy — Cloudflare's own Unlock control is disabled because the domain was registered
within the last 60 days. Once that window closes the lock remains on, but it becomes a
setting that anyone holding the Cloudflare account could switch off. From that date the lock
is only as strong as multi-factor authentication on that account, which is already the
highest-value control in the project. Re-check the lock after 3 November and record it here
again.

If the domain lapsed, the site would not merely go offline: `.dev` is on the HSTS preload
list, so browsers refuse plain HTTP to it, and anyone could eventually register it and
serve whatever they liked at an address on a CV. That makes the registrar account the
highest-value thing to defend in this project, ahead of anything in the code.

---

## 3. If the deploy credential is exposed

The GitHub Actions secret `CLOUDFLARE_API_TOKEN` is the only real secret here. If it
appears in a log, a screenshot, a commit or a pasted terminal session, treat it as
compromised.

**Rotate, do not delete.** Deleting the token from a commit does not remove it: git history
is permanent, and anything pushed to a public repository should be assumed already copied.
The only action that helps is making the leaked value worthless.

In this order, so deployments never break:

1. Create a replacement token in Cloudflare, scoped the same as the current one. The dashboard
   moves this page around; if it is not under your profile's API Tokens, search "API Tokens"
   in the dashboard rather than guessing.
2. GitHub → repository **Settings** → **Secrets and variables** → **Actions** →
   `CLOUDFLARE_API_TOKEN` → **Update**, with the new value.
3. Re-run the last `main` deployment to confirm the new token works.
4. **Then** revoke the old token in Cloudflare.

Revoking first breaks deploys and leaves you rotating a credential under time pressure.

GitHub's push protection blocks a recognised credential before it reaches the remote, which
is the control that makes this procedure unlikely to be needed. It is not a reason to skip
writing it down.

---

## 4. What is monitored, and what is not

**Is:** Cloudflare Web Analytics, cookieless, page views and referrers (ADR-007). It tells
you whether anyone visited. It does not tell you whether the site was up.

**Is not:** there is no uptime check, no alerting, no error tracking and no log aggregation.
Nothing will tell you the site is broken; you will find out by looking, or someone will tell
you.

That is a deliberate position for a static site with no availability target and a €0/month
budget, not an oversight. Saying so precisely is worth more than a status page nobody reads.
If this ever changes, the trigger is flagship 2, which has a server and therefore something
to observe.
