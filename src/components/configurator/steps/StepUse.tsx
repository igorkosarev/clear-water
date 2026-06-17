import { useTranslation } from 'react-i18next'
import { Button } from '@/components/ui/Button'
import type { WaterInput, WaterUseType } from '@/types'

interface StepProps {
  data: Partial<WaterInput>
  update: (patch: Partial<WaterInput>) => void
  onNext: () => void
  onBack: () => void
}

const USES: { id: WaterUseType; icon: string }[] = [
  { id: 'drinking',   icon: '🥤' },
  { id: 'cooking',    icon: '🍳' },
  { id: 'irrigation', icon: '🌱' },
  { id: 'livestock',  icon: '🐄' },
]

export function StepUse({ data, update, onNext, onBack }: StepProps) {
  const { t } = useTranslation()

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold text-white">{t('configurator.steps.use.title')}</h2>
      <div className="grid grid-cols-2 gap-2">
        {USES.map(({ id, icon }) => (
          <button
            key={id}
            className={`p-4 rounded-xl border text-left transition-all ${
              data.use === id
                ? 'border-sky-500 bg-sky-500/10 text-white'
                : 'border-slate-700 bg-slate-800/60 text-slate-300 hover:border-slate-500'
            }`}
            onClick={() => update({ use: id })}
          >
            <span className="text-2xl mb-1 block">{icon}</span>
            <span className="font-medium text-sm">{t(`configurator.uses.${id}`)}</span>
          </button>
        ))}
      </div>
      <div className="flex gap-3 pt-2">
        <Button variant="dark-secondary" onClick={onBack} className="flex-1">{t('common.back')}</Button>
        <button
          onClick={onNext}
          disabled={!data.use}
          className="flex-1 inline-flex items-center justify-center font-medium rounded-lg transition-colors px-4 py-2 text-sm bg-sky-600 hover:bg-sky-500 text-white disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {t('common.next')}
        </button>
      </div>
    </div>
  )
}
