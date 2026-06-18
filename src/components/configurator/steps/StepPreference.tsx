import { useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { Button } from '@/components/ui/Button'
import type { WaterInput, OptimizationPreference } from '@/types'

interface StepPreferenceProps {
  data: Partial<WaterInput>
  update: (patch: Partial<WaterInput>) => void
  onNext: () => void
  onBack: () => void
}

const OPTIONS: { id: OptimizationPreference; icon: string }[] = [
  { id: 'cost',     icon: '💰' },
  { id: 'coverage', icon: '🎯' },
]

export function StepPreference({ data, update, onBack, onNext }: StepPreferenceProps) {
  const { t } = useTranslation()

  useEffect(() => {
    if (!data.preference) update({ preference: 'cost' })
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const preference = data.preference ?? 'cost'

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-2xl font-bold text-white">{t('configurator.steps.preference.title')}</h2>
        <p className="text-sm text-slate-400 mt-1">{t('configurator.steps.preference.description')}</p>
      </div>

      <div className="grid grid-cols-1 gap-3">
        {OPTIONS.map(({ id, icon }) => (
          <button
            key={id}
            onClick={() => update({ preference: id })}
            className={`p-4 rounded-xl border text-left transition-all ${
              preference === id
                ? 'border-sky-500 bg-sky-500/10 text-white'
                : 'border-slate-700 bg-slate-800/60 text-slate-300 hover:border-slate-500'
            }`}
          >
            <div className="flex items-center gap-3 mb-1">
              <span className="text-xl">{icon}</span>
              <span className="font-semibold text-sm">{t(`configurator.budget.preference.${id}`)}</span>
            </div>
            <p className="text-xs text-slate-400 ml-8">{t(`configurator.budget.preference.${id}_description`)}</p>
          </button>
        ))}
      </div>

      <div className="flex gap-3 pt-1">
        <Button variant="dark-secondary" onClick={onBack} className="flex-1">{t('common.back')}</Button>
        <button
          onClick={onNext}
          className="flex-1 inline-flex items-center justify-center font-semibold rounded-lg transition-colors px-4 py-2 text-sm bg-sky-600 hover:bg-sky-500 text-white"
        >
          {t('configurator.getResults')}
        </button>
      </div>
    </div>
  )
}
