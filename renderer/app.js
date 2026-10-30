'use strict'

/*
 * Token Monitor — a runway instrument for a DeepSeek account.
 * The strip is the everyday form; the deck is the full ledger.
 */

const bridge = window.tm
const QUERY = new URLSearchParams(location.search)
const IS_SHOWCASE = QUERY.get('showcase') === '1'
const AUTO_SETTINGS = QUERY.get('settings') === '1'
const FORCE_DARK = QUERY.get('dark') === '1'
const DAY = 24 * 60 * 60 * 1000

const I18N = window.TmI18n
// The main process resolves 'auto' against the system language and passes the
// result in the URL, so the very first paint is already in the right language.
const LOCALE = I18N && I18N.LOCALES.includes(QUERY.get('locale')) ? QUERY.get('locale') : 'zh'
// Copy is authored in Chinese; every other UI language reads it from a
// dictionary keyed by that exact Chinese string.
const TRANSLATE = LOCALE !== 'zh'
const t = (text) => (I18N ? I18N.t(text, LOCALE) : text)
function applyLanguage(root) {
  if (I18N && TRANSLATE) I18N.applyTree(root || document.body, LOCALE)
}
// Re-fitting must repeat the original decision, not a default one: each slot was
// given its own floor and step count where it is fitted, so the remembered
// options travel with the node. Dropping them was the reason a card that fitted
// correctly at render time could end up six pixels wide again after a later pass
// — whichever pass happened to be last decided the look.
function refitNumbers() {
  for (const [node, options] of fittedNodes) {
    if (node.isConnected) fitNumber(node, options)
    else fittedNodes.delete(node)
  }
}

// Non-Chinese modes translate text where it is written, so no render path has
// to remember to translate. Translated output no longer matches the CJK test,
// so the observer cannot feed on its own writes.
function installLanguageMirror() {
  if (!I18N || !TRANSLATE || typeof MutationObserver === 'undefined') return
  const observer = new MutationObserver((records) => {
    let touchedNumbers = false
    for (const record of records) {
      if (record.type === 'characterData') {
        const next = I18N.t(record.target.nodeValue, LOCALE)
        if (next !== record.target.nodeValue) {
          record.target.nodeValue = next
          if (record.target.parentElement && fittedNodes.has(record.target.parentElement)) touchedNumbers = true
        }
      } else if (record.type === 'childList') {
        for (const added of record.addedNodes) {
          if (added.nodeType === 1 || added.nodeType === 3) I18N.applyTree(added, LOCALE)
        }
        touchedNumbers = true
      } else {
        const value = record.target.getAttribute(record.attributeName)
        if (!value) continue
        const next = I18N.t(value, LOCALE)
        if (next !== value) record.target.setAttribute(record.attributeName, next)
      }
    }
    // The translated text is what has to fit, so fitting runs after it lands.
    if (touchedNumbers) requestAnimationFrame(refitNumbers)
  })
  observer.observe(document.body, {
    characterData: true,
    childList: true,
    subtree: true,
    attributes: true,
    attributeFilter: ['title', 'aria-label', 'placeholder']
  })
}

// Run before anything renders: the markup is authored in Chinese, so English
// needs this pass to happen on the very first frame the user can see.
if (I18N) {
  I18N.setDocumentLocale(LOCALE)
  applyLanguage(document.documentElement)
  installLanguageMirror()
}

const $ = (id) => document.getElementById(id)

const state = {
  data: null,
  config: null,
  view: 'strip',
  pace: '30d',
  themeMode: 'light',
  baseTheme: 'light',
  settingsOpen: false,
  privacy: false,
  refreshing: false,
  switching: false,
  loading: true,
  error: '',
  version: '2.6.2',
  clearArmed: false,
  clearTimer: null,
  refreshTimer: null,
  toastTimer: null,
  gauge: null,
  chart: null,
  formHeights: null,
  noticeAction: 'settings',
  chartHover: -1
}

const el = {}

function cacheElements() {
  const ids = [
    'panel', 'stage', 'stripView', 'deckView',
    'stripDemoTag', 'deckDemoTag', 'stripStatus', 'stripStatusText',
    'deckStatus', 'deckStatusText', 'stripRunway', 'stripPaceCaption',
    'stripBalance', 'stripPace', 'stripUpdated', 'stripGauge', 'stripTicks',
    'stripNeedle', 'stripToday', 'stripSpark', 'stripTokens', 'stripFootNote',
    'stripFootPace', 'stripRefresh', 'deckRunway', 'gaugeCaption', 'gaugeNote',
    'gauge', 'gaugeSvg', 'gaugeNumber', 'ledgerMoney', 'pace30', 'pace7', 'deckBalance', 'deckBalanceSub',
    'deckToday', 'deckTodayTokens', 'deckPace', 'deckPaceCaption',
    'deckThirty', 'deckThirtySub', 'deckTokens', 'fuelTotal', 'fuelTopup',
    'fuelGrant', 'fuelLegend', 'chartTotal', 'chart', 'chartWrap', 'chartTip',
    'chartEmpty', 'chartStart', 'chartPeak', 'chartEnd', 'mixEffective',
    'mixBar', 'mixList', 'mixEmpty', 'mixNote', 'updatedText', 'footDot', 'footMode',
    'deckRefresh', 'notice', 'noticeText', 'noticeAction', 'settingsSheet',
    'sheetScrim', 'sheetClose', 'apiKeyInput', 'apiKeyHint', 'sessionInput',
    'sessionHint', 'testBtn', 'helpBtn', 'helpBox', 'testResult',
    'intervalSelect', 'demoSwitch', 'pinSwitch', 'themeSeg', 'localeSeg', 'versionText',
    'usageLink', 'footerUsage', 'clearBtn', 'saveBtn', 'sheetError',
    'connApi', 'connSession', 'toast', 'deckScroll',
    'outlook30', 'outlook7', 'outlookDays30', 'outlookDays7', 'outlookForecast'
  ]
  for (const id of ids) el[id] = $(id)
  el.currency = document.querySelector('.ledger-money .currency')
  el.privacyButtons = Array.from(document.querySelectorAll('[data-action="privacy"]'))
  el.pinButtons = Array.from(document.querySelectorAll('[data-action="pin"]'))
  el.refreshButtons = Array.from(document.querySelectorAll('[data-action="refresh"]'))
  el.gaugeBlock = document.querySelector('.gauge-block')
  el.chartEmptyButton = el.chartEmpty?.querySelector('[data-action="settings"]')
  el.systemQuery = window.matchMedia('(prefers-color-scheme: dark)')
}

/* ── utilities ─────────────────────────────────────────────── */

const clamp = (value, min, max) => Math.min(Math.max(value, min), max)

function currencySymbol() {
  return state.data?.currency === 'USD' ? '$' : '¥'
}

function formatNumber(value, digits = 2) {
  return Number(value).toLocaleString('en-US', {
    minimumFractionDigits: digits,
    maximumFractionDigits: digits
  })
}

function money(value, digits = 2, { symbol = true, dash = '—' } = {}) {
  if (value == null || !Number.isFinite(Number(value))) return dash
  const head = symbol ? currencySymbol() : ''
  if (state.privacy) return `${head}••`
  return `${head}${formatNumber(value, digits)}`
}

function plainMoney(value, digits = 2) {
  if (value == null || !Number.isFinite(Number(value))) return '—'
  if (state.privacy) return '••'
  return formatNumber(value, digits)
}

// The deck's breakdown line is a summary — "how much came from each source" —
// while the headline above it is a statement. Two exact figures with two currency
// symbols do not fit that line at every magnitude on every platform, and money
// type cannot be shrunk far enough and stay money. So from ten thousand up the
// breakdown reads in the units
// each language already uses for counts, and every digit stays where they belong:
// in the headline, which has the room for them. The boundary is ten thousand —
// `formatTokens` applies the same one — because macOS Intel reported the German
// version of ¥999,999.99 + ¥234,567.90 eight pixels past its wall at a threshold
// that let that magnitude through as exact text.
function moneySummary(value) {
  if (value == null || !Number.isFinite(Number(value))) return '—'
  if (state.privacy) return `${currencySymbol()}••`
  const n = Number(value)
  if (Math.abs(n) < 1e4) return `${currencySymbol()}${formatNumber(n, 2)}`
  // The compact form carries no currency sign: the line sits directly under a
  // balance that already shows it, and on an Apple Silicon runner the German
  // version of this line measured 208px in a 202px box — two ¥ signs were the
  // difference between a number and a clipped one.
  if (TRANSLATE) return I18N.compactCount(n, LOCALE)
  if (Math.abs(n) >= 1e8) return `${(n / 1e8).toFixed(2)} 亿`
  return `${(n / 1e4).toFixed(Math.abs(n) >= 1e7 ? 0 : 1)} 万`
}

