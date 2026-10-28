'use strict'

const API_BASE = 'https://api.deepseek.com'
const PLATFORM_BASE = 'https://platform.deepseek.com'
const TIMEOUT_MS = 20000

class ApiError extends Error {
  constructor(message, options = {}) {
    super(message)
    this.name = 'ApiError'
    this.status = options.status || 0
    this.section = options.section || ''
    this.code = options.code || ''
  }
}

function toNumber(value) {
  if (typeof value === 'number') return Number.isFinite(value) ? value : 0
  if (typeof value === 'string') {
    const n = Number.parseFloat(value)
    return Number.isFinite(n) ? n : 0
  }
  return 0
}

function round(value, digits = 2) {
  const p = 10 ** digits
  return Math.round((value + Number.EPSILON) * p) / p
}

function cacheHitRate(hit, miss, prompt = 0) {
  const input = hit + miss + prompt
  return input > 0 ? round((hit / input) * 100, 1) : null
}

function readUsage(usages) {
  const breakdown = {
    tokens: 0,
    cacheHit: 0,
    cacheMiss: 0,
    prompt: 0,
    response: 0,
    requests: 0
  }
  for (const usage of usages) {
    const type = String(usage?.type || '').toUpperCase()
    const amount = toNumber(usage?.amount)
    if (!type) {
      breakdown.tokens += amount
      continue
    }
    const tokenLike =
      type.includes('TOKEN') ||
      type.startsWith('PROMPT') ||
      type.startsWith('RESPONSE') ||
      type.startsWith('COMPLETION') ||
      type.startsWith('INPUT') ||
      type.startsWith('OUTPUT')
    if (tokenLike) breakdown.tokens += amount
    if (type.includes('CACHE_HIT')) breakdown.cacheHit += amount
    else if (type.includes('CACHE_MISS')) breakdown.cacheMiss += amount
    else if (type === 'PROMPT_TOKEN' || type === 'INPUT_TOKEN') breakdown.prompt += amount
    else if (type.startsWith('RESPONSE') || type.startsWith('COMPLETION') || type === 'OUTPUT_TOKEN') {
      breakdown.response += amount
    } else if (type === 'REQUEST' || type === 'REQUESTS') {
      breakdown.requests += amount
    }
  }
  breakdown.tokens = Math.round(breakdown.tokens)
  breakdown.cacheHit = Math.round(breakdown.cacheHit)
  breakdown.cacheMiss = Math.round(breakdown.cacheMiss)
  breakdown.prompt = Math.round(breakdown.prompt)
  breakdown.response = Math.round(breakdown.response)
  breakdown.requests = Math.round(breakdown.requests)
  return breakdown
}

function ymd(date) {
  return [
    date.getFullYear(),
    String(date.getMonth() + 1).padStart(2, '0'),
    String(date.getDate()).padStart(2, '0')
  ].join('-')
}

function lastNDates(n, now) {
  const dates = []
  for (let i = n - 1; i >= 0; i -= 1) {
    dates.push(ymd(new Date(now.getFullYear(), now.getMonth(), now.getDate() - i)))
  }
  return dates
}

function normalizeDate(value) {
  if (typeof value !== 'string') return ''
  const match = value.match(/^(\d{4}-\d{2}-\d{2})/)
  return match ? match[1] : ''
}

function platformHeaders(token) {
  return {
    Authorization: `Bearer ${token}`,
    Accept: '*/*',
    'x-app-version': '1.0.0',
    Referer: 'https://platform.deepseek.com/usage',
    Origin: 'https://platform.deepseek.com',
    'User-Agent':
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/135.0.0.0 Safari/537.36'
  }
}

async function requestJson(url, { token, session = false, section = '' } = {}) {
  const headers = session
    ? platformHeaders(token)
    : {
        Authorization: `Bearer ${token}`,
        Accept: 'application/json'
      }

  let response
  try {
    response = await fetch(url, {
      headers,
      signal: AbortSignal.timeout(TIMEOUT_MS)
    })
  } catch (error) {
    const timedOut = error && (error.name === 'TimeoutError' || error.name === 'AbortError')
    throw new ApiError(timedOut ? '网络请求超时，请检查网络连接' : '无法连接 DeepSeek 服务', {
      section,
      code: timedOut ? 'timeout' : 'network'
    })
  }

  if (!response.ok) {
    let detail = ''
    try {
      const text = await response.text()
      try {
        const parsed = JSON.parse(text)
        detail = parsed.message || parsed.msg || parsed.error?.message || ''
      } catch {
        detail = text.slice(0, 160)
      }
    } catch {
      /* ignore */
    }

    let message
    if (response.status === 401) {
      message = session
        ? '平台会话已失效，请重新获取 Session Token'
        : 'API Key 无效或已过期'
    } else if (response.status === 403) {
      message = '该凭证没有访问权限'
    } else if (response.status === 429) {
      message = '请求过于频繁，请稍后再试'
    } else if (response.status >= 500) {
      message = 'DeepSeek 服务暂时不可用'
    } else {
      message = `接口返回 HTTP ${response.status}`
    }
    const authFailure = response.status === 401 || response.status === 403
    if (detail && !authFailure && !detail.includes('<')) {
      message += `：${detail.slice(0, 120)}`
    }
    throw new ApiError(message, { status: response.status, section })
  }

  try {
    return await response.json()
  } catch {
    throw new ApiError('接口返回了无法解析的数据', { section })
  }
}

