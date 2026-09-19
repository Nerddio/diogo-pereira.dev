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
