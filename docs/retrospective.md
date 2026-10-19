# Retrospective

Written at the close of v1.0.0, from notes kept while the work happened. US-36.

## How this was written, and why that matters

Every observation below was recorded in `docs/STATUS.md` on the day it occurred, under a
heading added in the first week for exactly this purpose. Those entries are still there,
dated and in place; this document selects and arranges them rather than replacing them.

That ordering is the whole point. A retrospective assembled at the end from memory records
what the author wishes had been noticed. One assembled from contemporaneous notes records
what was actually noticed, including the parts that are unflattering — and the unflattering
parts are the ones worth reading.

---

## What worked

**Shipping before polishing.** M1's goal was "live, ugly and deployed on the real domain
with every gate green". The site was publicly reachable and credible weeks before it was
finished. Every later milestone improved something that already existed, which meant no
milestone could leave the project with nothing to show.

**The gates paid for themselves, repeatedly and in ways inspection could not have.**

- The Lighthouse budget failed on its first real run and was right to. Two routes shifted
  layout when the web fonts loaded, costing five to nine performance points. Chasing it
  down also revealed that only weight 400 was being shipped while the source asked for 500
  and 600 — so the designed type hierarchy was not rendering at all — and that six writing
  systems were being served to a site written in English. None of that was visible by
  looking at the site.
- `nuxt typecheck` in strict mode caught a real error introduced while fixing the 404 page:
  an optional `statusCode` passed to a required prop. On a four-line change.
- The script budget refused a merge, which forced the question nobody had asked in two
  milestones: what is the budget already full of? The answer was 91,104 bytes of framework
  runtime hydrating pages with nothing to hydrate. Deleting it took transferred script to
  zero and performance from 98 to 100.

**Measuring instead of accepting.** Three tools named in the original plan had aged or did
not do what they claimed. Nuxt Content was chosen for build-time validation and does not
validate — a file broken three ways builds with exit code 0 and renders blank, measured
across four built projects. Cloudflare Pages now carries a "legacy" label in its own
dashboard. `@lhci/cli` had gone sixteen months without a release and pins a Lighthouse
version two majors behind. Each was caught by checking the primary source before building
on it.

**Writing decisions down while the reasoning was fresh.** Sixteen architecture decision
records, one superseded and kept. A dated decision log. This document took an evening
instead of a week because the material was already there.

**Process survived contact with time pressure.** Scope was cut twice — polish, never a
gate, never a review, never a record. That was a deliberate rule written at the start, and
it is the only reason the project still has a paper trail.

---

## What did not

### Controls that passed without working

This is the finding of the project, and it is not close.

**Eight separate controls reported success while not doing their job:**

1. The branch protection ruleset was configured but never saved. A commit reached `main`
   through the gap. It was noticed only because the control was tested rather than trusted.
2. The internal link checker reported "Successful 0" and passed — checking nothing.
3. Cloudflare's Always Use HTTPS was switched off. `.dev` is HSTS-preloaded, so browsers
   upgraded the request anyway and hid it. Found by forcing a plain HTTP connection.
4. The JavaScript-disabled end-to-end suite iterated the list of routes returning 200, so
   the one route that was not prerendered was the one route it never tested. NFR-03 read as
   satisfied for two weeks while being false for every unknown URL.
5. A 404 test passed with the defect present. It failed in Chromium and passed in Firefox
   and WebKit, which looked like flakiness and was a race: with JavaScript enabled,
   hydration filled the body before the assertion ran.
6. A sitemap unit test passed while the code published `/200.html` to crawlers, because its
   fixture was written from assumed data rather than observed behaviour.
7. Two image-processing checks could not fail: each compared a thing against itself.
8. The font-display build plugin guards against a stylesheet whose `@font-face` rules were
   not rewritten. It skips stylesheets with none — which is exactly what a blocked network
   produces. So the build can ship zero fonts and exit 0. Found on the last day, by a cold
   run in a restricted container, and it is the same failure the plugin was written in
   response to.

Reading them together, the pattern is sharper than any single one. **A control is a claim
about behaviour, and reading its configuration tests nothing.** Seven of the eight were
found by exercising the control, or by reintroducing the defect and watching. The eighth
was found by running the project somewhere it had never run.

The practice that falls out of this, and the thing worth carrying forward: **a gate is not
finished until it has been made to fail on purpose.**

### Estimating and planning

- **E1 contained no story creating the application its CI gates would run against.**
  Invisible in the milestone plan, obvious the moment tickets were written against the
  Definition of Ready.
