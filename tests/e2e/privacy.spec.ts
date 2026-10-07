import { test, expect, type Page } from '@playwright/test'
import { ROUTES } from './routes'

/**
 * US-28. The site's privacy claims, asserted rather than written down.
 *
 * The privacy note in US-29 says this site sets no cookies, stores nothing in
 * the browser, and contacts no third party. Those are three statements about
 * runtime behaviour, and a statement about runtime behaviour that is only
 * checked by reading the source is checked once, by the person least able to
 * be surprised by it. These tests re-check all three on every pull request.
 *
 * Written before the analytics beacon of US-31 lands, deliberately. A test
 * written afterwards can only describe whatever the beacon happens to do;
 * written first, it is an independent statement of what this site is permitted
 * to do, and the beacon has to survive it.
 */

type StorageAttempt = { api: string; detail: string }

declare global {
  interface Window {
    __privacyAttempts?: StorageAttempt[]
  }
}

/**
 * Off-origin hosts this site is allowed to contact, each with the reason.
 *
 * An allowlist rather than a flat "no third-party requests" assertion. A flat
 * assertion has to be deleted the first time a third party is added, which
 * makes it a control that is removed by the change it exists to catch. An
 * entry here survives: adding one is a visible line in a diff, attached to a
 * ticket, reviewed like any other change.
 */
const ALLOWED_THIRD_PARTY_HOSTS: readonly string[] = [
  // US-47, ADR-007. Cloudflare Web Analytics serves beacon.min.js from here.
  // Permitted because it stores nothing on the visitor's device -- which the
  // storage block below asserts directly on every run rather than taking from
  // Cloudflare's documentation, so this entry cannot outlive the claim that
  // justifies it.
  'static.cloudflareinsights.com',
]

/**
 * Wraps the browser's storage APIs before any page script runs, recording
 * every attempt to use them.
 *
 * This catches a write that is made and then removed, which a check of what is
 * left behind afterwards would miss entirely. It is paired with that check
 * rather than replacing it, because the reverse gap also exists: these
 * wrappers can be sidestepped by code that takes a pristine reference from an
 * iframe, and only the residue check would see the result. Neither alone is
 * sufficient; together they have no shared blind spot.
 */
async function recordStorageAttempts(page: Page): Promise<void> {
  await page.addInitScript(() => {
    const attempts: StorageAttempt[] = []
    window.__privacyAttempts = attempts

    const cookie = Object.getOwnPropertyDescriptor(Document.prototype, 'cookie')
    const read = cookie?.get
    const write = cookie?.set
    if (read && write) {
      Object.defineProperty(document, 'cookie', {
        configurable: true,
        get: () => read.call(document),
        set: (value: string) => {
          attempts.push({ api: 'document.cookie', detail: String(value) })
          write.call(document, value)
        },
      })
    }

    const setItem = Storage.prototype.setItem
    Storage.prototype.setItem = function (this: Storage, key: string, value: string) {
      const which = this === window.sessionStorage ? 'sessionStorage' : 'localStorage'
      attempts.push({ api: `${which}.setItem`, detail: String(key) })
      return setItem.call(this, key, value)
    }

    // indexedDB.open is wrapped rather than reading indexedDB.databases()
    // afterwards: databases() reached the three engines at different times and
    // this suite runs on all three, so a check built on it would be silently
    // skipped wherever it is missing rather than failing loudly.
    const factory = window.indexedDB
    if (factory) {
      const open = factory.open
      factory.open = function (name: string, version?: number) {
        attempts.push({ api: 'indexedDB.open', detail: String(name) })
        return open.call(factory, name, version)
      }
    }
  })
}

test.describe('the site stores nothing in the visitor browser', () => {
  for (const route of ROUTES) {
    test(`${route} sets no cookie and writes to no storage`, async ({ page, context }) => {
      // See the note in no-client-database.spec.ts: `networkidle` under full
      // parallel load has been measured within six seconds of the 30-second
      // default, so these tests set their own budget rather than inheriting a
      // margin that is already known to be too thin.
      test.setTimeout(60_000)

      await recordStorageAttempts(page)
      await page.goto(route, { waitUntil: 'networkidle' })

      const attempts = await page.evaluate(() => window.__privacyAttempts ?? [])
      expect(attempts, 'a script tried to use browser storage').toEqual([])

      const residue = await page.evaluate(() => ({
        local: Array.from({ length: localStorage.length }, (_, i) => localStorage.key(i)),
        session: Array.from({ length: sessionStorage.length }, (_, i) => sessionStorage.key(i)),
      }))
      expect(residue.local, 'localStorage is not empty').toEqual([])
      expect(residue.session, 'sessionStorage is not empty').toEqual([])

      // context.cookies() rather than document.cookie: a cookie set by a
      // response header with HttpOnly is invisible to document.cookie by
      // design, so reading it from the page would report "no cookies" for
      // exactly the kind of cookie a visitor cannot inspect or clear himself.
      expect(await context.cookies(), 'a cookie was set').toEqual([])
    })
  }
})

test.describe('the site contacts only itself', () => {
  for (const route of ROUTES) {
    test(`${route} makes no unlisted off-origin request`, async ({ page, baseURL }) => {
      test.setTimeout(60_000)

      const ownHost = new URL(baseURL!).host
      const offenders = new Set<string>()

      page.on('request', (request) => {
        const url = new URL(request.url())
        // data: and blob: URLs never leave the browser, so they are not a
        // third party in any sense this test is about.
        if (url.protocol !== 'http:' && url.protocol !== 'https:') return
        if (url.host === ownHost) return
        if (ALLOWED_THIRD_PARTY_HOSTS.includes(url.host)) return
        offenders.add(url.host)
      })

      await page.goto(route, { waitUntil: 'networkidle' })
      expect([...offenders].sort(), 'an unlisted third party was contacted').toEqual([])
    })
  }
})
