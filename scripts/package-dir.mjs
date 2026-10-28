// Packages the app for the *host* platform with electron-packager, picking the
// icon format that platform actually accepts (electron-packager throws if you
// hand it a .ico for a macOS build).
//
// The result is a plain, runnable directory tree under
//   dist/Token Monitor-<platform>-<arch>/
// which is what scripts/app-paths.mjs resolves for the packaged-app checks.
// Distributable installers (AppImage, dmg) come from electron-builder instead.
//
// Usage: node scripts/package-dir.mjs
import { spawnSync } from 'node:child_process'
import fs from 'node:fs'
import path from 'node:path'
import process from 'node:process'
import { fileURLToPath } from 'node:url'
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const cli = path.join(root, 'node_modules', '@electron', 'packager', 'bin', 'electron-packager.mjs')

const ICONS = {
  win32: 'build/icon.ico',
  darwin: 'build/icon.icns',
  linux: 'build/icon.png'
}

if (process.argv.includes('--win') && (process.platform !== 'win32' || process.arch !== 'x64')) {
  throw new Error('package:win requires a Windows x64 host; use package:dir for this host')
}
const icon = ICONS[process.platform]
if (!icon) {
  console.error(`unsupported host platform: ${process.platform}`)
  process.exit(1)
}
if (!fs.existsSync(path.join(root, icon))) {
  console.error(`${icon} is missing - run node scripts/build-icons.mjs first`)
  process.exit(1)
}

const args = [
  cli,
  '.',
  'Token Monitor',
  `--platform=${process.platform}`,
  `--arch=${process.arch}`,
  '--out=dist',
  '--overwrite',
  '--asar',
  `--icon=${icon}`,
  '--ignore=^/dist',
  '--ignore=^/shots',
  '--ignore=^/scripts',
  '--ignore=^/build',
  '--ignore=^/release',
  '--ignore=^/[.]github',
  '--ignore=^/node_modules'
]

const result = spawnSync(process.execPath, args, { cwd: root, stdio: 'inherit' })
process.exit(result.status ?? 1)
