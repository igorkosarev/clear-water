interface ContaminantBadgeProps {
  id: string
  name: string
  color: string
  removed?: boolean
}

export function ContaminantBadge({ name, color, removed = false }: ContaminantBadgeProps) {
  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${removed ? 'line-through opacity-40' : ''}`}
      style={{ backgroundColor: color + '33', color }}
    >
      {name}
    </span>
  )
}
