export type ContaminantId = string
export type ModuleId = string
export type SystemTemplateId = string

export type BudgetTier = 'low' | 'medium' | 'high'

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
  category: 'biological' | 'chemical' | 'physical' | 'radiological'
  icon: string
  color: string
}

export interface TreatmentMethod {
  id: string
  nameKey: string
  descriptionKey: string
  removes: ContaminantId[]
  complexity: 'beginner' | 'intermediate' | 'advanced'
  costTier: BudgetTier
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
  budget: BudgetTier
}

export interface SimulationResult {
  recommendations: RankedRecommendation[]
}

export interface RankedRecommendation {
  template: SystemTemplate
  score: number
  removedContaminants: ContaminantId[]
  remainingContaminants: ContaminantId[]
  estimatedCostUSD: number
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

export interface BOMLine {
  module: Module
  quantity: number
  unitCostUSD: number
  totalCostUSD: number
  suppliers: Supplier[]
}
