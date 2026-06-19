import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Backpack, Monitor, SlidersHorizontal, Home, Zap, ChevronLeft, ArrowRight } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import type { WaterInput, TreatmentScope } from '@/types'
import { OptionRow, OptionList } from './OptionRow'

interface StepProps {
  data: Partial<WaterInput>
  update: (patch: Partial<WaterInput>) => void
  onNext: () => void
  onBack: () => void
}

const SCOPES: { id: TreatmentScope; Icon: LucideIcon; color: string }[] = [
  { id: 'portable',    Icon: Backpack,          color: '#10b981' },
  { id: 'countertop',  Icon: Monitor,           color: '#38bdf8' },
  { id: 'under_sink',  Icon: SlidersHorizontal, color: '#a78bfa' },
  { id: 'whole_house', Icon: Home,              color: '#f59e0b' },
  { id: 'emergency',   Icon: Zap,               color: '#f43f5e' },
]

export function StepScope({ data, update, onNext, onBack }: StepProps) {
  const { t } = useTranslation()
  const [pending, setPending] = useState<TreatmentScope | null>(null)

  const handleSelect = (id: TreatmentScope) => {
    setPending(id)
    update({ scope: id })
    setTimeout(onNext, 200)
  }

  const handleSkip = () => {
    update({ scope: undefined })
    onNext()
  }

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-xl sm:text-2xl font-bold text-white">
          {t('configurator.steps.scope.title')}
        </h2>
        <p className="text-slate-400 text-sm mt-1">
          {t('configurator.steps.scope.description')}
        </p>
      </div>
      <OptionList>
        {SCOPES.map(({ id, Icon, color }) => (
          <OptionRow
            key={id}
            Icon={Icon}
            iconColor={color}
            label={t(`configurator.scope.${id}.label`)}
            description={t(`configurator.scope.${id}.description`)}
            selected={pending === id || (pending === null && data.scope === id)}
            onClick={() => handleSelect(id)}
          />
        ))}
      </OptionList>
      <div className="flex gap-3 pt-2">
        <button
          onClick={onBack}
          className="flex items-center justify-center gap-1 min-w-[88px] px-4 py-3 rounded-xl border border-slate-700/60 text-slate-400 hover:text-white hover:border-slate-500 text-sm font-medium transition-colors"
        >
          <ChevronLeft size={15} strokeWidth={2} />
          {t('common.back')}
        </button>
        <button
          onClick={handleSkip}
          className="px-4 py-3 rounded-xl border border-slate-800 text-slate-500 hover:text-slate-300 hover:border-slate-700 text-sm transition-colors"
        >
          {t('configurator.steps.scope.skip')}
        </button>
        <button
          onClick={onNext}
          disabled={!data.scope}
          className="flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl text-sm font-semibold transition-all disabled:opacity-40 disabled:cursor-not-allowed bg-sky-600 hover:bg-sky-500 text-white"
        >
          {t('common.next')}
          <ArrowRight size={14} strokeWidth={2.2} />
        </button>
      </div>
    </div>
  )
}
