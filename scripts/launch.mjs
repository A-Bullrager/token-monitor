import { spawn } from 'node:child_process'
import { createRequire } from 'node:module'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const require = createRequire(import.meta.url)
const electronBinary = require('electron')
const appRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')

const env = { ...process.env }
// Some shells export this globally; it makes Electron behave like plain Node.
delete env.ELECTRON_RUN_AS_NODE

const child = spawn(electronBinary, [appRoot, ...process.argv.slice(2)], {
  stdio: 'inherit',
  env,
  windowsHide: false
})

child.on('close', (code) => {
  process.exit(code ?? 0)
})

for (const signal of ['SIGINT', 'SIGTERM']) {
  process.on(signal, () => child.kill(signal))
}
