import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { StepWaterSource } from './steps/StepWaterSource'
import { StepProblems } from './steps/StepProblems'
import { StepUse } from './steps/StepUse'
import { StepBudget } from './steps/StepBudget'
import { StepPressure } from './steps/StepPressure'
import type { PreviewModule } from './steps/StepPressure'
import { runSimulation } from '@/engine/simulation'
import modulesData from '@/data/modules.json'
import type { WaterInput } from '@/types'

const STEPS = ['source', 'problems', 'use', 'budget', 'pressure'] as const

interface WizardProps {
  onComplete: (input: Omit<WaterInput, 'country'>) => void
}

export function Wizard({ onComplete }: WizardProps) {
  const { t } = useTranslation()
  const [step, setStep] = useState(0)
  const [data, setData] = useState<Partial<Omit<WaterInput, 'country'>>>({})
  const [previewModules, setPreviewModules] = useState<PreviewModule[]>([])

  const update = (patch: Partial<WaterInput>) => setData(prev => ({ ...prev, ...patch }))
  const next = () => setStep(s => Math.min(s + 1, STEPS.length - 1))
  const back = () => setStep(s => Math.max(s - 1, 0))

  const advanceFromBudget = () => {
    if (!data.source || !data.contaminants || !data.use || !data.budget) return
    const result = runSimulation({
      country: '',
      source: data.source,
      contaminants: data.contaminants,
      use: data.use,
      budget: data.budget,
      inletPressureBar: 100,
    })
    const topModuleIds = result.recommendations[0]?.template.modules ?? []
    const mods: PreviewModule[] = topModuleIds
      .filter(id => id !== 'booster_pump')
      .map(id => {
        const raw = (modulesData as Array<{ id: string; nameKey: string; minPressureBar: number }>)
          .find(m => m.id === id)
        if (!raw) return null
        return { id: raw.id, nameKey: raw.nameKey, minPressureBar: raw.minPressureBar }
      })
      .filter((m): m is PreviewModule => m !== null)
    setPreviewModules(mods)
    next()
  }

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

      <div className="text-sm text-gray-500 mb-4">
        {t('configurator.step', { current: step + 1, total: STEPS.length })}
      </div>

      {step === 0 && <StepWaterSource {...stepProps} />}
      {step === 1 && <StepProblems {...stepProps} />}
      {step === 2 && <StepUse {...stepProps} />}
      {step === 3 && <StepBudget {...stepProps} onNext={advanceFromBudget} />}
      {step === 4 && (
        <StepPressure
          data={data}
          update={update}
          onBack={back}
          previewModules={previewModules}
          onFinish={() => {
            if (
              data.source &&
              data.contaminants &&
              data.use &&
              data.budget &&
              data.inletPressureBar !== undefined
            ) {
              onComplete(data as Omit<WaterInput, 'country'>)
            }
          }}
        />
      )}
    </div>
  )
}
