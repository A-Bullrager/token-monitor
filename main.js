'use strict'

const {
  app,
  BrowserWindow,
  ipcMain,
  screen,
  shell,
  nativeTheme,
  nativeImage,
  Menu,
  Tray
} = require('electron')
const fs = require('node:fs')
const path = require('node:path')
const store = require('./lib/store')
const deepseek = require('./lib/deepseek')
const { buildDemoState } = require('./lib/demo')

app.setName('Token Monitor')
app.setAppUserModelId('com.tokenmonitor.desktop')

const IS_SHOWCASE_ARG = process.argv.includes('--showcase')
const SHOT_ARG = process.argv.find((arg) => arg.startsWith('--shot='))
const SHOT_MODE = SHOT_ARG ? SHOT_ARG.split('=')[1] || 'deck' : ''
const IS_SHOT = Boolean(SHOT_MODE)
const USE_CONFIG_IN_SHOT = process.argv.includes('--use-config')
const FORCE_DARK = process.argv.includes('--dark') || SHOT_MODE === 'dark'

// Window sizes include a 36px transparent margin on every side so the card
// shadow lands outside the card (.stage padding in styles.css). The deck is
// sized to its content: head 44 + scroll + foot 39 + 72 margin + 2 border.
const STRIP_SIZE = { width: 536, height: 212 }
const DECK_SIZE = { width: 576, height: 880 }

let mainWindow = null
let tray = null
let showcase = IS_SHOWCASE_ARG || IS_SHOT
let currentView = 'strip'
let uiReady = false
let shotTaken = false

function debugLog(...parts) {
  if (!IS_SHOT) return
  try {
    const dir = path.join(__dirname, 'shots')
    fs.mkdirSync(dir, { recursive: true })
    fs.appendFileSync(
      path.join(dir, 'run.log'),
      `[${new Date().toISOString()}] ${parts.join(' ')}\n`,
      'utf8'
    )
  } catch {
    /* ignore */
  }
}

function iconPath() {
  return path.join(__dirname, 'renderer', 'assets', 'img', 'icon-256.png')
}

function showcaseView() {
  return SHOT_MODE === 'strip' ? 'strip' : 'deck'
}

function fitSize(view, workArea) {
  const base = view === 'deck' ? DECK_SIZE : STRIP_SIZE
  return {
    width: Math.min(base.width, workArea.width - 16),
    height: Math.min(base.height, workArea.height - 16)
  }
}

function anchoredBounds(size, { right, top, workArea }) {
  const minX = workArea.x + 8
  const maxX = workArea.x + workArea.width - size.width - 8
  const minY = workArea.y + 8
  const maxY = workArea.y + workArea.height - size.height - 8
  return {
    x: Math.round(Math.min(Math.max(right - size.width, minX), Math.max(minX, maxX))),
    y: Math.round(Math.min(Math.max(top, minY), Math.max(minY, maxY))),
    width: size.width,
    height: size.height
  }
}

function initialBounds(view) {
  const { workArea } = screen.getDisplayNearestPoint(screen.getCursorScreenPoint())
  const size = fitSize(view, workArea)
  return anchoredBounds(size, {
    right: workArea.x + workArea.width - 12,
    top: workArea.y + 12,
    workArea
  })
}

function resizeBoundsForView(view, anchorBounds) {
  const { workArea } = screen.getDisplayMatching(anchorBounds)
  const size = fitSize(view, workArea)
  return anchoredBounds(size, {
    right: anchorBounds.x + anchorBounds.width,
    top: anchorBounds.y,
    workArea
  })
}

function showcaseLayout() {
  const { workArea } = screen.getPrimaryDisplay()
  const strip = SHOT_MODE === 'strip'
  const width = Math.min(1280, workArea.width - 48)
  const height = Math.min(strip ? 760 : 840, workArea.height - 48)
  return {
    width,
    height,
    x: workArea.x + Math.round((workArea.width - width) / 2),
    y: workArea.y + Math.round((workArea.height - height) / 2)
  }
}

