// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2026-09-07',

  // ADR-002: static site generation. Every route is prerendered at build
  // time; there is no runtime server in production.
  ssr: true,
  nitro: {
    preset: 'static',
    prerender: {
      crawlLinks: true,
      failOnError: true,
    },
  },

  typescript: {
    strict: true,
    typeCheck: false, // runs as a separate CI job, not in the build
  },

  devtools: { enabled: true },
})