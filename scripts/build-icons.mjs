// Generates the platform icon set from the master PNG.
//
//   build/icon-source.png  ->  build/icon.icns   (macOS, via png2icons)
//                          ->  build/icon.png    (Linux / electron-builder, >=512px square)
//
// build/icon.ico (Windows) is produced by the same master through PIL during the
// icon design pass and is checked in, because png2icons' ICO layers are less
// predictable than the hand-tuned 16/24/32 variants. This script only verifies
// it is present and complete.
//
// Usage: node scripts/build-icons.mjs
import fs from 'node:fs'
import path from 'node:path'
import process from 'node:process'
import { createRequire } from 'node:module'
import { fileURLToPath } from 'node:url'
import { deflateSync } from 'node:zlib'

const require = createRequire(import.meta.url)
const { createICNS } = require('png2icons')

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const master = path.join(root, 'build', 'icon-source.png')
const icnsOut = path.join(root, 'build', 'icon.icns')
const pngOut = path.join(root, 'build', 'icon.png')
const icoFile = path.join(root, 'build', 'icon.ico')

if (!fs.existsSync(master)) {
  console.error(`missing master icon: ${master}`)
  process.exit(1)
}

const source = fs.readFileSync(master)

// A PNG IHDR is enough to read the source size without an image library.
const width = source.readUInt32BE(16)
const height = source.readUInt32BE(20)
if (width !== height) {
  console.error(`master icon must be square, got ${width}x${height}`)
  process.exit(1)
}
if (width < 512) {
  console.error(`electron-builder wants a >=512px icon for Linux, got ${width}px`)
  process.exit(1)
}

const icns = createICNS(source)
if (!icns || !icns.length) {
  console.error('png2icons returned no ICNS data')
  process.exit(1)
}
fs.writeFileSync(icnsOut, Buffer.from(icns))
fs.writeFileSync(pngOut, source)

// ICNS is a container of chunks: 'icns' magic, then per-size entries.
const chunks = []
let offset = 8
while (offset + 8 <= icns.length) {
  const type = Buffer.from(icns.slice(offset, offset + 4)).toString('ascii')
  const size = Number(icns.readUInt32BE(offset + 4))
  if (!/^[a-zA-Z0-9]{4}$/.test(type) || size < 8) break
  chunks.push(type)
  offset += size
}

const icoLayers = fs.existsSync(icoFile) ? countIcoLayers(fs.readFileSync(icoFile)) : 0
console.log(
  JSON.stringify(
    {
      master: `${width}x${height}`,
      icns: { bytes: icns.length, chunks: chunks.length, sizes: chunks.join(' ') },
      png: `${width}x${height}`,
      ico: icoLayers ? `${icoLayers} layers` : 'MISSING'
    },
    null,
    2
  )
)

if (!icoLayers) {
  console.error('build/icon.ico is missing; regenerate it before packaging Windows')
  process.exit(1)
}
// Draw a clean monochrome template; extracting luminance from the blue icon
// leaves a translucent square behind the glyph. Supersample for crisp 1x/2x.
for (const size of [16, 32]) {
  const stride = size * 4 + 1
  const pixels = Buffer.alloc(stride * size)
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      let hits = 0
      for (let sy = 0; sy < 8; sy++) {
        for (let sx = 0; sx < 8; sx++) {
          const px = (x + (sx + 0.5) / 8) * 16 / size - 8
          const py = (y + (sy + 0.5) / 8) * 16 / size - 8
          const ring = Math.abs(Math.hypot(px, py) - 5.3) <= 0.85
          const t = Math.max(0, Math.min(1, (px * 3.3 - py * 3.3) / (2 * 3.3 ** 2)))
          const needle = Math.hypot(px - t * 3.3, py + t * 3.3) <= 0.9
          if (ring || needle) hits++
        }
      }
      pixels[y * stride + 1 + x * 4 + 3] = Math.round(hits * 255 / 64)
    }
  }
  const header = Buffer.alloc(13)
  header.writeUInt32BE(size, 0)
  header.writeUInt32BE(size, 4)
  header[8] = 8
  header[9] = 6 // RGBA
  const png = Buffer.concat([
    Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]),
    pngChunk('IHDR', header), pngChunk('IDAT', deflateSync(pixels)), pngChunk('IEND', Buffer.alloc(0))
  ])
  fs.writeFileSync(path.join(root, 'renderer', 'assets', 'img', `icon-template-${size}.png`), png)
}
console.log('icons ready, including monochrome macOS tray templates')

function pngChunk(type, data) {
  const body = Buffer.concat([Buffer.from(type), data])
  let crc = 0xffffffff
  for (const byte of body) {
    crc ^= byte
    for (let bit = 0; bit < 8; bit++) crc = (crc >>> 1) ^ ((crc & 1) ? 0xedb88320 : 0)
  }
  const chunk = Buffer.alloc(data.length + 12)
  chunk.writeUInt32BE(data.length, 0)
  body.copy(chunk, 4)
  chunk.writeUInt32BE((crc ^ 0xffffffff) >>> 0, chunk.length - 4)
  return chunk
}

function countIcoLayers(buffer) {
  if (buffer.readUInt16LE(2) !== 1) return 0
  return buffer.readUInt16LE(4)
}