function applyAlwaysOnTop(enabled) {
  if (!mainWindow || showcase) return
  mainWindow.setAlwaysOnTop(Boolean(enabled), 'floating')
}

let boundsTimer = null
let boundsResolve = null

// cubic-bezier(0.4, 0, 0.2, 1): the platform standard curve. A 684px unfold
// on a hard ease-out pops; this one gets moving immediately and settles.
function cubicBezier(p1x, p1y, p2x, p2y) {
  const cx = 3 * p1x
  const bx = 3 * (p2x - p1x) - cx
  const ax = 1 - cx - bx
  const cy = 3 * p1y
  const by = 3 * (p2y - p1y) - cy
  const ay = 1 - cy - by
  const sampleX = (t) => ((ax * t + bx) * t + cx) * t
  const sampleY = (t) => ((ay * t + by) * t + cy) * t
  const slopeX = (t) => (3 * ax * t + 2 * bx) * t + cx
  return (x) => {
    let t = x
    for (let i = 0; i < 6; i += 1) {
      const dx = sampleX(t) - x
      if (Math.abs(dx) < 1e-5) break
      const slope = slopeX(t)
      if (Math.abs(slope) < 1e-6) break
      t -= dx / slope
    }
    return sampleY(Math.min(1, Math.max(0, t)))
  }
}

const MORPH_EASE = cubicBezier(0.4, 0, 0.2, 1)
// Single source of truth: the renderer reads this from bootstrap and drives
// its crossfade with the same number. TM_MORPH_MS exists for slow-motion
// frame capture (node scripts/morph-cast.mjs).
const MORPH_MS = Number(process.env.TM_MORPH_MS) || 300
// TM_MORPH_DEBUG=1 prints every resize tick: node scripts/morph-cast.mjs uses
// it to tell "the window never moved" apart from "the window moved too slowly".
const MORPH_TRACE = process.env.TM_MORPH_DEBUG === '1'

function animateWindowBounds(target, duration = MORPH_MS) {
  return new Promise((resolve) => {
    if (!mainWindow) return resolve()
    if (boundsTimer) {
      clearInterval(boundsTimer)
      boundsTimer = null
      boundsResolve?.()
      boundsResolve = null
    }
    const start = mainWindow.getBounds()
    const startedAt = Date.now()
    if (MORPH_TRACE) console.log(`[morph +0ms] start ${start.width}x${start.height} -> ${target.width}x${target.height}`)
    boundsResolve = resolve
    const tick = () => {
      if (!mainWindow) {
        clearInterval(boundsTimer)
        boundsTimer = null
        boundsResolve = null
        resolve()
        return
      }
      const progress = Math.min(1, (Date.now() - startedAt) / duration)
      const eased = MORPH_EASE(progress)
      const bounds = {
        x: Math.round(start.x + (target.x - start.x) * eased),
        y: Math.round(start.y + (target.y - start.y) * eased),
        width: Math.round(start.width + (target.width - start.width) * eased),
        height: Math.round(start.height + (target.height - start.height) * eased)
      }
      mainWindow.setBounds(bounds)
      if (MORPH_TRACE) console.log(`[morph +${Date.now() - startedAt}ms] tick ${bounds.width}x${bounds.height} progress=${progress.toFixed(2)}`)
      if (progress >= 1) {
        clearInterval(boundsTimer)
        boundsTimer = null
        boundsResolve = null
        mainWindow.setBounds(target)
        resolve()
      }
    }
    boundsTimer = setInterval(tick, 1000 / 60)
    tick()
  })
}

function trayImage() {
  const image = nativeImage.createEmpty()
  for (const [file, scaleFactor] of [
    ['icon-16.png', 1],
    ['icon-32.png', 2]
  ]) {
    const filePath = path.join(__dirname, 'renderer', 'assets', 'img', file)
    if (fs.existsSync(filePath)) {
      image.addRepresentation({ scaleFactor, buffer: fs.readFileSync(filePath) })
    }
  }
  return image
}

