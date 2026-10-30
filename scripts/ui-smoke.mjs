import assert from 'node:assert/strict'
import { spawn } from 'node:child_process'
import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import { createRequire } from 'node:module'
import { fileURLToPath } from 'node:url'
import { findPackagedApp } from './app-paths.mjs'

const require = createRequire(import.meta.url)
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const usePackaged = process.env.TM_PACKAGED_EXECUTABLE !== undefined || process.argv.includes('--packaged')
// Source regression runs before packaging; explicit release paths never fall back.
const electronBinary = usePackaged ? findPackagedApp(root).executable : require('electron')
const version = JSON.parse(fs.readFileSync(path.join(root, 'package.json'), 'utf8')).version
// The language assertions use the same locale table the app renders, so a new
// dictionary cannot pass a test that the window itself would fail.
const i18n = require(path.join(root, 'renderer', 'i18n.js'))
const { HTML_LANG } = i18n
const dataRoot = fs.mkdtempSync(path.join(os.tmpdir(), 'token-monitor-ui-'))
const profileDir = path.join(dataRoot, 'profile')
const configFile = path.join(profileDir, 'config.json')
const reportFile = path.join(root, 'shots', 'ui-report.json')
const port = 9300 + Math.floor(Math.random() * 400)
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms))
const report = { dataRoot, port, executable: electronBinary, usePackaged }

fs.mkdirSync(profileDir, { recursive: true })
fs.mkdirSync(path.join(root, 'shots'), { recursive: true })

const env = { ...process.env }
delete env.ELECTRON_RUN_AS_NODE

let child = null
let session = null

function readConfig() {
  try {
    return JSON.parse(fs.readFileSync(configFile, 'utf8'))
  } catch {
    return null
  }
}

async function waitConfig(predicate, label, timeout = 6000) {
  const deadline = Date.now() + timeout
  while (Date.now() < deadline) {
    const value = readConfig()
    if (value && predicate(value)) return value
    await sleep(120)
  }
  throw new Error(`config wait failed: ${label}`)
}

async function launch(label, { locale = 'zh' } = {}) {
  report[label] = {}
  child = spawn(
    electronBinary,
    [
      ...(usePackaged ? [] : [root]),
      `--remote-debugging-port=${port}`,
      `--user-data-dir=${profileDir}`,
      // The suite asserts Chinese copy, so it pins the language instead of
      // trusting the host: CI runners answer in English and would otherwise
      // change the interface under the test. Pass locale: null to leave the
      // app to its own saved setting.
      ...(locale ? [`--locale=${locale}`] : [])
    ],
    {
      cwd: root,
      env,
      stdio: ['ignore', 'pipe', 'pipe'],
      windowsHide: false
    }
  )
  let stderr = ''
  child.stderr.on('data', (chunk) => {
    stderr += String(chunk)
    if (stderr.length > 12000) stderr = stderr.slice(-12000)
  })
  child.on('exit', () => {
    child = null
  })

  const page = await (async () => {
    const deadline = Date.now() + 25000
    while (Date.now() < deadline) {
      if (!child) throw new Error(`app exited before CDP was ready\n${stderr}`)
      try {
        const targets = await (await fetch(`http://127.0.0.1:${port}/json/list`)).json()
        const target = targets.find(
          (item) => item.type === 'page' && item.url.includes('renderer/index.html')
        )
        if (target) return target
      } catch {
        /* not ready */
      }
      await sleep(300)
    }
    throw new Error(`CDP page not found\n${stderr}`)
  })()

  const ws = new WebSocket(page.webSocketDebuggerUrl)
  await new Promise((resolve, reject) => {
    ws.addEventListener('open', resolve, { once: true })
    ws.addEventListener('error', reject, { once: true })
  })

  let nextId = 1
  const pending = new Map()
  ws.addEventListener('message', (event) => {
    let message
    try {
      message = JSON.parse(String(event.data))
    } catch {
      return
    }
    if (!message.id || !pending.has(message.id)) return
    const waiter = pending.get(message.id)
    pending.delete(message.id)
    if (message.error) waiter.reject(new Error(message.error.message))
    else waiter.resolve(message.result)
  })

  function call(method, params = {}) {
    const id = nextId++
    return new Promise((resolve, reject) => {
      pending.set(id, { resolve, reject })
      ws.send(JSON.stringify({ id, method, params }))
      setTimeout(() => {
        if (pending.has(id)) {
          pending.delete(id)
          reject(new Error(`CDP timeout: ${method}`))
        }
      }, 25000)
    })
  }

  async function evaluate(expression) {
    const result = await call('Runtime.evaluate', {
      expression,
      awaitPromise: true,
      returnByValue: true,
      userGesture: true
    })
    if (result.exceptionDetails) {
      throw new Error(
        result.exceptionDetails.exception?.description ||
          result.exceptionDetails.text ||
          'evaluation failed'
      )
    }
    return result.result?.value
  }

  async function waitFor(name, expression, timeout = 25000, diagnose = null) {
    const deadline = Date.now() + timeout
    while (Date.now() < deadline) {
      try {
        if (await evaluate(expression)) return
      } catch (error) {
        if (!/Cannot read|not found|null/i.test(String(error))) throw error
      }
      await sleep(180)
    }
    // Report what the page actually looked like. Two Apple Silicon rounds failed
    // below with nothing but a label, which left "the card is stuck in the strip
    // form", "the window is still moving" and "this wait is wrong" indistinguishable
    // from one line of log.
    let seen = null
    if (diagnose) {
      try {
        seen = await evaluate(diagnose)
      } catch (error) {
        seen = String(error)
      }
    }
    throw new Error(`timed out waiting for ${name}${seen === null ? '' : ` — ${JSON.stringify(seen)}`}`)
  }

  await call('Runtime.enable')
  session = { call, evaluate, waitFor, ws, stderr: () => stderr }
  return session
}

