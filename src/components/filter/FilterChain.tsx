import { useMemo } from 'react'
import { FilterUnit } from './FilterUnit'
import { FILTER_TYPE_CONFIG } from './FilterTypes'
import type { FilterType } from './FilterTypes'
import type { ContaminantId } from '@/types'

interface FilterChainProps {
  filters: FilterType[]
  inputContaminants: ContaminantId[]
  animated?: boolean
  onFilterClick?: (index: number, type: FilterType) => void
}

export function FilterChain({
  filters,
  inputContaminants,
  animated = false,
  onFilterClick,
}: FilterChainProps) {
  const stageContaminants = useMemo<ContaminantId[][]>(() => {
    const stages: ContaminantId[][] = [inputContaminants]
    let current = [...inputContaminants]
    for (const f of filters) {
      current = current.filter(id => !FILTER_TYPE_CONFIG[f].removes.includes(id))
      stages.push(current)
    }
    return stages
  }, [filters, inputContaminants])

  return (
    <div className="flex flex-col items-center w-full gap-0">
      {filters.map((type, i) => (
        <div key={i} className="w-full flex flex-col items-center">
          {i > 0 && <div className="w-0.5 h-4 bg-slate-700" />}
          <FilterUnit
            type={type}
            inputContaminants={stageContaminants[i]}
            outputContaminants={stageContaminants[i + 1]}
            animated={animated}
            onClick={onFilterClick ? () => onFilterClick(i, type) : undefined}
          />
        </div>
      ))}
    </div>
  )
}