function revealWindow() {
  if (!mainWindow) return
  if (mainWindow.isMinimized()) mainWindow.restore()
  mainWindow.show()
  mainWindow.focus()
}

function sendUiAction(action) {
  if (!mainWindow) return
  revealWindow()
  mainWindow.webContents.send('ui:action', action)
}

function updateTrayMenu() {
  if (!tray) return
  tray.setContextMenu(
    Menu.buildFromTemplate([
      { label: '展开账本', click: () => sendUiAction('deck') },
      { label: '收起条带', click: () => sendUiAction('strip') },
      { type: 'separator' },
      { label: '刷新账户', click: () => sendUiAction('refresh') },
      { label: '设置…', click: () => sendUiAction('settings') },
      { type: 'separator' },
      {
        label: '显示 / 隐藏窗口',
        click: () => {
          if (!mainWindow) return
          if (mainWindow.isVisible()) mainWindow.hide()
          else revealWindow()
        }
      },
      { label: '退出 Token Monitor', click: () => app.quit() }
    ])
  )
}

function updateTrayTooltip(state) {
  if (!tray) return
  const days = state?.usage?.daysLeft
  tray.setToolTip(
    Number.isFinite(Number(days)) && Number(days) > 0
      ? `Token Monitor · 跑道 ${Number(days).toFixed(1)} 天`
      : 'Token Monitor · DeepSeek 跑道'
  )
}

function createTray() {
  if (showcase || tray) return
  try {
    tray = new Tray(trayImage())
    tray.setToolTip('Token Monitor · DeepSeek 跑道')
    tray.on('click', () => {
      if (!mainWindow) return
      if (mainWindow.isVisible()) mainWindow.hide()
      else revealWindow()
    })
    updateTrayMenu()
  } catch (error) {
    console.error('tray init failed:', error?.message || String(error))
    tray = null
  }
}

function createWindow() {
  const config = store.get()
  currentView = showcase ? showcaseView() : config.view === 'deck' ? 'deck' : 'strip'
  const layout = showcase ? showcaseLayout() : initialBounds(currentView)
  nativeTheme.themeSource = config.theme === 'system' ? 'system' : config.theme

  mainWindow = new BrowserWindow({
    ...layout,
    show: false,
    frame: false,
    transparent: true,
    backgroundColor: '#00000000',
    hasShadow: false,
    resizable: false,
    maximizable: false,
    fullscreenable: false,
    autoHideMenuBar: true,
    skipTaskbar: Boolean(showcase),
    title: 'Token Monitor',
    icon: iconPath(),
    alwaysOnTop: !showcase && config.alwaysOnTop,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: true,
      spellcheck: false,
      devTools: true
    }
  })

  const query = {
    showcase: showcase ? '1' : '0',
    shot: IS_SHOT ? '1' : '0',
    view: currentView,
    dark: FORCE_DARK ? '1' : '0',
    settings: SHOT_MODE === 'settings' ? '1' : '0'
  }
  mainWindow.loadFile(path.join(__dirname, 'renderer', 'index.html'), { query })

  mainWindow.once('ready-to-show', () => {
    mainWindow.show()
    if (IS_SHOT) {
      mainWindow.focus()
    } else {
      mainWindow.showInactive()
    }
    if (config.alwaysOnTop && !showcase) applyAlwaysOnTop(true)
  })

  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    openExternal(url)
    return { action: 'deny' }
  })

  if (IS_SHOT) {
    debugLog('window created', JSON.stringify(layout), 'view=', currentView, 'mode=', SHOT_MODE)
    mainWindow.webContents.on('console-message', (event) => {
      const details = event || {}
      debugLog(
        'renderer',
        details.level ?? '',
        details.message ?? '',
        `${details.sourceId || ''}:${details.lineNumber || ''}`
      )
    })
    mainWindow.webContents.on('did-fail-load', (_event, code, description, url) => {
      debugLog('did-fail-load', code, description, url)
    })
    mainWindow.webContents.on('render-process-gone', (_event, details) => {
      debugLog('render-process-gone', JSON.stringify(details))
    })
    setTimeout(() => {
      if (!shotTaken) {
        debugLog('shot fallback timeout, capturing current state')
        performShot(SHOT_MODE).catch((error) => {
          debugLog('shot fallback error', error?.stack || String(error))
          app.exit(1)
        })
      }
    }, 15000)
  }

  mainWindow.webContents.on('will-navigate', (event, url) => {
    const current = mainWindow.webContents.getURL()
    if (url !== current) {
      event.preventDefault()
      openExternal(url)
    }
  })

  mainWindow.webContents.on('before-input-event', (event, input) => {
    if (input.type !== 'keyDown') return
    if (input.key === 'F12' && !app.isPackaged) {
      mainWindow.webContents.toggleDevTools()
      event.preventDefault()
    }
  })

  mainWindow.on('closed', () => {
    mainWindow = null
  })
}

