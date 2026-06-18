import { motion } from 'framer-motion'
import { useTranslation } from 'react-i18next'
import { FlaskConical, TestTube, HelpCircle, X, Check } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import type { WaterInput, TestingStatus } from '@/types'
import { NavButtons } from './NavButtons'

interface StepProps {
  data: Partial<WaterInput>
  update: (patch: Partial<WaterInput>) => void
  onNext: () => void
  onBack: () => void
}

const OPTIONS: { id: TestingStatus; Icon: LucideIcon; color: string }[] = [
  { id: 'laboratory', Icon: FlaskConical, color: '#10b981' },
  { id: 'home_kit',   Icon: TestTube,    color: '#38bdf8' },
  { id: 'none',       Icon: X,           color: '#f59e0b' },
  { id: 'unknown',    Icon: HelpCircle,  color: '#64748b' },
]

export function StepTestingStatus({ data, update, onNext, onBack }: StepProps) {
  const { t } = useTranslation()

  const handleSelect = (id: TestingStatus) => {
    update({ testingStatus: id })
    setTimeout(onNext, 180)
  }

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-xl sm:text-2xl font-bold text-white">
          {t('configurator.steps.testing.title')}
        </h2>
        <p className="text-slate-400 text-sm mt-1">
          {t('configurator.steps.testing.description')}
        </p>
      </div>

      <div className="grid grid-cols-2 gap-2.5 sm:gap-3">
        {OPTIONS.map(({ id, Icon, color }) => {
          const selected = data.testingStatus === id
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
              <div>
                <span className="font-medium text-sm sm:text-base block pr-4">
                  {t(`configurator.testing.${id}.label`)}
                </span>
                <span className="text-xs text-slate-500 leading-snug block mt-0.5">
                  {t(`configurator.testing.${id}.description`)}
                </span>
              </div>
            </motion.button>
          )
        })}
      </div>

      <NavButtons onBack={onBack} onNext={onNext} canNext={!!data.testingStatus} />
    </div>
  )
}
