import { useTranslation } from 'react-i18next'
import { Button } from '@/components/ui/Button'
import type { WaterInput, WaterSourceType } from '@/types'

interface StepProps {
  data: Partial<WaterInput>
  update: (patch: Partial<WaterInput>) => void
  onNext: () => void
  onBack: () => void
}

const SOURCES: WaterSourceType[] = ['well', 'river', 'rain', 'tap', 'pond', 'spring']

export function StepWaterSource({ data, update, onNext, onBack }: StepProps) {
  const { t } = useTranslation()

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold text-gray-900">{t('configurator.steps.source.title')}</h2>
      <div className="grid grid-cols-2 gap-3">
        {SOURCES.map(source => (
          <button
            key={source}
            className={`p-4 rounded-lg border-2 text-left transition-colors ${data.source === source ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-gray-300'}`}
            onClick={() => update({ source })}
          >
            <span className="font-medium text-sm text-gray-800">{t(`configurator.sources.${source}`)}</span>
          </button>
        ))}
      </div>
      <div className="flex gap-3">
        <Button variant="secondary" onClick={onBack} className="flex-1">{t('common.back')}</Button>
        <Button onClick={onNext} disabled={!data.source} className="flex-1">{t('common.next')}</Button>
      </div>
    </div>
  )
}