async function fetchBalance(apiKey) {
  if (!apiKey) throw new ApiError('请先填写 API Key', { section: 'balance', code: 'missing' })
  const payload = await requestJson(`${API_BASE}/user/balance`, {
    token: apiKey,
    section: 'balance'
  })
  const infos = Array.isArray(payload?.balance_infos) ? payload.balance_infos : []
  const info = infos.find((item) => item?.currency === 'CNY') || infos[0]
  if (!info) {
    throw new ApiError('余额接口没有返回账户信息', { section: 'balance', code: 'empty' })
  }
  return {
    available: payload?.is_available !== false,
    currency: info.currency || 'CNY',
    total: round(toNumber(info.total_balance)),
    topup: round(toNumber(info.topped_up_balance)),
    grant: round(toNumber(info.granted_balance))
  }
}

function bizEntries(payload) {
  let node = payload
  if (node && node.data) node = node.data
  const raw = node?.biz_data ?? node
  if (Array.isArray(raw)) return raw.filter(Boolean)
  return raw ? [raw] : []
}

function normalizeUsage(amountPayload, costPayload) {
  const days = new Map()
  const models = new Map()
  const usageFields = ['tokens', 'cacheHit', 'cacheMiss', 'prompt', 'response', 'requests']

  const emptyUsage = () => ({
    tokens: 0,
    cacheHit: 0,
    cacheMiss: 0,
    prompt: 0,
    response: 0,
    requests: 0
  })

  const addUsage = (target, stats) => {
    for (const key of usageFields) target[key] = (target[key] || 0) + (stats[key] || 0)
  }

  const ensureDay = (date) => {
    if (!days.has(date)) {
      days.set(date, { date, cost: 0, ...emptyUsage(), models: new Map() })
    }
    return days.get(date)
  }

  const ensureModel = (day, name) => {
    if (!day.models.has(name)) {
      day.models.set(name, { name, cost: 0, ...emptyUsage() })
    }
    return day.models.get(name)
  }

  for (const biz of bizEntries(amountPayload)) {
    const bizDays = Array.isArray(biz?.days) ? biz.days : []
    for (const item of bizDays) {
      const date = normalizeDate(item?.date)
      if (!date) continue
      const day = ensureDay(date)
      for (const entry of item?.data || []) {
        const model = String(entry?.model || 'unknown')
        const usages = Array.isArray(entry?.usage) ? entry.usage : []
        const stats = readUsage(usages)
        const modelNode = ensureModel(day, model)
        addUsage(modelNode, stats)
        addUsage(day, stats)

        const aggregate = models.get(model) || { name: model, cost: 0, ...emptyUsage() }
        addUsage(aggregate, stats)
        models.set(model, aggregate)
      }
    }
  }

  for (const biz of bizEntries(costPayload)) {
    const bizDays = Array.isArray(biz?.days) ? biz.days : []
    for (const item of bizDays) {
      const date = normalizeDate(item?.date)
      if (!date) continue
      const day = ensureDay(date)
      for (const entry of item?.data || []) {
        const model = String(entry?.model || 'unknown')
        const usages = Array.isArray(entry?.usage) ? entry.usage : []
        const cost = usages.reduce((sum, u) => sum + toNumber(u?.amount), 0)
        const modelNode = ensureModel(day, model)
        modelNode.cost += cost
        day.cost += cost

        const aggregate = models.get(model) || { name: model, cost: 0, ...emptyUsage() }
        aggregate.cost += cost
        models.set(model, aggregate)
      }
    }
  }

  for (const day of days.values()) {
    day.cost = round(day.cost)
    day.cacheHitRate = cacheHitRate(day.cacheHit, day.cacheMiss, day.prompt)
    for (const model of day.models.values()) {
      model.cost = round(model.cost)
      model.cacheHitRate = cacheHitRate(model.cacheHit, model.cacheMiss, model.prompt)
    }
  }
  for (const model of models.values()) {
    model.cost = round(model.cost)
    model.cacheHitRate = cacheHitRate(model.cacheHit, model.cacheMiss, model.prompt)
  }

  return { days, models }
}

