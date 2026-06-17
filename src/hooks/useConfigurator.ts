import { useState } from 'react'
import { getBestRecommendation } from '@/engine/configurator'
import type { WaterInput, TierResult } from '@/types'

export function useConfigurator() {
  const [recommendation, setRecommendation] = useState<TierResult | null>(null)
  const [input, setInput] = useState<WaterInput | null>(null)

  const configure = (waterInput: WaterInput) => {
    setInput(waterInput)
    const result = getBestRecommendation(waterInput)
    setRecommendation(result)
    return result
  }

  return { recommendation, input, configure }
}
