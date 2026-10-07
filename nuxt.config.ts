import tailwindcss from '@tailwindcss/vite'
import markdown from './build/vite-markdown'
import { TITLE_SUFFIX, SITE_URL } from './app/utils/site'
import { buildSitemap } from './build/sitemap'
import { writeFile } from 'node:fs/promises'
import { join } from 'node:path'
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
      // The suffix is shared with the composable that builds og:title, so a
      // social card and a browser tab cannot disagree about the site's name.
      titleTemplate: `%s${TITLE_SUFFIX}`,

      // US-47, ADR-007. Cloudflare Web Analytics.
      //
      // The token is public by construction: it ships in the HTML of every
      // page and anyone can read it from view-source. It says which site is
      // reporting and grants nothing, so it is committed rather than injected
      // from a secret at build time -- which would buy no protection and would
      // break on Dependabot pull requests, which GitHub withholds secrets from.
      //
      // Unconditional, so preview deployments carry it too. Both merge gates
      // run against the preview: a beacon present only in production would
      // leave the privacy test's allowlist entry passing because the beacon is
      // absent rather than permitted, and would leave the Lighthouse transfer
      // budget weighing bytes that are not the ones shipped.
      //
      // `type: 'module'` is Cloudflare's own snippet, and so is the position:
      // their instruction is to place it before the closing body tag.
      //
      // The first version of this put it in the head, reasoning that a module
      // script is deferred and therefore cannot block rendering. That confused
      // execution with fetching. Deferring execution does nothing about the
      // request, which starts the moment the tag is discovered -- in the head,
      // that means a new origin (DNS, TCP, TLS) and 11 kB competing with the
      // stylesheet and the fonts for bandwidth during exactly the window that
      // decides first paint. Measured at 90-92 on four routes against 98 for
      // the same content without it, with zero layout shift and zero blocking
      // time, so the cost was purely in when the page could paint.
      script: [
        {
          src: 'https://static.cloudflareinsights.com/beacon.min.js',
          type: 'module',
          'data-cf-beacon': '{"token": "3fb916b2ea3a4e2ab31d19696cb74135"}',
          tagPosition: 'bodyClose',
        },
      ],
    },
  },

  // US-26. The sitemap is written from the routes Nitro actually prerendered,
  // after prerendering finishes, so it cannot list a page that does not exist
  // or omit one that does. buildSitemap throws rather than emitting an empty
  // file if the filtering ever matches nothing.
  hooks: {
    'nitro:init'(nitro) {
      nitro.hooks.hook('prerender:done', async ({ prerenderedRoutes }) => {
        const xml = buildSitemap(prerenderedRoutes, SITE_URL)
        await writeFile(join(nitro.options.output.publicDir, 'sitemap.xml'), xml, 'utf8')
      })
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

  // US-50, ADR-015. Prerendered routes ship no client-side JavaScript.
  //
  // Every route here is rendered to complete HTML at build time, and nothing
  // on this site is interactive: no event handlers, no plugins, no middleware,
  // no client-only components, and the single computed() is derived from a
  // prop at render time. The framework runtime that was being shipped existed
  // to hydrate pages -- to attach Vue to markup the server had already
  // produced -- so that a document which already worked could become a
  // document which already worked. That cost 91,104 bytes on the home page.
  //
  // `noScripts` omits the entry scripts, the import map, the payload script
  // and the JavaScript resource hints. CSS is untouched. Scripts declared in
  // app.head are not Nuxt's and are kept, which is what lets the analytics
  // beacon survive.
  //
  // What this gives up, stated because it is a real loss: pages no longer
  // hydrate, so <NuxtLink> stops prefetching and every navigation is a full
  // page load rather than a client-side route change. On five prerendered
  // pages behind a CDN that is a fraction of a second, and the end-to-end
  // suite already proved every route is complete without JavaScript -- the
  // no-javascript project has been asserting exactly this property since M1.
  routeRules: {
    '/**': { noScripts: true },
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
