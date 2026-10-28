// Mocked safeStorage contracts; not a substitute for native keyring tests.
// The probe is async and lazy: nothing here may require a synchronous
// keyring call on the startup path.
import assert from 'node:assert/strict'
import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import vm from 'node:vm'
import { createRequire } from 'node:module'
import { fileURLToPath } from 'node:url'

const require = createRequire(import.meta.url)
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const source = fs.readFileSync(path.join(root, 'lib', 'store.js'), 'utf8')
// store.js takes its accepted languages from the translation registry; the
// sandbox hands it that same real module rather than a copy of the list.
const i18n = require(path.join(root, 'renderer', 'i18n.js'))
const temp = fs.mkdtempSync(path.join(os.tmpdir(), 'tm-store-'))
const secret = 'sk-mock-only-9876'

// [platform, backend, available, expected]
const cases = [
  ['win32', null, true, 'dpapi'],
  ['darwin', null, true, 'keychain'],
  ...['gnome_libsecret', 'kwallet', 'kwallet5', 'kwallet6'].map(b => ['linux', b, true, b]),
  ['linux', 'basic_text', true, 'none'],
  ['linux', 'unknown', true, 'none'],
  ['linux', 'gnome_libsecret', false, 'none'],
  ['linux', null, true, 'none'],
  ['win32', null, false, 'none'],
  ['darwin', null, false, 'none'],
  ['linux', 'throws', true, 'none']
]

// Build a fresh store per scenario: separate profile dir and separate mocks,
// so module-level caching cannot leak between cases.
function makeStore({ platform, backend = null, available = true, hang = false, asyncApi = true, dir }) {
  let encryptCalls = 0
  let syncAvailabilityCalls = 0
  let asyncAvailabilityCalls = 0
  const safeStorage = {
    encryptString: value => { encryptCalls++; return Buffer.from(`mock:${value}`) },
    decryptString: bytes => {
      assert.ok(bytes.toString().startsWith('mock:'))
      return bytes.toString().slice(5)
    }
  }
  if (!hang) {
    safeStorage.isEncryptionAvailable = () => { syncAvailabilityCalls++; return available }
    if (asyncApi) {
      safeStorage.isAsyncEncryptionAvailable = async () => {
        asyncAvailabilityCalls++
        if (platform === 'linux' && backend === 'throws') throw new Error('keyring unavailable')
        return available
      }
    }
  } else {
    // A locked keychain or a pending authorization prompt: the promise never
    // settles, which is exactly what froze the main process before.
    safeStorage.isEncryptionAvailable = () => new Promise(() => {})
    if (asyncApi) safeStorage.isAsyncEncryptionAvailable = () => new Promise(() => {})
  }
  if (platform === 'linux') {
    safeStorage.getSelectedStorageBackend = () => {
      if (backend === 'throws') throw new Error('keyring unavailable')
      return backend
    }
  }
  const sandbox = {
    module: { exports: {} },
    Buffer,
    process: { platform },
    setTimeout,
    clearTimeout,
    require: id => {
      if (id === 'electron') return { app: { getPath: () => dir }, safeStorage }
      if (id === 'node:fs') return fs
      if (id === 'node:path') return path
      if (id === '../renderer/i18n') return i18n
      throw new Error(`Unexpected import ${id}`)
    }
  }
  vm.runInNewContext(source, sandbox, { filename: 'lib/store.js' })
  const store = sandbox.module.exports
  store.__counters = () => ({
    encrypt: encryptCalls,
    syncAvailability: syncAvailabilityCalls,
    asyncAvailability: asyncAvailabilityCalls
  })
  return store
}

function freshDir(name) {
  const dir = path.join(temp, name)
  fs.mkdirSync(dir, { recursive: true })
  return dir
}

function disk(dir) {
  return JSON.parse(fs.readFileSync(path.join(dir, 'config.json'), 'utf8'))
}

