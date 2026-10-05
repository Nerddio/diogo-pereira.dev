# ADR-012 — Build-time markdown over Nuxt Content

|                |                                             |
| -------------- | ------------------------------------------- |
| **Status**     | **Accepted** — 5 October 2026               |
| **Date**       | 5 October 2026                              |
| **Deciders**   | Diogo Pereira (tech lead)                   |
| **Depends on** | ADR-002, ADR-003 (accepted)                 |
| **Amends**     | The Nuxt Content entry in the brief's stack |

## Context

The brief chose Nuxt Content v3 and gave a reason:

> Nuxt Content v3 — first-party markdown module. Typed collection schemas mean frontmatter
> is validated at build time rather than silently rendering empty.

That reason is factually wrong, and the requirement it was meant to satisfy is explicit.
US-18 states: _given an entry with invalid or missing frontmatter, when the build runs, then
the build fails rather than rendering an incomplete card._

Measured against `@nuxt/content@3.16.1` on Nuxt 4.5.2 with `nitro.preset: 'static'`. One
markdown file was broken three ways at once — a required `summary` removed, `stack` set to a
string where the schema declares `z.array(z.string())`, and `repository` set to
`definitely-not-a-url` against `z.string().url()`:

|                                      | Result                           |
| ------------------------------------ | -------------------------------- |
| Exit code                            | **0**                            |
| Validation messages in the build log | **none**                         |
| Rendered output                      | the page, with the summary blank |

The schema is not inert — it drives SQL column types, generated TypeScript types and Studio
forms. But there is no validation in the ingest path: missing fields become `NULL` and wrong
types are coerced with `String()`. The documentation claims the schemas "enforce data
consistency and drive generated types"; it never claims build-time content validation. The
brief inferred a guarantee that was never offered.

**The generated types make this worse rather than better.** They are genuinely strict —
`nuxt typecheck` rejects a wrong field name or type in consuming code. So TypeScript
guarantees `summary: string` while the runtime value is `null`. Compile-time safety on the
code, none on the content, and the two disagree silently. A reader of the code would
reasonably conclude the content was checked.

## Decision

**Render markdown at build time with a small Vite plugin: parse frontmatter with
`gray-matter`, validate it against a zod schema, render the body with `markdown-it`, emit a
plain JavaScript module.** Pages import the results with `import.meta.glob`.

Validation failure throws during the build, which fails it:

```
>>> EXIT CODE: 1
Error: Invalid frontmatter in content/projects/portfolio-site.md:
  - summary: Required
  - repository: Invalid url
```

The file, the field and the reason, with a non-zero exit. That is the requirement.

`nitro.preset: 'static'` is unaffected. Nothing in this approach reaches the browser: the
markdown is HTML before the build finishes.

## Options considered

**Nuxt Content v3 — rejected, and it is the interesting rejection.** It is the first-party
module, it is well maintained, and it satisfies the other hard requirement comfortably: with
JavaScript disabled, the prerendered markdown is present in the initial HTML. It was rejected
on the requirement it was chosen for.

Three further costs, all measured, none of them the reason on their own:

- **Deploy output 1,561 kB against 199 kB** for the chosen approach, 1,084 kB of it a SQLite
  engine compiled to WebAssembly.
- **First-load JavaScript +22.5 kB gzipped** on a detail route, against +1.1 kB. Measured
  against a roughly 57 kB baseline, that is the difference between noise and a fifth again.
