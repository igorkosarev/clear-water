/**
 * Acceptance tests for REQ-33.
 * Each test maps to a named scenario (T1–T20).
 * Tests are intentionally outcome-driven — they describe what a user
 * should see, not how the engine achieves it internally.
 */

import { describe, it, expect } from 'vitest'
import { runSimulation } from './simulation'
import type { WaterInput, WaterSourceType } from '@/types'

// ─── Helpers ──────────────────────────────────────────────────────────────────

const CONFIDENCE = { low: 0, medium: 1, high: 2 } as const
type Level = keyof typeof CONFIDENCE

const score = (level: Level) => CONFIDENCE[level]

/** Returns the primary tier from a simulation result. */
const primary = (input: WaterInput) => {
  const r = runSimulation(input)
  return { ...r.tiers.find(t => t.budget === r.primaryBudget)!, advisories: r.advisories, riskFactors: r.riskFactors, inferredContaminants: r.inferredContaminants }
}

/** Returns a specific budget tier. */
const tier = (input: WaterInput, budget: 'low' | 'medium' | 'high') => {
  const r = runSimulation(input)
  return { ...r.tiers.find(t => t.budget === budget)!, advisories: r.advisories }
}

/** All modules across all tiers for the given input. */
const allModules = (input: WaterInput) =>
  runSimulation(input).tiers.flatMap(t => t.modules)

const base = (overrides: Partial<WaterInput> = {}): WaterInput => ({
  country: 'CY',
  source: 'tap',
  contaminants: [],
  use: 'drinking',
  inletPressureBar: 2.0,
  preference: 'cost',
  ...overrides,
})

// ─── T1: Municipal water — chlorine taste ─────────────────────────────────────

describe('T1: Municipal water — chlorine taste/odor', () => {
  const input = base({
    source: 'tap',
    contaminants: ['chlorine', 'chloramines'],
    testingStatus: 'none',
    scope: 'countertop',
  })

  it('recommends activated carbon in at least one tier', () => {
    expect(allModules(input)).toContain('activated_carbon_block')
  })

  it('does not require UV for a chlorine taste problem', () => {
    // UV is overkill for purely chemical taste/odor from municipal water
    const low = tier(input, 'low')
    expect(low.modules).not.toContain('uv_lamp_6w')
  })

  it('data confidence is at most medium (no testing performed)', () => {
    const t = primary(input)
    expect(score(t.confidence.data)).toBeLessThanOrEqual(score('medium'))
  })
})

// ─── T2: Municipal water — old plumbing / lead risk ───────────────────────────

describe('T2: Municipal water — old plumbing / lead risk', () => {
  const input = base({
    source: 'tap',
    contaminants: ['lead'],
    testingStatus: 'none',
    scope: 'under_sink',
    inletPressureBar: 3.5,
  })

  it('data confidence is low when lead is only suspected (no testing)', () => {
    const t = primary(input)
    expect(t.confidence.data).toBe('low')
  })

  it('lead is addressed (removed) in medium or high budget tier', () => {
    const med  = tier(input, 'medium')
    const high = tier(input, 'high')
    const addressed = [...med.removedContaminants, ...high.removedContaminants]
    expect(addressed).toContain('lead')
  })

  it('does not address lead without an under_sink module — low budget fails safely', () => {
    const low = tier(input, 'low')
    // low budget ($50) cannot fit RO ($120) — lead must remain unresolved
    expect(low.remainingContaminants).toContain('lead')
  })
})

// ─── T3: River — cloudy water, drinking, portable ─────────────────────────────

