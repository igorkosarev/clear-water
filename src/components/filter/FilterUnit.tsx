import { FILTER_VISUAL_CONFIG } from './FilterTypes'
import type { FilterType } from './FilterTypes'
import type { ContaminantId } from '@/types'

interface FilterUnitProps {
  type: FilterType
  inputContaminants: ContaminantId[]
  outputContaminants: ContaminantId[]
  animated?: boolean
  showLabel?: boolean
  onClick?: () => void
}

export function FilterUnit({
  type,
  outputContaminants: _outputContaminants,
  inputContaminants: _inputContaminants,
  animated: _animated = false,
  showLabel = true,
  onClick,
}: FilterUnitProps) {
  const config = FILTER_VISUAL_CONFIG[type]

  return (
    <div
      className={`flex flex-col items-center gap-1 p-3 rounded-lg border-2 ${config.bgColor} border-current ${config.color} ${onClick ? 'cursor-pointer hover:opacity-80 transition-opacity' : ''}`}
      onClick={onClick}
    >
      <span className="text-2xl">{config.icon}</span>
      {showLabel && (
        <span className="text-xs font-medium text-center">{config.label}</span>
      )}
    </div>
  )
}
