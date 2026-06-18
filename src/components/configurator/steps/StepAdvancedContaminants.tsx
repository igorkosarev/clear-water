import { useState, useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { Search, X, Check, ChevronDown } from 'lucide-react'
import type { WaterInput, ContaminantEntry, ContaminantStatus, ContaminantSeverity } from '@/types'
import contaminants from '@/data/contaminants.json'
import { CONTAMINANT_ICONS } from '@/components/encyclopedia/contaminantConfig'
import { NavButtons } from './NavButtons'

interface StepProps {
  data: Partial<WaterInput>
  update: (patch: Partial<WaterInput>) => void
  onNext: () => void
  onBack: () => void
}

type RawContaminant = { id: string; nameKey: string; icon: string; color: string; category: string }

const STATUS_OPTIONS: { id: ContaminantStatus; label: string; color: string }[] = [
  { id: 'confirmed', label: 'Confirmed',  color: '#10b981' },
  { id: 'suspected', label: 'Suspected',  color: '#f59e0b' },
]

const SEVERITY_OPTIONS: { id: ContaminantSeverity; label: string }[] = [
  { id: 'high',    label: 'High'    },
  { id: 'medium',  label: 'Medium'  },
  { id: 'low',     label: 'Low'     },
  { id: 'unknown', label: 'Unknown' },
]

const CATEGORY_ORDER = ['biological', 'chemical', 'physical', 'radiological']

function ContamIcon({ id, color }: { id: string; color: string }) {
  const Icon = CONTAMINANT_ICONS[id]
  if (!Icon) return null
  return (
    <div
      className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0"
      style={{ backgroundColor: `${color}20` }}
    >
      <Icon size={14} style={{ color }} strokeWidth={1.5} />
    </div>
  )
}

export function StepAdvancedContaminants({ data, update, onNext, onBack }: StepProps) {
  const { t } = useTranslation()
  const [search, setSearch] = useState('')
  const [expandedCategory, setExpandedCategory] = useState<string | null>('biological')
  const [expandedSeverity, setExpandedSeverity] = useState<string | null>(null)

  const entries: ContaminantEntry[] = data.contaminantEntries ?? []
  const allContaminants = contaminants as RawContaminant[]

  const getEntry = (id: string): ContaminantEntry | undefined =>
    entries.find(e => e.id === id)

  const isSelected = (id: string) => !!getEntry(id)

  const toggleContaminant = (id: string) => {
    if (isSelected(id)) {
      update({ contaminantEntries: entries.filter(e => e.id !== id) })
    } else {
      update({
        contaminantEntries: [...entries, { id, status: 'suspected', severity: 'unknown' }],
      })
    }
  }

  const updateStatus = (id: string, status: ContaminantStatus) => {
    update({
      contaminantEntries: entries.map(e => e.id === id ? { ...e, status } : e),
    })
  }

  const updateSeverity = (id: string, severity: ContaminantSeverity) => {
    update({
      contaminantEntries: entries.map(e => e.id === id ? { ...e, severity } : e),
    })
    setExpandedSeverity(null)
  }

  const isSearching = search.trim().length > 0

  const searchResults = useMemo(() => {
    if (!isSearching) return []
    const q = search.toLowerCase()
    return allContaminants.filter(c => t(c.nameKey).toLowerCase().includes(q))
  }, [search, isSearching, t, allContaminants])

  const byCategory = useMemo(() => {
    const groups: Record<string, RawContaminant[]> = {}
    for (const cat of CATEGORY_ORDER) groups[cat] = []
    for (const c of allContaminants) {
      if (groups[c.category]) groups[c.category].push(c)
    }
    return groups
  }, [allContaminants])

  const selectedCount = entries.length

  const renderEntry = (c: RawContaminant) => {
    const entry = getEntry(c.id)
    const active = !!entry
    return (
      <div key={c.id} className={`border-b border-slate-800/60 last:border-0 ${active ? 'bg-slate-800/30' : ''}`}>
        <button
          className={`w-full px-3 py-2.5 text-left flex items-center gap-3 transition-colors ${
            active ? 'text-white' : 'text-slate-300 hover:bg-slate-800/60'
          }`}
          onClick={() => toggleContaminant(c.id)}
        >
          <ContamIcon id={c.id} color={c.color} />
          <span className="text-sm flex-1 text-left leading-snug">{t(c.nameKey)}</span>
          <div className={`w-4 h-4 rounded-full border flex-shrink-0 flex items-center justify-center transition-colors ${
            active ? 'bg-sky-500 border-sky-500' : 'border-slate-600'
          }`}>
            {active && <Check size={9} strokeWidth={3} className="text-white" />}
          </div>
        </button>

        {/* Status + severity row for selected contaminants */}
        {active && entry && (
          <div className="px-3 pb-2.5 flex items-center gap-2 flex-wrap">
            {/* Status toggle */}
            <div className="flex gap-1">
              {STATUS_OPTIONS.map(opt => (
                <button
                  key={opt.id}
                  onClick={() => updateStatus(c.id, opt.id)}
                  className={`px-2 py-0.5 rounded text-[10px] font-semibold border transition-all ${
                    entry.status === opt.id
                      ? 'text-white border-transparent'
                      : 'text-slate-500 border-slate-700 hover:border-slate-500'
                  }`}
                  style={entry.status === opt.id ? { backgroundColor: `${opt.color}40`, borderColor: `${opt.color}60`, color: opt.color } : {}}
                >
                  {opt.label}
                </button>
              ))}
            </div>

            {/* Severity dropdown */}
            <div className="relative">
              <button
                onClick={() => setExpandedSeverity(prev => prev === c.id ? null : c.id)}
                className="flex items-center gap-1 px-2 py-0.5 rounded text-[10px] text-slate-400 border border-slate-700 hover:border-slate-500 transition-colors"
              >
                Severity: {entry.severity ?? 'unknown'}
                <ChevronDown size={9} className={`transition-transform ${expandedSeverity === c.id ? 'rotate-180' : ''}`} />
              </button>
              {expandedSeverity === c.id && (
                <div className="absolute top-full left-0 mt-1 bg-slate-900 border border-slate-700 rounded-lg overflow-hidden z-10 shadow-xl">
                  {SEVERITY_OPTIONS.map(sev => (
                    <button
                      key={sev.id}
                      onClick={() => updateSeverity(c.id, sev.id)}
                      className={`w-full px-3 py-1.5 text-left text-xs transition-colors ${
                        entry.severity === sev.id
                          ? 'text-sky-400 bg-sky-500/10'
                          : 'text-slate-300 hover:bg-slate-800'
                      }`}
                    >
                      {sev.label}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-xl sm:text-2xl font-bold text-white">
          {t('configurator.steps.advanced.title')}
        </h2>
        <p className="text-slate-400 text-sm mt-1">
          {t('configurator.steps.advanced.description')}
        </p>
      </div>

      {/* Search */}
      <div className="relative">
        <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none" />
        <input
          type="text"
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder={t('configurator.steps.advanced.searchPlaceholder')}
          className="w-full pl-9 pr-9 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-sm text-white placeholder-slate-600 focus:outline-none focus:border-sky-500 transition-colors"
        />
        {isSearching && (
          <button
            onClick={() => setSearch('')}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors"
          >
            <X size={14} />
          </button>
        )}
      </div>

      {/* Selected count */}
      {selectedCount > 0 && !isSearching && (
        <p className="text-xs text-sky-400">
          {t('configurator.steps.advanced.selectedCount', { count: selectedCount })}
        </p>
      )}

      {/* List */}
      <div className="rounded-xl border border-slate-800 bg-slate-900 overflow-hidden max-h-[48vh] sm:max-h-96 overflow-y-auto">
        {isSearching ? (
          searchResults.length > 0 ? (
            <div>{searchResults.map(renderEntry)}</div>
          ) : (
            <p className="px-4 py-6 text-center text-sm text-slate-600">No contaminants found</p>
          )
        ) : (
          <div>
            {CATEGORY_ORDER.map(cat => {
              const items = byCategory[cat] ?? []
              const expanded = expandedCategory === cat
              const selectedInCat = items.filter(c => isSelected(c.id)).length
              return (
                <div key={cat} className="border-b border-slate-800 last:border-0">
                  <button
                    onClick={() => setExpandedCategory(prev => prev === cat ? null : cat)}
                    className="w-full px-3 py-2 flex items-center gap-2 text-left bg-slate-800/50 hover:bg-slate-800/80 transition-colors"
                  >
                    <ChevronDown
                      size={12}
                      className={`text-slate-500 transition-transform ${expanded ? 'rotate-180' : ''}`}
                    />
                    <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider flex-1">
                      {t(`configurator.categories.${cat}`)}
                    </span>
                    {selectedInCat > 0 && (
                      <span className="text-[10px] text-sky-400 font-semibold">{selectedInCat}</span>
                    )}
                  </button>
                  {expanded && <div>{items.map(renderEntry)}</div>}
                </div>
              )
            })}
          </div>
        )}
      </div>

      <NavButtons onBack={onBack} onNext={onNext} canNext={entries.length > 0} />
    </div>
  )
}