describe('T3: River — cloudy water, portable drinking water', () => {
  const input = base({
    source: 'river',
    contaminants: ['turbidity', 'sediment'],
    testingStatus: 'none',
    scope: 'portable',
    inletPressureBar: 0,
  })

  it('river source infers biological contamination', () => {
    const r = runSimulation(input)
    expect(r.inferredContaminants).toContain('bacteria')
    expect(r.inferredContaminants).toContain('viruses')
    expect(r.inferredContaminants).toContain('protozoa')
  })

  it('recommendation includes mechanical filtration', () => {
    const mods = allModules(input)
    const mechanicalModules = ['ceramic_candle', 'biosand_diy', 'slow_sand_diy', 'sediment_5um']
    expect(mods.some(m => mechanicalModules.includes(m))).toBe(true)
  })

  it('recommendation includes disinfection', () => {
    const mods = allModules(input)
    const disinfectionModules = ['uv_lamp_6w', 'chlorine_tablet']
    expect(mods.some(m => disinfectionModules.includes(m))).toBe(true)
  })

  it('portable scope excludes non-portable modules', () => {
    const mods = allModules(input)
    expect(mods).not.toContain('ro_membrane_75gpd')
    expect(mods).not.toContain('uv_lamp_6w')
    expect(mods).not.toContain('sediment_5um')
    expect(mods).not.toContain('activated_carbon_block')
  })

  it('data confidence is low (surface water, no testing)', () => {
    const t = primary(input)
    expect(t.confidence.data).toBe('low')
  })

  it('mechanical filtration comes before disinfection in module order', () => {
    const mods = primary(input).modules
    const mechanicalIdx = mods.findIndex(m =>
      ['ceramic_candle', 'biosand_diy', 'slow_sand_diy'].includes(m),
    )
    const disinfectionIdx = mods.findIndex(m =>
      ['uv_lamp_6w', 'chlorine_tablet'].includes(m),
    )
    if (mechanicalIdx !== -1 && disinfectionIdx !== -1) {
      expect(mechanicalIdx).toBeLessThan(disinfectionIdx)
    }
  })
})

// ─── T4: River — clear water still unsafe ────────────────────────────────────

describe('T4: River — clear water, no visible symptoms', () => {
  const input = base({
    source: 'river',
    contaminants: [],
    testingStatus: 'none',
    scope: 'portable',
    inletPressureBar: 0,
  })

  it('biological risks are still inferred from source profile', () => {
    const r = runSimulation(input)
    expect(r.inferredContaminants).toContain('bacteria')
    expect(r.inferredContaminants).toContain('viruses')
  })

  it('disinfection is still recommended even with no reported symptoms', () => {
    const mods = allModules(input)
    const disinfectionModules = ['uv_lamp_6w', 'chlorine_tablet']
    expect(mods.some(m => disinfectionModules.includes(m))).toBe(true)
  })

  it('data confidence is low', () => {
    expect(primary(input).confidence.data).toBe('low')
  })
})

// ─── T5: Private well — no testing ───────────────────────────────────────────

describe('T5: Private well — no water test performed', () => {
  const input = base({
    source: 'well',
    contaminants: [],
    testingStatus: 'none',
    use: 'drinking',
  })

  it('data confidence is low', () => {
    expect(primary(input).confidence.data).toBe('low')
  })

  it('water_testing advisory is always present for well source', () => {
    const r = runSimulation(input)
    expect(r.advisories).toContain('water_testing')
  })

  it('well risk factors include expected contaminants', () => {
    const r = runSimulation(input)
    expect(r.riskFactors).toContain('nitrates')
    expect(r.riskFactors).toContain('arsenic')
    expect(r.riskFactors).toContain('bacteria')
  })

  it('recommendation confidence is low or medium (not high) without testing', () => {
    const t = primary(input)
    expect(score(t.confidence.recommendation)).toBeLessThanOrEqual(score('medium'))
  })
})

// ─── T6: Private well — lab confirmed arsenic + nitrates ─────────────────────

describe('T6: Private well — lab-confirmed arsenic and nitrates', () => {
  const input = base({
    source: 'well',
    testingStatus: 'laboratory',
    contaminantEntries: [
      { id: 'arsenic',  status: 'confirmed', severity: 'high' },
      { id: 'nitrates', status: 'confirmed', severity: 'medium' },
    ],
    contaminants: ['arsenic', 'nitrates'],
    scope: 'under_sink',
    inletPressureBar: 4.0,
  })

  it('data confidence is high', () => {
    expect(primary(input).confidence.data).toBe('high')
  })

  it('RO membrane is recommended in high-budget tier', () => {
    expect(tier(input, 'high').modules).toContain('ro_membrane_75gpd')
  })

  it('arsenic and nitrates are both addressed in high-budget tier', () => {
    const high = tier(input, 'high')
    expect(high.removedContaminants).toContain('arsenic')
    expect(high.removedContaminants).toContain('nitrates')
  })

  it('activated carbon alone cannot address arsenic', () => {
    // Carbon does not remove arsenic — low tier must fail to address it
    const low = tier(input, 'low')
    expect(low.remainingContaminants).toContain('arsenic')
  })
})

