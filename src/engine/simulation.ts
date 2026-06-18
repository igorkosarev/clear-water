import type {
  WaterInput,
  GreedySimulationResult,
  TierResult,
  BudgetTier,
  ContaminantId,
  ModuleId,
  OptimizationPreference,
  FilterType,
  SourceProfile,
  WaterCondition,
  ReasoningStep,
  ConfidenceScore,
  ConfidenceLevel,
} from '@/types'
import modulesData from '@/data/modules.json'
import sourceProfilesData from '@/data/source-profiles.json'
import treatmentConstraintsData from '@/data/treatment-constraints.json'

// ─── Raw data types ───────────────────────────────────────────────────────────

type RawModule = {
  id: string
  type: string
  removes: string[]
  costUSD: number
  minPressureBar: number
  nameKey: string
}

type ModuleConstraint = {
  waterConditionRequires: WaterCondition[]
  moduleRequires: FilterType[]
  incompatibleWith: FilterType[]
}

// ─── Constants ────────────────────────────────────────────────────────────────

const BUDGET_LIMITS: Record<BudgetTier, number> = {
  low: 50,
  medium: 200,
  high: 1000,
}

// µm pore size — null means non-mechanical
const MICRON_RATING: Record<string, number | null> = {
  sediment:            5,
  sediment_filtration: 5,
  activated_carbon:    1,
  biosand:             1,
  ceramic:             0.2,
  slow_sand:           0.1,
  hollow_fiber:        0.01,
  ro:                  0.0001,
  uv:                  null,
  chlorination:        null,
  boiling:             null,
  ion_exchange:        null,
  water_softening:     null,
  distillation:        null,
  booster_pump:        null,
}

const NON_MECHANICAL_ORDER: Record<string, number> = {
  uv:              0,
  chlorination:    1,
  boiling:         2,
  ion_exchange:    3,
  water_softening: 4,
  distillation:    5,
}

// ─── Water condition evaluation ───────────────────────────────────────────────

function evaluateWaterConditions(
  remaining: ContaminantId[],
  inletPressureBar: number,
): Set<WaterCondition> {
  const conds = new Set<WaterCondition>()
  if (!remaining.includes('turbidity') && !remaining.includes('sediment')) {
    conds.add('low_turbidity')
  }
  if (inletPressureBar >= 3.5) {
    conds.add('adequate_pressure')
  }
  return conds
}

function passesConstraints(
  moduleType: string,
  waterConditions: Set<WaterCondition>,
  constraints: Record<string, ModuleConstraint>,
): boolean {
  const c = constraints[moduleType]
  if (!c) return true
  return c.waterConditionRequires.every(cond => waterConditions.has(cond))
}

// ─── Physical ordering ────────────────────────────────────────────────────────

function sortByPhysicalOrder(mods: RawModule[]): RawModule[] {
  return [...mods].sort((a, b) => {
    if (a.type === 'booster_pump') return -1
    if (b.type === 'booster_pump') return 1
    const ma = MICRON_RATING[a.type] ?? null
    const mb = MICRON_RATING[b.type] ?? null
    if (ma !== null && mb === null) return -1
    if (ma === null && mb !== null) return 1
    if (ma !== null && mb !== null) return mb - ma
    return (NON_MECHANICAL_ORDER[a.type] ?? 99) - (NON_MECHANICAL_ORDER[b.type] ?? 99)
  })
}

// ─── Prerequisite enforcement ─────────────────────────────────────────────────

function enforcePrerequisites(
  selected: RawModule[],
  allModules: RawModule[],
  constraints: Record<string, ModuleConstraint>,
): { modules: RawModule[]; extraCost: number; steps: ReasoningStep[] } {
  const modules = [...selected]
  let extraCost = 0
  const steps: ReasoningStep[] = []
  let changed = true

  while (changed) {
    changed = false
    const presentTypes = new Set(modules.map(m => m.type))

    for (const mod of [...modules]) {
      const c = constraints[mod.type]
      if (!c) continue
      for (const requiredType of c.moduleRequires) {
        if (!presentTypes.has(requiredType)) {
          const cheapest = allModules
            .filter(m => m.type === requiredType && !modules.some(s => s.id === m.id))
            .sort((a, b) => a.costUSD - b.costUSD)[0]
          if (cheapest) {
            modules.push(cheapest)
            extraCost += cheapest.costUSD
            presentTypes.add(cheapest.type)
            steps.push({
              action: 'require',
              moduleId: cheapest.id as ModuleId,
              reason: `Required pre-filtration for ${mod.id.replace(/_/g, ' ')}`,
            })
            changed = true
          }
        }
      }
    }
  }

  return { modules, extraCost, steps }
}

// ─── Confidence scoring ───────────────────────────────────────────────────────