async function fetchUsageMonth(sessionToken, year, month) {
  if (!sessionToken) {
    throw new ApiError('请先填写平台 Session Token', { section: 'usage', code: 'missing' })
  }
  const query = `?month=${month}&year=${year}`
  const [amount, cost] = await Promise.all([
    requestJson(`${PLATFORM_BASE}/api/v0/usage/amount${query}`, {
      token: sessionToken,
      session: true,
      section: 'usage'
    }),
    requestJson(`${PLATFORM_BASE}/api/v0/usage/cost${query}`, {
      token: sessionToken,
      session: true,
      section: 'usage'
    })
  ])
  return normalizeUsage(amount, cost)
}

function mergeMonth(target, source) {
  if (!source) return
  for (const [date, day] of source.days) {
    target.days.set(date, day)
  }
  for (const [name, model] of source.models) {
    const prev = target.models.get(name)
    if (prev) {
      for (const key of ['cost', 'tokens', 'cacheHit', 'cacheMiss', 'prompt', 'response', 'requests']) {
        prev[key] = (prev[key] || 0) + (model[key] || 0)
      }
      prev.cost = round(prev.cost)
      prev.cacheHitRate = cacheHitRate(prev.cacheHit, prev.cacheMiss, prev.prompt)
    } else {
      target.models.set(name, { ...model })
    }
  }
}

