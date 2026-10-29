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
// macOS hands out "Resource busy" (hdiutil exit 16) for both attaching and
// detaching a disk image when something else on the machine still holds the
// volume — the same race that made the DMG build step need a bounded retry back
// in cloud round 3, now seen on the verification step on macOS Intel. The mount
// point is this script's own, so retrying it cannot unmount anything belonging
// to anyone else; three attempts, every failed one logged, and a busy volume that
// outlasts them is still a failure rather than a warning.
function hdiutil(args) {
  const attempts = []
  for (let attempt = 1; attempt <= 3; attempt++) {
    const result = spawnSync('hdiutil', args, { cwd: root, encoding: 'utf8' })
    if (!result.error && result.status === 0) {
      if (attempts.length) console.log(`hdiutil ${args[0]} succeeded on attempt ${attempt} after: ${JSON.stringify(attempts)}`)
      return
    }
    attempts.push({ attempt, exit: result.status ?? 'spawn-error', out: String(result.stderr || result.stdout || result.error || '').trim().slice(0, 200) })
    spawnSync('sleep', String(2 * attempt))
  }
  throw new Error(`hdiutil ${args[0]} failed three times: ${JSON.stringify(attempts)}`)
}
function archive(extension) {
  const file = path.join(release, `${stem}.${extension}`)
  if (!fs.existsSync(file) || !fs.statSync(file).size) throw new Error(`Missing archive: ${file}`)
  // A ZIP left over from an earlier build would "verify" code that no longer
  // exists, so the archive must not be older than anything it is meant to ship.
  const newestSource = newestMtime(['main.js', 'preload.js', 'package.json', 'lib', 'renderer'])
  const packed = fs.statSync(file).mtimeMs
  if (packed < newestSource.time) {
    throw new Error(
      `Stale archive: ${path.basename(file)} predates ${newestSource.file} ` +
      `(${new Date(packed).toISOString()} < ${new Date(newestSource.time).toISOString()}). Rebuild the package.`
    )
  }
  return file
}
function newestMtime(entries) {
  let best = { file: '', time: 0 }
  const visit = (absolute, relative) => {
    const stat = fs.statSync(absolute)
    if (stat.isDirectory()) {
      for (const name of fs.readdirSync(absolute)) visit(path.join(absolute, name), path.join(relative, name))
    } else if (stat.mtimeMs > best.time) {
      best = { file: relative, time: stat.mtimeMs }
    }
  }
  for (const entry of entries) {
    const absolute = path.join(root, entry)
    if (fs.existsSync(absolute)) visit(absolute, entry)
  }
  if (!best.file) throw new Error('No source files found to compare against the archive')
  return best
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
    hdiutil(['attach', archive('dmg'), '-readonly', '-nobrowse', '-mountpoint', mount])
    const installed = path.join(verifyDir, 'dmg', `${productName}.app`)
    try {
      fs.mkdirSync(path.dirname(installed))
      run('ditto', [path.join(mount, `${productName}.app`), installed])
    } finally {
      hdiutil(['detach', mount])
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
