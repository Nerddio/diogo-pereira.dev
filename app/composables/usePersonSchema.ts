/**
 * Serialises data for embedding in a `<script type="application/ld+json">`.
 *
 * `JSON.stringify` does not escape `<`, so a string value containing
 * `</script>` would close the tag early and everything after it would be
 * parsed as HTML -- a script injection through a data field. `<` is a
 * valid JSON escape for the same character, so the output still parses while
 * the sequence can no longer appear.
 *
 * Nothing here is user input today; every value is a constant in this
 * repository. This is written so that stays true if a value ever comes from
 * markdown frontmatter or anywhere else, because the alternative is a silent
 * hole that only opens later.
 */
function toJsonLd(data: object): string {
  return JSON.stringify(data).replace(/</g, '\\u003c')
}

/**
 * US-26. Emits the JSON-LD `Person` block, so a search engine can connect this
 * site to a named individual rather than inferring it from page text.
 *
 * Used on Home and About only. Repeating it on every page would restate the
 * same entity without adding anything, and duplicated entity blocks are a
 * known source of ambiguity for parsers.
 */
export function usePersonSchema(): void {
  useHead({
    script: [
      {
        type: 'application/ld+json',
        innerHTML: toJsonLd(PERSON),
      },
    ],
  })
}
