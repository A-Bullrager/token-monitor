// Inspects the strip <-> deck morph frame by frame.
//  - a rAF sampler in the page records window size and the opacity of both
//    views, so "was there ever an empty card" is answered with numbers;
//  - a screenshot burst records what it actually looked like.
// Usage: node scripts/morph-cast.mjs [outDir]
import { spawn } from 'node:child_process'
import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import { createRequire } from 'node:module'
import { fileURLToPath } from 'node:url'

const require = createRequire(import.meta.url)
const electronBinary = require('electron')
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const outDir = process.argv[2] || path.join(os.tmpdir(), 'token-monitor-morph')
const profile = fs.mkdtempSync(path.join(os.tmpdir(), 'token-monitor-morph-profile-'))
const port = 9700 + Math.floor(Math.random() * 200)
const sleep = (ms) => new Promise((r) => setTimeout(r, ms))

fs.rmSync(outDir, { recursive: true, force: true })
fs.mkdirSync(outDir, { recursive: true })

const env = { ...process.env }
delete env.ELECTRON_RUN_AS_NODE

const child = spawn(electronBinary, [root, `--remote-debugging-port=${port}`, `--user-data-dir=${profile}`], {
  env,
  stdio: ['ignore', 'pipe', 'pipe']
})
let stderr = ''
child.stderr.on('data', (c) => (stderr += String(c)))
child.stdout.on('data', (c) => {
  const text = String(c)
  if (process.env.TM_MORPH_DEBUG) process.stdout.write(text)
})

const SAMPLER = `
  (() => {
    const token = {};
    window.__morphToken = token;
    window.__morph = [];
    const t0 = performance.now();
    const strip = document.getElementById('stripView');
    const deck = document.getElementById('deckView');
    const step = () => {
      if (window.__morphToken !== token) return;
      window.__morph.push({
        t: Math.round(performance.now() - t0),
        w: window.innerWidth,
        h: window.innerHeight,
        ph: Math.round(document.getElementById('panel').getBoundingClientRect().height),
        pb: Math.round(document.getElementById('panel').getBoundingClientRect().bottom),
        sh: Math.round(strip.getBoundingClientRect().height),
        sf: Math.round(strip.querySelector('.strip-foot').getBoundingClientRect().bottom),
        df: Math.round(deck.querySelector('.deck-foot').getBoundingClientRect().bottom),
        dh: Math.round(deck.getBoundingClientRect().height),
        sdisp: getComputedStyle(strip).display + '/' + getComputedStyle(strip).position,
        mh: Math.round(strip.querySelector('.strip-main').getBoundingClientRect().height),
        kids: strip.children.length,
        so: +getComputedStyle(strip).opacity,
        dop: +getComputedStyle(deck).opacity,
        cls: document.body.className.replace('theme-light ', '')
      });
      if (window.__morph.length < 400) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  })();
  'sampler armed'
`

let ws = null
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
      await sleep(150)
    }
    throw new Error(`wait: ${expr}`)
  }

  await call('Runtime.enable')
  await call('Page.enable')
  await waitFor("document.getElementById('stripBalance')?.textContent?.trim() === '¥145.09'")
  await sleep(700)

  const run = async (label, trigger, settleMs) => {
    await evaluate(SAMPLER)
    const dir = path.join(outDir, label)
    fs.mkdirSync(dir, { recursive: true })
    const shots = []
    const manifest = []
    await evaluate(trigger)
    const t0 = Date.now()
    while (Date.now() - t0 < settleMs) {
      const at = Date.now() - t0
      const shot = await call('Page.captureScreenshot', { format: 'jpeg', quality: 70, fromSurface: true })
      const name = `${String(shots.length).padStart(3, '0')}.jpg`
      fs.writeFileSync(path.join(dir, name), Buffer.from(shot.data, 'base64'))
      shots.push(name)
      manifest.push({ name, t: at })
    }
    fs.writeFileSync(path.join(dir, 'manifest.json'), JSON.stringify(manifest, null, 1))
    const samples = await evaluate("window.__morph")
    fs.writeFileSync(path.join(outDir, `${label}.json`), JSON.stringify(samples, null, 1))
    const worst = samples.reduce(
      (acc, s) => (Math.max(s.so, s.dop) < acc.min ? { min: Math.max(s.so, s.dop), t: s.t } : acc),
      { min: 2, t: null }
    )
    console.log(`${label}: ${shots.length} shots (${dir})`)
    console.log(`  samples=${samples.length} span=${samples.at(-1)?.t}ms sizes=${samples[0]?.w}x${samples[0]?.h} -> ${samples.at(-1)?.w}x${samples.at(-1)?.h}`)
    console.log(`  dimmest moment: max(strip,deck) opacity = ${worst.min} at t=${worst.t}ms`)
    console.log(
      samples
        .filter((_, i) => i % 3 === 0)
        .map((s) => `t${String(s.t).padStart(4)} win=${s.w}x${s.h} panel=${s.ph} strip=${s.sh}[${s.sdisp} kids=${s.kids} main=${s.mh}](foot@${s.sf}) deck=${s.dh}(foot@${s.df}) op=${s.so.toFixed(2)}/${s.dop.toFixed(2)}`)
        .join('\n')
    )
  }

  const settleMs = (Number(process.env.TM_MORPH_MS) || 300) + 700
  await run('expand', "document.querySelector('.strip-main').click()", settleMs)
  await waitFor("document.body.classList.contains('view-deck') && window.innerWidth === 576")
  await sleep(700)
  await run('collapse', "document.querySelector('.deck-head [data-action=\"collapse\"]').click()", settleMs)
  await waitFor("document.body.classList.contains('view-strip') && window.innerWidth === 536")

  await evaluate('window.tm.quit()')
  await sleep(600)
  if (child.exitCode == null) child.kill()
  try { fs.rmSync(profile, { recursive: true, force: true }) } catch {}
} catch (error) {
  if (ws) ws.close()
  if (child.exitCode == null) child.kill()
  try { fs.rmSync(profile, { recursive: true, force: true }) } catch {}
  console.error(error?.stack || String(error))
  if (stderr) console.error(stderr.slice(-2000))
  process.exit(1)
}