let passed = 0
try {
  // 1) Backend classification for every supported platform, async API first.
  for (const [index, [platform, backend, available, expected]] of cases.entries()) {
    const store = makeStore({ platform, backend, available, dir: freshDir(`classify-${index}`) })
    assert.equal(store.encryptionBackend(), null, 'the backend must be unknown before the probe')
    assert.equal(store.encryptionAvailable(), false, 'nothing may be claimed as encrypted yet')
    assert.equal(await store.probeBackend(), expected)
    assert.equal(store.encryptionBackend(), expected)
    assert.equal(store.encryptionAvailable(), expected !== 'none')
    assert.equal(store.__counters().asyncAvailability, 1, 'the async availability API must be used')
    assert.equal(store.__counters().syncAvailability, 0, 'the deprecated sync availability API must not be called')
    passed++
  }
  console.log(`PASS backend classification: ${cases.length} mocked platforms.`)

  // 2) A save that introduces a credential probes first and never blocks.
  {
    const dir = freshDir('save-probes')
    const store = makeStore({ platform: 'win32', available: true, dir })
    const view = await store.save({ apiKey: `Bearer ${secret}`, sessionToken: 'mock-session', theme: 'dark' })
    assert.equal(store.encryptionBackend(), 'dpapi', 'saving a secret must resolve the probe first')
    assert.equal(view.hasApiKey, true)
    assert.equal(view.hasSession, true)
    const onDisk = disk(dir)
    assert.ok(onDisk.apiKeyEnc.startsWith('enc:'), 'a secure backend must store enc:')
    assert.ok(onDisk.sessionTokenEnc.startsWith('enc:'))
    assert.equal(JSON.stringify(view).includes(secret), false, 'publicView must not leak the secret')
    assert.equal(store.secrets().apiKey, secret, 'decrypted roundtrip')
    assert.equal(store.__counters().syncAvailability, 0)
    passed++
    console.log('PASS save: probes lazily, encrypts, and keeps the secret out of publicView.')
  }

  // 3) An unanswered probe must refuse the write instead of downgrading it.
  {
    const dir = freshDir('save-pending')
    const store = makeStore({ platform: 'darwin', hang: true, dir })
    await assert.rejects(
      () => store.save({ apiKey: secret }),
      /系统加密状态未确认，凭证未保存/,
      'a pending keyring must not be treated as "no encryption"'
    )
    assert.equal(fs.existsSync(path.join(dir, 'config.json')), false, 'nothing may be written while pending')
    assert.equal(store.encryptionBackend(), null)
    assert.equal(await store.resolveBackend(200), 'pending', 'resolveBackend must report the timeout')
    passed++
    console.log('PASS pending keyring: credential save is refused, no plaintext on disk.')
  }

  // 4) Non-secret saves still work while the keyring is silent.
  {
    const dir = freshDir('theme-while-pending')
    const store = makeStore({ platform: 'darwin', hang: true, dir })
    const view = await store.save({ theme: 'dark', view: 'deck' })
    assert.equal(view.theme, 'dark')
    assert.equal(disk(dir).theme, 'dark')
    passed++
    console.log('PASS theme/view save succeeds even when the keyring never answers.')
  }

  // 5) An unrelated save must not rewrite, or downgrade, a stored credential.
  {
    const dir = freshDir('retain')
    const store = makeStore({ platform: 'linux', backend: 'gnome_libsecret', available: true, dir })
    await store.save({ apiKey: secret })
    const before = disk(dir).apiKeyEnc
    assert.ok(before.startsWith('enc:'))
    const counters = store.__counters()
    const reEncryptions = counters.encrypt
    await store.save({ view: 'deck' })
    assert.equal(disk(dir).apiKeyEnc, before, 'an unchanged credential keeps its stored ciphertext')
    assert.equal(store.__counters().encrypt, reEncryptions, 'an unrelated save must not re-encrypt')
    assert.equal(store.secrets().apiKey, secret)
    passed++
    console.log('PASS retention: unrelated saves reuse the stored ciphertext (no silent rewrite).')
  }

  // 6) A stored enc: credential survives a later backend outage unchanged.
  {
    const dir = freshDir('outage')
    const secure = makeStore({ platform: 'win32', available: true, dir })
    await secure.save({ apiKey: secret })
    const before = disk(dir).apiKeyEnc
    const cold = makeStore({ platform: 'win32', available: false, dir })
    await cold.save({ theme: 'dark' })
    assert.equal(disk(dir).apiKeyEnc, before, 'a temporarily unavailable backend must not rewrite enc: as plain:')
    assert.equal(disk(dir).theme, 'dark')
    passed++
    console.log('PASS outage: enc: credential is preserved when the backend reports unavailable.')
  }

  // 7) A legacy base64 credential is upgraded once, and only when secure.
  {
    const dir = freshDir('upgrade')
    const legacy = `plain:${Buffer.from(secret).toString('base64')}`
    fs.writeFileSync(path.join(dir, 'config.json'), JSON.stringify({
      version: 2, demo: true, theme: 'light', intervalSec: 60, alwaysOnTop: true,
      view: 'strip', paceMode: '30d', apiKeyEnc: legacy, sessionTokenEnc: ''
    }))
    const insecure = makeStore({ platform: 'linux', backend: 'basic_text', available: true, dir })
    await insecure.save({ theme: 'dark' })
    assert.equal(disk(dir).apiKeyEnc, legacy, 'an unprobed save must not rewrite the stored value')
    await insecure.probeBackend()
    await insecure.save({ intervalSec: 30 })
    assert.equal(disk(dir).apiKeyEnc, legacy, 'an obfuscation-only backend must not pretend to upgrade')
    const secure = makeStore({ platform: 'win32', available: true, dir })
    await secure.probeBackend() // what opening the settings drawer does
    await secure.save({ theme: 'light' })
    assert.ok(disk(dir).apiKeyEnc.startsWith('enc:'), 'a secure backend upgrades the legacy value')
    assert.equal(secure.secrets().apiKey, secret)
    passed++
    console.log('PASS legacy plain: value upgrades to enc: only against a secure backend.')
  }

  // 8) Empty input retains, clearSecrets removes, and clearing needs no probe.
  {
    const dir = freshDir('clear')
    const store = makeStore({ platform: 'win32', available: true, dir })
    await store.save({ apiKey: secret })
    await store.save({ apiKey: '' })
    assert.equal(store.secrets().apiKey, secret, 'empty input must retain the credential')
    store.clearSecrets()
    assert.equal(disk(dir).apiKeyEnc, '')
    assert.equal(disk(dir).sessionTokenEnc, '')
    const cold = makeStore({ platform: 'darwin', hang: true, dir })
    await cold.save({ demo: false })
    assert.equal(cold.secrets().apiKey, '')
    passed++
    console.log('PASS retain/clear semantics, including a clear that never touches the keyring.')
  }

  // 9) A config written by a hostile path (spaces + CJK) still round-trips.
  {
    const dir = freshDir('cjk path 中文 目录')
    const store = makeStore({ platform: 'linux', backend: 'kwallet6', available: true, dir })
    await store.save({ sessionToken: 'mock-session' })
    assert.ok(disk(dir).sessionTokenEnc.startsWith('enc:'))
    const reloaded = makeStore({ platform: 'linux', backend: 'kwallet6', available: true, dir })
    assert.equal(reloaded.secrets().sessionToken, 'mock-session')
    passed++
    console.log('PASS config survives a non-ASCII profile path.')
  }

  // 10) The accepted languages come from the translation registry, so a new
  // dictionary is a valid setting the moment it ships — and anything else is
  // ignored rather than written to disk and rendered as an unset language.
  {
    const dir = freshDir('locale-setting')
    const store = makeStore({ platform: 'win32', available: false, dir })
    for (const locale of ['auto', ...i18n.LOCALES]) {
      const view = await store.save({ locale })
      assert.equal(view.locale, locale, `${locale} must be accepted as a language setting`)
      assert.equal(disk(dir).locale, locale, `${locale} must survive to disk`)
      assert.equal(makeStore({ platform: 'win32', available: false, dir }).get().locale, locale,
        `${locale} must survive a restart`)
    }
    for (const bad of ['fr', 'es-MX', 'EN', '', 'auto ']) {
      const last = i18n.LOCALES[i18n.LOCALES.length - 1]
      assert.equal((await store.save({ locale: bad })).locale, last,
        `${JSON.stringify(bad)} has no dictionary and must not change the saved language`)
    }
    fs.writeFileSync(path.join(dir, 'config.json'), JSON.stringify({ locale: 'fr-FR' }))
    assert.equal(makeStore({ platform: 'win32', available: false, dir }).get().locale, 'auto',
      'a language read from disk must still be one of the shipped ones')
    passed++
    console.log(`PASS language setting accepts exactly the shipped dictionaries: ${i18n.LOCALES.join(', ')}.`)
  }

  console.log(`\nStorage contract tests passed: ${passed} groups (mocked backends, not real OS keyrings).`)
} finally {
  fs.rmSync(temp, { recursive: true, force: true })
}