function formatTokens(value) {
  if (value == null || !Number.isFinite(Number(value))) return '—'
  const n = Number(value)
  // 万 / 亿 are Chinese grouping units with no wording in the other shipped
  // languages, so they re-scale into whatever that language writes itself:
  // 12.5K, 12,5 mil, 12.500.
  if (TRANSLATE && n >= 1e4) return I18N.compactCount(n, LOCALE)
  if (n >= 1e8) return `${(n / 1e8).toFixed(2)} 亿`
  if (n >= 1e4) return `${(n / 1e4).toFixed(n >= 1e6 ? 0 : 1)} 万`
  return Math.round(n).toLocaleString(I18N ? I18N.localeTag(LOCALE) : 'en-US')
}

function formatRunway(value) {
  if (value == null || !Number.isFinite(Number(value))) return '—'
  const n = Number(value)
  if (n < 0.1) return '<0.1'
  if (n > 999) return '999+'
  return n.toFixed(1)
}

function formatPercent(value, digits = 1) {
  if (value == null || !Number.isFinite(Number(value))) return '—'
  return `${Number(value).toFixed(digits)}%`
}

function shortDate(iso) {
  if (!iso) return '—'
  const parts = String(iso).split('-')
  return parts.length >= 3 ? `${parts[1]}-${parts[2]}` : String(iso)
}

function clockTime(iso) {
  const date = iso ? new Date(iso) : null
  if (!date || Number.isNaN(date.getTime())) return ''
  return date.toLocaleTimeString('zh-CN', { hour12: false })
}

function prettyModel(name = '') {
  return String(name)
    .replace(/^deepseek[-_]?/i, '')
    .replace(/[-_]/g, ' ')
    .replace(/\b\w/g, (char) => char.toUpperCase())
}

// Use ASCII modifier labels, which are present in the bundled font subsets.
const STORAGE_NOTES = {
  dpapi: 'DPAPI 加密 · 只保存在本机',
  keychain: 'Keychain 加密 · 只保存在本机',
  gnome_libsecret: 'libsecret 加密 · 只保存在本机',
  kwallet: 'KWallet 加密 · 只保存在本机',
  kwallet5: 'KWallet 5 加密 · 只保存在本机',
  kwallet6: 'KWallet 6 加密 · 只保存在本机',
  none: '未加密 · 系统加密服务不可用'
}
// The probe is async and can stay unanswered (locked keychain, no session).
// "Unknown" must never be rendered as either a promise of encryption or an
// unencrypted warning, so it keeps the neutral wording from the markup.
const STORAGE_PENDING_TEXT = '只保存在本机'
const STORAGE_PENDING_TITLE = 'Waiting for the system encryption check.'

function applyStorageNote(encryption) {
  const note = document.getElementById('storageNote')
  if (!note) return
  const known = STORAGE_NOTES[encryption]
  note.textContent = known || STORAGE_PENDING_TEXT
  note.classList.toggle('warn', encryption === 'none')
  note.title = !known
    ? STORAGE_PENDING_TITLE
    : encryption === 'none'
      ? 'No secure system keyring. Credentials are saved as reversible base64, NOT encrypted.'
      : 'Credentials are encrypted by the system before saving on this device.'
}

function applyPlatformLabels({ platform, encryption } = {}) {
  const mod = platform === 'darwin' ? 'Cmd' : 'Ctrl'
  for (const chip of document.querySelectorAll('[data-mod]')) chip.textContent = mod
  applyStorageNote(encryption)
}

async function refreshStorageNote() {
  if (state.storageResolved) return
  try {
    const backend = await bridge.encryption()
    if (backend && backend !== 'pending') {
      state.storageResolved = true
      applyStorageNote(backend)
    }
  } catch {
    /* Keep the neutral wording; the next settings opening retries. */
  }
}

function resolveTheme(mode) {
  if (mode === 'dark') return 'dark'
  if (mode === 'light') return 'light'
  return el.systemQuery?.matches ? 'dark' : 'light'
}

function applyTheme(mode) {
  state.themeMode = mode
  const resolved = resolveTheme(mode)
  document.body.classList.toggle('theme-dark', resolved === 'dark')
  document.body.classList.toggle('theme-light', resolved !== 'dark')
}

function setRunwayType(node, value, base, compact = false) {
  if (!node) return
  const text = String(value ?? '')
  if (compact) {
    node.style.fontSize = text.length > 5 ? '29px' : text.length > 4 ? '35px' : ''
  } else {
    node.style.fontSize = text.length > 5 ? '44px' : text.length > 4 ? '50px' : ''
  }
}

// A money slot laid out for ¥1.49 also has to survive ¥99,999,999.99, which is
// three times the width. Rather than clip it or reflow the fixed instrument,
// shrink the type until the reader can see every digit — the ink inside the wall
// it could hit — and stop at a floor below which the number stops being readable.
// Nodes are remembered, with the options they were fitted with, so every later
// change to their text re-fits them the same way.
const fittedNodes = new Map()

function fitNumber(node, { floor = 0.7, steps = 4 } = {}) {
  if (!node) return
  fittedNodes.set(node, { floor, steps })
  // A hidden form has no metrics to fit against, and this has to be decided
  // before the reset below: clearing the size and then leaving would erase the
  // fit a visible pass already made, which is one way a correct card becomes an
  // overflowing one without anything re-rendering.
  if (!node.clientWidth && !node.getClientRects().length) return // hidden form
  // Start from the stylesheet's size, or each pass would measure the last one's
  // shrink and compound: 16px became 5.6px became 3.9px for a number that never
  // needed shrinking at all.
  node.style.fontSize = ''
  const base = parseFloat(getComputedStyle(node).fontSize)
  if (!Number.isFinite(base)) return
  // One rule, in renderer/text-fit.js, shared with the number check and the
  // language check: the ink has to stay inside the wall it could hit — the nearest
  // ancestor allowed to clip, or the first element beginning to the right on the
  // same line. When each party kept its own copy they drifted apart, and the card
  // spent six CI rounds shrinking numbers the reader could already see in full.
  const escaped = () => TmTextFit.escape(node).escaped
  let scale = 1
  for (let step = 0; step < steps && escaped(); step++) {
    scale = Math.max(floor, scale - 0.12)
    node.style.fontSize = `${+(base * scale).toFixed(2)}px`
    if (scale === floor) break
  }
}

// A measurement is only valid against the metrics on screen, and the box can be
// laid out before those metrics are final: ¥123,456.78 was fitted into its 78px
// slot and then measured 99px wide, on macOS and on Windows CI alike. Re-measure
// after the page settles as well as on render, so the decision ends up taken
// against real metrics.
let settleTimers = []
function scheduleSettle() {
  for (const timer of settleTimers) clearTimeout(timer)
  // Say out loud that the instrument is still correcting itself. Anything that
  // grades the fit — the number check first — then waits for the page to be
  // done instead of guessing a delay. Judging at a fixed delay measured a page
  // mid-correction on every platform and reported the product as broken.
  document.documentElement.dataset.numbersSettled = 'pending'
  settleTimers = [250, 1000].map((delay) => setTimeout(() => {
    refitNumbers()
    if (delay === 1000) document.documentElement.dataset.numbersSettled = 'settled'
  }, delay))
}

// The settle passes above only fix the common case. What they cannot fix is a
// metric that arrives after them: on a cold machine the width of the same text
// changed once the platform finished handing over its font, and a fit decided
// before that is quietly wrong for as long as the card stays on screen — no
// render, no resize, nothing to re-run the decision. So the card keeps checking
// its own numbers while it is visible. This is a read, not a repaint: a pass
// writes a style only when a figure has actually escaped its box, so the steady
// cost is one layout flush a second. Nothing here needs a visibility guard: a
// card hidden to the tray is a hidden page, and the renderer already clamps its
// timers instead of running them at full rate.
let numberWatch = null
function startNumberWatch() {
  if (numberWatch) return
  numberWatch = setInterval(() => {
    refitNumbers()
    // Count the passes, so anything grading the card can wait for one that
    // actually covers its own change instead of guessing how long that takes.
    const root = document.documentElement
    root.dataset.numberWatchTicks = String(Number(root.dataset.numberWatchTicks || 0) + 1)
  }, 1000)
}

function setText(node, value) {
  const text = t(String(value))
  if (node && node.textContent !== text) node.textContent = text
}

/* ── derived data ──────────────────────────────────────────── */

function usage() {
  return state.data?.usage || null
}

function balance() {
  return state.data?.balance || null
}

function selectedPace() {
  const u = usage()
  if (state.pace === '7d') {
    return {
      key: '7d',
      short: '7D',
      label: '近 7 天自然日',
      shortLabel: '按 7 天自然日',
      note: '余额 ÷ 近 7 天自然日均摊',
      runway: u?.daysLeft7 ?? null,
      avg: u?.avg7 ?? null,
      amount: u?.last7Cost ?? null
    }
  }
  return {
    key: '30d',
    short: '30D',
    label: '30 天活跃日',
    shortLabel: '按 30 天活跃日',
    note: '余额 ÷ 有消费日期的日均',
    runway: u?.daysLeft ?? null,
    avg: u?.dailyAvg ?? null,
    amount: u?.last30?.cost ?? null
  }
}

function runwayState(days) {
  if (days == null) return 'idle'
  if (days < 7) return 'low'
  if (days < 14) return 'watch'
  return 'ok'
}

