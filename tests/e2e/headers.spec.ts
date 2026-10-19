import { test, expect } from '@playwright/test'
import { ROUTES } from './routes'

/**
 * US-53, NFR-06. The security response headers, asserted on every route.
 *
 * Exact values rather than presence. A header set to the wrong value passes a
 * presence check and protects nothing, which is the failure this project keeps
 * finding in its own controls: configured, reported green, not working.
 *
 * Chromium only, with Firefox and WebKit ignoring this file in
 * playwright.config.ts. These headers are produced by the host, not the
 * renderer, so running the same request through three engines would report one
 * fact as three passes -- the same reasoning written at the top of
 * accessibility.spec.ts. NFR-09 is about rendering compatibility, and a
 * response header is not rendered.
 *
 * Deliberately absent: Content-Security-Policy. ADR-016 records why. This file
 * asserts nothing about it rather than asserting a weakened version that would
 * read as coverage.
 */
const EXPECTED_HEADERS: Readonly<Record<string, string>> = {
  // Trust the declared content type instead of inferring one from the bytes.
  // Without it a browser can decide a response is a script and run it.
  'x-content-type-options': 'nosniff',
  // What a site linked from here is told about where the visitor came from.
  // This is the current browser default stated explicitly, so it is a decision
  // rather than something inherited and so it holds on an older browser.
  'referrer-policy': 'strict-origin-when-cross-origin',
  // An empty allowlist means no origin at all may use the feature, this site
  // included. Three entries, because this site will never use any of them; a
  // longer list copied from elsewhere would be decoration.
  'permissions-policy': 'camera=(), microphone=(), geolocation=()',
}

/**
 * The 404 is a page visitors actually reach, so it carries the headers too.
 * Any path that is not prerendered produces it -- the same path routes.spec.ts
 * uses, kept identical so both tests fail together if not-found handling
 * changes.
 */
const UNKNOWN_ROUTE = '/a-route-that-does-not-exist'

test.describe('every route carries the security response headers', () => {
  for (const route of [...ROUTES, UNKNOWN_ROUTE]) {
    test(`${route} carries all three`, async ({ page }) => {
      const response = await page.goto(route)
      expect(response, `no response for ${route}`).toBeTruthy()

      // Playwright lowercases header names. Falling back to an empty object
      // keeps a missing response reporting as three named missing headers
      // rather than as a thrown error with no detail.
      const headers = response?.headers() ?? {}

      for (const [name, expected] of Object.entries(EXPECTED_HEADERS)) {
        expect(headers[name], `${route} -> ${name}`).toBe(expected)
      }
    })
  }
})

test.describe('the configuration file itself', () => {
  test('_headers is read as configuration, not served as content', async ({ request }) => {
    // Cloudflare documents _headers as configuration for Workers static assets,
    // but does not state that it is withheld from the served output. If it were
    // served, the site would publish its own header configuration at a
    // guessable URL. Asserted rather than assumed.
    const response = await request.get('/_headers')

    expect(response.status(), 'the _headers file is reachable').toBe(404)

    const body = await response.text()
    expect(body, 'the _headers file is being served as content').not.toContain('Permissions-Policy')
  })
})
