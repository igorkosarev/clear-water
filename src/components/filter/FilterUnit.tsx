import { motion } from 'framer-motion'
import { FILTER_TYPE_CONFIG } from './FilterTypes'
import type { FilterType } from './FilterTypes'
import type { ContaminantId, Contaminant } from '@/types'
import contaminantsData from '@/data/contaminants.json'

// x-offsets from housing centre for absorption particles (within ±12 px)
const ABSORB_X = [-9, 7, -4, 11, -7, 4, 9, -11]

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
  const { color, label, Icon } = FILTER_TYPE_CONFIG[type]

  const removedIds = inputContaminants.filter(id => !outputContaminants.includes(id))
  const removedContaminants = (contaminantsData as Contaminant[]).filter(c =>
    removedIds.includes(c.id)
  )

  return (
    <div className="relative w-full">
      {/* Pulsing glow halo — sits behind the housing, unclipped */}
      {animated && (
        <motion.div
          className="absolute inset-0 pointer-events-none"
          style={{ borderRadius: 32, zIndex: 0 }}
          animate={{
            boxShadow: [
              '0 0 0px 0px transparent',
              `0 0 22px 5px ${color}45`,
              '0 0 0px 0px transparent',
            ],
          }}
          transition={{ duration: 2.8, repeat: Infinity, ease: 'easeInOut' as const }}
        />
      )}

      {/* Filter housing — horizontal cylinder */}
      <motion.div
        className="relative flex items-stretch h-16 w-full overflow-hidden select-none"
        style={{
          borderRadius: 32,
          background: `linear-gradient(135deg, ${color}22 0%, ${color}0e 50%, ${color}1a 100%)`,
          border: `1.5px solid ${color}55`,
          cursor: onClick ? 'pointer' : 'default',
          zIndex: 1,
        }}
        whileHover={onClick ? { scale: 1.02, transition: { duration: 0.15 } } : {}}
        whileTap={onClick ? { scale: 0.97 } : {}}
        onClick={onClick}
      >
        {/* Left cap — icon + bolt detail */}
        <div
          className="flex-shrink-0 flex flex-col items-center justify-center gap-1.5 border-r"
          style={{
            width: 72,
            backgroundColor: `${color}28`,
            borderColor: `${color}40`,
          }}
        >
          <Icon size={20} strokeWidth={1.5} style={{ color }} aria-hidden />
          <div className="flex gap-0.5">
            {[0, 1, 2].map(i => (
              <div key={i} className="w-1 h-1 rounded-full" style={{ backgroundColor: `${color}80` }} />
            ))}
          </div>
        </div>

        {/* Main body */}
        <div className="flex-1 flex items-center justify-between px-4 min-w-0">
          {showLabel && (
            <span className="text-sm font-semibold text-slate-200 tracking-wide truncate">
              {label}
            </span>
          )}
          {removedContaminants.length > 0 && (
            <div className="flex gap-2 flex-shrink-0 ml-3">
              {removedContaminants.map(c => (
                <span
                  key={c.id}
                  title={c.id.replace(/_/g, ' ')}
                  className="w-3 h-3 rounded-full flex-shrink-0"
                  style={{ backgroundColor: c.color, boxShadow: `0 0 6px ${c.color}bb` }}
                />
              ))}
            </div>
          )}
        </div>

        {/* Right end cap */}
        <div
          className="flex-shrink-0 border-l"
          style={{
            width: 20,
            backgroundColor: `${color}15`,
            borderColor: `${color}30`,
          }}
        />

        {/* Absorption particles — removed contaminants fade out inside the housing */}
        {animated &&
          removedContaminants.map((c, i) => (
            <motion.div
              key={c.id}
              className="absolute rounded-full pointer-events-none"
              style={{
                width: 5,
                height: 5,
                left: `calc(50% + ${ABSORB_X[i % ABSORB_X.length]}px - 2.5px)`,
                top: 2,
                backgroundColor: c.color,
                boxShadow: `0 0 5px ${c.color}`,
              }}
              animate={{ y: [0, 50], opacity: [0.85, 0], scale: [1, 0.25] }}
              transition={{
                duration: 1.5,
                delay: i * 0.5,
                repeat: Infinity,
                ease: 'easeIn' as const,
              }}
            />
          ))}

        {/* Animated shimmer */}
        {animated && (
          <motion.div
            className="absolute inset-0 pointer-events-none"
            style={{
              background: `linear-gradient(90deg, transparent 0%, ${color}18 50%, transparent 100%)`,
            }}
            animate={{ x: ['-100%', '200%'] }}
            transition={{ duration: 2.8, repeat: Infinity, ease: 'linear' as const, repeatDelay: 1.5 }}
          />
        )}
      </motion.div>
    </div>
  )
}