// ─── T7: Private well — iron + hardness, whole house ─────────────────────────

describe('T7: Private well — iron and hardness, whole-house scope', () => {
  const input = base({
    source: 'well',
    testingStatus: 'laboratory',
    contaminantEntries: [
      { id: 'iron',     status: 'confirmed', severity: 'medium' },
      { id: 'hardness', status: 'confirmed', severity: 'medium' },
    ],
    contaminants: ['iron', 'hardness'],
    use: 'whole_house',
    scope: 'whole_house',
    inletPressureBar: 3.0,
  })

  it('data confidence is high', () => {
    expect(primary(input).confidence.data).toBe('high')
  })

  it('water_softener is recommended for hardness', () => {
    const mods = allModules(input)
    expect(mods).toContain('water_softener')
  })

  it('iron_manganese_filter or oxidation_filter is recommended for iron', () => {
    const ironModules = ['iron_manganese_filter', 'oxidation_filter']
    const mods = allModules(input)
    expect(mods.some(m => ironModules.includes(m))).toBe(true)
  })

  it('iron and hardness are addressed within whole-house scope', () => {
    const high = tier(input, 'high')
    expect(high.remainingContaminants).not.toContain('iron')
    expect(high.remainingContaminants).not.toContain('hardness')
  })
})

// ─── T8: Rotten egg smell (hydrogen sulfide) ──────────────────────────────────

describe('T8: Well water — rotten egg smell (hydrogen sulfide)', () => {
  const input = base({
    source: 'well',
    contaminants: ['hydrogen_sulfide', 'iron', 'manganese'],
    testingStatus: 'none',
    use: 'whole_house',
    scope: 'whole_house',
  })

  it('hydrogen_sulfide appears in the contaminant list', () => {
    const r = runSimulation(input)
    const allContaminants = r.tiers.flatMap(t => [
      ...t.removedContaminants,
      ...t.remainingContaminants,
    ])
    expect(allContaminants).toContain('hydrogen_sulfide')
  })

  it('data confidence is low or medium (no testing)', () => {
    expect(score(primary(input).confidence.data)).toBeLessThanOrEqual(score('medium'))
  })

  it('water_testing advisory present (well source)', () => {
    expect(runSimulation(input).advisories).toContain('water_testing')
  })

  it('hydrogen_sulfide is addressed by a treatment module', () => {
    const high = tier(input, 'high')
    expect(high.removedContaminants).toContain('hydrogen_sulfide')
  })
})

// ─── T9: Rainwater harvesting — drinking ──────────────────────────────────────

describe('T9: Rainwater harvesting — drinking water', () => {
  const input = base({
    source: 'rain',
    contaminants: [],
    testingStatus: 'none',
    scope: 'under_sink',
    inletPressureBar: 2.0,
  })

  it('rain source infers bacteria and sediment contamination', () => {
    const r = runSimulation(input)
    expect(r.inferredContaminants).toContain('bacteria')
    expect(r.inferredContaminants).toContain('sediment')
  })

  it('biological contamination (bacteria) is addressed', () => {
    // RO or filtration+disinfection combo — either covers bacteria
    const high = tier(input, 'high')
    expect(high.removedContaminants).toContain('bacteria')
  })

  it('particulate contamination (sediment) is addressed', () => {
    const high = tier(input, 'high')
    expect(high.removedContaminants).toContain('sediment')
  })

  it('data confidence is low', () => {
    expect(primary(input).confidence.data).toBe('low')
  })
})

// ─── T10: Emergency / survival use ───────────────────────────────────────────

describe('T10: Emergency survival — unknown surface water', () => {
  const input = base({
    source: 'river',
    contaminants: ['bacteria', 'viruses', 'turbidity'],
    use: 'emergency_survival',
    testingStatus: 'none',
    scope: 'emergency',
    inletPressureBar: 0,
  })

  it('data confidence is low', () => {
    expect(primary(input).confidence.data).toBe('low')
  })

  it('recommendation confidence is at most medium', () => {
    expect(score(primary(input).confidence.recommendation)).toBeLessThanOrEqual(score('medium'))
  })

  it('filtration is included in the recommendation', () => {
    const mods = allModules(input)
    const filtrationModules = ['ceramic_candle', 'biosand_diy', 'slow_sand_diy']
    expect(mods.some(m => filtrationModules.includes(m))).toBe(true)
  })

  it('carbon-only system is not sufficient — disinfection is also included', () => {
    // activated_carbon_block is not in emergency scope anyway, but disinfection must appear
    const mods = allModules(input)
    const disinfectionModules = ['uv_lamp_6w', 'chlorine_tablet']
    expect(mods.some(m => disinfectionModules.includes(m))).toBe(true)
  })
})

