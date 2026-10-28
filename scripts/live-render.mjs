import { spawn } from 'node:child_process'
import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import { createRequire } from 'node:module'
import { fileURLToPath } from 'node:url'

const require = createRequire(import.meta.url)
const electronBinary = require('electron')
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const profile = fs.mkdtempSync(path.join(os.tmpdir(), 'token-monitor-live-'))
const port = 9700 + Math.floor(Math.random() * 200)
const sleep = (ms) => new Promise((r) => setTimeout(r, ms))
const shots = path.join(root, 'shots')
fs.mkdirSync(shots, { recursive: true })

const env = { ...process.env }
delete env.ELECTRON_RUN_AS_NODE

const useExe = process.env.LIVE_EXE === '1'
const exePath = path.join(root, 'dist', 'Token Monitor-win32-x64', 'Token Monitor.exe')
const child = spawn(
  useExe ? exePath : electronBinary,
  useExe ? [`--remote-debugging-port=${port}`, `--user-data-dir=${profile}`] : [root, `--remote-debugging-port=${port}`, `--user-data-dir=${profile}`],
  { env, stdio: ['ignore', 'pipe', 'pipe'] }
)
let stderr = ''
child.stderr.on('data', (c) => (stderr += String(c)))

let ws = null
const out = {}
try {
  const page = await (async () => {
    const end = Date.now() + 25000
    while (Date.now() < end) {
      try {
        const list = await (await fetch(`http://127.0.0.1:${port}/json/list`)).json()
        const hit = list.find((t) => t.type === 'page' && t.url.includes('renderer/index.html'))
        if (hit) return hit
      } catch {}
      await sleep(300)
    }
    throw new Error('no page')
  })()

  ws = new WebSocket(page.webSocketDebuggerUrl)
  await new Promise((res, rej) => {
    ws.addEventListener('open', res, { once: true })
    ws.addEventListener('error', rej, { once: true })
  })
  let id = 1
  const pending = new Map()
  ws.addEventListener('message', (e) => {
    const m = JSON.parse(String(e.data))
    if (!m.id || !pending.has(m.id)) return
    const w = pending.get(m.id)
    pending.delete(m.id)
    m.error ? w.rej(new Error(m.error.message)) : w.res(m.result)
  })
  const call = (method, params = {}) =>
    new Promise((res, rej) => {
      const mid = id++
      pending.set(mid, { res, rej })
      ws.send(JSON.stringify({ id: mid, method, params }))
      setTimeout(() => {
        if (pending.has(mid)) {
          pending.delete(mid)
          rej(new Error(`timeout ${method}`))
        }
      }, 20000)
    })
  const evaluate = async (expression) => {
    const r = await call('Runtime.evaluate', { expression, awaitPromise: true, returnByValue: true, userGesture: true })
    if (r.exceptionDetails) throw new Error(r.exceptionDetails.text)
    return r.result?.value
  }
  const waitFor = async (expr, ms = 20000) => {
    const end = Date.now() + ms
    while (Date.now() < end) {
      if (await evaluate(expr)) return
      await sleep(180)
    }
    throw new Error(`wait: ${expr}`)
  }
  const capture = async (name) => {
    const shot = await call('Page.captureScreenshot', { format: 'png', fromSurface: true, captureBeyondViewport: false })
    fs.writeFileSync(path.join(shots, name), Buffer.from(shot.data, 'base64'))
    out[name] = 'ok'
  }

  await call('Runtime.enable')
  await waitFor("document.getElementById('stripBalance')?.textContent?.trim() === '¥145.09'")
  await sleep(500)
  out.window = await evaluate(`({ x: window.screenX, y: window.screenY, w: window.outerWidth, h: window.outerHeight, dpr: window.devicePixelRatio })`)
  out.strip = await evaluate(`(() => {
    const panel = document.getElementById('panel')
    const cs = getComputedStyle(panel)
    return {
      view: document.body.className,
      inner: [window.innerWidth, window.innerHeight],
      panelBg: cs.background.slice(0, 60),
      radius: cs.borderTopLeftRadius,
      gauge: document.getElementById('stripGauge').className,
      fonts: { inter: document.fonts.check('600 16px Inter'), misans: document.fonts.check('400 12px MiSans') },
      dataFont: getComputedStyle(document.getElementById('stripRunway')).fontFamily,
      size: getComputedStyle(document.getElementById('stripRunway')).fontSize
    }
  })()`)
  await capture('live-strip.png')

  await evaluate("document.querySelector('.strip-main').click()")
  await waitFor("document.body.classList.contains('view-deck') && window.innerWidth === 576")
  await sleep(700)
  out.deck = await evaluate(`(() => {
    const panel = document.getElementById('panel')
    const cs = getComputedStyle(panel)
    const ring = document.querySelector('#gaugeSvg .ring-progress')
    return {
      inner: [window.innerWidth, window.innerHeight],
      panelBg: cs.background.slice(0, 60),
      ringStroke: ring ? getComputedStyle(ring).stroke : null,
      ringDash: ring ? ring.style.strokeDashoffset : null,
      gaugeClass: document.getElementById('gauge').className,
      scroll: (() => { const s = document.getElementById('deckScroll'); return [s.scrollHeight, s.clientHeight] })(),
      layout: (() => {
        const rect = (node) => (node ? Math.round(node.getBoundingClientRect().bottom) : null)
        const scroll = document.getElementById('deckScroll')
        const last = scroll.querySelector('.outlook')
        return {
          scrollTop: rect(scroll) - scroll.clientHeight,
          lastSectionBottom: rect(last),
          scrollClientBottom: rect(scroll),
          chart: Math.round(document.getElementById('chartWrap').getBoundingClientRect().height),
          pad: getComputedStyle(scroll).padding,
          deep: [...scroll.querySelectorAll('*')]
            .map((n) => ({ b: Math.round(n.getBoundingClientRect().bottom), t: (n.tagName + '.' + (n.className || '')).slice(0, 34) }))
            .filter((o) => o.b > 762)
            .slice(0, 8),
          children: [...scroll.children].map((c) => { const r = c.getBoundingClientRect(); return c.className + ':' + Math.round(r.height) + '@' + Math.round(r.top) })
        }
      })(),
      runway: document.getElementById('deckRunway').textContent
    }
  })()`)
  await capture('live-deck.png')

  await evaluate("document.querySelector('.deck-head [data-action=\"settings\"]').click()")
  await waitFor("document.getElementById('settingsSheet').classList.contains('open')")
  await sleep(500)
  out.settings = await evaluate(`(() => {
    const sheet = document.getElementById('settingsSheet')
    const scroller = sheet.querySelector('.settings-scroll')
    return {
      open: sheet.classList.contains('open'),
      scrollHeight: scroller.scrollHeight,
      clientHeight: scroller.clientHeight,
      overflowing: scroller.scrollHeight > scroller.clientHeight + 1,
      switchW: getComputedStyle(document.getElementById('demoSwitch')).width,
      version: document.getElementById('versionText').textContent
    }
  })()`)
  await capture('live-settings.png')

  await evaluate("document.querySelector('#themeSeg [data-theme=\"dark\"]').click()")
  await evaluate("document.getElementById('saveBtn').click()")
  await waitFor("!document.getElementById('settingsSheet').classList.contains('open') && document.body.classList.contains('theme-dark')")
  await sleep(600)
  out.dark = await evaluate(`(() => {
    const panel = document.getElementById('panel')
    return {
      theme: document.body.className,
      panelBg: getComputedStyle(panel).background.slice(0, 60),
      runway: document.getElementById('deckRunway').textContent
    }
  })()`)
  await capture('live-dark.png')

  // Leave the profile (and, in the worst case, the real one) in the default state.
  await evaluate("document.querySelector('.deck-head [data-action=\"settings\"]').click()")
  await waitFor("document.getElementById('settingsSheet').classList.contains('open')")
  await evaluate("document.querySelector('#themeSeg [data-theme=\"light\"]').click()")
  await evaluate("document.getElementById('saveBtn').click()")
  await waitFor("!document.getElementById('settingsSheet').classList.contains('open') && document.body.classList.contains('theme-light')")
  await evaluate("document.querySelector('.deck-head [data-action=\"collapse\"]').click()")
  await waitFor("document.body.classList.contains('view-strip')")
  await sleep(400)

  await evaluate('window.tm.quit()')
  await sleep(700)
  if (child.exitCode == null) child.kill()
  try { fs.rmSync(profile, { recursive: true, force: true }) } catch {}
  console.log(JSON.stringify(out, null, 2))
} catch (error) {
  if (ws) ws.close()
  if (child.exitCode == null) child.kill()
  try { fs.rmSync(profile, { recursive: true, force: true }) } catch {}
  console.error(error?.stack || String(error))
  if (stderr) console.error(stderr.slice(-3000))
  process.exit(1)
}