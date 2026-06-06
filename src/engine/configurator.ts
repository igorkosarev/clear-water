import { runSimulation } from './simulation'
import type { WaterInput, RankedRecommendation } from '@/types'

export function getBestRecommendation(input: WaterInput): RankedRecommendation | null {
  const result = runSimulation(input)
  return result.recommendations[0] ?? null
}
