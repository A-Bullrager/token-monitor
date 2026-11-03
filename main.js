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
const i18n = require('./renderer/i18n')
// The tray, the application menu and the IPC error strings are written here,
// not in the renderer — so the main process needs the same dictionaries
// loaded, or a Spanish UI would still get a Chinese tray menu.
for (const locale of i18n.LOCALES.filter((item) => item !== 'zh')) {
  i18n.register(locale, require(`./renderer/locales/${locale}`)(i18n))
}

// Effective UI language. The renderer needs it before its first paint, so it
// travels in the window URL instead of waiting for an IPC round trip.
let appLocale = 'zh'
// --locale= lets the language checks force a UI language independently of the
// Chromium --lang value, the same way --shot= drives screenshot mode.
const LOCALE_ARG = process.argv.find((arg) => arg.startsWith('--locale='))
const LOCALE_OVERRIDE = LOCALE_ARG ? LOCALE_ARG.split('=')[1] : ''
function refreshLocale() {
  const preferred = typeof app.getLocale === 'function' ? app.getLocale() : 'zh-CN'
  appLocale = i18n.resolveLocale(LOCALE_OVERRIDE || store.get().locale, preferred)
  return appLocale
}
// Copy authored in Chinese; every other UI language reads it from a dictionary.
const t = (text) => i18n.t(text, appLocale)

app.setName('Token Monitor')
if (process.platform === 'win32') app.setAppUserModelId('com.tokenmonitor.desktop')

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

// ── the view morph: two resizes, no tween ────────────────────────────────
// Single source of truth for the morph length: the renderer reads this from
// bootstrap and drives its own reveal with the same number. TM_MORPH_MS exists
// for slow-motion frame capture (node scripts/morph-cast.mjs).
const MORPH_MS = Number(process.env.TM_MORPH_MS) || 300
// TM_MORPH_DEBUG=1 prints every window resize a morph makes. CI sets it and the
// UI check reads those lines back, because the page cannot tell "the mover never
// moved" apart from "the renderer was frozen": window.innerWidth only updates
// when a throttled page gets to process a resize.
const MORPH_TRACE = process.env.TM_MORPH_DEBUG === '1'

// The moving edge lives in the page now (the --morph-show clip on .stage), and
// the window is resized at most twice per morph — both of them invisible by
// construction:
//
//   grow early — before the card starts to open, the window takes the union of
//     the two boxes. Everything the union adds is transparent stage, so nothing
//     on screen moves, and the card is never asked to re-flow.
//   shrink late — after the card has finished closing, the window takes the
//     smaller box again. Everything removed is stage the card has already let go
//     of, so this resize cannot be seen either.
//
// The measured reason for giving up the tween: per-frame setBounds is the
// expensive call, and it is expensive very unevenly across platforms. Five CI
// rounds with the mover self-reporting stamped one 300ms morph at 39-44 steps
// and 13-20ms per step on Linux and Windows, but 9 steps with a 150ms step on
// macOS Intel and 2 steps with a 393ms step on Apple Silicon. There the tween's
// clock is not the limit — the round trip through the window server is — and a
// window-edge animation on that platform is one jump, however smooth the curve
// feeding it. Two calls cannot stutter for that reason, and the compositor
// carries the motion instead.
let morphPending = null
let morphSettleTimer = null

function unionOfBounds(a, b) {
  const left = Math.min(a.x, b.x)
  const top = Math.min(a.y, b.y)
  const right = Math.max(a.x + a.width, b.x + b.width)
  const bottom = Math.max(a.y + a.height, b.y + b.height)
  return { x: left, y: top, width: right - left, height: bottom - top }
}

function sameBounds(a, b) {
  return a.x === b.x && a.y === b.y && a.width === b.width && a.height === b.height
}

// The stamp is the wall clock, not an intended one: what the report has to show
// is when the operating system was actually asked, against the page's own
// timeline.
function applyMorphResize(phase, from, to) {
  if (!mainWindow || sameBounds(from, to)) return false
  mainWindow.setBounds(to)
  if (MORPH_TRACE)
    console.log(`[morph +${Math.round(performance.now())}ms] resize ${phase} ${from.width}x${from.height} -> ${to.width}x${to.height}`)
  return true
}

// Start of a morph: work out the box the finished card will live in and open the
// stage up to it if that is the larger one. The renderer measures its reveal
// against the returned stage height, so it never has to guess what the operating
// system is about to do.
function morphBegin(view) {
  if (!mainWindow) return null
  const previous = mainWindow.getBounds()
  const target = resizeBoundsForView(view, previous)
  const stage = unionOfBounds(previous, target)
  applyMorphResize('grow', previous, stage)
  morphPending = target
  // A morph the renderer never settles (its window went away mid-animation, its
  // process was killed) must not leave a stage bigger than the card on screen.
  // One bounded, logged fallback, timed well past the reveal.
  clearTimeout(morphSettleTimer)
  morphSettleTimer = setTimeout(() => {
    if (!morphPending) return
    if (MORPH_TRACE) console.log(`[morph +${Math.round(performance.now())}ms] resize settled-by-timeout`)
    morphSettle()
  }, MORPH_MS + 2000)
  return { stage: mainWindow.getBounds(), target }
}

