import type { ProjectMeta } from '../../build/content-schema'

/**
 * Metadata for every project, newest first.
 *
 * `import: 'meta'` asks Vite for one named export. It does not stop the rendered
 * bodies reaching this chunk -- measured, they do, because the detail page
 * imports the same modules and the bundler keeps their exports together. At one
 * entry that is 1.7 kB gzipped on the index and not worth solving; ADR-012
 * records it as a consequence to revisit before the collection grows.
 */
const modules = import.meta.glob<ProjectMeta>('../../content/projects/*.md', {
  eager: true,
  import: 'meta',
})

export const projects: ProjectMeta[] = Object.values(modules).sort((a, b) =>
  b.published.localeCompare(a.published),
)