function spendSampleDays(u, pace = state.pace) {
  if (!u) return 0
  if (pace === '7d') {
    return (u.series || []).slice(-7).filter((day) => Number(day.cost) > 0).length
  }
  return Number(u.last30?.activeDays || 0)
}

function thinSample(u, pace = state.pace) {
  if (!u) return false
  const days = spendSampleDays(u, pace)
  return days > 0 && days < 2
}

function depletionDate(days) {
  const value = Number(days)
  if (!Number.isFinite(value) || value <= 0) return ''
  const date = new Date()
  date.setHours(12, 0, 0, 0)
  date.setDate(date.getDate() + Math.round(value))
  // Authored once, in Chinese: each dictionary turns it into "Runs out Mar 5",
  // "Se agota 5 mar", "Acaba 5 de mar.", "Am 5. März leer" — so the phrase a
  // notice composes around it (`… · 仅 1 个消费日`) can reuse the same rule.
  return `约 ${date.getMonth() + 1} 月 ${date.getDate()} 日见底`
}

function connectionState() {
  const data = state.data
  if (!data) return 'idle'
  if (data.mode === 'demo') return 'demo'
  if (data.errors?.length) return 'error'
  if (data.status?.api === 'ok' && data.status?.session === 'ok') return 'ok'
  if (data.status?.api === 'ok' || data.status?.session === 'ok') return 'warn'
  return 'idle'
}

function statusWord() {
  const data = state.data
  if (!data) return 'IDLE'
  if (data.mode === 'demo') return 'SAMPLE'
  if (data.errors?.length) return 'ERROR'
  if (data.status?.api === 'ok' && data.status?.session === 'ok') return 'LIVE'
  if (data.status?.api === 'ok' || data.status?.session === 'ok') return 'PARTIAL'
  return 'SETUP'
}

function footModeText() {
  const data = state.data
  if (!data) return 'WAITING'
  if (data.mode === 'demo') return 'DEMO / 样本数据'
  if (data.errors?.length) return 'SYNC ERROR'
  if (data.status?.api === 'ok' && data.status?.session === 'ok') return 'LIVE / DEEPSEEK API'
  if (data.status?.api === 'ok') return 'PARTIAL / 缺少会话'
  if (data.status?.session === 'ok') return 'PARTIAL / 缺少 API KEY'
  return 'SETUP / 未连接'
}

function noCredentials() {
  const data = state.data
  return Boolean(
    data &&
      data.mode !== 'demo' &&
      !data.errors?.length &&
      data.status?.api === 'missing' &&
      data.status?.session === 'missing'
  )
}

function usageMissing() {
  return !usage()
}

/* ── status / notices ──────────────────────────────────────── */

function renderStatus() {
  const variant = connectionState()
  const word = statusWord()
  for (const [node, text] of [
    [el.stripStatus, el.stripStatusText],
    [el.deckStatus, el.deckStatusText]
  ]) {
    if (!node) continue
    node.className = `status-inline ${variant}`
    if (text) text.textContent = word
    node.title = `${word} · 点击打开设置`
  }
  if (el.footDot) el.footDot.className = `dot ${variant}`
  if (el.footMode) el.footMode.textContent = footModeText()
  if (el.updatedText) {
    if (state.refreshing) {
      el.updatedText.textContent = 'SYNCING…'
    } else if (!state.data) {
      el.updatedText.textContent = 'SYNCED —'
    } else {
      const time = clockTime(state.data.fetchedAt)
      el.updatedText.textContent = `${state.data.errors?.length ? 'SYNC ERR' : 'SYNCED'}${
        time ? ` ${time}` : ''
      }`
    }
  }
  if (el.stripUpdated) {
    if (state.refreshing) el.stripUpdated.textContent = 'SYNCING…'
    else if (!state.data) el.stripUpdated.textContent = 'SYNC —'
    else {
      const time = clockTime(state.data.fetchedAt)
      el.stripUpdated.textContent = `${time ? `SYNC ${time}` : 'SYNCED'}`
    }
  }
  const demo = state.data?.mode === 'demo'
  if (el.stripDemoTag) el.stripDemoTag.hidden = !demo
  if (el.deckDemoTag) el.deckDemoTag.hidden = !demo
}

function noticeModel() {
  const data = state.data
  if (!data || data.mode === 'demo') return null
  const errors = data.errors || []
  if (errors.length) {
    const first = errors[0]
    const credentialIssue =
      first.code === 'missing' || first.status === 401 || first.status === 403
    return {
      tone: 'error',
      text:
        errors.length > 1
          ? `${first.message} · 另有 ${errors.length - 1} 项异常`
          : first.message,
      action: credentialIssue ? 'settings' : 'retry',
      actionLabel: credentialIssue ? '去设置' : '重试'
    }
  }
  if (noCredentials()) {
    return {
      tone: 'info',
      text: '尚未连接 DeepSeek 账户 · 填写凭证后显示实时数据',
      action: 'settings',
      actionLabel: '去设置'
    }
  }
  if (data.status?.api === 'ok' && data.status?.session !== 'ok') {
    return {
      tone: 'info',
      text: '余额已连接 · 补充 Session Token 后显示用量与跑道',
      action: 'settings',
      actionLabel: '补充会话'
    }
  }
  if (data.status?.session === 'ok' && data.status?.api !== 'ok') {
    return {
      tone: 'info',
      text: '用量已连接 · 补充 API Key 后显示余额与跑道',
      action: 'settings',
      actionLabel: '补充 Key'
    }
  }
  return null
}

function renderNotice() {
  const notice = noticeModel()
  if (!el.notice) return
  if (!notice) {
    el.notice.hidden = true
    return
  }
  el.notice.hidden = false
  el.notice.classList.toggle('info', notice.tone === 'info')
  el.noticeText.textContent = notice.text
  el.noticeAction.textContent = notice.actionLabel
  state.noticeAction = notice.action
}

/* ── strip ─────────────────────────────────────────────────── */

function buildStripTicks() {
  if (!el.stripTicks) return
  const frag = document.createDocumentFragment()
  for (let i = 0; i <= 30; i += 1) {
    const tick = document.createElement('i')
    tick.style.left = `${(i / 30) * 100}%`
    if (i % 5 === 0) tick.className = 'major'
    frag.appendChild(tick)
  }
  el.stripTicks.replaceChildren(frag)
}

function renderSparkline(series) {
  if (!el.stripSpark) return
  el.stripSpark.replaceChildren()
  if (!Array.isArray(series) || series.length < 2) return
  const points = series.slice(-14)
  const width = 96
  const height = 26
  const values = points.map((point) => Number(point.cost) || 0)
  const max = Math.max(...values, 1)
  const x = (index) => (index / (points.length - 1)) * width
  const y = (value) => height - 3 - (value / max) * (height - 7)
  const coords = values.map((value, index) => [x(index), y(value)])
  const line = smoothPath(coords)
  const area = `${line} L${width} ${height} L0 ${height} Z`
  const NS = 'http://www.w3.org/2000/svg'
  const areaNode = document.createElementNS(NS, 'path')
  areaNode.setAttribute('d', area)
  areaNode.setAttribute('class', 'area')
  const lineNode = document.createElementNS(NS, 'path')
  lineNode.setAttribute('d', line)
  lineNode.setAttribute('class', 'line')
  el.stripSpark.append(areaNode, lineNode)
  const last = coords[coords.length - 1]
  const dot = document.createElementNS(NS, 'circle')
  dot.setAttribute('cx', last[0].toFixed(1))
  dot.setAttribute('cy', last[1].toFixed(1))
  dot.setAttribute('r', '2')
  el.stripSpark.appendChild(dot)
}

