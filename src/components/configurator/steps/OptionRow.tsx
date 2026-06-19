import type { LucideIcon } from 'lucide-react'
import { Check } from 'lucide-react'

interface OptionRowProps {
  Icon: LucideIcon
  iconColor: string
  label: string
  description?: string
  selected: boolean
  onClick: () => void
  multiSelect?: boolean
}

export function OptionRow({ Icon, iconColor, label, description, selected, onClick, multiSelect }: OptionRowProps) {
  return (
    <button
      onClick={onClick}
      className={`w-full px-4 py-3.5 flex items-center gap-3.5 transition-colors text-left ${
        selected ? 'bg-sky-500/10 text-white' : 'text-slate-300 hover:bg-slate-800/60'
      }`}
    >
      <div
        className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 transition-colors"
        style={{ backgroundColor: selected ? `${iconColor}25` : `${iconColor}15` }}
      >
        <Icon size={18} style={{ color: iconColor }} strokeWidth={1.5} />
      </div>
      <div className="flex-1 min-w-0 text-left">
        <span className="font-medium text-sm leading-snug block">{label}</span>
        {description && (
          <span className="text-xs text-slate-500 leading-snug block mt-0.5">{description}</span>
        )}
      </div>
      <div
        className={`w-5 h-5 flex-shrink-0 flex items-center justify-center transition-all border ${
          multiSelect ? 'rounded-md' : 'rounded-full'
        } ${selected ? 'bg-sky-500 border-sky-500 shadow-sm shadow-sky-500/30' : 'border-slate-600'}`}
      >
        {selected && <Check size={9} strokeWidth={3} className="text-white" />}
      </div>
    </button>
  )
}

interface OptionListProps {
  children: React.ReactNode
}

export function OptionList({ children }: OptionListProps) {
  return (
    <div className="rounded-xl border border-slate-800 bg-slate-900/40 overflow-hidden divide-y divide-slate-800/60">
      {children}
    </div>
  )
}
