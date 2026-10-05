import tailwindcss from '@tailwindcss/vite'
import markdown from './build/vite-markdown'

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

  vite: {
    // ADR-012. The markdown plugin runs before Tailwind's: it turns a .md file
    // into a JavaScript module at build time, and throws if the frontmatter
    // does not match the schema, which fails the build.
    plugins: [markdown(), tailwindcss()],
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
