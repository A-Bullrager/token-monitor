// Number-fit check. The showcase and the language suite only ever show the
// demo account, whose numbers are comfortably short. A real balance can be
// ¥99,999,999.99, a token count can reach 亿 / billions, a runway can print
// 999+, and a model id can be long. This drives those magnitudes through the
// real render path in every shipped language and measures whether any number
// escapes the box it was laid out for.
//
// It mutates the page's own state and calls the app's own render functions, so
// what is measured is the product's formatting (万/亿, compact notation, the
// runway type-scaler) and the product's CSS, not a reimplementation here.
import assert from 'node:assert/strict'
import { spawn } from 'node:child_process'
import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import { createRequire } from 'node:module'
import { fileURLToPath } from 'node:url'

const require = createRequire(import.meta.url)
const electronBinary = require('electron')
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const i18n = require(path.join(root, 'renderer', 'i18n.js'))
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms))
const keepShots = process.argv.includes('--keep-shots') || process.argv.includes('--all-shots')
// --only=<locale> and --all-shots exist for looking at one language's worst
// case: a measurement that passes can still produce numbers too small to read.
const only = (process.argv.find((arg) => arg.startsWith('--only=')) || '').split('=')[1]
const shotDir = keepShots
  ? path.join(root, 'shots', 'numbers')
  : fs.mkdtempSync(path.join(os.tmpdir(), 'token-monitor-numbers-'))
const profileParent = fs.mkdtempSync(path.join(os.tmpdir(), 'tm-numbers-'))
fs.mkdirSync(shotDir, { recursive: true })

