// Produce the same Windows portable ZIP the CI job publishes, from the freshly
// packaged dist/ directory. Keeping this in one script stops the local flow
// from validating a stale archive left over from an earlier build.
import fs from 'node:fs'
import path from 'node:path'
import { spawnSync } from 'node:child_process'
import { fileURLToPath } from 'node:url'

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const { version, productName } = JSON.parse(fs.readFileSync(path.join(root, 'package.json'), 'utf8'))
const source = path.join(root, 'dist', `${productName}-win32-x64`)
const release = path.join(root, 'release')
const target = path.join(release, `token-monitor-${version}-win-x64.zip`)

if (process.platform !== 'win32') throw new Error('The Windows ZIP can only be built on Windows')
if (!fs.existsSync(path.join(source, `${productName}.exe`))) {
  throw new Error(`Packaged app not found: ${source}. Run npm run package:win first.`)
}
fs.mkdirSync(release, { recursive: true })
if (fs.existsSync(target)) fs.rmSync(target)

const quote = (value) => `'${value.replaceAll("'", "''")}'`
const result = spawnSync('powershell.exe', [
  '-NoProfile', '-NonInteractive', '-Command',
  `$ErrorActionPreference='Stop'; Compress-Archive -LiteralPath ${quote(source)} -DestinationPath ${quote(target)}`
], { cwd: root, stdio: 'inherit' })
if (result.error) throw result.error
if (result.status !== 0) throw new Error(`Compress-Archive failed (exit ${result.status}, signal ${result.signal})`)

const size = fs.statSync(target).size
if (!size) throw new Error(`Empty archive: ${target}`)
console.log(`Wrote ${path.relative(root, target)} (${size} bytes) from ${path.relative(root, source)}`)
