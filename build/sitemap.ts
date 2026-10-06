/**
 * US-26. Builds sitemap.xml from the routes Nitro actually prerendered.
 *
 * Deriving it from the prerender result rather than from a list means the
 * sitemap cannot claim a page that does not exist, and cannot omit one that
 * does. A hand-maintained list is correct on the day it is written and wrong
 * the first time a route is added by someone who did not know it existed --
 * the same reason the Lighthouse gate imports its routes from the end-to-end
 * test file rather than keeping a second copy.
 */

/** The subset of Nitro's PrerenderRoute this needs. Structural, so it does not
 *  drag a build-time type into the shape of this function. */
export type PrerenderedRoute = {
  route: string
  fileName?: string
  skip?: boolean
  error?: unknown
}

/**
 * Routes that are prerendered but are not pages a visitor should land on.
 *
 * `/404` is the error page. ADR-011's hook writes its output to `404.html`,
 * and the page carries `noindex` -- listing a noindex page in a sitemap asks a
 * crawler to index something the page itself tells it to skip.
 */
const NOT_INDEXABLE_ROUTES = new Set(['/404'])

/**
 * Every real page on this site is an extensionless route: `/`, `/about`,
 * `/projects/portfolio-site`. The two prerendered entries ending in `.html`
 * are Nitro's own: `/200.html`, the client-side boot shell, and `/404.html`,
 * the empty error shell ADR-011 skips.
 *
 * This is a rule rather than a list of filenames on purpose. The first version
 * of this file excluded them by `fileName`, using the bare values `200.html`
 * and `404.html`. Nitro derives fileName through `withoutBase()`, which keeps
 * a leading slash, so the real values are `/200.html` and `/index.html` and
 * neither exclusion ever matched -- `/200.html` shipped in the sitemap and the
 * unit test did not catch it, because the test used filenames that had been
 * guessed rather than observed.
 */
const isPageRoute = (route: string): boolean => !route.endsWith('.html')

const XML_ESCAPES: Record<string, string> = {
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;',
  '"': '&quot;',
  "'": '&apos;',
}

const escapeXml = (value: string): string => value.replace(/[&<>"']/g, (c) => XML_ESCAPES[c]!)

export function buildSitemap(routes: PrerenderedRoute[], origin: string): string {
  const locations = routes
    .filter((route) => !route.skip && !route.error)
    // Only pages. This drops the payload files, which are data fetched by a
    // page rather than destinations, and would be nonsense in a sitemap.
    .filter((route) => route.fileName?.endsWith('.html'))
    .filter((route) => isPageRoute(route.route))
    .filter((route) => !NOT_INDEXABLE_ROUTES.has(route.route))
    .map((route) => new URL(route.route, origin).toString())

  // Sorted and deduplicated so the file is byte-identical between builds of
  // the same content. Prerender order varies run to run, and a sitemap that
  // reshuffles itself makes every deploy look like a content change.
  const unique = [...new Set(locations)].sort()

  if (unique.length === 0) {
    throw new Error(
      'The sitemap would be empty. Every prerendered route was filtered out, which means ' +
        'Nitro has changed what it reports in prerender:done -- most likely the fileName ' +
        'field. See build/sitemap.ts and US-26. Shipping an empty sitemap would tell ' +
        'crawlers this site has no pages.',
    )
  }

  // The invariant behind isPageRoute, asserted rather than assumed. If a
  // prerendered artefact ever reaches this point with a file extension, the
  // rule above has stopped matching reality and the build should say so rather
  // than publishing a sitemap that points crawlers at a boot shell.
  const notPages = unique.filter((loc) => loc.endsWith('.html'))
  if (notPages.length > 0) {
    throw new Error(
      `The sitemap would list files rather than pages: ${notPages.join(', ')}. ` +
        'Every page on this site is an extensionless route, so this means Nitro has ' +
        'changed how it reports prerendered routes. See build/sitemap.ts and US-26.',
    )
  }

  // No lastmod, changefreq or priority. There is no reliable modification date
  // for these pages -- stamping the build time on all of them would tell
  // crawlers every page changed on every deploy, which is false and is the
  // kind of signal that gets a sitemap discounted. changefreq and priority are
  // ignored by every major crawler.
  const urls = unique.map((loc) => `  <url>\n    <loc>${escapeXml(loc)}</loc>\n  </url>`).join('\n')

  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>\n`
}
