import { z } from 'zod'

/**
 * The shape every project markdown file must have. This is the only definition:
 * the build plugin validates against it and the pages read the type inferred
 * from it, so a field cannot be added to one without the other.
 *
 * ADR-012 chose this over Nuxt Content because its schemas describe content
 * without checking it. A violation here stops the build.
 */
export const projectSchema = z.object({
  title: z.string().min(1),
  summary: z.string().min(1),
  stack: z.array(z.string()).min(1),
  repository: z.url(),

  // Optional on purpose: a flagship can have a public repository before it has
  // anywhere to visit. The index renders the link only when it is present.
  liveUrl: z.url().optional(),

  // Parsed as a date so an unparseable value fails the build, then emitted as a
  // plain YYYY-MM-DD string. A Date object would not survive JSON
  // serialisation into the generated module, so the type would claim Date while
  // the value was a string — the exact mismatch ADR-012 criticises in Nuxt
  // Content's generated types.
  published: z.coerce
    .date({ error: 'must be a date in YYYY-MM-DD form' })
    .transform((d) => d.toISOString().slice(0, 10)),
})

export type Project = z.infer<typeof projectSchema>
export type ProjectMeta = Project & { slug: string }
