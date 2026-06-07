import { motion } from 'framer-motion'
import {
  Layers, Zap, Droplets, Sun, Waves, AlignJustify, Flame, FlaskConical, CircleDot, Gauge,
  type LucideIcon,
} from 'lucide-react'
import { FILTER_VISUAL_CONFIG } from './FilterTypes'
import type { FilterType } from './FilterTypes'
import type { ContaminantId, Contaminant } from '@/types'
import contaminantsData from '@/data/contaminants.json'

const ICONS: Record<FilterType, LucideIcon> = {
  sediment: Layers,
  activated_carbon: Zap,
  biosand: Droplets,
  ceramic: CircleDot,
  uv: Sun,
  ro: Waves,
  slow_sand: AlignJustify,
  boiling: Flame,
  chlorination: FlaskConical,
  booster_pump: Gauge,
}

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
  inputContaminants,
  outputContaminants,
  animated = false,
  showLabel = true,
  onClick,
}: FilterUnitProps) {
  const config = FILTER_VISUAL_CONFIG[type]
  const Icon = ICONS[type]

  // IDs removed by this specific filter unit instance
  const removedIds = inputContaminants.filter(id => !outputContaminants.includes(id))
  const removedContaminants = (contaminantsData as Contaminant[]).filter(c =>
    removedIds.includes(c.id)
  )

  return (
    <motion.div
      className={`relative flex flex-col items-center gap-2 pt-3 pb-2.5 px-3 rounded-xl border
        ${config.bgColor} ${config.borderColor} ${config.textColor} min-w-[76px] max-w-[96px]
        select-none overflow-hidden ${onClick ? 'cursor-pointer' : ''}`}
      whileHover={onClick ? { scale: 1.04, transition: { duration: 0.15 } } : {}}
      whileTap={onClick ? { scale: 0.96 } : {}}
      onClick={onClick}
      // Animated glow ring — uses inline style because Tailwind can't express animated box-shadow
      animate={
        animated
          ? {
              boxShadow: [
                `0 0 0 0px rgba(${config.glowRgb},0.0)`,
                `0 0 0 5px rgba(${config.glowRgb},0.18)`,
                `0 0 0 0px rgba(${config.glowRgb},0.0)`,
              ],
            }
          : { boxShadow: '0 0 0 0px rgba(0,0,0,0)' }
      }
      transition={animated ? { duration: 2.2, repeat: Infinity, ease: 'easeOut' } : {}}
    >
      {/* Colored top accent bar */}
      <div className={`absolute top-0 inset-x-0 h-1 ${config.accentBg}`} />

      {/* Icon with subtle pulse when animated */}
      <motion.div
        animate={animated ? { scale: [1, 1.1, 1] } : {}}
        transition={animated ? { duration: 2.2, repeat: Infinity, ease: 'easeInOut' } : {}}
      >
        <Icon size={22} strokeWidth={1.8} aria-hidden />
      </motion.div>

      {/* Label */}
      {showLabel && (
        <span className="text-xs font-semibold text-center leading-tight px-1">
          {config.label}
        </span>
      )}

      {/* Removed contaminant dots */}
      {removedContaminants.length > 0 && (
        <div className="flex flex-wrap gap-1 justify-center max-w-[80px]">
          {removedContaminants.map(c => (
            <span
              key={c.id}
              title={c.id}
              className="w-2.5 h-2.5 rounded-full flex-shrink-0"
              // Dynamic data-driven color — no Tailwind equivalent for arbitrary hex values
              style={{ backgroundColor: c.color }}
            />
          ))}
        </div>
      )}
    </motion.div>
  )
}
