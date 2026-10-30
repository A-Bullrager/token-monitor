// Release consistency gate, run by every CI job before anything is built.
// A version bump touches four places; shipping a tag whose packaged renderer
// still shows the previous version is exactly the kind of drift this catches.
import assert from 'node:assert/strict'
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const read = (...parts) => fs.readFileSync(path.join(root, ...parts), 'utf8')
const pkg = JSON.parse(read('package.json'))
const lock = JSON.parse(read('package-lock.json'))

assert.match(pkg.version, /^\d+\.\d+\.\d+(?:-[0-9A-Za-z.-]+)?$/, `invalid semver: ${pkg.version}`)
assert.equal(lock.version, pkg.version, 'package-lock.json root version must match package.json')
assert.equal(lock.packages[''].version, pkg.version, 'package-lock.json packages[""] must match package.json')

// The renderer shows a static version before bootstrap answers, and keeps a
// matching default in its state object.
assert.ok(
  read('renderer', 'app.js').includes(`version: '${pkg.version}'`),
  `renderer/app.js still defaults to a version other than ${pkg.version}`
)
assert.ok(
  read('renderer', 'index.html').includes(`<span id="versionText">v${pkg.version}</span>`),
  `renderer/index.html still displays a version other than v${pkg.version}`
)

// A release tag must name this exact version, or the six published archives
// would be labelled with a version nothing was built from.
const refName = process.env.GITHUB_REF_NAME
const refType = process.env.GITHUB_REF_TYPE
if (refType === 'tag') {
  assert.equal(refName, `v${pkg.version}`, 'release tag must be v + package.json version')
}

// Every bundled font must ship the paperwork its own licence asks for, and must
// be the container its extension claims. The second half is not pedantry: a
// subsetting script that forgets to set the writer's flavour produced a 210KB
// uncompressed TrueType file named .woff2, which every functional check in the
// suite would have shipped — Chromium simply refuses to parse it, so the app
// would have fallen back to whatever Chinese face the machine happened to have.
const fontDir = path.join(root, 'renderer', 'assets', 'font')
const licenceDir = path.join(fontDir, 'licenses')
const fonts = fs.existsSync(fontDir)
  ? fs.readdirSync(fontDir).filter((file) => /\.(woff2?|ttf|otf)$/i.test(file))
  : []
const licences = fs.existsSync(licenceDir) ? fs.readdirSync(licenceDir) : []
assert.ok(fonts.length, 'no bundled fonts found — has the font directory moved?')
assert.ok(licences.length, 'renderer/assets/font/licenses is empty')
const MAGIC = { '.woff2': 'wOF2', '.woff': 'wOFF' }
for (const font of fonts) {
  const bytes = fs.readFileSync(path.join(fontDir, font))
  const magic = MAGIC[path.extname(font).toLowerCase()]
  if (magic) {
    assert.equal(bytes.subarray(0, 4).toString('latin1'), magic,
      `${font} claims to be ${magic} but starts with ${JSON.stringify(bytes.subarray(0, 4).toString('latin1'))} — ` +
      'it is not a woff2 container; re-run scripts/subset-font.py')
  }
  assert.ok(bytes.length > 1000, `${font} is too small to be a real subset (${bytes.length} bytes)`)
  const family = font.split(/[-_.]/)[0].toLowerCase()
  // Matched anywhere in the name, not as a prefix: an OFL file travels as
  // OFL-Inter.txt, which is the conventional way to name it.
  const paired = licences.filter((file) => file.toLowerCase().includes(family))
  assert.ok(paired.length, `${font} is bundled with no licence file for its family in licenses/`)
  for (const licence of paired) {
    const text = read('renderer', 'assets', 'font', 'licenses', licence)
    // Both bundled faces are SIL OFL 1.1, whose condition on any copy is that
    // the copyright notice and the licence itself travel with it.
    assert.match(text, /SIL OPEN FONT LICENSE/, `${licence} does not carry the OFL text it claims`)
    assert.match(text, /Copyright (?:\(c\)|©)/, `${licence} is missing the copyright notice OFL requires keeping`)
  }
}

console.log(`Release metadata consistent: v${pkg.version}${refType === 'tag' ? ` (tag ${refName})` : ''}`)
