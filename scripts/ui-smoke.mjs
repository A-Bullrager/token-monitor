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
const dataRoot = fs.mkdtempSync(path.join(os.tmpdir(), 'token-monitor-ui-'))
const profileDir = path.join(dataRoot, 'profile')
const configFile = path.join(profileDir, 'config.json')
const reportFile = path.join(root, 'shots', 'ui-report.json')
const port = 9300 + Math.floor(Math.random() * 400)
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms))
const report = { dataRoot, port }

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

async function launch(label) {
  report[label] = {}
  child = spawn(
    electronBinary,
    [root, `--remote-debugging-port=${port}`, `--user-data-dir=${profileDir}`],
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

  async function waitFor(name, expression, timeout = 25000) {
    const deadline = Date.now() + timeout
    while (Date.now() < deadline) {
      try {
        if (await evaluate(expression)) return
      } catch (error) {
        if (!/Cannot read|not found|null/i.test(String(error))) throw error
      }
      await sleep(180)
    }
    throw new Error(`timed out waiting for ${name}`)
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

try {
  session = await launch('firstLaunch')
  const { evaluate, waitFor } = session

  await waitFor('initial strip', `${viewExpr('view-strip')} && document.getElementById('stripBalance')?.textContent?.trim() === '¥145.09'`)
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
  await waitFor('settings from strip', `${viewExpr('view-deck')} && document.getElementById('settingsSheet').classList.contains('open')`)
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
      misans: document.fonts.check('400 12px MiSans')
    },
    band: document.querySelectorAll('#chart .last7-band').length,
    scroll: (() => { const s = document.getElementById('deckScroll'); return [s.scrollHeight, s.clientHeight] })()
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
  assert.equal(report.firstLaunch.deck.fonts.misans, true)
  assert.equal(report.firstLaunch.deck.band, 1)
  assert.ok(report.firstLaunch.deck.scroll[0] <= report.firstLaunch.deck.scroll[1] + 1)
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
  const sampleMorph = async (trigger, ms = 260) => {
    await evaluate(`(() => {
      window.__morphSamples = []
      const t0 = performance.now()
      const strip = document.getElementById('stripView')
      const deck = document.getElementById('deckView')
      const panel = document.getElementById('panel')
      const step = () => {
        window.__morphSamples.push({
          t: Math.round(performance.now() - t0),
          morphing: document.body.classList.contains('morphing'),
          panel: Math.round(panel.getBoundingClientRect().height),
          strip: Math.round(strip.getBoundingClientRect().height),
          deck: Math.round(deck.getBoundingClientRect().height),
          so: +getComputedStyle(strip).opacity,
          dop: +getComputedStyle(deck).opacity
        })
        if (performance.now() - t0 < ${ms}) requestAnimationFrame(step)
      }
      requestAnimationFrame(step)
    })()`)
    await evaluate(trigger)
    await sleep(ms + 260)
    return (await evaluate('window.__morphSamples')).filter((s) => s.morphing)
  }

  const collapseFrames = await sampleMorph("document.querySelector('.deck-head [data-action=\"collapse\"]').click()")
  report.firstLaunch.morph = {
    frames: collapseFrames.length,
    panelFrom: collapseFrames[0]?.panel,
    panelTo: collapseFrames.at(-1)?.panel,
    dimmest: Math.min(...collapseFrames.map((s) => Math.max(s.so, s.dop))),
    deckHeights: [Math.min(...collapseFrames.map((s) => s.deck)), Math.max(...collapseFrames.map((s) => s.deck))],
    stripHeights: [Math.min(...collapseFrames.map((s) => s.strip)), Math.max(...collapseFrames.map((s) => s.strip))]
  }
  assert.ok(report.firstLaunch.morph.frames >= 5, `morph sampled only ${report.firstLaunch.morph.frames} frames`)
  assert.ok(
    report.firstLaunch.morph.panelTo < report.firstLaunch.morph.panelFrom - 400,
    `window did not animate: ${report.firstLaunch.morph.panelFrom} -> ${report.firstLaunch.morph.panelTo}`
  )
  assert.ok(
    report.firstLaunch.morph.dimmest > 0.45,
    `card went empty mid-morph (best opacity ${report.firstLaunch.morph.dimmest})`
  )
  // Neither view may be stretched by the moving edge: across the whole morph
  // each one's height only moves inside its own scale envelope (0.972..1.014).
  const [deckLo, deckHi] = report.firstLaunch.morph.deckHeights
  const [stripLo, stripHi] = report.firstLaunch.morph.stripHeights
  assert.ok(deckHi - deckLo <= 20, `deck stretched during morph: ${deckLo}..${deckHi}`)
  assert.ok(stripHi - stripLo <= 10, `strip stretched during morph: ${stripLo}..${stripHi}`)

  // collapse + persisted view
  await waitFor('collapsed', `${viewExpr('view-strip')} && window.innerWidth < 560`)
  await waitConfig((config) => config.view === 'strip', 'view strip')
  report.firstLaunch.collapsed = await evaluate(`({
    view: document.body.className,
    inner: [window.innerWidth, window.innerHeight],
    runway: document.getElementById('stripRunway').textContent
  })`)
  assert.equal(report.firstLaunch.collapsed.runway, '19.8')

  await evaluate("document.querySelector('.strip-main').click()")
  await waitFor('expanded again', `${viewExpr('view-deck')} && window.innerWidth > 520`)
  await waitConfig((config) => config.view === 'deck', 'view deck')

  // live credential error and encrypted storage
  await evaluate("document.querySelector('.deck-head [data-action=\"settings\"]').click()")
  await waitFor('settings for credentials', "document.getElementById('settingsSheet').classList.contains('open')")
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
  const stored = await waitConfig((config) => config.demo === false, 'demo off')
  report.credential.store = {
    encrypted: String(stored.apiKeyEnc).startsWith('enc:'),
    leaked: JSON.stringify(stored).includes('sk-test-invalid-9876'),
    sessionEmpty: !stored.sessionTokenEnc
  }
  assert.equal(report.credential.store.encrypted, true)
  assert.equal(report.credential.store.leaked, false)
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
