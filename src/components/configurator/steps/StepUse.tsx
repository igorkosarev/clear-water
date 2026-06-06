import { useTranslation } from 'react-i18next'
import { Button } from '@/components/ui/Button'
import type { WaterInput, WaterUseType } from '@/types'

interface StepProps {
  data: Partial<WaterInput>
  update: (patch: Partial<WaterInput>) => void
  onNext: () => void
  onBack: () => void
}

const USES: WaterUseType[] = ['drinking', 'cooking', 'irrigation', 'livestock']

export function StepUse({ data, update, onNext, onBack }: StepProps) {
  const { t } = useTranslation()

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold text-gray-900">{t('configurator.steps.use.title')}</h2>
      <div className="grid grid-cols-2 gap-3">
        {USES.map(use => (
          <button
            key={use}
            className={`p-4 rounded-lg border-2 text-left transition-colors ${data.use === use ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-gray-300'}`}
            onClick={() => update({ use })}
          >
            <span className="font-medium text-sm text-gray-800">{t(`configurator.uses.${use}`)}</span>
          </button>
        ))}
      </div>
      <div className="flex gap-3">
        <Button variant="secondary" onClick={onBack} className="flex-1">{t('common.back')}</Button>
        <Button onClick={onNext} disabled={!data.use} className="flex-1">{t('common.next')}</Button>
      </div>
    </div>
  )
}
