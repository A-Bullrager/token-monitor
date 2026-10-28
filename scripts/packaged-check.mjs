import { spawn } from 'node:child_process'
import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const exe = path.join(root, 'dist', 'Token Monitor-win32-x64', 'Token Monitor.exe')
const profile = fs.mkdtempSync(path.join(os.tmpdir(), 'token-monitor-packaged-'))
const port = 9600 + Math.floor(Math.random() * 200)
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms))
const env = { ...process.env }
delete env.ELECTRON_RUN_AS_NODE

const child = spawn(exe, [`--remote-debugging-port=${port}`, `--user-data-dir=${profile}`], {
  env,
  stdio: ['ignore', 'pipe', 'pipe']
})
let stderr = ''
child.stderr.on('data', (chunk) => {
  stderr += String(chunk)
})

let ws = null
try {
  const deadline = Date.now() + 25000
  let page = null
  while (Date.now() < deadline && !page) {
    try {
      const targets = await (await fetch(`http://127.0.0.1:${port}/json/list`)).json()
      page = targets.find((item) => item.type === 'page' && item.url.includes('renderer/index.html'))
    } catch {
      /* not ready */
    }
    if (!page) await sleep(300)
  }
  if (!page) throw new Error(`packaged app did not expose a page\n${stderr}`)

  ws = new WebSocket(page.webSocketDebuggerUrl)
  await new Promise((resolve, reject) => {
    ws.addEventListener('open', resolve, { once: true })
    ws.addEventListener('error', reject, { once: true })
  })
  let nextId = 1
  const pending = new Map()
  ws.addEventListener('message', (event) => {
    const message = JSON.parse(String(event.data))
    if (!message.id || !pending.has(message.id)) return
    const waiter = pending.get(message.id)
    pending.delete(message.id)
    if (message.error) waiter.reject(new Error(message.error.message))
    else waiter.resolve(message.result)
  })
  const call = (method, params = {}) =>
    new Promise((resolve, reject) => {
      const id = nextId++
      pending.set(id, { resolve, reject })
      ws.send(JSON.stringify({ id, method, params }))
      setTimeout(() => {
        if (pending.has(id)) {
          pending.delete(id)
          reject(new Error(`CDP timeout: ${method}`))
        }
      }, 20000)
    })
  const evaluate = async (expression) => {
    const result = await call('Runtime.evaluate', {
      expression,
      awaitPromise: true,
      returnByValue: true,
      userGesture: true
    })
    if (result.exceptionDetails) throw new Error(result.exceptionDetails.text)
    return result.result?.value
  }
  const waitFor = async (expression, timeout = 20000) => {
    const end = Date.now() + timeout
    while (Date.now() < end) {
      if (await evaluate(expression)) return
      await sleep(200)
    }
    throw new Error(`packaged wait timeout: ${expression}`)
  }

  await call('Runtime.enable')
  await waitFor("document.getElementById('stripBalance')?.textContent?.trim() === '¥145.09'")
  const boot = await evaluate('window.tm.bootstrap()')
  const strip = await evaluate(`({
    view: document.body.className,
    inner: [window.innerWidth, window.innerHeight],
    runway: document.getElementById('stripRunway').textContent,
    font: getComputedStyle(document.getElementById('stripRunway')).fontFamily,
    fonts: {
      inter: document.fonts.check('600 16px Inter'),
      misans: document.fonts.check('400 12px MiSans')
    },
    scene: getComputedStyle(document.getElementById('stage')).backgroundImage
  })`)
  await evaluate("document.querySelector('.strip-main').click()")
  await waitFor("document.body.classList.contains('view-deck') && window.innerWidth === 576")
  const deck = await evaluate(`({
    inner: [window.innerWidth, window.innerHeight],
    balance: document.getElementById('deckBalance').textContent,
    chart: document.querySelectorAll('#chart path').length,
    gauge: document.querySelectorAll('#gaugeSvg path').length
  })`)
  await evaluate("document.querySelector('.deck-head [data-action=\"settings\"]').click()")
  await waitFor("document.getElementById('settingsSheet').classList.contains('open')")
  const settings = await evaluate(`({
    version: document.getElementById('versionText').textContent,
    shortcutRows: document.querySelectorAll('.key-list > div').length
  })`)
  await evaluate('window.tm.quit()')
  await sleep(600)
  ws.close()
  if (child.exitCode == null) child.kill()
  console.log(JSON.stringify({ boot, strip, deck, settings }, null, 2))
  if (!boot.isPackaged) throw new Error('app should report isPackaged=true')
  if (boot.version !== '2.4.0') throw new Error(`unexpected version ${boot.version}`)
  if (settings.version !== 'v2.4.0') throw new Error('renderer version mismatch')
  if (strip.scene !== 'none') throw new Error('stage wallpaper must stay hidden outside showcase')
  if (!strip.fonts.inter || !strip.fonts.misans) throw new Error('bundled fonts did not load')
  try {
    fs.rmSync(profile, { recursive: true, force: true })
  } catch {
    /* profile cleanup is best-effort */
  }
  console.log('Packaged app check passed.')
} catch (error) {
  if (ws) ws.close()
  if (child.exitCode == null) child.kill()
  console.error(error?.stack || String(error))
  if (stderr) console.error(stderr.slice(-4000))
  process.exit(1)
}