function renderStrip() {
  scheduleSettle()
  const data = state.data
  const u = usage()
  const b = balance()
  const pace = selectedPace()

  const runwayText = formatRunway(pace.runway)
  setText(el.stripRunway, runwayText)
  setRunwayType(el.stripRunway, runwayText, 41, true)

  if (el.stripPaceCaption) {
    if (!u) {
      el.stripPaceCaption.textContent = noCredentials() ? '等待连接' : '需要用量数据'
      el.stripPaceCaption.removeAttribute('title')
    } else if (pace.avg != null && Number(pace.avg) > 0 && thinSample(u)) {
      el.stripPaceCaption.textContent = '样本偏少 · 仅供参考'
      el.stripPaceCaption.title = `${pace.shortLabel} · 样本消费日不足 2 天`
    } else {
      el.stripPaceCaption.textContent = pace.shortLabel
      el.stripPaceCaption.removeAttribute('title')
    }
  }

  // A micro caption is already small, so it gets a gentle floor: the widest
  // observed overflow on another platform's font metrics was 4px, and 10% of
  // headroom costs nothing a reader would notice.
  fitNumber(el.stripPaceCaption, { floor: 0.9 })

  el.stripBalance.textContent = b ? money(b.total) : money(null)
  fitNumber(el.stripBalance)
  el.stripPace.textContent =
    pace.avg == null ? '— / 天' : `${money(pace.avg)} / 天`

  const needleVisible = pace.runway != null && Number.isFinite(Number(pace.runway))
  const ratio = needleVisible ? clamp(Number(pace.runway) / 30, 0, 1) : 0
  el.stripNeedle.style.left = `${ratio * 100}%`
  el.stripNeedle.style.opacity = needleVisible ? '1' : '0'

  if (el.stripGauge) {
    el.stripGauge.style.setProperty('--ratio', String(ratio))
    const states = ['state-ok', 'state-watch', 'state-low', 'state-idle']
    el.stripGauge.classList.remove(...states)
    el.stripGauge.classList.add(`state-${runwayState(needleVisible ? pace.runway : null)}`)
  }

  // Translated first, then fitted: the language mirror would otherwise rewrite
  // the text after the measurement and a longer language would overflow again.
  setText(el.stripToday, u ? money(u.today?.cost) : money(null))
  fitNumber(el.stripToday)
  el.stripTokens.textContent = u ? `${formatTokens(u.today?.tokens)} TOKENS` : '— TOKENS'
  renderSparkline(u?.series || [])

  if (el.stripFootPace) el.stripFootPace.textContent = pace.short

  if (!data || data.mode === 'demo') {
    el.stripFootNote.textContent = data?.mode === 'demo' ? 'DEMO DATA · 本地样本' : 'DEEPSEEK API · 本地凭证'
  } else if (data.errors?.length) {
    el.stripFootNote.textContent = '同步异常 · 点击状态查看'
  } else if (noCredentials()) {
    el.stripFootNote.textContent = '未连接 · 点击设置开始'
  } else if (!u) {
    el.stripFootNote.textContent = '仅余额已连接 · 缺少会话'
  } else if (data.status?.session !== 'ok') {
    el.stripFootNote.textContent = '部分连接 · 会话待补充'
  } else if (data.status?.api !== 'ok') {
    el.stripFootNote.textContent = '部分连接 · 余额待补充'
  } else {
    el.stripFootNote.textContent = 'DEEPSEEK API · 本地凭证'
  }

  el.stripRefresh?.setAttribute('aria-disabled', String(state.refreshing))
  el.stripView?.classList.toggle('is-empty', pace.runway == null)
}

/* ── deck / gauge ──────────────────────────────────────────── */

const GAUGE = { cx: 110, cy: 95, r: 78 }

function svgNode(name, attrs = {}) {
  const node = document.createElementNS('http://www.w3.org/2000/svg', name)
  for (const [key, value] of Object.entries(attrs)) node.setAttribute(key, value)
  return node
}

function smoothPath(points) {
  if (!points.length) return ''
  if (points.length < 3) {
    return points.map(([x, y], index) => `${index ? 'L' : 'M'}${x.toFixed(2)} ${y.toFixed(2)}`).join(' ')
  }
  let d = `M${points[0][0].toFixed(2)} ${points[0][1].toFixed(2)}`
  for (let i = 0; i < points.length - 1; i += 1) {
    const p0 = points[i - 1] || points[i]
    const p1 = points[i]
    const p2 = points[i + 1]
    const p3 = points[i + 2] || p2
    const c1x = p1[0] + (p2[0] - p0[0]) / 6
    const c1y = p1[1] + (p2[1] - p0[1]) / 6
    const c2x = p2[0] - (p3[0] - p1[0]) / 6
    const c2y = p2[1] - (p3[1] - p1[1]) / 6
    d += ` C${c1x.toFixed(2)} ${c1y.toFixed(2)} ${c2x.toFixed(2)} ${c2y.toFixed(2)} ${p2[0].toFixed(2)} ${p2[1].toFixed(2)}`
  }
  return d
}

function buildGauge() {
  const svg = el.gaugeSvg
  if (!svg) return
  svg.replaceChildren()
  const circumference = 2 * Math.PI * GAUGE.r

  const track = svgNode('circle', {
    cx: GAUGE.cx,
    cy: GAUGE.cy,
    r: GAUGE.r,
    class: 'ring-track',
    'stroke-width': '13'
  })
  const progress = svgNode('circle', {
    cx: GAUGE.cx,
    cy: GAUGE.cy,
    r: GAUGE.r,
    class: 'ring-progress',
    'stroke-width': '13',
    'stroke-dasharray': circumference.toFixed(2),
    transform: `rotate(-90 ${GAUGE.cx} ${GAUGE.cy})`
  })
  progress.style.strokeDashoffset = String(circumference)

  const knobGroup = svgNode('g', { class: 'ring-knob-group' })
  knobGroup.appendChild(
    svgNode('circle', {
      cx: GAUGE.cx,
      cy: GAUGE.cy - GAUGE.r,
      r: '7.5',
      class: 'ring-knob'
    })
  )

  svg.append(track, progress, knobGroup)
  state.gauge = { circumference, progress, knobGroup }
}

function updateGauge(runway) {
  if (!state.gauge) buildGauge()
  if (!state.gauge) return
  const available = runway != null && Number.isFinite(Number(runway))
  const max = available && Number(runway) > 30 ? 60 : 30
  const ratio = available ? clamp(Number(runway) / max, 0, 1) : 0
  const { circumference, progress, knobGroup } = state.gauge
  progress.style.strokeDashoffset = String(circumference * (1 - ratio))
  progress.style.opacity = ratio > 0.001 ? '1' : '0'
  knobGroup.style.opacity = available ? '1' : '0'
  knobGroup.style.transform = `rotate(${(ratio * 360).toFixed(2)}deg)`
  if (el.gauge) {
    const states = ['state-ok', 'state-watch', 'state-low', 'state-idle']
    el.gauge.classList.remove(...states)
    el.gauge.classList.add(`state-${runwayState(available ? runway : null)}`)
  }
}

function renderDeck() {
  scheduleSettle()
  const data = state.data
  const u = usage()
  const b = balance()
  const pace = selectedPace()

  const hasRunway = pace.runway != null && Number.isFinite(Number(pace.runway))
  const runwayText = formatRunway(pace.runway)
  setText(el.deckRunway, hasRunway ? runwayText : '未接入')
  if (hasRunway) {
    setRunwayType(el.deckRunway, runwayText, 56, false)
  } else if (el.deckRunway) {
    el.deckRunway.style.fontSize = ''
  }
  el.gaugeNumber?.classList.toggle('is-empty', !hasRunway)
  updateGauge(pace.runway)

  if (el.gaugeCaption) {
    if (!u) {
      el.gaugeCaption.textContent = data?.status?.api === 'ok' ? '余额已连接 · 需要用量' : '等待连接'
    } else {
      el.gaugeCaption.textContent = pace.shortLabel
    }
  }
  if (el.gaugeNote) {
    if (!u) {
      el.gaugeNote.textContent = noCredentials()
        ? 'API Key + Session Token'
        : data?.status?.api === 'ok'
          ? '补充 Session Token 获取用量'
          : '补充 API Key 获取余额'
    } else if (pace.avg == null || Number(pace.avg) <= 0) {
      el.gaugeNote.textContent = state.pace === '7d' ? '近 7 天没有消费记录' : '还没有可计算的消费'
    } else {
      const depletion = depletionDate(pace.runway) || pace.note
      const days = spendSampleDays(u)
      el.gaugeNote.textContent =
        days > 0 && days < 2 ? `${depletion} · 仅 ${days} 个消费日` : depletion
    }
  }
  if (el.pace30 && el.pace7) {
    el.pace30.classList.toggle('active', state.pace === '30d')
    el.pace7.classList.toggle('active', state.pace === '7d')
    el.pace30.disabled = !u
    el.pace7.disabled = !u
  }

  if (el.currency) el.currency.textContent = currencySymbol()
  el.ledgerMoney?.classList.toggle('is-empty', !b)
  el.deckBalance.textContent = b ? plainMoney(b.total) : '—'
  // The headline is the one place with room to give, and "room to give" turned
  // out to mean more than one guess: at 60% of its 33px base the Spanish and
  // English versions of ¥99,999,999.99 still measured six pixels past a 226px
  // box on two runners. Six steps down to 50% — 16.5px, an ordinary interface
  // size — leaves real margin instead of a coin toss between platforms, and the
  // ladder still stops at the first size that fits, so nothing shrinks unless it
  // has to.
  fitNumber(el.deckBalance, { floor: 0.5, steps: 6 })
  setText(el.deckBalanceSub, b
    ? `充值 ${moneySummary(b.topup)} · 赠金 ${moneySummary(b.grant)}`
    : '尚未读取到余额')
  // A micro line gets a little more room than the default floor: on a runner
  // where the German version of this text measured 208px against a 202px box,
  // the difference between a number and a clipped one was one more step.
  fitNumber(el.deckBalanceSub, { floor: 0.65 })

  el.deckToday.textContent = u ? money(u.today?.cost) : money(null)
  fitNumber(el.deckToday)
  el.deckTodayTokens.textContent = u ? `${formatTokens(u.today?.tokens)} tokens` : '—'
  el.deckPace.textContent = pace.avg == null ? '—' : money(pace.avg)
  el.deckPaceCaption.textContent = u ? pace.shortLabel : '—'
  el.deckThirty.textContent = u ? money(u.last30?.cost) : money(null)
  fitNumber(el.deckThirty)
  el.deckThirtySub.textContent = u
    ? `活跃 ${u.last30?.activeDays ?? 0} 天 · ${u.last30?.days ?? 30} 天窗口`
    : '—'
  el.deckTokens.textContent = u ? formatTokens(u.last30?.tokens) : '—'

  renderFuel()
  renderChart()
  renderMix()
  renderOutlook()
  renderNotice()
  renderStatus()
}

