import { test, expect } from '@playwright/test'
import AxeBuilder from '@axe-core/playwright'
import { ROUTES } from './routes'

/**
 * US-30, NFR-04. Zero axe violations on every route, against the WCAG 2.2 AA
 * rule set.
 *
 * These five tags select 70 of axe's 105 rules. The 35 left out are AAA,
 * best-practice, experimental and obsolete. The requirement is AA, and a gate
 * that fails on a best-practice suggestion is one people learn to override,
 * which costs more than it buys.
 *
 * This is not redundant with the Lighthouse accessibility score. Lighthouse
 * runs a subset of these rules and scores it, so "accessibility 100" reads as
 * complete and is not. This asserts zero violations across the full AA set.
 *
 * Chromium only. axe analyses the DOM and computed styles; the three-engine
 * matrix exists for NFR-09, which is about rendering compatibility -- a
 * different requirement. Running one rule engine three times over the same
 * markup would report three passes for one check. The limitation that leaves:
 * an engine-specific accessibility-tree difference would not be caught here,
 * and the manual pass in docs/accessibility-review.md is where it would
 * surface.
 */
const WCAG_AA_TAGS = ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa']

/**
 * Violations as readable lines rather than as a dump of axe's result objects.
 * A failure should name the rule, what it means, and which element broke it,
 * because the person reading it in a CI log cannot open the page.
 *
 * Only `violations` is asserted. axe also returns `incomplete` -- checks it
 * could not decide without a human, such as contrast over a background image.
 * Failing the build on those would make the gate unpassable; they are exactly
 * what the manual review exists to resolve.
 */
async function violationsOf(page: import('@playwright/test').Page): Promise<string[]> {
  const results = await new AxeBuilder({ page }).withTags(WCAG_AA_TAGS).analyze()

  return results.violations.flatMap((violation) =>
    violation.nodes.map(
      (node) => `${violation.id} (${violation.impact}): ${node.target.join(' ')}`,
    ),
  )
}

test.describe('every route conforms to WCAG 2.2 AA', () => {
  for (const route of ROUTES) {
    test(`${route} has no accessibility violations`, async ({ page }) => {
      await page.goto(route)
      expect(await violationsOf(page), 'axe reported WCAG 2.2 AA violations').toEqual([])
    })
  }

  // The error page is prerendered by ADR-011's hook rather than by the normal
  // route pipeline, and it is the page a visitor reaches by accident -- the
  // worst one to be unusable.
  test('the 404 page has no accessibility violations', async ({ page }) => {
    const response = await page.goto('/a-route-that-does-not-exist')
    expect(response?.status()).toBe(404)
    expect(await violationsOf(page), 'axe reported WCAG 2.2 AA violations').toEqual([])
  })
})
