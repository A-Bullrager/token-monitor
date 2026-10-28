// Structural parity between the English landing README and its translations.
// Hand-maintained translations drift: a section gets reworded in one file, an
// image is swapped only in the other, or a caveat ends up inside a collapsed
// block in one language. Text equality is impossible across languages, so this
// checks the shape every document must share.
import assert from 'node:assert/strict'
import fs from 'node:fs'
import path from 'node:path'
import { createRequire } from 'node:module'
import { fileURLToPath } from 'node:url'

const require = createRequire(import.meta.url)
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
// One document per shipped UI language, named after the `lang` attribute that
// language puts on the page: the English landing README carries no suffix.
const i18n = require(path.join(root, 'renderer', 'i18n.js'))
const docFor = (locale) => (i18n.HTML_LANG[locale] === 'en'
  ? 'README.md'
  : `README.${i18n.HTML_LANG[locale]}.md`)
const DOCS = i18n.LOCALES.map(docFor)
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
  // A collapsed block without a summary has no toggle label: it renders as an
  // empty disclosure triangle, and only someone reading the source notices.
  const summaries = (doc.scannable.match(/<summary\b/g) || []).length
  assert.equal(summaries, open, `${doc.file} has ${open} <details> blocks but ${summaries} <summary> labels`)
}

// The switch bar is the only navigation between the documents: every file must
// offer a link to every other language and mark itself as the current one.
const barLine = (doc) => doc.text.split(/\r?\n/).find((line) => line.startsWith(REQUIRED_BAR)) || ''
for (const [index, doc] of parsed.entries()) {
  const line = barLine(doc)
  assert.ok(line.includes('<strong>'), `${doc.file} must mark its own language as current`)
  for (const [otherIndex, other] of parsed.entries()) {
    if (otherIndex === index) continue
    assert.ok(line.includes(other.file), `${doc.file} language bar must link to ${other.file}`)
  }
  assert.equal((line.match(/<strong>/g) || []).length, 1,
    `${doc.file} language bar must mark exactly one current language`)
}

// Same heading depth sequence in every document, so none gains or loses a
// section relative to the English landing page.
const reference = parsed.find((doc) => doc.file === 'README.md')
assert.ok(reference, 'README.md must be part of the checked documents')
for (const doc of parsed) {
  if (doc === reference) continue
  assert.deepEqual(doc.headings, reference.headings,
    `section structure differs: ${reference.file} has ${reference.headings.length} headings, ` +
    `${doc.file} has ${doc.headings.length} (${JSON.stringify(reference.headings)} vs ${JSON.stringify(doc.headings)})`)
}

// Every document must show the same screenshots; only the order may differ.
const first = [...new Set(reference.images)].sort()
for (const doc of parsed.slice(1)) {
  const images = [...new Set(doc.images)].sort()
  assert.deepEqual(images, first, `${doc.file} screenshot set differs from ${reference.file}: ${JSON.stringify([first, images])}`)
}

console.log(`Documentation structure matches: ${DOCS.join(', ')} (${first.length} screenshots, ${reference.headings.length} headings)`)
