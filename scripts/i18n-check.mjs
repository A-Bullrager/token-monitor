// Chromium locale / language environment check. The UI ships in Chinese and
// English; 'auto' resolves from the browser language, so each scenario below
// also asserts WHICH language the interface came up in, that no Chinese text
// survives in English mode, and that the numbers mean the same thing in both.
// The timezone scenarios use CDP emulation, which does not change the host OS
// or the Electron main process. Each scenario gets a fresh profile with CJK
// characters and spaces, and exercises strip/light, deck/light, settings/light
// and deck/dark. Only fixed demo values are compared with the zh baseline.
//
// FontFace loading, DOM corpus membership and a representative monospace CJK
// label's actual platform font are checked in Chinese mode. This is NOT a full
// font cmap or per-glyph fallback audit, native menu test, or encryption
// round-trip test.
// Usage: node scripts/i18n-check.mjs [--keep-shots]
import { spawn } from 'node:child_process'
import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import process from 'node:process'
import { createRequire } from 'node:module'
import { fileURLToPath } from 'node:url'

const require = createRequire(import.meta.url)
const electronBinary = require('electron')
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const corpusFile = path.join(root, 'scripts', 'font-corpus.txt')
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms))
const keepShots = process.argv.includes('--keep-shots') || process.env.CI === 'true'
const shotDir = keepShots
  ? path.join(root, 'shots', 'i18n')
  : fs.mkdtempSync(path.join(os.tmpdir(), 'token-monitor-i18n-'))
fs.mkdirSync(shotDir, { recursive: true })
// Keep the mkdtemp parent so successful cleanup also removes its CJK children.
const profileParent = fs.mkdtempSync(path.join(os.tmpdir(), 'tm-i18n-'))

const SCENARIOS = [
  { name: 'zh', lang: 'zh-CN' },
  { name: 'en', lang: 'en-US' },
  { name: 'ja', lang: 'ja-JP' },
  { name: 'de', lang: 'de-DE' },
  { name: 'fr', lang: 'fr-FR' },
  { name: 'ko', lang: 'ko-KR' },
  { name: 'ar', lang: 'ar-SA' },
  { name: 'tz+', lang: 'zh-CN', tz: 'Pacific/Kiritimati', offsetMinutes: -840 },
  { name: 'tz-', lang: 'zh-CN', tz: 'Pacific/Niue', offsetMinutes: 660 },
  // The picker must win over the browser language in both directions.
  { name: 'force-en', lang: 'zh-CN', locale: 'en' },
  { name: 'force-zh', lang: 'en-US', locale: 'zh' }
]
// 'auto' is the shipped default: Chinese stays Chinese, everything else gets
// the English interface, which is what the assertions below check per scenario.
const expectedLocale = (scenario) => scenario.locale || (/^zh/i.test(scenario.lang) ? 'zh' : 'en')
// 万 / 亿 and compact K / M / B describe the same quantity in different groupings.
const COUNT_UNITS = { 亿: 1e8, 万: 1e4, K: 1e3, M: 1e6, B: 1e9 }
function countValue(text) {
  const match = String(text).replace(/,/g, '').match(/([\d.]+)\s?(亿|万|K|M|B)?/)
  if (!match) return null
  return Number(match[1]) * (COUNT_UNITS[match[2]] || 1)
}
const CJK_VISIBLE = /[一-鿿-﫿]/
const EXPECTED_STATES = {
  strip: { view: 'strip', theme: 'light', settingsOpen: false },
  deck: { view: 'deck', theme: 'light', settingsOpen: false },
  settings: { view: 'deck', theme: 'light', settingsOpen: true },
  dark: { view: 'deck', theme: 'dark', settingsOpen: false }
}
const NUMERIC_PROBES = ['balance', 'runway', 'today', 'tokens']

