import { motion } from 'framer-motion'
import { useTranslation } from 'react-i18next'
import { Backpack, Monitor, SlidersHorizontal, Home, Zap, Check, ChevronLeft, ArrowRight } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import type { WaterInput, TreatmentScope } from '@/types'

interface StepProps {
  data: Partial<WaterInput>
  update: (patch: Partial<WaterInput>) => void
  onNext: () => void
  onBack: () => void
}

const SCOPES: { id: TreatmentScope; Icon: LucideIcon; color: string }[] = [
  { id: 'portable',   Icon: Backpack,          color: '#10b981' },
  { id: 'countertop', Icon: Monitor,           color: '#38bdf8' },
  { id: 'under_sink', Icon: SlidersHorizontal, color: '#a78bfa' },
  { id: 'whole_house',Icon: Home,              color: '#f59e0b' },
  { id: 'emergency',  Icon: Zap,               color: '#f43f5e' },
]

export function StepScope({ data, update, onNext, onBack }: StepProps) {
  const { t } = useTranslation()

  const handleSelect = (id: TreatmentScope) => {
    update({ scope: id })
    setTimeout(onNext, 180)
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

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 sm:gap-3">
        {SCOPES.map(({ id, Icon, color }) => {
          const selected = data.scope === id
          return (
            <motion.button
              key={id}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.97 }}
              className={`relative p-3 sm:p-5 rounded-xl border text-left flex flex-col gap-2 sm:gap-3 transition-colors ${
                selected
                  ? 'border-sky-500 bg-sky-500/10 text-white'
                  : 'border-slate-700/60 bg-slate-800/40 text-slate-300 hover:border-slate-600 hover:bg-slate-800/70'
              }`}
              onClick={() => handleSelect(id)}
            >
              {selected && (
                <div className="absolute top-2 right-2 w-4 h-4 rounded-full bg-sky-500 flex items-center justify-center">
                  <Check size={9} strokeWidth={3} className="text-white" />
                </div>
              )}
              <div
                className="w-9 h-9 sm:w-12 sm:h-12 rounded-xl flex items-center justify-center"
                style={{ backgroundColor: `${color}1a` }}
              >
                <Icon
                  size={18}
                  style={{ color: selected ? color : undefined }}
                  className={selected ? '' : 'text-slate-400'}
                  strokeWidth={1.5}
                />
              </div>
              <span className="font-medium text-sm sm:text-base pr-4">
                {t(`configurator.scope.${id}`)}
              </span>
            </motion.button>
          )
        })}
      </div>

      {/* Custom nav: Back | Skip | Next */}
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
