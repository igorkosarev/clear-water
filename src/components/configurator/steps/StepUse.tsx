import { motion } from 'framer-motion'
import { useTranslation } from 'react-i18next'
import { Droplet, Utensils, Sprout, PawPrint, Check } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import type { WaterInput, WaterUseType } from '@/types'
import { NavButtons } from './NavButtons'

interface StepProps {
  data: Partial<WaterInput>
  update: (patch: Partial<WaterInput>) => void
  onNext: () => void
  onBack: () => void
}

const USES: { id: WaterUseType; Icon: LucideIcon }[] = [
  { id: 'drinking',   Icon: Droplet  },
  { id: 'cooking',    Icon: Utensils },
  { id: 'irrigation', Icon: Sprout   },
  { id: 'livestock',  Icon: PawPrint },
]

export function StepUse({ data, update, onNext, onBack }: StepProps) {
  const { t } = useTranslation()

  const handleSelect = (id: WaterUseType) => {
    update({ use: id })
    setTimeout(onNext, 180)
  }

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-xl sm:text-2xl font-bold text-white">{t('configurator.steps.use.title')}</h2>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 sm:gap-3">
        {USES.map(({ id, Icon }) => {
          const selected = data.use === id
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
              <div className={`w-9 h-9 sm:w-12 sm:h-12 rounded-xl flex items-center justify-center ${
                selected ? 'bg-sky-500/20' : 'bg-slate-700/50'
              }`}>
                <Icon size={18} className={selected ? 'text-sky-400' : 'text-slate-400'} strokeWidth={1.5} />
              </div>
              <span className="font-medium text-sm sm:text-base">{t(`configurator.uses.${id}`)}</span>
            </motion.button>
          )
        })}
      </div>
      <NavButtons onBack={onBack} onNext={onNext} canNext={!!data.use} />
    </div>
  )
}