// End of a morph: take away the stage the card no longer uses. Safe to call
// twice, and for a morph that never shrank it does nothing at all.
function morphSettle() {
  if (!mainWindow || !morphPending) return null
  clearTimeout(morphSettleTimer)
  morphSettleTimer = null
  const previous = mainWindow.getBounds()
  const target = morphPending
  morphPending = null
  applyMorphResize('shrink', previous, target)
  return target
}


function trayImage() {
  // macOS draws the menu bar icon from a monochrome template so it follows the
  // light / dark menu bar; elsewhere the colour mark is used as-is.
  const isMac = process.platform === 'darwin'
  const base = isMac ? 'icon-template' : 'icon'
  const image = nativeImage.createEmpty()
  let found = false
  for (const [file, scaleFactor] of [
    [`${base}-16.png`, 1],
    [`${base}-32.png`, 2]
  ]) {
    const filePath = path.join(__dirname, 'renderer', 'assets', 'img', file)
    if (fs.existsSync(filePath)) {
      image.addRepresentation({ scaleFactor, buffer: fs.readFileSync(filePath) })
      found = true
    }
  }
  if (!found) return nativeImage.createFromPath(path.join(__dirname, 'renderer', 'assets', 'img', 'icon-16.png'))
  if (isMac) image.setTemplateImage(true)
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
      { label: t('展开账本'), click: () => sendUiAction('deck') },
      { label: t('收起条带'), click: () => sendUiAction('strip') },
      { type: 'separator' },
      { label: t('刷新账户'), click: () => sendUiAction('refresh') },
      { label: t('设置…'), click: () => sendUiAction('settings') },
      { type: 'separator' },
      {
        label: t('显示 / 隐藏窗口'),
        click: () => {
          if (!mainWindow) return
          if (mainWindow.isVisible()) mainWindow.hide()
          else revealWindow()
        }
      },
      { label: t('退出 Token Monitor'), click: () => app.quit() }
    ])
  )
}

function updateTrayTooltip(state) {
  if (!tray) return
  const days = state?.usage?.daysLeft
  tray.setToolTip(
    Number.isFinite(Number(days)) && Number(days) > 0
      ? t(`Token Monitor · 跑道 ${Number(days).toFixed(1)} 天`)
      : t('Token Monitor · DeepSeek 跑道')
  )
}

function createTray() {
  if (showcase || tray) return
  try {
    tray = new Tray(trayImage())
    tray.setToolTip(t('Token Monitor · DeepSeek 跑道'))
    // macOS owns the click when a tray context menu is installed.
    if (process.platform !== 'darwin') {
      tray.on('click', () => {
        if (!mainWindow) return
        if (mainWindow.isVisible()) mainWindow.hide()
        else revealWindow()
      })
    }
    updateTrayMenu()
  } catch (error) {
    console.error('tray init failed:', error?.message || String(error))
    tray = null
  }
}

// A real application menu is expected on macOS (and it is what gives the
// settings fields working Cmd+C / Cmd+V / Cmd+A). Deliberately excluded: a
// reload accelerator, because Ctrl/Cmd+R already means "refresh the account"
// here, and a menu role would fight the renderer handler for it.
function installApplicationMenu() {
  if (process.platform !== 'darwin') {
    Menu.setApplicationMenu(null)
    return
  }
  const template = [
    { role: 'appMenu' },
    { role: 'editMenu' },
    {
      label: t('视图'),
      submenu: [
        { role: 'toggleDevTools' },
        { type: 'separator' },
        { role: 'resetZoom' }
      ]
    },
    { role: 'windowMenu' },
    {
      label: t('帮助'),
      submenu: [
        {
          label: t('DeepSeek 平台用量页'),
          click: () => shell.openExternal('https://platform.deepseek.com/usage')
        }
      ]
    }
  ]
  Menu.setApplicationMenu(Menu.buildFromTemplate(template))
}

