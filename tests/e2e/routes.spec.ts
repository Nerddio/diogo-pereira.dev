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
})
