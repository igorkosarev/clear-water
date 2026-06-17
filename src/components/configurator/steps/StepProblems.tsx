import { useState, useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { Search } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import type { WaterInput, ContaminantId, WaterSourceType } from '@/types'
import contaminants from '@/data/contaminants.json'

interface StepProps {
  data: Partial<WaterInput>
  update: (patch: Partial<WaterInput>) => void
  onNext: () => void
  onBack: () => void
}

interface Symptom {
  key: string
  icon: string
  contaminants: ContaminantId[]
}

const SYMPTOMS: Symptom[] = [
  { key: 'turbid',       icon: '🌊', contaminants: ['turbidity', 'sediment'] },
  { key: 'odor',         icon: '👃', contaminants: ['hydrogen_sulfide', 'chlorine', 'iron', 'manganese', 'vocs'] },
  { key: 'rust',         icon: '🔩', contaminants: ['iron', 'manganese'] },
  { key: 'unsafe',       icon: '⚠️', contaminants: ['bacteria', 'viruses', 'protozoa'] },
  { key: 'chemical',     icon: '⚗️', contaminants: ['lead', 'arsenic', 'nitrates', 'pesticides', 'pfas'] },
  { key: 'hardness',     icon: '💎', contaminants: ['hardness'] },
  { key: 'radiological', icon: '☢️', contaminants: ['uranium', 'radon', 'radionuclides'] },
  { key: 'unknown',      icon: '❓', contaminants: [] },
]

const POPULAR_BY_SOURCE: Record<WaterSourceType, ContaminantId[]> = {
  well:   ['iron', 'manganese', 'bacteria', 'nitrates', 'arsenic', 'hardness'],
  river:  ['bacteria', 'turbidity', 'protozoa', 'sediment', 'pesticides', 'nitrates'],
  tap:    ['chlorine', 'hardness', 'lead', 'nitrates', 'turbidity', 'chloramines'],
  rain:   ['bacteria', 'turbidity', 'sediment', 'pesticides', 'nitrates', 'vocs'],
  pond:   ['bacteria', 'turbidity', 'protozoa', 'cyanobacteria', 'sediment', 'nitrates'],
  spring: ['bacteria', 'turbidity', 'protozoa', 'sediment', 'arsenic', 'hardness'],
}

type RawContaminant = { id: string; nameKey: string; icon: string }

const PrimaryButton = ({ onClick, disabled, children }: { onClick: () => void; disabled?: boolean; children: React.ReactNode }) => (
  <button
    onClick={onClick}
    disabled={disabled}
    className="flex-1 inline-flex items-center justify-center font-medium rounded-lg transition-colors px-4 py-2 text-sm bg-sky-600 hover:bg-sky-500 text-white disabled:opacity-50 disabled:cursor-not-allowed"
  >
    {children}
  </button>
)

export function StepProblems({ data, update, onNext, onBack }: StepProps) {
  const { t } = useTranslation()
  const [screen, setScreen] = useState<'symptoms' | 'refine'>('symptoms')
  const [selectedSymptoms, setSelectedSymptoms] = useState<string[]>([])
  const [search, setSearch] = useState('')

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

  const filtered = useMemo(() => {
    if (!search.trim()) return []
    const q = search.toLowerCase()
    return allContaminants.filter(c => t(c.nameKey).toLowerCase().includes(q))
  }, [search, t, allContaminants])

  if (screen === 'symptoms') {
    return (
      <div className="space-y-4">
        <h2 className="text-2xl font-bold text-white">{t('configurator.steps.problems.symptomsTitle')}</h2>
        <p className="text-slate-400 text-sm">{t('configurator.steps.problems.symptomsDescription')}</p>
        <div className="grid grid-cols-2 gap-2">
          {SYMPTOMS.map(s => {
            const active = selectedSymptoms.includes(s.key)
            return (
              <button
                key={s.key}
                className={`p-3 rounded-xl border text-left transition-all ${
                  active
                    ? 'border-sky-500 bg-sky-500/10 text-white'
                    : 'border-slate-700 bg-slate-800/60 text-slate-300 hover:border-slate-500'
                }`}
                onClick={() => toggleSymptom(s.key)}
              >
                <span className="text-lg mr-2">{s.icon}</span>
                <span className="text-sm font-medium">{t(`configurator.symptoms.${s.key}`)}</span>
              </button>
            )
          })}
        </div>
        <div className="flex gap-3 pt-2">
          <Button variant="dark-secondary" onClick={onBack} className="flex-1">{t('common.back')}</Button>
          <PrimaryButton onClick={proceedToRefine} disabled={selectedSymptoms.length === 0}>
            {t('common.next')}
          </PrimaryButton>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-2xl font-bold text-white">{t('configurator.steps.problems.refineTitle')}</h2>
        <p className="text-slate-400 text-sm mt-1">{t('configurator.steps.problems.refineDescription')}</p>
      </div>

      <div>
        <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
          {t('configurator.steps.problems.popular', { source: t(`configurator.sources.${data.source ?? 'well'}`) })}
        </p>
        <div className="grid grid-cols-2 gap-2">
          {popular.map(id => {
            const c = allContaminants.find(x => x.id === id)
            if (!c) return null
            const active = selected.includes(id)
            return (
              <button
                key={id}
                className={`p-3 rounded-xl border text-left flex items-center gap-2 transition-all ${
                  active
                    ? 'border-sky-500 bg-sky-500/10 text-white'
                    : 'border-slate-700 bg-slate-800/60 text-slate-300 hover:border-slate-500'
                }`}
                onClick={() => toggle(id)}
              >
                <span>{c.icon}</span>
                <span className="text-sm font-medium">{t(c.nameKey)}</span>
              </button>
            )
          })}
        </div>
      </div>

      <div>
        <div className="relative">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none" />
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder={t('configurator.steps.problems.searchPlaceholder')}
            className="w-full pl-9 pr-4 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:border-sky-500 transition-colors"
          />
        </div>
        {filtered.length > 0 && (
          <div className="mt-2 space-y-1 max-h-44 overflow-y-auto rounded-xl border border-slate-700">
            {filtered.map(c => {
              const active = selected.includes(c.id)
              return (
                <button
                  key={c.id}
                  className={`w-full px-3 py-2.5 text-left flex items-center gap-2 transition-all first:rounded-t-xl last:rounded-b-xl ${
                    active
                      ? 'bg-sky-500/10 text-white'
                      : 'bg-slate-800/60 text-slate-300 hover:bg-slate-800'
                  }`}
                  onClick={() => toggle(c.id)}
                >
                  <span>{c.icon}</span>
                  <span className="text-sm">{t(c.nameKey)}</span>
                </button>
              )
            })}
          </div>
        )}
      </div>

      {selected.length > 0 && (
        <p className="text-xs text-slate-500">
          {t('configurator.steps.problems.selectedCount', { count: selected.length })}
        </p>
      )}

      <div className="flex gap-3 pt-1">
        <Button variant="dark-secondary" onClick={() => setScreen('symptoms')} className="flex-1">
          {t('common.back')}
        </Button>
        <PrimaryButton onClick={onNext} disabled={selected.length === 0}>
          {t('common.next')}
        </PrimaryButton>
      </div>
    </div>
  )
}
