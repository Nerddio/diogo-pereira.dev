import type { Plugin } from 'vite'

/**
 * US-46. Rewrites the `font-display` descriptor on the generated `@font-face`
 * rules from `swap` to `optional`.
 *
 * Why this is not configuration: @nuxt/fonts documents a `display` option on
 * `families`, but in 0.14.0 -- the latest release -- it is read only for a
 * family that declares its own `src`. A provider-resolved family goes through
 * `normalizeFontData(result.fonts)`, which never sees the override, so the
 * provider's `swap` always wins. Verified by reading fontless 0.2.1, the
 * resolver the module depends on, rather than by trying it.
 *
 * Why it matters: `swap` paints the fallback and then replaces it. The
 * metric-matched fallback faces that would make that replacement invisible
 * resolve through `local()` against Georgia, Times New Roman and Segoe UI, so
 * on any machine without those fonts -- every Linux visitor, and the CI runner
 * -- the whole body of text reflows. Measured on the deployed preview:
 * cumulative layout shift of 0.166 and 0.208 on the two markdown routes, which
 * is 5 to 9 performance points. With `optional` it is 0.000 on all five routes.
 *
 * The trade-off `optional` accepts: the browser allows the font a short window
 * and, if it has not arrived, uses the fallback for that page view and does not
 * swap. Restricting the build to four preloaded Latin faces is what keeps that
 * window winnable, which is why that part of US-46 stays.
 *
 * This throws when a stylesheet carries `@font-face` rules but does not end up
 * with `font-display:optional`. If @nuxt/fonts changes what it emits, or starts
 * honouring the documented option, the build fails and says so instead of
 * quietly reverting to a layout shift nobody is watching for.
 */
export default function fontDisplayOptional(): Plugin {
  return {
    name: 'portfolio-font-display',
    apply: 'build',

    generateBundle(_options, bundle) {
      for (const asset of Object.values(bundle)) {
        if (asset.type !== 'asset' || !asset.fileName.endsWith('.css')) continue

        const css = asset.source.toString()
        if (!css.includes('@font-face')) continue

        const next = css.replace(/font-display\s*:\s*swap/g, 'font-display:optional')

        if (!next.includes('font-display:optional')) {
          throw new Error(
            `${asset.fileName} declares @font-face rules but no font-display:optional ` +
              `after rewriting. @nuxt/fonts has changed what it emits. See US-46 and ` +
              `build/vite-font-display.ts: either the descriptor is now configurable, in ` +
              `which case delete this plugin and set it properly, or it is emitting a ` +
              `value this plugin does not recognise.`,
          )
        }

        asset.source = next
      }
    },
  }
}
