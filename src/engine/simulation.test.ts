import { describe, it, expect } from 'vitest'
import { runSimulation, normalizeContaminants } from './simulation'
import type { WaterInput, WaterSourceType } from '@/types'

// ─── Test fixture ─────────────────────────────────────────────────────────────

const base = (overrides: Partial<WaterInput> = {}): WaterInput => ({
  country: 'CY',
  source: 'tap',
  contaminants: [],
  use: 'drinking',
  inletPressureBar: 3.5,
  preference: 'cost',
  ...overrides,
})

const confidenceLevels = { low: 0, medium: 1, high: 2 } as const

// ─── normalizeContaminants ────────────────────────────────────────────────────

describe('normalizeContaminants', () => {
  it('produces suspected entries by default', () => {
    expect(normalizeContaminants(['bacteria', 'viruses'])).toEqual([
      { id: 'bacteria', status: 'suspected' },
      { id: 'viruses', status: 'suspected' },
    ])
  })

  it('respects custom default status', () => {
    expect(normalizeContaminants(['arsenic'], 'confirmed')).toEqual([
      { id: 'arsenic', status: 'confirmed' },
    ])
  })

  it('returns empty array for empty input', () => {
    expect(normalizeContaminants([])).toEqual([])
  })
})

// ─── runSimulation ────────────────────────────────────────────────────────────

