type SeoInput = {
  /** The page's own title. The site name is appended by the title template. */
  title: string
  /** Omitted only on pages that are not indexed. */
  description?: string
  /**
   * For pages that must stay out of search results. Also suppresses the
   * canonical link: a page asking crawlers to skip it has no business
   * declaring itself the preferred version of anything.
   */
  noindex?: boolean
}

/**
 * US-25. Sets every piece of per-route metadata: title, description, canonical
 * URL, Open Graph and Twitter card.
 *
 * This exists instead of calling `useSeoMeta` directly in each page because
 * the canonical URL and `og:url` have to be derived from the route, and a
 * derivation repeated in six components is one a seventh component will not
 * have. Routing it through one function makes the tags hold by construction
 * rather than by being remembered -- the same reason `:focus-visible` is
 * declared once in the base layer rather than as a class on every control.
 */
export function useSeo({ title, description, noindex = false }: SeoInput): void {
  const route = useRoute()
  const url = absoluteUrl(route.path)
  const sharedTitle = `${title}${TITLE_SUFFIX}`
  const image = absoluteUrl(OG_IMAGE.path)

  const indexed = !noindex

  useSeoMeta({
    title,
    description,

    // A page is either indexed, and declares which URL it prefers, or it is
    // not, and declares nothing. og:url is specified as "the canonical URL of
    // your object", so emitting it on a noindex page makes the same claim the
    // canonical link was withheld to avoid -- and on 404.html it would be
    // false as well, since that one file is served at every unknown path.
    ...(indexed ? { ogUrl: url } : { robots: 'noindex, follow' }),

    // og:title carries the suffix because a social card has no browser tab or
    // surrounding site to supply the context the <title> gets for free.
    ogTitle: sharedTitle,
    ogDescription: description,
    ogType: 'website',
    ogSiteName: SITE_NAME,
    ogImage: image,
    ogImageWidth: OG_IMAGE.width,
    ogImageHeight: OG_IMAGE.height,
    ogImageAlt: OG_IMAGE.alt,

    twitterCard: 'summary_large_image',
    twitterTitle: sharedTitle,
    twitterDescription: description,
    twitterImage: image,
    twitterImageAlt: OG_IMAGE.alt,
  })

  if (indexed) {
    useHead({ link: [{ rel: 'canonical', href: url }] })
  }
}
