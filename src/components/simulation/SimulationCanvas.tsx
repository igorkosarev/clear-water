import { FilterChain } from '@/components/filter/FilterChain'
import type { FilterType } from '@/components/filter/FilterTypes'
import type { ContaminantId } from '@/types'

interface SimulationCanvasProps {
  filters: FilterType[]
  inputContaminants: ContaminantId[]
}

export function SimulationCanvas({ filters, inputContaminants }: SimulationCanvasProps) {
  return (
    <div className="w-full overflow-x-auto p-4 bg-blue-50 rounded-xl">
      <FilterChain
        filters={filters}
        inputContaminants={inputContaminants}
        animated
      />
    </div>
  )
}
