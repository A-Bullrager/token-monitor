'use strict'

const fs = require('node:fs')
const path = require('node:path')
const { app, safeStorage } = require('electron')

const DEFAULTS = {
  demo: true,
  theme: 'light',
  intervalSec: 60,
  alwaysOnTop: true,
  view: 'strip',
  paceMode: '30d',
  apiKey: '',
  sessionToken: ''
}

const VALID_THEMES = new Set(['light', 'dark', 'system'])
const VALID_INTERVALS = new Set([0, 30, 60, 300])
const VALID_VIEWS = new Set(['strip', 'deck'])
const VALID_PACES = new Set(['30d', '7d'])

let runtime = null

function configFile() {
  return path.join(app.getPath('userData'), 'config.json')
}

function encrypt(value) {
  if (!value) return ''
  if (safeStorage.isEncryptionAvailable()) {
    return 'enc:' + safeStorage.encryptString(value).toString('base64')
  }
  return 'plain:' + Buffer.from(value, 'utf8').toString('base64')
}

function decrypt(value) {
  if (!value || typeof value !== 'string') return ''
  try {
    if (value.startsWith('enc:')) {
      return safeStorage.decryptString(Buffer.from(value.slice(4), 'base64'))
    }
    if (value.startsWith('plain:')) {
      return Buffer.from(value.slice(6), 'base64').toString('utf8')
    }
  } catch {
    return ''
  }
  return ''
}

function sanitize(input = {}) {
  const out = { ...DEFAULTS }
  out.demo = typeof input.demo === 'boolean' ? input.demo : DEFAULTS.demo
  out.theme = VALID_THEMES.has(input.theme) ? input.theme : DEFAULTS.theme
  out.intervalSec = VALID_INTERVALS.has(Number(input.intervalSec))
    ? Number(input.intervalSec)
    : DEFAULTS.intervalSec
  out.alwaysOnTop = typeof input.alwaysOnTop === 'boolean' ? input.alwaysOnTop : DEFAULTS.alwaysOnTop
  out.view = VALID_VIEWS.has(input.view) ? input.view : DEFAULTS.view
  out.paceMode = VALID_PACES.has(input.paceMode) ? input.paceMode : DEFAULTS.paceMode
  out.apiKey = cleanSecret(input.apiKey)
  out.sessionToken = cleanSecret(input.sessionToken)
  return out
}

function cleanSecret(value) {
  if (typeof value !== 'string') return ''
  let result = value.trim()
  result = result.replace(/^Authorization\s*:\s*/i, '').trim()
  result = result.replace(/^Bearer\s+/i, '').trim()
  if (
    (result.startsWith('"') && result.endsWith('"')) ||
    (result.startsWith("'") && result.endsWith("'"))
  ) {
    result = result.slice(1, -1).trim()
  }
  return result
}

function readFile() {
  const file = configFile()
  try {
    if (!fs.existsSync(file)) return null
    const parsed = JSON.parse(fs.readFileSync(file, 'utf8'))
    return {
      demo: parsed.demo,
      theme: parsed.theme,
      intervalSec: parsed.intervalSec,
      alwaysOnTop: parsed.alwaysOnTop,
      view: parsed.view,
      paceMode: parsed.paceMode,
      apiKey: decrypt(parsed.apiKeyEnc),
      sessionToken: decrypt(parsed.sessionTokenEnc)
    }
  } catch {
    return null
  }
}

function get() {
  if (!runtime) runtime = sanitize(readFile() || {})
  return runtime
}

function write() {
  const state = get()
  const file = configFile()
  fs.mkdirSync(path.dirname(file), { recursive: true })
  const payload = {
    version: 2,
    demo: state.demo,
    theme: state.theme,
    intervalSec: state.intervalSec,
    alwaysOnTop: state.alwaysOnTop,
    view: state.view,
    paceMode: state.paceMode,
    apiKeyEnc: encrypt(state.apiKey),
    sessionTokenEnc: encrypt(state.sessionToken)
  }
  const tmp = file + '.tmp'
  fs.writeFileSync(tmp, JSON.stringify(payload, null, 2), 'utf8')
  fs.renameSync(tmp, file)
}

function mask(value) {
  if (!value) return ''
  if (value.length <= 8) return '••••'
  const head = value.startsWith('sk-') ? 'sk-' : ''
  return `${head}••••${value.slice(-4)}`
}

function publicView() {
  const state = get()
  return {
    demo: state.demo,
    theme: state.theme,
    intervalSec: state.intervalSec,
    alwaysOnTop: state.alwaysOnTop,
    view: state.view,
    paceMode: state.paceMode,
    hasApiKey: Boolean(state.apiKey),
    hasSession: Boolean(state.sessionToken),
    apiKeyHint: mask(state.apiKey),
    sessionHint: mask(state.sessionToken)
  }
}

function secrets() {
  const state = get()
  return { apiKey: state.apiKey, sessionToken: state.sessionToken }
}

function save(patch = {}) {
  const state = get()
  if (typeof patch.demo === 'boolean') state.demo = patch.demo
  if (VALID_THEMES.has(patch.theme)) state.theme = patch.theme
  if (VALID_INTERVALS.has(Number(patch.intervalSec))) state.intervalSec = Number(patch.intervalSec)
  if (typeof patch.alwaysOnTop === 'boolean') state.alwaysOnTop = patch.alwaysOnTop
  if (VALID_VIEWS.has(patch.view)) state.view = patch.view
  if (VALID_PACES.has(patch.paceMode)) state.paceMode = patch.paceMode
  if (typeof patch.apiKey === 'string' && cleanSecret(patch.apiKey)) {
    state.apiKey = cleanSecret(patch.apiKey)
  }
  if (typeof patch.sessionToken === 'string' && cleanSecret(patch.sessionToken)) {
    state.sessionToken = cleanSecret(patch.sessionToken)
  }
  write()
  return publicView()
}

function clearSecrets() {
  const state = get()
  state.apiKey = ''
  state.sessionToken = ''
  write()
  return publicView()
}

module.exports = { get, publicView, secrets, save, clearSecrets, configFile }
