import { test, expect } from '@playwright/test'
import { ROUTES } from './routes'

// ADR-012. Nuxt Content was rejected partly because a content query that runs
// in the browser pulls a SQLite engine compiled to WebAssembly — measured at
// 1,248 kB against 205 kB for the same page. The build-time approach cannot do
// that, which is exactly why this test is cheap to keep and worth keeping: it
// fails if anyone reintroduces a content layer that ships a database, and it
// would have caught the problem that ADR-012 only found by measuring.
//
// It asserts on what is requested rather than on what is installed, so it holds
// regardless of which library a future change reaches for.
test.describe('no client-side database is shipped', () => {
  for (const route of ROUTES) {
    test(`${route} requests no WebAssembly or database dump`, async ({ page }) => {
      // Raised from Playwright's 30-second default. This test waits for
      // `networkidle`, which is a claim about the network rather than about the
      // page: it cannot resolve until every request has finished and 500ms have
      // passed quietly. Under the full suite -- 90 tests in parallel against one
      // CDN -- this has been measured at 24s on the heaviest route and has timed
      // out at 30s once.
      //
      // The duration is not what is under test; the set of request URLs is, so
      // raising the timeout does not weaken the assertion by anything. Raising
      // `retries` would have: a retry lets a genuine intermittent failure pass on
      // the second attempt, which is exactly how a flaky gate hides itself. That
      // is why this is fixed in the test and not in the CI configuration.
      test.setTimeout(60_000)

      const offenders: string[] = []

      page.on('request', (request) => {
        const url = request.url()
        if (/\.wasm(\?|$)|sql_dump|sqlite/i.test(url)) {
          offenders.push(url)
        }
      })

      await page.goto(route, { waitUntil: 'networkidle' })
      expect(offenders).toEqual([])
    })
  }
})
