import { useTranslation } from 'react-i18next'
import { Button } from '@/components/ui/Button'
import type { WaterInput, BudgetTier } from '@/types'

interface StepProps {
  data: Partial<WaterInput>
  update: (patch: Partial<WaterInput>) => void
  onNext: () => void
  onBack: () => void
}

const TIERS: BudgetTier[] = ['low', 'medium', 'high']

export function StepBudget({ data, update, onBack, onNext }: StepProps) {
  const { t } = useTranslation()

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold text-gray-900">{t('configurator.steps.budget.title')}</h2>
      <div className="space-y-3">
        {TIERS.map(tier => (
          <button
            key={tier}
            className={`w-full p-4 rounded-lg border-2 text-left transition-colors ${data.budget === tier ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-gray-300'}`}
            onClick={() => update({ budget: tier })}
          >
            <div className="font-medium text-gray-800">{t(`configurator.budget.${tier}.label`)}</div>
            <div className="text-sm text-gray-500 mt-0.5">{t(`configurator.budget.${tier}.description`)}</div>
          </button>
        ))}
      </div>
      <div className="flex gap-3">
        <Button variant="secondary" onClick={onBack} className="flex-1">{t('common.back')}</Button>
        <Button onClick={onNext} disabled={!data.budget} className="flex-1">{t('common.next')}</Button>
      </div>
    </div>
  )
}
