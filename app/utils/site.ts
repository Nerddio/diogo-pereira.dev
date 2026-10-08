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

/**
 * The published email address. US-49, ADR-008.
 *
 * An address on this domain rather than a personal account, forwarded inward by
 * Cloudflare Email Routing. ADR-008 publishes it unobfuscated on purpose, and
 * that is only defensible because an address existing for this and nothing else
 * can be retired and replaced if it is ever drowned. The account this replaced
 * was also a Google login, so publishing it gave away half a credential pair
 * with no way to take it back.
 */
export const EMAIL = 'contact@diogo-pereira.dev'

/**
 * The contact surface, in one place so that it can be audited in one place.
 * US-38 searches the repository and its history before release for anything
 * that should not be published; a surface spread across templates is one such a
 * search can agree with while the rendered page disagrees.
 */
export const PROFILES = {
  email: `mailto:${EMAIL}`,
  linkedin: 'https://www.linkedin.com/in/diogo-marques-pereira/',
  github: 'https://github.com/Nerddio',
} as const

/**
 * This website's own repository.
 *
 * Deliberately separate from the `repository` field in a project's markdown
 * frontmatter, which is that project's repository. The two happen to be the
 * same URL today because the only project indexed here is this site, and
 * folding them together would break the moment that stops being true.
 */
export const REPOSITORY = 'https://github.com/Nerddio/diogo-pereira.dev'

/**
 * A URL as a reader should see it: no scheme, no `www.`, no trailing slash.
 *
 * The Contact page shows these links as readable text rather than as raw URLs.
 * Deriving that text rather than writing it out means the label cannot
 * disagree with where the link actually goes -- which is the failure a reader
 * has no way to detect, because the only visible half is the one that lies.
 */
export function displayUrl(url: string): string {
  return url.replace(/^https?:\/\/(www\.)?/, '').replace(/\/$/, '')
}

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
