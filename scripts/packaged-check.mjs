import assert from 'node:assert/strict'
import { spawn } from 'node:child_process'
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { findPackagedApp, oddTempProfile } from './app-paths.mjs'

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const { executable: exe } = findPackagedApp(root)
const version = JSON.parse(fs.readFileSync(path.join(root, 'package.json'), 'utf8')).version
// Deliberately hostile: spaces and non-ASCII in the profile path.
const profile = oddTempProfile('token-monitor-packaged-')
const profileRoot = path.dirname(profile)
const port = 9600 + Math.floor(Math.random() * 200)
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms))
const env = { ...process.env }
delete env.ELECTRON_RUN_AS_NODE

let child = null
let childClosed = null
let ws = null
let evaluate = null
let stderr = ''

async function waitForChildClose(timeout) {
  if (!childClosed) return true
  return new Promise((resolve) => {
    const timer = setTimeout(() => resolve(false), timeout)
    childClosed.then(() => {
      clearTimeout(timer)
      resolve(true)
    })
  })
}

try {
  child = spawn(exe, [`--remote-debugging-port=${port}`, `--user-data-dir=${profile}`], {
    cwd: root,
    env,
    stdio: ['ignore', 'pipe', 'pipe']
  })
  let spawnError = null
  let closed = false
  childClosed = new Promise((resolve) => child.once('close', () => {
    closed = true
    resolve()
  }))
  child.on('error', (error) => { spawnError = error })
  child.stdout.resume()
  child.stderr.on('data', (chunk) => {
    stderr = (stderr + String(chunk)).slice(-12000)
  })

  const deadline = Date.now() + 25000
  let page = null
  while (Date.now() < deadline && !page) {
    if (spawnError) throw spawnError
    if (closed) throw new Error(`packaged app exited before CDP was ready\n${stderr}`)
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
    clearTimeout(waiter.timer)
    if (message.error) waiter.reject(new Error(message.error.message))
    else waiter.resolve(message.result)
  })
  ws.addEventListener('close', () => {
    for (const waiter of pending.values()) {
      clearTimeout(waiter.timer)
      waiter.reject(new Error('packaged CDP connection closed'))
    }
    pending.clear()
  })
  const call = (method, params = {}) =>
    new Promise((resolve, reject) => {
      const id = nextId++
      const timer = setTimeout(() => {
        pending.delete(id)
        reject(new Error(`CDP timeout: ${method}`))
      }, 20000)
      pending.set(id, { resolve, reject, timer })
      ws.send(JSON.stringify({ id, method, params }))
    })
  evaluate = async (expression) => {
    const result = await call('Runtime.evaluate', {
      expression,
      awaitPromise: true,
      returnByValue: true,
      userGesture: true
    })
    if (result.exceptionDetails) {
      throw new Error(result.exceptionDetails.exception?.description || result.exceptionDetails.text)
    }
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
  await evaluate('document.fonts.ready.then(() => true)')
  const boot = await evaluate('window.tm.bootstrap()')
  assert.equal(boot.isPackaged, true, 'must launch the packaged application')
  assert.equal(boot.version, version, 'packaged version must match package.json')
  assert.equal(boot.platform, process.platform)
  const backendLabels = {
    dpapi: /DPAPI/,
    keychain: /Keychain/,
    gnome_libsecret: /libsecret/i,
    kwallet: /KWallet(?!\s*[56])/i,
    kwallet5: /KWallet\s*5/i,
    kwallet6: /KWallet\s*6/i,
    none: /未加密.*系统加密服务不可用/
  }
  const platformBackends = {
    win32: ['dpapi', 'none'],
    darwin: ['keychain', 'none'],
    linux: ['gnome_libsecret', 'kwallet', 'kwallet5', 'kwallet6', 'none']
  }
  assert.ok(platformBackends[process.platform]?.includes(boot.encryption), `unexpected backend: ${boot.encryption}`)

  const strip = await evaluate(`({
    view: document.body.className,
    inner: [window.innerWidth, window.innerHeight],
    balance: document.getElementById('stripBalance').textContent,
    runway: document.getElementById('stripRunway').textContent,
    today: document.getElementById('stripToday').textContent,
    demo: !document.getElementById('stripDemoTag').hidden,
    sparkPaths: document.querySelectorAll('#stripSpark path').length,
    gaugeRatio: getComputedStyle(document.getElementById('stripGauge')).getPropertyValue('--ratio').trim(),
    fonts: {
      inter: document.fonts.check('600 16px Inter'),
      misans: document.fonts.check('400 12px MiSans')
    },
    scene: getComputedStyle(document.getElementById('stage')).backgroundImage
  })`)
  assert.match(strip.view, /view-strip/)
  assert.equal(strip.balance, '¥145.09')
  assert.equal(strip.runway, '19.8')
  assert.equal(strip.today, '¥1.49')
  assert.equal(strip.demo, true)
  assert.equal(strip.gaugeRatio, '0.66')
  assert.ok(strip.sparkPaths >= 2)
  assert.equal(strip.scene, 'none', 'stage wallpaper must stay hidden outside showcase')
  assert.ok(strip.fonts.inter && strip.fonts.misans, 'bundled fonts must load')

  await evaluate("document.querySelector('.strip-main').click()")
  await waitFor("document.body.classList.contains('view-deck') && !document.body.classList.contains('morphing')")
  const deck = await evaluate(`({
    inner: [window.innerWidth, window.innerHeight],
    balance: document.getElementById('deckBalance').textContent,
    runway: document.getElementById('deckRunway').textContent,
    chartTotal: document.getElementById('chartTotal').textContent,
    mixNote: document.getElementById('mixNote').textContent,
    outlook: ['outlookDays30', 'outlookDays7', 'outlookForecast'].map(id => document.getElementById(id).textContent),
    mixRows: document.querySelectorAll('#mixList .mix-row').length,
    chart: document.querySelectorAll('#chart path').length,
    band: document.querySelectorAll('#chart .last7-band').length,
    gauge: document.getElementById('gauge').className,
    ringProgress: document.querySelectorAll('#gaugeSvg circle.ring-progress').length,
    ringKnob: document.querySelectorAll('#gaugeSvg .ring-knob').length
  })`)
  assert.equal(deck.balance, '145.09')
  assert.equal(deck.runway, '19.8')
  assert.equal(deck.chartTotal, '¥109.73')
  assert.equal(deck.mixNote, '缓存命中 61.8% · 1,866 请求')
  assert.deepEqual(deck.outlook, ['19.8', '53.3', '¥219.60'])
  assert.equal(deck.mixRows, 2)
  assert.ok(deck.chart >= 2, 'chart must contain plotted data')
  assert.equal(deck.band, 1)
  assert.match(deck.gauge, /state-ok/)
  assert.equal(deck.ringProgress, 1)
  assert.equal(deck.ringKnob, 1)
  assert.ok(deck.inner[0] > 0 && deck.inner[0] <= 576, 'deck width must respect fitSize')

  await evaluate("document.querySelector('.deck-head [data-action=\"settings\"]').click()")
  await waitFor("document.getElementById('settingsSheet').classList.contains('open')")
  await sleep(400) // Let the 340 ms drawer transition finish before geometry checks.
  const settings = await evaluate(`(() => {
    const sheet = document.getElementById('settingsSheet')
    const scroller = sheet.querySelector('.settings-scroll')
    const note = document.getElementById('storageNote')
    const box = (element) => {
      const r = element.getBoundingClientRect()
      return { left: r.left, right: r.right, top: r.top, bottom: r.bottom, width: r.width, height: r.height }
    }
    const originalTop = scroller.scrollTop
    scroller.scrollTop = scroller.scrollHeight
    const scrollEnd = scroller.scrollTop
    const lastBottom = scroller.lastElementChild.getBoundingClientRect().bottom
    scroller.scrollTop = originalTop
    return {
      version: document.getElementById('versionText').textContent,
      shortcuts: [...document.querySelectorAll('.key-list > div')].map(row => ({
        action: row.querySelector('dt').textContent,
        keys: [...row.querySelectorAll('kbd')].map(key => key.textContent)
      })),
      storage: { text: note.textContent, title: note.title, warning: note.classList.contains('warn') },
      inner: [window.innerWidth, window.innerHeight],
      panel: box(document.getElementById('panel')),
      sheet: box(sheet), head: box(sheet.querySelector('.settings-head')),
      scroll: {
        ...box(scroller), height: scroller.clientHeight, total: scroller.scrollHeight,
        width: scroller.clientWidth, totalWidth: scroller.scrollWidth,
        overflowY: getComputedStyle(scroller).overflowY, scrollEnd, lastBottom
      },
      foot: box(sheet.querySelector('.settings-foot')),
      storageBox: box(note), save: box(document.getElementById('saveBtn'))
    }
  })()`)
  assert.equal(settings.version, `v${version}`, 'renderer version must match package.json')
  const modifier = process.platform === 'darwin' ? 'Cmd' : 'Ctrl'
  assert.deepEqual(settings.shortcuts, [
    { action: '刷新账户', keys: [modifier, 'R'] },
    { action: '打开设置', keys: [modifier, ','] },
    { action: '展开 / 收起', keys: ['E'] },
    { action: '关闭设置或收起', keys: ['Esc'] }
  ])
  assert.match(settings.storage.text, backendLabels[boot.encryption])
  assert.equal(settings.storage.warning, boot.encryption === 'none')
  if (boot.encryption === 'none') {
    assert.match(settings.storage.title, /base64/i)
    assert.match(settings.storage.title, /明文|NOT encrypted/i)
    assert.doesNotMatch(settings.storage.title, /安全加密|落盘前由系统加密|Credentials are encrypted/i)
  } else {
    assert.match(settings.storage.text, /加密.*只保存在本机/)
    assert.doesNotMatch(settings.storage.text, /未加密/)
    assert.match(settings.storage.title, /落盘前由系统加密|encrypted by the system before saving/i)
  }

  const inside = (inner, outer, label) => {
    assert.ok(inner.width > 0 && inner.height > 0, `${label} must be visible`)
    assert.ok(inner.left >= outer.left - 1 && inner.right <= outer.right + 1 &&
      inner.top >= outer.top - 1 && inner.bottom <= outer.bottom + 1, `${label} must fit its container`)
  }
  inside(settings.sheet, { left: 0, top: 0, right: settings.inner[0], bottom: settings.inner[1] }, 'settings sheet')
  inside(settings.sheet, settings.panel, 'settings sheet within panel')
  inside(settings.head, settings.sheet, 'settings header')
  inside(settings.scroll, settings.sheet, 'settings scroll area')
  inside(settings.foot, settings.sheet, 'settings footer')
  inside(settings.storageBox, settings.foot, 'storage label')
  inside(settings.save, settings.foot, 'save button')
  assert.ok(settings.storageBox.right <= settings.save.left + 1, 'storage label must not overlap save button')
  assert.ok(settings.head.bottom <= settings.scroll.top + 1 && settings.scroll.bottom <= settings.foot.top + 1, 'settings header, scroll area and footer must not overlap')
  assert.ok(settings.scroll.totalWidth <= settings.scroll.width + 1, 'settings must not overflow horizontally')
  if (settings.inner[1] >= 880) {
    assert.ok(settings.scroll.total <= settings.scroll.height + 1, 'full-height settings must not scroll')
  } else {
    assert.match(settings.scroll.overflowY, /^(auto|scroll)$/)
    if (settings.scroll.total > settings.scroll.height + 1) {
      assert.ok(settings.scroll.scrollEnd > 0, 'short settings must actually scroll')
      assert.ok(Math.abs(settings.scroll.scrollEnd - (settings.scroll.total - settings.scroll.height)) <= 1, 'settings must reach the end of its scroll range')
    }
  }
  assert.ok(settings.scroll.lastBottom <= settings.scroll.bottom + 1, 'last settings section must be reachable')
  console.log(JSON.stringify({ executable: exe, profile, boot, strip, deck, settings }, null, 2))
} catch (error) {
  console.error(error?.stack || String(error))
  if (stderr) console.error(stderr.slice(-4000))
  process.exitCode = 1
} finally {
  try {
    if (evaluate && ws?.readyState === WebSocket.OPEN) {
      try {
        await evaluate('window.tm.quit()')
      } catch {
        /* The window may close before replying to the quit request. */
      }
    }
    if (ws) ws.close()
    if (child && !await waitForChildClose(5000)) {
      child.kill()
      if (!await waitForChildClose(5000)) {
        child.kill('SIGKILL')
        if (!await waitForChildClose(5000)) throw new Error(`packaged app did not stop; retaining ${profileRoot}`)
      }
    }
    // Wait for close (including stdio), not a fixed delay or just kill(). Remove
    // the mkdtemp parent as well as the non-ASCII profile, on success AND failure.
    fs.rmSync(profileRoot, { recursive: true, force: true, maxRetries: 5, retryDelay: 200 })
  } catch (error) {
    console.error(`packaged cleanup failed: ${error?.stack || error}`)
    process.exitCode = 1
  }
}
if (!process.exitCode) console.log('Packaged app check passed.')
