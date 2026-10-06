import tailwindcss from '@tailwindcss/vite'
import markdown from './build/vite-markdown'
import fontDisplay from './build/vite-font-display'

// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2026-09-07',

  // WCAG 3.1.1 (Level A). Without a lang attribute, assistive technology has
  // no way to know which language to pronounce the page in.
  app: {
    head: {
      htmlAttrs: {
        lang: 'en',
      },
      titleTemplate: '%s · Diogo Pereira',
    },
  },

  modules: ['@nuxt/eslint', '@nuxt/fonts'],

  css: ['~/assets/css/main.css'],

  // US-46. Four measured decisions, none of them a default.
  //
  // weights -- the build shipped weight 400 only, while the source asks for 500
  //   on every heading and 600 on bold text inside markdown. Those were
  //   resolving to 400 and to a browser-synthesised bold, so the weight
  //   hierarchy was not rendering at all, and a synthesised face has different
  //   metrics from a real one, which fed the layout shift below.
  //
  // subsets -- the site is in English. Google's `latin` subset covers ASCII,
  //   Latin-1 (so Portuguese accents), curly quotes and dashes. Cyrillic, Greek
  //   and Vietnamese cuts of both families were shipping for no reader.
  //
  // preload -- @nuxt/fonts omits preload links for subsetted families to avoid
  //   over-preloading. With four faces rather than eighteen there is nothing to
  //   over-preload, and discovering the font only after the stylesheet has
  //   parsed is what leaves a window for the fallback to be painted and then
  //   replaced.
  //
  // provider -- named rather than left to resolution order, so a same-named
  //   family appearing in another provider cannot silently change where these
  //   files come from.
  fonts: {
    defaults: {
      subsets: ['latin'],
      preload: true,
    },
    families: [
      { name: 'Jost', provider: 'google', weights: [400, 500] },
      { name: 'Source Serif 4', provider: 'google', weights: [400, 600] },
    ],
  },

  vite: {
    // ADR-012. The markdown plugin runs before Tailwind's: it turns a .md file
    // into a JavaScript module at build time, and throws if the frontmatter
    // does not match the schema, which fails the build.
    //
    // fontDisplay rewrites the generated font-display descriptor, which
    // @nuxt/fonts does not expose for a provider-resolved family in 0.14.0.
    // It throws if it finds nothing to rewrite. See build/vite-font-display.ts.
    plugins: [markdown(), tailwindcss(), fontDisplay()],
  },

  // ADR-002: static site generation. Every route is prerendered at build
  // time; there is no runtime server in production.
  ssr: true,
  nitro: {
    preset: 'static',
    prerender: {
      crawlLinks: true,
      failOnError: true,
    },

    // ADR-011. Nuxt 4.5.2 adds /200.html and /404.html to the prerender list
    // and then forces both to render WITHOUT server-side rendering, so
    // 404.html ships as an empty shell and the error page only appears once
    // JavaScript has run. That breaks NFR-03 for unknown routes.
    //
    // Cloudflare's not_found_handling only ever looks for a file named
    // 404.html, so the fix has to produce that exact name: skip Nuxt's empty
    // shell, and write the prerendered /404 page there instead.
    //
    // Delete this hook and app/pages/404.vue once Nuxt ships
    // experimental.prerenderErrorPages (merged for 4.6.0, unreleased).
    hooks: {
      'prerender:generate'(route) {
        if (route.route === '/404.html') {
          route.skip = true
        }
        if (route.route === '/404') {
          route.fileName = '404.html'
        }
      },
    },
  },

  typescript: {
    strict: true,
    typeCheck: false, // runs as a separate CI job, not in the build
  },

  devtools: { enabled: true },
})
