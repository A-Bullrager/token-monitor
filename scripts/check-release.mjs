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

// Every bundled font must ship the paperwork its own licence asks for. This is
// not decoration: the MiSans agreement, clause 2(4), requires the copyright
// notice and the agreement itself to be retained in any copy of the font, and
// the subset is a copy that travels with the app and with this repository. A
// font file added without its licence would otherwise pass every functional
// check in the suite — nothing at runtime notices a missing PDF.
const fontDir = path.join(root, 'renderer', 'assets', 'font')
const licenceDir = path.join(fontDir, 'licenses')
const fonts = fs.existsSync(fontDir)
  ? fs.readdirSync(fontDir).filter((file) => /\.(woff2?|ttf|otf)$/i.test(file))
  : []
const licences = fs.existsSync(licenceDir) ? fs.readdirSync(licenceDir) : []
assert.ok(fonts.length, 'no bundled fonts found — has the font directory moved?')
assert.ok(licences.length, 'renderer/assets/font/licenses is missing or empty')
for (const font of fonts) {
  const family = font.split(/[-_.]/)[0].toLowerCase()
  // Matched anywhere in the name, not as a prefix: Inter's licence travels as
  // OFL-Inter.txt, which is the conventional way to name an OFL file.
  const paired = licences.filter((file) => file.toLowerCase().includes(family))
  assert.ok(paired.length, `${font} is bundled with no licence file for its family in licenses/`)
  if (family === 'misans') {
    // The summary is ours; the agreement is Xiaomi's text, and a link can move.
    assert.ok(paired.some((file) => /\.pdf$/i.test(file)),
      'MiSans requires the agreement itself beside it (clause 2(4)) — no PDF in licenses/')
    const notice = read('renderer', 'assets', 'font', 'licenses', 'MiSans-Notice.txt')
    assert.match(notice, /revocable/, 'the MiSans notice must state that the grant is revocable')
    assert.doesNotMatch(notice, /符合 ?MiSans ?协议|complies with the MiSans licence/,
      'the MiSans notice must not claim compliance the agreement does not settle')
  }
}

console.log(`Release metadata consistent: v${pkg.version}${refType === 'tag' ? ` (tag ${refName})` : ''}`)