- **Estimating changed the plan, and was done too late to change it cheaply.** E7 and E8
  turned out to be 42% of the backlog and sat entirely in the final two days of the
  original schedule. The resequencing came from the estimate, not from the plan.
- **Two re-plans in two weeks, both missed, before dates were dropped entirely.** The
  estimates were not wrong about the work. They were wrong about how much of it a person
  conducting a job search does in a week. Available hours were never the constraint the
  plan modelled; attention and writing time were.
- **Required status checks could only be added after the workflow had run once**, so the
  pipeline was advisory for its first several merges — including the one that put an
  invalid workflow file on `main`. The ordering is forced by GitHub; the gap is worth
  knowing about rather than assuming protection from the moment a ruleset exists.
- **A pull request description reading `Closes #7, #10 and #13` closed only #7.** GitHub
  needs the keyword before each number. The work shipped, the tracker drifted silently, and
  three issues sat open for two weeks.
- **A requirement had a surface nobody had written a requirement for.** NFR-14 forbids a
  postal address in the working tree, the build output and git history. It says nothing
  about WHOIS, which publishes exactly those fields by default. It was redacted — by
  Cloudflare's default, not by anyone's decision. Found on the final day.

### Where the pair got it wrong

This project was built by a person and an AI assistant working together, which is disclosed
rather than implied (D9). A retrospective listing only one side's mistakes would be a
misleading document.

The assistant's errors, in the same spirit as the rest of this page:

- **A stale measurement was repeated into an architecture decision record, a ticket and a
  pull request description without being re-measured.** The real figure was found later by
  running the gate against production.
- **Three verification commands were handed over that could not distinguish success from
  failure** — a `curl | grep` that silenced the request's own exit code, a header check with
  no status code, and a shell command in the wrong shell's syntax.
- **Two confident hypotheses were wrong.** A performance cost was attributed to a new
  connection competing with the critical path; measurement showed no difference and the
  real cause was contention with the framework payload. A day of slow CI was attributed to
  a runner image migration announced that morning; it was a GitHub platform incident, which
  their status page confirmed twenty minutes later.
- **A branch was created from another feature branch instead of `main`, twice** — the
  squash-merge trap, where the merged commit on `main` is a new object and the original
  branch is no longer an ancestor of it.
- **A duplicate glossary entry shipped**, in the same file whose opening line calls a
  missing term a defect.
- **`pnpm test:e2e` was recommended as a pre-commit check** when the project's own
  Playwright config refuses to run without a deployed URL, with the reason written at the
  top of that file.

The pattern in that list is the same disease as the controls theme, approached from the
other side: **confident inference where measurement was available and cheap.** Every one of
those errors was caught by the same habit that caught the eight controls — looking, rather
than reasoning about what ought to be true.

---

## The numbers

Measured, not claimed.

|                                 |                                                                                      |
| ------------------------------- | ------------------------------------------------------------------------------------ |
| Routes, prerendered             | 6 plus a prerendered 404                                                             |
| First-party JavaScript shipped  | 0 bytes                                                                              |
| Total script per route          | 10,311 bytes — the analytics beacon, nothing else                                    |
| Lighthouse, mobile, every route | 99 / 100 / 100 / 100                                                                 |
| Cumulative layout shift         | 0.000 on every route                                                                 |
| Script transfer budget          | 12,500 bytes, derived from the measured baseline                                     |
| Accessibility                   | 70 WCAG 2.2 A/AA axe rules over 7 routes, zero violations, plus a signed manual pass |
| Architecture decision records   | 16, one superseded and kept                                                          |
| Rollback, measured by rehearsal | ~5s to take effect, 13s to full consistency, no downtime                             |
| Cold run, clean container       | 25s from `git clone` to a running dev server                                         |

---

## What changes for flagship 2

**Unit and integration tests, with the coverage conversation had properly.** ADR-006 argues
honestly for smoke tests and budgets without a coverage target, and that argument holds for
a static site with no logic. It will not hold for a system with a server, and "I know when
that trade-off stops applying" is a better position than either dogma.

**A server, and everything that follows from having one.** Docker, observability, a data
model, authentication. This project deliberately closed none of those and says so; flagship
2 is where they get closed rather than claimed.

**Every gate gets a deliberate failure injected before it is trusted.** This is the single
transferable practice from this project. It would have caught the ruleset, the link checker,
the HTTPS setting, the JavaScript-disabled suite and the font plugin — on day one, in
minutes each.

**Estimate before sequencing, not after.** The estimate here changed the milestone plan. It
should have been available while the plan was being written.

**Concurrency control and a pinned runner image from the first commit**, rather than
discovered as waste on the last day.