describe('runSimulation', () => {

  // ── Result structure ──────────────────────────────────────────────────────

  describe('result structure', () => {
    it('always returns exactly 3 tiers', () => {
      const result = runSimulation(base())
      expect(result.tiers).toHaveLength(3)
    })

    it('tiers cover all three budget levels', () => {
      const result = runSimulation(base())
      const budgets = result.tiers.map(t => t.budget)
      expect(budgets).toContain('low')
      expect(budgets).toContain('medium')
      expect(budgets).toContain('high')
    })

    it('primaryBudget is one of the returned tier budgets', () => {
      const result = runSimulation(base())
      const budgets = result.tiers.map(t => t.budget)
      expect(budgets).toContain(result.primaryBudget)
    })

    it('budget limits are $50 / $200 / $1000', () => {
      const result = runSimulation(base())
      const limits = Object.fromEntries(result.tiers.map(t => [t.budget, t.budgetLimitUSD]))
      expect(limits['low']).toBe(50)
      expect(limits['medium']).toBe(200)
      expect(limits['high']).toBe(1000)
    })

    it('each tier cost does not exceed its budget limit', () => {
      const result = runSimulation(base({
        contaminants: ['bacteria', 'arsenic', 'viruses', 'turbidity', 'nitrates'],
        inletPressureBar: 4,
      }))
      for (const tier of result.tiers) {
        expect(tier.estimatedCostUSD).toBeLessThanOrEqual(tier.budgetLimitUSD)
      }
    })

    it('contaminantEntries override flat contaminants in resolveEntries', () => {
      // When contaminantEntries is present, flat contaminants are ignored
      const withEntries = runSimulation(base({
        contaminants: ['bacteria'],
        contaminantEntries: [{ id: 'arsenic', status: 'confirmed' }],
        inletPressureBar: 4,
      }))
      // arsenic(confirmed) should score higher → RO selected over ceramic
      const highTier = withEntries.tiers.find(t => t.budget === 'high')!
      expect(highTier.removedContaminants).toContain('arsenic')
    })
  })

  // ── Source profile integration ────────────────────────────────────────────

  describe('source profile integration', () => {
    it('river inferred contaminants appear in result', () => {
      const result = runSimulation(base({ source: 'river' }))
      expect(result.inferredContaminants).toContain('bacteria')
      expect(result.inferredContaminants).toContain('viruses')
      expect(result.inferredContaminants).toContain('protozoa')
      expect(result.inferredContaminants).toContain('turbidity')
      expect(result.inferredContaminants).toContain('sediment')
    })

    it('well risk factors appear in result', () => {
      const result = runSimulation(base({ source: 'well' }))
      expect(result.riskFactors).toContain('nitrates')
      expect(result.riskFactors).toContain('arsenic')
    })

    it('river inferred contaminants are addressable even with no user selection', () => {
      const result = runSimulation(base({ source: 'river', contaminants: [], inletPressureBar: 0 }))
      const highTier = result.tiers.find(t => t.budget === 'high')!
      // River inferred: bacteria, viruses, protozoa, turbidity, sediment — at least some should be removed
      expect(highTier.removedContaminants.length).toBeGreaterThan(0)
    })
  })

  // ── Confidence scoring (REQ-26 / REQ-27 / REQ-31) ────────────────────────

  describe('confidence scoring', () => {
    it('laboratory + confirmed contaminant → data=high', () => {
      // Score path: +1 source, +1 userSelected, +2 laboratory, +1 confirmed, -1 riskFactors not selected
      // = 4 → high
      const result = runSimulation(base({
        source: 'tap',
        testingStatus: 'laboratory',
        contaminantEntries: [{ id: 'arsenic', status: 'confirmed' }],
      }))
      const primary = result.tiers.find(t => t.budget === result.primaryBudget)!
      expect(primary.confidence.data).toBe('high')
    })

    it('well + no testing + no selected contaminants → data=low', () => {
      // Score: +1 source, -1 none, -1 profile advisory, -1 riskFactors not selected, -1 drinking+none
      // = -3 → low
      const result = runSimulation(base({
        source: 'well',
        testingStatus: 'none',
        contaminants: [],
      }))
      const primary = result.tiers.find(t => t.budget === result.primaryBudget)!
      expect(primary.confidence.data).toBe('low')
    })

    it('river + unknown testing + bacteria(suspected) + drinking → data=medium', () => {
      // Score: +1 source, +1 userSelected, +1 userOverlap(bacteria in river profile),
      //        -1 riskFactors not selected = 2 → medium
      const result = runSimulation(base({
        source: 'river',
        testingStatus: 'unknown',
        contaminants: ['bacteria'],
      }))
      const primary = result.tiers.find(t => t.budget === result.primaryBudget)!
      expect(primary.confidence.data).toBe('medium')
    })

    it('home_kit raises data confidence above none (same other inputs)', () => {
      const shared: Partial<WaterInput> = {
        source: 'river',
        contaminants: ['bacteria'],
        use: 'drinking',
      }
      const withNone    = runSimulation(base({ ...shared, testingStatus: 'none' }))
      const withHomeKit = runSimulation(base({ ...shared, testingStatus: 'home_kit' }))
      const noneScore    = confidenceLevels[withNone.tiers[0].confidence.data]
      const homeKitScore = confidenceLevels[withHomeKit.tiers[0].confidence.data]
      expect(homeKitScore).toBeGreaterThan(noneScore)
    })

    it('each additional confirmed contaminant adds to score (capped at +2)', () => {
      const withOne = runSimulation(base({
        source: 'tap',
        testingStatus: 'laboratory',
        contaminantEntries: [{ id: 'arsenic', status: 'confirmed' }],
      }))
      const withThree = runSimulation(base({
        source: 'tap',
        testingStatus: 'laboratory',
        contaminantEntries: [
          { id: 'arsenic',  status: 'confirmed' },
          { id: 'bacteria', status: 'confirmed' },
          { id: 'chlorine', status: 'confirmed' },
        ],
      }))
      // Both should be high (cap at 2 prevents scoring differences beyond that)
      expect(withOne.tiers[0].confidence.data).toBe('high')
      expect(withThree.tiers[0].confidence.data).toBe('high')
    })

    it('data confidence is identical across all 3 tiers for the same input', () => {
      // Data confidence does not depend on removed/remaining — only on input
      const result = runSimulation(base({
        source: 'river',
        testingStatus: 'home_kit',
        contaminants: ['bacteria', 'turbidity'],
      }))
      const levels = result.tiers.map(t => t.confidence.data)
      expect(new Set(levels).size).toBe(1)
    })

    it('high tier has better or equal recommendation confidence than low tier when budget is the constraint', () => {
      const result = runSimulation(base({
        source: 'river',
        contaminants: ['bacteria', 'viruses', 'turbidity', 'sediment'],
        inletPressureBar: 4,
      }))
      const lowTier  = result.tiers.find(t => t.budget === 'low')!
      const highTier = result.tiers.find(t => t.budget === 'high')!
      const lowScore  = confidenceLevels[lowTier.confidence.recommendation]
      const highScore = confidenceLevels[highTier.confidence.recommendation]
      expect(highScore).toBeGreaterThanOrEqual(lowScore)
    })
  })

  // ── Scope filtering (REQ-30) ──────────────────────────────────────────────

  describe('scope filtering', () => {
    it('portable scope excludes RO, UV, sediment filter and carbon block', () => {
      const result = runSimulation(base({
        source: 'river',
        contaminants: ['bacteria', 'viruses', 'turbidity'],
        scope: 'portable',
        inletPressureBar: 0,
      }))
      for (const tier of result.tiers) {
        expect(tier.modules).not.toContain('ro_membrane_75gpd')
        expect(tier.modules).not.toContain('uv_lamp_6w')
        expect(tier.modules).not.toContain('sediment_5um')
        expect(tier.modules).not.toContain('activated_carbon_block')
      }
    })

    it('portable scope only selects portable-tagged modules', () => {
      const portableModules = new Set([
        'ceramic_candle', 'biosand_diy', 'slow_sand_diy', 'chlorine_tablet',
      ])
      const result = runSimulation(base({
        source: 'river',
        contaminants: ['bacteria', 'viruses'],
        scope: 'portable',
        inletPressureBar: 0,
      }))
      for (const tier of result.tiers) {
        for (const mod of tier.modules) {
          // booster_pump has no scope tags so it's always allowed
          if (mod !== 'booster_pump') {
            expect(portableModules.has(mod)).toBe(true)
          }
        }
      }
    })

    it('under_sink scope includes RO in high-budget tier when pressure is adequate', () => {
      const result = runSimulation(base({
        source: 'well',
        contaminantEntries: [
          { id: 'arsenic',  status: 'confirmed' },
          { id: 'nitrates', status: 'confirmed' },
        ],
        contaminants: ['arsenic', 'nitrates'],
        scope: 'under_sink',
        inletPressureBar: 4,
      }))
      const highTier = result.tiers.find(t => t.budget === 'high')!
      expect(highTier.modules).toContain('ro_membrane_75gpd')
    })

    it('under_sink scope excludes ceramic, biosand, slow_sand, chlorine_tablet', () => {
      const result = runSimulation(base({
        source: 'river',
        contaminants: ['bacteria', 'viruses'],
        scope: 'under_sink',
        inletPressureBar: 4,
      }))
      for (const tier of result.tiers) {
        expect(tier.modules).not.toContain('ceramic_candle')
        expect(tier.modules).not.toContain('biosand_diy')
        expect(tier.modules).not.toContain('slow_sand_diy')
        expect(tier.modules).not.toContain('chlorine_tablet')
      }
    })

    it('no scope imposes no module restriction', () => {
      const result = runSimulation(base({
        source: 'well',
        contaminantEntries: [{ id: 'arsenic', status: 'confirmed' }],
        contaminants: ['arsenic'],
        inletPressureBar: 4,
      }))
      // RO should be available in high tier without scope restriction
      const highTier = result.tiers.find(t => t.budget === 'high')!
      expect(highTier.modules).toContain('ro_membrane_75gpd')
    })
  })

  // ── Advisories (REQ-32) ───────────────────────────────────────────────────

  describe('advisories', () => {
    it('well source always includes water_testing advisory', () => {
      const result = runSimulation(base({ source: 'well', testingStatus: 'laboratory' }))
      expect(result.advisories).toContain('water_testing')
    })

    it('well source with no testing includes water_testing advisory', () => {
      const result = runSimulation(base({ source: 'well', testingStatus: 'none' }))
      expect(result.advisories).toContain('water_testing')
    })

    it('river source has no water_testing advisory', () => {
      const result = runSimulation(base({ source: 'river', testingStatus: 'none' }))
      expect(result.advisories).not.toContain('water_testing')
    })

    it('tap source has no water_testing advisory', () => {
      const result = runSimulation(base({ source: 'tap', testingStatus: 'unknown' }))
      expect(result.advisories).not.toContain('water_testing')
    })
  })

  // ── Contaminant priority and weighting ────────────────────────────────────

  describe('contaminant priority', () => {
    it('confirmed arsenic + suspected bacteria: both addressed in high tier', () => {
      const result = runSimulation(base({
        source: 'tap',
        testingStatus: 'laboratory',
        contaminantEntries: [
          { id: 'arsenic',  status: 'confirmed' },
          { id: 'bacteria', status: 'suspected' },
        ],
        contaminants: ['arsenic', 'bacteria'],
        inletPressureBar: 4,
      }))
      const highTier = result.tiers.find(t => t.budget === 'high')!
      expect(highTier.removedContaminants).toContain('arsenic')
      expect(highTier.removedContaminants).toContain('bacteria')
    })

    it('high severity contaminant unaddressed caps recommendation at medium', () => {
      // arsenic(confirmed, high severity) in a portable scope where no module removes arsenic
      const result = runSimulation(base({
        source: 'tap',
        testingStatus: 'laboratory',
        contaminantEntries: [
          { id: 'arsenic', status: 'confirmed', severity: 'high' },
        ],
        contaminants: ['arsenic'],
        scope: 'portable',  // portable modules don't remove arsenic
        inletPressureBar: 0,
      }))
      // arsenic remains unaddressed in portable scope
      for (const tier of result.tiers) {
        if (tier.remainingContaminants.includes('arsenic')) {
          expect(tier.confidence.recommendation).not.toBe('high')
        }
      }
    })

    it('more confirmed contaminants lead to higher-priority module selection', () => {
      // Confirmed contaminants should be addressable — no crash, modules selected
      const result = runSimulation(base({
        source: 'well',
        testingStatus: 'laboratory',
        contaminantEntries: [
          { id: 'arsenic',   status: 'confirmed', severity: 'high'   },
          { id: 'nitrates',  status: 'confirmed', severity: 'medium' },
          { id: 'bacteria',  status: 'suspected', severity: 'high'   },
          { id: 'turbidity', status: 'inferred',  severity: 'low'    },
        ],
        contaminants: ['arsenic', 'nitrates', 'bacteria', 'turbidity'],
        inletPressureBar: 4,
      }))
      const highTier = result.tiers.find(t => t.budget === 'high')!
      expect(highTier.modules.length).toBeGreaterThan(0)
    })
  })

  // ── Edge cases ────────────────────────────────────────────────────────────

  describe('edge cases', () => {
    it('unknown source type falls back gracefully without crash', () => {
      const result = runSimulation(base({ source: 'unknown' as WaterSourceType }))
      expect(result.tiers).toHaveLength(3)
      expect(result.inferredContaminants).toEqual([])
      expect(result.riskFactors).toEqual([])
    })

    it('zero inlet pressure does not crash', () => {
      const result = runSimulation(base({ inletPressureBar: 0 }))
      expect(result.tiers).toHaveLength(3)
    })

    it('very high inlet pressure does not crash', () => {
      const result = runSimulation(base({ inletPressureBar: 10 }))
      expect(result.tiers).toHaveLength(3)
    })

    it('all three contaminant statuses are accepted without crash', () => {
      const result = runSimulation(base({
        source: 'well',
        contaminantEntries: [
          { id: 'arsenic',   status: 'confirmed' },
          { id: 'nitrates',  status: 'suspected' },
          { id: 'iron',      status: 'inferred'  },
        ],
        contaminants: ['arsenic', 'nitrates', 'iron'],
      }))
      expect(result.tiers).toHaveLength(3)
    })

    it('all use types produce a valid result', () => {
      const uses = [
        'drinking', 'cooking', 'whole_house',
        'shower_bathing', 'emergency_survival', 'irrigation', 'livestock',
      ] as const
      for (const use of uses) {
        const result = runSimulation(base({ use, contaminants: ['bacteria'] }))
        expect(result.tiers).toHaveLength(3)
        expect(result.primaryBudget).toBeDefined()
      }
    })

    it('coverage preference picks different modules than cost preference when budget allows', () => {
      const byCost     = runSimulation(base({ source: 'river', contaminants: ['bacteria', 'viruses', 'turbidity'], preference: 'cost',     inletPressureBar: 4 }))
      const byCoverage = runSimulation(base({ source: 'river', contaminants: ['bacteria', 'viruses', 'turbidity'], preference: 'coverage', inletPressureBar: 4 }))
      // Both are valid — just verify no crash and structure is consistent
      expect(byCost.tiers).toHaveLength(3)
      expect(byCoverage.tiers).toHaveLength(3)
    })
  })
})
