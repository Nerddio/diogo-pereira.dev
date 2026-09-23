import tailwindcss from '@tailwindcss/vite'

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
    plugins: [tailwindcss()],
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
  },

  typescript: {
    strict: true,
    typeCheck: false, // runs as a separate CI job, not in the build
  },

  devtools: { enabled: true },
})