/* ── fuel / composition ───────────────────────────────────── */

function fuelItem(label, amount, percent, hatch) {
  const node = document.createElement('span')
  node.className = 'fuel-item'
  const swatch = document.createElement('i')
  swatch.className = `fuel-swatch${hatch ? ' hatch' : ''}`
  const text = document.createElement('span')
  text.append(`${label} `)
  const strong = document.createElement('b')
  strong.textContent = money(amount)
  text.appendChild(strong)
  if (percent != null) text.append(` · ${formatPercent(percent)}`)
  node.append(swatch, text)
  return node
}

function renderFuel() {
  const b = balance()
  const total = b ? Number(b.topup || 0) + Number(b.grant || 0) : 0
  const topup = b ? Number(b.topup || 0) : 0
  const grant = b ? Number(b.grant || 0) : 0
  el.fuelTotal.textContent = b ? money(b.total) : '—'
  if (!total) {
    el.fuelTopup.style.width = '0%'
    el.fuelGrant.style.width = '0%'
    el.fuelLegend.replaceChildren(fuelItem('充值', null, null, false), fuelItem('赠金', null, null, true))
    return
  }
  const topupPct = (topup / total) * 100
  const grantPct = (grant / total) * 100
  el.fuelTopup.style.width = `${topupPct}%`
  el.fuelGrant.style.width = `${grantPct}%`
  el.fuelLegend.replaceChildren(
    fuelItem('充值', topup, topupPct, false),
    fuelItem('赠金', grant, grantPct, true)
  )
}

/* ── chart ────────────────────────────────────────────────── */

// 1 unit = 1 CSS px: the wrap is 468x176 inside the 504px deck, so the stroke
// stays even in both directions (preserveAspectRatio="none" would otherwise
// stretch it).
const CHART = { w: 468, h: 176, top: 12, bottom: 160 }

function renderChart() {
  const u = usage()
  if (!u || !Array.isArray(u.series) || !u.series.length) {
    el.chart.hidden = true
    el.chartEmpty.hidden = false
    el.chartTotal.textContent = money(null)
    el.chartStart.textContent = '—'
    el.chartEnd.textContent = '—'
    el.chartPeak.textContent = 'PEAK —'
    if (el.chartEmpty) {
      const note = el.chartEmpty.querySelector('p')
      if (note) {
        note.textContent = noCredentials()
          ? '先填写 API Key 与 Session Token，再回来看账本。'
          : state.data?.errors?.length
            ? '同步失败，检查凭证后再试一次。'
            : '接入平台会话后，这里会留下每天的花费。'
      }
      if (el.chartEmptyButton) {
        el.chartEmptyButton.textContent = noCredentials() ? '接入账户' : '补充 Session Token'
      }
    }
    state.chart = null
    return
  }

  el.chart.hidden = false
  el.chartEmpty.hidden = true
  const series = u.series
  const values = series.map((item) => Number(item.cost) || 0)
  const peakValue = Math.max(...values, 0)
  const avg = Number(u.dailyAvg) || 0
  const maxY = Math.max(peakValue, avg * 1.6, 5) * 1.1
  const n = series.length
  const xFor = (index) => (n <= 1 ? CHART.w / 2 : (index / (n - 1)) * CHART.w)
  const yFor = (value) =>
    CHART.bottom - (clamp(Number(value) || 0, 0, maxY) / maxY) * (CHART.bottom - CHART.top)

  el.chart.setAttribute('viewBox', `0 0 ${CHART.w} ${CHART.h}`)
  el.chart.replaceChildren()

  for (let i = 0; i <= 3; i += 1) {
    const y = CHART.bottom - (i / 3) * (CHART.bottom - CHART.top)
    el.chart.appendChild(
      svgNode('line', {
        x1: 0,
        x2: CHART.w,
        y1: y.toFixed(2),
        y2: y.toFixed(2),
        class: 'grid-line'
      })
    )
  }

  if (n > 7) {
    const start = xFor(n - 7)
    el.chart.appendChild(
      svgNode('rect', {
        x: start.toFixed(2),
        y: (CHART.top - 4).toFixed(2),
        width: (CHART.w - start).toFixed(2),
        height: (CHART.bottom - CHART.top + 4).toFixed(2),
        class: 'last7-band'
      })
    )
    el.chart.appendChild(
      svgNode('line', {
        x1: start.toFixed(2),
        x2: start.toFixed(2),
        y1: (CHART.top - 4).toFixed(2),
        y2: CHART.bottom,
        class: 'band-edge'
      })
    )
    const label = svgNode('text', {
      x: (start + 4).toFixed(2),
      y: (CHART.top + 6).toFixed(2),
      class: 'band-label'
    })
    label.textContent = 'LAST 7D'
    el.chart.appendChild(label)
  }

  const points = series.map((item, index) => [
    xFor(index),
    yFor(item.cost)
  ])
  const line = smoothPath(points)
  const area = `${line} L${CHART.w} ${CHART.bottom} L0 ${CHART.bottom} Z`

  const defs = svgNode('defs')
  const gradient = svgNode('linearGradient', {
    id: 'areaFade',
    x1: '0',
    y1: '0',
    x2: '0',
    y2: '1'
  })
  const topStop = svgNode('stop', { offset: '0' })
  topStop.setAttribute('style', 'stop-color: var(--copper); stop-opacity: 0.26')
  const bottomStop = svgNode('stop', { offset: '1' })
  bottomStop.setAttribute('style', 'stop-color: var(--copper); stop-opacity: 0.02')
  gradient.append(topStop, bottomStop)
  defs.appendChild(gradient)
  el.chart.appendChild(defs)

  const areaNode = svgNode('path', { d: area, class: 'area' })
  areaNode.style.fill = 'url(#areaFade)'
  el.chart.appendChild(areaNode)
  el.chart.appendChild(svgNode('path', { d: line, class: 'spend-line' }))

  if (avg > 0) {
    const y = yFor(avg)
    el.chart.appendChild(
      svgNode('line', {
        x1: 0,
        x2: CHART.w,
        y1: y.toFixed(2),
        y2: y.toFixed(2),
        class: 'avg-line'
      })
    )
    const label = svgNode('text', {
      x: CHART.w - 2,
      y: (y - 4).toFixed(2),
      'text-anchor': 'end',
      class: 'avg-label'
    })
    label.textContent = 'AVG'
    el.chart.appendChild(label)
  }

  points.forEach(([x, y], index) => {
    if (index < n - 7) return
    if (values[index] <= 0) return
    el.chart.appendChild(
      svgNode('circle', {
        cx: x.toFixed(2),
        cy: y.toFixed(2),
        r: index === n - 1 ? '2.9' : '1.9',
        class: index === n - 1 ? 'today-dot' : 'active-dot'
      })
    )
  })

  const hoverLine = svgNode('line', {
    x1: 0,
    x2: 0,
    y1: CHART.top,
    y2: CHART.bottom,
    class: 'hover-line',
    visibility: 'hidden'
  })
  const hoverDot = svgNode('circle', {
    cx: 0,
    cy: 0,
    r: '2.7',
    class: 'hover-dot',
    visibility: 'hidden'
  })
  el.chart.append(hoverLine, hoverDot)

  state.chart = {
    series,
    points,
    hoverLine,
    hoverDot,
    n
  }

  el.chartTotal.textContent = money(u.last30?.cost)
  el.chartStart.textContent = shortDate(series[0]?.date)
  el.chartEnd.textContent = shortDate(series[series.length - 1]?.date)
  el.chartPeak.textContent = u.peak
    ? `PEAK ${money(u.peak.cost)} · ${shortDate(u.peak.date)}`
    : 'PEAK —'
  el.chart.setAttribute(
    'aria-label',
    `近 30 天每日花费，总计 ${money(u.last30?.cost)}，峰值 ${money(u.peak?.cost)}`
  )
  hideChartTip()
}

function showChartTip(index, clientX) {
  if (!state.chart || !el.chartWrap) return
  const { series, points, hoverLine, hoverDot, n } = state.chart
  const i = clamp(index, 0, n - 1)
  const [x, y] = points[i] || [0, 0]
  hoverLine.setAttribute('x1', x.toFixed(2))
  hoverLine.setAttribute('x2', x.toFixed(2))
  hoverLine.setAttribute('visibility', 'visible')
  hoverDot.setAttribute('cx', x.toFixed(2))
  hoverDot.setAttribute('cy', y.toFixed(2))
  hoverDot.setAttribute('visibility', 'visible')

  const item = series[i]
  el.chartTip.textContent = `${shortDate(item.date)} · ${money(item.cost)} · ${formatTokens(
    item.tokens
  )} tokens`
  el.chartTip.hidden = false
  const wrap = el.chartWrap.getBoundingClientRect()
  const half = (el.chartTip.offsetWidth || 0) / 2
  const left = clamp((x / CHART.w) * wrap.width, half + 3, wrap.width - half - 3)
  el.chartTip.style.left = `${left}px`
  state.chartHover = i
}

