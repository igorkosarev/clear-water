export type ContaminantId = string
export type ModuleId = string
export type SystemTemplateId = string

export type BudgetTier = 'low' | 'medium' | 'high'
export type OptimizationPreference = 'cost' | 'coverage'

export type WaterSourceType =
  | 'well'
  | 'river'
  | 'rain'
  | 'tap'
  | 'pond'
  | 'spring'

export type WaterUseType = 'drinking' | 'cooking' | 'irrigation' | 'livestock'

export interface Contaminant {
  id: ContaminantId
  nameKey: string
  descriptionKey: string
  sourcesKey: string
  healthRisksKey: string
  detectionKey: string
  category: 'biological' | 'chemical' | 'physical' | 'radiological'
  icon: string
  color: string
  sizeRange?: { min: number; max: number }  // µm, optional reference data
}

export type MechanismGroup = 'thermal' | 'mechanical' | 'disinfection' | 'adsorption_ion'

export interface TreatmentMethod {
  id: string
  nameKey: string
  descriptionKey: string
  howItWorksKey: string
  limitationsKey: string
  typicalUseKey: string
  removes: ContaminantId[]
  complexity: 'beginner' | 'intermediate' | 'advanced'
  costTier: BudgetTier
  mechanismGroup: MechanismGroup
  icon: string
  color: string
}

export interface Module {
  id: ModuleId
  nameKey: string
  descriptionKey: string
  type: FilterType
  removes: ContaminantId[]
  costUSD: number
  diyDifficulty: 'easy' | 'medium' | 'hard'
  materials: string[]
  minPressureBar: number
}

export interface SystemTemplate {
  id: SystemTemplateId
  nameKey: string
  descriptionKey: string
  modules: ModuleId[]
  targetContaminants: ContaminantId[]
  budgetTier: BudgetTier
  suitableFor: WaterSourceType[]
}

export interface CompatibilityRule {
  id: string
  modules: [ModuleId, ModuleId]
  compatible: boolean
  reason: string
}

export interface Supplier {
  id: string
  name: string
  country: string
  url: string
  modules: ModuleId[]
}

export interface WaterInput {
  country: string
  source: WaterSourceType
  contaminants: ContaminantId[]
  use: WaterUseType
  inletPressureBar: number
  preference: OptimizationPreference
}

// ─── Source profiles ──────────────────────────────────────────────────────────

export interface SourceProfile {
  inferredContaminants: ContaminantId[]
  riskFactors: ContaminantId[]
  advisories: string[]
}

// ─── Reasoning engine ─────────────────────────────────────────────────────────

export type WaterCondition = 'low_turbidity' | 'adequate_pressure'

export type ReasoningAction = 'select' | 'require'

export interface ReasoningStep {
  action: ReasoningAction
  moduleId: ModuleId
  reason: string
  contaminantsAddressed?: ContaminantId[]
}

// ─── Confidence scoring ───────────────────────────────────────────────────────

export type ConfidenceLevel = 'high' | 'medium' | 'low'

export interface ConfidenceScore {
  data: ConfidenceLevel
  recommendation: ConfidenceLevel
  dataReasons: string[]
  recommendationReasons: string[]
}

// ─── Simulation results ───────────────────────────────────────────────────────

export interface TierResult {
  budget: BudgetTier
  budgetLimitUSD: number
  modules: ModuleId[]
  removedContaminants: ContaminantId[]
  remainingContaminants: ContaminantId[]
  estimatedCostUSD: number
  hasPump: boolean
  missingRecommended: FilterType[]
  reasoningSteps: ReasoningStep[]
  confidence: ConfidenceScore
}

export interface GreedySimulationResult {
  tiers: TierResult[]
  primaryBudget: BudgetTier
  inferredContaminants: ContaminantId[]
  riskFactors: ContaminantId[]
  advisories: string[]
}

export type FilterType =
  | 'sediment'
  | 'activated_carbon'
  | 'biosand'
  | 'ceramic'
  | 'uv'
  | 'ro'
  | 'slow_sand'
  | 'boiling'
  | 'chlorination'
  | 'booster_pump'
  | 'hollow_fiber'
  | 'distillation'
  | 'ion_exchange'
  | 'water_softening'
  | 'sediment_filtration'

export interface BOMLine {
  module: Module
  quantity: number
  unitCostUSD: number
  totalCostUSD: number
  suppliers: Supplier[]
}