// Collect DOM text plus tooltip / placeholder / accessibility strings in the
// exercised states. This is a character-set check, not pixel/glyph coverage.
const COLLECT = `(() => {
  const chars = new Set()
  const add = (text) => { for (const ch of String(text || '')) chars.add(ch) }
  const visible = (el) => {
    if (!el || !el.getClientRects().length) return false
    for (let node = el; node; node = node.parentElement) {
      const style = getComputedStyle(node)
      if (node.hidden || style.display === 'none' || style.visibility === 'hidden' || Number(style.opacity) === 0) return false
    }
    return true
  }
  const walk = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT)
  let node
  while ((node = walk.nextNode())) {
    const host = node.parentElement
    if (!host || host.tagName === 'STYLE' || host.tagName === 'SCRIPT') continue
    if (visible(host)) add(node.nodeValue)
  }
  for (const el of document.querySelectorAll('[title],[placeholder],[aria-label]')) {
    if (!visible(el)) continue
    add(el.getAttribute('title'))
    add(el.getAttribute('placeholder'))
    add(el.getAttribute('aria-label'))
  }
  const body = document.body.classList
  const strip = body.contains('view-strip')
  const text = (id) => document.getElementById(id)?.textContent?.trim() || ''
  const sheet = document.getElementById('settingsSheet')
  return {
    chars: [...chars].join(''),
    // Chinese glyphs still on screen in English mode.
    cjk: (() => {
      const found = new Set()
      const scan = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT)
      let text
      while ((text = scan.nextNode())) {
        const host = text.parentElement
        if (!host || !visible(host)) continue
        for (const ch of text.nodeValue) if (/[\\u4e00-\\u9fff]/.test(ch)) found.add(ch)
      }
      return [...found].join('')
    })(),
    untranslated: window.TmI18n ? window.TmI18n.untranslated.slice() : null,
    lang: document.documentElement.lang,
    locale: {
      language: navigator.language,
      languages: [...navigator.languages],
      timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      offsetMinutes: new Date().getTimezoneOffset()
    },
    ui: {
      classes: document.body.className,
      views: ['strip', 'deck'].filter((view) => body.contains('view-' + view)),
      themes: ['light', 'dark'].filter((theme) => body.contains('theme-' + theme)),
      stripVisible: visible(document.getElementById('stripView')),
      deckVisible: visible(document.getElementById('deckView')),
      morphing: body.contains('morphing'),
      settingsOpen: sheet?.classList.contains('open') || false,
      settingsAriaHidden: sheet?.getAttribute('aria-hidden'),
      demoVisible: visible(document.getElementById(strip ? 'stripDemoTag' : 'deckDemoTag'))
    },
    fonts: {
      interLoaded: document.fonts.check('600 16px Inter'),
      misansLoaded: document.fonts.check('400 12px MiSans'),
      faces: [...document.fonts].map((face) => ({
        family: face.family.replace(/["']/g, ''), weight: face.weight, status: face.status
      }))
    },
    // Select the actual view, never a nonempty but hidden deck element.
    probes: {
      balance: text(strip ? 'stripBalance' : 'deckBalance'),
      runway: text(strip ? 'stripRunway' : 'deckRunway'),
      today: text(strip ? 'stripToday' : 'deckToday'),
      tokens: text(strip ? 'stripTokens' : 'deckTodayTokens')
    }
  }
})()`

const results = []
const assert = (condition, message) => {
  if (!condition) throw new Error(message)
}
async function withTimeout(promise, ms, label) {
  let timer
  try {
    return await Promise.race([
      promise,
      new Promise((_, reject) => { timer = setTimeout(() => reject(new Error(`timeout ${label}`)), ms) })
    ])
  } finally {
    clearTimeout(timer)
  }
}

