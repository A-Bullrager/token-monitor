// Resolve only this project's current host build, or the exact executable
// extracted from a release artifact. Never pick a different/older dist entry.
import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const projectRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')

export function packagedAppRoots(root = projectRoot) {
  return [path.resolve(root, 'dist', `Token Monitor-${process.platform}-${process.arch}`)]
}

export function findPackagedApp(root = projectRoot) {
  const relativeExecutable = {
    win32: 'Token Monitor.exe',
    darwin: path.join('Token Monitor.app', 'Contents', 'MacOS', 'Token Monitor'),
    linux: 'Token Monitor'
  }[process.platform]
  if (!relativeExecutable) throw new Error(`unsupported packaged platform: ${process.platform}`)

  const override = process.env.TM_PACKAGED_EXECUTABLE
  if (override !== undefined && !override.trim()) {
    throw new Error('TM_PACKAGED_EXECUTABLE must name an executable file, not an empty path')
  }
  const [buildDir] = packagedAppRoots(root)
  const executable = override !== undefined
    ? path.resolve(root, override)
    : path.join(buildDir, relativeExecutable)
  let isFile = false
  try {
    isFile = fs.statSync(executable).isFile()
  } catch {
    /* Report the exact requested path below; do not fall back to another build. */
  }
  if (!isFile) {
    throw new Error(
      `packaged executable not found: ${executable}\n` +
      (override !== undefined
        ? 'TM_PACKAGED_EXECUTABLE must point to the executable extracted from the release artifact.'
        : 'Build the current host package, or set TM_PACKAGED_EXECUTABLE to the extracted release executable.')
    )
  }

  if (process.platform === 'darwin') {
    const macos = path.dirname(executable)
    const contents = path.dirname(macos)
    const bundle = path.dirname(contents)
    if (path.basename(macos) === 'MacOS' && path.basename(contents) === 'Contents' && bundle.endsWith('.app')) {
      return { executable, bundle, dir: path.dirname(bundle) }
    }
  }
  return { executable, dir: override !== undefined ? path.dirname(executable) : buildDir }
}

// A profile directory with spaces and non-ASCII characters: every script that
// boots the app should be able to point --user-data-dir at something unfriendly.
export function oddTempProfile(prefix = 'token-monitor-') {
  return path.join(fs.mkdtempSync(path.join(os.tmpdir(), prefix)), '中文 目录 测试')
}
