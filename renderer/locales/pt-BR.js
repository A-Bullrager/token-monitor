// Brazilian Portuguese interface copy. The Chinese strings are the keys: they
// are what the markup and app.js actually say, so a label cannot be edited in
// one language only. scripts/check-i18n.mjs fails if a key is missing here.
;(function (root) {
  'use strict'

  const MESES = ['janeiro', 'fevereiro', 'março', 'abril', 'maio', 'junho',
    'julho', 'agosto', 'setembro', 'outubro', 'novembro', 'dezembro']
  const MES_CURTO = ['jan.', 'fev.', 'mar.', 'abr.', 'maio', 'jun.', 'jul.',
    'ago.', 'set.', 'out.', 'nov.', 'dez.']
  // '1' is singular, a measured '1.0' is plural: compare the text, as en.js does.
  const um = (n) => String(n).trim() === '1'

  const define = (i18n) => ({
    exact: {
    // ── showcase caption, only visible in screenshot mode ───────────────
'把账户余额变成一条看得见的跑道。': 'Transforme o seu saldo em uma pista de autonomia que dá para ver.',
'DeepSeek 余额与用量的桌面仪器。': 'Um instrumento de desktop para o saldo e o uso do DeepSeek.',

// ── strip: window chrome and labels ─────────────────────────────────
'账户状态': 'Status da conta',
'设置': 'Configurações',
'退出': 'Sair',
'收起': 'Recolher',
'最小化': 'Minimizar',
'窗口置顶': 'Manter no topo',
'取消置顶': 'Desafixar',
'显示金额': 'Mostrar valores',
'隐藏金额': 'Ocultar valores',
'展开账本': 'Expandir extrato',
'收起账本': 'Recolher extrato',
'余额跑道': 'Pista do saldo',
'RUNWAY / 预计可用': 'AUTONOMIA',
'余额续航': 'SALDO',
'TODAY / 今日': 'HOJE',
'¥— / 天': '¥— / dia',
'刷新': 'Atualizar',
'DEMO DATA · 本地样本': 'DEMO · amostra local',
'DEEPSEEK API · 本地凭证': 'DEEPSEEK API · credenciais locais',
'同步异常 · 点击状态查看': 'Falha na sincronização · abra o status',
'未连接 · 点击设置开始': 'Sem conexão · comece nas Configurações',
'仅余额已连接 · 缺少会话': 'Só saldo · sem sessão',
'部分连接 · 会话待补充': 'Parcial · falta a sessão',
'部分连接 · 余额待补充': 'Parcial · falta o saldo',
'等待连接': 'Aguardando conexão',
'需要用量数据': 'Precisa de dados de uso',
'样本偏少 · 仅供参考': 'Amostra · indicativa',
'— / 天': '— / dia',
'按 30 天活跃日': 'Ritmo de 30 dias ativos',
'按 7 天自然日': 'Ritmo de 7 dias corridos',

// ── deck: status line and notices ───────────────────────────────────
'Token Monitor 账本': 'Extrato do Token Monitor',
'DEMO / 样本数据': 'DEMO / dados de exemplo',
'PARTIAL / 缺少会话': 'PARCIAL / sem sessão',
'PARTIAL / 缺少 API KEY': 'PARCIAL / sem API key',
'SETUP / 未连接': 'CONFIG / sem conexão',
'去设置': 'Abrir configurações',
'重试': 'Tentar de novo',
'尚未连接 DeepSeek 账户 · 填写凭证后显示实时数据':
  'Sem conta do DeepSeek · informe credenciais para ver dados ao vivo',
'余额已连接 · 补充 Session Token 后显示用量与跑道':
  'Saldo conectado · adicione o Session Token para ver uso e autonomia',
'用量已连接 · 补充 API Key 后显示余额与跑道':
  'Uso conectado · adicione uma API key para ver saldo e autonomia',
'补充会话': 'Adicionar sessão',
'补充 Key': 'Adicionar chave',

// ── deck: runway gauge ──────────────────────────────────────────────
'跑道节奏': 'Ritmo da autonomia',
'30 天': '30 D',
'7 天': '7 D',
'天': 'd',
'余额 ÷ 有消费日期的日均': 'Saldo ÷ média por dia com gasto',
'余额 ÷ 近 7 天自然日均摊': 'Saldo ÷ média de 7 dias corridos',
'近 7 天自然日': 'Últimos 7 dias corridos',
'30 天活跃日': 'Ritmo de 30 dias ativos',
'近 7 天没有消费记录': 'Sem gasto nos últimos 7 dias',
'还没有可计算的消费': 'Ainda não há o que medir',
'余额已连接 · 需要用量': 'Saldo conectado · falta o uso',
'补充 Session Token 获取用量': 'Adicione o Session Token para ver o uso',
'补充 API Key 获取余额': 'Adicione uma API key para ver o saldo',
'未接入': 'sem dado',

// ── deck: treasury, composition, ledger, mix, outlook ───────────────
'TREASURY / 账户余额': 'TESOURARIA',
'充值 ¥0.00 · 赠金 ¥0.00': 'Recarga ¥0.00 · bônus ¥0.00',
'PACE / 日均': 'RITMO',
'WINDOW / 近 30 天': 'JANELA / 30 D',
'VOLUME / 30 天 tokens': 'VOLUME / TOKENS 30 D',
'COMPOSITION / 余额构成': 'COMPOSIÇÃO',
'充值': 'Recarga',
'赠金': 'Bônus',
'尚未读取到余额': 'Saldo ainda não lido',
'LEDGER / 每日花费': 'EXTRATO / GASTO DIÁRIO',
'近 30 天': 'Últimos 30 dias',
'接入平台会话后，这里会留下每天的花费。':
  'Quando a sessão da plataforma estiver conectada, o gasto de cada dia aparece aqui.',
'补充 Session Token': 'Adicionar Session Token',
'接入账户': 'Conectar conta',
'MIX / 模型构成': 'MIX / MODELOS',
'暂无模型明细': 'Sem detalhe por modelo',
'连接账户后显示模型明细': 'A mistura de modelos aparece depois de conectar',
'OUTLOOK / 节奏对照': 'PROJEÇÃO',
'预计月耗': 'MENSAL',
'两种节奏对照': 'Comparação de dois ritmos',
'近 30 天每日花费': 'Gasto diário nos últimos 30 dias',
'用量页 ↗': 'Página de uso ↗',
'平台用量页 ↗': 'Página de uso ↗',
'打开平台用量页 ↗': 'Abrir a página de uso ↗',

// ── settings drawer ─────────────────────────────────────────────────
'CONFIG / 参数': 'CONFIGURAÇÃO',
'关闭设置': 'Fechar configurações',
'连接': 'Conexão',
'余额': 'Saldo',
'用量明细 · 可选': 'Detalhe de uso · opcional',
'Bearer token 或整段 Authorization': 'Token Bearer ou o cabeçalho Authorization completo',
'尚未保存': 'Ainda não salvo',
'尚未保存，填写后才能获取真实用量': 'Ainda não salvo · necessário para o uso real',
'测试连接': 'Testar conexão',
'怎么获取 Token': 'Como obter o token',
// The help paragraph is one <p> broken up by <b>/<code>; each run of text
// is its own node, so the fragments are keyed exactly as they appear.
'API Key 用于余额，来自': 'A API key mostra o saldo e vem de',
'。用量明细需要用浏览器登录平台，F12 → Network → 任意':
  '. Para o detalhe de uso, entre na plataforma pelo navegador, abra F12 → Network → qualquer',
'请求，复制': 'requisição e copie',
'里 Bearer 后面的部分。': ' o que vem depois de Bearer.',
'行为': 'Comportamento',
'自动刷新': 'Atualização automática',
'30 秒': '30 s',
'1 分钟': '1 min',
'5 分钟': '5 min',
'使用演示数据': 'Usar dados de demonstração',
'用固定样本预览界面，不读取真实账户': 'Prévia com amostras fixas; sem ler sua conta',
'让仪器浮在其他窗口上方': 'Manter o instrumento acima das outras janelas',
'外观': 'Aparência',
'主题': 'Tema',
'浅色': 'Claro',
'深色': 'Escuro',
'跟随系统': 'Do sistema',
'浅色是默认外观；深色适合夜间或深色桌面。':
  'Claro é o padrão; escuro combina com a noite ou com um desktop escuro.',
'键位': 'Atalhos',
'刷新账户': 'Atualizar conta',
'打开设置': 'Abrir configurações',
'展开 / 收起': 'Expandir / recolher',
'关闭设置或收起': 'Fechar configurações ou recolher',
'关于': 'Sobre',
'清除凭证': 'Limpar credenciais',
'再次点击确认清除': 'Clique de novo para confirmar',
'保存并同步': 'Salvar e sincronizar',
'只保存在本机': 'Salvo só neste dispositivo',
'未加密 · 系统加密服务不可用': 'Sem criptografia · não há chaveiro do sistema',
'DPAPI 加密 · 只保存在本机': 'Criptografado com DPAPI · só neste dispositivo',
'Keychain 加密 · 只保存在本机': 'Criptografado no chaveiro · só neste dispositivo',
'libsecret 加密 · 只保存在本机': 'Criptografado com libsecret · só neste dispositivo',
'KWallet 加密 · 只保存在本机': 'Criptografado com KWallet · só neste dispositivo',
'KWallet 5 加密 · 只保存在本机': 'Criptografado com KWallet 5 · só neste dispositivo',
'KWallet 6 加密 · 只保存在本机': 'Criptografado com KWallet 6 · só neste dispositivo',

// ── transient status and toasts ─────────────────────────────────────
'演示数据': 'Dados de demonstração',
'已连接': 'Conectado',
'连接异常': 'Erro de conexão',
'未连接': 'Sem conexão',
'连接成功': 'Conectado',
'连接失败': 'Falha na conexão',
'未测试': 'Não testado',
'测试失败': 'Falha no teste',
'会话': 'Sessão',
'保存失败': 'Falha ao salvar',
'清除失败': 'Não foi possível limpar',
'刷新失败': 'Falha ao atualizar',
'启动失败': 'Falha ao iniciar',
'已切换到演示数据': 'Mudou para dados de demonstração',
'配置已保存，正在同步': 'Salvo · sincronizando',
'已清除凭证，切回演示数据': 'Credenciais limpas · demonstração restaurada',
'关闭演示数据前，请先填写 API Key。': 'Adicione uma API key antes de desativar a demonstração.',
'窗口切换失败': 'Não foi possível trocar a visão',
'同步失败': 'Falha na sincronização',
'置顶设置失败': 'Não foi possível mudar o fixado',
'节奏保存失败': 'Não foi possível salvar o ritmo',
'保存中…': 'Salvando…',
'测试中…': 'Testando…',

// ── main process: tray, menus, IPC guards ───────────────────────────
'显示 / 隐藏窗口': 'Mostrar / ocultar a janela',
'退出 Token Monitor': 'Sair do Token Monitor',
'Token Monitor · DeepSeek 跑道': 'Token Monitor · autonomia do DeepSeek',
'DeepSeek 平台用量页': 'Página de uso do DeepSeek',
'视图': 'Exibir',
'帮助': 'Ajuda',
'设置…': 'Configurações…',
'不受信任的请求': 'Solicitação não confiável',
'未知主题': 'Tema desconhecido',
'系统加密状态未确认，凭证未保存': 'Criptografia do sistema não confirmada · credenciais não salvas',

// ── data layer messages ─────────────────────────────────────────────
'网络请求超时，请检查网络连接': 'A solicitação expirou. Verifique sua conexão de rede.',
'无法连接 DeepSeek 服务': 'Não foi possível acessar o serviço do DeepSeek',
'平台会话已失效，请重新获取 Session Token':
  'A sessão da plataforma expirou. Obtenha um novo Session Token.',
'API Key 无效或已过期': 'A API key é inválida ou expirou',
'该凭证没有访问权限': 'Esta credencial não tem acesso',
'请求过于频繁，请稍后再试': 'Muitas solicitações. Tente de novo mais tarde.',
'DeepSeek 服务暂时不可用': 'O DeepSeek está indisponível no momento',
'接口返回了无法解析的数据': 'A interface devolveu dados que não conseguimos interpretar',
'余额接口没有返回账户信息': 'A interface de saldo não devolveu a conta',
'余额获取失败': 'Saldo indisponível',
'用量获取失败': 'Uso indisponível',
'请先填写 API Key': 'Informe primeiro uma API key',
'请先填写平台 Session Token': 'Informe primeiro o Session Token da plataforma',
'未填写 API Key': 'Nenhuma API key salva',
'未填写 Session Token': 'Nenhum Session Token salvo',

// ── ASCII instrument chrome ─────────────────────────────────────────
// Labels the markup writes in ASCII because Chinese mode shows them that way;
// Portuguese gives them their own words instead of leaving English on screen.
'DAYS': 'DIAS',
'TOTAL': 'TOTAL',
'SAMPLE': 'AMOSTRA',
'IDLE': 'INATIVO',
'ERROR': 'ERRO',
'LIVE': 'AO VIVO',
'PARTIAL': 'PARCIAL',
'SETUP': 'CONFIG',
'WAITING': 'AGUARDA',
'NO LEDGER YET': 'SEM EXTRATO AINDA',
'EFFECTIVE / M TOKENS': 'EFETIVO / MI TOKENS',
'LAST 7D': 'ÚLT 7 D',
'AVG': 'MÉDIA',
'SYNC ERROR': 'ERRO DE SYNC',
'LIVE / DEEPSEEK API': 'AO VIVO / DEEPSEEK API',
'SYNCING…': 'SINCRONIZANDO…'
    },

    patterns: [
    // numbers and dates
[/^([\d.]+) 亿$/, (all, n, locale) => i18n.compactCount(Number(n) * 1e8, locale)],
[/^([\d.]+) 万$/, (all, n, locale) => i18n.compactCount(Number(n) * 1e4, locale)],
[/^(\d+) 年 (\d+) 月$/, (all, y, m) => `${MESES[Number(m) - 1]} de ${y}`],
[/^(\d+) 月 (\d+) 日$/, (all, m, d) => `${d} de ${MES_CURTO[Number(m) - 1]}`],
[/^约 (\d+) 月 (\d+) 日见底$/, (all, m, d) => `Acaba ${d} de ${MES_CURTO[Number(m) - 1]}`],

// money and pace
[/^(.+) \/ 天$/, '$1 / dia'],
[/^(.+) · 样本消费日不足 (\d+) 天$/, (all, label, n, locale) => `${i18n.translate(label, locale)} · menos de ${n} ${um(n) ? 'dia' : 'dias'} de amostra`],
[/^(.+) · 仅 (\d+) 个消费日$/, (all, label, n, locale) => `${i18n.translate(label, locale)} · só ${n} ${um(n) ? 'dia' : 'dias'} com gasto`],
[/^活跃 (\d+) 天 · (\d+) 天窗口$/, (all, a, w) => `${a} ${um(a) ? 'dia ativo' : 'dias ativos'} de ${w}`],
[/^充值 (.+) · 赠金 (.+)$/, 'Recarga $1 · bônus $2'],
[/^余额 (.+) · 赠金 (.+)$/, 'Saldo $1 · bônus $2'],

// ledger, mix and cache detail
[/^近 30 天每日花费，总计 (.+)，峰值 (.+)$/, 'Gasto diário de 30 dias. Total $1, pico $2.'],
[/^缓存命中 (.+) · ([\d,]+) 请求$/, (all, pct, n, locale) => `Acertos de cache ${pct} · ${i18n.groupCount(n, locale)} solicitações`],
[/^缓存命中 (.+)$/, 'Acertos de cache $1'],
[/^近 30 天输入 tokens 有 (.+) 命中缓存 · 共 ([\d,]+) 次请求$/,
  (all, pct, n, locale) => `${pct} dos tokens de entrada de 30 dias acertou no cache · ${i18n.groupCount(n, locale)} solicitações`],
[/^近 30 天输入 tokens 有 (.+) 命中缓存$/, '$1 dos tokens de entrada de 30 dias acertou no cache'],
[/^(.+) · 缓存命中 ([\d.]+%) · ([\d,]+) 次请求$/,
  (all, label, pct, n, locale) => `${label} · acertos de cache ${pct} · ${i18n.groupCount(n, locale)} solicitações`],
[/^(.+) · 缓存命中 ([\d.]+%)$/, '$1 · acertos de cache $2'],

// notices and status
[/^(.+) · 另有 (\d+) 项异常$/,
  (all, message, count, locale) => `${i18n.translate(message, locale)} · mais ${count} ${um(count) ? 'problema' : 'problemas'}`],
[/^(\d+) 项异常$/, (all, n) => `${n} ${um(n) ? 'problema' : 'problemas'}`],
[/^(.+) · 点击打开设置$/, (all, word, locale) => `${i18n.translate(word, locale)} · clique para abrir as configurações`],
[/^已保存 (.+) · 留空保持不变$/, 'Salvo $1 · deixe em branco para manter'],

// connection tests
[/^连接成功 · 余额 (.+)$/, 'Conectado · saldo $1'],
[/^连接成功 · 本月 (\d+) 天有记录$/, (all, n) => `Conectado · ${n} ${um(n) ? 'dia' : 'dias'} com registro neste mês`],
[/^接口返回 HTTP (\d+)$/, 'A interface devolveu HTTP $1'],

// tray tooltip
[/^Token Monitor · 跑道 (.+) 天$/, (all, n) => `Token Monitor · ${n} ${um(n) ? 'dia' : 'dias'} de autonomia`],

// chrome labels carrying a value: a sync stamp, a chart peak
[/^SYNCED( .+)?$/, 'SINCRONIZADO$1'],
[/^SYNC ERR( .+)?$/, 'SYNC FALHA$1'],
[/^PEAK (.+)$/, 'PICO $1'],

// about line, whose version number is a nested element
[/^· 本地优先 · 非官方 DeepSeek 客户端。余额来自官方 API；用量来自平台会话接口，可能随平台调整。$/,
  ' · local primeiro · um cliente não oficial do DeepSeek. O saldo vem da API oficial; o uso vem da interface de sessão da plataforma e pode mudar junto com ela.']
    ]
  })

  if (typeof module !== 'undefined' && module.exports) module.exports = define
  else root.TmI18n.register('pt-BR', define(root.TmI18n))
})(typeof globalThis !== 'undefined' ? globalThis : this)
