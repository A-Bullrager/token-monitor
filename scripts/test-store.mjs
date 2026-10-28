// Mocked safeStorage contracts; not a substitute for native keyring tests.
import assert from 'node:assert/strict'
import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import vm from 'node:vm'
import { fileURLToPath } from 'node:url'

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const source = fs.readFileSync(path.join(root, 'lib', 'store.js'), 'utf8')
const temp = fs.mkdtempSync(path.join(os.tmpdir(), 'tm-store-'))
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
const secret = 'sk-mock-only-9876'
try {
  for (const [index, [platform, backend, available, expected]] of cases.entries()) {
    const dir = path.join(temp, `${index} 中文 目录`)
    let encryptCalls = 0
    const safeStorage = {
      isEncryptionAvailable: () => available,
      getSelectedStorageBackend: () => {
        if (backend === 'throws') throw new Error('keyring unavailable')
        return backend
      },
      encryptString: value => { encryptCalls++; return Buffer.from(`mock:${value}`) },
      decryptString: bytes => {
        assert.ok(bytes.toString().startsWith('mock:'))
        return bytes.toString().slice(5)
      }
    }
    const load = () => {
      const module = { exports: {} }
      vm.runInNewContext(source, {
        module, Buffer, process: { platform },
        require: id => {
          if (id === 'electron') return { app: { getPath: () => dir }, safeStorage }
          if (id === 'node:fs') return fs
          if (id === 'node:path') return path
          throw new Error(`Unexpected import ${id}`)
        }
      }, { filename: 'lib/store.js' })
      return module.exports
    }
    const store = load()
    assert.equal(store.encryptionBackend(), expected)
    assert.equal(store.encryptionAvailable(), expected !== 'none')
    store.save({ apiKey: `Bearer ${secret}`, sessionToken: 'mock-session', theme: 'dark' })
    const disk = JSON.parse(fs.readFileSync(store.configFile(), 'utf8'))
    const prefix = expected === 'none' ? 'plain:' : 'enc:'
    assert.ok(disk.apiKeyEnc.startsWith(prefix))
    assert.ok(disk.sessionTokenEnc.startsWith(prefix))
    assert.equal(encryptCalls > 0, expected !== 'none')
    if (expected === 'none') assert.equal(Buffer.from(disk.apiKeyEnc.slice(6), 'base64').toString(), secret)
    assert.equal(JSON.stringify(store.publicView()).includes(secret), false)
    assert.equal(load().secrets().apiKey, secret)
    store.save({ apiKey: '' })
    assert.equal(store.secrets().apiKey, secret, 'empty input must retain credential')
    store.clearSecrets()
    assert.equal(load().secrets().apiKey, '')
    console.log(`PASS ${platform}/${backend || 'default'} available=${available}: ${expected}`)
  }
  console.log(`Storage contract tests passed: ${cases.length} mocked backend cases.`)
} finally {
  fs.rmSync(temp, { recursive: true, force: true })
}
