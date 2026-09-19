import { defineConfig, devices } from '@playwright/test'

// ADR-006: these tests assert properties of a real deployment, so they need a
// URL rather than a local dev server. In CI that is the per-pull-request
// preview from #12. Locally, point it at any deployed URL:
//
//   PLAYWRIGHT_BASE_URL=https://diogo-pereira.dev pnpm test:e2e
//
// There is deliberately no webServer block. `nuxt preview` serves the Nitro
// server output, and ADR-002 produces no server output at all, so there is
// nothing for it to serve.
const baseURL = process.env.PLAYWRIGHT_BASE_URL

if (!baseURL) {
  throw new Error(
    'PLAYWRIGHT_BASE_URL is not set. These tests run against a deployed URL, not a local server.\n' +
      'Example: PLAYWRIGHT_BASE_URL=https://diogo-pereira.dev pnpm test:e2e',
  )
}

export default defineConfig({
  testDir: './tests/e2e',
  fullyParallel: true,

  // A stray .only would silently skip every other test. Fail the run instead.
  forbidOnly: !!process.env.CI,

  // One retry absorbs a transient CDN or network blip. It does not hide a
  // genuinely flaky test: something failing half the time still fails both
  // attempts often enough to show up.
  retries: process.env.CI ? 1 : 0,

  reporter: [['list'], ['html', { open: 'never' }]],

  use: {
    baseURL,
    trace: 'retain-on-failure',
  },

  projects: [
    // NFR-09 names four browser engines. A compatibility requirement verified
    // on one engine is not verified, so all three Playwright engines run.
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
      testIgnore: /no-javascript\.spec\.ts/,
    },
    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'] },
      testIgnore: /no-javascript\.spec\.ts/,
    },
    {
      name: 'webkit',
      use: { ...devices['Desktop Safari'] },
      testIgnore: /no-javascript\.spec\.ts/,
    },

    // NFR-03: every route must be readable with client-side JavaScript off.
    // One engine is enough — this tests the server response, not the renderer.
    {
      name: 'no-javascript',
      use: { ...devices['Desktop Chrome'], javaScriptEnabled: false },
      testMatch: /no-javascript\.spec\.ts/,
    },
  ],
})
