import { useParams, Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { Badge } from '@/components/ui/Badge'
import { SimulationCanvas } from '@/components/simulation/SimulationCanvas'
import type { FilterType } from '@/components/filter/FilterTypes'
import systemTemplates from '@/data/system-templates.json'
import modules from '@/data/modules.json'

export default function SystemDetail() {
  const { id } = useParams<{ id: string }>()
  const { t } = useTranslation()

  const system = systemTemplates.find(s => s.id === id)
  if (!system) return <div className="p-8 text-gray-500">{t('common.notFound')}</div>

  const allModules = modules as Array<{ id: string; type: FilterType }>
  const filters = system.modules
    .map(mid => allModules.find(m => m.id === mid)?.type)
    .filter((f): f is FilterType => !!f)

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <Link to="/systems" className="text-sm text-blue-600 hover:underline mb-6 block">← {t('systems.back')}</Link>
      <h1 className="text-3xl font-bold text-gray-900 mb-2">{t(system.nameKey)}</h1>
      <Badge variant="info" className="mb-4">{system.budgetTier}</Badge>
      <p className="text-gray-600 mb-8">{t(system.descriptionKey)}</p>
      <SimulationCanvas filters={filters} inputContaminants={system.targetContaminants} />
    </div>
  )
}
