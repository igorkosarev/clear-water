import { useTranslation } from 'react-i18next'
import { SystemDiagram } from './SystemDiagram'
import { BOMTable } from './BOMTable'
import type { RankedRecommendation } from '@/types'

interface ResultPanelProps {
  recommendation: RankedRecommendation
}

export function ResultPanel({ recommendation }: ResultPanelProps) {
  const { t } = useTranslation()

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">{t('result.title')}</h2>
        <p className="text-gray-500">{t('result.subtitle')}</p>
      </div>
      <SystemDiagram recommendation={recommendation} />
      <BOMTable recommendation={recommendation} />
    </div>
  )
}
