import { useTranslation } from 'react-i18next'
import type { RankedRecommendation } from '@/types'
import modules from '@/data/modules.json'

interface BOMTableProps {
  recommendation: RankedRecommendation
}

export function BOMTable({ recommendation }: BOMTableProps) {
  const { t } = useTranslation()
  const allModules = modules as Array<{ id: string; nameKey: string; costUSD: number }>

  const lines = recommendation.template.modules.map(id => {
    const mod = allModules.find(m => m.id === id)
    return mod ? { id, name: t(mod.nameKey), cost: mod.costUSD } : null
  }).filter(Boolean)

  return (
    <div>
      <h3 className="font-semibold text-gray-900 mb-3">{t('result.bom.title')}</h3>
      <div className="border border-gray-200 rounded-lg overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-gray-600">
            <tr>
              <th className="text-left px-4 py-3">{t('result.bom.component')}</th>
              <th className="text-right px-4 py-3">{t('result.bom.cost')}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {lines.map(line => line && (
              <tr key={line.id}>
                <td className="px-4 py-3 text-gray-800">{line.name}</td>
                <td className="px-4 py-3 text-right text-gray-600">${line.cost}</td>
              </tr>
            ))}
            <tr className="bg-gray-50 font-semibold">
              <td className="px-4 py-3">{t('result.bom.total')}</td>
              <td className="px-4 py-3 text-right">${recommendation.estimatedCostUSD}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  )
}
