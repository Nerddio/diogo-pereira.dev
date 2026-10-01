import { test, expect } from '@playwright/test'
import { ROUTES } from './routes'

// NFR-03. This is the test that distinguishes a prerendered site from a
// single-page application: with JavaScript disabled, an SPA renders an empty
// shell and this body would be blank. Content here means the HTML arrived
// complete in the initial response, which is what ADR-002 decided.
test.describe('content is present without client-side JavaScript', () => {
  for (const route of ROUTES) {
    test(`${route} is readable with JavaScript disabled`, async ({ page }) => {
      const response = await page.goto(route)
      expect(response?.status()).toBe(200)

      const body = (await page.locator('body').innerText()).trim()
      expect(body.length).toBeGreaterThan(0)
    })
  }
})

// NFR-03 covers unknown routes too, and until ADR-011 nothing here tested one.
// ROUTES lists only routes that return 200, so the single page that was NOT
// prerendered was the one page this suite never looked at. That gap is why a
// real defect reached a pull request and surfaced as a timing-dependent
// failure in one browser instead of a straight assertion here.
test.describe('the 404 page is readable without client-side JavaScript', () => {
  test('an unknown route returns 404 with content in the initial HTML', async ({ page }) => {
    const response = await page.goto('/a-route-that-does-not-exist')
    expect(response?.status()).toBe(404)

    const body = (await page.locator('body').innerText()).trim()
    expect(body.length).toBeGreaterThan(0)

    // A heading is a property of a readable page, not a piece of copy: it is
    // what tells a visitor and a crawler that this is a real page rather than
    // a blank shell that happened to contain a stray character.
    await expect(page.locator('main h1')).toBeVisible()
  })
})
