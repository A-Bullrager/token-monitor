// German interface copy. The Chinese strings are the keys: they are what the
// markup and app.js actually say, so a label cannot be edited in one language
// only. scripts/check-i18n.mjs fails if a key is missing here.
;(function (root) {
  'use strict'

  const MONATE = ['Januar', 'Februar', 'März', 'April', 'Mai', 'Juni',
    'Juli', 'August', 'September', 'Oktober', 'November', 'Dezember']
  const MONAT_KURZ = ['Jan.', 'Feb.', 'März', 'Apr.', 'Mai', 'Juni', 'Juli',
    'Aug.', 'Sep.', 'Okt.', 'Nov.', 'Dez.']
  // German counts one day or many in the same word: Tag / Tage.
  // '1' is singular, a measured '1.0' is plural: compare the text, as en.js does.
  const eins = (n) => String(n).trim() === '1'
  const tage = (n) => (eins(n) ? 'Tag' : 'Tage')

  const define = (i18n) => ({
    exact: {
    // ── showcase caption, only visible in screenshot mode ───────────────
'把账户余额变成一条看得见的跑道。': 'Mach dein Guthaben zu einer Startbahn, die du wirklich siehst.',
'DeepSeek 余额与用量的桌面仪器。': 'Ein Desktop-Instrument für Guthaben und Verbrauch von DeepSeek.',

// ── strip: window chrome and labels ─────────────────────────────────
'账户状态': 'Kontostatus',
'设置': 'Einstellungen',
'退出': 'Beenden',
'收起': 'Einklappen',
'最小化': 'Minimieren',
'窗口置顶': 'Im Vordergrund halten',
'取消置顶': 'Fixierung lösen',
'显示金额': 'Beträge anzeigen',
'隐藏金额': 'Beträge ausblenden',
'展开账本': 'Buch aufklappen',
'收起账本': 'Buch einklappen',
'余额跑道': 'Startbahn des Guthabens',
'RUNWAY / 预计可用': 'REICHWEITE',
'余额续航': 'GUTHABEN',
'TODAY / 今日': 'HEUTE',
'¥— / 天': '¥— / Tag',
'刷新': 'Aktualisieren',
'DEMO DATA · 本地样本': 'DEMO · lokale Stichprobe',
'DEEPSEEK API · 本地凭证': 'DEEPSEEK API · lokale Zugangsdaten',
'同步异常 · 点击状态查看': 'Synchronisierung gestört · Status öffnen',
'未连接 · 点击设置开始': 'Nicht verbunden · in den Einstellungen starten',
'仅余额已连接 · 缺少会话': 'Nur Guthaben · Sitzung fehlt',
'部分连接 · 会话待补充': 'Teilweise · Sitzung fehlt',
'部分连接 · 余额待补充': 'Teilweise · Guthaben fehlt',
'等待连接': 'Warten auf Verbindung',
'需要用量数据': 'Verbrauchsdaten fehlen',
'样本偏少 · 仅供参考': 'Stichprobe · Richtwert',
'— / 天': '— / Tag',
'按 30 天活跃日': 'Rhythmus 30 Aktivtage',
'按 7 天自然日': 'Rhythmus aus 7 Kalendertagen',

// ── deck: status line and notices ───────────────────────────────────
'Token Monitor 账本': 'Token Monitor Buch',
'DEMO / 样本数据': 'DEMO / Beispieldaten',
'PARTIAL / 缺少会话': 'TEILWEISE / ohne Sitzung',
'PARTIAL / 缺少 API KEY': 'TEILWEISE / ohne API-Key',
'SETUP / 未连接': 'SETUP / nicht verbunden',
'去设置': 'Zu den Einstellungen',
'重试': 'Erneut versuchen',
'尚未连接 DeepSeek 账户 · 填写凭证后显示实时数据':
  'Noch kein DeepSeek-Konto verbunden · nach den Zugangsdaten erscheinen Live-Daten',
'余额已连接 · 补充 Session Token 后显示用量与跑道':
  'Guthaben verbunden · Session Token ergibt Verbrauch und Reichweite',
'用量已连接 · 补充 API Key 后显示余额与跑道':
  'Verbrauch verbunden · API-Key ergibt Guthaben und Reichweite',
'补充会话': 'Sitzung ergänzen',
'补充 Key': 'Key ergänzen',

// ── deck: runway gauge ──────────────────────────────────────────────
'跑道节奏': 'Reichweiten-Tempo',
'30 天': '30 T',
'7 天': '7 T',
'天': 'T',
'余额 ÷ 有消费日期的日均': 'Guthaben ÷ Ø pro Tag mit Verbrauch',
'余额 ÷ 近 7 天自然日均摊': 'Guthaben ÷ Ø der letzten 7 Kalendertage',
'近 7 天自然日': 'Letzte 7 Kalendertage',
'30 天活跃日': 'Rhythmus 30 Aktivtage',
'近 7 天没有消费记录': 'Kein Verbrauch in den letzten 7 Tagen',
'还没有可计算的消费': 'Noch nichts zum Messen',
'余额已连接 · 需要用量': 'Guthaben verbunden · Verbrauch fehlt',
'补充 Session Token 获取用量': 'Session Token ergänzt den Verbrauch',
'补充 API Key 获取余额': 'API-Key ergänzt das Guthaben',
'未接入': 'keine Daten',

// ── deck: treasury, composition, ledger, mix, outlook ───────────────
'TREASURY / 账户余额': 'BESTAND',
'充值 ¥0.00 · 赠金 ¥0.00': 'Aufladung ¥0.00 · Gutschrift ¥0.00',
'PACE / 日均': 'TEMPO',
'WINDOW / 近 30 天': 'FENSTER / 30 T',
'VOLUME / 30 天 tokens': 'VOLUMEN / TOKENS 30 T',
'COMPOSITION / 余额构成': 'ANTEILE',
'充值': 'Aufladung',
'赠金': 'Gutschrift',
'尚未读取到余额': 'Guthaben noch nicht gelesen',
'LEDGER / 每日花费': 'BUCH / TAGESVERBRAUCH',
'近 30 天': 'Letzte 30 Tage',
'接入平台会话后，这里会留下每天的花费。':
  'Ist die Plattform-Sitzung verbunden, steht hier der Verbrauch jedes Tages.',
'补充 Session Token': 'Session Token ergänzen',
'接入账户': 'Konto verbinden',
'MIX / 模型构成': 'MIX / MODELLE',
'暂无模型明细': 'Keine Modelldetails',
'连接账户后显示模型明细': 'Modelldetails erscheinen nach der Verbindung',
'OUTLOOK / 节奏对照': 'AUSBLICK',
'预计月耗': 'MONAT',
'两种节奏对照': 'Zwei Tempos im Vergleich',
'近 30 天每日花费': 'Täglicher Verbrauch der letzten 30 Tage',
'用量页 ↗': 'Verbrauchsseite ↗',
'平台用量页 ↗': 'Verbrauchsseite ↗',
'打开平台用量页 ↗': 'Verbrauchsseite öffnen ↗',

// ── settings drawer ─────────────────────────────────────────────────
'CONFIG / 参数': 'KONFIGURATION',
'关闭设置': 'Einstellungen schließen',
'连接': 'Verbindung',
'余额': 'Guthaben',
'用量明细 · 可选': 'Verbrauchsdetails · optional',
'Bearer token 或整段 Authorization': 'Bearer-Token oder der komplette Authorization-Header',
'尚未保存': 'Noch nicht gespeichert',
'尚未保存，填写后才能获取真实用量': 'Noch nicht gespeichert · nötig für echte Verbrauchsdaten',
'测试连接': 'Verbindung testen',
'怎么获取 Token': 'So bekommst du das Token',
// The help paragraph is one <p> broken up by <b>/<code>; each run of text
// is its own node, so the fragments are keyed exactly as they appear.
'API Key 用于余额，来自': 'Der API-Key liefert das Guthaben und kommt von',
'。用量明细需要用浏览器登录平台，F12 → Network → 任意':
  '. Für die Verbrauchsdetails melde dich im Browser auf der Plattform an, F12 → Network → beliebige',
'请求，复制': 'Anfrage und kopiere',
'里 Bearer 后面的部分。': ' den Teil hinter Bearer.',
'行为': 'Verhalten',
'自动刷新': 'Automatisch aktualisieren',
'30 秒': '30 Sek.',
'1 分钟': '1 Min.',
'5 分钟': '5 Min.',
'使用演示数据': 'Demodaten verwenden',
'用固定样本预览界面，不读取真实账户': 'Vorschau mit festen Beispielen; ohne Kontozugriff',
'让仪器浮在其他窗口上方': 'Instrument über anderen Fenstern halten',
'外观': 'Darstellung',
'主题': 'Design',
'浅色': 'Hell',
'深色': 'Dunkel',
'跟随系统': 'System',
'浅色是默认外观；深色适合夜间或深色桌面。':
  'Hell ist der Standard; Dunkel passt nachts oder auf dunklen Desktops.',
'键位': 'Tastenkürzel',
'刷新账户': 'Konto aktualisieren',
'打开设置': 'Einstellungen öffnen',
'展开 / 收起': 'Auf- oder einklappen',
'关闭设置或收起': 'Einstellungen schließen oder einklappen',
'关于': 'Über',
'清除凭证': 'Zugangsdaten löschen',
'再次点击确认清除': 'Zum Bestätigen erneut klicken',
'保存并同步': 'Speichern und synchronisieren',
'只保存在本机': 'Nur auf diesem Gerät gespeichert',
'未加密 · 系统加密服务不可用': 'Unverschlüsselt · kein System-Schlüsselbund',
'DPAPI 加密 · 只保存在本机': 'DPAPI-verschlüsselt · nur auf diesem Gerät',
'Keychain 加密 · 只保存在本机': 'Im Schlüsselbund verschlüsselt · nur auf diesem Gerät',
'libsecret 加密 · 只保存在本机': 'libsecret-verschlüsselt · nur auf diesem Gerät',
'KWallet 加密 · 只保存在本机': 'KWallet-verschlüsselt · nur auf diesem Gerät',
'KWallet 5 加密 · 只保存在本机': 'KWallet 5-verschlüsselt · nur auf diesem Gerät',
'KWallet 6 加密 · 只保存在本机': 'KWallet 6-verschlüsselt · nur auf diesem Gerät',

// ── transient status and toasts ─────────────────────────────────────
'演示数据': 'Demodaten',
'已连接': 'Verbunden',
'连接异常': 'Verbindungsfehler',
'未连接': 'Nicht verbunden',
'连接成功': 'Verbunden',
'连接失败': 'Verbindung fehlgeschlagen',
'未测试': 'Nicht getestet',
'测试失败': 'Test fehlgeschlagen',
'会话': 'Sitzung',
'保存失败': 'Speichern fehlgeschlagen',
'清除失败': 'Löschen fehlgeschlagen',
'刷新失败': 'Aktualisieren fehlgeschlagen',
'启动失败': 'Start fehlgeschlagen',
'已切换到演示数据': 'Auf Demodaten umgeschaltet',
'配置已保存，正在同步': 'Gespeichert · wird synchronisiert',
'已清除凭证，切回演示数据': 'Zugangsdaten gelöscht · Demodaten aktiv',
'关闭演示数据前，请先填写 API Key。': 'Erst den API-Key eintragen, dann die Demodaten ausschalten.',
'窗口切换失败': 'Ansichtwechsel fehlgeschlagen',
'同步失败': 'Synchronisierung fehlgeschlagen',
'置顶设置失败': 'Fixieren fehlgeschlagen',
'节奏保存失败': 'Tempo speichern fehlgeschlagen',
'保存中…': 'Speichern …',
'测试中…': 'Testen …',

// ── main process: tray, menus, IPC guards ───────────────────────────
'显示 / 隐藏窗口': 'Fenster ein- oder ausblenden',
'退出 Token Monitor': 'Token Monitor beenden',
'Token Monitor · DeepSeek 跑道': 'Token Monitor · DeepSeek-Reichweite',
'DeepSeek 平台用量页': 'DeepSeek-Verbrauchsseite',
'视图': 'Ansicht',
'帮助': 'Hilfe',
'设置…': 'Einstellungen …',
'不受信任的请求': 'Nicht vertrauenswürdige Anfrage',
'未知主题': 'Unbekanntes Design',
'系统加密状态未确认，凭证未保存': 'Systemverschlüsselung unbestätigt · Zugangsdaten nicht gespeichert',

// ── data layer messages ─────────────────────────────────────────────
'网络请求超时，请检查网络连接': 'Die Anfrage brauchte zu lange. Prüfe deine Netzwerkverbindung.',
'无法连接 DeepSeek 服务': 'Der DeepSeek-Dienst ist nicht erreichbar',
'平台会话已失效，请重新获取 Session Token':
  'Die Plattform-Sitzung ist abgelaufen. Hole ein neues Session Token.',
'API Key 无效或已过期': 'Der API-Key ist ungültig oder abgelaufen',
'该凭证没有访问权限': 'Diese Zugangsdaten haben keinen Zugriff',
'请求过于频繁，请稍后再试': 'Zu viele Anfragen. Versuche es später erneut.',
'DeepSeek 服务暂时不可用': 'DeepSeek ist vorübergehend nicht erreichbar',
'接口返回了无法解析的数据': 'Die Schnittstelle lieferte nicht lesbare Daten',
'余额接口没有返回账户信息': 'Die Guthabenschnittstelle lieferte kein Konto',
'余额获取失败': 'Guthaben nicht verfügbar',
'用量获取失败': 'Verbrauch nicht verfügbar',
'请先填写 API Key': 'Erst einen API-Key eintragen',
'请先填写平台 Session Token': 'Erst das Session Token der Plattform eintragen',
'未填写 API Key': 'Kein API-Key gespeichert',
'未填写 Session Token': 'Kein Session Token gespeichert',

// ── ASCII instrument chrome ─────────────────────────────────────────
// Labels the markup writes in ASCII because Chinese mode shows them that way;
// German gives them their own words instead of leaving English on screen.
'DAYS': 'TAGE',
'TOTAL': 'GESAMT',
'SAMPLE': 'STICHPROBE',
'IDLE': 'INAKTIV',
'ERROR': 'FEHLER',
'LIVE': 'LIVE',
'PARTIAL': 'TEILWEISE',
'SETUP': 'SETUP',
'WAITING': 'WARTEN',
'NO LEDGER YET': 'KEIN BUCH',
'EFFECTIVE / M TOKENS': 'EFFEKTIV / MIO TOKENS',
'LAST 7D': 'LETZTE 7 T',
'AVG': 'Ø',
'SYNC ERROR': 'SYNC-FEHLER',
'LIVE / DEEPSEEK API': 'LIVE / DEEPSEEK-API',
'SYNCING…': 'SYNCHRONISIERE…'
    },

    patterns: [
    // numbers and dates
[/^([\d.]+) 亿$/, (all, n, locale) => i18n.compactCount(Number(n) * 1e8, locale)],
[/^([\d.]+) 万$/, (all, n, locale) => i18n.compactCount(Number(n) * 1e4, locale)],
[/^(\d+) 年 (\d+) 月$/, (all, y, m) => `${MONATE[Number(m) - 1]} ${y}`],
[/^(\d+) 月 (\d+) 日$/, (all, m, d) => `${d}. ${MONAT_KURZ[Number(m) - 1]}`],
[/^约 (\d+) 月 (\d+) 日见底$/, (all, m, d) => `Am ${d}. ${MONAT_KURZ[Number(m) - 1]} leer`],

// money and pace
[/^(.+) \/ 天$/, '$1 / Tag'],
[/^(.+) · 样本消费日不足 (\d+) 天$/, (all, label, n, locale) => `${i18n.translate(label, locale)} · weniger als ${n} ${eins(n) ? 'Stichprobentag' : 'Stichprobentage'}`],
[/^(.+) · 仅 (\d+) 个消费日$/, (all, label, n, locale) => `${i18n.translate(label, locale)} · nur ${n} ${eins(n) ? 'Verbrauchstag' : 'Verbrauchstage'}`],
[/^活跃 (\d+) 天 · (\d+) 天窗口$/, (all, a, w) => `${a} ${eins(a) ? 'Aktivtag' : 'Aktivtage'} von ${w}`],
[/^充值 (.+) · 赠金 (.+)$/, 'Aufladung $1 · Gutschrift $2'],
[/^余额 (.+) · 赠金 (.+)$/, 'Guthaben $1 · Gutschrift $2'],

// ledger, mix and cache detail
[/^近 30 天每日花费，总计 (.+)，峰值 (.+)$/, 'Täglicher Verbrauch über 30 Tage. Gesamt $1, Spitze $2.'],
[/^缓存命中 (.+) · ([\d,]+) 请求$/, (all, pct, n, locale) => `Cache-Treffer ${pct} · ${i18n.groupCount(n, locale)} Anfragen`],
[/^缓存命中 (.+)$/, 'Cache-Treffer $1'],
[/^近 30 天输入 tokens 有 (.+) 命中缓存 · 共 ([\d,]+) 次请求$/,
  (all, pct, n, locale) => `${pct} der Eingabe-Tokens der letzten 30 Tage trafen den Cache · ${i18n.groupCount(n, locale)} Anfragen`],
[/^近 30 天输入 tokens 有 (.+) 命中缓存$/, '$1 der Eingabe-Tokens der letzten 30 Tage trafen den Cache'],
[/^(.+) · 缓存命中 ([\d.]+%) · ([\d,]+) 次请求$/,
  (all, label, pct, n, locale) => `${label} · Cache-Treffer ${pct} · ${i18n.groupCount(n, locale)} Anfragen`],
[/^(.+) · 缓存命中 ([\d.]+%)$/, '$1 · Cache-Treffer $2'],

// notices and status
[/^(.+) · 另有 (\d+) 项异常$/,
  (all, message, count, locale) => `${i18n.translate(message, locale)} · ${count} weitere ${eins(count) ? 'Störung' : 'Störungen'}`],
[/^(\d+) 项异常$/, (all, n) => `${n} ${eins(n) ? 'Störung' : 'Störungen'}`],
[/^(.+) · 点击打开设置$/, (all, word, locale) => `${i18n.translate(word, locale)} · klicken für die Einstellungen`],
[/^已保存 (.+) · 留空保持不变$/, 'Gespeichert: $1 · leer lassen zum Behalten'],

// connection tests
[/^连接成功 · 余额 (.+)$/, 'Verbunden · Guthaben $1'],
[/^连接成功 · 本月 (\d+) 天有记录$/, (all, n) => `Verbunden · ${n} ${eins(n) ? 'Tag' : 'Tage'} mit Einträgen in diesem Monat`],
[/^接口返回 HTTP (\d+)$/, 'Die Schnittstelle lieferte HTTP $1'],

// tray tooltip
[/^Token Monitor · 跑道 (.+) 天$/, (all, n) => `Token Monitor · ${n} ${eins(n) ? 'Tag' : 'Tage'} Reichweite`],

// chrome labels carrying a value: a sync stamp, a chart peak
[/^SYNCED( .+)?$/, 'SYNCHRONISIERT$1'],
[/^SYNC ERR( .+)?$/, 'SYNC-FEHLER$1'],
[/^PEAK (.+)$/, 'SPITZE $1'],

// about line, whose version number is a nested element
[/^· 本地优先 · 非官方 DeepSeek 客户端。余额来自官方 API；用量来自平台会话接口，可能随平台调整。$/,
  ' · lokal zuerst · ein inoffizieller DeepSeek-Client. Das Guthaben kommt von der offiziellen API; der Verbrauch kommt aus der Sitzungs-Schnittstelle der Plattform und kann sich mit ihr ändern.']
    ]
  })

  if (typeof module !== 'undefined' && module.exports) module.exports = define
  else root.TmI18n.register('de', define(root.TmI18n))
})(typeof globalThis !== 'undefined' ? globalThis : this)
