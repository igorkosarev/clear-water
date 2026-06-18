import { runSimulation } from './simulation'
import type { WaterInput, TierResult } from '@/types'

export function getBestRecommendation(input: WaterInput): TierResult | null {
  const result = runSimulation(input)
  return result.tiers.find(t => t.budget === result.primaryBudget) ?? result.tiers[0] ?? null
}