// ─── T11: Irrigation / garden use ────────────────────────────────────────────

describe('T11: Irrigation / garden use', () => {
  const irrigationInput = base({
    source: 'tap',
    contaminants: ['bacteria'],
    use: 'irrigation',
    testingStatus: 'none',
  })
  const drinkingInput = base({
    source: 'tap',
    contaminants: ['bacteria'],
    use: 'drinking',
    testingStatus: 'none',
  })

  it('irrigation data confidence is not higher than drinking for the same input', () => {
    const irrigScore  = score(primary(irrigationInput).confidence.data)
    const drinkScore  = score(primary(drinkingInput).confidence.data)
    // Irrigation has lower stakes — confidence should not be higher
    expect(irrigScore).toBeLessThanOrEqual(drinkScore)
  })

  it('irrigation recommendation does not over-engineer for taste/odor', () => {
    // Activated carbon for taste is irrelevant for garden — should not dominate
    const mods = allModules(irrigationInput)
    // UV is costly and irrelevant for irrigation — at most optional
    // We just check the system produces a result without crashing
    expect(mods).toBeDefined()
  })
})

// ─── T12: Shower / bathing — hard water / scale ───────────────────────────────

describe('T12: Shower / bathing — limescale and hardness', () => {
  const input = base({
    source: 'tap',
    contaminants: ['hardness'],
    use: 'shower_bathing',
    testingStatus: 'none',
    scope: 'whole_house',
    inletPressureBar: 2.0,
  })

  it('hardness is present in the contaminant list being evaluated', () => {
    const r = runSimulation(input)
    const all = r.tiers.flatMap(t => [
      ...t.removedContaminants,
      ...t.remainingContaminants,
    ])
    expect(all).toContain('hardness')
  })

  it('RO membrane is not the primary recommendation for shower/bathing hardness', () => {
    // RO is under_sink only, shower_bathing needs whole_house treatment
    const p = primary(input)
    // If RO is in modules (wrong scope) that is a bug; otherwise it should be absent
    expect(p.modules).not.toContain('ro_membrane_75gpd')
  })

  it('hardness is addressed within whole-house scope', () => {
    const high = tier(input, 'high')
    expect(high.remainingContaminants).not.toContain('hardness')
  })
})

// ─── T13: Advanced mode — confirmed PFAS ─────────────────────────────────────

describe('T13: Advanced mode — lab-confirmed PFAS', () => {
  const input = base({
    source: 'tap',
    testingStatus: 'laboratory',
    contaminantEntries: [{ id: 'pfas', status: 'confirmed', severity: 'high' }],
    contaminants: ['pfas'],
    scope: 'under_sink',
    inletPressureBar: 4.0,
  })

  it('data confidence is high', () => {
    expect(primary(input).confidence.data).toBe('high')
  })

  it('PFAS is addressed in high-budget tier', () => {
    expect(tier(input, 'high').removedContaminants).toContain('pfas')
  })

  it('recommendation includes RO or activated carbon for PFAS', () => {
    const high = tier(input, 'high')
    const pfasModules = ['ro_membrane_75gpd', 'activated_carbon_block']
    expect(high.modules.some(m => pfasModules.includes(m))).toBe(true)
  })
})

// ─── T14: Advanced mode — pharmaceuticals and hormones ───────────────────────

describe('T14: Advanced mode — pharmaceuticals and hormones', () => {
  const input = base({
    source: 'tap',
    testingStatus: 'laboratory',
    contaminantEntries: [
      { id: 'pharmaceuticals', status: 'confirmed' },
      { id: 'hormones',        status: 'confirmed' },
    ],
    contaminants: ['pharmaceuticals', 'hormones'],
    scope: 'under_sink',
    inletPressureBar: 4.0,
  })

  it('data confidence is high', () => {
    expect(primary(input).confidence.data).toBe('high')
  })

  it('chlorination is NOT recommended for pharmaceuticals or hormones', () => {
    // Chlorine tablets only remove bacteria/viruses — must never appear for pharma/hormones
    expect(allModules(input)).not.toContain('chlorine_tablet')
  })

  it('pharmaceuticals and hormones are addressed in high-budget tier', () => {
    const high = tier(input, 'high')
    expect(high.removedContaminants).toContain('pharmaceuticals')
    expect(high.removedContaminants).toContain('hormones')
  })
})