async function getOverview({ apiKey = '', sessionToken = '', now = new Date() } = {}) {
  const errors = []
  const dateNow = now instanceof Date && !Number.isNaN(now.getTime()) ? now : new Date()
  const dates = lastNDates(30, dateNow)
  const currentYear = dateNow.getFullYear()
  const currentMonth = dateNow.getMonth() + 1
  const startDate = dates[0]

  let balance = null
  let usage = null
  let status = { api: 'missing', session: 'missing' }

  const balanceTask = apiKey
    ? fetchBalance(apiKey).then(
        (value) => ({ ok: true, value }),
        (error) => ({ ok: false, error })
      )
    : Promise.resolve({ ok: false, skipped: true })

  let usageTask = Promise.resolve({ ok: false, skipped: true })
  let monthKey = ''
  if (sessionToken) {
    monthKey = startDate.slice(0, 7)
    const currentKey = `${currentYear}-${String(currentMonth).padStart(2, '0')}`
    const needPrevious = monthKey !== currentKey

    usageTask = (async () => {
      const current = await fetchUsageMonth(sessionToken, currentYear, currentMonth)
      const merged = { days: new Map(current.days), models: new Map(current.models) }
      if (needPrevious) {
        const [prevYear, prevMonth] = monthKey.split('-').map(Number)
        try {
          const previous = await fetchUsageMonth(sessionToken, prevYear, prevMonth)
          mergeMonth(merged, previous)
        } catch {
          /* 30-day window is still usable when the previous month is unavailable */
        }
      }
      return merged
    })().then(
      (value) => ({ ok: true, value }),
      (error) => ({ ok: false, error })
    )
  }

  const [balanceResult, usageResult] = await Promise.all([balanceTask, usageTask])

  if (apiKey) {
    if (balanceResult.ok) {
      balance = balanceResult.value
      status.api = 'ok'
    } else {
      status.api = 'error'
      errors.push({
        section: 'balance',
        message: balanceResult.error?.message || '余额获取失败',
        code: balanceResult.error?.code || '',
        status: balanceResult.error?.status || 0
      })
    }
  }

  let series = []
  if (sessionToken) {
    if (usageResult.ok) {
      status.session = 'ok'
      const merged = usageResult.value
      series = dates.map((date) => {
        const day = merged.days.get(date)
        return {
          date,
          cost: round(day?.cost || 0),
          tokens: Math.round(day?.tokens || 0),
          cacheHit: Math.round(day?.cacheHit || 0),
          cacheMiss: Math.round(day?.cacheMiss || 0),
          prompt: Math.round(day?.prompt || 0),
          response: Math.round(day?.response || 0),
          requests: Math.round(day?.requests || 0)
        }
      })
      const todayKey = ymd(dateNow)
      const today = series.find((item) => item.date === todayKey) || {
        date: todayKey,
        cost: 0,
        tokens: 0,
        cacheHit: 0,
        cacheMiss: 0,
        prompt: 0,
        response: 0,
        requests: 0
      }
      const totalCost = series.reduce((sum, item) => sum + item.cost, 0)
      const totalTokens = series.reduce((sum, item) => sum + item.tokens, 0)
      const totalRequests = series.reduce((sum, item) => sum + item.requests, 0)
      const totalCacheHit = series.reduce((sum, item) => sum + item.cacheHit, 0)
      const totalCacheMiss = series.reduce((sum, item) => sum + item.cacheMiss, 0)
      const totalPrompt = series.reduce((sum, item) => sum + item.prompt, 0)
      const activeDays = series.filter((item) => item.cost > 0.0001).length
      const dailyAvg = activeDays > 0 ? totalCost / activeDays : 0
      const daysLeft =
        balance && dailyAvg > 0.0001 ? round(balance.total / dailyAvg, 1) : null
      const last7 = series.slice(-7)
      const last7Cost = last7.reduce((sum, item) => sum + item.cost, 0)
      const avg7 = last7.length ? last7Cost / last7.length : 0
      const daysLeft7 =
        balance && avg7 > 0.0001 ? round(balance.total / avg7, 1) : null
      const effectivePrice =
        totalTokens > 0 ? round((totalCost / totalTokens) * 1_000_000, 4) : null
      const peakItem = series.reduce(
        (best, item) => (item.cost > best.cost ? item : best),
        { date: '', cost: 0 }
      )

      // Aggregate models across exactly the same 30-day window as the series.
      const modelTotals = new Map()
      for (const date of dates) {
        const day = merged.days.get(date)
        if (!day) continue
        for (const model of day.models.values()) {
          const current = modelTotals.get(model.name) || {
            name: model.name,
            tokens: 0,
            cost: 0,
            cacheHit: 0,
            cacheMiss: 0,
            prompt: 0,
            response: 0,
            requests: 0
          }
          for (const key of ['tokens', 'cost', 'cacheHit', 'cacheMiss', 'prompt', 'response', 'requests']) {
            current[key] += model[key] || 0
          }
          modelTotals.set(model.name, current)
        }
      }

      const models = Array.from(modelTotals.values())
        .filter((model) => model.tokens > 0 || model.cost > 0.0001)
        .sort((a, b) => b.cost - a.cost || b.tokens - a.tokens)
        .slice(0, 6)
        .map((model) => ({
          name: model.name,
          tokens: Math.round(model.tokens),
          cost: round(model.cost),
          requests: Math.round(model.requests),
          cacheHitRate: cacheHitRate(model.cacheHit, model.cacheMiss, model.prompt)
        }))

      usage = {
        today: {
          cost: round(today.cost),
          tokens: Math.round(today.tokens),
          requests: Math.round(today.requests)
        },
        last30: {
          cost: round(totalCost),
          tokens: Math.round(totalTokens),
          days: series.length,
          activeDays,
          requests: Math.round(totalRequests)
        },
        dailyAvg: round(dailyAvg),
        daysLeft,
        avg7: round(avg7),
        daysLeft7,
        last7Cost: round(last7Cost),
        effectivePrice,
        requests: Math.round(totalRequests),
        cacheHitRate: cacheHitRate(totalCacheHit, totalCacheMiss, totalPrompt),
        cacheHitTokens: Math.round(totalCacheHit),
        cacheMissTokens: Math.round(totalCacheMiss),
        series,
        peak:
          peakItem.cost > 0
            ? { date: peakItem.date, cost: round(peakItem.cost) }
            : null,
        models,
        monthLabel: `${currentYear} 年 ${currentMonth} 月`
      }
    } else {
      status.session = 'error'
      errors.push({
        section: 'usage',
        message: usageResult.error?.message || '用量获取失败',
        code: usageResult.error?.code || '',
        status: usageResult.error?.status || 0
      })
    }
  }

  return {
    mode: 'live',
    currency: balance?.currency || 'CNY',
    balance,
    usage,
    status,
    errors,
    fetchedAt: new Date().toISOString()
  }
}

async function testConnection({ apiKey = '', sessionToken = '', now = new Date() } = {}) {
  const dateNow = now instanceof Date ? now : new Date()
  const balance = { ok: false, message: '未填写 API Key' }
  const session = { ok: false, message: '未填写 Session Token' }

  await Promise.all([
    apiKey
      ? fetchBalance(apiKey).then(
          (value) => {
            balance.ok = true
            balance.message = `连接成功 · 余额 ${value.currency === 'USD' ? '$' : '¥'}${value.total.toFixed(2)}`
          },
          (error) => {
            balance.message = error.message || '连接失败'
          }
        )
      : Promise.resolve(),
    sessionToken
      ? fetchUsageMonth(sessionToken, dateNow.getFullYear(), dateNow.getMonth() + 1).then(
          (value) => {
            session.ok = true
            session.message = `连接成功 · 本月 ${value.days.size} 天有记录`
          },
          (error) => {
            session.message = error.message || '连接失败'
          }
        )
      : Promise.resolve()
  ])

  return { balance, session }
}

module.exports = {
  ApiError,
  fetchBalance,
  fetchUsageMonth,
  getOverview,
  testConnection,
  _internals: { normalizeUsage, bizEntries, lastNDates, ymd, round, normalizeDate }
}