// One place builds the renderer query so a language change reloads with the
// same window state it was created with.
function rendererQuery() {
  return {
    showcase: showcase ? '1' : '0',
    shot: IS_SHOT ? '1' : '0',
    view: currentView,
    dark: FORCE_DARK ? '1' : '0',
    settings: SHOT_MODE === 'settings' ? '1' : '0',
    locale: appLocale
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

  const query = rendererQuery()
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
    const workArea = mainWindow
      ? screen.getDisplayMatching(mainWindow.getBounds()).workArea
      : screen.getPrimaryDisplay().workArea
    return {
      version: app.getVersion(),
      platform: process.platform,
      locale: appLocale,
      // null until the async probe answers; never probe here, or a pending
      // Keychain/DPAPI authorization would block the first paint.
      encryption: store.encryptionBackend(),
      config,
      showcase,
      view: currentView,
      morphMs: MORPH_MS,
      formHeights: {
        strip: fitSize('strip', workArea).height,
        deck: fitSize('deck', workArea).height
      },
      isShot: IS_SHOT,
      isPackaged: app.isPackaged
    }
  })

  // The storage label must not be paid for with a blocked main thread, so the
  // renderer asks for this only while the settings drawer is open. 'pending'
  // means the system has not answered; the UI then keeps its neutral wording.
  ipcMain.handle('app:encryption', async () => await store.resolveBackend(8000))

  ipcMain.handle('data:refresh', async () => {
    try {
      const state = await buildRefreshState()
      updateTrayTooltip(state)
      return { ok: true, state }
    } catch (error) {
      return { ok: false, message: error?.message || t('刷新失败') }
    }
  })

  ipcMain.handle('config:save', async (event, patch) => {
    if (!trusted(event)) throw new Error(t('不受信任的请求'))
    const view = await store.save(patch || {})
    if (typeof patch?.locale === 'string') {
      const before = appLocale
      refreshLocale()
      if (appLocale !== before) {
        installApplicationMenu()
        updateTrayMenu()
      }
    }
    if (typeof patch?.alwaysOnTop === 'boolean' && !showcase) {
      applyAlwaysOnTop(patch.alwaysOnTop)
    }
    if (patch?.theme && !IS_SHOT) nativeTheme.themeSource = patch.theme
    return view
  })

  // A language change is applied by reloading: strings the renderer already
  // built in the previous language can only come back translated from a fresh
  // page, so the renderer asks for this once its save flow has settled.
  ipcMain.handle('app:reload', (event) => {
    if (!trusted(event)) throw new Error(t('不受信任的请求'))
    if (showcase || IS_SHOT) return false
    mainWindow?.loadFile(path.join(__dirname, 'renderer', 'index.html'), { query: rendererQuery() })
    return true
  })

  ipcMain.handle('config:test', async (event, payload = {}) => {
    if (!trusted(event)) throw new Error(t('不受信任的请求'))
    const stored = store.secrets()
    const apiKey = payload.apiKey?.trim() || stored.apiKey
    const sessionToken = payload.sessionToken?.trim() || stored.sessionToken
    return deepseek.testConnection({ apiKey, sessionToken })
  })

  ipcMain.handle('config:clear', async (event) => {
    if (!trusted(event)) throw new Error(t('不受信任的请求'))
    store.clearSecrets()
    await store.save({ demo: true })
    return store.publicView()
  })

  ipcMain.handle('window:set-view', async (event, next) => {
    if (!trusted(event)) throw new Error(t('不受信任的请求'))
    const view = next === 'deck' ? 'deck' : 'strip'
    if (showcase) {
      currentView = view
      mainWindow.webContents.send('view:changed', view)
      return { view }
    }
    await store.save({ view })
    currentView = view
    // The reveal is the renderer's; this side only opens the stage, once.
    const plan = morphBegin(view)
    return { view, bounds: plan?.target ?? null, stage: plan?.stage ?? null }
  })

  // The renderer calls this when its reveal has landed, so the stage can come
  // back down onto the card. Nothing visible happens here — that is the point.
  ipcMain.handle('window:morph-settle', async (event) => {
    if (!trusted(event)) throw new Error(t('不受信任的请求'))
    if (showcase || !morphPending) return null
    const bounds = morphSettle()
    mainWindow?.webContents.send('view:changed', currentView)
    return bounds
  })

  ipcMain.handle('window:pin', async (event, pinned) => {
    if (!trusted(event)) throw new Error(t('不受信任的请求'))
    const next = Boolean(pinned)
    if (!showcase) applyAlwaysOnTop(next)
    await store.save({ alwaysOnTop: next })
    return next
  })

  ipcMain.handle('theme:apply', (event, theme) => {
    if (!trusted(event)) throw new Error(t('不受信任的请求'))
    if (!['light', 'dark', 'system'].includes(theme)) throw new Error(t('未知主题'))
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
    // Resolve before the menu and tray are built; they carry user-facing copy.
    refreshLocale()
    installApplicationMenu()
    registerIpc()
    createWindow()
    createTray()
    app.on('activate', () => {
      if (BrowserWindow.getAllWindows().length === 0) createWindow()
      else revealWindow()
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
