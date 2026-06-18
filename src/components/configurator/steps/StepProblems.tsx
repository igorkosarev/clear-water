import { useState, useMemo } from 'react'
import { motion } from 'framer-motion'
import { useTranslation } from 'react-i18next'
import { Search, Layers, Wind, Wrench, ShieldAlert, FlaskConical, Gem, Zap, HelpCircle, Check, ChevronDown, X } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import type { WaterInput, ContaminantId, WaterSourceType } from '@/types'
import contaminants from '@/data/contaminants.json'
import { CONTAMINANT_ICONS } from '@/components/encyclopedia/contaminantConfig'
import { NavButtons } from './NavButtons'

interface StepProps {
  data: Partial<WaterInput>
  update: (patch: Partial<WaterInput>) => void
  onNext: () => void
  onBack: () => void
}

interface Symptom {
  key: string
  Icon: LucideIcon
  contaminants: ContaminantId[]
}

const SYMPTOMS: Symptom[] = [
  { key: 'turbid',       Icon: Layers,      contaminants: ['turbidity', 'sediment'] },
  { key: 'odor',         Icon: Wind,        contaminants: ['hydrogen_sulfide', 'chlorine', 'iron', 'manganese', 'vocs'] },
  { key: 'rust',         Icon: Wrench,      contaminants: ['iron', 'manganese'] },
  { key: 'unsafe',       Icon: ShieldAlert, contaminants: ['bacteria', 'viruses', 'protozoa'] },
  { key: 'chemical',     Icon: FlaskConical,contaminants: ['lead', 'arsenic', 'nitrates', 'pesticides', 'pfas'] },
  { key: 'hardness',     Icon: Gem,         contaminants: ['hardness'] },
  { key: 'radiological', Icon: Zap,         contaminants: ['uranium', 'radon', 'radionuclides'] },
  { key: 'unknown',      Icon: HelpCircle,  contaminants: [] },
]

const POPULAR_BY_SOURCE: Record<WaterSourceType, ContaminantId[]> = {
  well:   ['iron', 'manganese', 'bacteria', 'nitrates', 'arsenic', 'hardness'],
  river:  ['bacteria', 'turbidity', 'protozoa', 'sediment', 'pesticides', 'nitrates'],
  tap:    ['chlorine', 'hardness', 'lead', 'nitrates', 'turbidity', 'chloramines'],
  rain:   ['bacteria', 'turbidity', 'sediment', 'pesticides', 'nitrates', 'vocs'],
  pond:   ['bacteria', 'turbidity', 'protozoa', 'cyanobacteria', 'sediment', 'nitrates'],
  spring: ['bacteria', 'turbidity', 'protozoa', 'sediment', 'arsenic', 'hardness'],
}

type RawContaminant = { id: string; nameKey: string; icon: string; color: string }

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

function ContamRow({
  id, color, name, active, onToggle,
}: { id: string; color: string; name: string; active: boolean; onToggle: () => void }) {
  return (
    <button
      className={`w-full px-3 py-2.5 text-left flex items-center gap-3 transition-colors ${
        active ? 'bg-sky-500/10 text-white' : 'text-slate-300 hover:bg-slate-800/60'
      }`}
      onClick={onToggle}
    >
      <ContamIcon id={id} color={color} />
      <span className="text-sm flex-1 text-left leading-snug">{name}</span>
      <div className={`w-4 h-4 rounded-full border flex-shrink-0 flex items-center justify-center transition-colors ${
        active ? 'bg-sky-500 border-sky-500' : 'border-slate-600'
      }`}>
        {active && <Check size={9} strokeWidth={3} className="text-white" />}
      </div>
    </button>
  )
}