function hideChartTip() {
  if (state.chart) {
    state.chart.hoverLine?.setAttribute('visibility', 'hidden')
    state.chart.hoverDot?.setAttribute('visibility', 'hidden')
  }
  if (el.chartTip) el.chartTip.hidden = true
  state.chartHover = -1
}

/* ── model mix ────────────────────────────────────────────── */

const MIX_COLORS = [
  'var(--copper)',
  'var(--violet)',
  'var(--sage)',
  'var(--amber)',
  'var(--muted)',
  'var(--faint)'
]

function renderMix() {
  const u = usage()
  const models = Array.isArray(u?.models) ? u.models.filter((model) => model.cost > 0 || model.tokens > 0) : []
  if (!u) {
    el.mixEffective.textContent = '—'
    el.mixBar.replaceChildren()
    el.mixList.replaceChildren()
    el.mixEmpty.hidden = false
    el.mixEmpty.textContent = noCredentials() ? '连接账户后显示模型明细' : '暂无模型明细'
    setText(el.mixNote, '近 30 天')
    el.mixNote?.removeAttribute('title')
    return
  }
  el.mixEmpty.hidden = models.length > 0
  el.mixEffective.textContent =
    u.effectivePrice == null ? '—' : money(u.effectivePrice, 3)

  const hitRate = u.cacheHitRate
  const requests = Number(u.requests) || 0
  if (el.mixNote) {
    if (hitRate != null) {
      const requestText = requests > 0 ? ` · ${requests.toLocaleString('en-US')} 请求` : ''
      el.mixNote.textContent = `缓存命中 ${formatPercent(hitRate)}${requestText}`
      el.mixNote.title = `近 30 天输入 tokens 有 ${formatPercent(hitRate)} 命中缓存${
        requests > 0 ? ` · 共 ${requests.toLocaleString('en-US')} 次请求` : ''
      }`
    } else {
      el.mixNote.textContent = '近 30 天'
      el.mixNote.removeAttribute('title')
    }
  }

  const byCost = models.reduce((sum, model) => sum + Number(model.cost || 0), 0)
  const byTokens = models.reduce((sum, model) => sum + Number(model.tokens || 0), 0)
  const total = byCost > 0 ? byCost : byTokens
  const shares = models.map((model) => {
    const value = byCost > 0 ? Number(model.cost || 0) : Number(model.tokens || 0)
    return total > 0 ? (value / total) * 100 : 0
  })

  el.mixBar.replaceChildren()
  el.mixList.replaceChildren()

  models.forEach((model, index) => {
    const color = MIX_COLORS[index % MIX_COLORS.length]
    const share = shares[index]
    const seg = document.createElement('span')
    seg.className = 'mix-seg'
    seg.style.width = `${share}%`
    seg.style.background = color
    el.mixBar.appendChild(seg)

    const row = document.createElement('div')
    row.className = 'mix-row'
    const dot = document.createElement('i')
    dot.className = 'mix-dot'
    dot.style.background = color
    const name = document.createElement('span')
    name.className = 'mix-name'
    name.textContent = prettyModel(model.name)
    const pct = document.createElement('span')
    pct.className = 'mix-pct'
    pct.textContent = formatPercent(share)
    const tokens = document.createElement('span')
    tokens.className = 'mix-tokens'
    tokens.textContent = formatTokens(model.tokens)
    const cost = document.createElement('span')
    cost.className = 'mix-cost'
    cost.textContent = money(model.cost)
    row.append(dot, name, pct, tokens, cost)
    row.title =
      model.cacheHitRate == null
        ? prettyModel(model.name)
        : `${prettyModel(model.name)} · 缓存命中 ${formatPercent(model.cacheHitRate)}${
            Number(model.requests) > 0
              ? ` · ${Number(model.requests).toLocaleString('en-US')} 次请求`
              : ''
          }`
    el.mixList.appendChild(row)
    // Fitted after insertion: off-document there is no width to measure, and a
    // German "98,8 Mio." was the 2px that a macOS runner reported.
    fitNumber(tokens, { floor: 0.9 })
  })
}

function renderOutlook() {
  const u = usage()
  setText(el.outlookDays30, formatRunway(u?.daysLeft))
  setText(el.outlookDays7, formatRunway(u?.daysLeft7))
  const avg = state.pace === '7d' ? u?.avg7 : u?.dailyAvg
  el.outlookForecast.textContent = avg == null ? '—' : money(Number(avg) * 30)
  el.outlook30?.classList.toggle('active', state.pace === '30d')
  el.outlook7?.classList.toggle('active', state.pace === '7d')
}

/* ── view switching ───────────────────────────────────────── */

function setBodyView(view) {
  state.view = view === 'deck' ? 'deck' : 'strip'
  document.body.classList.toggle('view-strip', state.view === 'strip')
  document.body.classList.toggle('view-deck', state.view === 'deck')
}

const MORPH_CLASSES = ['morphing', 'morph-run', 'morph-to-deck', 'morph-to-strip', 'morph-from-deck', 'morph-from-strip']

function clearMorphClasses() {
  document.body.classList.remove(...MORPH_CLASSES)
}

async function switchView(next, { persist = true } = {}) {
  const target = next === 'deck' ? 'deck' : 'strip'
  if (state.view === target || IS_SHOWCASE || state.switching) return
  const source = state.view
  state.switching = true
  // Pin both views to the height they have at rest, measured before anything
  // moves: the outgoing one must not jump when it leaves the flow, and the
  // incoming one must already be laid out exactly as the final card shows it.
  const panelBox = document.getElementById('panel').getBoundingClientRect()
  const outgoing = document.getElementById(source === 'deck' ? 'deckView' : 'stripView')
  const chrome = window.outerHeight - panelBox.height
  const targetPanel = state.formHeights?.[target] ? Math.round(state.formHeights[target] - chrome) : 0
  document.body.style.setProperty('--morph-out-h', `${Math.round(outgoing.getBoundingClientRect().height)}px`)
  document.body.style.setProperty('--morph-in-h', targetPanel > 0 ? `${targetPanel}px` : '100%')
  // Stack both views, then let the incoming one land while the window moves.
  // No frame of this ever shows an empty card.
  document.body.classList.add('morphing', `morph-from-${source}`, `morph-to-${target}`)
  void document.body.offsetWidth
  document.body.classList.add('morph-run')
  let moved = true
  try {
    if (persist) await bridge.setView(target)
  } catch (error) {
    moved = false
    showToast(error?.message || '窗口切换失败')
  }
  // If the window refused to move, stay on the view that actually fits it.
  setBodyView(moved ? target : source)
  // One frame with the final layout in place before the stack is taken apart.
  await new Promise(requestAnimationFrame)
  await new Promise(requestAnimationFrame)
  clearMorphClasses()
  state.switching = false
}

/* ── settings ─────────────────────────────────────────────── */

function updatePinButtons(pinned) {
  for (const button of el.pinButtons) {
    button.classList.toggle('active', Boolean(pinned))
    button.setAttribute('aria-pressed', String(Boolean(pinned)))
    button.title = pinned ? '取消置顶' : '窗口置顶'
  }
}

function updatePrivacyButtons() {
  for (const button of el.privacyButtons) {
    button.title = state.privacy ? '显示金额' : '隐藏金额'
    button.setAttribute('aria-label', button.title)
    const use = button.querySelector('use')
    if (use) use.setAttribute('href', state.privacy ? '#i-eye-off' : '#i-eye')
  }
  document.body.classList.toggle('privacy', state.privacy)
}

function setConnectionChip(node, status) {
  if (!node) return
  node.classList.remove('ok', 'demo', 'error', 'idle')
  if (status === 'demo') node.classList.add('demo')
  else if (status === 'ok') node.classList.add('ok')
  else if (status === 'error') node.classList.add('error')
  else node.classList.add('idle')
  node.title =
    status === 'demo'
      ? '演示数据'
      : status === 'ok'
        ? '已连接'
        : status === 'error'
          ? '连接异常'
          : '未连接'
}