function trusted(event) {
  const url = event?.senderFrame?.url || ''
  return url.startsWith('file://') && url.includes('/renderer/index.html')
}

function openExternal(rawUrl) {
  try {
    const url = new URL(rawUrl)
    const allowed = new Set(['platform.deepseek.com', 'api-docs.deepseek.com'])
    if (url.protocol !== 'https:' || !allowed.has(url.hostname)) return false
    shell.openExternal(url.toString())
    return true
  } catch {
    return false
  }
}

function emptyLiveState() {
  return {
    mode: 'live',
    currency: 'CNY',
    balance: null,
    usage: null,
    status: { api: 'missing', session: 'missing' },
    errors: [],
    fetchedAt: new Date().toISOString()
  }
}

async function buildRefreshState() {
  const config = store.get()
  if (IS_SHOT && !USE_CONFIG_IN_SHOT) {
    return SHOT_MODE === 'empty' ? emptyLiveState() : buildDemoState()
  }
  if (config.demo) return buildDemoState()
  const { apiKey, sessionToken } = store.secrets()
  if (!apiKey && !sessionToken) return emptyLiveState()
  return deepseek.getOverview({ apiKey, sessionToken })
}

async function performShot(kind) {
  if (!mainWindow || shotTaken) return
  shotTaken = true
  debugLog('performShot', kind)
  const dir = path.join(__dirname, 'shots')
  fs.mkdirSync(dir, { recursive: true })

  await new Promise((resolve) => setTimeout(resolve, kind === 'settings' ? 1900 : 1500))

  try {
    const metrics = await mainWindow.webContents.executeJavaScript(`(() => {
      const panel = document.querySelector('.panel')
      const deck = document.querySelector('.deck-scroll')
      const strip = document.querySelector('.strip')
      const chart = document.querySelector('.chart-wrap')
      const rect = (node) => node ? node.getBoundingClientRect() : null
      const p = rect(panel)
      return {
        view: document.body.className,
        panel: p ? { width: Math.round(p.width), height: Math.round(p.height) } : null,
        deckScroll: deck ? deck.scrollHeight : null,
        deckClient: deck ? deck.clientHeight : null,
        strip: strip ? rect(strip).height : null,
        chart: chart ? Math.round(chart.getBoundingClientRect().height) : null,
        settingsOpen: document.getElementById('settingsSheet')?.classList.contains('open') || false
      }
    })()`)
    debugLog('layout', JSON.stringify(metrics))
  } catch (error) {
    debugLog('layout error', error?.message || String(error))
  }

  const image = await mainWindow.webContents.capturePage()
  const name = kind === 'showcase' ? 'deck' : kind
  const file = path.join(dir, `${name}.png`)
  fs.writeFileSync(file, image.toPNG())
  debugLog(`captured ${name}`, image.getSize().width, image.getSize().height, file)
  app.exit(0)
}

