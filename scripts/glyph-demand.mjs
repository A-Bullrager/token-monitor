// Collect every codepoint the interface can put on screen in a given locale:
// dictionary values plus rendered pattern outputs. The shipped fonts are
// subsets built from scripts/font-corpus.txt, so a new language can ask for a
// glyph the bundle does not contain — and that failure is a silent box on
// screen, not an error. This runs before the DOM check for the same reason.
import assert from 'node:assert/strict'
import path from 'node:path'
import fs from 'node:fs'
import { createRequire } from 'node:module'
import { fileURLToPath } from 'node:url'

const require = createRequire(import.meta.url)
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const i18n = require(path.join(root, 'renderer', 'i18n.js'))
for (const locale of i18n.LOCALES.filter((item) => item !== 'zh')) {
  i18n.register(locale, require(path.join(root, 'renderer', 'locales', `${locale}.js`))(i18n))
}

// Strings the data layer and the render path actually build, so the pattern
// replacements get exercised with realistic captures.
const interpolated = [
  '1.25 万', '12 万', '2.4 亿', '2026 年 3 月', '3 月 5 日', '约 3 月 5 日见底',
  '¥12.34 / 天', '— / 天', '按 30 天活跃日 · 样本消费日不足 2 天',
  '约 3 月 5 日见底 · 仅 1 个消费日', '活跃 1 天 · 30 天窗口', '活跃 12 天 · 30 天窗口',
  '充值 ¥100.00 · 赠金 ¥5.00', '余额 ¥100.00 · 赠金 ¥5.00',
  '近 30 天每日花费，总计 ¥321.45，峰值 ¥48.20',
  '缓存命中 61.8% · 1,866 请求', '缓存命中 61.8%',
  '近 30 天输入 tokens 有 42.5% 命中缓存 · 共 1,866 次请求',
  'deepseek-chat · 缓存命中 61.8% · 1,866 次请求', 'deepseek-reasoner · 缓存命中 7.9%',
  '同步失败 · 另有 2 项异常', '2 项异常', 'SETUP / 未连接 · 点击打开设置',
  '已保存 sk-••••7654 · 留空保持不变', '连接成功 · 余额 ¥86.53',
  '连接成功 · 本月 7 天有记录', '接口返回 HTTP 503', 'Token Monitor · 跑道 19.8 天',
  'Token Monitor · 余额 ¥86.53 · 跑道 19.8 天'
]

const chars = new Set()
const harvest = (text) => { for (const ch of String(text)) chars.add(ch) }
for (const locale of i18n.LOCALES) {
  const dictionary = i18n.dictionary(locale)
  if (!dictionary) continue
  for (const value of Object.values(dictionary.exact)) harvest(value)
  for (const [pattern, replacement] of dictionary.patterns) {
    harvest(pattern.source)
    if (typeof replacement === 'string') harvest(replacement)
  }
}
for (const locale of i18n.LOCALES) {
  for (const sample of interpolated) harvest(i18n.translate(sample, locale))
}
harvest('· 本地优先 · 非官方 DeepSeek 客户端 v2.5.0。')

const set = [...chars].sort()
fs.mkdirSync(path.join(root, 'release'), { recursive: true })
fs.writeFileSync(path.join(root, 'release', 'glyph-demand.txt'), set.join(''), 'utf8')

// The corpus file is what the bundled subsets were cut from: characters
// outside it may render as a box, because nothing guarantees the subset has
// them. (fontTools was used to confirm the Inter subset covers every character
// this check allows; see README "Language support".)
const corpus = fs.readFileSync(path.join(root, 'scripts', 'font-corpus.txt'), 'utf8')
const missing = set.filter((ch) => !corpus.includes(ch))
assert.deepEqual(missing, [],
  `${missing.length} characters are demanded by the dictionaries but outside scripts/font-corpus.txt: ${missing.join('')}`)
console.log(`Glyph demand OK: ${set.length} characters, all inside the corpus — release/glyph-demand.txt`)