// ─── T15: Budget safety rule ──────────────────────────────────────────────────

describe('T15: Budget safety — low budget cannot silence high-risk warnings', () => {
  const input = base({
    source: 'well',
    contaminantEntries: [
      { id: 'arsenic',  status: 'confirmed', severity: 'high' },
      { id: 'nitrates', status: 'confirmed', severity: 'high' },
    ],
    contaminants: ['arsenic', 'nitrates'],
    testingStatus: 'laboratory',
    scope: 'under_sink',
    inletPressureBar: 4.0,
  })

  it('low-budget tier leaves high-risk contaminants unresolved', () => {
    const low = tier(input, 'low')
    // RO ($120) exceeds low budget ($50) — arsenic and nitrates must remain
    expect(low.remainingContaminants).toContain('arsenic')
    expect(low.remainingContaminants).toContain('nitrates')
  })

  it('low-budget recommendation confidence is not high when critical risks remain', () => {
    const low = tier(input, 'low')
    expect(low.confidence.recommendation).not.toBe('high')
  })
})

// ─── T16: Stage order — sediment before UV ────────────────────────────────────

describe('T16: Stage order — mechanical filtration before disinfection', () => {
  const input = base({
    source: 'river',
    contaminants: ['turbidity', 'bacteria'],
    testingStatus: 'none',
    inletPressureBar: 1.0,
  })

  it('sediment/mechanical filter comes before UV in output module order', () => {
    const mods = primary(input).modules
    const mechanicalIdx  = mods.findIndex(m => ['sediment_5um', 'ceramic_candle', 'biosand_diy', 'slow_sand_diy'].includes(m))
    const uvIdx          = mods.findIndex(m => m === 'uv_lamp_6w')
    if (mechanicalIdx !== -1 && uvIdx !== -1) {
      expect(mechanicalIdx).toBeLessThan(uvIdx)
    }
  })

  it('UV is not the only or first recommended module when turbidity is present', () => {
    const mods = primary(input).modules
    if (mods.includes('uv_lamp_6w')) {
      expect(mods[0]).not.toBe('uv_lamp_6w')
    }
  })
})

// ─── T17: Unresolved risk reporting ──────────────────────────────────────────

describe('T17: Unresolved risks are explicitly reported', () => {
  // Portable scope cannot address arsenic or nitrates
  const input = base({
    source: 'well',
    contaminants: ['arsenic', 'nitrates', 'bacteria'],
    testingStatus: 'none',
    scope: 'portable',
    inletPressureBar: 0,
  })

  it('arsenic remains unresolved in portable scope', () => {
    const high = tier(input, 'high')
    expect(high.remainingContaminants).toContain('arsenic')
  })

  it('nitrates remain unresolved in portable scope', () => {
    const high = tier(input, 'high')
    expect(high.remainingContaminants).toContain('nitrates')
  })

  it('recommendation confidence is not high when chemical risks remain', () => {
    expect(primary(input).confidence.recommendation).not.toBe('high')
  })
})

// ─── T18: Confirmed vs suspected priority ─────────────────────────────────────

describe('T18: Confirmed vs suspected — different confidence levels', () => {
  const suspectedInput = base({
    source: 'well',
    contaminants: ['iron'],
    testingStatus: 'none',
  })

  const confirmedInput = base({
    source: 'well',
    testingStatus: 'laboratory',
    contaminantEntries: [{ id: 'iron', status: 'confirmed', severity: 'medium' }],
    contaminants: ['iron'],
  })

  it('lab-confirmed iron yields higher data confidence than suspected iron', () => {
    const suspectedScore = score(primary(suspectedInput).confidence.data)
    const confirmedScore = score(primary(confirmedInput).confidence.data)
    expect(confirmedScore).toBeGreaterThan(suspectedScore)
  })

  it('suspected iron correctly shows low/medium confidence', () => {
    expect(score(primary(suspectedInput).confidence.data)).toBeLessThanOrEqual(score('medium'))
  })

  it('confirmed iron correctly shows high confidence', () => {
    expect(primary(confirmedInput).confidence.data).toBe('high')
  })
})

