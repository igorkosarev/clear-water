import { useEffect } from 'react'
import { motion } from 'framer-motion'
import { useTranslation } from 'react-i18next'
import { DollarSign, Target, Check } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import type { WaterInput, OptimizationPreference } from '@/types'
import { NavButtons } from './NavButtons'

interface StepPreferenceProps {
  data: Partial<WaterInput>
  update: (patch: Partial<WaterInput>) => void
  onNext: () => void
  onBack: () => void
}

const OPTIONS: { id: OptimizationPreference; Icon: LucideIcon; color: string }[] = [
  { id: 'cost',     Icon: DollarSign, color: '#10b981' },
  { id: 'coverage', Icon: Target,     color: '#38bdf8' },
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
        {OPTIONS.map(({ id, Icon, color }) => {
          const selected = preference === id
          return (
            <motion.button
              key={id}
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.99 }}
              onClick={() => update({ preference: id })}
              className={`relative p-4 rounded-xl border text-left flex items-start gap-4 transition-colors ${
                selected
                  ? 'border-sky-500 bg-sky-500/10 text-white'
                  : 'border-slate-700/60 bg-slate-800/40 text-slate-300 hover:border-slate-600 hover:bg-slate-800/70'
              }`}
            >
              {selected && (
                <div className="absolute top-3 right-3 w-4 h-4 rounded-full bg-sky-500 flex items-center justify-center">
                  <Check size={9} strokeWidth={3} className="text-white" />
                </div>
              )}
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5"
                style={{ backgroundColor: `${color}1a` }}
              >
                <Icon size={20} style={{ color: selected ? color : undefined }} className={selected ? '' : 'text-slate-500'} strokeWidth={1.5} />
              </div>
              <div className="pr-6">
                <div className="font-semibold text-sm mb-1">
                  {t(`configurator.budget.preference.${id}`)}
                </div>
                <p className="text-xs text-slate-400 leading-relaxed">
                  {t(`configurator.budget.preference.${id}_description`)}
                </p>
              </div>
            </motion.button>
          )
        })}
      </div>

      <NavButtons onBack={onBack} onNext={onNext} isFinal />
    </div>
  )
}
