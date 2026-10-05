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