- **Continuous integration fails today.** Without a SQLite connector the build exits 1 in CI,
  because it prompts interactively for one and a pipeline cannot answer
  ([nuxt/content#3483](https://github.com/nuxt/content/issues/3483), open). Workable with
  `experimental.sqliteConnector: 'native'`, but it is a defect we would inherit.

The WebAssembly engine is **not** fetched on first load, and it is worth recording why the
obvious objection is wrong: Nuxt's payload extraction resolves queries at prerender time and
ships the result as JSON, so the database never executes in the browser. It is dead weight in
the deployed output, not visitor cost. But a single content query that runs client-side — a
search box, a query in a lifecycle hook — pulls the whole stack: 1,248 kB against 205 kB for
the same page, measured. No configuration disables it; the module's full option surface was
read and there is no switch. Staying light would be a discipline, not a setting, and
disciplines are what this project keeps finding have quietly lapsed.

**Nuxt Content with a separate validation script — rejected.** Keeping the module and adding
a standalone script that parses the files with the same schema and exits non-zero would meet
US-18. It was rejected because the result is the module's weight and its CI defect plus a
validation step we write anyway — paying for machinery whose main attraction we are
replacing.

**`@nuxtjs/mdc` standalone — rejected.** The markdown renderer Content is built on, without
the database. Deploy output drops to 259 kB and the WebAssembly disappears, but first-load
JavaScript is +21 kB, essentially identical to Content, because the renderer and its prose
components were always the first-load cost rather than SQLite. It has no validation either,
so the script would still be needed. It buys back deploy weight and nothing else.

**Plain Vue components, content written as markup — rejected.** Zero dependencies and zero
client cost, and for exactly one case study it is defensible. Rejected because the projects
index is specified as a typed collection, because a second entry is imminent, and because
writing a case study as template markup makes editing it unpleasant enough that it would not
get edited.

## Consequences

**Gained**

- US-18's build-failure criterion is met by the mechanism rather than by a separate check that
  could be skipped. An invalid entry cannot reach the site.
- The content layer is about thirty-five lines that can be read in full, in a project whose
  argument is that its author can explain every part of it.
- No WebAssembly, no SQLite, no native module, and no exposure to the CI defect above.
- Cloudflare's documented path for Nuxt Content requires a D1 database binding. Declining the
  module declines that too, which keeps the no-database constraint and the zero running cost
  intact without having to argue the point.

**Accepted costs**

- **Thirty-five lines we own and maintain.** A first-party module is maintained by someone
  else; this is not. The mitigation is that it is small enough to read rather than trust.
- **No MDC syntax**, so Vue components cannot be embedded in markdown. Nothing planned needs
  it.
- **No syntax highlighting** unless added later. The case study has little code in it.
- **No Nuxt Studio**, the hosted editor. Content is edited in the repository, which ADR-003
  already decided.
- **No query builder.** Filtering and sorting are array operations over a handful of entries.
- Three build-time dependencies — `gray-matter`, `markdown-it` and `zod`, all MIT, none of
  them shipped to a visitor. `zod` is already present in the lockfile transitively.
- **An eager glob puts every entry's rendered body in one shared chunk**, so the index would
  download bodies it does not display. Trivial at one entry, wrong at twenty. Split the
  metadata from the bodies before the collection grows.

**Security**

Rendering markdown to HTML is the one place this site turns text into markup, so it is the
one place a cross-site scripting bug could exist. The input is files in this repository,
written by the author and reviewed through the same pull requests as the code — there is no
path for anyone else's text to reach the renderer. That removes the usual risk rather than
mitigating it, and it is the reason `markdown-it` is used with HTML passthrough left at its
default of off: no raw HTML in a markdown file is rendered as markup. If content ever came
from somewhere else, that assumption changes and the output would need sanitising.

Declining the module also avoids a Content Security Policy concession. Client-side WebAssembly
requires `wasm-unsafe-eval` in `script-src`
([nuxt/content#2992](https://github.com/nuxt/content/issues/2992), open), which would mean
weakening a policy to accommodate a database that a prerendered site does not need.

**Verified before acceptance**

Four complete Nuxt 4.5.2 projects were built and measured rather than compared on
documentation: a baseline with no markdown, one with Nuxt Content, one with the chosen
approach, and one with `@nuxtjs/mdc`. Deploy sizes, first-load JavaScript per route,
JavaScript-disabled rendering and network requests were measured for each. The validation
behaviour of both Nuxt Content and the chosen approach was confirmed by breaking a real file
and reading the exit code. All three markdown approaches render correctly with JavaScript
disabled; that requirement did not distinguish them.

**Reversibility**

High, in one direction. Adopting Nuxt Content later means installing it and rewriting the two
pages; the markdown files and their frontmatter are unchanged, because the schema fields were
chosen to describe the project rather than to suit the tool.
