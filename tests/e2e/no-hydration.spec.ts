import { test, expect } from '@playwright/test'
import { ROUTES } from './routes'

/**
 * US-50, ADR-015. No prerendered route ships framework JavaScript.
 *
 * Every page here is rendered to complete HTML at build time and nothing on
 * the site is interactive, so the hydration payload was buying nothing. This
 * asserts the property rather than trusting a configuration flag: remove
 * `noScripts` from nuxt.config.ts and these tests go red, which is the only
 * reason the flag can be relied on.
 *
 * It asserts on first-party scripts specifically. The analytics beacon of
 * US-47 is served from another origin and is governed by the allowlist in
 * privacy.spec.ts, so this stays true when that lands -- a check written as
 * "no scripts at all" would have had to be weakened the moment it did, which
 * is the failure the allowlist was built to avoid.
 */
test.describe('prerendered routes ship no framework JavaScript', () => {
  for (const route of ROUTES) {
    test(`${route} requests no first-party script`, async ({ page, baseURL }) => {
      const ownHost = new URL(baseURL!).host
      const scripts: string[] = []

      page.on('request', (request) => {
        if (request.resourceType() !== 'script') return
        const url = new URL(request.url())
        if (url.host !== ownHost) return
        scripts.push(url.pathname)
      })

      await page.goto(route, { waitUntil: 'networkidle' })
      expect(scripts, 'the page requested first-party JavaScript').toEqual([])
    })
  }

  // The error page is prerendered by ADR-011's hook rather than by the normal
  // route pipeline, so it is the one most likely to be missed by a route rule
  // and is checked by name.
  test('an unknown route requests no first-party script', async ({ page, baseURL }) => {
    const ownHost = new URL(baseURL!).host
    const scripts: string[] = []

    page.on('request', (request) => {
      if (request.resourceType() !== 'script') return
      const url = new URL(request.url())
      if (url.host !== ownHost) return
      scripts.push(url.pathname)
    })

    const response = await page.goto('/a-route-that-does-not-exist', {
      waitUntil: 'networkidle',
    })
    expect(response?.status()).toBe(404)
    expect(scripts, 'the error page requested first-party JavaScript').toEqual([])
  })
})
