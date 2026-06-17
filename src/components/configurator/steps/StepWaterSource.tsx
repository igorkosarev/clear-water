import { useTranslation } from 'react-i18next'
import { Button } from '@/components/ui/Button'
import type { WaterInput, WaterSourceType } from '@/types'

interface StepProps {
  data: Partial<WaterInput>
  update: (patch: Partial<WaterInput>) => void
  onNext: () => void
  onBack: () => void
}

const SOURCES: { id: WaterSourceType; icon: string }[] = [
  { id: 'well', icon: '⛽' },
  { id: 'river', icon: '🏞️' },
  { id: 'rain', icon: '🌧️' },
  { id: 'tap', icon: '🚰' },
  { id: 'pond', icon: '🏊' },
  { id: 'spring', icon: '💧' },
]

export function StepWaterSource({ data, update, onNext, onBack }: StepProps) {
  const { t } = useTranslation()

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold text-white">{t('configurator.steps.source.title')}</h2>
      <div className="grid grid-cols-2 gap-2">
        {SOURCES.map(({ id, icon }) => (
          <button
            key={id}
            className={`p-4 rounded-xl border text-left transition-all ${
              data.source === id
                ? 'border-sky-500 bg-sky-500/10 text-white'
                : 'border-slate-700 bg-slate-800/60 text-slate-300 hover:border-slate-500'
            }`}
            onClick={() => update({ source: id })}
          >
            <span className="text-2xl mb-1 block">{icon}</span>
            <span className="font-medium text-sm">{t(`configurator.sources.${id}`)}</span>
          </button>
        ))}
      </div>
      <div className="flex gap-3 pt-2">
        <Button variant="dark-secondary" onClick={onBack} className="flex-1">{t('common.back')}</Button>
        <Button
          onClick={onNext}
          disabled={!data.source}
          className="flex-1 bg-sky-600 hover:bg-sky-500 text-white border-0 focus:ring-sky-500"
        >
          {t('common.next')}
        </Button>
      </div>
    </div>
  )
}
