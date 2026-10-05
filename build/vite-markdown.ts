import fs from 'node:fs'
import path from 'node:path'
import matter from 'gray-matter'
import MarkdownIt from 'markdown-it'
import type { Plugin } from 'vite'
import { projectSchema } from './content-schema'

/**
 * html: false is the security-relevant setting. With it off, raw HTML inside a
 * markdown file is escaped and rendered as text rather than as markup, so a
 * stray <script> in content cannot become a script tag in the page. The input
 * here is files in this repository, reviewed through the same pull requests as
 * the code, so this is defence in depth rather than the only thing standing
 * between a visitor and injected markup — but it costs nothing and the
 * assumption it relies on would change the day content came from anywhere else.
 */
const md = new MarkdownIt({ html: false, linkify: true, typographer: true })

export default function markdownPlugin(): Plugin {
  return {
    name: 'portfolio-markdown',
    enforce: 'pre',

    transform(_code, id) {
      if (!id.endsWith('.md')) return null

      const raw = fs.readFileSync(id, 'utf8')
      const { data, content } = matter(raw)

      const result = projectSchema.safeParse(data)
      if (!result.success) {
        // Throwing in a transform fails the Vite build, which fails
        // `nuxt generate`. This is US-18's second acceptance criterion: an
        // entry with invalid frontmatter must stop the build rather than
        // render an incomplete card.
        const issues = result.error.issues
          .map((i) => `  - ${i.path.join('.') || '(root)'}: ${i.message}`)
          .join('\n')
        throw new Error(`Invalid frontmatter in ${path.relative(process.cwd(), id)}:\n${issues}`)
      }

      const slug = path.basename(id, '.md')

      // Two named exports rather than one default. Note this does NOT keep the
      // body out of the index's chunk: measured, the rendered HTML still lands
      // in a chunk the index loads, because both pages import this module and
      // the bundler keeps its exports together. `import: 'meta'` changes what a
      // page imports, not what is bundled. The shape is kept because it costs
      // nothing and is where a real split would start -- emitting the body as a
      // separate module -- but the saving is not real today. ADR-012 records the
      // cost as 1.7 kB gzipped on the index at one entry.
      return {
        code: [
          `export const meta = ${JSON.stringify({ ...result.data, slug })}`,
          `export const html = ${JSON.stringify(md.render(content))}`,
        ].join('\n'),
        map: null,
      }
    },
  }
}