function validateState(scenario, state, data) {
  const label = `${scenario.name}/${state}`
  const expected = EXPECTED_STATES[state]
  const requested = scenario.lang.toLowerCase()
  const actual = data.locale.language.toLowerCase()
  // Chromium ships some locales as language-only resources (ja-JP -> ja).
  // Accept that canonical form, but never accept a different language/region.
  assert(actual === requested || actual === requested.split('-')[0],
    `${label}: expected navigator.language=${scenario.lang} or its language-only form, got ${data.locale.language}`)
  const expectedUi = scenario.expectedUiLocale || expectedLocale(scenario)
  assert(data.lang === (expectedUi === 'en' ? 'en' : 'zh-CN'),
    `${label}: <html lang> must be ${expectedUi === 'en' ? 'en' : 'zh-CN'}, got ${data.lang}`)
  if (expectedUi === 'en') {
    assert(!data.cjk, `${label}: Chinese text survived in English mode: ${data.cjk}`)
    assert(Array.isArray(data.untranslated) && data.untranslated.length === 0,
      `${label}: the dictionary could not translate ${JSON.stringify(data.untranslated)}`)
  } else {
    assert(data.cjk.length > 0, `${label}: Chinese mode displayed no Chinese at all`)
  }
  if (scenario.tz) {
    assert(data.locale.timeZone === scenario.tz && data.locale.offsetMinutes === scenario.offsetMinutes,
      `${label}: Chromium timezone override failed: ${JSON.stringify(data.locale)}`)
  }
  assert(data.ui.views.length === 1 && data.ui.views[0] === expected.view &&
    data.ui.themes.length === 1 && data.ui.themes[0] === expected.theme &&
    data.ui.stripVisible === (expected.view === 'strip') &&
    data.ui.deckVisible === (expected.view === 'deck') && !data.ui.morphing &&
    data.ui.settingsOpen === expected.settingsOpen &&
    data.ui.settingsAriaHidden === String(!expected.settingsOpen) && data.ui.demoVisible,
  `${label}: unexpected actual UI state: ${JSON.stringify(data.ui)}`)
  for (const [family, loaded] of [['Inter', data.fonts.interLoaded], ['MiSans', data.fonts.misansLoaded]]) {
    // FontFaceSet.check can succeed even when the requested family is absent,
    // so the face status is inspected as well. MiSans is only *required* where
    // Chinese is on screen: with no CJK glyph in use, the browser legitimately
    // never fetches it and the face stays "unloaded".
    const required = family === 'Inter' || expectedUi === 'zh'
    if (!required) {
      assert(!loaded || data.fonts.faces.some((face) => face.family === family && face.status === 'loaded'),
        `${label}: MiSans reported loaded without a loaded face: ${JSON.stringify(data.fonts)}`)
      continue
    }
    assert(loaded && data.fonts.faces.some((face) => face.family === family && face.status === 'loaded'),
      `${label}: ${family} webfont not loaded: ${JSON.stringify(data.fonts)}`)
  }
  for (const probe of NUMERIC_PROBES) {
    assert(/\d/.test(data.probes[probe]), `${label}: missing numeric demo probe ${probe}`)
  }
  if (scenario.name !== 'zh') {
    const baseline = results.find((run) => run.name === 'zh').states[state].probes
    for (const probe of NUMERIC_PROBES) {
      if (probe === 'tokens') {
        // Token counts are grouped by 万/亿 in Chinese and by K/M/B in English;
        // compare the quantity they both describe, not the spelling.
        const left = countValue(data.probes[probe])
        const right = countValue(baseline[probe])
        assert(left !== null && right !== null,
          `${label}: cannot compare token counts ${data.probes[probe]} / ${baseline[probe]}`)
        assert(Math.abs(left - right) / Math.max(1, right) < 0.02,
          `${label}: token count differs from zh-CN: ${data.probes[probe]} vs ${baseline[probe]}`)
        continue
      }
      assert(data.probes[probe] === baseline[probe],
        `${label}: ${probe} differs from zh-CN: ${JSON.stringify(data.probes[probe])} != ${JSON.stringify(baseline[probe])}`)
    }
  }
}

