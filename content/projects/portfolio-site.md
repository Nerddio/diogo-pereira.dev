---
title: diogo-pereira.dev
summary: This site. A deliberately simple static site with a deliberately thorough delivery process,
  built so a hiring engineer can check every claim it makes.
stack:
  - Nuxt 4
  - TypeScript
  - Tailwind CSS v4
  - Playwright
  - GitHub Actions
  - Cloudflare Workers
repository: https://github.com/Nerddio/diogo-pereira.dev
liveUrl: https://diogo-pereira.dev
published: 2026-09-17
---

## The brief I set myself

Five pages. The site is not the interesting part and was never meant to be — the process
behind it is. Every significant choice has a dated record saying what was decided, what was
rejected and what it cost. Requirements were written as user stories with testable acceptance
criteria before any code. A pipeline refuses a merge until lint, type-checking, a production
build, end-to-end tests across three browser engines and a link check have all passed.

The repository is public. Nothing here needs to be taken on trust.

## Architecture, and what is deliberately missing

Every route is generated at build time. There is no server, no database, no API and no
container. That is worth stating plainly rather than leaving as an absence:

**No database**, because nothing is stored. The content is a handful of markdown files in the
repository, edited by one person, versioned by git. A database would add a running cost, a
backup story and an attack surface in exchange for nothing.

**No API**, because no client needs to ask the server anything. The pages are complete before
a visitor arrives. An API would be an extra network round trip to deliver content that could
have been in the HTML.

**No container**, because there is nothing to containerise. Docker solves reproducible runtime
environments; a folder of static files served by a CDN has no runtime. Adding it would be
decoration, and a reviewer who knows that would read it as decoration.

Those three absences are the architecture. Being able to say why a control is unnecessary is
the same skill as knowing when it is required.

## The stack, and what it cost

**Nuxt 4** over Astro, Next.js and a plain Vite and Vue single-page application. Astro was
arguably the better technical fit — it ships no JavaScript by default, which for a content
site is the right default. It was rejected anyway, because the gap I wanted to close was Vue 3
and its Composition API, and Astro would have taught me Astro. That is a worse artefact for a
better-trained engineer, and the record says so rather than pretending Nuxt won on merit.

**Static generation** over server rendering. There is no per-request work to do.

**TypeScript in strict mode**, enforced as a merge gate rather than as an editor setting. It
has already caught a real error: a framework type where an optional value was being passed to
a required prop, on a four-line change.

**Tailwind CSS v4**, with the colour tokens computed rather than eyeballed. The contrast
ratios are in the stylesheet as comments — ink on paper at 16.97:1, the muted tone at 6.54:1,
the accent at 7.56:1 — and there are two separate grey tokens because the accessibility
guidelines treat a decorative divider differently from the border of a control. Keeping them
as different names makes that a decision in the code rather than a judgement remade each time.

**Nuxt Content was chosen first and then rejected**, and it is the rejection I would most want
to talk about. The brief picked it because its typed schemas supposedly validate frontmatter at
build time. They do not. A file with a required field removed, an array field set to a string
and a URL field set to a non-URL builds cleanly, exits zero, logs nothing and renders the page
with the value blank. The schemas drive generated types and database columns; nothing checks
the content. Worse, the generated types are strict, so the compiler guarantees a string where
the value at runtime is null.

I measured four complete builds rather than argue from documentation. The replacement is about
sixty lines: parse the frontmatter, validate it against a schema, render the body, throw if it
does not match. A broken entry now stops the build and names the file, the field and the
reason. It also removed 1,084 kB of a database engine compiled to WebAssembly from the deployed
output, which was never the reason but is a pleasant consequence.

## The pipeline

Seven jobs on every pull request. Four are required by a branch protection ruleset, so a merge
is blocked rather than discouraged:

- **lint** — ESLint, no warnings tolerated
- **format** — Prettier, checked rather than applied
- **typecheck** — strict, zero errors
- **build-and-links** — a production build, then an internal link check that must find zero
  broken links

Then three more: a **preview** deployment per pull request, an **e2e** run of the Playwright
suite against that preview rather than against a local server, and a **deploy** job that runs
only on merge to the main branch.

Twenty-three end-to-end tests run across Chromium, Firefox and WebKit, plus a fourth project
that runs with JavaScript disabled. That last one exists because the architectural claim is
prerendering, and a claim that is not tested is a hope.

Third-party actions are pinned to commit hashes rather than version tags, because a tag can be
moved by whoever controls that repository. Install-time scripts are denied for every package,
because an install script runs with full rights on a machine holding the deployment token.

## Budgets

Accessibility is targeted at WCAG 2.2 AA and verified rather than asserted. Production
currently scores 100 on all four Lighthouse categories on mobile emulation. Those numbers are
not yet a merge gate — that work is open, and the honest status is that the site meets the
target while the gate that would hold it there does not exist.

A first-load JavaScript budget is set from a measured baseline plus headroom, not from a
figure chosen because it sounded strict.

## What went wrong

This is the part worth reading, because it is the part most write-ups leave out.

**A branch protection rule was configured but never saved.** A commit reached the main branch
through the gap. It was found by testing the control rather than trusting it. Two weeks later
the identical mistake was rejected, because by then the rule was real.

**A link checker passed while validating nothing.** It reported zero successes and eleven
exclusions for weeks. Passing and working are different states, and only one of them was being
checked.

**HTTPS was not actually enforced.** The domain is on a list that makes browsers upgrade the
connection automatically, which hid a misconfiguration at the edge. It surfaced only when the
connection was forced from the command line.

**The 404 page shipped empty.** The framework renders that one file without server-side
rendering, so the error page only appeared once JavaScript had run. The test that caught it
failed in one browser engine and passed in two, which looked like flakiness and was actually a
race. Rebuilding without the fix confirmed the original test passed with the defect present;
the replacement, with JavaScript disabled, fails every time.

**A pull request merged green, closed its ticket, and changed nothing.** It had been opened
from the wrong branch, so its diff was empty. Continuous integration passed, because an empty
diff breaks nothing. Only reading the file on the remote showed that a security fix recorded as
delivered had not been made.

The pattern across all five is the same, and it is the most useful thing this project taught
me: a merge, a green check, a closed ticket and a changelog entry are claims about a change.
None of them is the change.

## Read it yourself

The [repository](https://github.com/Nerddio/diogo-pereira.dev) is public. The decision records
live in `docs/adr` — twelve of them, including the one that was superseded and the ones written
because something broke. `docs/STATUS.md` carries the decision log, the open risks and a
running list of things to raise at the retrospective, written at the time rather than
reconstructed afterwards.
