// ============================================================
// FanFare — automated accessibility gate.
//
// Serves the production build, drives a real browser through every core
// screen (landing → login → register → all three role dashboards), runs
// axe-core against WCAG 2.1 A/AA on each, and exits non-zero on ANY
// violation. This turns the manual WCAG contrast pass into a permanent,
// CI-enforced guarantee: a style tweak that regresses contrast or ARIA
// fails the build instead of shipping.
//
// External hosts are blocked at the network layer, so the audit also
// exercises the app's honest offline states and never flakes on a slow
// third-party API.
//
// Usage: npm run build && node scripts/a11y-gate.mjs
// ============================================================

import { readFile } from 'node:fs/promises'
import { existsSync } from 'node:fs'
import { preview } from 'vite'
import { chromium } from 'playwright-core'

const WCAG_TAGS = ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa']

if (!existsSync(new URL('../dist/index.html', import.meta.url))) {
  console.error('dist/ not found — run `npm run build` first.')
  process.exit(1)
}

// playwright-core ships no browser binary. Prefer a downloaded chromium
// (CI installs one), then fall back to the branded browsers present on
// any dev machine.
async function launchBrowser() {
  const candidates = [undefined, 'chrome', 'msedge']
  let lastErr
  for (const channel of candidates) {
    try {
      return await chromium.launch(channel ? { channel } : {})
    } catch (e) { lastErr = e }
  }
  throw lastErr
}

const axeSource = await readFile(
  new URL('../node_modules/axe-core/axe.min.js', import.meta.url), 'utf8',
)

const server = await preview({ preview: { port: 0, host: '127.0.0.1' } })
const origin = server.resolvedUrls.local[0].replace(/\/$/, '')

const browser = await launchBrowser()
const page = await browser.newPage({ viewport: { width: 1280, height: 900 } })
await page.emulateMedia({ reducedMotion: 'reduce' })

// Determinism: only the app itself may load. Everything external is cut,
// which forces the honest "feed unavailable / assistant offline" states.
await page.route('**/*', route =>
  route.request().url().startsWith(origin) ? route.continue() : route.abort(),
)

let totalViolations = 0

async function audit(name) {
  // Let lazy chunks and entry animations settle before judging the DOM.
  await page.waitForLoadState('networkidle').catch(() => {})
  await page.waitForTimeout(600)
  await page.addScriptTag({ content: axeSource })
  const result = await page.evaluate(async tags => {
    return await window.axe.run(document, { runOnly: { type: 'tag', values: tags } })
  }, WCAG_TAGS)

  if (result.violations.length === 0) {
    console.log(`  PASS  ${name}`)
    return
  }
  totalViolations += result.violations.length
  console.error(`  FAIL  ${name} — ${result.violations.length} violation(s)`)
  for (const v of result.violations) {
    console.error(`        [${v.impact}] ${v.id}: ${v.help}`)
    for (const node of v.nodes.slice(0, 5)) {
      console.error(`          ${node.target.join(' ')}`)
    }
  }
}

const clickText = async text => {
  await page.getByText(text, { exact: true }).first().click()
}

// "Enter FanFare" leads to sign-up; the login screen requires credentials
// before any portal opens, so the audit signs in the way a user would.
const signIn = async (roleButton, continueLabel) => {
  await page.goto(`${origin}/`)
  await clickText('Log in')
  if (roleButton) await clickText(roleButton)
  await page.getByPlaceholder('Email address').fill('a11y@example.com')
  await page.getByPlaceholder('Password').fill('audit-pass-1')
  await clickText(continueLabel)
  await page.waitForSelector('nav[aria-label]')
}

try {
  console.log(`Auditing against ${WCAG_TAGS.join(', ')}\n`)

  await page.goto(`${origin}/`)
  await audit('landing')

  await clickText('Enter FanFare')
  await audit('register')

  await clickText('Log in')
  await audit('login')

  await signIn(null, 'Continue as a Fan')
  await audit('fan dashboard')

  await signIn('Staff', 'Continue as Staff')
  await audit('staff dashboard')

  await signIn('Organizer', 'Continue as an Organizer')
  await audit('organizer dashboard')
} finally {
  await browser.close()
  await new Promise(r => server.httpServer.close(r))
}

if (totalViolations > 0) {
  console.error(`\n${totalViolations} accessibility violation(s). Failing.`)
  process.exit(1)
}
console.log('\nAll screens pass WCAG 2.1 A/AA. ✔')