async function runScenario(scenario) {
  const profileDir = path.join(profileParent, `${scenario.name} 中文 目录 测试`)
  fs.mkdirSync(profileDir)
  const env = { ...process.env }
  delete env.ELECTRON_RUN_AS_NODE
  // Do not use env.TZ: it does not reliably affect Chromium across platforms.
  // Port 0 and the child's own debugger URL avoid attaching to another app.
  const args = [
    root, '--remote-debugging-port=0', `--user-data-dir=${profileDir}`, `--lang=${scenario.lang}`,
    ...(scenario.locale ? [`--locale=${scenario.locale}`] : [])
  ]
  const entry = {
    name: scenario.name, lang: scenario.lang, chromiumTimeZone: scenario.tz || null,
    forcedLocale: scenario.locale || null, expectedUiLocale: expectedLocale(scenario),
    profileDir, configFile: path.join(profileDir, 'config.json'), states: {}
  }
  results.push(entry) // Preserve partial results if any assertion fails.
  assert(!fs.existsSync(entry.configFile), `${scenario.name}: profile is not fresh`)
  const child = spawn(electronBinary, args, { cwd: root, env, stdio: ['ignore', 'pipe', 'pipe'] })
  let output = ''
  let spawnError = null
  let childClosed = false
  child.on('error', (error) => { spawnError = error })
  const closed = new Promise((resolve) => child.once('close', (code, signal) => {
    childClosed = true
    resolve({ code, signal })
  }))
  for (const stream of [child.stdout, child.stderr]) {
    stream.on('data', (chunk) => { output = (output + String(chunk)).slice(-16000) })
  }

  let ws = null
  let shoot = null
  const pending = new Map()
  const rejectPending = () => {
    for (const waiter of pending.values()) {
      clearTimeout(waiter.timer)
      waiter.reject(new Error('CDP connection closed'))
    }
    pending.clear()
  }
  try {
    const target = await (async () => {
      const deadline = Date.now() + 30000
      while (Date.now() < deadline) {
        if (spawnError) throw spawnError
        assert(!childClosed, `Electron exited before CDP was ready: ${output}`)
        const port = output.match(/DevTools listening on ws:\/\/127\.0\.0\.1:(\d+)\//)?.[1]
        if (port) {
          try {
            const list = await (await fetch(`http://127.0.0.1:${port}/json/list`, { signal: AbortSignal.timeout(1000) })).json()
            const hit = list.find((item) => item.type === 'page' && item.url.includes('renderer/index.html'))
            if (hit) return hit
          } catch {
            /* not up yet */
          }
        }
        await sleep(250)
      }
      throw new Error(`no CDP page\n${output}`)
    })()

    ws = new WebSocket(target.webSocketDebuggerUrl)
    await withTimeout(new Promise((resolve, reject) => {
      ws.addEventListener('open', resolve, { once: true })
      ws.addEventListener('error', reject, { once: true })
    }), 10000, 'CDP connection')
    let id = 1
    ws.addEventListener('close', rejectPending)
    ws.addEventListener('message', (event) => {
      const message = JSON.parse(String(event.data))
      if (!message.id || !pending.has(message.id)) return
      const waiter = pending.get(message.id)
      pending.delete(message.id)
      clearTimeout(waiter.timer)
      message.error ? waiter.reject(new Error(message.error.message)) : waiter.resolve(message.result)
    })
    const call = (method, params = {}) => new Promise((resolve, reject) => {
      if (ws.readyState !== WebSocket.OPEN) return reject(new Error('CDP is not open'))
      const mid = id++
      const timer = setTimeout(() => {
        pending.delete(mid)
        reject(new Error(`timeout ${method}`))
      }, 20000)
      pending.set(mid, { resolve, reject, timer })
      ws.send(JSON.stringify({ id: mid, method, params }))
    })
    const evaluate = async (expression) => {
      const result = await call('Runtime.evaluate', { expression, awaitPromise: true, returnByValue: true, userGesture: true })
      if (result.exceptionDetails) throw new Error(result.exceptionDetails.exception?.description || result.exceptionDetails.text)
      return result.result?.value
    }
    const waitFor = async (expression, label, timeout = 25000) => {
      const deadline = Date.now() + timeout
      while (Date.now() < deadline) {
        if (await evaluate(expression)) return
        await sleep(150)
      }
      throw new Error(`timeout waiting for ${label}`)
    }
    shoot = async (file) => {
      const shot = await call('Page.captureScreenshot', { format: 'png', fromSurface: true })
      fs.writeFileSync(path.join(shotDir, file), Buffer.from(shot.data, 'base64'))
    }
    const capture = async (state) => {
      await evaluate('document.fonts.ready.then(() => true)')
      const data = await evaluate(COLLECT)
      entry.states[state] = data
      await shoot(`${scenario.name}-${state}.png`)
      validateState(scenario, state, data)
    }
    const verifyMonoCjk = async () => {
      const families = await evaluate(`({
        label: getComputedStyle(document.getElementById('connSession')).fontFamily,
        select: getComputedStyle(document.getElementById('intervalSelect')).fontFamily,
        placeholder: getComputedStyle(document.getElementById('sessionInput'), '::placeholder').fontFamily
      })`)
      for (const [element, family] of Object.entries(families)) {
        assert(family.includes('MiSans'), `${scenario.name}: ${element} needs bundled CJK font fallback: ${family}`)
      }
      // FontFaceSet.check does not prove that a label actually uses the font.
      // Inspect a real Chinese label, without changing the DOM or installing
      // system CJK fonts that could hide a missing application fallback.
      await call('DOM.enable')
      await call('CSS.enable')
      const { root: documentNode } = await call('DOM.getDocument')
      const { nodeId } = await call('DOM.querySelector', { nodeId: documentNode.nodeId, selector: '#connSession' })
      const { fonts } = await call('CSS.getPlatformFontsForNode', { nodeId })
      entry.monospaceCjk = { families, fonts }
      assert(fonts.some(font => font.isCustomFont && /MiSans/i.test(font.familyName) && font.glyphCount >= 2),
        `${scenario.name}: Chinese status label did not use bundled MiSans: ${JSON.stringify(fonts)}`)
    }
    const verifyConfig = async (theme) => {
      assert(fs.existsSync(entry.configFile), `${scenario.name}: config.json was not written in its CJK profile`)
      const disk = JSON.parse(fs.readFileSync(entry.configFile, 'utf8'))
      // No credentials are supplied, so this checks config persistence only.
      assert(disk.version === 2 && disk.demo === true && disk.view === 'deck' &&
        disk.theme === theme && disk.paceMode === '30d' && disk.apiKeyEnc === '' && disk.sessionTokenEnc === '',
      `${scenario.name}: unexpected persisted config (${theme})`)
      const boot = await evaluate('window.tm.bootstrap()')
      for (const key of ['demo', 'view', 'theme', 'paceMode', 'intervalSec', 'alwaysOnTop', 'locale']) {
        assert(disk[key] === boot.config[key], `${scenario.name}: disk/bootstrap mismatch for ${key}`)
      }
      assert(boot.view === 'deck' && !boot.config.hasApiKey && !boot.config.hasSession,
        `${scenario.name}: unexpected bootstrap view or credentials`)
      entry.configChecks ??= {}
      entry.configChecks[theme] = { written: true, matchesBootstrap: true, config: disk }
    }

    await call('Runtime.enable')
    await call('Page.enable')
    // Apply before reloading so renderer initialization sees the emulated zone.
    if (scenario.tz) {
      await call('Emulation.setTimezoneOverride', { timezoneId: scenario.tz })
      let onLoad
      const loaded = new Promise((resolve) => {
        onLoad = (event) => {
          if (JSON.parse(String(event.data)).method === 'Page.loadEventFired') resolve()
        }
        ws.addEventListener('message', onLoad)
      })
      try {
        await withTimeout(Promise.all([call('Page.reload', { ignoreCache: true }), loaded]), 25000, 'timezone reload')
      } finally {
        ws.removeEventListener('message', onLoad)
      }
    }
    await waitFor("document.getElementById('stripBalance')?.textContent?.trim() === '¥145.09'", 'demo render')
    const boot = await evaluate('window.tm.bootstrap()')
    // main.js app:bootstrap reports these fields; neither proves encryption.
    entry.bootstrap = { platform: boot.platform, locale: boot.locale, encryption: boot.encryption, view: boot.view, config: boot.config }
    assert(boot.locale === expectedLocale(scenario),
      `${scenario.name}: the app resolved ${boot.locale}, expected ${expectedLocale(scenario)}`)
    assert(boot.config.demo === true && !boot.config.hasApiKey && !boot.config.hasSession &&
      boot.view === 'strip' && boot.config.view === 'strip' && boot.config.theme === 'light',
    `${scenario.name}: expected fresh demo/strip/light bootstrap without credentials`)
    await capture('strip')

    await evaluate("document.querySelector('.strip-main').click()")
    await waitFor("document.body.classList.contains('view-deck') && !document.body.classList.contains('morphing')", 'settled deck view')
    await capture('deck')
    await verifyConfig('light')

    await evaluate("document.querySelector('.deck-head [data-action=\"settings\"]').click()")
    await waitFor("document.getElementById('settingsSheet').classList.contains('open')", 'settings open')
    await sleep(400) // Allow the settings sheet transition to finish for capture.
    await capture('settings')
    // The bundled-font check needs a Chinese label; English mode shows ASCII
    // there, so it only applies where CJK is actually on screen.
    if (expectedLocale(scenario) === 'zh') await verifyMonoCjk()

    await evaluate("document.querySelector('#themeSeg [data-theme=\"dark\"]').click()")
    await evaluate("document.getElementById('saveBtn').click()")
    await waitFor("document.body.classList.contains('theme-dark') && !document.getElementById('settingsSheet').classList.contains('open') && !document.getElementById('saveBtn').disabled", 'saved dark theme')
    await sleep(400)
    await capture('dark')
    await verifyConfig('dark')
    entry.numericComparison = scenario.name === 'zh' ? 'zh-CN baseline' : 'matches zh-CN in all four states'
    entry.title = await evaluate('document.title') // Report only; native surfaces are not tested.
    let quitDisconnected = false
    try {
      await evaluate('window.tm.quit()')
    } catch (error) {
      // app.quit() can close CDP before Runtime.evaluate replies. Only accept
      // this exact shutdown race; earlier disconnects and other errors fail.
      if (error?.message !== 'CDP connection closed') throw error
      quitDisconnected = true
    }
    const exit = await withTimeout(closed, 10000, 'Electron shutdown')
    entry.shutdown = { ...exit, quitDisconnected }
    assert(exit.code === 0 && exit.signal == null, `${scenario.name}: Electron exited with ${JSON.stringify(exit)}`)
  } catch (error) {
    entry.error = error?.stack || String(error)
    if (shoot && ws?.readyState === WebSocket.OPEN) {
      try { await shoot(`${scenario.name}-failure.png`) } catch { /* retain other diagnostics */ }
    }
    throw new Error(`${scenario.name}: ${error?.message || String(error)}`)
  } finally {
    rejectPending()
    if (ws && ws.readyState !== WebSocket.CLOSED) ws.close()
    try {
      if (!childClosed) {
        child.kill()
        await withTimeout(closed, 10000, 'Electron termination')
      }
    } finally {
      entry.processOutput = output
    }
  }
}

const summary = {
  scope: 'Chinese and English UI under Chromium language environments; the UI ships in these two languages only, not in the host OS language of each scenario',
  uiLocaleScope: 'auto resolves Chinese browser languages to the Chinese UI and everything else to English; force-en / force-zh check the manual override',
  timezoneScope: 'CDP Chromium timezone emulation only; host OS and main process timezone unchanged',
  fontScope: 'FontFace loading, corpus membership and, in Chinese mode, a representative monospace CJK label actual platform font; no exhaustive cmap/fallback audit',
  encryptionScope: 'bootstrap platform/encryption are reported only; no credential or encryption round-trip tests',
  numericProbes: NUMERIC_PROBES,
  profileParent,
  shots: shotDir,
  scenarios: results
}
try {
  for (const scenario of SCENARIOS) await runScenario(scenario)

  const corpus = new Set([...fs.readFileSync(corpusFile, 'utf8').replace(/\r?\n/g, '')])
  const collected = new Set(results.flatMap((run) => Object.values(run.states).flatMap((state) => [...state.chars])))
  // Exclude whitespace and control characters from this membership check.
  const missing = [...collected].filter((ch) => !corpus.has(ch) && ch.trim() !== '' && ch.codePointAt(0) >= 0x20)

  // Heuristic source-literal inventory, not necessarily UI text. Native menus,
  // rare error strings and unexercised states are not validated by this script.
  const sourceText = ['main.js', 'preload.js', 'renderer/app.js', 'renderer/index.html', 'lib/deepseek.js', 'lib/demo.js']
    .map((file) => fs.readFileSync(path.join(root, file), 'utf8'))
    .join('\n')
  const sourceChars = new Set()
  for (const match of sourceText.matchAll(/'([^'\\\n]*)'|"([^"\\\n]*)"|`([^`\\]*)`/g)) {
    for (const ch of (match[1] ?? match[2] ?? match[3] ?? '')) sourceChars.add(ch)
  }
  summary.collectedDistinct = collected.size
  summary.corpusDistinct = corpus.size
  summary.missingFromCorpus = missing
  summary.sourceOnlyOutsideCorpus = [...sourceChars].filter((ch) => !corpus.has(ch) && !collected.has(ch) && ch.trim() !== '')
  assert(!missing.length, `${missing.length} collected characters are not in scripts/font-corpus.txt: ${missing.join('')}`)

  // --keep-shots retains screenshots only, never successful temporary profiles.
  fs.rmSync(profileParent, { recursive: true, force: true, maxRetries: 5, retryDelay: 200 })
  if (!keepShots) fs.rmSync(shotDir, { recursive: true, force: true, maxRetries: 5, retryDelay: 200 })
  summary.profilesRemoved = true
  summary.shotsRetained = keepShots
  if (keepShots) fs.writeFileSync(path.join(shotDir, 'report.json'), JSON.stringify(summary, null, 2))
  console.log(JSON.stringify(summary, null, 2))
  console.log(`\nLanguage environment check passed: ${results.length} scenarios; ${collected.size} collected characters present in the corpus (not cmap/fallback proof).`)
} catch (error) {
  summary.error = error?.stack || String(error)
  summary.profilesRetained = fs.existsSync(profileParent)
  summary.shotsRetained = true
  const diagnosticFile = path.join(shotDir, 'diagnostics.json')
  try {
    fs.mkdirSync(shotDir, { recursive: true })
    fs.writeFileSync(diagnosticFile, JSON.stringify(summary, null, 2), 'utf8')
  } catch (diagnosticError) {
    console.error(`Could not write diagnostics: ${diagnosticError.message}`)
  }
  console.error(JSON.stringify(summary, null, 2))
  console.error(`FAIL: ${error?.message || String(error)}\nRetained diagnostics: ${diagnosticFile}\nProfiles: ${profileParent}`)
  process.exitCode = 1
}