// A ladder of digit counts, not a random sample: the point is that every width
// a slot can be handed is measured at least once. Values are written as paths
// into the data object the renderer already uses.
const FIXTURES = [
  {
    name: 'demo baseline',
    ops: []
  },
  {
    name: 'cents',
    ops: [
      ['balance.total', 0.01], ['balance.topup', 0], ['balance.grant', 0.01],
      ['usage.today.cost', 0.01], ['usage.today.tokens', 7],
      ['usage.last30.cost', 0.03], ['usage.last30.tokens', 999],
      ['usage.last30.activeDays', 1], ['usage.last30.requests', 1],
      ['usage.dailyAvg', 0.01], ['usage.avg7', 0.01],
      ['usage.daysLeft', 0.04], ['usage.daysLeft7', 0.04],
      ['usage.effectivePrice', 0.001], ['usage.cacheHitRate', 0],
      ['usage.peak.cost', 0.01]
    ]
  },
  {
    name: 'single digits',
    ops: [
      ['balance.total', 9], ['balance.topup', 4], ['balance.grant', 5],
      ['usage.today.cost', 9], ['usage.today.tokens', 1234],
      ['usage.last30.cost', 9], ['usage.last30.tokens', 1234],
      ['usage.last30.activeDays', 1], ['usage.last30.requests', 9],
      ['usage.dailyAvg', 9], ['usage.avg7', 9],
      ['usage.daysLeft', 1], ['usage.daysLeft7', 1],
      ['usage.effectivePrice', 9], ['usage.cacheHitRate', 100],
      ['usage.peak.cost', 9]
    ]
  },
  {
    name: 'thousands',
    ops: [
      ['balance.total', 1234.56], ['balance.topup', 999.99], ['balance.grant', 234.57],
      ['usage.today.cost', 1234.56], ['usage.today.tokens', 12345],
      ['usage.last30.cost', 12345.67], ['usage.last30.tokens', 123456],
      ['usage.last30.activeDays', 12], ['usage.last30.requests', 1866],
      ['usage.dailyAvg', 411.52], ['usage.avg7', 1763.67],
      ['usage.daysLeft', 3], ['usage.daysLeft7', 0.7],
      ['usage.effectivePrice', 1234.56], ['usage.cacheHitRate', 7.9],
      ['usage.peak.cost', 1234.56]
    ]
  },
  {
    name: 'hundred thousands',
    ops: [
      ['balance.total', 123456.78], ['balance.topup', 99999.99], ['balance.grant', 23456.79],
      ['usage.today.cost', 12345.67], ['usage.today.tokens', 999999],
      ['usage.last30.cost', 123456.78], ['usage.last30.tokens', 1234567],
      ['usage.last30.activeDays', 30], ['usage.last30.requests', 123456],
      ['usage.dailyAvg', 4115.23], ['usage.avg7', 17636.68],
      ['usage.daysLeft', 30], ['usage.daysLeft7', 7],
      ['usage.effectivePrice', 9876.54], ['usage.cacheHitRate', 61.8],
      ['usage.peak.cost', 12345.67]
    ]
  },
  {
    name: 'millions',
    ops: [
      ['balance.total', 1234567.89], ['balance.topup', 999999.99], ['balance.grant', 234567.9],
      ['usage.today.cost', 123456.78], ['usage.today.tokens', 12345678],
      ['usage.last30.cost', 1234567.89], ['usage.last30.tokens', 109600000],
      ['usage.last30.activeDays', 30], ['usage.last30.requests', 1234567],
      ['usage.dailyAvg', 41152.26], ['usage.avg7', 176366.84],
      ['usage.daysLeft', 30], ['usage.daysLeft7', 7],
      ['usage.effectivePrice', 12345.67], ['usage.cacheHitRate', 99.9],
      ['usage.peak.cost', 123456.78]
    ]
  },
  {
    name: 'eight figures',
    ops: [
      ['balance.total', 99999999.99], ['balance.topup', 90000000], ['balance.grant', 9999999.99],
      ['usage.today.cost', 9999999.99], ['usage.today.tokens', 999000000],
      ['usage.last30.cost', 99999999.99], ['usage.last30.tokens', 9990000000],
      ['usage.last30.activeDays', 30], ['usage.last30.requests', 987654321],
      ['usage.dailyAvg', 3333333.33], ['usage.avg7', 14285714.28],
      ['usage.daysLeft', 99999.9], ['usage.daysLeft7', 7000.4],
      ['usage.effectivePrice', 99999.99], ['usage.cacheHitRate', 100],
      ['usage.peak.cost', 9999999.99]
    ]
  },
  {
    // Past the floor of the type-scaler on purpose: the check should know
    // where the instrument stops absorbing digit count, not just that it
    // handles the plausible range. Advisory — the known overflow is asserted
    // below as a documented limit, and any *other* slot breaking here still
    // fails the run.
    advisory: true,
    name: 'eleven figures',
    ops: [
      ['balance.total', 99999999999.99], ['balance.topup', 90000000000], ['balance.grant', 9999999999.99],
      ['usage.today.cost', 99999999999.99], ['usage.today.tokens', 999000000000],
      ['usage.last30.cost', 99999999999.99], ['usage.last30.tokens', 999000000000],
      ['usage.last30.activeDays', 30], ['usage.last30.requests', 98765432109],
      ['usage.dailyAvg', 3333333333.33], ['usage.avg7', 14285714285.71],
      ['usage.effectivePrice', 99999999.99], ['usage.peak.cost', 99999999999.99]
    ]
  },
  {
    name: 'long model ids',
    ops: [
      ['usage.models', [
        { name: 'deepseek-chat-2026-04-30-preview', cost: 123456.78, tokens: 98765432,
          requests: 123456, cacheHitRate: 61.8, cacheHitTokens: 12345678 },
        { name: 'deepseek-reasoner', cost: 98765.43, tokens: 1234567, requests: 987,
          cacheHitRate: 7.9, cacheHitTokens: 12345 }
      ]]
    ]
  },
  {
    name: 'month boundary dates',
    ops: [
      ['usage.monthLabel', '2026 年 12 月'],
      ['usage.peak.date', '2026-12-31'],
      ['usage.series', Array.from({ length: 30 }, (_, index) => ({
        date: `2026-12-${String(index + 1).padStart(2, '0')}`,
        cost: 10000 + index,
        tokens: 123456789,
        requests: 123456
      }))]
    ]
  }
]

