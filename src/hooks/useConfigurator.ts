import { useState } from 'react'
import { getBestRecommendation } from '@/engine/configurator'
import type { WaterInput, RankedRecommendation } from '@/types'

export function useConfigurator() {
  const [recommendation, setRecommendation] = useState<RankedRecommendation | null>(null)
  const [input, setInput] = useState<WaterInput | null>(null)

  const configure = (waterInput: WaterInput) => {
    setInput(waterInput)
    const result = getBestRecommendation(waterInput)
    setRecommendation(result)
    return result
  }

  return { recommendation, input, configure }
}