function computeConfidence(
  input: WaterInput,
  profile: SourceProfile,
  removed: ContaminantId[],
  remaining: ContaminantId[],
): ConfidenceScore {
  // Data confidence
  let dataScore = 0
  const dataReasons: string[] = []

  dataScore += 1 // source is always specified

  if (input.contaminants.length > 0) {
    dataScore += 1
  } else {
    dataReasons.push('No contaminants explicitly identified — recommendation based on source type only')
  }

  const profileContaminants = [...profile.inferredContaminants, ...profile.riskFactors]
  const userOverlap = input.contaminants.filter(c => profileContaminants.includes(c))
  if (userOverlap.length > 0) {
    dataScore += 1
  }

  if (profile.advisories.includes('water_testing')) {
    dataScore -= 1
    dataReasons.push('Laboratory water test recommended — actual contaminants may differ from estimates')
  }

  const userRiskSelected = input.contaminants.filter(c => profile.riskFactors.includes(c))
  if (profile.riskFactors.length > 0 && userRiskSelected.length === 0) {
    dataScore -= 1
    const sample = profile.riskFactors.slice(0, 3).join(', ')
    dataReasons.push(`Elevated risk for ${sample} — consider testing to confirm`)
  }

  const dataLevel: ConfidenceLevel =
    dataScore >= 2 ? 'high' : dataScore >= 1 ? 'medium' : 'low'

  // Recommendation confidence
  const total = removed.length + remaining.length
  const recommendationReasons: string[] = []
  let recLevel: ConfidenceLevel

  if (total === 0) {
    recLevel = 'medium'
    recommendationReasons.push('No specific contaminants to evaluate coverage against')
  } else if (remaining.length === 0) {
    recLevel = 'high'
  } else {
    const ratio = removed.length / total
    recLevel = ratio >= 0.6 ? 'medium' : 'low'
    recommendationReasons.push(
      `${remaining.length} of ${total} identified contaminant(s) not addressed in this budget`,
    )
  }

  return { data: dataLevel, recommendation: recLevel, dataReasons, recommendationReasons }
}

// ─── Greedy build ─────────────────────────────────────────────────────────────

function greedyBuild(
  allContaminants: ContaminantId[],
  allModules: RawModule[],
  budgetUSD: number,
  preference: OptimizationPreference,
  inletPressureBar: number,
  budget: BudgetTier,
  constraints: Record<string, ModuleConstraint>,
  input: WaterInput,
  profile: SourceProfile,
): TierResult {
  let remaining = [...allContaminants]
  const selected: RawModule[] = []
  let totalCost = 0
  const reasoningSteps: ReasoningStep[] = []

  const candidates = allModules.filter(m => m.id !== 'booster_pump')

  while (remaining.length > 0) {
    const waterConditions = evaluateWaterConditions(remaining, inletPressureBar)

    const affordable = candidates.filter(
      m =>
        !selected.some(s => s.id === m.id) &&
        totalCost + m.costUSD <= budgetUSD &&
        passesConstraints(m.type, waterConditions, constraints),
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
    const addressed = best.module.removes.filter(c => allContaminants.includes(c)) as ContaminantId[]
    selected.push(best.module)
    totalCost += best.module.costUSD
    remaining = remaining.filter(c => !best.module.removes.includes(c))

    reasoningSteps.push({
      action: 'select',
      moduleId: best.module.id as ModuleId,
      reason:
        addressed.length > 0
          ? `Addresses: ${addressed.slice(0, 4).join(', ')}${addressed.length > 4 ? ` +${addressed.length - 4} more` : ''}`
          : 'Selected for system completeness',
      contaminantsAddressed: addressed,
    })
  }

  const { modules: withPrereqs, extraCost, steps: prereqSteps } = enforcePrerequisites(
    selected,
    allModules,
    constraints,
  )
  totalCost += extraCost
  reasoningSteps.push(...prereqSteps)

  const needsPump = withPrereqs.some(m => m.minPressureBar > inletPressureBar)
  if (needsPump) {
    const pump = allModules.find(m => m.id === 'booster_pump')
    if (pump && !withPrereqs.some(m => m.id === pump.id)) {
      withPrereqs.push(pump)
      totalCost += pump.costUSD
    }
  }

  const sorted = sortByPhysicalOrder(withPrereqs)
  const removedContaminants = allContaminants.filter(c => !remaining.includes(c))

  const confidence = computeConfidence(input, profile, removedContaminants, remaining)

  return {
    budget,
    budgetLimitUSD: budgetUSD,
    modules: sorted.map(m => m.id) as ModuleId[],
    removedContaminants,
    remainingContaminants: remaining,
    estimatedCostUSD: totalCost,
    hasPump: needsPump,
    missingRecommended: [],
    reasoningSteps,
    confidence,
  }
}

// ─── Primary budget selection ─────────────────────────────────────────────────

function pickPrimaryBudget(tiers: TierResult[]): BudgetTier {
  const best = [...tiers].sort((a, b) => {
    if (b.removedContaminants.length !== a.removedContaminants.length)
      return b.removedContaminants.length - a.removedContaminants.length
    return a.estimatedCostUSD - b.estimatedCostUSD
  })[0]
  return best?.budget ?? 'medium'
}

// ─── Public API ───────────────────────────────────────────────────────────────

export function runSimulation(input: WaterInput): GreedySimulationResult {
  const allModules = modulesData as RawModule[]
  const sourceProfiles = sourceProfilesData as Record<string, SourceProfile>
  const constraints = treatmentConstraintsData as Record<string, ModuleConstraint>

  const profile: SourceProfile = sourceProfiles[input.source] ?? {
    inferredContaminants: [],
    riskFactors: [],
    advisories: [],
  }

  const allContaminants = [
    ...new Set([...profile.inferredContaminants, ...input.contaminants]),
  ] as ContaminantId[]

  const tiers = (['low', 'medium', 'high'] as BudgetTier[]).map(budget =>
    greedyBuild(
      allContaminants,
      allModules,
      BUDGET_LIMITS[budget],
      input.preference,
      input.inletPressureBar,
      budget,
      constraints,
      input,
      profile,
    ),
  )

  return {
    tiers,
    primaryBudget: pickPrimaryBudget(tiers),
    inferredContaminants: profile.inferredContaminants,
    riskFactors: profile.riskFactors,
    advisories: profile.advisories,
  }
}
