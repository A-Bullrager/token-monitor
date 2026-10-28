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

console.log(`Release metadata consistent: v${pkg.version}${refType === 'tag' ? ` (tag ${refName})` : ''}`)
