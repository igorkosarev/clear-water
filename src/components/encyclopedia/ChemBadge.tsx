interface ChemBadgeProps {
  symbol: string
  color: string
  size?: 'sm' | 'lg'
}

export function ChemBadge({ symbol, color, size = 'sm' }: ChemBadgeProps) {
  const len = symbol.length

  if (size === 'lg') {
    const fontSize = len <= 2 ? 90 : len === 3 ? 68 : 52
    return (
      <div
        className="flex items-center justify-center rounded-2xl font-mono font-bold leading-none"
        style={{
          width: 188,
          height: 196,
          border: `2px solid ${color}55`,
          backgroundColor: `${color}12`,
          color,
          fontSize,
        }}
      >
        {symbol}
      </div>
    )
  }

  const fontSize = len <= 2 ? 14 : len === 3 ? 11 : 9
  return (
    <div
      className="flex-shrink-0 flex items-center justify-center rounded font-mono font-bold leading-none"
      style={{
        minWidth: 34,
        height: 36,
        paddingInline: 5,
        border: `1px solid ${color}55`,
        backgroundColor: `${color}12`,
        color,
        fontSize,
      }}
    >
      {symbol}
    </div>
  )
}
