import type {
  WaterInput,
  GreedySimulationResult,
  TierResult,
  BudgetTier,
  ContaminantId,
  ModuleId,
  OptimizationPreference,
  FilterType,
} from '@/types'

function pickPrimaryBudget(tiers: TierResult[]): BudgetTier {
  const best = [...tiers].sort((a, b) => {
    if (b.removedContaminants.length !== a.removedContaminants.length)
      return b.removedContaminants.length - a.removedContaminants.length
    return a.estimatedCostUSD - b.estimatedCostUSD
  })[0]
  return best?.budget ?? 'medium'
}
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

// µm pore size — null means non-mechanical (no particle filtration)
const MICRON_RATING: Record<string, number | null> = {
  sediment:           5,
  sediment_filtration: 5,
  activated_carbon:   1,
  biosand:            1,
  ceramic:            0.2,
  slow_sand:          0.1,
  hollow_fiber:       0.01,
  ro:                 0.0001,
  uv:                 null,
  chlorination:       null,
  boiling:            null,
  ion_exchange:       null,
  water_softening:    null,
  distillation:       null,
  booster_pump:       null,
}

// Order among non-mechanical filters after mechanical ones
const NON_MECHANICAL_ORDER: Record<string, number> = {
  uv:             0,
  chlorination:   1,
  boiling:        2,
  ion_exchange:   3,
  water_softening: 4,
  distillation:   5,
}

// Required/recommended upstream filters per type
const PREREQUISITES: Record<string, { required: string[]; recommended: string[] }> = {
  ro:           { required: ['sediment'], recommended: ['sediment', 'activated_carbon'] },
  hollow_fiber: { required: ['sediment'], recommended: ['sediment'] },
  uv:           { required: [], recommended: ['sediment', 'activated_carbon'] },
  chlorination: { required: [], recommended: ['sediment'] },
  ion_exchange: { required: [], recommended: ['sediment'] },
  water_softening: { required: [], recommended: ['sediment'] },
  activated_carbon: { required: [], recommended: ['sediment'] },
}

function getPrereqs(type: string) {
  return PREREQUISITES[type] ?? { required: [], recommended: [] }
}

// Sort: pump first → mechanical descending µm → non-mechanical by NON_MECHANICAL_ORDER
function sortByPhysicalOrder(mods: RawModule[]): RawModule[] {
  return [...mods].sort((a, b) => {
    if (a.type === 'booster_pump') return -1
    if (b.type === 'booster_pump') return 1

    const ma = MICRON_RATING[a.type] ?? null
    const mb = MICRON_RATING[b.type] ?? null

    if (ma !== null && mb === null) return -1
    if (ma === null && mb !== null) return 1
    if (ma !== null && mb !== null) return mb - ma  // larger pores first

    // Both non-mechanical: use explicit order
    return (NON_MECHANICAL_ORDER[a.type] ?? 99) - (NON_MECHANICAL_ORDER[b.type] ?? 99)
  })
}

// Add any missing required prerequisite modules (budget-independent — technical necessity)
function enforcePrerequisites(
  selected: RawModule[],
  allModules: RawModule[],
): { modules: RawModule[]; extraCost: number } {
  const modules = [...selected]
  let extraCost = 0
  let changed = true

  while (changed) {
    changed = false
    const presentTypes = new Set(modules.map(m => m.type))

    for (const mod of [...modules]) {
      for (const requiredType of getPrereqs(mod.type).required) {
        if (!presentTypes.has(requiredType)) {
          const cheapest = allModules
            .filter(m => m.type === requiredType && !modules.some(s => s.id === m.id))
            .sort((a, b) => a.costUSD - b.costUSD)[0]
          if (cheapest) {
            modules.push(cheapest)
            extraCost += cheapest.costUSD
            presentTypes.add(requiredType)
            changed = true
          }
        }
      }
    }
  }

  return { modules, extraCost }
}

// Collect recommended types that are absent from the final chain
function computeMissingRecommended(modules: RawModule[]): FilterType[] {
  const presentTypes = new Set(modules.map(m => m.type))
  const missing = new Set<string>()

  for (const mod of modules) {
    for (const recType of getPrereqs(mod.type).recommended) {
      if (!presentTypes.has(recType)) missing.add(recType)
    }
  }

  return [...missing] as FilterType[]
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

  // Enforce physical prerequisites (budget-independent)
  const { modules: withPrereqs, extraCost } = enforcePrerequisites(selected, allModules)
  totalCost += extraCost

  // Add booster pump if inlet pressure is insufficient (after prerequisites are known)
  const needsPump = withPrereqs.some(m => m.minPressureBar > inletPressureBar)
  if (needsPump) {
    const pump = allModules.find(m => m.id === 'booster_pump')
    if (pump && !withPrereqs.some(m => m.id === pump.id)) {
      withPrereqs.push(pump)
      totalCost += pump.costUSD
    }
  }

  const sorted = sortByPhysicalOrder(withPrereqs)
  const missingRecommended = computeMissingRecommended(sorted)
  const removedContaminants = contaminants.filter(c => !remaining.includes(c))

  return {
    budget,
    budgetLimitUSD: budgetUSD,
    modules: sorted.map(m => m.id) as ModuleId[],
    removedContaminants,
    remainingContaminants: remaining,
    estimatedCostUSD: totalCost,
    hasPump: needsPump,
    missingRecommended,
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

  return { tiers, primaryBudget: pickPrimaryBudget(tiers) }
}