// The measurement used by the language suite, kept here in the same shape:
// text that does not fit its own box, or that runs past the nearest ancestor
// allowed to clip it.
const MEASURE = `(() => {
  const out = []
  const visible = (el) => {
    if (!el || !el.getClientRects().length) return false
    for (let node = el; node; node = node.parentElement) {
      const style = getComputedStyle(node)
      if (node.hidden || style.display === 'none' || style.visibility === 'hidden' || Number(style.opacity) === 0) return false
    }
    return true
  }
  const limitOf = (el) => {
    for (let node = el; node; node = node.parentElement) {
      const style = getComputedStyle(node)
      if (style.overflowX === 'visible' && style.textOverflow !== 'ellipsis') continue
      const box = node.getBoundingClientRect()
      return box.right - (parseFloat(style.paddingRight) || 0)
    }
    return window.innerWidth
  }
  for (const el of document.querySelectorAll('body *')) {
    if (!visible(el) || el.namespaceURI !== 'http://www.w3.org/1999/xhtml') continue
    const own = [...el.childNodes].filter((n) => n.nodeType === 3)
      .map((n) => n.nodeValue.trim()).join(' ').trim()
    if (!own) continue
    const overflowed = el.scrollWidth > el.clientWidth + 1
    const pastEdge = el.getBoundingClientRect().right > limitOf(el) + 1
    if (!overflowed && !pastEdge) continue
    out.push({
      where: el.id || (typeof el.className === 'string' && el.className.split(' ')[0]) || el.tagName,
      text: own.slice(0, 60),
      // Without these, a remote failure on a runner nobody has locally is a
      // guess: the inline size shows whether the app's own fitting ran, and
      // client/scroll show what it measured against.
      fit: el.style.fontSize || 'none',
      size: getComputedStyle(el).fontSize,
      box: [el.clientWidth, el.scrollWidth],
      pixels: Math.round(Math.max(overflowed ? el.scrollWidth - el.clientWidth : 0,
        el.getBoundingClientRect().right - limitOf(el)))
    })
  }
  return out
})()`

// Apply the fixture through the app's own code path, then render.
const APPLY = (name, ops) => `(() => {
  const set = (target, dotted, value) => {
    const parts = dotted.split('.')
    let node = target
    for (const part of parts.slice(0, -1)) node = node[part] = node[part] ?? {}
    node[parts.at(-1)] = value
  }
  const clone = JSON.parse(JSON.stringify(window.__tmBaseline))
  // Named rather than a bare literal: a statement that starts with an opening
  // bracket would be read as a subscript of the line above it.
  const ops = ${JSON.stringify(ops)}
  ops.forEach(([dotted, value]) => set(clone, dotted, value))
  state.data = clone
  state.config = { ...state.config, intervalSec: 0 }
  if (state.refreshTimer) clearTimeout(state.refreshTimer)
  renderStrip()
  renderDeck()
  renderStatus()
  return ${JSON.stringify(name)}
})()`

const results = []

