import { useParams, Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { SimulationCanvas } from '@/components/simulation/SimulationCanvas'
import type { FilterType } from '@/components/filter/FilterTypes'
import systemTemplates from '@/data/system-templates.json'
import modules from '@/data/modules.json'

const BUDGET_BADGE: Record<string, string> = {
  low:    'text-emerald-400 border-emerald-500/40 bg-emerald-500/10',
  medium: 'text-sky-400 border-sky-500/40 bg-sky-500/10',
  high:   'text-amber-400 border-amber-500/40 bg-amber-500/10',
}

export default function SystemDetail() {
  const { id } = useParams<{ id: string }>()
  const { t } = useTranslation()

  const system = systemTemplates.find(s => s.id === id)
  if (!system) return <div className="p-8 text-slate-400">{t('common.notFound')}</div>

  const allModules = modules as Array<{ id: string; type: FilterType }>
  const filters = system.modules
    .map(mid => allModules.find(m => m.id === mid)?.type)
    .filter((f): f is FilterType => !!f)

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <Link to="/systems" className="text-sm text-slate-400 hover:text-slate-200 transition-colors mb-6 block">
        ← {t('systems.back')}
      </Link>
      <h1 className="text-3xl font-bold text-white mb-2">{t(system.nameKey)}</h1>
      <span className={`inline-block text-xs font-medium px-2.5 py-1 rounded-full border mb-4 ${BUDGET_BADGE[system.budgetTier] ?? ''}`}>
        {system.budgetTier}
      </span>
      <p className="text-slate-400 mb-8">{t(system.descriptionKey)}</p>
      <SimulationCanvas filters={filters} inputContaminants={system.targetContaminants} />
    </div>
  )
}
