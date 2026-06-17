import { useState, useCallback } from 'react'
import { runSimulation } from '@/engine/simulation'
import type { WaterInput, GreedySimulationResult } from '@/types'

export function useSimulation() {
  const [result, setResult] = useState<GreedySimulationResult | null>(null)

  const run = useCallback((input: WaterInput) => {
    const r = runSimulation(input)
    setResult(r)
    return r
  }, [])

  return { result, run }
}
