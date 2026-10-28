import assert from 'node:assert/strict'
import { createRequire } from 'node:module'

const require = createRequire(import.meta.url)
const { getOverview, _internals } = require('../lib/deepseek.js')
const { buildDemoState } = require('../lib/demo.js')

const { normalizeUsage } = _internals

function amountPayload(days) {
  return {
    code: 0,
    data: {
      biz_data: [
        {
          days: days.map((day) => ({
            date: day.date,
            data: day.models.map((model) => ({
              model: model.name,
              usage: model.tokens.map((entry) => ({ type: entry.type, amount: String(entry.amount) }))
            }))
          }))
        }
      ]
    }
  }
}

function costPayload(days) {
  return {
    code: 0,
    data: {
      biz_data: [
        {
          days: days.map((day) => ({
            date: day.date,
            data: day.models
              .filter((model) => model.cost != null)
              .map((model) => ({
                model: model.name,
                usage: [{ type: 'COST', amount: String(model.cost) }]
              }))
          }))
        }
      ]
    }
  }
}

// --- normalizer ---------------------------------------------------------
{
  const amount = {
    data: {
      biz_data: {
        days: [
          {
            date: '2026-10-27',
            data: [
              {
                model: 'deepseek-v4-flash',
                usage: [
                  { type: 'PROMPT_CACHE_HIT_TOKEN', amount: '1000' },
                  { type: 'PROMPT_CACHE_MISS_TOKEN', amount: '500' },
                  { type: 'RESPONSE_TOKEN', amount: '250' },
                  { type: 'REQUEST', amount: '3' }
                ]
              },
              {
                model: 'deepseek-v4-pro',
                usage: [
                  { type: 'PROMPT_TOKEN', amount: '10' },
                  { type: 'REQUEST', amount: '1' }
                ]
              }
            ]
          }
        ]
      }
    }
  }
  const cost = {
    data: {
      biz_data: [
        {
          days: [
            {
              date: '2026-10-27',
              data: [
                { model: 'deepseek-v4-flash', usage: [{ type: 'COST', amount: '1.25' }] },
                { model: 'deepseek-v4-pro', usage: [{ type: 'COST', amount: '3.5' }] }
              ]
            }
          ]
        }
      ]
    }
  }
  const usage = normalizeUsage(amount, cost)
  const day = usage.days.get('2026-10-27')
  assert.equal(day.tokens, 1760)
  assert.equal(day.cost, 4.75)
  assert.equal(day.cacheHit, 1000)
  assert.equal(day.cacheMiss, 500)
  assert.equal(day.prompt, 10)
  assert.equal(day.response, 250)
  assert.equal(day.requests, 4)
  assert.equal(day.cacheHitRate, 66.2)
  const flash = usage.models.get('deepseek-v4-flash')
  assert.equal(flash.tokens, 1750)
  assert.equal(flash.requests, 3)
  assert.equal(flash.cacheHitRate, 66.7)
  assert.equal(usage.models.get('deepseek-v4-pro').cost, 3.5)
  assert.equal(usage.models.get('deepseek-v4-pro').requests, 1)
}

// --- demo coherence -----------------------------------------------------
{
  const demo = buildDemoState(new Date(2026, 9, 27, 12, 0, 0))
  const totalCost = demo.usage.series.reduce((sum, day) => sum + day.cost, 0)
  const totalTokens = demo.usage.series.reduce((sum, day) => sum + day.tokens, 0)
  assert.equal(Math.round(totalCost * 100) / 100, 109.73)
  assert.equal(totalTokens, 1_017_000_000)
  assert.equal(demo.usage.today.cost, 1.49)
  assert.equal(demo.usage.today.tokens, 10_964_000)
  assert.equal(demo.usage.dailyAvg, 7.32)
  assert.equal(demo.usage.daysLeft, 19.8)
  assert.equal(demo.usage.avg7, 2.72)
  assert.equal(demo.usage.daysLeft7, 53.3)
  assert.equal(demo.usage.last7Cost, 19.05)
  assert.equal(demo.usage.effectivePrice, 0.1079)
  assert.equal(demo.usage.cacheHitRate, 61.8)
  assert.equal(demo.usage.requests, 1866)
  assert.equal(demo.usage.cacheHitTokens, 439_954_201)
  assert.equal(demo.usage.cacheMissTokens, 271_945_799)
  assert.equal(demo.usage.models[0].cacheHitRate, 61.8)
  assert.equal(demo.usage.models[0].requests, 1725)
  assert.equal(demo.usage.peak.cost, 29.1)
  assert.equal(demo.usage.series[0].date, '2026-09-28')
  assert.equal(demo.usage.series[29].date, '2026-10-27')
  assert.equal(
    Math.round((demo.balance.topup + demo.balance.grant) * 100) / 100,
    demo.balance.total
  )
  assert.equal(
    Math.round(demo.usage.models.reduce((sum, model) => sum + model.cost, 0) * 100) / 100,
    109.73
  )
  assert.equal(
    demo.usage.models.reduce((sum, model) => sum + model.tokens, 0),
    1_017_000_000
  )
}

