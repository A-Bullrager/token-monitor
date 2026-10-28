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
  locale: 'auto',
  apiKey: '',
  sessionToken: ''
}

const VALID_THEMES = new Set(['light', 'dark', 'system'])
const VALID_INTERVALS = new Set([0, 30, 60, 300])
const VALID_VIEWS = new Set(['strip', 'deck'])
const VALID_PACES = new Set(['30d', '7d'])
// Derived from the translation registry: a language that has a dictionary is a
// language the setting may name, so the picker, the store and the dictionaries
// cannot drift apart.
const VALID_LOCALES = new Set(['auto', ...require('../renderer/i18n').LOCALES])

let runtime = null

function configFile() {
  return path.join(app.getPath('userData'), 'config.json')
}

function encrypt(value) {
  if (!value) return ''
  if (encryptionAvailable()) {
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
  out.locale = VALID_LOCALES.has(input.locale) ? input.locale : DEFAULTS.locale
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

// Ciphertext already on disk is left untouched unless the user supplies a new
// value. Re-encrypting on every write would let an unrelated toggle (view,
// pin, theme) silently downgrade a stored `enc:` credential to `plain:`
// whenever the system backend has not answered yet.
const storedCipher = { apiKey: '', sessionToken: '' }
const dirtySecret = { apiKey: false, sessionToken: false }

function readFile() {
  const file = configFile()
  try {
    if (!fs.existsSync(file)) return null
    const parsed = JSON.parse(fs.readFileSync(file, 'utf8'))
    storedCipher.apiKey = typeof parsed.apiKeyEnc === 'string' ? parsed.apiKeyEnc : ''
    storedCipher.sessionToken = typeof parsed.sessionTokenEnc === 'string' ? parsed.sessionTokenEnc : ''
    return {
      demo: parsed.demo,
      theme: parsed.theme,
      intervalSec: parsed.intervalSec,
      alwaysOnTop: parsed.alwaysOnTop,
      view: parsed.view,
      paceMode: parsed.paceMode,
      locale: parsed.locale,
      apiKey: decrypt(storedCipher.apiKey),
      sessionToken: decrypt(storedCipher.sessionToken)
    }
  } catch {
    return null
  }
}

function get() {
  if (!runtime) runtime = sanitize(readFile() || {})
  return runtime
}

function cipherFor(kind) {
  const value = get()[kind]
  if (!value) return ''
  const existing = storedCipher[kind] || ''
  // A legacy base64 credential is upgraded once, and only once, the system
  // backend is known to be available.
  const upgrade = existing.startsWith('plain:') && encryptionAvailable()
  if (!dirtySecret[kind] && !upgrade && existing) return existing
  return encrypt(value)
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
    locale: state.locale,
    apiKeyEnc: cipherFor('apiKey'),
    sessionTokenEnc: cipherFor('sessionToken')
  }
  const tmp = file + '.tmp'
  fs.writeFileSync(tmp, JSON.stringify(payload, null, 2), 'utf8')
  fs.renameSync(tmp, file)
  storedCipher.apiKey = payload.apiKeyEnc
  storedCipher.sessionToken = payload.sessionTokenEnc
  dirtySecret.apiKey = false
  dirtySecret.sessionToken = false
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
    locale: state.locale,
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

// Linux's basic_text backend is obfuscation, not a system-protected secret.
// Keep the legacy base64 fallback, but never label it encrypted in the UI.
//
// The availability check is a *synchronous* Keychain/DPAPI call. On macOS a
// locked keychain or a pending authorization prompt blocks it forever, which
// froze the whole main process when it ran during startup. It therefore only
// ever runs off the startup path: probeBackend() caches an async result, and
// encryptionBackend() reports `null` ("not known yet") until that resolves.
const SECURE_LINUX_BACKENDS = ['gnome_libsecret', 'kwallet', 'kwallet5', 'kwallet6']
const SAVE_PROBE_MS = 5000

let probe = null
let resolved = null

function classify(available) {
  if (!available) return 'none'
  if (process.platform === 'win32') return 'dpapi'
  if (process.platform === 'darwin') return 'keychain'
  let backend = null
  try {
    backend = safeStorage.getSelectedStorageBackend?.()
  } catch {
    return 'none'
  }
  return SECURE_LINUX_BACKENDS.includes(backend) ? backend : 'none'
}

function probeBackend() {
  if (!probe) {
    probe = Promise.resolve()
      .then(() => (typeof safeStorage.isAsyncEncryptionAvailable === 'function'
        ? safeStorage.isAsyncEncryptionAvailable()
        : safeStorage.isEncryptionAvailable()))
      .then((available) => { resolved = classify(available) })
      .catch(() => { resolved = 'none' })
      .then(() => resolved)
  }
  return probe
}

// 'pending' means the system has not answered yet, which is NOT the same as
// 'none': callers must not downgrade credentials to reversible base64 on it.
async function resolveBackend(timeoutMs = SAVE_PROBE_MS) {
  if (resolved) return resolved
  let timer
  try {
    return await Promise.race([
      probeBackend(),
      new Promise((resolve) => { timer = setTimeout(() => resolve('pending'), timeoutMs) })
    ])
  } finally {
    clearTimeout(timer)
  }
}

function encryptionBackend() {
  return resolved
}

function encryptionAvailable() {
  return Boolean(resolved) && resolved !== 'none'
}

async function save(patch = {}) {
  const state = get()
  const nextApiKey = typeof patch.apiKey === 'string' ? cleanSecret(patch.apiKey) : ''
  const nextSession = typeof patch.sessionToken === 'string' ? cleanSecret(patch.sessionToken) : ''
  // Decide before mutating anything: an unanswered backend must not leave a
  // half-applied credential in memory, nor a plaintext copy on disk.
  if ((nextApiKey || nextSession) && !resolved) {
    const backend = await resolveBackend()
    if (backend === 'pending') throw new Error('系统加密状态未确认，凭证未保存')
  }
  if (typeof patch.demo === 'boolean') state.demo = patch.demo
  if (VALID_THEMES.has(patch.theme)) state.theme = patch.theme
  if (VALID_INTERVALS.has(Number(patch.intervalSec))) state.intervalSec = Number(patch.intervalSec)
  if (typeof patch.alwaysOnTop === 'boolean') state.alwaysOnTop = patch.alwaysOnTop
  if (VALID_VIEWS.has(patch.view)) state.view = patch.view
  if (VALID_PACES.has(patch.paceMode)) state.paceMode = patch.paceMode
  if (VALID_LOCALES.has(patch.locale)) state.locale = patch.locale
  if (nextApiKey) {
    state.apiKey = nextApiKey
    dirtySecret.apiKey = true
  }
  if (nextSession) {
    state.sessionToken = nextSession
    dirtySecret.sessionToken = true
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

module.exports = {
  get,
  publicView,
  secrets,
  save,
  clearSecrets,
  configFile,
  encryptionAvailable,
  encryptionBackend,
  probeBackend,
  resolveBackend
}
