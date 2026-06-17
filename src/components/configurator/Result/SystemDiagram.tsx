import { SimulationCanvas } from '@/components/simulation/SimulationCanvas'
import type { TierResult } from '@/types'
import type { FilterType } from '@/components/filter/FilterTypes'
import modules from '@/data/modules.json'

interface SystemDiagramProps {
  tier: TierResult
}

export function SystemDiagram({ tier }: SystemDiagramProps) {
  const moduleList = modules as Array<{ id: string; type: FilterType }>
  const filters = tier.modules
    .map(id => moduleList.find(m => m.id === id)?.type)
    .filter((t): t is FilterType => !!t)

  const inputContaminants = [
    ...tier.removedContaminants,
    ...tier.remainingContaminants,
  ]

  return (
    <SimulationCanvas
      filters={filters}
      inputContaminants={inputContaminants.length > 0 ? inputContaminants : []}
    />
  )
}
