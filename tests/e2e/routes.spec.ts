import { test, expect } from '@playwright/test'
import { ROUTES } from './routes'

test.describe('every route is served', () => {
  for (const route of ROUTES) {
    test(`${route} returns 200`, async ({ page }) => {
      const response = await page.goto(route)
      expect(response?.status()).toBe(200)
    })

    test(`${route} loads without console errors`, async ({ page }) => {
      const errors: string[] = []

      // Two different failure channels: a logged error, and an uncaught
      // exception that never reaches console.error at all.
      page.on('console', (message) => {
        if (message.type() === 'error') errors.push(message.text())
      })
      page.on('pageerror', (error) => {
        errors.push(error.message)
      })

      await page.goto(route, { waitUntil: 'networkidle' })
      expect(errors).toEqual([])
    })
  }
})

test.describe('unknown routes', () => {
  test('serve the 404 page rather than an empty body', async ({ page }) => {
    const response = await page.goto('/a-route-that-does-not-exist')

    expect(response?.status()).toBe(404)

    // The point of this assertion: a host with no not-found handling returns a
    // bare 404 with nothing in it. A visitor who mistypes a URL should get a
    // page they can navigate away from.
    const body = (await page.locator('body').innerText()).trim()
    expect(body.length).toBeGreaterThan(0)
  })

  // The 200-route tests above assert no console errors. This one deliberately
  // asserts only uncaught exceptions: a document served with a 404 status makes
  // the browser log resource-loading errors that are correct behaviour, not
  // defects, so asserting on them here would fail for the wrong reason. An
  // uncaught exception is the signal that matters — it is what a broken
  // hydration of the error page would produce.
  test('the 404 page hydrates without throwing', async ({ page }) => {
    const thrown: string[] = []

    page.on('pageerror', (error) => {
      thrown.push(error.message)
    })

    await page.goto('/a-route-that-does-not-exist', { waitUntil: 'networkidle' })
    expect(thrown).toEqual([])
  })
})

// US-12. The criterion is that the home page carries a route into the projects
// and to the GitHub profile. The link check in CI proves an internal link
// resolves; it cannot prove the link is there. This can fail: remove either one
// and it goes red.
test.describe('the home page is a route into the work', () => {
  test('links to the projects index and to the GitHub profile', async ({ page }) => {
    await page.goto('/')

    await expect(page.locator('main a[href="/projects"]')).toHaveCount(1)
    await expect(page.locator('main a[href="https://github.com/Nerddio"]')).toHaveCount(1)
  })
})
