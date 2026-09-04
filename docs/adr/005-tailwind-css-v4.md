# ADR-005 — Tailwind CSS v4 over hand-authored CSS

| | |
|---|---|
| **Status** | Proposed — awaiting tech lead approval |
| **Date** | 3 September 2026 |
| **Deciders** | Diogo Pereira (tech lead) |
| **Depends on** | ADR-001 (accepted) |

## Context

The site must be visually coherent across five route types, meet a performance budget, reach
WCAG 2.2 AA, and be built in six days by one person who is not a designer and has no
existing design system.

The real risk is not choosing the wrong styling tool. It is spending two of six days
inventing a naming convention, a spacing scale and a type scale, and arriving at M3 with no
content written. `portfolio-goals.md` §7 names the opposite risk too: a site that reads as a
template rather than as a person.

## Decision

**Tailwind CSS v4.3.3**, installed via the `@tailwindcss/vite` plugin, with the design tokens
— colours, type scale, spacing — defined explicitly in CSS rather than left at framework
defaults.

## Options considered

**Hand-authored CSS with custom properties — rejected.** Full control, the smallest possible
output, and no dependency. Rejected on schedule risk: it requires inventing and then
maintaining a naming system and a design system concurrently with learning Nuxt, and the
first thing to slip would be consistency across pages. It is the right answer for a designer
or for a project with time to spare, and this is neither.

**Scoped SFC styles or CSS Modules — rejected.** Solves scoping, which Tailwind also solves,
but leaves the design-system problem entirely unsolved. Same schedule risk as above.

**A component library (Nuxt UI or similar) — rejected.** Would produce a competent-looking
site fastest of all. Rejected because it ships components the site does not need, it imposes
a recognisable look, and a hiring engineer who recognises the library learns nothing about
the candidate. This is the "wall of template" failure mode named in the portfolio goals.

## Consequences

**Gained**

- A coherent spacing, type and colour scale on day one, without designing one.
- Unused CSS is not shipped, which helps the performance budget rather than fighting it.
- Tailwind is a directly employable, commonly listed skill, so the dependency doubles as
  evidence.

**Accepted costs**

- Markup carries styling, which makes templates noisier. Mitigated by extracting repeated
  patterns into Vue components — the right unit of reuse in this stack — rather than by
  accumulating `@apply` rules, which recreates the problem Tailwind was chosen to avoid.
- Tailwind v4 configures in CSS rather than in `tailwind.config.js`. Prior v3 knowledge
  partially transfers and partially misleads; this is a small learning cost, taken knowingly.

**Explicit warning attached to this decision**

Utility classes produce no accessibility whatsoever. Semantic elements, heading order,
landmarks, focus visibility and contrast are unaffected by the choice of styling tool, and
the WCAG 2.2 AA target in US-30 is met by markup and verification, not by Tailwind. Treating
a styling framework as if it contributed to accessibility is a common and expensive
misconception, and it is recorded here so it is not made.

**Second warning**

Tailwind's defaults are recognisable. Leaving the default palette, default font stack and
default shadows in place produces exactly the templated look the project is trying to avoid.
Defining the tokens deliberately is part of this decision, not a later polish task.
