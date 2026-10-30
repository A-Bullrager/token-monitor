// Dictionary parity gate. Chinese is the authoring language, so every other
// locale must answer the *same* set of source strings with the same set of
// interpolated shapes; a locale that gained a key, lost one, or translated a
// string back into Chinese is a bug, not a fallback.
import assert from 'node:assert/strict'
import fs from 'node:fs'
import path from 'node:path'
import { createRequire } from 'node:module'
import { fileURLToPath } from 'node:url'

const require = createRequire(import.meta.url)
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const i18n = require(path.join(root, 'renderer', 'i18n.js'))

const localeDir = path.join(root, 'renderer', 'locales')
const files = fs.readdirSync(localeDir).filter((name) => name.endsWith('.js')).sort()
assert.ok(files.length, `no locale dictionaries found in ${localeDir}`)

const locales = files.map((name) => path.basename(name, '.js'))
for (const locale of locales) {
  // eslint-disable-next-line global-require
  const define = require(path.join(localeDir, name(locale)))
  i18n.register(locale, define(i18n))
}
function name(locale) {
  return `${locale}.js`
}

// The reference is the language the app falls back to for every script it can
// render, so its key set is the contract.
const REFERENCE = 'en'
const reference = i18n.dictionary(REFERENCE)
assert.ok(reference, `the ${REFERENCE} dictionary must exist as the reference`)
assert.ok(Object.keys(reference.exact).length > 100, `${REFERENCE} looks truncated: ${Object.keys(reference.exact).length} keys`)

const report = {}
for (const locale of locales) {
  const dictionary = i18n.dictionary(locale)
  assert.ok(dictionary, `${locale} registered nothing`)

  const missing = Object.keys(reference.exact).filter((key) => !(key in dictionary.exact))
  const extra = Object.keys(dictionary.exact).filter((key) => !(key in reference.exact))
  assert.deepEqual(missing, [], `${locale} is missing ${missing.length} keys, e.g. ${JSON.stringify(missing.slice(0, 5))}`)
  assert.deepEqual(extra, [], `${locale} has ${extra.length} keys no other locale uses: ${JSON.stringify(extra.slice(0, 5))}`)

  // Pattern shapes must match the reference exactly: same count, same order,
  // same source text. A rule that only exists in one language would translate
  // a string that other languages leave in Chinese.
  const referenceSources = reference.patterns.map(([pattern]) => pattern.source)
  const localeSources = dictionary.patterns.map(([pattern]) => pattern.source)
  assert.deepEqual(localeSources, referenceSources,
    `${locale} pattern rules differ from ${REFERENCE}: ${JSON.stringify({ locale: localeSources.length, reference: referenceSources.length })}`)

  for (const [key, value] of Object.entries(dictionary.exact)) {
    assert.ok(typeof value === 'string' && value.trim(), `${locale}: empty translation for ${JSON.stringify(key)}`)
    assert.ok(!i18n.CJK.test(value), `${locale}: ${JSON.stringify(key)} was "translated" into Chinese`)
    const rendered = i18n.translate(key, locale)
    assert.ok(!i18n.CJK.test(rendered), `${locale}: ${JSON.stringify(key)} still renders Chinese: ${JSON.stringify(rendered)}`)
  }

  report[locale] = { exact: Object.keys(dictionary.exact).length, patterns: dictionary.patterns.length }
}

// Interpolated shapes must come out language-free too, using the same samples
// the UI produces.
const samples = [
  ['约 3 月 5 日见底', 'Runs out'],
  ['1.25 万', ''],
  ['2.4 亿', ''],
  ['2026 年 3 月', ''],
  ['3 月 5 日', ''],
  ['已保存 sk-••••7654 · 留空保持不变', ''],
  ['同步失败 · 另有 2 项异常', ''],
  ['SETUP / 未连接 · 点击打开设置', ''],
  ['缓存命中 61.8% · 1,866 请求', ''],
  ['近 30 天输入 tokens 有 42.5% 命中缓存 · 共 1,866 次请求', ''],
  ['接口返回 HTTP 503', ''],
  ['Token Monitor · 跑道 19.8 天', ''],
  ['活跃 1 天 · 30 天窗口', ''],
  ['充值 ¥100.00 · 赠金 ¥5.00', ''],
  ['¥12.34 / 天', '']
]
for (const locale of locales.filter((item) => item !== 'zh')) {
  for (const [sample] of samples) {
    const rendered = i18n.translate(sample, locale)
    assert.ok(!i18n.CJK.test(rendered), `${locale}: interpolated sample still contains Chinese: ${JSON.stringify(sample)} -> ${JSON.stringify(rendered)}`)
    assert.notEqual(rendered, sample, `${locale}: interpolated sample was not translated: ${JSON.stringify(sample)}`)
  }
}

