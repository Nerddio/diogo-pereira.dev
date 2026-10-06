# ADR-014 — Font loading: four preloaded Latin faces, displayed `optional`

|                |                                               |
| -------------- | --------------------------------------------- |
| **Status**     | **Accepted** — 6 October 2026                 |
| **Date**       | 6 October 2026                                |
| **Deciders**   | Diogo Pereira (tech lead)                     |
| **Depends on** | ADR-005, ADR-013 (accepted)                   |
| **Closes**     | US-46, and the temporary threshold in ADR-013 |

## Context

The Lighthouse gate accepted in ADR-013 failed on its first run against a real preview
deployment: performance 94 on `/projects` and 91 on `/projects/portfolio-site` against 100
everywhere else. The cause was not page weight. Cumulative layout shift measured 0.146 and
0.187 on those two routes and zero on the rest, and layout shift carries 25 of the 100
performance points.

Investigating it turned up three separate defects in how fonts were loaded, none of which was
visible by looking at the site.

**Only weight 400 was shipped.** The source asks for weight 500 on every heading, the
navigation, the language table and the inline labels on the About page — twenty-six usages —
and 600 on bold text inside markdown. Neither weight was in the build. The 500s were resolving
to 400 and the 600 was being synthesised by the browser. The weight hierarchy in ADR-005's
design was not rendering at all.

**Six writing systems shipped for a site written in English.** Eighteen faces, 216 kB,
including the Cyrillic, Greek and Vietnamese cuts of both families.

**The metric-matched fallbacks never applied.** `@nuxt/fonts` generates fallback `@font-face`
rules carrying `size-adjust` and `ascent-override`, so that the placeholder font occupies
almost exactly the space the real one will. Each resolves through `src: local(Georgia)`,
`local(Times New Roman)`, `local(Segoe UI)`. Those are Windows and macOS fonts. On a machine
without them — every Linux visitor, and the GitHub Actions runner — none match, the browser
falls through to an unadjusted generic serif, and `font-display: swap` then repaints the whole
body when the real font arrives.

Extending the fallback list with the families Linux does ship is not available: the overrides
are computed from fontaine's bundled metrics database, which has entries for Georgia, Times New
Roman, Noto Serif, Noto Sans and Arial, and none for DejaVu Serif, Liberation Serif, DejaVu
Sans or Liberation Sans.

## Decision

**Ship exactly the four faces the site uses, in the Latin subset only, preloaded, with
`font-display: optional`.**

| Family         | Weights  | Subset | Faces |
| -------------- | -------- | ------ | ----- |
| Jost           | 400, 500 | latin  | 2     |
| Source Serif 4 | 400, 600 | latin  | 2     |

Google's `latin` subset covers ASCII, Latin-1 — so Portuguese accents — curly quotes and
dashes, which is the whole of this site's character set.

The provider is named explicitly on each family rather than left to resolution order, so a
same-named family appearing in another provider cannot change where these bytes come from
without a change in this repository.

**`font-display: optional` is applied by a build plugin, not by configuration.** `@nuxt/fonts`
documents a `display` option on `families`, but in 0.14.0 — the latest release, published
February 2026 — that option is read only for a family that declares its own `src`. A
provider-resolved family is normalised straight from the provider's response and never sees
the override. Verified by reading fontless 0.2.1, the resolver the module depends on, rather
than by trying it and guessing why it did nothing.

`build/vite-font-display.ts` therefore rewrites the descriptor in the emitted stylesheet. It
throws when a stylesheet carries `@font-face` rules but does not come out with
`font-display:optional`, so if the module changes what it emits — or starts honouring the
documented option — the build fails and names this decision rather than quietly reverting to a
layout shift nobody is watching for.

## Measurements

Taken against the production build of this site, served with compression, measured by the
ADR-013 gate.

| Build                                   | `/projects`        | `/projects/portfolio-site` |
| --------------------------------------- | ------------------ | -------------------------- |
| Before                                  | CLS 0.166, perf 91 | CLS 0.208, perf 89         |
| Weights, Latin subset and preload       | CLS 0.166, perf 91 | CLS 0.208, perf 89         |
| The same, plus `font-display: optional` | CLS 0.000, perf 99 | CLS 0.000, perf 99         |

The middle row is the point. Correcting the weights, dropping four writing systems and
preloading every remaining face changed cumulative layout shift by nothing at all — the same
figures to three decimal places. Preloading shortens the window before the real font arrives;
it does not remove the repaint when it does. Only suppressing the swap removes the shift.

The first two rows are also why those changes stay despite not moving the number. The weight
hierarchy was genuinely broken, and four small preloaded faces are what make `optional` show
the real typeface rather than the fallback.

## Options considered

**Extend the fallback list with the fonts Linux ships — rejected, measured.** The first choice,
on the reasoning that making the metric-matched fallback match everywhere would hide the swap.
fontaine has no metrics for DejaVu or Liberation, so the generated faces would carry a bare
`local()` with no `size-adjust`, which is the situation that already fails.

**Install the matching fonts on the CI runner — rejected.** It would make the measurement agree
with a typical Windows or macOS visitor, and change nothing for a real Linux one. Making a gate
agree with us is not the same as fixing what it found.

**Declare the four faces manually with `src` and `display` — rejected, and it was close.** Fully
supported, no patching of generated output. Rejected because it means committing font binaries
to the repository, hand-maintaining the `@font-face` rules, and giving up the automatic
subsetting and the generated fallback metrics. Both families are licensed under the SIL Open
Font License, so redistribution would have been permitted; the cost is maintenance, not legal.

**Leave the gate's performance threshold at 90 — rejected.** It was set to 90 as a deliberately
temporary measure with this ticket against it. Accepting it permanently would mean the v1
Definition of Done quietly changed to match what the site happened to score.

**Report it upstream and wait — rejected as a plan, worth doing anyway.** The documented
behaviour and the shipped behaviour disagree, which is worth an issue. It is not a schedule.

## Consequences

**Gained**

- Cumulative layout shift is zero on every route, and the ADR-013 performance threshold returns
  to the 95 the Definition of Done asks for.
- The weight hierarchy renders as designed, with real 500 and 600 faces rather than a fallback
  and a synthesised bold.
- Eighteen faces become four, and four writing systems the site never uses stop shipping.
- The fix cannot silently stop working.

**Accepted costs**

- `optional` means the browser allows the font a short window and, if it has not arrived, uses
  the fallback for that page view without swapping. A first-time visitor on a slow connection
  may see Georgia or a generic serif rather than Source Serif 4 on that visit. The font is
  cached for the next one. This is a deliberate trade of guaranteed typography for guaranteed
  layout stability, on a site whose readers are arriving to read.
- A build plugin that patches generated CSS is a workaround, and it is coupled to what
  `@nuxt/fonts` emits. The assertion is what makes that coupling safe to live with: it fails
  loudly rather than silently.
- Adding a weight or a character outside Latin-1 now requires a configuration change. That is
  the intended friction — it was shipping unused faces precisely because nothing made the
  choice explicit.

**Security**

No new dependency, no new network surface, nothing at runtime: the plugin runs at build time
and rewrites a string in a file the build already produced. Naming the provider on each family
is the one security-relevant change — it pins where the font bytes are fetched from at build
time, so a same-named family appearing in another provider cannot silently become the source.

**Reversibility**

High. The configuration is six lines and the plugin is one file with one assertion. If
`@nuxt/fonts` ships a working `display` option, the plugin's own error message says to delete
it and set the option properly.
