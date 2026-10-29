// Spanish interface copy. The Chinese strings are the keys: they are what the
// markup and app.js actually say, so a label cannot be edited in one language
// only. scripts/check-i18n.mjs fails if a key is missing here.
;(function (root) {
  'use strict'

  const MESES = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio',
    'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre']
  const MES_CORTO = ['ene', 'feb', 'mar', 'abr', 'may', 'jun',
    'jul', 'ago', 'sep', 'oct', 'nov', 'dic']
  // '1' is singular, a measured '1.0' is plural: compare the text, as en.js does.
  const uno = (n) => String(n).trim() === '1'

  const define = (i18n) => ({
    exact: {
    // ── showcase caption, only visible in screenshot mode ───────────────
'把账户余额变成一条看得见的跑道。': 'Convierte tu saldo en una pista de autonomía que puedes ver.',
'DeepSeek 余额与用量的桌面仪器。': 'Un instrumento de escritorio para el saldo y el uso de DeepSeek.',

// ── strip: window chrome and labels ─────────────────────────────────
'账户状态': 'Estado de la cuenta',
'设置': 'Ajustes',
'退出': 'Salir',
'收起': 'Plegar',
'最小化': 'Minimizar',
'窗口置顶': 'Mantener visible',
'取消置顶': 'Dejar de fijar',
'显示金额': 'Mostrar importes',
'隐藏金额': 'Ocultar importes',
'展开账本': 'Ampliar libro',
'收起账本': 'Plegar libro',
'余额跑道': 'Pista del saldo',
'RUNWAY / 预计可用': 'AUTONOMÍA',
'余额续航': 'SALDO',
'TODAY / 今日': 'HOY',
'¥— / 天': '¥— / día',
'刷新': 'Actualizar',
'DEMO DATA · 本地样本': 'DEMO · muestra local',
'DEEPSEEK API · 本地凭证': 'DEEPSEEK API · credenciales locales',
'同步异常 · 点击状态查看': 'Fallo de sincronización · abre el estado',
'未连接 · 点击设置开始': 'Sin conexión · empieza en Ajustes',
'仅余额已连接 · 缺少会话': 'Solo saldo · falta sesión',
'部分连接 · 会话待补充': 'Parcial · falta sesión',
'部分连接 · 余额待补充': 'Parcial · falta saldo',
'等待连接': 'Esperando conexión',
'需要用量数据': 'Faltan datos de uso',
'样本偏少 · 仅供参考': 'Muestra · orientativa',
'— / 天': '— / día',
'按 30 天活跃日': 'Ritmo activo de 30 días',
'按 7 天自然日': 'Ritmo de 7 días naturales',

// ── deck: status line and notices ───────────────────────────────────
'Token Monitor 账本': 'Libro de Token Monitor',
'DEMO / 样本数据': 'DEMO / datos de muestra',
'PARTIAL / 缺少会话': 'PARCIAL / sin sesión',
'PARTIAL / 缺少 API KEY': 'PARCIAL / sin API KEY',
'SETUP / 未连接': 'AJUSTE / sin conexión',
'去设置': 'Ir a Ajustes',
'重试': 'Reintentar',
'尚未连接 DeepSeek 账户 · 填写凭证后显示实时数据':
  'Sin cuenta de DeepSeek · escribe credenciales para ver datos en vivo',
'余额已连接 · 补充 Session Token 后显示用量与跑道':
  'Saldo conectado · añade el Session Token para ver uso y autonomía',
'用量已连接 · 补充 API Key 后显示余额与跑道':
  'Uso conectado · añade una API Key para ver saldo y autonomía',
'补充会话': 'Añadir sesión',
'补充 Key': 'Añadir clave',

// ── deck: runway gauge ──────────────────────────────────────────────
'跑道节奏': 'Ritmo de autonomía',
'30 天': '30 D',
'7 天': '7 D',
'天': 'd',
'余额 ÷ 有消费日期的日均': 'Saldo ÷ media por día con gasto',
'余额 ÷ 近 7 天自然日均摊': 'Saldo ÷ media de 7 días naturales',
'近 7 天自然日': 'Últimos 7 días',
'30 天活跃日': 'Ritmo activo de 30 días',
'近 7 天没有消费记录': 'Sin gasto en los últimos 7 días',
'还没有可计算的消费': 'Aún no hay gasto medible',
'余额已连接 · 需要用量': 'Saldo conectado · falta el uso',
'补充 Session Token 获取用量': 'Añade el Session Token para el uso',
'补充 API Key 获取余额': 'Añade una API Key para el saldo',
'未接入': 'sin dato',

// ── deck: treasury, composition, ledger, mix, outlook ───────────────
'TREASURY / 账户余额': 'TESORERÍA',
'充值 ¥0.00 · 赠金 ¥0.00': 'Recarga ¥0.00 · bono ¥0.00',
'PACE / 日均': 'RITMO',
'WINDOW / 近 30 天': 'VENTANA / 30 D',
'VOLUME / 30 天 tokens': 'VOLUMEN / TOKENS 30 D',
'COMPOSITION / 余额构成': 'COMPOSICIÓN',
'充值': 'Recarga',
'赠金': 'Bono',
'尚未读取到余额': 'Saldo aún sin leer',
'LEDGER / 每日花费': 'LIBRO / GASTO DIARIO',
'近 30 天': 'Últimos 30 días',
'接入平台会话后，这里会留下每天的花费。':
  'Cuando conectes la sesión de la plataforma, aquí aparecerá el gasto de cada día.',
'补充 Session Token': 'Añadir Session Token',
'接入账户': 'Conectar cuenta',
'MIX / 模型构成': 'MEZCLA / MODELOS',
'暂无模型明细': 'Sin detalle de modelos',
'连接账户后显示模型明细': 'El detalle de modelos aparece al conectar',
'OUTLOOK / 节奏对照': 'PREVISIÓN',
'预计月耗': 'MENSUAL',
'两种节奏对照': 'Comparación de dos ritmos',
'近 30 天每日花费': 'Gasto diario de los últimos 30 días',
'用量页 ↗': 'Página de uso ↗',
'平台用量页 ↗': 'Página de uso ↗',
'打开平台用量页 ↗': 'Abrir la página de uso ↗',

// ── settings drawer ─────────────────────────────────────────────────
'CONFIG / 参数': 'CONFIGURACIÓN',
'关闭设置': 'Cerrar ajustes',
'连接': 'Conexión',
'余额': 'Saldo',
'用量明细 · 可选': 'Detalle de uso · opcional',
'Bearer token 或整段 Authorization': 'Token Bearer o el encabezado Authorization completo',
'尚未保存': 'Sin guardar',
'尚未保存，填写后才能获取真实用量': 'Sin guardar · necesario para ver el uso real',
'测试连接': 'Probar conexión',
'怎么获取 Token': 'Cómo obtener el token',
// The help paragraph is one <p> broken up by <b>/<code>; each run of text
// is its own node, so the fragments are keyed exactly as they appear.
'API Key 用于余额，来自': 'La API Key da el saldo y viene de',
'。用量明细需要用浏览器登录平台，F12 → Network → 任意':
  '. Para el detalle de uso, inicia sesión en la plataforma desde el navegador, F12 → Network → cualquier',
'请求，复制': 'petición y copia',
'里 Bearer 后面的部分。': ' lo que va después de Bearer.',
'行为': 'Comportamiento',
'自动刷新': 'Actualización automática',
'30 秒': '30 s',
'1 分钟': '1 min',
'5 分钟': '5 min',
'使用演示数据': 'Usar datos de demostración',
'用固定样本预览界面，不读取真实账户': 'Vista previa con muestras fijas; sin leer tu cuenta',
'让仪器浮在其他窗口上方': 'Mantener el instrumento sobre otras ventanas',
'外观': 'Apariencia',
'主题': 'Tema',
'浅色': 'Claro',
'深色': 'Oscuro',
'跟随系统': 'Del sistema',
'浅色是默认外观；深色适合夜间或深色桌面。':
  'Claro es el valor predeterminado; Oscuro va bien de noche o con escritorio oscuro.',
'键位': 'Atajos',
'刷新账户': 'Actualizar cuenta',
'打开设置': 'Abrir ajustes',
'展开 / 收起': 'Ampliar / plegar',
'关闭设置或收起': 'Cerrar ajustes o plegar',
'关于': 'Acerca de',
'清除凭证': 'Borrar credenciales',
'再次点击确认清除': 'Pulsa otra vez para confirmar',
'保存并同步': 'Guardar y sincronizar',
'只保存在本机': 'Guardado solo en este equipo',
'未加密 · 系统加密服务不可用': 'Sin cifrar · no hay llavero del sistema',
'DPAPI 加密 · 只保存在本机': 'Cifrado con DPAPI · solo en este equipo',
'Keychain 加密 · 只保存在本机': 'Cifrado en llavero · solo en este equipo',
'libsecret 加密 · 只保存在本机': 'Cifrado con libsecret · solo en este equipo',
'KWallet 加密 · 只保存在本机': 'Cifrado con KWallet · solo en este equipo',
'KWallet 5 加密 · 只保存在本机': 'Cifrado con KWallet 5 · solo en este equipo',
'KWallet 6 加密 · 只保存在本机': 'Cifrado con KWallet 6 · solo en este equipo',

// ── transient status and toasts ─────────────────────────────────────
'演示数据': 'Datos de demostración',
'已连接': 'Conectado',
'连接异常': 'Error de conexión',
'未连接': 'Sin conexión',
'连接成功': 'Conectado',
'连接失败': 'Conexión fallida',
'未测试': 'Sin probar',
'测试失败': 'Prueba fallida',
'会话': 'Sesión',
'保存失败': 'No se pudo guardar',
'清除失败': 'No se pudo borrar',
'刷新失败': 'No se pudo actualizar',
'启动失败': 'No se pudo iniciar',
'已切换到演示数据': 'Cambiado a datos de demostración',
'配置已保存，正在同步': 'Guardado · sincronizando',
'已清除凭证，切回演示数据': 'Credenciales borradas · vuelta a la demostración',
'关闭演示数据前，请先填写 API Key。': 'Añade una API Key antes de desactivar la demostración.',
'窗口切换失败': 'No se pudo cambiar la vista',
'同步失败': 'Fallo de sincronización',
'置顶设置失败': 'No se pudo cambiar el fijado',
'节奏保存失败': 'No se pudo guardar el ritmo',
'保存中…': 'Guardando…',
'测试中…': 'Probando…',

// ── main process: tray, menus, IPC guards ───────────────────────────
'显示 / 隐藏窗口': 'Mostrar / ocultar la ventana',
'退出 Token Monitor': 'Salir de Token Monitor',
'Token Monitor · DeepSeek 跑道': 'Token Monitor · autonomía de DeepSeek',
'DeepSeek 平台用量页': 'Página de uso de DeepSeek',
'视图': 'Vista',
'帮助': 'Ayuda',
'设置…': 'Ajustes…',
'不受信任的请求': 'Solicitud no autorizada',
'未知主题': 'Tema desconocido',
'系统加密状态未确认，凭证未保存': 'El cifrado del sistema no se confirmó · credenciales no guardadas',

// ── data layer messages ─────────────────────────────────────────────
'网络请求超时，请检查网络连接': 'La solicitud agotó el tiempo de espera. Revisa tu conexión.',
'无法连接 DeepSeek 服务': 'No se puede contactar con el servicio de DeepSeek',
'平台会话已失效，请重新获取 Session Token':
  'La sesión de la plataforma caducó. Obtén un Session Token nuevo.',
'API Key 无效或已过期': 'La API Key no es válida o ha caducado',
'该凭证没有访问权限': 'Esta credencial no tiene acceso',
'请求过于频繁，请稍后再试': 'Demasiadas solicitudes. Inténtalo más tarde.',
'DeepSeek 服务暂时不可用': 'DeepSeek no está disponible por ahora',
'接口返回了无法解析的数据': 'La interfaz devolvió datos que no pudimos analizar',
'余额接口没有返回账户信息': 'La interfaz de saldo no devolvió la cuenta',
'余额获取失败': 'Saldo no disponible',
'用量获取失败': 'Uso no disponible',
'请先填写 API Key': 'Escribe primero una API Key',
'请先填写平台 Session Token': 'Escribe primero el Session Token de la plataforma',
'未填写 API Key': 'Sin API Key guardada',
'未填写 Session Token': 'Sin Session Token guardado',

// ── ASCII instrument chrome ─────────────────────────────────────────
// Labels the markup writes in ASCII because Chinese mode shows them that way;
// Spanish gives them their own words instead of leaving English on screen.
'DAYS': 'DÍAS',
'TOTAL': 'TOTAL',
'SAMPLE': 'MUESTRA',
'IDLE': 'INACTIVO',
'ERROR': 'ERROR',
'LIVE': 'EN VIVO',
'PARTIAL': 'PARCIAL',
'SETUP': 'AJUSTE',
'WAITING': 'ESPERA',
'NO LEDGER YET': 'SIN LIBRO AÚN',
'EFFECTIVE / M TOKENS': 'EFECTIVO / M TOKENS',
'LAST 7D': 'ÚLT 7 D',
'AVG': 'MEDIA',
'SYNC ERROR': 'ERROR DE SYNC',
'LIVE / DEEPSEEK API': 'EN VIVO / DEEPSEEK API',
'SYNCING…': 'SINCRONIZANDO…'
    },

    patterns: [
    // numbers and dates
[/^([\d.]+) 亿$/, (all, n, locale) => i18n.compactCount(Number(n) * 1e8, locale)],
[/^([\d.]+) 万$/, (all, n, locale) => i18n.compactCount(Number(n) * 1e4, locale)],
[/^(\d+) 年 (\d+) 月$/, (all, y, m) => `${MESES[Number(m) - 1]} de ${y}`],
[/^(\d+) 月 (\d+) 日$/, (all, m, d) => `${d} ${MES_CORTO[Number(m) - 1]}`],
[/^约 (\d+) 月 (\d+) 日见底$/, (all, m, d) => `Se agota ${d} ${MES_CORTO[Number(m) - 1]}`],

// money and pace
[/^(.+) \/ 天$/, '$1 / día'],
[/^(.+) · 样本消费日不足 (\d+) 天$/, (all, label, n, locale) => `${i18n.translate(label, locale)} · menos de ${n} ${uno(n) ? 'día' : 'días'} de muestra`],
[/^(.+) · 仅 (\d+) 个消费日$/, (all, label, n, locale) => `${i18n.translate(label, locale)} · solo ${n} ${uno(n) ? 'día' : 'días'} con gasto`],
[/^活跃 (\d+) 天 · (\d+) 天窗口$/, (all, a, w) => `${a} ${uno(a) ? 'día activo' : 'días activos'} de ${w}`],
[/^充值 (.+) · 赠金 (.+)$/, 'Recarga $1 · bono $2'],
[/^余额 (.+) · 赠金 (.+)$/, 'Saldo $1 · bono $2'],

// ledger, mix and cache detail
[/^近 30 天每日花费，总计 (.+)，峰值 (.+)$/, 'Gasto diario de 30 días. Total $1, máximo $2.'],
[/^缓存命中 (.+) · ([\d,]+) 请求$/, (all, pct, n, locale) => `Aciertos de caché ${pct} · ${i18n.groupCount(n, locale)} solicitudes`],
[/^缓存命中 (.+)$/, 'Aciertos de caché $1'],
[/^近 30 天输入 tokens 有 (.+) 命中缓存 · 共 ([\d,]+) 次请求$/,
  (all, pct, n, locale) => `${pct} de los tokens de entrada de 30 días acertó en caché · ${i18n.groupCount(n, locale)} solicitudes`],
[/^近 30 天输入 tokens 有 (.+) 命中缓存$/, '$1 de los tokens de entrada de 30 días acertó en caché'],
[/^(.+) · 缓存命中 ([\d.]+%) · ([\d,]+) 次请求$/,
  (all, label, pct, n, locale) => `${label} · aciertos de caché ${pct} · ${i18n.groupCount(n, locale)} solicitudes`],
[/^(.+) · 缓存命中 ([\d.]+%)$/, '$1 · aciertos de caché $2'],

// notices and status
[/^(.+) · 另有 (\d+) 项异常$/,
  (all, message, count, locale) => `${i18n.translate(message, locale)} · ${count} ${uno(count) ? 'incidencia más' : 'incidencias más'}`],
[/^(\d+) 项异常$/, (all, n) => `${n} ${uno(n) ? 'incidencia' : 'incidencias'}`],
[/^(.+) · 点击打开设置$/, (all, word, locale) => `${i18n.translate(word, locale)} · pulsa para abrir ajustes`],
[/^已保存 (.+) · 留空保持不变$/, 'Guardado $1 · déjalo vacío para conservarlo'],

// connection tests
[/^连接成功 · 余额 (.+)$/, 'Conectado · saldo $1'],
[/^连接成功 · 本月 (\d+) 天有记录$/, (all, n) => `Conectado · ${n} ${uno(n) ? 'día' : 'días'} con registro este mes`],
[/^接口返回 HTTP (\d+)$/, 'La interfaz devolvió HTTP $1'],

// tray tooltip
[/^Token Monitor · 跑道 (.+) 天$/, (all, n) => `Token Monitor · ${n} ${uno(n) ? 'día' : 'días'} de autonomía`],

// chrome labels carrying a value: a sync stamp, a chart peak
[/^SYNCED( .+)?$/, 'SINCRONIZADO$1'],
[/^SYNC ERR( .+)?$/, 'SYNC FALLO$1'],
[/^PEAK (.+)$/, 'PICO $1'],

// about line, whose version number is a nested element
[/^· 本地优先 · 非官方 DeepSeek 客户端。余额来自官方 API；用量来自平台会话接口，可能随平台调整。$/,
  ' · local primero · un cliente no oficial de DeepSeek. El saldo viene de la API oficial; el uso sale de la interfaz de sesión de la plataforma y puede cambiar con ella.']
    ]
  })

  if (typeof module !== 'undefined' && module.exports) module.exports = define
  else root.TmI18n.register('es', define(root.TmI18n))
})(typeof globalThis !== 'undefined' ? globalThis : this)
