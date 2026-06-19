import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { FlaskConical, TestTube, X, HelpCircle } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import type { WaterInput, TestingStatus } from '@/types'
import { NavButtons } from './NavButtons'
import { OptionRow, OptionList } from './OptionRow'

interface StepProps {
  data: Partial<WaterInput>
  update: (patch: Partial<WaterInput>) => void
  onNext: () => void
  onBack: () => void
}

const OPTIONS: { id: TestingStatus; Icon: LucideIcon; color: string }[] = [
  { id: 'laboratory', Icon: FlaskConical, color: '#10b981' },
  { id: 'home_kit',   Icon: TestTube,     color: '#38bdf8' },
  { id: 'none',       Icon: X,            color: '#f59e0b' },
  { id: 'unknown',    Icon: HelpCircle,   color: '#64748b' },
]

export function StepTestingStatus({ data, update, onNext, onBack }: StepProps) {
  const { t } = useTranslation()
  const [pending, setPending] = useState<TestingStatus | null>(null)

  const handleSelect = (id: TestingStatus) => {
    setPending(id)
    update({ testingStatus: id })
    setTimeout(onNext, 200)
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
      <OptionList>
        {OPTIONS.map(({ id, Icon, color }) => (
          <OptionRow
            key={id}
            Icon={Icon}
            iconColor={color}
            label={t(`configurator.testing.${id}.label`)}
            description={t(`configurator.testing.${id}.description`)}
            selected={pending === id || (pending === null && data.testingStatus === id)}
            onClick={() => handleSelect(id)}
          />
        ))}
      </OptionList>
      <NavButtons onBack={onBack} onNext={onNext} canNext={!!data.testingStatus} />
    </div>
  )
}
