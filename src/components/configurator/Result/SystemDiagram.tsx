import { SimulationCanvas } from '@/components/simulation/SimulationCanvas'
import type { RankedRecommendation } from '@/types'
import type { FilterType } from '@/components/filter/FilterTypes'
import modules from '@/data/modules.json'

interface SystemDiagramProps {
  recommendation: RankedRecommendation
}

export function SystemDiagram({ recommendation }: SystemDiagramProps) {
  const moduleList = modules as Array<{ id: string; type: FilterType }>
  const filters = recommendation.template.modules
    .map(id => moduleList.find(m => m.id === id)?.type)
    .filter((t): t is FilterType => !!t)

  return (
    <SimulationCanvas
      filters={filters}
      inputContaminants={recommendation.template.targetContaminants}
    />
  )
}
