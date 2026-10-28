// Structural parity between the English landing README and its Chinese twin.
// Two hand-maintained translations drift: a section gets reworded in one file,
// an image is swapped only in the other, or a caveat ends up inside a collapsed
// block in one language. Text equality is impossible across languages, so this
// checks the shape both documents must share.
import assert from 'node:assert/strict'
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const DOCS = ['README.md', 'README.zh-CN.md']
const REQUIRED_BAR = '<p align="right">'
const REQUIRED_HERO = '<div align="center">'

function read(file) {
  const text = fs.readFileSync(path.join(root, file), 'utf8')
  // Scan markup, not prose about markup: fenced blocks and inline code often
  // mention tags or commands that must not be counted as structure.
  const scannable = text.replace(/```[\s\S]*?```/g, '').replace(/`[^`\n]*`/g, '')
  const headings = []
  const images = []
  const links = []
  for (const line of scannable.split(/\r?\n/)) {
    const heading = line.match(/^(#{1,6})\s+\S/)
    if (heading) headings.push(heading[1].length)
    // Screenshots live in two syntaxes here: markdown for plain embeds and HTML
    // `<img>` inside the captioned showcase tables. Both must be counted.
    for (const match of line.matchAll(/!\[[^\]]*\]\((?!https?:\/\/)([^)\s]+)/g)) images.push(match[1])
    for (const match of line.matchAll(/<img\s+[^>]*src="(?!https?:\/\/)([^"]+)"/g)) images.push(match[1])
    for (const match of line.matchAll(/(?<!!)\[[^\]]*\]\((?!https?:\/\/|#)([^)\s#]+)/g)) links.push(match[1])
    // The hero and the language bar link through raw HTML, which markdown-only
    // scanning would silently skip.
    for (const match of line.matchAll(/<a\s+[^>]*href="(?!https?:\/\/|#|mailto:)([^"]+)"/g)) links.push(match[1])
  }
  return { text, scannable, headings, images, links: [...new Set(links)] }
}

const parsed = DOCS.map((file) => ({ file, ...read(file) }))

for (const doc of parsed) {
  assert.ok(doc.scannable.startsWith(REQUIRED_BAR), `${doc.file} must open with the language switch bar`)
  assert.ok(doc.scannable.includes(REQUIRED_HERO), `${doc.file} must carry the centered hero block`)
  const missing = [...new Set([...doc.links, ...doc.images])].filter((target) => !fs.existsSync(path.join(root, target)))
  assert.deepEqual(missing, [], `${doc.file} has broken relative targets: ${missing.join(', ')}`)
  const open = (doc.scannable.match(/<details\b/g) || []).length
  const close = (doc.scannable.match(/<\/details>/g) || []).length
  assert.equal(open, close, `${doc.file} has unbalanced <details> blocks (${open} open, ${close} closed)`)
}

// Same heading depth sequence, so neither document gains or loses a section.
assert.deepEqual(
  parsed[0].headings,
  parsed[1].headings,
  `section structure differs: ${parsed[0].file} has ${parsed[0].headings.length} headings, ` +
  `${parsed[1].file} has ${parsed[1].headings.length} (${JSON.stringify(parsed[0].headings)} vs ${JSON.stringify(parsed[1].headings)})`
)

// Both documents must show the same screenshots; only the order may differ.
const first = [...new Set(parsed[0].images)].sort()
const second = [...new Set(parsed[1].images)].sort()
assert.deepEqual(first, second, `screenshot sets differ: ${JSON.stringify([first, second])}`)

console.log(`Documentation structure matches: ${DOCS.join(', ')} (${first.length} screenshots, ${parsed[0].headings.length} headings)`)
