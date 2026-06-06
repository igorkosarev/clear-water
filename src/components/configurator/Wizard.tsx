import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { StepCountry } from './steps/StepCountry'
import { StepWaterSource } from './steps/StepWaterSource'
import { StepProblems } from './steps/StepProblems'
import { StepUse } from './steps/StepUse'
import { StepBudget } from './steps/StepBudget'
import type { WaterInput } from '@/types'

const STEPS = ['country', 'source', 'problems', 'use', 'budget'] as const

interface WizardProps {
  onComplete: (input: WaterInput) => void
}

export function Wizard({ onComplete }: WizardProps) {
  const { t } = useTranslation()
  const [step, setStep] = useState(0)
  const [data, setData] = useState<Partial<WaterInput>>({})

  const update = (patch: Partial<WaterInput>) => setData(prev => ({ ...prev, ...patch }))
  const next = () => setStep(s => Math.min(s + 1, STEPS.length - 1))
  const back = () => setStep(s => Math.max(s - 1, 0))

  const stepProps = { data, update, onNext: next, onBack: back }

  return (
    <div className="max-w-xl mx-auto px-4 py-8">
      <div className="mb-6 flex gap-1">
        {STEPS.map((_, i) => (
          <div
            key={i}
            className={`flex-1 h-1.5 rounded-full transition-colors ${i <= step ? 'bg-blue-500' : 'bg-gray-200'}`}
          />
        ))}
      </div>

      <div className="text-sm text-gray-500 mb-4">{t('configurator.step', { current: step + 1, total: STEPS.length })}</div>

      {step === 0 && <StepCountry {...stepProps} />}
      {step === 1 && <StepWaterSource {...stepProps} />}
      {step === 2 && <StepProblems {...stepProps} />}
      {step === 3 && <StepUse {...stepProps} />}
      {step === 4 && (
        <StepBudget
          {...stepProps}
          onFinish={() => {
            if (data.country && data.source && data.contaminants && data.use && data.budget) {
              onComplete(data as WaterInput)
            }
          }}
        />
      )}
    </div>
  )
}
