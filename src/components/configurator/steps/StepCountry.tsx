import { useTranslation } from 'react-i18next'
import { Button } from '@/components/ui/Button'
import type { WaterInput } from '@/types'

interface StepProps {
  data: Partial<WaterInput>
  update: (patch: Partial<WaterInput>) => void
  onNext: () => void
  onBack: () => void
}

export function StepCountry({ data, update, onNext }: StepProps) {
  const { t } = useTranslation()

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold text-gray-900">{t('configurator.steps.country.title')}</h2>
      <p className="text-gray-500">{t('configurator.steps.country.description')}</p>
      <input
        type="text"
        className="w-full border border-gray-300 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        placeholder={t('configurator.steps.country.placeholder')}
        value={data.country ?? ''}
        onChange={e => update({ country: e.target.value })}
      />
      <Button onClick={onNext} disabled={!data.country} className="w-full">
        {t('common.next')}
      </Button>
    </div>
  )
}
