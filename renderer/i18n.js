// Translation core, shared by both processes: main.js require()s it and loads
// renderer/locales/<locale>.js beside it; renderer/index.html loads the same
// files with <script> tags, and each one calls TmI18n.register().
//
// Chinese is the authoring language: the UI's literal copy stays in markup and
// app.js, and every other language is a dictionary keyed by that exact Chinese
// string. A label therefore cannot be updated in one language only — the parity
// check in scripts/check-i18n.mjs fails when a locale is missing a key.
//
// Two mechanisms per locale:
//   exact    — whole trimmed string → replacement
//   patterns — anchored regex → template, for interpolated strings
// Anything still containing CJK after a pass lands in `untranslated`, which the
// language checks assert is empty. That is what keeps dictionaries honest when
// copy moves.
;(function (globalScope) {
  'use strict'

  const LOCALES = ['zh', 'en', 'es', 'pt-BR', 'de']
  const HTML_LANG = { zh: 'zh-CN', en: 'en', es: 'es', 'pt-BR': 'pt-BR', de: 'de' }
  // CJK punctuation, Extension A, Unified Ideographs, compatibility forms and
  // the half/full-width block. Built from escapes so re-encoding this file
  // cannot quietly widen the class.
  const CJK = new RegExp('[\\u3000-\\u303F\\u3400-\\u4DBF\\u4E00-\\u9FFF\\uF900-\\uFAFF\\uFF00-\\uFFEF]')
  const MONTH_NAMES = ['January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December']

  // 'auto' maps a browser/system language list onto a shipped locale. The three
  // Latin languages match their own prefix; everything else — Japanese, Korean,
  // French, Arabic — gets English, the one fallback every bundled script can
  // render without a system font.
  const AUTO_PREFIXES = [
    [/^zh/i, 'zh'],
    [/^es/i, 'es'],
    [/^pt/i, 'pt-BR'],
    [/^de/i, 'de'],
    [/^en/i, 'en']
  ]

  function resolveLocale(setting, preferredLanguages) {
    if (LOCALES.includes(setting)) return setting
    const list = Array.isArray(preferredLanguages) ? preferredLanguages : [preferredLanguages]
    for (const tag of list) {
      if (typeof tag !== 'string') continue
      for (const [pattern, locale] of AUTO_PREFIXES) {
        if (pattern.test(tag)) return locale
      }
    }
    return 'en'
  }

  // The tag each language uses for its own number and date conventions. Money
  // deliberately keeps one dot-decimal style everywhere (see README
  // "Language support"); these helpers only cover token counts, where writing
  // the Chinese grouping out verbatim would be the actual bug.
  const NUMBER_LOCALE = { zh: 'zh-CN', en: 'en-US', es: 'es-ES', 'pt-BR': 'pt-BR', de: 'de-DE' }
  const localeTag = (locale) => NUMBER_LOCALE[locale] || 'en-US'
  // ICU inserts a no-break / narrow-no-break space before "mil", "Mio.";
  // a normal space keeps chip widths measurable and the text selectable.
  const unbreak = (text) => text.replace(/[\u00a0\u202f]/g, ' ')

  function compactCount(value, locale) {
    return unbreak(new Intl.NumberFormat(localeTag(locale),
      { notation: 'compact', maximumFractionDigits: 1 }).format(value))
  }

  // "1,866 请求" carries English grouping from the data layer; a German or
  // Brazilian reader would parse that comma as a decimal point.
  function groupCount(digits, locale) {
    const plain = String(digits).replace(/[^\d]/g, '')
    if (!plain) return String(digits)
    return unbreak(new Intl.NumberFormat(localeTag(locale)).format(Number(plain)))
  }

  const dictionaries = new Map()

  function register(locale, { exact = {}, patterns = [] } = {}) {
    if (!LOCALES.includes(locale)) throw new Error(`Unknown locale: ${locale}`)
    const current = dictionaries.get(locale) || { exact: {}, patterns: [] }
    dictionaries.set(locale, {
      exact: Object.assign({}, current.exact, exact),
      patterns: current.patterns.concat(patterns)
    })
  }

  const untranslated = []

  function translate(text, locale) {
    if (locale === 'zh' || typeof text !== 'string' || !text) return text
    const dictionary = dictionaries.get(locale)
    if (!dictionary) return text
    const trimmed = text.trim()
    if (!trimmed) return text
    // A few labels are authored as ASCII instrument chrome — DAYS, TOTAL,
    // SYNCED, PEAK — because Chinese mode shows them that way too. They are
    // still UI copy, so a dictionary may answer them; every rule is anchored,
    // so a number or a model name cannot be caught by accident.
    const exact = dictionary.exact[trimmed]
    if (typeof exact === 'string') return text.replace(trimmed, exact)
    for (const [pattern, replacement] of dictionary.patterns) {
      const match = trimmed.match(pattern)
      if (!match) continue
      // Pattern functions receive the locale last so a rule can translate a
      // captured fragment that is itself UI copy (a message inside a notice).
      const value = typeof replacement === 'function'
        ? replacement(...match, locale)
        : trimmed.replace(pattern, replacement)
      return text.replace(trimmed, value)
    }
    // Only Chinese text counts as a translation gap: an ASCII string that no
    // rule claims is data — a model name, a time, a number — not copy.
    if (CJK.test(trimmed)) {
      const missed = `${locale}: ${trimmed}`
      if (!untranslated.includes(missed)) untranslated.push(missed)
    }
    return text
  }

  const ATTRIBUTES = ['title', 'aria-label', 'placeholder']
  const SKIP_TAGS = new Set(['STYLE', 'SCRIPT', 'NOSCRIPT'])

  function translateAttributes(element, locale) {
    for (const attribute of ATTRIBUTES) {
      const value = element.getAttribute(attribute)
      if (!value) continue
      const next = translate(value, locale)
      if (next !== value) element.setAttribute(attribute, next)
    }
  }

  // Translate text nodes and label attributes under `root`. Re-runnable: the
  // translated output no longer matches the CJK test.
  function applyTree(root, locale) {
    if (locale === 'zh' || !root) return
    // A text node passed as `root` is never visited by its own walker, and
    // assigning `textContent` replaces the node rather than editing it, so the
    // caller's element has to be the starting point.
    const start = root.nodeType === 3 ? root.parentElement : root
    if (!start) return
    const owner = start.ownerDocument || start
    // A walker never visits its own root either, and rows built off-DOM set
    // their title before insertion.
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
    MONTH_NAMES,
    register,
    resolveLocale,
    localeTag,
    compactCount,
    groupCount,
    translate,
    applyTree,
    setDocumentLocale,
    t,
    untranslated,
    // Introspection for the test suite.
    dictionary: (locale) => dictionaries.get(locale) || null,
    stats: () => Object.fromEntries([...dictionaries].map(([locale, entry]) =>
      [locale, { exact: Object.keys(entry.exact).length, patterns: entry.patterns.length }]))
  }

  if (typeof module !== 'undefined' && module.exports) module.exports = api
  else globalScope.TmI18n = api
})(typeof globalThis !== 'undefined' ? globalThis : this)