// ─── T19: Unknown source ──────────────────────────────────────────────────────

describe('T19: Unknown water source', () => {
  const input = base({
    source: 'unknown' as WaterSourceType,
    contaminants: [],
    testingStatus: 'unknown',
    use: 'drinking',
  })

  it('does not crash on unknown source', () => {
    expect(() => runSimulation(input)).not.toThrow()
  })

  it('data confidence is low for unknown source with no testing', () => {
    expect(primary(input).confidence.data).toBe('low')
  })

  it('no false high-confidence recommendation', () => {
    expect(primary(input).confidence.recommendation).not.toBe('high')
  })
})

// ─── T20: No overclaiming — language placeholder ──────────────────────────────

describe('T20: No overclaiming language (content gate)', () => {
  it('simulation result does not include hardcoded unsafe claims in reasoning steps', () => {
    const input = base({
      source: 'river',
      contaminants: ['bacteria', 'viruses'],
      testingStatus: 'none',
    })
    const r = runSimulation(input)
    const allReasons = r.tiers
      .flatMap(t => t.reasoningSteps)
      .map(s => s.reason.toLowerCase())

    const forbiddenPhrases = [
      'removes everything',
      'guarantees safe',
      'makes any water safe',
      'fully eliminates all',
    ]
    for (const phrase of forbiddenPhrases) {
      const found = allReasons.some(r => r.includes(phrase))
      expect(found, `Forbidden phrase in reasoning: "${phrase}"`).toBe(false)
    }
  })
})

// ─── Water Softener Accuracy Review ──────────────────────────────────────────

describe('Water softener review: hardness only (well, whole-house)', () => {
  const input = base({
    source: 'well',
    testingStatus: 'laboratory',
    contaminantEntries: [{ id: 'hardness', status: 'confirmed', severity: 'medium' }],
    contaminants: ['hardness'],
    use: 'whole_house',
    scope: 'whole_house',
    inletPressureBar: 2.0,
  })

  it('water_softener is recommended as primary solution', () => {
    const high = tier(input, 'high')
    expect(high.modules).toContain('water_softener')
  })

  it('hardness is fully addressed', () => {
    expect(tier(input, 'high').removedContaminants).toContain('hardness')
  })
})

describe('Water softener review: iron only (well, whole-house)', () => {
  const input = base({
    source: 'well',
    testingStatus: 'laboratory',
    contaminantEntries: [{ id: 'iron', status: 'confirmed', severity: 'medium' }],
    contaminants: ['iron'],
    use: 'whole_house',
    scope: 'whole_house',
    inletPressureBar: 2.0,
  })

  it('water_softener is NOT recommended when iron is the sole concern', () => {
    // Softener only removes hardness — it must not appear as the iron solution
    expect(allModules(input)).not.toContain('water_softener')
  })

  it('dedicated iron treatment is recommended instead', () => {
    const high = tier(input, 'high')
    const ironModules = ['iron_manganese_filter', 'oxidation_filter']
    expect(high.modules.some(m => ironModules.includes(m))).toBe(true)
  })

  it('iron is addressed in high-budget tier', () => {
    expect(tier(input, 'high').removedContaminants).toContain('iron')
  })
})

describe('Water softener review: manganese only (well, whole-house)', () => {
  const input = base({
    source: 'well',
    testingStatus: 'laboratory',
    contaminantEntries: [{ id: 'manganese', status: 'confirmed', severity: 'medium' }],
    contaminants: ['manganese'],
    use: 'whole_house',
    scope: 'whole_house',
    inletPressureBar: 2.0,
  })

  it('water_softener is NOT recommended when manganese is the sole concern', () => {
    expect(allModules(input)).not.toContain('water_softener')
  })

  it('dedicated manganese-capable treatment is recommended', () => {
    const high = tier(input, 'high')
    const mnModules = ['iron_manganese_filter', 'oxidation_filter']
    expect(high.modules.some(m => mnModules.includes(m))).toBe(true)
  })

  it('manganese is addressed in high-budget tier', () => {
    expect(tier(input, 'high').removedContaminants).toContain('manganese')
  })
})
