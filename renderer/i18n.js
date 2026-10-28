// Single translation source for both processes: main.js require()s this file,
// renderer/index.html loads it with a <script> tag. Chinese stays the authoring
// language of the UI (markup and app.js keep their literal copy); English is
// derived here, so editing a label can never leave one language behind.
//
// Two mechanisms, deliberately:
//   EXACT    — whole trimmed string → replacement. Covers static markup and
//              every label without interpolation.
//   PATTERN  — anchored regex → template, for strings built with interpolation.
// Anything still containing CJK after a pass is recorded in `untranslated`, and
// the test suite fails on a non-empty list in English mode. That is what keeps
// this dictionary honest when copy moves.
;(function (globalScope) {
  'use strict'

  const LOCALES = ['zh', 'en']
  const HTML_LANG = { zh: 'zh-CN', en: 'en' }
  // CJK punctuation, Extension A, Unified Ideographs, compatibility forms and
  // half/full-width block. Written as escapes so the class cannot drift when
  // the file is re-encoded.
  const CJK = /[　-〿㐀-䶿一-鿿豈-﫿＀-￯]/
  const MONTH_NAMES = ['January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December']

  // 'auto' follows the browser/system language list; anything not Chinese
  // resolves to English, the only other shipped locale.
  function resolveLocale(setting, preferredLanguages) {
    if (LOCALES.includes(setting)) return setting
    const list = Array.isArray(preferredLanguages) ? preferredLanguages : [preferredLanguages]
    for (const tag of list) {
      if (typeof tag === 'string' && /^zh\b/i.test(tag)) return 'zh'
    }
    return 'en'
  }

  // 1.2 万 has no 1:1 English wording, so it is re-scaled, not transliterated.
  function compactTenThousand(n) {
    const value = n * 10000
    if (value >= 1e6) return (value / 1e6).toFixed(1).replace(/\.0$/, '') + 'M'
    return Math.round(value / 1000) + 'K'
  }

  const EXACT = {
    // ── showcase caption, only visible in screenshot mode ───────────────
    '把账户余额变成一条看得见的跑道。': 'Turn your balance into a runway you can see.',
    'DeepSeek 余额与用量的桌面仪器。': 'A desktop instrument for DeepSeek balance and usage.',

    // ── strip: window chrome and labels ─────────────────────────────────
    '账户状态': 'Account status',
    '设置': 'Settings',
    '退出': 'Quit',
    '收起': 'Collapse',
    '最小化': 'Minimize',
    '窗口置顶': 'Pin on top',
    '取消置顶': 'Unpin',
    '显示金额': 'Show amounts',
    '隐藏金额': 'Hide amounts',
    '展开账本': 'Expand ledger',
    '收起账本': 'Collapse ledger',
    '余额跑道': 'Balance runway',
    'RUNWAY / 预计可用': 'RUNWAY',
    '余额续航': 'BALANCE',
    'TODAY / 今日': 'TODAY',
    '¥— / 天': '¥— / day',
    '刷新': 'Refresh',
    'DEMO DATA · 本地样本': 'DEMO DATA · local sample',
    'DEEPSEEK API · 本地凭证': 'DEEPSEEK API · local credentials',
    '同步异常 · 点击状态查看': 'Sync error · open status',
    '未连接 · 点击设置开始': 'Not connected · start in settings',
    '仅余额已连接 · 缺少会话': 'Balance only · no session',
    '部分连接 · 会话待补充': 'Partial · session missing',
    '部分连接 · 余额待补充': 'Partial · balance missing',
    '等待连接': 'Awaiting connection',
    '需要用量数据': 'Needs usage data',
    '样本偏少 · 仅供参考': 'Thin sample · indicative',
    '— / 天': '— / day',
    '按 30 天活跃日': '30-day active pace',
    '按 7 天自然日': '7-day calendar pace',

    // ── deck: status line and notices ───────────────────────────────────
    'Token Monitor 账本': 'Token Monitor ledger',
    'DEMO / 样本数据': 'DEMO / sample data',
    'PARTIAL / 缺少会话': 'PARTIAL / no session',
    'PARTIAL / 缺少 API KEY': 'PARTIAL / no API key',
    'SETUP / 未连接': 'SETUP / not connected',
    '去设置': 'Open settings',
    '重试': 'Retry',
    '尚未连接 DeepSeek 账户 · 填写凭证后显示实时数据':
      'No DeepSeek account connected · add credentials for live data',
    '余额已连接 · 补充 Session Token 后显示用量与跑道':
      'Balance linked · add the Session Token for usage and runway',
    '用量已连接 · 补充 API Key 后显示余额与跑道':
      'Usage linked · add an API key for balance and runway',
    '补充会话': 'Add session',
    '补充 Key': 'Add key',

    // ── deck: runway gauge ──────────────────────────────────────────────
    '跑道节奏': 'Runway pace',
    '30 天': '30D',
    '7 天': '7D',
    '天': 'd',
    '余额 ÷ 有消费日期的日均': 'Balance ÷ average per active day',
    '余额 ÷ 近 7 天自然日均摊': 'Balance ÷ 7-day calendar average',
    '近 7 天自然日': 'Last 7 calendar days',
    '30 天活跃日': '30-day active pace',
    '近 7 天没有消费记录': 'No spend in the last 7 days',
    '还没有可计算的消费': 'Nothing to measure yet',
    '余额已连接 · 需要用量': 'Balance linked · usage needed',
    '补充 Session Token 获取用量': 'Add the Session Token to load usage',
    '补充 API Key 获取余额': 'Add an API key to load balance',
    '未接入': 'n/a',

    // ── deck: treasury, composition, ledger, mix, outlook ───────────────
    'TREASURY / 账户余额': 'TREASURY',
    '充值 ¥0.00 · 赠金 ¥0.00': 'Top-up ¥0.00 · grant ¥0.00',
    'PACE / 日均': 'PACE',
    'WINDOW / 近 30 天': 'WINDOW / 30D',
    'VOLUME / 30 天 tokens': 'VOLUME / 30D TOKENS',
    'COMPOSITION / 余额构成': 'COMPOSITION',
    '充值': 'Top-up',
    '赠金': 'Grant',
    '尚未读取到余额': 'Balance not read yet',
    'LEDGER / 每日花费': 'LEDGER / DAILY SPEND',
    '近 30 天': 'Last 30 days',
    '接入平台会话后，这里会留下每天的花费。':
      'Once the platform session is linked, daily spend appears here.',
    '补充 Session Token': 'Add Session Token',
    '接入账户': 'Connect account',
    'MIX / 模型构成': 'MIX / MODELS',
    '暂无模型明细': 'No model detail',
    '连接账户后显示模型明细': 'Model mix appears once connected',
    'OUTLOOK / 节奏对照': 'OUTLOOK',
    '预计月耗': 'MONTHLY',
    '两种节奏对照': 'Two pace comparison',
    '近 30 天每日花费': 'Daily spend over the last 30 days',
    '用量页 ↗': 'Usage page ↗',
    '平台用量页 ↗': 'Usage page ↗',
    '打开平台用量页 ↗': 'Open the usage page ↗',

    // ── settings drawer ─────────────────────────────────────────────────
    'CONFIG / 参数': 'CONFIG',
    '关闭设置': 'Close settings',
    '连接': 'Connection',
    '余额': 'Balance',
    '用量明细 · 可选': 'Usage detail · optional',
    'Bearer token 或整段 Authorization': 'Bearer token or the full Authorization header',
    '尚未保存': 'Not saved yet',
    '尚未保存，填写后才能获取真实用量': 'Not saved yet · required for real usage',
    '测试连接': 'Test connection',
    '怎么获取 Token': 'How to get a token',
    // The help paragraph is one <p> broken up by <b>/<code>; each run of text
    // is its own node, so the fragments are keyed exactly as they appear.
    'API Key 用于余额，来自': 'The API key covers balance and comes from',
    '。用量明细需要用浏览器登录平台，F12 → Network → 任意':
      '. For usage detail, sign in to the platform in a browser, open F12 → Network → any',
    '请求，复制': 'request, and copy',
    '里 Bearer 后面的部分。': ' (everything after Bearer).',
    '行为': 'Behavior',
    '自动刷新': 'Auto refresh',
    '30 秒': '30 sec',
    '1 分钟': '1 min',
    '5 分钟': '5 min',
    '使用演示数据': 'Use demo data',
    '用固定样本预览界面，不读取真实账户': 'Preview with fixed samples; no account access',
    '让仪器浮在其他窗口上方': 'Keep the instrument above other windows',
    '外观': 'Appearance',
    '主题': 'Theme',
    '浅色': 'Light',
    '深色': 'Dark',
    '跟随系统': 'System',
    '浅色是默认外观；深色适合夜间或深色桌面。':
      'Light is the default; dark suits night or dark desktops.',
    '键位': 'Shortcuts',
    '刷新账户': 'Refresh account',
    '打开设置': 'Open settings',
    '展开 / 收起': 'Expand / collapse',
    '关闭设置或收起': 'Close settings or collapse',
    '关于': 'About',
    '清除凭证': 'Clear credentials',
    '再次点击确认清除': 'Click again to confirm',
    '保存并同步': 'Save & sync',
    '只保存在本机': 'Stored on this device only',
    '未加密 · 系统加密服务不可用': 'Not encrypted · no system keyring available',
    'DPAPI 加密 · 只保存在本机': 'DPAPI encrypted · this device only',
    'Keychain 加密 · 只保存在本机': 'Keychain encrypted · this device only',
    'libsecret 加密 · 只保存在本机': 'libsecret encrypted · this device only',
    'KWallet 加密 · 只保存在本机': 'KWallet encrypted · this device only',
    'KWallet 5 加密 · 只保存在本机': 'KWallet 5 encrypted · this device only',
    'KWallet 6 加密 · 只保存在本机': 'KWallet 6 encrypted · this device only',

    // ── transient status and toasts ─────────────────────────────────────
    '演示数据': 'Demo data',
    '已连接': 'Connected',
    '连接异常': 'Connection error',
    '未连接': 'Not connected',
    '连接成功': 'Connected',
    '连接失败': 'Connection failed',
    '未测试': 'Not tested',
    '测试失败': 'Test failed',
    '会话': 'Session',
    '保存失败': 'Save failed',
    '清除失败': 'Could not clear',
    '刷新失败': 'Refresh failed',
    '启动失败': 'Startup failed',
    '已切换到演示数据': 'Switched to demo data',
    '配置已保存，正在同步': 'Saved · syncing now',
    '已清除凭证，切回演示数据': 'Credentials cleared · demo data restored',
    '关闭演示数据前，请先填写 API Key。': 'Add an API key before turning off demo data.',
    '窗口切换失败': 'Could not switch view',
    '同步失败': 'Sync failed',
    '置顶设置失败': 'Could not change pinning',
    '节奏保存失败': 'Could not save pace',
    '保存中…': 'Saving…',
    '测试中…': 'Testing…',

    // ── main process: tray, menus, IPC guards ───────────────────────────
    '显示 / 隐藏窗口': 'Show / hide window',
    '退出 Token Monitor': 'Quit Token Monitor',
    'Token Monitor · DeepSeek 跑道': 'Token Monitor · DeepSeek runway',
    'DeepSeek 平台用量页': 'DeepSeek usage page',
    '视图': 'View',
    '帮助': 'Help',
    '设置…': 'Settings…',
    '不受信任的请求': 'Untrusted request',
    '未知主题': 'Unknown theme',
    '系统加密状态未确认，凭证未保存': 'System encryption status unknown — credentials were not saved',

    // ── data layer messages ─────────────────────────────────────────────
    '网络请求超时，请检查网络连接': 'The request timed out. Check your network connection.',
    '无法连接 DeepSeek 服务': 'Cannot reach the DeepSeek service',
    '平台会话已失效，请重新获取 Session Token':
      'The platform session expired. Get a new Session Token.',
    'API Key 无效或已过期': 'The API key is invalid or expired',
    '该凭证没有访问权限': 'This credential has no access',
    '请求过于频繁，请稍后再试': 'Too many requests. Try again later.',
    'DeepSeek 服务暂时不可用': 'DeepSeek is temporarily unavailable',
    '接口返回了无法解析的数据': 'The endpoint returned data we could not parse',
    '余额接口没有返回账户信息': 'The balance endpoint returned no account',
    '余额获取失败': 'Balance unavailable',
    '用量获取失败': 'Usage unavailable',
    '请先填写 API Key': 'Enter an API key first',
    '请先填写平台 Session Token': 'Enter the platform Session Token first',
    '未填写 API Key': 'No API key saved',
    '未填写 Session Token': 'No Session Token saved'
  }

  // Interpolated copy. Every entry is anchored to the whole trimmed string, so
  // a miss falls through to `untranslated` instead of half-translating.
  const PATTERN = [
    // numbers and dates
    [/^([\d.]+) 亿$/, '$1 hundred million'],
    [/^([\d.]+) 万$/, (all, n) => compactTenThousand(Number(n))],
    [/^(\d+) 年 (\d+) 月$/, (all, y, m) => MONTH_NAMES[Number(m) - 1] + ' ' + y],
    [/^(\d+) 月 (\d+) 日$/, '$1/$2'],
    [/^约 (\d+) 月 (\d+) 日见底$/, 'Runs out $1/$2'],

    // money and pace
    [/^(.+) \/ 天$/, '$1 / day'],
    [/^按 30 天活跃日 · 样本消费日不足 (\d+) 天$/, '30-day active pace · under $1 sample days'],
    [/^(.+) · 仅 (\d+) 个消费日$/, '$1 · only $2 spending days'],
    [/^活跃 (\d+) 天 · (\d+) 天窗口$/, '$1 active days · $2-day window'],
    [/^充值 (.+) · 赠金 (.+)$/, 'Top-up $1 · grant $2'],
    [/^余额 (.+) · 赠金 (.+)$/, 'Balance $1 · grant $2'],

    // ledger, mix and cache detail
    [/^近 30 天每日花费，总计 (.+)，峰值 (.+)$/, 'Daily spend over 30 days. Total $1, peak $2.'],
    [/^缓存命中 (.+) · ([\d,]+) 请求$/, 'Cache hits $1 · $2 requests'],
    [/^缓存命中 (.+)$/, 'Cache hits $1'],
    [/^近 30 天输入 tokens 有 (.+) 命中缓存 · 共 ([\d,]+) 次请求$/,
      '$1 of 30-day input tokens hit the cache · $2 requests'],
    [/^近 30 天输入 tokens 有 (.+) 命中缓存$/, '$1 of 30-day input tokens hit the cache'],
    [/^(.+) · 缓存命中 ([\d.]+%) · ([\d,]+) 次请求$/, '$1 · cache hits $2 · $3 requests'],
    [/^(.+) · 缓存命中 ([\d.]+%)$/, '$1 · cache hits $2'],

    // notices and status
    [/^(.+) · 另有 (\d+) 项异常$/, '$1 · $2 more issues'],
    [/^(\d+) 项异常$/, '$1 issues'],
    [/^(.+) · 点击打开设置$/, '$1 · click to open settings'],
    [/^已保存 (.+) · 留空保持不变$/, 'Saved $1 · leave blank to keep'],

    // connection tests
    [/^连接成功 · 余额 (.+)$/, 'Connected · balance $1'],
    [/^连接成功 · 本月 (\d+) 天有记录$/, 'Connected · $1 days with records this month'],
    [/^接口返回 HTTP (\d+)$/, 'The endpoint returned HTTP $1'],

    // tray tooltip
    [/^Token Monitor · 跑道 (.+) 天$/, 'Token Monitor · $1 days of runway'],

    // about line, whose version number is a nested element
    [/^· 本地优先 · 非官方 DeepSeek 客户端。余额来自官方 API；用量来自平台会话接口，可能随平台调整。$/,
      ' · local-first · an unofficial DeepSeek client. Balance comes from the official API; usage comes from the platform session endpoint and may change with it.']
  ]

  const untranslated = []

  function translate(text, locale) {
    if (locale !== 'en' || typeof text !== 'string' || !text) return text
    const trimmed = text.trim()
    if (!trimmed || !CJK.test(trimmed)) return text
    const exact = EXACT[trimmed]
    if (typeof exact === 'string') return text.replace(trimmed, exact)
    for (const [pattern, replacement] of PATTERN) {
      const match = trimmed.match(pattern)
      if (!match) continue
      const value = typeof replacement === 'function' ? replacement(...match) : trimmed.replace(pattern, replacement)
      return text.replace(trimmed, value)
    }
    if (!untranslated.includes(trimmed)) untranslated.push(trimmed)
    return text
  }

  const ATTRIBUTES = ['title', 'aria-label', 'placeholder']
  const SKIP_TAGS = new Set(['STYLE', 'SCRIPT', 'NOSCRIPT'])

  // Translate text nodes and label attributes under `root`. Re-runnable: the
  // English output no longer matches the CJK test.
  function translateAttributes(element, locale) {
    for (const attribute of ATTRIBUTES) {
      const value = element.getAttribute(attribute)
      if (!value) continue
      const next = translate(value, locale)
      if (next !== value) element.setAttribute(attribute, next)
    }
  }

  function applyTree(root, locale) {
    if (locale !== 'en' || !root) return
    // A text node passed as `root` is never visited by its own walker, and
    // assigning `textContent` replaces the node rather than editing it, so the
    // caller's element has to be the starting point.
    const start = root.nodeType === 3 ? root.parentElement : root
    if (!start) return
    const owner = start.ownerDocument || start
    // A walker never visits its own root, and rows built off-DOM set their
    // title before insertion, so the root's attributes need translating too.
    if (start.nodeType === 1 && !SKIP_TAGS.has(start.tagName)) translateAttributes(start, locale)
    const walker = owner.createTreeWalker(start, 1 | 4, null)
    let node
    while ((node = walker.nextNode())) {
      const host = node.nodeType === 1 ? node : node.parentElement
      if (!host || SKIP_TAGS.has(host.tagName)) continue
      if (node.nodeType === 3) {
        const next = translate(node.nodeValue, locale)
        if (next !== node.nodeValue) node.nodeValue = next
        continue
      }
      translateAttributes(node, locale)
    }
  }

  // One-shot for strings built outside the render tree (toasts, IPC replies,
  // tray menus).
  function t(text, locale) {
    return translate(text, locale)
  }

  function setDocumentLocale(locale) {
    if (typeof document === 'undefined') return
    document.documentElement.setAttribute('lang', HTML_LANG[locale] || HTML_LANG.zh)
  }

  const api = {
    LOCALES,
    HTML_LANG,
    CJK,
    resolveLocale,
    compactTenThousand,
    translate,
    applyTree,
    setDocumentLocale,
    t,
    untranslated,
    // Introspection for the test suite.
    stats: () => ({ exact: Object.keys(EXACT).length, patterns: PATTERN.length })
  }

  if (typeof module !== 'undefined' && module.exports) module.exports = api
  else globalScope.TmI18n = api
})(typeof globalThis !== 'undefined' ? globalThis : this)