function registerIpc() {
  ipcMain.handle('app:bootstrap', () => {
    const config = store.publicView()
    if (showcase) {
      // Showcase/screenshots should look the same on any machine.
      config.demo = true
      config.alwaysOnTop = true
      config.intervalSec = 60
      config.theme = FORCE_DARK ? 'dark' : 'light'
    }
    return {
      version: app.getVersion(),
      platform: process.platform,
      config,
      showcase,
      view: currentView,
      morphMs: MORPH_MS,
      formHeights: { strip: STRIP_SIZE.height, deck: DECK_SIZE.height },
      isShot: IS_SHOT,
      isPackaged: app.isPackaged
    }
  })

  ipcMain.handle('data:refresh', async () => {
    try {
      const state = await buildRefreshState()
      updateTrayTooltip(state)
      return { ok: true, state }
    } catch (error) {
      return { ok: false, message: error?.message || '刷新失败' }
    }
  })

  ipcMain.handle('config:save', (event, patch) => {
    if (!trusted(event)) throw new Error('不受信任的请求')
    const view = store.save(patch || {})
    if (typeof patch?.alwaysOnTop === 'boolean' && !showcase) {
      applyAlwaysOnTop(patch.alwaysOnTop)
    }
    if (patch?.theme && !IS_SHOT) nativeTheme.themeSource = patch.theme
    return view
  })

  ipcMain.handle('config:test', async (event, payload = {}) => {
    if (!trusted(event)) throw new Error('不受信任的请求')
    const stored = store.secrets()
    const apiKey = payload.apiKey?.trim() || stored.apiKey
    const sessionToken = payload.sessionToken?.trim() || stored.sessionToken
    return deepseek.testConnection({ apiKey, sessionToken })
  })

  ipcMain.handle('config:clear', (event) => {
    if (!trusted(event)) throw new Error('不受信任的请求')
    store.clearSecrets()
    store.save({ demo: true })
    return store.publicView()
  })

  ipcMain.handle('window:set-view', async (event, next) => {
    if (!trusted(event)) throw new Error('不受信任的请求')
    const view = next === 'deck' ? 'deck' : 'strip'
    if (showcase) {
      currentView = view
      mainWindow.webContents.send('view:changed', view)
      return { view }
    }
    const previous = mainWindow.getBounds()
    const bounds = resizeBoundsForView(view, previous)
    store.save({ view })
    currentView = view
    await animateWindowBounds(bounds)
    mainWindow?.webContents.send('view:changed', view)
    return { view, bounds }
  })

  ipcMain.handle('window:pin', (event, pinned) => {
    if (!trusted(event)) throw new Error('不受信任的请求')
    const next = Boolean(pinned)
    if (!showcase) applyAlwaysOnTop(next)
    store.save({ alwaysOnTop: next })
    return next
  })

  ipcMain.handle('theme:apply', (event, theme) => {
    if (!trusted(event)) throw new Error('不受信任的请求')
    if (!['light', 'dark', 'system'].includes(theme)) throw new Error('未知主题')
    if (!IS_SHOT) nativeTheme.themeSource = theme
    return theme
  })

  ipcMain.on('window:minimize', () => mainWindow?.minimize())
  ipcMain.on('window:close', () => mainWindow?.close())
  ipcMain.on('app:quit', () => app.quit())

  ipcMain.handle('app:open-usage', () =>
    shell.openExternal('https://platform.deepseek.com/usage')
  )
  ipcMain.handle('app:open-external', (event, url) => openExternal(url))

  ipcMain.on('ui:ready', () => {
    if (uiReady) return
    uiReady = true
    if (IS_SHOT) performShot(SHOT_MODE)
  })
}

const gotLock = app.requestSingleInstanceLock()
if (!gotLock) {
  app.quit()
} else {
  app.on('second-instance', () => {
    if (mainWindow) {
      if (mainWindow.isMinimized()) mainWindow.restore()
      mainWindow.show()
      mainWindow.webContents.send('view:changed', currentView)
    }
  })

  app.whenReady().then(() => {
    registerIpc()
    createWindow()
    createTray()
    app.on('activate', () => {
      if (BrowserWindow.getAllWindows().length === 0) createWindow()
    })
  })

  app.on('before-quit', () => {
    tray?.destroy()
    tray = null
  })

  app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') app.quit()
  })
}
