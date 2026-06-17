import { useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { Button } from '@/components/ui/Button'
import type { WaterInput, BudgetTier, OptimizationPreference } from '@/types'

interface StepProps {
  data: Partial<WaterInput>
  update: (patch: Partial<WaterInput>) => void
  onNext: () => void
  onBack: () => void
}

const TIERS: BudgetTier[] = ['low', 'medium', 'high']
const PREFERENCES: { id: OptimizationPreference; icon: string }[] = [
  { id: 'cost',     icon: '💰' },
  { id: 'coverage', icon: '🎯' },
]

export function StepBudget({ data, update, onBack, onNext }: StepProps) {
  const { t } = useTranslation()

  // Default preference to 'cost' on first render
  useEffect(() => {
    if (!data.preference) update({ preference: 'cost' })
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const preference = data.preference ?? 'cost'

  return (
    <div className="space-y-5">
      <h2 className="text-2xl font-bold text-white">{t('configurator.steps.budget.title')}</h2>

      <div className="space-y-2">
        {TIERS.map(tier => (
          <button
            key={tier}
            className={`w-full p-4 rounded-xl border text-left transition-all ${
              data.budget === tier
                ? 'border-sky-500 bg-sky-500/10 text-white'
                : 'border-slate-700 bg-slate-800/60 text-slate-300 hover:border-slate-500'
            }`}
            onClick={() => update({ budget: tier })}
          >
            <div className="font-medium text-sm">{t(`configurator.budget.${tier}.label`)}</div>
            <div className="text-xs text-slate-400 mt-0.5">{t(`configurator.budget.${tier}.description`)}</div>
          </button>
        ))}
      </div>

      <div>
        <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
          {t('configurator.budget.preference.label')}
        </p>
        <div className="grid grid-cols-2 gap-2">
          {PREFERENCES.map(({ id, icon }) => (
            <button
              key={id}
              onClick={() => update({ preference: id })}
              className={`p-3 rounded-xl border text-left transition-all ${
                preference === id
                  ? 'border-sky-500 bg-sky-500/10 text-white'
                  : 'border-slate-700 bg-slate-800/60 text-slate-300 hover:border-slate-500'
              }`}
            >
              <span className="text-base mr-2">{icon}</span>
              <span className="text-sm font-medium">{t(`configurator.budget.preference.${id}`)}</span>
              <p className="text-xs text-slate-400 mt-0.5">{t(`configurator.budget.preference.${id}_description`)}</p>
            </button>
          ))}
        </div>
      </div>

      <div className="flex gap-3 pt-1">
        <Button variant="dark-secondary" onClick={onBack} className="flex-1">{t('common.back')}</Button>
        <button
          onClick={onNext}
          disabled={!data.budget}
          className="flex-1 inline-flex items-center justify-center font-medium rounded-lg transition-colors px-4 py-2 text-sm bg-sky-600 hover:bg-sky-500 text-white disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {t('common.next')}
        </button>
      </div>
    </div>
  )
}