function populateSettings() {
  const config = state.config
  if (!config) return
  el.apiKeyInput.value = ''
  el.sessionInput.value = ''
  el.apiKeyHint.textContent = config.hasApiKey
    ? `已保存 ${config.apiKeyHint} · 留空保持不变`
    : '尚未保存'
  el.sessionHint.textContent = config.hasSession
    ? `已保存 ${config.sessionHint} · 留空保持不变`
    : '尚未保存，填写后才能获取真实用量'

  state.baseTheme = config.theme
  for (const button of el.themeSeg.querySelectorAll('button')) {
    button.classList.toggle('active', button.dataset.theme === config.theme)
  }
  // The language list is authored in Chinese and mirrored here; '中文' and
  // 'English' stay in their own script on purpose, as language pickers do.
  for (const button of el.localeSeg.querySelectorAll('button')) {
    button.classList.toggle('active', button.dataset.locale === (config.locale || 'auto'))
  }

  el.demoSwitch.setAttribute('aria-checked', String(config.demo))
  el.pinSwitch.setAttribute('aria-checked', String(config.alwaysOnTop))
  el.intervalSelect.value = String(config.intervalSec || 60)
  el.helpBox.hidden = true
  el.testResult.hidden = true
  el.testResult.replaceChildren()
  el.sheetError.hidden = true
  el.sheetError.textContent = ''
  el.clearBtn.textContent = '清除凭证'
  el.clearBtn.classList.remove('danger')
  state.clearArmed = false
  if (state.clearTimer) clearTimeout(state.clearTimer)
  state.clearTimer = null
  setText(el.versionText, `v${state.version}`)

  const status = state.data?.status
  if (state.data?.mode === 'demo') {
    setConnectionChip(el.connApi, 'demo')
    setConnectionChip(el.connSession, 'demo')
  } else {
    setConnectionChip(el.connApi, status?.api === 'ok' ? 'ok' : status?.api === 'error' ? 'error' : 'idle')
    setConnectionChip(el.connSession, status?.session === 'ok' ? 'ok' : status?.session === 'error' ? 'error' : 'idle')
  }
}

async function openSettings({ focus = true } = {}) {
  if (!state.config) return
  if (state.view !== 'deck' && !IS_SHOWCASE) {
    await switchView('deck')
  }
  populateSettings()
  // Opening the drawer is the only place the storage backend is shown, so it
  // is also the only place the (async) system probe is asked for.
  refreshStorageNote()
  state.settingsOpen = true
  el.sheetScrim.hidden = false
  el.settingsSheet.inert = false
  el.settingsSheet.setAttribute('aria-hidden', 'false')
  el.deckView?.setAttribute('inert', '')
  el.stripView?.setAttribute('inert', '')
  requestAnimationFrame(() => {
    el.sheetScrim.classList.add('visible')
    el.settingsSheet.classList.add('open')
  })
  if (focus) {
    setTimeout(() => {
      const target = state.config.hasApiKey ? el.sessionInput : el.apiKeyInput
      target?.focus({ preventScroll: true })
    }, 170)
  }
}

function closeSettings({ revertTheme = true } = {}) {
  if (!state.settingsOpen) return
  state.settingsOpen = false
  if (revertTheme && state.baseTheme) {
    applyTheme(state.baseTheme)
    const applied = bridge.applyTheme?.(state.baseTheme)
    if (applied?.catch) applied.catch(() => {})
  }
  el.settingsSheet.classList.remove('open')
  el.sheetScrim.classList.remove('visible')
  el.settingsSheet.setAttribute('aria-hidden', 'true')
  el.deckView?.removeAttribute('inert')
  el.stripView?.removeAttribute('inert')
  setTimeout(() => {
    if (!state.settingsOpen) {
      el.sheetScrim.hidden = true
      el.settingsSheet.inert = true
    }
  }, 340)
  el.apiKeyInput.value = ''
  el.sessionInput.value = ''
  el.testResult.replaceChildren()
  el.testResult.hidden = true
  el.sheetError.hidden = true
  el.helpBox.hidden = true
}

function showSheetError(message) {
  el.sheetError.textContent = message
  el.sheetError.hidden = false
}

function readDraft() {
  return {
    apiKey: el.apiKeyInput.value.trim(),
    sessionToken: el.sessionInput.value.trim(),
    theme: document.querySelector('#themeSeg button.active')?.dataset.theme || state.config.theme,
    locale: document.querySelector('#localeSeg button.active')?.dataset.locale || state.config.locale || 'auto',
    intervalSec: Number(el.intervalSelect.value) || 60,
    alwaysOnTop: el.pinSwitch.getAttribute('aria-checked') !== 'false',
    demo: el.demoSwitch.getAttribute('aria-checked') !== 'false',
    paceMode: state.pace
  }
}

async function saveSettings() {
  if (!state.config) return
  const draft = readDraft()
  if (!draft.demo && !state.config.hasApiKey && !draft.apiKey) {
    showSheetError('关闭演示数据前，请先填写 API Key。')
    return
  }
  el.saveBtn.disabled = true
  const original = el.saveBtn.textContent
  el.saveBtn.textContent = '保存中…'
  el.sheetError.hidden = true
  try {
    const previousLocale = state.config.locale || 'auto'
    const patch = {
      theme: draft.theme,
      locale: draft.locale,
      intervalSec: draft.intervalSec,
      alwaysOnTop: draft.alwaysOnTop,
      demo: draft.demo,
      paceMode: draft.paceMode
    }
    if (draft.apiKey) patch.apiKey = draft.apiKey
    if (draft.sessionToken) patch.sessionToken = draft.sessionToken
    state.config = await bridge.saveConfig(patch)
    // A language change needs a fresh page: text already written into the DOM
    // in the previous language can only come back translated from new markup.
    if (draft.locale !== previousLocale) {
      await bridge.reload()
      return
    }
    state.pace = state.config.paceMode || state.pace
    state.baseTheme = state.config.theme
    applyTheme(state.config.theme)
    updatePinButtons(state.config.alwaysOnTop)
    scheduleRefresh()
    closeSettings({ revertTheme: false })
    await refresh()
    showToast(draft.demo ? '已切换到演示数据' : '配置已保存，正在同步')
  } catch (error) {
    showSheetError(error?.message || '保存失败')
  } finally {
    el.saveBtn.disabled = false
    el.saveBtn.textContent = original
  }
}

function renderTestResult(result) {
  el.testResult.replaceChildren()
  for (const [label, item] of [
    ['API', result?.balance],
    ['会话', result?.session]
  ]) {
    const row = document.createElement('div')
    row.className = `test-row ${item?.ok ? 'ok' : 'error'}`
    const dot = document.createElement('i')
    dot.className = 'dot'
    const text = document.createElement('span')
    const strong = document.createElement('b')
    strong.textContent = `${label} `
    text.append(strong, item?.message || (item?.ok ? '连接成功' : '未连接'))
    row.append(dot, text)
    el.testResult.appendChild(row)
  }
  el.testResult.hidden = false
}

async function testConnection() {
  el.testBtn.disabled = true
  const original = el.testBtn.textContent
  el.testBtn.textContent = '测试中…'
  el.testResult.hidden = true
  try {
    const result = await bridge.testConnection({
      apiKey: el.apiKeyInput.value.trim(),
      sessionToken: el.sessionInput.value.trim()
    })
    renderTestResult(result)
  } catch (error) {
    renderTestResult({
      balance: { ok: false, message: error?.message || '测试失败' },
      session: { ok: false, message: '未测试' }
    })
  } finally {
    el.testBtn.disabled = false
    el.testBtn.textContent = original
  }
}

async function clearCredentials() {
  if (!state.clearArmed) {
    state.clearArmed = true
    el.clearBtn.textContent = '再次点击确认清除'
    el.clearBtn.classList.add('danger')
    state.clearTimer = setTimeout(() => {
      state.clearArmed = false
      if (el.clearBtn) {
        el.clearBtn.textContent = '清除凭证'
        el.clearBtn.classList.remove('danger')
      }
    }, 3500)
    return
  }
  if (state.clearTimer) clearTimeout(state.clearTimer)
  state.clearArmed = false
  el.clearBtn.disabled = true
  try {
    state.config = await bridge.clearCredentials()
    populateSettings()
    await refresh()
    showToast('已清除凭证，切回演示数据')
    closeSettings()
  } catch (error) {
    showSheetError(error?.message || '清除失败')
  } finally {
    el.clearBtn.disabled = false
  }
}

/* ── refresh / toast ──────────────────────────────────────── */

async function refresh({ initial = false } = {}) {
  if (state.refreshing) return
  state.refreshing = true
  state.error = ''
  document.body.classList.add('refreshing')
  for (const button of el.refreshButtons) button.setAttribute('aria-disabled', 'true')
  renderStatus()
  try {
    const result = await bridge.refresh()
    if (result?.ok) {
      state.data = result.state
    } else {
      state.error = result?.message || '刷新失败'
      showToast(state.error)
      if (!state.data) {
        state.data = {
          mode: 'live',
          currency: 'CNY',
          balance: null,
          usage: null,
          status: { api: 'missing', session: 'missing' },
          errors: [{ section: 'data', message: state.error, status: 0, code: '' }],
          fetchedAt: new Date().toISOString()
        }
      }
    }
  } catch (error) {
    state.error = error?.message || '刷新失败'
    showToast(state.error)
  } finally {
    state.refreshing = false
    state.loading = false
    document.body.classList.remove('refreshing')
    for (const button of el.refreshButtons) button.setAttribute('aria-disabled', 'false')
    renderStrip()
    renderDeck()
    renderStatus()
    scheduleRefresh()
    if (initial) bridge.ready()
  }
}

function scheduleRefresh() {
  if (state.refreshTimer) clearTimeout(state.refreshTimer)
  state.refreshTimer = null
  const seconds = Number(state.config?.intervalSec || 0)
  if (!seconds) return
  state.refreshTimer = setTimeout(async () => {
    await refresh()
  }, seconds * 1000)
}