// --- overview with mocked DeepSeek endpoints ----------------------------
{
  const today = new Date(2026, 9, 27, 12, 0, 0)
  const days = [
    {
      date: '2026-09-01',
      models: [{ name: 'outside-window-model', tokens: [{ type: 'RESPONSE_TOKEN', amount: 9_000_000 }], cost: 99 }]
    },
    {
      date: '2026-09-28',
      models: [
        {
          name: 'deepseek-v4-flash',
          tokens: [{ type: 'PROMPT_CACHE_HIT_TOKEN', amount: 10_000_000 }],
          cost: 2.5
        }
      ]
    },
    { date: '2026-09-29', models: [] },
    {
      date: '2026-09-30',
      models: [
        {
          name: 'deepseek-v4-pro',
          tokens: [{ type: 'RESPONSE_TOKEN', amount: 5_000_000 }],
          cost: 5.86
        }
      ]
    },
    {
      date: '2026-10-01',
      models: []
    },
    {
      date: '2026-10-02',
      models: [
        {
          name: 'deepseek-v4-flash',
          tokens: [
            { type: 'PROMPT_CACHE_MISS_TOKEN', amount: 100_000_000 },
            { type: 'REQUEST', amount: 12 }
          ],
          cost: 29.1
        }
      ]
    },
    {
      date: '2026-10-24',
      models: [
        {
          name: 'deepseek-v4-pro',
          tokens: [{ type: 'RESPONSE_TOKEN', amount: 1_000_000 }],
          cost: 2
        }
      ]
    },
    { date: '2026-10-27', models: [] }
  ]

  const originalFetch = global.fetch
  global.fetch = async (url) => {
    const value = String(url)
    if (value.endsWith('/user/balance')) {
      return {
        ok: true,
        status: 200,
        json: async () => ({
          is_available: true,
          balance_infos: [
            { currency: 'CNY', total_balance: '145.09', granted_balance: '78.57', topped_up_balance: '66.52' }
          ]
        }),
        text: async () => ''
      }
    }
    if (value.includes('/usage/amount')) {
      return { ok: true, status: 200, json: async () => amountPayload(days), text: async () => '' }
    }
    if (value.includes('/usage/cost')) {
      return { ok: true, status: 200, json: async () => costPayload(days), text: async () => '' }
    }
    return { ok: false, status: 404, text: async () => 'not found', json: async () => ({}) }
  }

  try {
    const state = await getOverview({
      apiKey: 'sk-test',
      sessionToken: 'session-test',
      now: today
    })
    assert.equal(state.balance.total, 145.09)
    assert.equal(state.status.api, 'ok')
    assert.equal(state.status.session, 'ok')
    assert.equal(state.errors.length, 0)
    assert.equal(state.usage.series.length, 30)
    assert.equal(state.usage.series[0].date, '2026-09-28')
    assert.equal(state.usage.series[29].date, '2026-10-27')
    assert.equal(state.usage.last30.cost, 39.46)
    assert.equal(state.usage.last30.tokens, 116_000_000)
    assert.equal(state.usage.last30.activeDays, 4)
    assert.equal(state.usage.dailyAvg, 9.87)
    assert.equal(state.usage.daysLeft, 14.7)
    assert.equal(state.usage.last7Cost, 2)
    assert.equal(state.usage.avg7, 0.29)
    assert.equal(state.usage.daysLeft7, 507.8)
    assert.equal(state.usage.effectivePrice, 0.3402)
    assert.equal(state.usage.cacheHitTokens, 10_000_000)
    assert.equal(state.usage.cacheMissTokens, 100_000_000)
    assert.equal(state.usage.cacheHitRate, 9.1)
    assert.equal(state.usage.requests, 12)
    assert.equal(state.usage.last30.requests, 12)
    assert.equal(state.usage.peak.cost, 29.1)
    assert.equal(state.usage.models.length, 2)
    assert.equal(state.usage.models[0].cacheHitRate, 9.1)
    assert.equal(state.usage.models[0].requests, 12)
    assert.ok(!state.usage.models.some((model) => model.name === 'outside-window-model'))
    assert.equal(state.usage.today.cost, 0)
  } finally {
    global.fetch = originalFetch
  }
}

// --- auth error is surfaced, partial state still returned ---------------
{
  const originalFetch = global.fetch
  global.fetch = async (url) => {
    if (String(url).endsWith('/user/balance')) {
      return {
        ok: false,
        status: 401,
        text: async () => JSON.stringify({ message: 'invalid key' }),
        json: async () => ({})
      }
    }
    return {
      ok: false,
      status: 401,
      text: async () => JSON.stringify({ message: 'expired' }),
      json: async () => ({})
    }
  }
  try {
    const state = await getOverview({
      apiKey: 'sk-bad',
      sessionToken: 'bad',
      now: new Date(2026, 9, 27, 12)
    })
    assert.equal(state.balance, null)
    assert.equal(state.usage, null)
    assert.equal(state.status.api, 'error')
    assert.equal(state.status.session, 'error')
    assert.equal(state.errors.length, 2)
    assert.match(state.errors[0].message, /API Key/)
    assert.match(state.errors[1].message, /平台会话/)
  } finally {
    global.fetch = originalFetch
  }
}

console.log('All data-layer checks passed.')
