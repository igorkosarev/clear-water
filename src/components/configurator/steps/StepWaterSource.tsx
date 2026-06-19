import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Droplet, Droplets, Waves, CloudRain, Layers, Mountain } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import type { WaterInput, WaterSourceType } from '@/types'
import { NavButtons } from './NavButtons'
import { OptionRow, OptionList } from './OptionRow'

interface StepProps {
  data: Partial<WaterInput>
  update: (patch: Partial<WaterInput>) => void
  onNext: () => void
  onBack: () => void
}

const SOURCES: { id: WaterSourceType; Icon: LucideIcon; color: string }[] = [
  { id: 'tap',    Icon: Droplet,   color: '#38bdf8' },
  { id: 'well',   Icon: Droplets,  color: '#a78bfa' },
  { id: 'river',  Icon: Waves,     color: '#10b981' },
  { id: 'rain',   Icon: CloudRain, color: '#6366f1' },
  { id: 'pond',   Icon: Layers,    color: '#14b8a6' },
  { id: 'spring', Icon: Mountain,  color: '#84cc16' },
]

export function StepWaterSource({ data, update, onNext, onBack }: StepProps) {
  const { t } = useTranslation()
  const [pending, setPending] = useState<WaterSourceType | null>(null)

  const handleSelect = (id: WaterSourceType) => {
    setPending(id)
    update({ source: id })
    setTimeout(onNext, 200)
  }

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-xl sm:text-2xl font-bold text-white">{t('configurator.steps.source.title')}</h2>
      </div>
      <OptionList>
        {SOURCES.map(({ id, Icon, color }) => (
          <OptionRow
            key={id}
            Icon={Icon}
            iconColor={color}
            label={t(`configurator.sources.${id}.label`)}
            description={t(`configurator.sources.${id}.description`)}
            selected={pending === id || (pending === null && data.source === id)}
            onClick={() => handleSelect(id)}
          />
        ))}
      </OptionList>
      <NavButtons onBack={onBack} onNext={onNext} canNext={!!data.source} />
    </div>
  )
}
