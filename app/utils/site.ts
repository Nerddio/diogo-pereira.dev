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

/** The contact surface. Email and LinkedIn only, per the project constraints. */
export const PROFILES = {
  linkedin: 'https://www.linkedin.com/in/diogo-marques-pereira/',
  github: 'https://github.com/Nerddio',
} as const

/**
 * US-26. The JSON-LD `Person` entity, so a search engine can resolve this site
 * to a named individual rather than guessing from page text.
 *
 * Deliberately no email address. Schema.org permits one, and the mailto: link
 * on the Contact page is already harvestable, so this is a question of degree
 * rather than of kind -- but a machine-readable field is a materially easier
 * target than a link in markup, and the gain is nothing a recruiter needs.
 *
 * The address is locality and country only. No street, no postcode. A postal
 * address on an indexed domain cannot be withdrawn once it is crawled, and the
 * project constraints rule one out on the site itself; a structured-data block
 * is still the site.
 */
export const PERSON = {
  '@context': 'https://schema.org',
  '@type': 'Person',
  name: SITE_NAME,
  jobTitle: 'Full-stack engineer',
  url: absoluteUrl('/'),
  sameAs: [PROFILES.linkedin, PROFILES.github],
  address: {
    '@type': 'PostalAddress',
    addressLocality: 'Gouda',
    addressCountry: 'NL',
  },
} as const