// Chinese marks no grammatical number, so every locale has to inflect the
// counted noun itself. Each pair is one phrase with 1 and with 2: strip the
// digits and the stems must differ, or that locale forgot the plural.
const counted = [
  ['1 项异常', '2 项异常'],
  ['同步失败 · 另有 1 项异常', '同步失败 · 另有 2 项异常'],
  ['SETUP / 未连接 · 另有 1 项异常', 'SETUP / 未连接 · 另有 2 项异常'],
  ['活跃 1 天 · 30 天窗口', '活跃 2 天 · 30 天窗口'],
  ['按 30 天活跃日 · 仅 1 个消费日', '按 30 天活跃日 · 仅 2 个消费日'],
  ['按 30 天活跃日 · 样本消费日不足 1 天', '按 30 天活跃日 · 样本消费日不足 2 天'],
  ['连接成功 · 本月 1 天有记录', '连接成功 · 本月 2 天有记录'],
  ['Token Monitor · 跑道 1 天', 'Token Monitor · 跑道 2 天']
]
const stem = (text) => text.replace(/[\d.,]+/g, '').trim()
for (const locale of locales.filter((item) => item !== 'zh')) {
  for (const [single, plural] of counted) {
    const one = i18n.translate(single, locale)
    const many = i18n.translate(plural, locale)
    assert.ok(!i18n.CJK.test(one) && !i18n.CJK.test(many),
      `${locale}: counted phrase keeps Chinese: ${JSON.stringify({ one, many })}`)
    assert.notEqual(stem(one), stem(many),
      `${locale}: ${JSON.stringify(single)} does not inflect for one vs many: ${JSON.stringify({ one, many })}`)
  }
}

// A measured value is not the number one: '1.0' has to stay plural.
for (const locale of locales.filter((item) => item !== 'zh')) {
  const measured = i18n.translate('Token Monitor · 跑道 1.0 天', locale)
  assert.equal(stem(measured), stem(i18n.translate('Token Monitor · 跑道 2.4 天', locale)),
    `${locale}: a measured 1.0 was forced into the singular: ${JSON.stringify(measured)}`)
}

// A dictionary nobody loads is worse than a missing one: the UI keeps working
// and silently stays Chinese. Both processes have to name every locale file.
const html = fs.readFileSync(path.join(root, 'renderer', 'index.html'), 'utf8')
const main = fs.readFileSync(path.join(root, 'main.js'), 'utf8')
for (const locale of locales) {
  assert.ok(html.includes(`src="locales/${locale}.js"`),
    `renderer/index.html never loads locales/${locale}.js`)
}
assert.ok(/i18n\.LOCALES\.filter[\s\S]{0,160}require\(`\.\/renderer\/locales\/\$\{locale\}`\)/.test(main),
  'main.js must register every locale dictionary (tray and menus are built there, not in the renderer)')

// The fitting rule has the same failure mode as an unregistered dictionary: if the
// page does not load it, the card and the two checks quietly stop measuring the
// same thing, and nothing except a red CI round will say so.
const app = fs.readFileSync(path.join(root, 'renderer', 'app.js'), 'utf8')
assert.ok(html.includes('src="text-fit.js"'), 'renderer/index.html never loads text-fit.js')
assert.ok(html.indexOf('text-fit.js') < html.indexOf('app.js'),
  'text-fit.js must load before app.js, which calls it while rendering')
assert.ok(/TmTextFit\.escape\(/.test(app), 'app.js must fit numbers through TmTextFit.escape, not a private copy')
for (const checker of ['number-fit.mjs', 'i18n-check.mjs']) {
  const source = fs.readFileSync(path.join(root, 'scripts', checker), 'utf8')
  assert.ok(/TmTextFit\.escape\(/.test(source), `scripts/${checker} must grade with TmTextFit.escape`)
}

assert.deepEqual(i18n.untranslated, [], `untranslated strings collected: ${JSON.stringify(i18n.untranslated)}`)
console.log(`Dictionary parity OK: ${locales.join(', ')} — ${JSON.stringify(report)}`)
