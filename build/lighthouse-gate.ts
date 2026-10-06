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

/**
 * Cloudflare serves every workers.dev preview with `X-Robots-Tag: noindex`, so
 * Lighthouse's is-crawlable audit fails on a preview by construction and takes
 * 31% of the SEO category with it. Skipping it lets the other nine SEO audits
 * be measured on the artefact that actually ships; the category rescales over
 * the audits that remain.
 *
 * What this gives up is covered below by assertIndexable, which is the half a
 * pull request can actually break. The response header and robots.txt are
 * deploy configuration rather than anything a branch changes, and belong in
 * the release checklist.
 */
const SKIPPED_AUDITS = ['is-crawlable']

/** Reported for any route that misses the performance threshold. */
const METRICS = [
  'largest-contentful-paint',
  'first-contentful-paint',
  'total-blocking-time',
  'cumulative-layout-shift',
  'speed-index',
] as const

const baseUrl = process.env.LIGHTHOUSE_BASE_URL
if (!baseUrl) {
  console.log(
    'LIGHTHOUSE_BASE_URL is not set. This gate measures a deployed URL, not a local build.\n' +
      'Example: LIGHTHOUSE_BASE_URL=https://diogo-pereira.dev node build/lighthouse-gate.ts',
  )
  process.exit(1)
}

type RouteResult = {
  route: string
  scores: Record<keyof typeof THRESHOLDS, number>
  scriptBytes: number
  metrics: Record<string, string>
}

const median = (values: number[]): number =>
  [...values].sort((a, b) => a - b)[Math.floor(values.length / 2)]!

/**
 * Fails when the page asks robots not to index it. Independent of Lighthouse on
 * purpose: this is the assertion standing in for the audit skipped above, and
 * deriving it from the same run would make it circular.
 *
 * Matches a meta tag only. An X-Robots-Tag header is not checked here because
 * the preview always carries one, which is the reason this function exists.
 */
async function assertIndexable(url: string): Promise<string | null> {
  const response = await fetch(url)
  if (!response.ok) return `${url} returned HTTP ${response.status}`

  const html = await response.text()
  const metas = html.matchAll(/<meta\s+[^>]*name=["'](robots|googlebot)["'][^>]*>/gi)
  for (const [tag, name] of metas) {
    const content = /content=["']([^"']*)["']/i.exec(tag)?.[1] ?? ''
    if (/\bnoindex\b/i.test(content)) {
      return `declares <meta name="${name}" content="${content}">, which asks search engines not to index it`
    }
  }
  return null
}

async function measure(url: string, port: number): Promise<Omit<RouteResult, 'route'>> {
  const perRun: {
    scores: Record<string, number>
    scriptBytes: number
    metrics: Record<string, number>
  }[] = []

  for (let i = 0; i < RUNS; i++) {
    // Lighthouse defaults to mobile emulation and simulated throttling, which
    // is what the Definition of Done asks for. Left unset rather than
    // configured: fewer settings is less to drift.
    const result = await lighthouse(url, {
      port,
      output: 'json',
      logLevel: 'error',
      skipAudits: SKIPPED_AUDITS,
    })
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

    const metrics: Record<string, number> = {}
    for (const metric of METRICS) {
      metrics[metric] = result.lhr.audits[metric]?.numericValue ?? Number.NaN
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

    perRun.push({ scores, scriptBytes, metrics })
  }

  const scores = {} as Record<keyof typeof THRESHOLDS, number>
  for (const key of Object.keys(THRESHOLDS) as (keyof typeof THRESHOLDS)[]) {
    scores[key] = median(perRun.map((run) => run.scores[key]!))
  }

  const metrics: Record<string, string> = {}
  for (const metric of METRICS) {
    const value = median(perRun.map((run) => run.metrics[metric]!))
    metrics[metric] =
      metric === 'cumulative-layout-shift' ? value.toFixed(3) : `${Math.round(value)} ms`
  }

  return { scores, scriptBytes: median(perRun.map((run) => run.scriptBytes)), metrics }
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

    const indexingProblem = await assertIndexable(url)
    if (indexingProblem) failures.push(`${route}  ${indexingProblem}`)

    const { scores, scriptBytes, metrics } = await measure(url, chrome.port)
    results.push({ route, scores, scriptBytes, metrics })

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

// Everything goes to stdout. Splitting the table and the failures across two
// streams let the CI log interleave them into nonsense.
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
  `\nMedian of ${RUNS} runs per route. Budget ${MAX_SCRIPT_BYTES.toLocaleString()} bytes.` +
    `\nSkipped audits: ${SKIPPED_AUDITS.join(', ')}.`,
)

// A score is not a diagnosis. Any route that missed the performance threshold
// prints the metrics behind it, so a red build says what to go and look at.
const slow = results.filter((result) => result.scores.performance < THRESHOLDS.performance)
if (slow.length > 0) {
  console.log('\nMetrics for routes below the performance threshold:')
  for (const { route, metrics } of slow) {
    console.log(`\n  ${route}`)
    for (const metric of METRICS) {
      console.log(`    ${metric.padEnd(26)}${metrics[metric]}`)
    }
  }
}

if (failures.length > 0) {
  console.log(`\n${failures.length} threshold failure(s):`)
  for (const failure of failures) console.log(`  ${failure}`)
  process.exit(1)
}

console.log('\nLighthouse gate passed.')