function showToast(message) {
  if (!el.toast) return
  el.toast.textContent = message
  el.toast.hidden = false
  requestAnimationFrame(() => el.toast.classList.add('visible'))
  if (state.toastTimer) clearTimeout(state.toastTimer)
  state.toastTimer = setTimeout(() => {
    el.toast.classList.remove('visible')
    setTimeout(() => {
      if (!el.toast.classList.contains('visible')) el.toast.hidden = true
    }, 220)
  }, 2400)
}

/* ── actions ──────────────────────────────────────────────── */

async function togglePinned() {
  if (!state.config) return
  const next = !state.config.alwaysOnTop
  state.config.alwaysOnTop = next
  updatePinButtons(next)
  try {
    const actual = await bridge.setPinned(next)
    state.config.alwaysOnTop = Boolean(actual)
    updatePinButtons(state.config.alwaysOnTop)
  } catch (error) {
    state.config.alwaysOnTop = !next
    updatePinButtons(state.config.alwaysOnTop)
    showToast(error?.message || '置顶设置失败')
  }
}

function togglePrivacy() {
  state.privacy = !state.privacy
  updatePrivacyButtons()
  try {
    localStorage.setItem('tm:privacy', state.privacy ? '1' : '0')
  } catch {
    /* storage unavailable */
  }
  if (!state.data) return
  renderStrip()
  renderDeck()
}

async function setPace(pace) {
  if (!['30d', '7d'].includes(pace) || !usage()) return
  state.pace = pace
  renderStrip()
  renderDeck()
  try {
    state.config = await bridge.saveConfig({ paceMode: pace })
  } catch (error) {
    showToast(error?.message || '节奏保存失败')
  }
}

/* ── init ─────────────────────────────────────────────────── */

function bindEvents() {
  const panel = el.panel
  panel.addEventListener('click', (event) => {
    const actionNode = event.target.closest('[data-action]')
    if (!actionNode) return
    const action = actionNode.dataset.action
    if (action === 'expand') switchView('deck')
    else if (action === 'collapse') {
      if (state.settingsOpen) closeSettings()
      else switchView('strip')
    } else if (action === 'settings') openSettings()
    else if (action === 'pin') togglePinned()
    else if (action === 'minimize') bridge.minimize()
    else if (action === 'close') bridge.close()
    else if (action === 'refresh') refresh()
    else if (action === 'privacy') togglePrivacy()
    else if (action === 'usage') bridge.openUsage()
  })

  const stripMain = document.querySelector('.strip-main')
  stripMain?.addEventListener('keydown', (event) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault()
      switchView('deck')
    }
  })

  el.pace30?.addEventListener('click', () => setPace('30d'))
  el.pace7?.addEventListener('click', () => setPace('7d'))
  el.outlook30?.addEventListener('click', () => setPace('30d'))
  el.outlook7?.addEventListener('click', () => setPace('7d'))

  el.noticeAction?.addEventListener('click', () => {
    if (state.noticeAction === 'retry') refresh()
    else openSettings()
  })

  el.chartWrap?.addEventListener('pointermove', (event) => {
    if (!state.chart) return
    const rect = el.chartWrap.getBoundingClientRect()
    const ratio = clamp((event.clientX - rect.left) / rect.width, 0, 1)
    const index = Math.round(ratio * (state.chart.n - 1))
    showChartTip(index, event.clientX)
  })
  el.chartWrap?.addEventListener('pointerleave', hideChartTip)

  document.addEventListener('keydown', (event) => {
    const command = event.ctrlKey || event.metaKey
    if (command && event.key.toLowerCase() === 'r') {
      event.preventDefault()
      refresh()
      return
    }
    if (command && event.key === ',') {
      event.preventDefault()
      openSettings()
      return
    }
    if (event.key === 'Escape') {
      if (state.settingsOpen) closeSettings()
      else if (state.view === 'deck' && !IS_SHOWCASE) switchView('strip')
      return
    }
    if (!state.settingsOpen && !command && event.target?.tagName !== 'INPUT' && event.key.toLowerCase() === 'e') {
      switchView(state.view === 'deck' ? 'strip' : 'deck')
    }
  })

  el.sheetClose?.addEventListener('click', () => closeSettings())
  el.sheetScrim?.addEventListener('click', () => closeSettings())
  el.demoSwitch?.addEventListener('click', () => {
    const next = el.demoSwitch.getAttribute('aria-checked') !== 'true'
    el.demoSwitch.setAttribute('aria-checked', String(next))
  })
  el.pinSwitch?.addEventListener('click', async () => {
    const next = el.pinSwitch.getAttribute('aria-checked') !== 'true'
    el.pinSwitch.setAttribute('aria-checked', String(next))
    updatePinButtons(next)
    try {
      const actual = await bridge.setPinned(next)
      if (state.config) state.config.alwaysOnTop = Boolean(actual)
      updatePinButtons(Boolean(actual))
    } catch {
      el.pinSwitch.setAttribute('aria-checked', String(!next))
      updatePinButtons(!next)
    }
  })
  el.intervalSelect?.addEventListener('change', () => {
    /* saved with the form */
  })
  el.testBtn?.addEventListener('click', testConnection)
  el.saveBtn?.addEventListener('click', saveSettings)
  el.clearBtn?.addEventListener('click', clearCredentials)
  el.helpBtn?.addEventListener('click', () => {
    el.helpBox.hidden = !el.helpBox.hidden
  })
  el.usageLink?.addEventListener('click', () => bridge.openUsage())
  el.footerUsage?.addEventListener('click', () => bridge.openUsage())
  el.themeSeg?.addEventListener('click', (event) => {
    const button = event.target.closest('button[data-theme]')
    if (!button) return
    const theme = button.dataset.theme
    for (const node of el.themeSeg.querySelectorAll('button')) {
      node.classList.toggle('active', node === button)
    }
    applyTheme(theme)
    bridge.applyTheme?.(theme).catch(() => {})
  })

  // Unlike the theme, the language is not previewed: it takes a reload to
  // rebuild every string, so it applies when the settings are saved.
  el.localeSeg?.addEventListener('click', (event) => {
    const button = event.target.closest('button[data-locale]')
    if (!button) return
    for (const node of el.localeSeg.querySelectorAll('button')) {
      node.classList.toggle('active', node === button)
    }
  })

  bridge.onViewChange?.((view) => {
    setBodyView(view)
  })

  bridge.onAction?.((action) => {
    if (action === 'refresh') refresh()
    else if (action === 'settings') openSettings()
    else if (action === 'deck') switchView('deck')
    else if (action === 'strip') {
      if (state.settingsOpen) closeSettings()
      switchView('strip')
    }
  })

  el.systemQuery?.addEventListener?.('change', () => {
    if (state.themeMode === 'system') applyTheme('system')
  })
}

async function init() {
  cacheElements()
  buildStripTicks()
  if (el.settingsSheet) el.settingsSheet.inert = true
  if (el.stripDemoTag) el.stripDemoTag.hidden = true
  if (el.deckDemoTag) el.deckDemoTag.hidden = true
  document.body.classList.toggle('showcase', IS_SHOWCASE)
  try {
    state.privacy = localStorage.getItem('tm:privacy') === '1'
  } catch {
    state.privacy = false
  }
  updatePrivacyButtons()

  try {
    const boot = await bridge.bootstrap()
    state.version = boot.version || state.version
    state.config = boot.config
    state.pace = boot.config?.paceMode || '30d'
    state.baseTheme = boot.config?.theme || 'light'
    state.view = boot.view === 'deck' ? 'deck' : 'strip'
    // The window resize and the content crossfade must share one duration.
    if (Number(boot.morphMs) > 0) {
      document.documentElement.style.setProperty('--morph-ms', `${Math.round(boot.morphMs)}ms`)
    }
    if (boot.formHeights?.strip && boot.formHeights?.deck) state.formHeights = boot.formHeights
    applyPlatformLabels(boot)
    document.body.classList.toggle('showcase', Boolean(boot.showcase))
    applyTheme(FORCE_DARK ? 'dark' : state.baseTheme)
    setBodyView(state.view)
    updatePinButtons(Boolean(state.config?.alwaysOnTop))
    bindEvents()
    await refresh({ initial: true })
    // Webfonts land after the first paint, and a width measured against the
    // fallback is not the width the number will end up occupying: on a slower
    // machine the fitted size was decided before Inter arrived. Re-render once
    // the real metrics are in, so fitting is measured against what ships.
    document.fonts?.ready?.then(() => {
      renderStrip()
      renderDeck()
    }, () => {})
    // The operating system applies a window resize on its own schedule, so the
    // width a fit was decided against can change after the fact. Re-measure
    // when the window settles rather than trusting the first pass.
    window.addEventListener('resize', refitNumbers)
    // In showcase capture the card is composited once and the process exits
    // shortly after, so a standing watch would only burn a timer.
    if (!boot.showcase) startNumberWatch()
    if (AUTO_SETTINGS) {
      setTimeout(() => openSettings({ focus: false }), 420)
    }
  } catch (error) {
    console.error(error)
    showToast(error?.message || '启动失败')
    bridge.ready()
  }
}

init()
