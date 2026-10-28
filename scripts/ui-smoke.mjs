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
      misans: document.fonts.check('400 12px MiSans')
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
  assert.equal(report.firstLaunch.deck.fonts.misans, true)
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
  const sampleMorph = async (trigger) => {
    await waitFor('morph idle', `!${viewExpr('morphing')}`)
    // Start the trigger and rAF sampling in the same CDP call. Keep sampling
    // for the bootstrap duration AND until morphing ends, including slow CI.
    return evaluate(`new Promise((resolve) => {
      const samples = []
      const t0 = performance.now()
      const strip = document.getElementById('stripView')
      const deck = document.getElementById('deckView')
      const panel = document.getElementById('panel')
      const before = Math.round(panel.getBoundingClientRect().height)
      const step = () => {
        const elapsed = performance.now() - t0
        const morphing = document.body.classList.contains('morphing')
        samples.push({
          t: Math.round(elapsed), morphing,
          panel: Math.round(panel.getBoundingClientRect().height),
          strip: Math.round(strip.getBoundingClientRect().height),
          deck: Math.round(deck.getBoundingClientRect().height),
          so: +getComputedStyle(strip).opacity,
          dop: +getComputedStyle(deck).opacity
        })
        if (elapsed < ${boot.morphMs} || morphing) requestAnimationFrame(step)
        else resolve({ samples, before, after: Math.round(panel.getBoundingClientRect().height) })
      }
      requestAnimationFrame(step)
      ${trigger}
    })`)
  }

  const collapse = await sampleMorph("document.querySelector('.deck-head [data-action=\"collapse\"]').click()")
  const collapseFrames = collapse.samples.filter((s) => s.morphing)
  const panelDelta = collapse.before - collapse.after
  report.firstLaunch.morph = {
    duration: boot.morphMs,
    sampledUntil: collapse.samples.at(-1)?.t,
    frames: collapseFrames.length,
    restingPanelFrom: collapse.before,
    restingPanelTo: collapse.after,
    panelDelta,
    panelFrom: collapseFrames[0]?.panel,
    panelTo: collapseFrames.at(-1)?.panel,
    dimmest: Math.min(...collapseFrames.map((s) => Math.max(s.so, s.dop))),
    deckHeights: [Math.min(...collapseFrames.map((s) => s.deck)), Math.max(...collapseFrames.map((s) => s.deck))],
    stripHeights: [Math.min(...collapseFrames.map((s) => s.strip)), Math.max(...collapseFrames.map((s) => s.strip))]
  }
  assert.ok(report.firstLaunch.morph.frames >= 3, `morph sampled only ${report.firstLaunch.morph.frames} frames`)
  assert.ok(panelDelta > 0, `collapse did not shrink the panel: ${collapse.before} -> ${collapse.after}`)
  assert.ok(
    report.firstLaunch.morph.panelFrom - report.firstLaunch.morph.panelTo >= panelDelta * 0.75,
    `window did not animate most of its actual ${panelDelta}px change: ${report.firstLaunch.morph.panelFrom} -> ${report.firstLaunch.morph.panelTo}`
  )
  assert.ok(
    collapseFrames.some((s) => s.panel < collapse.before - 1 && s.panel > collapse.after + 1),
    'morph must include an intermediate panel size, not just an instant jump'
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
