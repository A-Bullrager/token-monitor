import { spawn } from 'node:child_process'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const kinds = process.argv.slice(2).filter((arg) => !arg.startsWith('-'))
const targets = kinds.length ? kinds : ['deck', 'strip', 'settings', 'dark', 'empty']
const allowed = new Set(['deck', 'strip', 'settings', 'dark', 'empty'])

for (const kind of targets) {
  if (!allowed.has(kind)) {
    console.error(`Unknown shot "${kind}". Use: ${[...allowed].join(', ')}`)
    process.exit(1)
  }
}

function run(kind) {
  return new Promise((resolve, reject) => {
    const child = spawn(process.execPath, [path.join(root, 'scripts', 'launch.mjs'), `--shot=${kind}`], {
      cwd: root,
      stdio: 'inherit',
      env: process.env
    })
    child.on('error', reject)
    child.on('close', (code) => {
      if (code === 0) resolve()
      else reject(new Error(`shot "${kind}" exited with ${code}`))
    })
  })
}

for (const kind of targets) {
  process.stdout.write(`\n— capturing ${kind} —\n`)
  await run(kind)
}

console.log(`\nCaptured: ${targets.map((kind) => `shots/${kind}.png`).join(', ')}`)
