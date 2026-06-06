import { motion } from 'framer-motion'

interface ContaminantBadgeProps {
  id: string
  name: string
  color: string
  removed?: boolean
}

export function ContaminantBadge({ name, color, removed = false }: ContaminantBadgeProps) {
  return (
    <motion.span
      className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-medium"
      animate={{ opacity: removed ? 0.38 : 1 }}
      transition={{ duration: 0.4, ease: 'easeOut' }}
      // Dynamic data-driven colors
      style={{
        backgroundColor: color + '22',
        color,
        border: `1px solid ${color}44`,
        textDecoration: removed ? 'line-through' : 'none',
      }}
    >
      <span
        className="w-2 h-2 rounded-full flex-shrink-0"
        style={{ backgroundColor: color }}
      />
      {name}
    </motion.span>
  )
}