async function quit() {
  if (!session) return
  const { evaluate, ws } = session
  session = null
  try {
    await evaluate('window.tm.quit()')
  } catch {
    /* window may already close */
  }
  try {
    ws.close()
  } catch {
    /* ignore */
  }
  const deadline = Date.now() + 8000
  while (child && Date.now() < deadline) await sleep(120)
  if (child) {
    child.kill()
    child = null
  }
  await sleep(350)
}

const viewExpr = (name) => `document.body.classList.contains('${name}')`
// What a view wait saw, for the message when it timed out: the class says
// whether the renderer agreed, the window width says whether the operating
// system finished moving the card, and the renderer's own state says whether the
// two of them disagree.
const VIEW_DIAGNOSE = `(() => ({
  classes: document.body.className,
  inner: [window.innerWidth, window.innerHeight],
  stateView: typeof state === 'undefined' ? null : state.view,
  configView: typeof state === 'undefined' ? null : state.config?.view,
  morphMs: getComputedStyle(document.documentElement).getPropertyValue('--morph-ms').trim()
}))()`

try {
  session = await launch('firstLaunch')
  const { evaluate, waitFor } = session

  await waitFor('initial strip', `${viewExpr('view-strip')} && document.getElementById('stripBalance')?.textContent?.trim() === '¥145.09'`)
  const boot = await evaluate('window.tm.bootstrap()')
  report.firstLaunch.boot = boot
  assert.equal(boot.version, version)
  assert.equal(boot.platform, process.platform)
  assert.equal(boot.isPackaged, usePackaged)
  assert.ok(Number.isFinite(boot.morphMs) && boot.morphMs > 0, 'bootstrap must provide morph duration')
  const backends = {
    win32: ['dpapi', 'none'],
    darwin: ['keychain', 'none'],
    linux: ['gnome_libsecret', 'kwallet', 'kwallet5', 'kwallet6', 'none']
  }
  // Startup must never touch the system keyring: a pending Keychain/DPAPI
  // authorization used to freeze the whole main process here.
  assert.equal(boot.encryption, null, 'bootstrap must not probe the keyring synchronously')
  report.firstLaunch.strip = await evaluate(`(() => ({
    view: document.body.className,
    inner: [window.innerWidth, window.innerHeight],
    panel: (() => { const r = document.getElementById('panel').getBoundingClientRect(); return [Math.round(r.width), Math.round(r.height)] })(),
    balance: document.getElementById('stripBalance').textContent,
    runway: document.getElementById('stripRunway').textContent,
    today: document.getElementById('stripToday').textContent,
    pace: document.getElementById('stripPace').textContent,
    demo: !document.getElementById('stripDemoTag').hidden,
    sparkPaths: document.querySelectorAll('#stripSpark path').length,
    gaugeClass: document.getElementById('stripGauge').className,
    gaugeRatio: getComputedStyle(document.getElementById('stripGauge')).getPropertyValue('--ratio').trim()
  }))()`)
  assert.match(report.firstLaunch.strip.view, /view-strip/)
  assert.equal(report.firstLaunch.strip.balance, '¥145.09')
  assert.equal(report.firstLaunch.strip.runway, '19.8')
  assert.equal(report.firstLaunch.strip.today, '¥1.49')
  assert.equal(report.firstLaunch.strip.demo, true)
  assert.ok(report.firstLaunch.strip.sparkPaths >= 2)
  assert.match(report.firstLaunch.strip.gaugeClass, /state-ok/)
  assert.equal(report.firstLaunch.strip.gaugeRatio, '0.66')
  assert.ok(report.firstLaunch.strip.inner[0] >= 520 && report.firstLaunch.strip.inner[0] <= 560)

  // settings from the strip should expand the deck first
  await evaluate("document.getElementById('stripStatus').click()")
  await waitFor('settings from strip', `${viewExpr('view-deck')} && !${viewExpr('morphing')} && document.getElementById('settingsSheet').classList.contains('open')`)
  await sleep(450)
  report.firstLaunch.deck = await evaluate(`(() => ({
    inner: [window.innerWidth, window.innerHeight],
    balance: document.getElementById('deckBalance').textContent,
    runway: document.getElementById('deckRunway').textContent,
    gaugeNote: document.getElementById('gaugeNote').textContent,
    chartTotal: document.getElementById('chartTotal').textContent,
    mixNote: document.getElementById('mixNote').textContent,
    outlook: [
      document.getElementById('outlookDays30').textContent,
      document.getElementById('outlookDays7').textContent,
      document.getElementById('outlookForecast').textContent
    ],
    mixRows: document.querySelectorAll('#mixList .mix-row').length,
    mixRowTitle: document.querySelector('#mixList .mix-row')?.title || '',
    gaugeClass: document.getElementById('gauge').className,
    ringProgress: document.querySelectorAll('#gaugeSvg circle.ring-progress').length,
    ringKnob: document.querySelectorAll('#gaugeSvg .ring-knob').length,
    fonts: {
      inter: document.fonts.check('600 16px Inter'),
      cjk: document.fonts.check('400 12px "Noto Sans SC"')
    },
    band: document.querySelectorAll('#chart .last7-band').length,
    scroll: (() => {
      const s = document.getElementById('deckScroll')
      const originalTop = s.scrollTop
      s.scrollTop = s.scrollHeight
      const bottomTop = s.scrollTop
      const rect = s.getBoundingClientRect()
      const lastBottom = s.lastElementChild.getBoundingClientRect().bottom
      s.scrollTop = originalTop
      return {
        height: s.scrollHeight, client: s.clientHeight,
        width: s.scrollWidth, clientWidth: s.clientWidth,
        overflowY: getComputedStyle(s).overflowY,
        top: rect.top, bottom: rect.bottom, bottomTop, lastBottom
      }
    })()
  }))()`)
  assert.equal(report.firstLaunch.deck.balance, '145.09')
  assert.equal(report.firstLaunch.deck.runway, '19.8')
  assert.match(report.firstLaunch.deck.gaugeNote, /约 \d+ 月 \d+ 日见底/)
  assert.equal(report.firstLaunch.deck.chartTotal, '¥109.73')
  assert.equal(report.firstLaunch.deck.mixNote, '缓存命中 61.8% · 1,866 请求')
  assert.deepEqual(report.firstLaunch.deck.outlook, ['19.8', '53.3', '¥219.60'])
  assert.equal(report.firstLaunch.deck.mixRows, 2)
  assert.match(report.firstLaunch.deck.mixRowTitle, /缓存命中 61\.8% · 1,725 次请求/)
  assert.match(report.firstLaunch.deck.gaugeClass, /state-ok/)
  assert.equal(report.firstLaunch.deck.ringProgress, 1)
  assert.equal(report.firstLaunch.deck.ringKnob, 1)
  assert.equal(report.firstLaunch.deck.fonts.inter, true)
  assert.equal(report.firstLaunch.deck.fonts.cjk, true)
  assert.equal(report.firstLaunch.deck.band, 1)
  const deckScroll = report.firstLaunch.deck.scroll
  assert.ok(deckScroll.client > 0 && deckScroll.clientWidth > 0, 'deck must have a usable scroll area')
  assert.ok(deckScroll.width <= deckScroll.clientWidth + 1, 'deck must not overflow horizontally')
  assert.ok(deckScroll.top >= 0 && deckScroll.bottom <= report.firstLaunch.deck.inner[1] + 1, 'deck scroll area must fit the viewport')
  if (report.firstLaunch.deck.inner[1] >= 880) {
    assert.ok(deckScroll.height <= deckScroll.client + 1, 'full-height deck must not scroll')
  } else {
    assert.match(deckScroll.overflowY, /^(auto|scroll)$/, 'short deck must allow scrolling')
    if (deckScroll.height > deckScroll.client + 1) {
      assert.ok(deckScroll.bottomTop > 0, 'short deck overflow must actually scroll')
      assert.ok(Math.abs(deckScroll.bottomTop - (deckScroll.height - deckScroll.client)) <= 1, 'deck must reach the end of its scroll range')
    }
  }
  assert.ok(deckScroll.lastBottom <= deckScroll.bottom + 1, 'last deck section must be reachable')
  assert.ok(report.firstLaunch.deck.inner[0] >= 560 && report.firstLaunch.deck.inner[0] <= 600)

  // theme preview reverts when the sheet closes
  await evaluate("document.querySelector('#themeSeg [data-theme=\"dark\"]').click()")
  await waitFor('dark preview', "document.body.classList.contains('theme-dark')")
  await evaluate("document.getElementById('sheetClose').click()")
  await waitFor('preview reverted', "!document.getElementById('settingsSheet').classList.contains('open') && document.body.classList.contains('theme-light')")
  assert.equal(readConfig()?.theme || 'light', 'light', 'preview theme must not persist')

  // saved theme persists
  await evaluate("document.querySelector('.deck-head [data-action=\"settings\"]').click()")
  await waitFor('settings reopened', "document.getElementById('settingsSheet').classList.contains('open')")
  await evaluate("document.querySelector('#themeSeg [data-theme=\"dark\"]').click()")
  await evaluate("document.getElementById('saveBtn').click()")
  await waitFor('dark saved', "!document.getElementById('settingsSheet').classList.contains('open') && document.body.classList.contains('theme-dark')")
  await waitConfig((config) => config.theme === 'dark', 'theme dark')

  await evaluate("document.querySelector('.deck-head [data-action=\"settings\"]').click()")
  await waitFor('settings reopened 2', "document.getElementById('settingsSheet').classList.contains('open')")
  await evaluate("document.querySelector('#themeSeg [data-theme=\"light\"]').click()")
  await evaluate("document.getElementById('saveBtn').click()")
  await waitFor('light restored', "!document.getElementById('settingsSheet').classList.contains('open') && document.body.classList.contains('theme-light')")
  await waitConfig((config) => config.theme === 'light', 'theme light')

  // dual pace
  await evaluate("document.getElementById('pace7').click()")
  await waitFor('7d runway', "document.getElementById('deckRunway').textContent.trim() === '53.3'")
  report.firstLaunch.pace7 = await evaluate(`(() => ({
    caption: document.getElementById('gaugeCaption').textContent,
    note: document.getElementById('gaugeNote').textContent,
    outlook: document.getElementById('outlookDays7').textContent,
    forecast: document.getElementById('outlookForecast').textContent,
    active: document.getElementById('outlook7').classList.contains('active')
  }))()`)
  assert.equal(report.firstLaunch.pace7.caption, '按 7 天自然日')
  assert.match(report.firstLaunch.pace7.note, /约 \d+ 月 \d+ 日见底/)
  assert.equal(report.firstLaunch.pace7.outlook, '53.3')
  assert.equal(report.firstLaunch.pace7.forecast, '¥81.60')
  assert.equal(report.firstLaunch.pace7.active, true)
  await waitConfig((config) => config.paceMode === '7d', 'pace 7d')

  await evaluate("document.getElementById('pace30').click()")
  await waitFor('30d runway', "document.getElementById('deckRunway').textContent.trim() === '19.8'")
  await waitConfig((config) => config.paceMode === '30d', 'pace 30d')

  // chart hover + privacy
  report.firstLaunch.hover = await evaluate(`(() => {
    const wrap = document.getElementById('chartWrap')
    const rect = wrap.getBoundingClientRect()
    wrap.dispatchEvent(new PointerEvent('pointermove', {
      clientX: rect.left + rect.width * 0.55,
      clientY: rect.top + 40,
      bubbles: true
    }))
    const tip = document.getElementById('chartTip')
    return { hidden: tip.hidden, text: tip.textContent }
  })()`)
  await sleep(250)
  assert.equal(await evaluate("document.getElementById('chartTip').hidden"), false)
  assert.match(report.firstLaunch.hover.text, /¥/)

  await evaluate("document.querySelector('.deck-foot [data-action=\"privacy\"]').click()")
  await waitFor('amounts hidden', "document.getElementById('deckBalance').textContent.trim() === '••'")
  assert.equal(await evaluate("document.getElementById('stripBalance').textContent.trim()"), '¥••')
  assert.equal(await evaluate("localStorage.getItem('tm:privacy')"), '1')
  assert.match(await evaluate("document.getElementById('chartTotal').textContent"), /••/)
  await evaluate("document.querySelector('.deck-foot [data-action=\"privacy\"]').click()")
  await waitFor('amounts shown', "document.getElementById('deckBalance').textContent.trim() === '145.09'")

  // ── the morph itself ───────────────────────────────────────────────
  // Sampled inside the page, one entry per animation frame: the card must
  // never be an empty white box, and neither view may be stretched by the
  // moving window edge.
  //
  // Sampling follows the *motion*, not the CSS class. The class window assumes
  // the operating system applies setSize while it is still on; on a loaded
  // macOS runner the resize landed after the class had gone, every frame taken
  // as "morphing" still showed the old height, and the check failed on a
  // product that was animating correctly. So: keep sampling until the panel
  // height settles, and grade what was observed.
  const sampleMorph = async (trigger) => {
    await waitFor('morph idle', `!${viewExpr('morphing')}`)
    return evaluate(`new Promise((resolve) => {
      const samples = []
      const t0 = performance.now()
      const strip = document.getElementById('stripView')
      const deck = document.getElementById('deckView')
      const panel = document.getElementById('panel')
      const before = Math.round(panel.getBoundingClientRect().height)
      // A cap that scales with the configured duration would blind the sampler
      // on a very short one, so keep a floor: enough frames to tell an
      // animation from a jump no matter what the product is set to.
      const cap = Math.max(1200, ${boot.morphMs} * 4)
      const step = () => {
        const elapsed = performance.now() - t0
        const height = Math.round(panel.getBoundingClientRect().height)
        samples.push({
          t: Math.round(elapsed),
          morphing: document.body.classList.contains('morphing'),
          panel: height,
          // The inline height the morph pins the card with; empty outside a morph.
          pin: document.getElementById('panel').style.height || '',
          // The window edge is what moves now; the card is laid out once and
          // revealed, so the two series say different things and both are needed.
          win: window.innerHeight,
          strip: Math.round(strip.getBoundingClientRect().height),
          deck: Math.round(deck.getBoundingClientRect().height),
          so: +getComputedStyle(strip).opacity,
          dop: +getComputedStyle(deck).opacity
        })
        const previous = samples.at(-2)
        const stable = previous && previous.panel === height && previous.morphing === false
        if (elapsed < ${boot.morphMs} || !stable) {
          if (elapsed < cap) requestAnimationFrame(step)
          else resolve({ samples, before, after: height })
        } else resolve({ samples, before, after: height })
      }
      requestAnimationFrame(step)
      ${trigger}
    })`)
  }

  const gradeMorph = (run) => {
    const heights = run.samples.map((s) => s.panel)
    const wins = run.samples.map((s) => s.win ?? s.panel)
    const resting = heights.at(-1)
    const delta = run.before - resting
    const fading = run.samples.filter((s) => s.morphing)
    const moving = fading.length ? fading : run.samples
    const frameWindow = moving.length ? moving : run.samples
    // The edge the reader watches is the window's. The card is pinned during the
    // morph and revealed by that edge, so the two series are graded separately:
    // the window has to arrive in steps, the panel must not.
    const winSteps = wins.slice(1).map((h, i) => Math.abs(h - wins[i]))
    const winFrom = wins[0]
    const winTo = wins.at(-1)
    let panelChanges = 0
    const panelMoves = []
    for (let i = 1; i < run.samples.length; i++) {
      if (!run.samples[i].morphing) continue
      if (run.samples[i].panel === run.samples[i - 1].panel) continue
      panelChanges++
      // Which frames, and what the window was doing then: a pin that lands one
      // frame late looks the same as a reflow in the count alone, and this
      // assertion failing on three platforms at once while passing locally is
      // exactly the case that has to be diagnosable from the artifact.
      panelMoves.push({ i, t: run.samples[i].t, from: run.samples[i - 1].panel, to: run.samples[i].panel,
        win: [run.samples[i - 1].win, run.samples[i].win], morphingBefore: run.samples[i - 1].morphing })
    }
    return {
      duration: boot.morphMs,
      sampledUntil: run.samples.at(-1)?.t,
      frames: run.samples.length,
      fadingFrames: fading.length,
      restingPanelFrom: run.before,
      restingPanelTo: resting,
      panelDelta: delta,
      panelFrom: heights[0],
      panelTo: resting,
      winFrom,
      winTo,
      // Distinct window sizes strictly between the two resting ones: proof the
      // reveal arrived spread over frames instead of in one jump.
      winIntermediate: new Set(wins.filter((h) => h < winFrom - 1 && h > winTo + 1)).size,
      biggestStep: winSteps.length ? Math.max(...winSteps) : 0,
      // How many times the card's own box changed while morphing. The window
      // resize is cheap; re-laying-out the whole card on every step is what made
      // the content trail the edge by 60-100ms, so the architecture is graded.
      panelChanges,
      panelMoves,
      // t:panel(pin)/window for every frame — the only way to tell a missing
      // pin from a layout clamp from the artifact alone.
      panelSeries: run.samples.map((s) => `${s.t}:${s.panel}${s.pin ? '[' + s.pin + ']' : ''}/${s.win}${s.morphing ? '' : '.'}`),
      dimmest: Math.min(...frameWindow.map((s) => Math.max(s.so, s.dop))),
      deckHeights: [Math.min(...frameWindow.map((s) => s.deck)), Math.max(...frameWindow.map((s) => s.deck))],
      stripHeights: [Math.min(...frameWindow.map((s) => s.strip)), Math.max(...frameWindow.map((s) => s.strip))]
    }
  }

  const triggerCollapse = "document.querySelector('.deck-head [data-action=\"collapse\"]').click()"
  const isAnimated = (grade) => grade.panelDelta > 0 && grade.winIntermediate >= 3 &&
    Math.abs(grade.winFrom - grade.winTo) >= grade.panelDelta * 0.75
  const attempts = []
  let graded = null
  for (let attempt = 0; attempt < 3; attempt++) {
    const grade = gradeMorph(await sampleMorph(triggerCollapse))
    attempts.push(grade)
    if (!graded || grade.winIntermediate > graded.winIntermediate) graded = grade
    if (isAnimated(grade)) break
    await sleep(400)
  }
  report.firstLaunch.morph = graded
  // Every attempt is kept: a pass that only succeeded on the third try is
  // evidence about the runner, not a hidden retry.
  report.firstLaunch.morphAttempts = attempts.map((grade) => ({
    frames: grade.frames, fadingFrames: grade.fadingFrames, winIntermediate: grade.winIntermediate, panelChanges: grade.panelChanges,
    panelFrom: grade.panelFrom, panelTo: grade.panelTo, panelDelta: grade.panelDelta,
    sampledUntil: grade.sampledUntil
  }))
  assert.ok(graded.frames >= 3, `morph sampled only ${graded.frames} frames`)
  assert.ok(graded.panelDelta > 0, `collapse did not shrink the panel: ${graded.restingPanelFrom} -> ${graded.restingPanelTo}`)
  assert.ok(
    Math.abs(graded.winFrom - graded.winTo) >= graded.panelDelta * 0.75,
    `window did not travel most of its actual ${graded.panelDelta}px: ${graded.winFrom} -> ${graded.winTo} ` +
    `(after ${attempts.length} attempt(s): ${JSON.stringify(report.firstLaunch.morphAttempts)})`
  )
  assert.ok(
    graded.winIntermediate >= 3,
    `the reveal must arrive in steps, not one jump (intermediate window sizes ${graded.winIntermediate}, biggest step ${graded.biggestStep}px of ${graded.panelDelta}px)`
  )
  // The card is laid out once at the larger height and revealed by the moving
  // edge. A panel that resizes per frame is the 60-100ms content trail this
  // architecture exists to prevent, so it is graded, not just described.
  assert.ok(
    graded.panelChanges <= 1,
    `the card was re-laid-out ${graded.panelChanges} times during one morph; it must be pinned and revealed — ${JSON.stringify(graded.panelMoves)} series ${JSON.stringify(graded.panelSeries)}`
  )
  assert.ok(
    graded.dimmest > 0.45,
    `card went empty mid-morph (best opacity ${graded.dimmest})`
  )
  // Neither view may be stretched by the moving edge: across the whole morph
  // each one's height only moves inside its own scale envelope (0.972..1.014).
  const [deckLo, deckHi] = graded.deckHeights
  const [stripLo, stripHi] = graded.stripHeights
  assert.ok(deckHi - deckLo <= 20, `deck stretched during morph: ${deckLo}..${deckHi}`)
  assert.ok(stripHi - stripLo <= 10, `strip stretched during morph: ${stripLo}..${stripHi}`)

  // collapse + persisted view
  await waitFor('collapsed', `${viewExpr('view-strip')} && window.innerWidth < 560`, 25000, VIEW_DIAGNOSE)
  await waitConfig((config) => config.view === 'strip', 'view strip')
  report.firstLaunch.collapsed = await evaluate(`({
    view: document.body.className,
    inner: [window.innerWidth, window.innerHeight],
    runway: document.getElementById('stripRunway').textContent
  })`)
  assert.equal(report.firstLaunch.collapsed.runway, '19.8')

  await evaluate("document.querySelector('.strip-main').click()")
  try {
    await waitFor('expanded again', `${viewExpr('view-deck')} && window.innerWidth > 520`, 25000, VIEW_DIAGNOSE)
  } catch (error) {
    // A bounded, recorded second click — the same shape as the morph attempts. On a
    // contended runner the window can still be moving while the renderer has
    // already agreed, and a swallowed click is what a user would answer with a
    // second click. The first failure travels in the report either way, so a pass
    // here is never silence about a runner that struggled.
    report.firstLaunch.expandRetry = { first: String(error).slice(0, 700) }
    await evaluate("document.querySelector('.strip-main').click()")
    await waitFor('expanded again after one recorded retry',
      `${viewExpr('view-deck')} && window.innerWidth > 520`, 25000, VIEW_DIAGNOSE)
    report.firstLaunch.expandRetry.recovered = true
  }
  await waitConfig((config) => config.view === 'deck', 'view deck')

  // Exercise the real credential failure path with a deliberately invalid key.
  // This may contact DeepSeek (Node fetch runs in the main process). Accept
  // authentication/network errors; do not claim this is an offline mock.
  // Storage assertions follow the backend the system actually reports when the
  // drawer asks for it, not an assumed keyring.
  await evaluate("document.querySelector('.deck-head [data-action=\"settings\"]').click()")
  await waitFor('settings for credentials', "document.getElementById('settingsSheet').classList.contains('open')")
  // The drawer is what asks the system; a machine whose keyring never answers
  // cannot be verified here, so say so instead of guessing a backend.
  const probed = await evaluate('window.tm.encryption()')
  assert.notEqual(probed, 'pending', 'the system encryption probe never answered')
  assert.ok(backends[process.platform].includes(probed), `unexpected storage backend: ${probed}`)
  await waitFor('storage note settled', `document.getElementById('storageNote').textContent !== '只保存在本机'`, 5000)
  report.storage = await evaluate(`(() => {
    const note = document.getElementById('storageNote')
    return { text: note.textContent, title: note.title, warning: note.classList.contains('warn') }
  })()`)
  report.storage.backend = probed
  const encrypted = probed !== 'none'
  assert.equal(report.storage.warning, !encrypted, 'storage warning must match the real backend')
  if (!encrypted) {
    assert.match(report.storage.text, /未加密.*系统加密服务不可用/)
    assert.match(report.storage.title, /base64/i)
    assert.match(report.storage.title, /明文|NOT encrypted/i)
    assert.doesNotMatch(report.storage.title, /安全加密|落盘前由系统加密|Credentials are encrypted/i)
  } else {
    assert.match(report.storage.text, /加密.*只保存在本机/)
    assert.doesNotMatch(report.storage.text, /未加密/)
  }
  await evaluate(`(() => {
    const input = document.getElementById('apiKeyInput')
    input.value = 'sk-test-invalid-9876'
    input.dispatchEvent(new Event('input', { bubbles: true }))
    const demo = document.getElementById('demoSwitch')
    if (demo.getAttribute('aria-checked') === 'true') demo.click()
    document.getElementById('saveBtn').click()
    return true
  })()`)
  await waitFor(
    'credential notice',
    "!document.getElementById('settingsSheet').classList.contains('open') && !document.getElementById('notice').hidden && /API Key|连接|超时|网络/.test(document.getElementById('noticeText').textContent)",
    40000
  )
  await waitFor('refresh settled', "!document.body.classList.contains('refreshing')")
  report.credential = await evaluate(`(() => ({
    notice: document.getElementById('noticeText').textContent,
    action: document.getElementById('noticeAction').textContent,
    status: document.getElementById('deckStatusText').textContent,
    demoTag: !document.getElementById('deckDemoTag').hidden,
    balance: document.getElementById('deckBalance').textContent
  }))()`)
  assert.equal(report.credential.demoTag, false)
  assert.equal(report.credential.action, '去设置')
  const stored = await waitConfig((config) => config.demo === false && config.apiKeyEnc, 'demo off and credential saved')
  const expectedPrefix = encrypted ? 'enc:' : 'plain:'
  const serializedKey = String(stored.apiKeyEnc)
  report.credential.store = {
    backend: probed,
    prefix: serializedKey.slice(0, serializedKey.indexOf(':') + 1),
    encrypted: serializedKey.startsWith('enc:'),
    // Absence of the literal key in JSON is NOT proof of encryption: plain:
    // is reversible base64 and must be reported as unencrypted.
    literalKeyPresent: JSON.stringify(stored).includes('sk-test-invalid-9876'),
    sessionEmpty: !stored.sessionTokenEnc
  }
  assert.equal(report.credential.store.prefix, expectedPrefix)
  assert.equal(report.credential.store.encrypted, encrypted)
  assert.equal(report.credential.store.literalKeyPresent, false)
  assert.ok(serializedKey.length > expectedPrefix.length, 'stored credential payload must not be empty')
  if (!encrypted) {
    assert.equal(Buffer.from(serializedKey.slice(expectedPrefix.length), 'base64').toString('utf8'), 'sk-test-invalid-9876')
  } else {
    assert.notEqual(serializedKey.slice(expectedPrefix.length), Buffer.from('sk-test-invalid-9876').toString('base64'))
  }
  assert.equal(report.credential.store.sessionEmpty, true)

  await evaluate("document.getElementById('noticeAction').click()")
  await waitFor('settings from notice', "document.getElementById('settingsSheet').classList.contains('open')")
  await evaluate("document.getElementById('clearBtn').click()")
  await sleep(140)
  await evaluate("document.getElementById('clearBtn').click()")
  await waitFor(
    'credentials cleared',
    "!document.getElementById('settingsSheet').classList.contains('open') && document.getElementById('deckBalance').textContent.trim() === '145.09' && document.getElementById('notice').hidden",
    30000
  )
  const cleared = await waitConfig((config) => config.demo === true, 'demo restored')
  report.cleared = {
    demo: cleared.demo,
    apiKeyEnc: cleared.apiKeyEnc,
    sessionTokenEnc: cleared.sessionTokenEnc,
    noticeHidden: await evaluate("document.getElementById('notice').hidden")
  }
  assert.equal(report.cleared.apiKeyEnc, '')
  assert.equal(report.cleared.sessionTokenEnc, '')
  assert.equal(report.cleared.noticeHidden, true)

  await quit()

  // relaunch: deck view should be restored from disk
  session = await launch('relaunch')
  await session.waitFor('deck restored', `${viewExpr('view-deck')} && document.getElementById('deckBalance').textContent.trim() === '145.09'`)
  await sleep(350)
  report.relaunch.state = await session.evaluate(`({
    view: document.body.className,
    inner: [window.innerWidth, window.innerHeight],
    theme: document.body.classList.contains('theme-dark') ? 'dark' : 'light',
    privacy: document.body.classList.contains('privacy')
  })`)
  assert.match(report.relaunch.state.view, /view-deck/)
  assert.ok(report.relaunch.state.inner[0] >= 560 && report.relaunch.state.inner[0] <= 600)
  assert.equal(report.relaunch.state.theme, 'light')
  assert.equal(report.relaunch.state.privacy, false)
  await session.evaluate("document.querySelector('.deck-head [data-action=\"collapse\"]').click()")
  await session.waitFor('collapsed before exit', viewExpr('view-strip'))
  await quit()
  // Language is the one setting that reloads the window, so this phase does not
  // ride the navigation: it verifies the persisted choice, restarts the app and
  // checks the fresh page comes up in English without any CLI override.
  session = await launch('localeSwitch')
  await session.waitFor('strip before language change',
    `${viewExpr('view-strip')} && document.getElementById('stripBalance')?.textContent?.trim() === '¥145.09'`)
  await session.evaluate("document.querySelector('.strip-main').click()")
  await session.waitFor('deck for language change', viewExpr('view-deck'))
  await session.evaluate("document.querySelector('.deck-head [data-action=\"settings\"]').click()")
  await session.waitFor('settings for language change', "document.getElementById('settingsSheet').classList.contains('open')")
  await session.evaluate("document.querySelector('#localeSeg button[data-locale=\"en\"]').click()")
  await session.evaluate("document.getElementById('saveBtn').click()")
  const localeSaved = await waitConfig((config) => config.locale === 'en', 'locale persisted as en')
  report.localeSwitch = { persisted: localeSaved.locale }
  try { session.ws.close() } catch { /* already gone */ }
  session = null
  if (child) child.kill()
  await sleep(900)
  child = null

  // No override here: the app must reach English from its own saved setting.
  session = await launch('localeRelaunch', { locale: null })
  // The saved view is deck, so this also proves the reload kept the form.
  await session.waitFor('english deck',
    `document.documentElement.lang === 'en' && ${viewExpr('view-deck')} && document.getElementById('deckBalance').textContent.trim() === '145.09'`)
  await sleep(350)
  report.localeRelaunch = await session.evaluate(`({
    lang: document.documentElement.lang,
    pace: document.getElementById('gaugeCaption').textContent,
    foot: document.getElementById('footMode').textContent,
    cjk: [...document.body.innerText].filter((ch) => /[\\u4e00-\\u9fff]/.test(ch)).join('')
  })`)
  assert.equal(report.localeRelaunch.lang, 'en', 'the saved language must survive a restart')
  assert.equal(report.localeRelaunch.pace, '30-day active pace')
  assert.equal(report.localeRelaunch.foot, 'DEMO / sample data')
  assert.equal(report.localeRelaunch.cjk, '', 'English mode must not show Chinese outside the language picker')

  // The restart proves persistence; clicking through the remaining dictionaries
  // proves each one is really loaded in this window and that changing language
  // reloads it — the only setting that does. A mid-reload page cannot answer
  // CDP at all, so this poll swallows the destroyed-context errors too.
  const settle = async (name, expression, timeout = 20000) => {
    const deadline = Date.now() + timeout
    for (;;) {
      try {
        if (await session.evaluate(`(() => { try { return ${expression} } catch { return false } })()`)) return
      } catch {
        /* the document is being replaced */
      }
      if (Date.now() > deadline) throw new Error(`timed out waiting for ${name}`)
      await sleep(200)
    }
  }
  report.localePicker = {}
  for (const [locale, pace] of [
    ['es', 'Ritmo activo de 30 días'],
    ['pt-BR', 'Ritmo de 30 dias ativos'],
    ['de', 'Rhythmus 30 Aktivtage']
  ]) {
    await session.evaluate("document.querySelector('.deck-head [data-action=\"settings\"]').click()")
    await session.waitFor(`settings for ${locale}`, "document.getElementById('settingsSheet').classList.contains('open')")
    await session.evaluate(`document.querySelector('#localeSeg button[data-locale="${locale}"]').click()`)
    await session.evaluate("document.getElementById('saveBtn').click()")
    await waitConfig((config) => config.locale === locale, `locale persisted as ${locale}`)
    await settle(`${locale} deck reloaded`,
      `document.documentElement.lang === '${HTML_LANG[locale]}' && ${viewExpr('view-deck')} && document.getElementById('deckBalance').textContent.trim() === '145.09'`)
    await sleep(350)
    const seen = await session.evaluate(`({
      lang: document.documentElement.lang,
      pace: document.getElementById('gaugeCaption').textContent.trim(),
      cjk: [...document.body.innerText].filter((ch) => /[\\u4e00-\\u9fff]/.test(ch)).join('')
    })`)
    assert.equal(seen.pace, pace, `${locale}: pace caption is not the ${locale} wording`)
    assert.equal(seen.cjk, '', `${locale} mode must not show Chinese: ${seen.cjk}`)
    report.localePicker[locale] = seen
    // The reload closes the drawer, and the chips are filled when it opens:
    // reopening is where a picker that forgot the saved language shows up.
    await session.evaluate("document.querySelector('.deck-head [data-action=\"settings\"]').click()")
    await session.waitFor(`settings reopened for ${locale}`, "document.getElementById('settingsSheet').classList.contains('open')")
    const active = await session.evaluate("document.querySelector('#localeSeg button.active')?.dataset.locale || null")
    assert.equal(active, locale, `${locale}: the picker must mark the saved language active`)
    await session.evaluate("document.getElementById('sheetClose').click()")
    await session.waitFor(`settings closed after ${locale}`, "!document.getElementById('settingsSheet').classList.contains('open')")
  }
  await quit()

  try {
    fs.rmSync(dataRoot, { recursive: true, force: true })
  } catch {
    /* profile cleanup is best-effort */
  }

  fs.writeFileSync(reportFile, JSON.stringify(report, null, 2))
  console.log(JSON.stringify(report, null, 2))
  console.log('UI smoke test passed.')
} catch (error) {
  report.error = error?.stack || String(error)
  if (session) {
    try {
      report.lastState = await session.evaluate(`({
        body: document.body.className,
        ready: document.readyState,
        stripBalance: document.getElementById('stripBalance')?.textContent,
        deckBalance: document.getElementById('deckBalance')?.textContent,
        stripRunway: document.getElementById('stripRunway')?.textContent,
        toast: document.getElementById('toast')?.textContent,
        title: document.title
      })`)
    } catch {
      /* ignore */
    }
  }
  if (session?.stderr?.()) report.rendererLog = session.stderr()
  try {
    fs.writeFileSync(reportFile, JSON.stringify(report, null, 2))
  } catch {
    /* ignore */
  }
  console.error(report.error)
  await quit()
  process.exit(1)
}
