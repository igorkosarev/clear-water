import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Droplet, Utensils, Sprout, PawPrint, Home, ShowerHead, Zap } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import type { WaterInput, WaterUseType } from '@/types'
import { NavButtons } from './NavButtons'
import { OptionRow, OptionList } from './OptionRow'

interface StepProps {
  data: Partial<WaterInput>
  update: (patch: Partial<WaterInput>) => void
  onNext: () => void
  onBack: () => void
}

const USES: { id: WaterUseType; Icon: LucideIcon; color: string }[] = [
  { id: 'drinking',           Icon: Droplet,    color: '#38bdf8' },
  { id: 'cooking',            Icon: Utensils,   color: '#a78bfa' },
  { id: 'whole_house',        Icon: Home,       color: '#f59e0b' },
  { id: 'shower_bathing',     Icon: ShowerHead, color: '#10b981' },
  { id: 'emergency_survival', Icon: Zap,        color: '#f43f5e' },
  { id: 'irrigation',         Icon: Sprout,     color: '#84cc16' },
  { id: 'livestock',          Icon: PawPrint,   color: '#94a3b8' },
]

export function StepUse({ data, update, onNext, onBack }: StepProps) {
  const { t } = useTranslation()
  const [pending, setPending] = useState<WaterUseType | null>(null)

  const handleSelect = (id: WaterUseType) => {
    setPending(id)
    update({ use: id })
    setTimeout(onNext, 200)
  }

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-xl sm:text-2xl font-bold text-white">{t('configurator.steps.use.title')}</h2>
      </div>
      <OptionList>
        {USES.map(({ id, Icon, color }) => (
          <OptionRow
            key={id}
            Icon={Icon}
            iconColor={color}
            label={t(`configurator.uses.${id}.label`)}
            description={t(`configurator.uses.${id}.description`)}
            selected={pending === id || (pending === null && data.use === id)}
            onClick={() => handleSelect(id)}
          />
        ))}
      </OptionList>
      <NavButtons onBack={onBack} onNext={onNext} canNext={!!data.use} />
    </div>
  )
}
