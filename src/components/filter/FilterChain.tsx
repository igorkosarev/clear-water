import { useMemo } from 'react'
import { motion } from 'framer-motion'
import { FilterUnit } from './FilterUnit'
import { FILTER_VISUAL_CONFIG } from './FilterTypes'
import type { FilterType } from './FilterTypes'
import type { ContaminantId } from '@/types'

interface FilterChainProps {
  filters: FilterType[]
  inputContaminants: ContaminantId[]
  animated?: boolean
  onFilterClick?: (index: number, type: FilterType) => void
}

// Three-dot animated connector between filter units
function FlowConnector({ delay = 0 }: { delay?: number }) {
  return (
    <div className="flex items-center gap-0.5 flex-shrink-0">
      {[0, 1, 2].map(i => (
        <motion.div
          key={i}
          className="w-1.5 h-1.5 rounded-full bg-blue-400"
          animate={{ opacity: [0.15, 0.9, 0.15] }}
          transition={{
            duration: 1.2,
            repeat: Infinity,
            delay: delay + i * 0.22,
            ease: 'easeInOut',
          }}
        />
      ))}
    </div>
  )
}

export function FilterChain({
  filters,
  inputContaminants,
  animated = false,
  onFilterClick,
}: FilterChainProps) {
  // Propagate contaminant state: stageContaminants[i] = contaminants entering filter i
  // stageContaminants[filters.length] = contaminants exiting the last filter
  const stageContaminants = useMemo<ContaminantId[][]>(() => {
    const stages: ContaminantId[][] = [inputContaminants]
    let current = [...inputContaminants]
    for (const f of filters) {
      current = current.filter(id => !FILTER_VISUAL_CONFIG[f].removes.includes(id))
      stages.push(current)
    }
    return stages
  }, [filters, inputContaminants])

  return (
    <div className="flex items-center gap-2 flex-wrap">
      {filters.map((type, i) => (
        <div key={i} className="flex items-center gap-2">
          {i > 0 && <FlowConnector delay={i * 0.4} />}
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
