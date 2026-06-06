import { FilterUnit } from './FilterUnit'
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
  return (
    <div className="flex items-center gap-2 flex-wrap">
      {filters.map((type, i) => (
        <div key={i} className="flex items-center gap-2">
          <FilterUnit
            type={type}
            inputContaminants={inputContaminants}
            outputContaminants={inputContaminants}
            animated={animated}
            onClick={onFilterClick ? () => onFilterClick(i, type) : undefined}
          />
          {i < filters.length - 1 && (
            <span className="text-blue-400 text-lg">→</span>
          )}
        </div>
      ))}
    </div>
  )
}
