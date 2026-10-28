// Exercise the executable extracted from the actual downloadable archive.
// Never fall back to dist/: that would validate an unrelated older build.
import fs from 'node:fs'
import path from 'node:path'
import { spawnSync } from 'node:child_process'
import { fileURLToPath } from 'node:url'

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const release = path.join(root, 'release')
const { name, version, productName } = JSON.parse(fs.readFileSync(path.join(root, 'package.json'), 'utf8'))
if (!fs.existsSync(release)) throw new Error('Build release packages first')
const verifyDir = fs.mkdtempSync(path.join(release, 'verify-'))
const platformName = { win32: 'win', darwin: 'mac', linux: 'linux' }[process.platform]
const stem = `${name}-${version}-${platformName}-${process.arch}`

function run(command, args, options = {}) {
  const result = spawnSync(command, args, { cwd: root, stdio: 'inherit', ...options })
  if (result.error) throw result.error
  if (result.status !== 0) throw new Error(`${command} failed (exit ${result.status}, signal ${result.signal})`)
}
function archive(extension) {
  const file = path.join(release, `${stem}.${extension}`)
  if (!fs.existsSync(file) || !fs.statSync(file).size) throw new Error(`Missing archive: ${file}`)
  return file
}
function check(executable) {
  if (!fs.statSync(executable).isFile()) throw new Error(`Missing executable: ${executable}`)
  run(process.execPath, [path.join(root, 'scripts', 'packaged-check.mjs')], {
    env: { ...process.env, TM_PACKAGED_EXECUTABLE: executable }
  })
}
const psQuote = (s) => `'${s.replaceAll("'", "''")}'`

let success = false
try {
  if (process.platform === 'win32') {
    const zip = archive('zip')
    run('powershell.exe', ['-NoProfile', '-NonInteractive', '-Command',
      `$ErrorActionPreference='Stop'; Expand-Archive -LiteralPath ${psQuote(zip)} -DestinationPath ${psQuote(verifyDir)}`])
    check(path.join(verifyDir, `${productName}-win32-${process.arch}`, `${productName}.exe`))
  } else if (process.platform === 'linux') {
    // Extracting needs neither FUSE nor root; sandbox stays enabled at runtime.
    run(archive('AppImage'), ['--appimage-extract'], { cwd: verifyDir, stdio: 'ignore' })
    check(path.join(verifyDir, 'squashfs-root', 'AppRun'))
  } else if (process.platform === 'darwin') {
    const zipDir = path.join(verifyDir, 'zip')
    fs.mkdirSync(zipDir)
    run('ditto', ['-x', '-k', archive('zip'), zipDir])
    const bundle = path.join(zipDir, `${productName}.app`)
    run('codesign', ['--verify', '--deep', '--strict', bundle])
    check(path.join(bundle, 'Contents', 'MacOS', productName))
    // Mount the DMG read-only, copy its app as an installation would, then run.
    const mount = path.join(verifyDir, 'mounted')
    fs.mkdirSync(mount)
    run('hdiutil', ['attach', archive('dmg'), '-readonly', '-nobrowse', '-mountpoint', mount])
    const installed = path.join(verifyDir, 'dmg', `${productName}.app`)
    try {
      fs.mkdirSync(path.dirname(installed))
      run('ditto', [path.join(mount, `${productName}.app`), installed])
    } finally {
      run('hdiutil', ['detach', mount])
    }
    run('codesign', ['--verify', '--deep', '--strict', installed])
    check(path.join(installed, 'Contents', 'MacOS', productName))
  } else {
    throw new Error(`Unsupported platform: ${process.platform}`)
  }
  success = true
  console.log(`Distributable check passed: ${stem}`)
} finally {
  if (success) fs.rmSync(verifyDir, { recursive: true, force: true, maxRetries: 5, retryDelay: 250 })
  else console.error(`Retained extracted package for diagnosis: ${verifyDir}`)
}