async function runOne(locale, view) {
  const label = `${locale}/${view}`
  const profileDir = path.join(profileParent, `${label} 中文 数字`)
  fs.mkdirSync(profileDir, { recursive: true })
  const env = { ...process.env }
  delete env.ELECTRON_RUN_AS_NODE
  const args = [root, '--remote-debugging-port=0', `--user-data-dir=${profileDir}`,
    `--locale=${locale}`]
  // Not `--shot=`: that mode captures one image and calls app.exit(), so the
  // fixture loop would be racing a shutdown. A normal window is driven the way
  // a user drives it — by expanding and collapsing.
  const child = spawn(electronBinary, args, { cwd: root, env, stdio: ['ignore', 'pipe', 'pipe'] })
  let output = ''
  for (const stream of [child.stdout, child.stderr]) {
    stream.on('data', (chunk) => { output = (output + String(chunk)).slice(-16000) })
  }
  const entry = { label, locale, view, fixtures: {} }
  results.push(entry)
  let ws = null
  let nextId = 1
  const pending = new Map()
  const call = (method, params = {}) => new Promise((resolve, reject) => {
    const id = nextId++
    pending.set(id, { resolve, reject })
    ws.send(JSON.stringify({ id, method, params }))
    setTimeout(() => {
      if (pending.has(id)) { pending.delete(id); reject(new Error(`CDP timeout: ${method}`)) }
    }, 20000)
  })
  const evaluate = async (expression) => {
    const result = await call('Runtime.evaluate', { expression, returnByValue: true, awaitPromise: true })
    if (result.exceptionDetails) {
      throw new Error(result.exceptionDetails.exception?.description || result.exceptionDetails.text || 'evaluation failed')
    }
    return result.result?.value
  }
  try {
    const target = await (async () => {
      const deadline = Date.now() + 30000
      while (Date.now() < deadline) {
        const port = output.match(/DevTools listening on ws:\/\/127\.0\.0\.1:(\d+)\//)?.[1]
        if (port) {
          try {
            const list = await (await fetch(`http://127.0.0.1:${port}/json/list`,
              { signal: AbortSignal.timeout(1000) })).json()
            const hit = list.find((item) => item.type === 'page' && item.url.includes('renderer/index.html'))
            if (hit) return hit
          } catch { /* not up yet */ }
        }
        await sleep(200)
      }
      throw new Error(`${label}: no debugger target\n${output}`)
    })()
    ws = new WebSocket(target.webSocketDebuggerUrl)
    await new Promise((resolve, reject) => {
      ws.addEventListener('open', resolve, { once: true })
      ws.addEventListener('error', reject, { once: true })
    })
    ws.addEventListener('message', (event) => {
      const message = JSON.parse(String(event.data))
      if (!message.id || !pending.has(message.id)) return
      const waiter = pending.get(message.id)
      pending.delete(message.id)
      if (message.error) waiter.reject(new Error(message.error.message))
      else waiter.resolve(message.result)
    })
    await call('Runtime.enable')
    // Capturing without fromSurface waits for a painted surface that a
    // background window may never produce, which hangs the run.
    await call('Page.enable')
    // The debugger target exists before app.js has run, and `state` is a
    // top-level lexical binding that only exists once it has. Snapshotting
    // without waiting produced "state is not defined" on a working page.
    for (let deadline = Date.now() + 30000;;) {
      const ready = await evaluate('(() => typeof state !== "undefined" && !!state.data && !!state.config)()')
      if (ready) break
      if (Date.now() > deadline) throw new Error(`${label}: the page never finished booting\n${output}`)
      await sleep(150)
    }
    // Reach the form under test the way a user does, and wait for the morph to
    // settle: measuring mid-animation would report the wrong boxes.
    await evaluate(`(() => {
      const deck = ${JSON.stringify(view)} === 'deck'
      if (deck && document.body.classList.contains('view-strip')) document.querySelector('.strip-main').click()
      else if (!deck && document.body.classList.contains('view-deck')) document.querySelector('.deck-head [data-action="collapse"]').click()
      return true
    })()`)
    for (let deadline = Date.now() + 20000;;) {
      const settled = await evaluate(`document.body.classList.contains(${JSON.stringify('view-' + view)}) && !document.body.classList.contains('morphing')`)
      if (settled) break
      if (Date.now() > deadline) throw new Error(`${label}: never reached the ${view} form\n${output}`)
      await sleep(150)
    }
    await evaluate('(() => { window.__tmBaseline = JSON.parse(JSON.stringify(state.data)); return true })()')
    for (const fixture of FIXTURES) {
      await evaluate(APPLY(fixture.name, fixture.ops))
      // Measure the settled page. Webfonts reflow text after the first paint,
      // and a fit decided against the fallback metrics is the bug this check
      // exists to catch — macOS reported exactly that as a phantom overflow.
      await evaluate('document.fonts.ready.then(() => true)')
      await sleep(120) // Let the language mirror settle after the re-render.
      // Prove the fitter actually ran, not just that the page looks fine: a
      // silent no-op on another platform would otherwise pass by luck until a
      // wider font made the same number overflow again.
      if (fixture.name === 'millions') {
        const engaged = await evaluate(`(() => {
          const node = document.getElementById('stripToday')
          return {
            shown: !!node && node.getClientRects().length > 0,
            inline: node?.style.fontSize || '',
            size: node ? getComputedStyle(node).fontSize : ''
          }
        })()`)
        // Only assert where the element is actually laid out: in the deck form
        // the strip is display:none, so fitting correctly does nothing there.
        if (engaged.shown) {
          assert.ok(engaged.inline !== '' && parseFloat(engaged.size) < 16,
            `${label}: the ¥123,456.78 figure was never shrunk (inline ${JSON.stringify(engaged.inline)}, computed ${engaged.size})`)
        }
      }
      // Fitting must be invisible until it is needed: if the demo account
      // already triggered a shrink, the shipped look has changed under everyone.
      if (fixture.name === 'demo baseline') {
        const shrunk = await evaluate(`(() => {
          const ids = ['stripToday', 'stripBalance', 'deckBalance', 'deckBalanceSub']
          return ids.filter((id) => {
            const node = document.getElementById(id)
            return node && node.style.fontSize !== ''
          })
        })()`)
        assert.deepEqual(shrunk, [], `${label}: the demo values already needed a font-size override`)
      }
      const clipped = await evaluate(MEASURE)
      const widest = await evaluate(`(() => {
        const read = (id) => document.getElementById(id)?.textContent?.trim() || ''
        return { balance: read('deckBalance') || read('stripBalance'),
          runway: read('deckRunway') || read('stripRunway'),
          tokens: read('deckTokens') || read('stripTokens'),
          thirty: read('deckThirty'), volume: read('deckVolume') }
      })()`)
      entry.fixtures[fixture.name] = { clipped, widest }
      // Screenshots exist to eyeball what the measurement claims. Capturing
      // every fixture stalled the debugger between runs, so take the ones that
      // answer "does the shrink look sane?" plus anything that overflowed.
      const notable = ['demo baseline', 'eight figures', 'long model ids'].includes(fixture.name)
      if (keepShots && (clipped.length || (process.argv.includes('--all-shots') && notable))) {
        const shot = await call('Page.captureScreenshot', { format: 'png', fromSurface: true })
        fs.writeFileSync(path.join(shotDir, `${label.replace(/[^\w-]+/g, '-')} ${fixture.name}.png`),
          Buffer.from(shot.data, 'base64'))
      }
    }
  } finally {
    try { ws?.close() } catch { /* already gone */ }
    if (child.exitCode === null) child.kill()
    // Never let cleanup be the thing that hangs: an Electron child can keep
    // the stdio pipes open after the main process is gone, and a finally block
    // that waits forever hides the error that brought us here.
    await Promise.race([
      new Promise((resolve) => child.once('close', resolve)),
      new Promise((resolve) => setTimeout(resolve, 3000))
    ])
  }
  return entry
}

console.log(`Number fit: ${(only ? [only] : i18n.LOCALES).length} languages × 2 forms × ${FIXTURES.length} magnitudes`)
if (only && !i18n.LOCALES.includes(only)) throw new Error(`unknown locale "${only}"; shipped: ${i18n.LOCALES.join(', ')}`)
for (const locale of (only ? i18n.LOCALES.filter((item) => item === only) : i18n.LOCALES)) {
  for (const view of ['deck', 'strip']) await runOne(locale, view)
}

const offenders = results.flatMap((run) => Object.entries(run.fixtures)
  .flatMap(([fixture, seen]) => (seen.clipped || []).map((item) => ({
    // `item.where` is the element; the run and fixture have to travel under
    // their own keys or the spread overwrites them.
    slot: item.where, text: item.text, pixels: item.pixels,
    run: run.label, fixture, at: `${run.label} · ${fixture}`
  }))))
const advisoryNames = new Set(FIXTURES.filter((fixture) => fixture.advisory).map((fixture) => fixture.name))
const unexpected = offenders.filter((item) => !advisoryNames.has(item.fixture))
const atTheLimit = offenders.filter((item) => advisoryNames.has(item.fixture))

// The measured limit, not a passed test: at ¥99,999,999,999.99 a day the
// strip's today figure is the one place the type floor gives out — the ledger
// still shows it. Asserting the exact set keeps that honest: a *new* slot
// breaking at the extreme, or this one silently getting worse elsewhere, fails.
const limitSlots = [...new Set(atTheLimit.map((item) => `${item.run} ${item.slot}`))].sort()
// Derived from the runs that happened, so --only=<locale> stays honest.
const expectedLimit = [...new Set(results.map((run) => run.label))]
  .filter((label) => label.endsWith('/strip'))
  .map((label) => `${label} stripToday`)
  .sort()
assert.deepEqual(unexpected, [],
  `${unexpected.length} numbers escape their box: ${JSON.stringify(unexpected.slice(0, 12))}`)
assert.deepEqual(limitSlots, expectedLimit,
  `the extreme fixture was expected to overflow exactly the strip's today figure, got ${JSON.stringify(limitSlots)}`)
const widest = {}
for (const run of results) {
  for (const [fixture, seen] of Object.entries(run.fixtures)) {
    for (const [slot, text] of Object.entries(seen.widest || {})) {
      if (!text) continue
      const key = `${run.label.split('/')[1]} ${slot}`
      if (!widest[key] || String(text).length > String(widest[key]).length) widest[key] = text
    }
  }
}

fs.writeFileSync(path.join(root, 'shots', 'numbers-report.json'),
  JSON.stringify({ offenders, limitSlots, widest, runs: results.map((run) => run.label) }, null, 2))

console.log(`Widest observed values: ${JSON.stringify(widest)}`)
console.log(`Documented limit at the extreme fixture: ${JSON.stringify(atTheLimit.map((item) => `${item.run} ${item.pixels}px`))}`)
fs.rmSync(profileParent, { recursive: true, force: true, maxRetries: 5, retryDelay: 200 })
if (!keepShots) fs.rmSync(shotDir, { recursive: true, force: true, maxRetries: 5, retryDelay: 200 })
console.log(`Number fit passed: ${results.length} runs, ${FIXTURES.length} magnitudes each — shots: ${keepShots ? shotDir : 'removed'}`)
