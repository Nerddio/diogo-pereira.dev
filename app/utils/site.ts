/**
 * Facts about where this site lives, in one place.
 *
 * US-25. The origin is a constant rather than runtime configuration: there is
 * exactly one production origin, it is already fixed by the Cloudflare project
 * and the DNS, and an environment variable would be a knob with one correct
 * setting that can be set wrong -- in a build whose whole output is absolute
 * URLs baked into HTML, where a wrong value ships silently.
 */
export const SITE_URL = 'https://diogo-pereira.dev'

export const SITE_NAME = 'Diogo Pereira'

/**
 * Appended to every page title. Lives here rather than inline in
 * nuxt.config.ts because the `og:title` sent to a social card has to match the
 * `<title>` the browser shows, and two copies of the same string drift.
 */
export const TITLE_SUFFIX = ` · ${SITE_NAME}`

/** The site-wide social card. Per-page images are V1.1. */
export const OG_IMAGE = {
  path: '/og.png',
  width: 1200,
  height: 630,
  alt: 'Diogo Pereira, full-stack engineer, diogo-pereira.dev',
} as const

/**
 * Resolves a route path against the production origin. Social and canonical
 * tags must carry an absolute URL -- a relative one is either ignored or
 * resolved against whatever host served the page, which on a preview
 * deployment would point crawlers and shared links at a temporary URL.
 */
export function absoluteUrl(path: string): string {
  return new URL(path, SITE_URL).toString()
}
