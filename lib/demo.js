'use strict'

// A deliberately coherent demo dataset: 15 spending days, 109.73 CNY total,
// 29.10 peak, and a 19.8 day runway from a 145.09 balance.
const DEMO_COSTS = [
  0, 12.4, 0, 0, 29.1, 0, 0, 8.36, 6.22, 0,
  4.18, 0, 0, 10.57, 3.44, 0, 0, 7.91, 0, 5.63,
  0, 2.87, 0, 0, 6.9, 3.12, 0, 1.28, 6.26, 1.49
]

const DEMO_TOTAL_TOKENS = 1_017_000_000
const DEMO_TODAY_TOKENS = 10_964_000
const DEMO_CACHE_HIT_SHARE = 0.618
const DEMO_OUTPUT_SHARE = 0.3

function round(value, digits = 2) {
  const p = 10 ** digits
  return Math.round((value + Number.EPSILON) * p) / p
}

function tokenBreakdown(tokens) {
  const response = Math.round(tokens * DEMO_OUTPUT_SHARE)
  const input = Math.max(0, tokens - response)
  const cacheHit = Math.round(input * DEMO_CACHE_HIT_SHARE)
  return {
    cacheHit,
    cacheMiss: input - cacheHit,
    prompt: 0,
    response,
    requests: tokens > 0 ? Math.max(1, Math.round(tokens / 545000)) : 0
  }
}

function ymd(date) {
  return [
    date.getFullYear(),
    String(date.getMonth() + 1).padStart(2, '0'),
    String(date.getDate()).padStart(2, '0')
  ].join('-')
}

function buildDemoState(now = new Date()) {
  const dateNow = now instanceof Date && !Number.isNaN(now.getTime()) ? now : new Date()
  const dates = DEMO_COSTS.map((_, index) => {
    const offset = DEMO_COSTS.length - 1 - index
    return ymd(new Date(dateNow.getFullYear(), dateNow.getMonth(), dateNow.getDate() - offset))
  })

  const todayIndex = DEMO_COSTS.length - 1
  const otherActive = DEMO_COSTS.map((cost, index) => ({ cost, index })).filter(
    ({ cost, index }) => cost > 0 && index !== todayIndex
  )
  const weightSum = otherActive.reduce((sum, item) => sum + item.cost, 0)
  const remaining = DEMO_TOTAL_TOKENS - DEMO_TODAY_TOKENS
  const tokensByIndex = new Array(DEMO_COSTS.length).fill(0)
  let assigned = 0
  otherActive.forEach(({ cost, index }, position) => {
    const tokens =
      position === otherActive.length - 1
        ? remaining - assigned
        : Math.round((remaining * cost) / weightSum)
    tokensByIndex[index] = tokens
    assigned += tokens
  })
  tokensByIndex[todayIndex] = DEMO_TODAY_TOKENS

  const series = DEMO_COSTS.map((cost, index) => ({
    date: dates[index],
    cost,
    tokens: tokensByIndex[index],
    ...tokenBreakdown(tokensByIndex[index])
  }))

  const totalCost = series.reduce((sum, item) => sum + item.cost, 0)
  const totalTokens = series.reduce((sum, item) => sum + item.tokens, 0)
  const totalRequests = series.reduce((sum, item) => sum + item.requests, 0)
  const totalCacheHit = series.reduce((sum, item) => sum + item.cacheHit, 0)
  const totalCacheMiss = series.reduce((sum, item) => sum + item.cacheMiss, 0)
  const cacheHitRate = round((totalCacheHit / (totalCacheHit + totalCacheMiss)) * 100, 1)
  const activeDays = series.filter((item) => item.cost > 0).length
  const dailyAvg = totalCost / activeDays
  const last7 = series.slice(-7)
  const last7Cost = last7.reduce((sum, item) => sum + item.cost, 0)
  const avg7 = last7.length ? last7Cost / last7.length : 0
  const effectivePrice = totalTokens > 0 ? round((totalCost / totalTokens) * 1_000_000, 4) : null
  const peakItem = series.reduce(
    (best, item) => (item.cost > best.cost ? item : best),
    { date: '', cost: 0 }
  )
  const modelSeeds = [
    { name: 'deepseek-v4-flash', tokens: 940_020_000, cost: 77.02 },
    { name: 'deepseek-v4-pro', tokens: 76_980_000, cost: 32.71 },
    { name: 'deepseek-v4-flash-vision-exp', tokens: 0, cost: 0 },
    { name: 'deepseek-chat & deepseek-reasoner', tokens: 0, cost: 0 }
  ]
  const models = modelSeeds.map((model) => {
    const breakdown = tokenBreakdown(model.tokens)
    const rate =
      breakdown.cacheHit + breakdown.cacheMiss > 0
        ? round((breakdown.cacheHit / (breakdown.cacheHit + breakdown.cacheMiss)) * 100, 1)
        : null
    return { ...model, ...breakdown, cacheHitRate: rate }
  })

  return {
    mode: 'demo',
    currency: 'CNY',
    balance: {
      available: true,
      currency: 'CNY',
      total: 145.09,
      topup: 66.52,
      grant: 78.57
    },
    usage: {
      today: { cost: 1.49, tokens: DEMO_TODAY_TOKENS },
      last30: {
        cost: round(totalCost),
        tokens: totalTokens,
        days: series.length,
        activeDays,
        requests: totalRequests
      },
      dailyAvg: round(dailyAvg),
      daysLeft: round(145.09 / dailyAvg, 1),
      avg7: round(avg7),
      daysLeft7: round(145.09 / avg7, 1),
      last7Cost: round(last7Cost),
      effectivePrice,
      requests: totalRequests,
      cacheHitRate,
      cacheHitTokens: totalCacheHit,
      cacheMissTokens: totalCacheMiss,
      series,
      peak: { date: peakItem.date, cost: peakItem.cost },
      models,
      monthLabel: `${dateNow.getFullYear()} 年 ${dateNow.getMonth() + 1} 月`
    },
    status: { api: 'demo', session: 'demo' },
    errors: [],
    fetchedAt: new Date().toISOString()
  }
}

module.exports = { buildDemoState, DEMO_COSTS }
