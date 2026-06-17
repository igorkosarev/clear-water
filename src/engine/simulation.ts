import type {
  WaterInput,
  GreedySimulationResult,
  TierResult,
  BudgetTier,
  ContaminantId,
  ModuleId,
  OptimizationPreference,
} from '@/types'
import modulesData from '@/data/modules.json'

type RawModule = {
  id: string
  type: string
  removes: string[]
  costUSD: number
  minPressureBar: number
}

const BUDGET_LIMITS: Record<BudgetTier, number> = {
  low: 50,
  medium: 200,
  high: 1000,
}

// Logical flow order: contaminants flow through filters in this sequence
const FLOW_ORDER: Record<string, number> = {
  booster_pump:      0,
  sediment:          1,
  sediment_filtration: 1,
  activated_carbon:  2,
  biosand:           3,
  ceramic:           3,
  slow_sand:         4,
  ro:                5,
  hollow_fiber:      5,
  uv:                6,
  chlorination:      7,
  boiling:           8,
  ion_exchange:      9,
  water_softening:   10,
  distillation:      11,
}

function sortByFlowOrder(mods: RawModule[]): RawModule[] {
  return [...mods].sort((a, b) => {
    const oa = FLOW_ORDER[a.type] ?? 99
    const ob = FLOW_ORDER[b.type] ?? 99
    return oa - ob
  })
}

function greedyBuild(
  contaminants: ContaminantId[],
  allModules: RawModule[],
  budgetUSD: number,
  preference: OptimizationPreference,
  inletPressureBar: number,
  budget: BudgetTier,
): TierResult {
  let remaining = [...contaminants]
  const selected: RawModule[] = []
  let totalCost = 0

  // Exclude booster pump from greedy candidates — handled as post-processing
  const candidates = allModules.filter(m => m.id !== 'booster_pump')

  while (remaining.length > 0) {
    const affordable = candidates.filter(
      m => !selected.some(s => s.id === m.id) && totalCost + m.costUSD <= budgetUSD,
    )

    const scored = affordable
      .map(m => ({
        module: m,
        overlap: m.removes.filter(c => remaining.includes(c)).length,
      }))
      .filter(x => x.overlap > 0)
      .sort((a, b) => {
        if (b.overlap !== a.overlap) return b.overlap - a.overlap
        if (preference === 'cost') return a.module.costUSD - b.module.costUSD
        return b.module.removes.length - a.module.removes.length
      })

    if (scored.length === 0) break

    const best = scored[0]
    selected.push(best.module)
    totalCost += best.module.costUSD
    remaining = remaining.filter(c => !best.module.removes.includes(c))
  }

  // Add booster pump when source pressure is insufficient for the built system
  const needsPump = selected.some(m => m.minPressureBar > inletPressureBar)
  if (needsPump) {
    const pump = allModules.find(m => m.id === 'booster_pump')
    if (pump) {
      selected.unshift(pump)
      totalCost += pump.costUSD
    }
  }

  const sorted = sortByFlowOrder(selected)
  const removedContaminants = contaminants.filter(c => !remaining.includes(c))

  return {
    budget,
    budgetLimitUSD: budgetUSD,
    modules: sorted.map(m => m.id) as ModuleId[],
    removedContaminants,
    remainingContaminants: remaining,
    estimatedCostUSD: totalCost,
    hasPump: needsPump,
  }
}

export function runSimulation(input: WaterInput): GreedySimulationResult {
  const allModules = modulesData as RawModule[]

  const tiers = (['low', 'medium', 'high'] as BudgetTier[]).map(budget =>
    greedyBuild(
      input.contaminants,
      allModules,
      BUDGET_LIMITS[budget],
      input.preference,
      input.inletPressureBar,
      budget,
    ),
  )

  return { tiers, primaryBudget: input.budget }
}
