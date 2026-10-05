import lighthouse from 'lighthouse'
import * as chromeLauncher from 'chrome-launcher'
import { ROUTES } from '../tests/e2e/routes.ts'

/**
 * ADR-013. Lighthouse stopped enforcing anything in version 12.0.0 -- budgets
 * and exit codes left core, so it measures and something else asserts. This is
 * that something else.
 *
 * Run: LIGHTHOUSE_BASE_URL=https://... node build/lighthouse-gate.ts
 */

// Thresholds from the Definition of Done. Accessibility is the only 100,
// because WCAG conformance is not a thing you score 97 on.
const THRESHOLDS = {
  performance: 95,
  accessibility: 100,
  'best-practices': 95,
  seo: 95,
} as const

/**
 * Transferred JavaScript per route. Measured against the built site served with
 * compression -- 88,066 bytes on the heaviest route -- plus the 20% headroom
 * NFR-02 asks for. ADR-013 records why this is anchored at M2 rather than M1.
 */
const MAX_SCRIPT_BYTES = 105_000

/**
 * Lighthouse's own variability guidance notes the median of five runs is twice
 * as stable as one. Three is enough here: the rule-based categories do not vary
 * at all, and performance on a prerendered page measured 100 across ten runs.
 * Each run costs roughly six seconds.
 */
const RUNS = 3

const baseUrl = process.env.LIGHTHOUSE_BASE_URL
if (!baseUrl) {
  console.error(
    'LIGHTHOUSE_BASE_URL is not set. This gate measures a deployed URL, not a local build.\n' +
      'Example: LIGHTHOUSE_BASE_URL=https://diogo-pereira.dev node build/lighthouse-gate.ts',
  )
  process.exit(1)
}

type RouteResult = {
  route: string
  scores: Record<keyof typeof THRESHOLDS, number>
  scriptBytes: number
}

const median = (values: number[]): number =>
  [...values].sort((a, b) => a - b)[Math.floor(values.length / 2)]!

async function measure(url: string, port: number): Promise<Omit<RouteResult, 'route'>> {
  const perRun: { scores: Record<string, number>; scriptBytes: number }[] = []

  for (let i = 0; i < RUNS; i++) {
    // Lighthouse defaults to mobile emulation and simulated throttling, which
    // is what the Definition of Done asks for. Left unset rather than
    // configured: fewer settings is less to drift.
    const result = await lighthouse(url, { port, output: 'json', logLevel: 'error' })
    if (!result) throw new Error(`Lighthouse returned nothing for ${url}`)

    const categories = result.lhr.categories
    const scores: Record<string, number> = {}
    for (const key of Object.keys(THRESHOLDS)) {
      const score = categories[key]?.score
      if (score === null || score === undefined) {
        throw new Error(`Lighthouse reported no score for "${key}" on ${url}`)
      }
      scores[key] = Math.round(score * 100)
    }

    // transferSize is what crossed the network, so it reflects the edge's
    // compression. Measuring uncompressed bytes would overstate this several
    // times over and make the budget meaningless.
    const requests = result.lhr.audits['network-requests']?.details
    const items = (requests && 'items' in requests ? requests.items : []) as {
      resourceType?: string
      transferSize?: number
    }[]
    const scriptBytes = items
      .filter((item) => item.resourceType === 'Script')
      .reduce((total, item) => total + (item.transferSize ?? 0), 0)

    perRun.push({ scores, scriptBytes })
  }

  const scores = {} as Record<keyof typeof THRESHOLDS, number>
  for (const key of Object.keys(THRESHOLDS) as (keyof typeof THRESHOLDS)[]) {
    scores[key] = median(perRun.map((run) => run.scores[key]!))
  }

  return { scores, scriptBytes: median(perRun.map((run) => run.scriptBytes)) }
}

const chrome = await chromeLauncher.launch({
  // --no-sandbox is required in CI containers, which do not permit the
  // sandbox's namespace calls. Acceptable here: the browser only ever loads a
  // URL this pipeline just built and deployed, never untrusted input.
  chromeFlags: ['--headless', '--no-sandbox'],
})

const failures: string[] = []
const results: RouteResult[] = []

try {
  for (const route of ROUTES) {
    const url = new URL(route, baseUrl).toString()
    const { scores, scriptBytes } = await measure(url, chrome.port)
    results.push({ route, scores, scriptBytes })

    for (const [category, minimum] of Object.entries(THRESHOLDS)) {
      const score = scores[category as keyof typeof THRESHOLDS]
      if (score < minimum) {
        failures.push(`${route}  ${category} ${score} is below ${minimum}`)
      }
    }

    if (scriptBytes > MAX_SCRIPT_BYTES) {
      failures.push(
        `${route}  script bytes ${scriptBytes.toLocaleString()} exceeds ${MAX_SCRIPT_BYTES.toLocaleString()}`,
      )
    }
  }
} finally {
  await chrome.kill()
}

const header = ['route', ...Object.keys(THRESHOLDS), 'script bytes']
const widths = [34, 12, 14, 15, 5, 13]
console.log(header.map((h, i) => h.padEnd(widths[i]!)).join(''))

for (const { route, scores, scriptBytes } of results) {
  const cells = [
    route,
    ...Object.keys(THRESHOLDS).map((key) => String(scores[key as keyof typeof THRESHOLDS])),
    scriptBytes.toLocaleString(),
  ]
  console.log(cells.map((c, i) => c.padEnd(widths[i]!)).join(''))
}

console.log(
  `\nMedian of ${RUNS} runs per route. Budget ${MAX_SCRIPT_BYTES.toLocaleString()} bytes.`,
)

if (failures.length > 0) {
  console.error(`\n${failures.length} threshold failure(s):`)
  for (const failure of failures) console.error(`  ${failure}`)
  process.exit(1)
}

console.log('\nLighthouse gate passed.')
