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
// Two controls for the waiting contract, kept because the CI failure they model
// cost six rounds to find. The late metric is applied by default, on the theory
// that a repair path only gets exercised where the suite always runs it: after
// the card has fitted ¥123,456.78, the width of the same text is changed with no
// render and no resize to announce it — the state CI reached on its own — and the
// pass is graded only once the card has re-checked it. --no-late-metrics turns
// that off; --freeze-watch stops the card re-checking at all, which must make the
// check refuse to grade, proving the repair is the product's and not the
// harness's.
const lateMetrics = !process.argv.includes('--no-late-metrics')
const freezeWatch = process.argv.includes('--freeze-watch')
// A wider face than any shipped platform uses, to make the instrument's margin
// visible from one machine: CI's runners read ~5% wider than this one, and a fix
// that only just catches them would otherwise be invisible until the next red
// round. The family is asked for by name so it can be pointed at anything installed.
const wideFonts = (process.argv.find((arg) => arg.startsWith('--wide-fonts=')) || '').split('=')[1]
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
  // The rule lives in the product. renderer/text-fit.js is loaded by index.html
  // and used by the card's own fitNumber, so this check asks exactly the question
  // the card answers — ink past the wall it could hit, the nearest ancestor allowed
  // to clip or the next element on the same line. Having its own copy of the
  // measurement is what let the check and the product disagree for six rounds, and
  // a green run that grades a fiction is worse than a red one. (No backticks in
  // this file's comments: MEASURE is itself a template literal.)
  if (typeof TmTextFit === 'undefined') {
    throw new Error('renderer/text-fit.js is not loaded: the check cannot measure what the card measures')
  }
  for (const el of document.querySelectorAll('body *')) {
    if (!visible(el) || el.namespaceURI !== 'http://www.w3.org/1999/xhtml') continue
    const own = [...el.childNodes].filter((n) => n.nodeType === 3)
      .map((n) => n.nodeValue.trim()).join(' ').trim()
    if (!own) continue
    const verdict = TmTextFit.escape(el)
    if (!verdict.escaped) continue
    out.push({
      where: el.id || (typeof el.className === 'string' && el.className.split(' ')[0]) || el.tagName,
      text: own.slice(0, 60),
      // Without these, a remote failure on a runner nobody has locally is a
      // guess: the inline size shows whether the app's own fitting ran, box shows
      // what it measured against, and ink/ownBox say what the reader actually loses.
      fit: el.style.fontSize || 'none',
      size: getComputedStyle(el).fontSize,
      box: verdict.box,
      ink: verdict.ink,
      ownBox: verdict.ownBox,
      clippedBySelf: verdict.selfClipped,
      pixels: verdict.pixels
    })
  }
  // The engagement witness is captured in the same task as the clip list, not
  // in a second read after it: a later read can describe a different instant,
  // and CI proved that is how a check reports "clean page, number never shrunk"
  // for a card whose metrics moved between the two.
  const node = document.getElementById('stripToday')
  const chain = []
  if (node) {
    for (let walk = node; walk && chain.length < 5; walk = walk.parentElement) {
      const style = getComputedStyle(walk)
      const rect = walk.getBoundingClientRect()
      chain.push({
        el: walk.id || (typeof walk.className === 'string' && walk.className.split(' ')[0]) || walk.tagName,
        ox: style.overflowX, to: style.textOverflow, ws: style.whiteSpace,
        w: Math.round(rect.width), right: Math.round(rect.right)
      })
    }
  }
  return {
    clipped: out,
    // Fitting must stay invisible until it is needed, so the demo account's own
    // overrides are read here rather than in a later pass: same instant, same
    // answer. The witness is the inline attribute, not the used size — several
    // of these slots are 10px and 8.5px in the stylesheet.
    overrides: ['stripToday', 'stripBalance', 'deckBalance', 'deckBalanceSub']
      .map((id) => {
        const item = document.getElementById(id)
        return item && item.style.fontSize !== ''
          ? { id, size: item.style.fontSize, text: item.textContent.trim() }
          : null
      }).filter(Boolean),
    today: node ? {
      shown: node.getClientRects().length > 0,
      text: node.textContent.trim(),
      inline: node.style.fontSize || '',
      size: getComputedStyle(node).fontSize,
      // Both forms of the same fact: the raw attribute and the CSSOM view of it.
      // A runner that reports an inline size the page is not rendering needs
      // those in the artifact, because the difference between "the fitter wrote
      // nothing" and "the page has not recalculated yet" is invisible otherwise.
      css: node.style.cssText,
      attr: node.getAttribute('style') || '',
      client: node.clientWidth, scroll: node.scrollWidth,
      // Distinguishes "the app never called its fitter" (function absent, or
      // renderStrip returned early) from "it called it and concluded the text
      // fits", which the two numbers above cannot tell apart.
      hasFit: typeof fitNumber === 'function',
      // Whether the node the app caches is the node in the document, and what
      // the fitter's own set holds: a detached clone would explain a fit that
      // lands on a number nobody can see.
      cached: el.stripToday === node, cachedConnected: Boolean(el.stripToday?.isConnected),
      fitted: Array.from(typeof fittedNodes === 'undefined' ? [] : fittedNodes.keys())
        .filter((item) => item.id)
        .map((item) => item.id + ':' + (item.isConnected ? 'live' : 'detached')
          + ':' + (fittedNodes.get(item)?.floor ?? '?')),
      ticks: document.documentElement.dataset.numberWatchTicks || '0',
      usage: !!(state.data && state.data.usage),
      chain
    } : { shown: false }
  }
})()`

// How many times the card's standing watch has passed over the numbers. The
// check's waiting contract is expressed in this counter rather than in seconds,
// because the product owns the schedule and this machine may not.
const TICKS = 'Number(document.documentElement.dataset.numberWatchTicks || 0)'

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
  const entry = { label, locale, view, fixtures: {}, findings: [] }
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
    if (freezeWatch) {
      await evaluate('(() => { clearInterval(numberWatch); numberWatch = null; return true })()')
    }
    if (wideFonts) {
      await evaluate(`(() => {
        const style = document.createElement('style')
        style.textContent = 'body, .mono, .today-value, input, select { font-family: ${wideFonts} !important; }'
        document.head.appendChild(style)
        renderStrip()
        renderDeck()
        return true
      })()`)
    }
    // Does the card actually re-check its own numbers? Asked once per window, in
    // the same terms the product offers, so a watch that stopped running is a
    // finding rather than a check that silently grades whatever it first sees.
    // The budget is a several-times-the-interval, not one interval: on a loaded
    // machine a one-second timer can legitimately arrive late, and this suite is
    // not the place to blame the product for the host's schedule.
    const watchStart = await evaluate(TICKS)
    let watchRuns = false
    for (let deadline = Date.now() + 6000; Date.now() < deadline;) {
      await sleep(250)
      if ((await evaluate(TICKS)) > watchStart) { watchRuns = true; break }
    }
    if (!watchRuns) {
      entry.findings.push(`${label}: the standing watch never passed over the numbers within 6s, ` +
        `so a metric that arrives late has nothing that can repair it`)
    }
    for (const fixture of FIXTURES) {
      await evaluate(APPLY(fixture.name, fixture.ops))
      if (lateMetrics && fixture.name === 'millions') {
        // The metric moves after the decision, with no render and no resize to
        // announce it — the state CI reached on its own. Mild on purpose: this
        // must be a shift the card can absorb, not a new way to hit the floor,
        // and it is removed again so only this fixture is measured against it.
        await evaluate(`(() => {
          const style = document.createElement('style')
          style.id = 'late-metrics'
          style.textContent = '.today-value { letter-spacing: 0.03em; }'
          document.head.appendChild(style)
          return true
        })()`)
      }
      // The card re-checks its own numbers once a second, and CI proved that a
      // fit decided before its metrics are final is silently wrong afterwards.
      // So the waiting contract is the product's, not a guessed delay: settle
      // passes over, then the standing watch has passed over *this* state. A
      // clean reading after one pass is a verdict; an overflowing one is not,
      // because the next pass may be the repair — three passes say the overflow
      // is what the product settled on, which is also how the documented limit
      // stays visible instead of turning into a race.
      await evaluate('document.fonts.ready.then(() => true)')
      const ticksAtApply = await evaluate(TICKS)
      const settledNow = "document.documentElement.dataset.numbersSettled === 'settled'"
      const watchPasses = () => evaluate(`${TICKS} - ${ticksAtApply}`)
      let clipped = []
      let overrides = []
      let today = { shown: false }
      let passes = 0
      let graded = false
      const gradeDeadline = Date.now() + 25000
      while (Date.now() < gradeDeadline) {
        await sleep(150)
        if (!await evaluate(settledNow)) continue
        passes = await watchPasses()
        const reading = await evaluate(MEASURE)
        clipped = reading.clipped
        overrides = reading.overrides
        today = reading.today
        if (passes >= 3) { graded = true; break }
        // A clean page is a verdict once the watch has passed over it — or once
        // it is clear the watch will never pass over anything, so the waiting
        // itself cannot become the failure.
        if (!clipped.length && (passes >= 1 || !watchRuns)) { graded = true; break }
      }
      if (!graded) {
        entry.findings.push(`${label} @ ${fixture.name}: the card never reported a settled, re-checked state, ` +
          `so its numbers were never graded — ${JSON.stringify(clipped).slice(0, 400)}`)
      }
      entry.fixtures[fixture.name] = { clipped, overrides, today, passes, graded, watchRuns }
      // Prove the fitter actually ran, not just that the page looks fine: a
      // silent no-op on another platform would otherwise pass by luck until a
      // wider font made the same number overflow again. The witness came from
      // the same snapshot as the clip list, so both describe one instant.
      if (fixture.name === 'millions') {
        // Only grade where the element is actually laid out: in the deck form the
        // strip is display:none, so fitting correctly does nothing there. The
        // witness is the used size, not the inline attribute — a pass can leave
        // the shrink in the cascade with the attribute empty, and CI showed that
        // on one runner. Nothing else in the app puts 11.2px on this element.
        if (today.shown && !(parseFloat(today.size) < 16)) {
          // macOS ARM later reported the opposite shape: the inline attribute said
          // 11.2px, the used size still said 16px, three watch passes after the
          // stress. That is not the same failure as a fitter that never ran, and
          // calling it that sent six earlier rounds looking in the wrong place. So
          // the page is read again two frames later, and only a disagreement that
          // survives the frames is treated as the card really showing an unshrunk
          // number. Both readings go into the report either way.
          const recheck = await evaluate(`new Promise((resolve) => {
            requestAnimationFrame(() => requestAnimationFrame(() => {
              const node = document.getElementById('stripToday')
              resolve(node ? {
                inline: node.style.fontSize,
                size: getComputedStyle(node).fontSize,
                client: node.clientWidth,
                scroll: node.scrollWidth
              } : null)
            }))
          })`)
          const converged = Boolean(recheck) && parseFloat(recheck.size) < 16
          entry.fixtures[fixture.name].fitLag = {
            first: { inline: today.inline, size: today.size, client: today.client, scroll: today.scroll },
            recheck, converged
          }
          if (converged) {
            console.log(`  note: ${label} @ ${fixture.name}: the fit was applied (${today.inline}) but the page still ` +
              `rendered ${today.size} at the grading instant; two frames later it read ${recheck.size}`)
          } else {
            entry.findings.push(`${label} @ ${fixture.name}: the ¥123,456.78 figure was never shrunk, ` +
              `after ${passes} watch passes and again two frames later — ${JSON.stringify(today)} / ${JSON.stringify(recheck)}`)
          }
        }
      }
      // Fitting must be invisible until it is needed: if the demo account
      // already triggered a shrink, the shipped look has changed under everyone.
      // The witness is the inline attribute, not the used size — several of these
      // slots are 10px and 8.5px in the stylesheet, so a computed size below the
      // strip's 16px says nothing about the fitter.
      if (fixture.name === 'demo baseline') {
        if (overrides.length) {
          entry.findings.push(`${label} @ ${fixture.name}: the demo values already needed a font-size ` +
            `override: ${JSON.stringify(overrides)}`)
        }
      }
      const widest = await evaluate(`(() => {
        const read = (id) => document.getElementById(id)?.textContent?.trim() || ''
        return { balance: read('deckBalance') || read('stripBalance'),
          runway: read('deckRunway') || read('stripRunway'),
          tokens: read('deckTokens') || read('stripTokens'),
          thirty: read('deckThirty'), volume: read('deckVolume') }
      })()`)
      Object.assign(entry.fixtures[fixture.name], { clipped, widest })
      if (lateMetrics) {
        // Take the stress away again once this fixture has been graded, so the
        // next magnitude is measured against the shipped stylesheet.
        await evaluate('(() => { document.getElementById("late-metrics")?.remove(); return true })()')
      }
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
// Every run's findings travel together and fail together. Round 9 learned this
// the hard way: stopping at the first problem meant one CI round could only ever
// reveal one platform's first problem, and three red rounds bought three facts.
const findings = results.flatMap((run) => run.findings || [])

// The measured limit, not a passed test. At ¥99,999,999,999.99 a day some money
// slots cannot be fitted at any size a reader would parse, and the honest rule is
// an allowlist of those slots rather than an exact list of which broke: the
// runners' metrics differ from each other and from this machine's by enough that
// one platform's strip figure gives out while another's ledger line does. What
// still fails is a slot nobody documented giving out — the day the 30-day row
// stops being the problem and the *tokens* row starts, that is a new fact.
const KNOWN_GIVEOUT = new Set(['stripToday', 'stripBalance', 'deckBalance', 'deckToday', 'deckThirty'])
const limitSlots = [...new Set(atTheLimit.map((item) => `${item.run} ${item.slot}`))].sort()
const beyondLimit = [...new Set(atTheLimit.filter((item) => !KNOWN_GIVEOUT.has(item.slot))
  .map((item) => `${item.run} ${item.slot} by ${item.pixels}px: ${item.text}`))]
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

// Evidence first, verdicts after. This check's whole purpose is to explain a
// platform nobody has in the room, and an assertion that throws before the
// report is written leaves that platform with nothing to read.
const writeReport = (passed) => fs.writeFileSync(path.join(root, 'shots', 'numbers-report.json'),
  JSON.stringify({
    offenders, unexpected, limitSlots, beyondLimit, widest, findings, passed,
    runs: results.map((run) => ({ run: run.label, findings: run.findings, fixtures: run.fixtures }))
  }, null, 2))
writeReport(false)

console.log(`Widest observed values: ${JSON.stringify(widest)}`)
console.log(`This platform's giveout at the extreme fixture: ${JSON.stringify(atTheLimit.map((item) => `${item.run} ${item.slot} ${item.pixels}px`))}`)
console.log(`Findings: ${findings.length}`)

assert.deepEqual(findings, [],
  `${findings.length} fitting problems: ${JSON.stringify(findings).slice(0, 4000)}`)
assert.deepEqual(unexpected, [],
  `${unexpected.length} numbers escape their box: ${JSON.stringify(unexpected.slice(0, 12))}`)
assert.deepEqual(beyondLimit, [],
  `a slot nobody documented gives out at the extreme fixture: ${JSON.stringify(beyondLimit)}`)

writeReport(true)
fs.rmSync(profileParent, { recursive: true, force: true, maxRetries: 5, retryDelay: 200 })
if (!keepShots) fs.rmSync(shotDir, { recursive: true, force: true, maxRetries: 5, retryDelay: 200 })
console.log(`Number fit passed: ${results.length} runs, ${FIXTURES.length} magnitudes each — shots: ${keepShots ? shotDir : 'removed'}`)
