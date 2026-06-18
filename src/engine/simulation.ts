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
  ContaminantEntry,
  ContaminantStatus,
  TreatmentScope,
} from '@/types'
import modulesData from '@/data/modules.json'
import sourceProfilesData from '@/data/source-profiles.json'
import treatmentConstraintsData from '@/data/treatment-constraints.json'
import contaminantsData from '@/data/contaminants.json'

// ─── Raw data types ───────────────────────────────────────────────────────────

type RawModule = {
  id: string
  type: string
  removes: string[]
  costUSD: number
  minPressureBar: number
  nameKey: string
  scopeTags?: TreatmentScope[]
}

type RawContaminant = {
  id: string
  category: 'biological' | 'chemical' | 'physical' | 'radiological'
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

// REQ-27: certainty weights
const STATUS_WEIGHTS: Record<ContaminantStatus, number> = {
  confirmed: 2.0,
  suspected: 1.0,
  inferred:  0.75,
}

// REQ-29: severity multipliers
const SEVERITY_WEIGHTS: Record<string, number> = {
  high:    1.5,
  medium:  1.2,
  low:     0.9,
  unknown: 1.0,
}

// REQ-25: category weights per use type
type CategoryWeights = { biological: number; chemical: number; physical: number; radiological: number }
const PURPOSE_CATEGORY_WEIGHTS: Record<string, CategoryWeights> = {
  drinking:          { biological: 1.5, chemical: 1.0, physical: 0.8, radiological: 1.2 },
  cooking:           { biological: 1.5, chemical: 1.0, physical: 0.8, radiological: 1.2 },
  emergency_survival:{ biological: 2.0, chemical: 0.8, physical: 0.5, radiological: 1.0 },
  whole_house:       { biological: 1.0, chemical: 1.0, physical: 1.2, radiological: 0.8 },
  shower_bathing:    { biological: 0.8, chemical: 0.8, physical: 1.3, radiological: 0.6 },
  irrigation:        { biological: 0.5, chemical: 1.0, physical: 0.8, radiological: 0.5 },
  livestock:         { biological: 1.0, chemical: 1.0, physical: 0.8, radiological: 0.8 },
}

// ─── Contaminant category lookup ──────────────────────────────────────────────

const CONTAMINANT_CATEGORIES = Object.fromEntries(
  (contaminantsData as RawContaminant[]).map(c => [c.id, c.category]),
) as Record<string, 'biological' | 'chemical' | 'physical' | 'radiological'>

// ─── Contaminant entry helpers (REQ-27) ───────────────────────────────────────

export function normalizeContaminants(
  raw: ContaminantId[],
  defaultStatus: ContaminantStatus = 'suspected',
): ContaminantEntry[] {
  return raw.map(id => ({ id, status: defaultStatus }))
}

function resolveEntries(input: WaterInput): ContaminantEntry[] {
  if (input.contaminantEntries && input.contaminantEntries.length > 0) {
    return input.contaminantEntries
  }
  return normalizeContaminants(input.contaminants, 'suspected')
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

// REQ-30: scope filter
function passesScope(module: RawModule, scope?: TreatmentScope): boolean {
  if (!scope) return true
  if (!module.scopeTags || module.scopeTags.length === 0) return true
  return module.scopeTags.includes(scope)
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

// ─── Confidence scoring (REQ-23 + REQ-31 extended) ───────────────────────────

function computeConfidence(
  input: WaterInput,
  profile: SourceProfile,
  removed: ContaminantId[],
  remaining: ContaminantId[],
  entries: ContaminantEntry[],
): ConfidenceScore {
  // Data confidence
  let dataScore = 0
  const dataReasons: string[] = []

  dataScore += 1 // source always specified

  const userSelected = entries.filter(e => e.status !== 'inferred')
  if (userSelected.length > 0) {
    dataScore += 1
  } else {
    dataReasons.push('No contaminants explicitly identified — recommendation based on source type only')
  }

  const profileContaminants = [...profile.inferredContaminants, ...profile.riskFactors]
  const userOverlap = userSelected.filter(e => profileContaminants.includes(e.id))
  if (userOverlap.length > 0) {
    dataScore += 1
  }

  // REQ-26: testing status signals
  const testingStatus = input.testingStatus ?? 'unknown'
  if (testingStatus === 'laboratory') {
    dataScore += 2
    dataReasons.push('Laboratory analysis provided — high data reliability')
  } else if (testingStatus === 'home_kit') {
    dataScore += 1
    dataReasons.push('Home test kit used — moderate reliability')
  } else if (testingStatus === 'none') {
    dataScore -= 1
    dataReasons.push('No water testing performed — recommendations based on source profile only')
  }

  // REQ-27: confirmed contaminants bonus
  const confirmedCount = entries.filter(e => e.status === 'confirmed').length
  const confirmedBonus = Math.min(confirmedCount, 2)
  if (confirmedBonus > 0) {
    dataScore += confirmedBonus
    dataReasons.push(`${confirmedCount} contaminant(s) confirmed by testing — high priority treatment applied`)
  }

  // Advisory penalty
  if (profile.advisories.includes('water_testing')) {
    dataScore -= 1
    dataReasons.push('Laboratory water test recommended — actual contaminants may differ from estimates')
  }

  // Risk factors not selected
  const userRiskSelected = userSelected.filter(e => profile.riskFactors.includes(e.id))
  if (profile.riskFactors.length > 0 && userRiskSelected.length === 0) {
    dataScore -= 1
    const sample = profile.riskFactors.slice(0, 3).join(', ')
    dataReasons.push(`Elevated risk for ${sample} — consider testing to confirm`)
  }

  // REQ-25: high-stakes use with low data
  const highStakesUse = ['drinking', 'cooking', 'emergency_survival'].includes(input.use ?? '')
  if (highStakesUse && testingStatus === 'none') {
    dataScore -= 1
    dataReasons.push('Critical use (drinking/cooking) with no testing data — water testing strongly recommended')
  }

  // REQ-31: new thresholds
  const dataLevel: ConfidenceLevel = dataScore >= 4 ? 'high' : dataScore >= 2 ? 'medium' : 'low'

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

  // REQ-29: high-severity unaddressed contaminants cap recommendation confidence
  const highSeverityUnaddressed = entries.filter(
    e => remaining.includes(e.id) && e.severity === 'high',
  )
  if (highSeverityUnaddressed.length > 0 && recLevel === 'high') {
    recLevel = 'medium'
    recommendationReasons.push(
      `High severity contaminant(s) unaddressed: ${highSeverityUnaddressed.map(e => e.id).join(', ')}`,
    )
  }

  // REQ-30: scope constraint cap
  if (input.scope && remaining.length > 0 && recLevel === 'high') {
    recLevel = 'medium'
    recommendationReasons.push(`Some contaminants cannot be addressed within the selected installation scope`)
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
  entries: ContaminantEntry[],
): TierResult {
  let remaining = [...allContaminants]
  const selected: RawModule[] = []
  let totalCost = 0
  const reasoningSteps: ReasoningStep[] = []

  // REQ-25: purpose category weights
  const catWeights: CategoryWeights =
    PURPOSE_CATEGORY_WEIGHTS[input.use] ?? PURPOSE_CATEGORY_WEIGHTS['drinking']

  const candidates = allModules.filter(m => m.id !== 'booster_pump')

  while (remaining.length > 0) {
    const waterConditions = evaluateWaterConditions(remaining, inletPressureBar)

    const affordable = candidates.filter(
      m =>
        !selected.some(s => s.id === m.id) &&
        totalCost + m.costUSD <= budgetUSD &&
        passesConstraints(m.type, waterConditions, constraints) &&
        passesScope(m, input.scope),
    )

    const scored = affordable
      .map(m => {
        // REQ-27 + REQ-29 + REQ-25: weighted scoring
        let weightedOverlap = 0
        for (const c of m.removes) {
          if (!remaining.includes(c)) continue
          const entry = entries.find(e => e.id === c)
          const status = entry?.status ?? 'suspected'
          const severity = entry?.severity ?? 'unknown'
          const category = CONTAMINANT_CATEGORIES[c] ?? 'chemical'
          const sw = STATUS_WEIGHTS[status]
          const sev = SEVERITY_WEIGHTS[severity] ?? 1.0
          const cw = catWeights[category] ?? 1.0
          weightedOverlap += sw * sev * cw
        }
        // plain overlap for tie-breaking
        const overlap = m.removes.filter(c => remaining.includes(c)).length
        return { module: m, weightedOverlap, overlap }
      })
      .filter(x => x.overlap > 0)
      .sort((a, b) => {
        if (Math.abs(b.weightedOverlap - a.weightedOverlap) > 0.001)
          return b.weightedOverlap - a.weightedOverlap
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

  const confidence = computeConfidence(input, profile, removedContaminants, remaining, entries)

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

  const entries = resolveEntries(input)
  const inferredEntries = profile.inferredContaminants.map(
    id => ({ id, status: 'inferred' as ContaminantStatus }),
  )
  // Merge: profile inferred + user entries (user entries take precedence for same id)
  const userIds = new Set(entries.map(e => e.id))
  const allEntries: ContaminantEntry[] = [
    ...inferredEntries.filter(e => !userIds.has(e.id)),
    ...entries,
  ]

  const allContaminants = allEntries.map(e => e.id) as ContaminantId[]

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
      allEntries,
    ),
  )

  // REQ-32: auto-advisory for well + no testing
  const advisories = [...profile.advisories]
  if (
    input.source === 'well' &&
    (input.testingStatus === 'none' || !input.testingStatus || input.testingStatus === 'unknown') &&
    !advisories.includes('water_testing')
  ) {
    advisories.push('water_testing')
  }

  return {
    tiers,
    primaryBudget: pickPrimaryBudget(tiers),
    inferredContaminants: profile.inferredContaminants,
    riskFactors: profile.riskFactors,
    advisories,
  }
}
