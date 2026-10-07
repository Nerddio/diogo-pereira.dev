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

// US-49. ADR-008's argument for publishing an address unobfuscated depends on
// that address being disposable, which is only true of the one on this domain.
// This asserts the site publishes that one.
//
// The address is written out here rather than imported from app/utils/site.ts
// on purpose. Importing it would make this test agree with whatever the source
// says, which is not an assertion -- changing the constant would change the
// test with it and nothing would go red. A literal makes the published address
// something a person has to change deliberately, in two places, with a reviewer
// seeing both.
test.describe('the contact surface publishes the owned-domain address', () => {
  const MAILTO = 'mailto:contact@diogo-pereira.dev'

  test('the contact page links to it', async ({ page }) => {
    await page.goto('/contact')
    await expect(page.locator(`main a[href="${MAILTO}"]`)).toHaveCount(1)
  })

  // One route only. The footer comes from the shared layout, so checking all
  // five would run the same code five times and report it as five passes.
  test('the footer links to it', async ({ page }) => {
    await page.goto('/')
    await expect(page.locator(`footer a[href="${MAILTO}"]`)).toHaveCount(1)
  })

  // The readable labels on the Contact page are derived from the URLs by
  // displayUrl(). That derivation is the only new logic in US-49, and its
  // failure mode is silent: a label saying one thing while the link goes
  // somewhere else. Nothing else in the pipeline would notice -- it is valid
  // markup, it passes an accessibility scan, and it renders correctly.
  test('the profile links are labelled with where they actually go', async ({ page }) => {
    await page.goto('/contact')

    await expect(page.locator('main a[href="https://github.com/Nerddio"]')).toHaveText(
      'github.com/Nerddio',
    )
    await expect(
      page.locator('main a[href="https://www.linkedin.com/in/diogo-marques-pereira/"]'),
    ).toHaveText('linkedin.com/in/diogo-marques-pereira')
  })
})