export function StepProblems({ data, update, onNext, onBack }: StepProps) {
  const { t } = useTranslation()
  const [screen, setScreen] = useState<'symptoms' | 'refine'>('symptoms')
  const [selectedSymptoms, setSelectedSymptoms] = useState<string[]>([])
  const [search, setSearch] = useState('')
  const [showAll, setShowAll] = useState(false)

  const selected = data.contaminants ?? []
  const allContaminants = contaminants as RawContaminant[]

  const toggleSymptom = (key: string) =>
    setSelectedSymptoms(prev =>
      prev.includes(key) ? prev.filter(s => s !== key) : [...prev, key],
    )

  const proceedToRefine = () => {
    const showAll = selectedSymptoms.includes('unknown')
    if (showAll) {
      update({ contaminants: [] })
    } else {
      const fromSymptoms = [...new Set(
        SYMPTOMS
          .filter(s => selectedSymptoms.includes(s.key))
          .flatMap(s => s.contaminants),
      )]
      update({ contaminants: fromSymptoms })
    }
    setScreen('refine')
  }

  const popular = POPULAR_BY_SOURCE[data.source as WaterSourceType] ?? []

  const toggle = (id: ContaminantId) => {
    const next = selected.includes(id) ? selected.filter(c => c !== id) : [...selected, id]
    update({ contaminants: next })
  }

  const isSearching = search.trim().length > 0

  const searchResults = useMemo(() => {
    if (!isSearching) return []
    const q = search.toLowerCase()
    return allContaminants.filter(c => t(c.nameKey).toLowerCase().includes(q))
  }, [search, isSearching, t, allContaminants])

  // Items for browse mode (no search)
  const selectedItems = allContaminants.filter(c => selected.includes(c.id as ContaminantId))
  const popularUnselected = popular
    .filter(id => !selected.includes(id as ContaminantId))
    .map(id => allContaminants.find(c => c.id === id))
    .filter((c): c is RawContaminant => Boolean(c))
  const restContaminants = allContaminants.filter(
    c => !selected.includes(c.id as ContaminantId) && !popular.includes(c.id as ContaminantId),
  )

  if (screen === 'symptoms') {
    return (
      <div className="space-y-5">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-white">{t('configurator.steps.problems.symptomsTitle')}</h2>
          <p className="text-slate-400 text-sm mt-1">{t('configurator.steps.problems.symptomsDescription')}</p>
        </div>
        <div className="grid grid-cols-2 gap-2.5">
          {SYMPTOMS.map(s => {
            const active = selectedSymptoms.includes(s.key)
            const { Icon } = s
            return (
              <motion.button
                key={s.key}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.97 }}
                className={`relative p-3 rounded-xl border text-left flex flex-col gap-2 transition-colors ${
                  active
                    ? 'border-sky-500 bg-sky-500/10 text-white'
                    : 'border-slate-700/60 bg-slate-800/40 text-slate-300 hover:border-slate-600 hover:bg-slate-800/70'
                }`}
                onClick={() => toggleSymptom(s.key)}
              >
                {active && (
                  <div className="absolute top-2 right-2 w-4 h-4 rounded-full bg-sky-500 flex items-center justify-center">
                    <Check size={9} strokeWidth={3} className="text-white" />
                  </div>
                )}
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${
                  active ? 'bg-sky-500/20' : 'bg-slate-700/50'
                }`}>
                  <Icon size={16} className={active ? 'text-sky-400' : 'text-slate-400'} strokeWidth={1.5} />
                </div>
                <span className="text-sm font-medium leading-snug pr-4">{t(`configurator.symptoms.${s.key}`)}</span>
              </motion.button>
            )
          })}
        </div>
        <NavButtons onBack={onBack} onNext={proceedToRefine} canNext={selectedSymptoms.length > 0} />
      </div>
    )
  }

  const sourceName = t(`configurator.sources.${data.source ?? 'well'}`)

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-xl sm:text-2xl font-bold text-white">{t('configurator.steps.problems.refineTitle')}</h2>
        <p className="text-slate-400 text-sm mt-1">{t('configurator.steps.problems.refineDescription')}</p>
      </div>

      {/* Search */}
      <div className="relative">
        <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none" />
        <input
          type="text"
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder={t('configurator.steps.problems.searchPlaceholder')}
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

      {/* List area */}
      <div className="rounded-xl border border-slate-800 bg-slate-900 overflow-hidden max-h-[42vh] sm:max-h-72 overflow-y-auto">
        {isSearching ? (
          searchResults.length > 0 ? (
            <div className="divide-y divide-slate-800/60">
              {searchResults.map(c => (
                <ContamRow
                  key={c.id}
                  id={c.id}
                  color={c.color}
                  name={t(c.nameKey)}
                  active={selected.includes(c.id as ContaminantId)}
                  onToggle={() => toggle(c.id as ContaminantId)}
                />
              ))}
            </div>
          ) : (
            <p className="px-4 py-6 text-center text-sm text-slate-600">No contaminants found</p>
          )
        ) : (
          <div className="divide-y divide-slate-800/60">
            {/* Selected */}
            {selectedItems.length > 0 && (
              <>
                <div className="px-3 py-1.5 bg-slate-800/50 flex items-center gap-2">
                  <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                    {t('configurator.steps.problems.selectedCount', { count: selectedItems.length })}
                  </span>
                </div>
                {selectedItems.map(c => (
                  <ContamRow
                    key={c.id}
                    id={c.id}
                    color={c.color}
                    name={t(c.nameKey)}
                    active
                    onToggle={() => toggle(c.id as ContaminantId)}
                  />
                ))}
              </>
            )}

            {/* Popular unselected */}
            {popularUnselected.length > 0 && (
              <>
                <div className="px-3 py-1.5 bg-slate-800/50">
                  <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                    {t('configurator.steps.problems.popular', { source: sourceName })}
                  </span>
                </div>
                {popularUnselected.map(c => (
                  <ContamRow
                    key={c.id}
                    id={c.id}
                    color={c.color}
                    name={t(c.nameKey)}
                    active={false}
                    onToggle={() => toggle(c.id as ContaminantId)}
                  />
                ))}
              </>
            )}

            {/* Show all toggle */}
            {restContaminants.length > 0 && (
              <>
                <button
                  onClick={() => setShowAll(v => !v)}
                  className="w-full px-3 py-2.5 flex items-center gap-2 text-slate-400 hover:text-sky-400 hover:bg-slate-800/40 transition-colors text-sm"
                >
                  <ChevronDown
                    size={14}
                    className={`transition-transform duration-200 ${showAll ? 'rotate-180' : ''}`}
                  />
                  {showAll
                    ? t('configurator.steps.problems.showLess', { defaultValue: 'Show less' })
                    : t('configurator.steps.problems.showMore', {
                        count: restContaminants.length,
                        defaultValue: `Show ${restContaminants.length} more`,
                      })
                  }
                </button>
                {showAll && restContaminants.map(c => (
                  <ContamRow
                    key={c.id}
                    id={c.id}
                    color={c.color}
                    name={t(c.nameKey)}
                    active={selected.includes(c.id as ContaminantId)}
                    onToggle={() => toggle(c.id as ContaminantId)}
                  />
                ))}
              </>
            )}
          </div>
        )}
      </div>

      <NavButtons onBack={() => setScreen('symptoms')} onNext={onNext} canNext={selected.length > 0} />
    </div>
  )
}
