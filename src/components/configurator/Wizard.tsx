import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { StepWaterSource } from './steps/StepWaterSource'
import { StepProblems } from './steps/StepProblems'
import { StepUse } from './steps/StepUse'
import { StepPressure } from './steps/StepPressure'
import type { PreviewModule } from './steps/StepPressure'
import { StepPreference } from './steps/StepPreference'
import { runSimulation } from '@/engine/simulation'
import { useCountry } from '@/context/CountryContext'
import modulesData from '@/data/modules.json'
import type { WaterInput } from '@/types'

// Source → Problems → Use → Pressure → Preference
const STEPS = ['source', 'problems', 'use', 'pressure', 'preference'] as const

interface WizardProps {
  onComplete: (input: WaterInput) => void
  onBack?: () => void
}

export function Wizard({ onComplete, onBack }: WizardProps) {
  const { t } = useTranslation()
  const { country } = useCountry()
  const [step, setStep] = useState(0)
  const [data, setData] = useState<Partial<WaterInput>>({ preference: 'cost' })
  const [previewModules, setPreviewModules] = useState<PreviewModule[]>([])

  const update = (patch: Partial<WaterInput>) => setData(prev => ({ ...prev, ...patch }))

  const next = () => setStep(s => Math.min(s + 1, STEPS.length - 1))
  const back = () => {
    if (step === 0) { onBack?.(); return }
    setStep(s => Math.max(s - 1, 0))
  }

  // Compute pressure-requirement preview when advancing from Use → Pressure.
  // Run all tiers with unlimited pressure to get the highest-coverage module list.
  const advanceFromUse = () => {
    if (!data.source || !data.contaminants || !data.use) return
    const result = runSimulation({
      country: country ?? '',
      source: data.source,
      contaminants: data.contaminants,
      use: data.use,
      inletPressureBar: 100,
      preference: data.preference ?? 'cost',
    })
    const primaryTier = result.tiers.find(t => t.budget === result.primaryBudget) ?? result.tiers[0]
    const topModuleIds = primaryTier?.modules.filter(id => id !== 'booster_pump') ?? []
    const mods: PreviewModule[] = topModuleIds
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

  const finish = () => {
    if (
      data.source &&
      data.contaminants &&
      data.use &&
      data.inletPressureBar !== undefined
    ) {
      onComplete({
        country: country ?? '',
        source: data.source,
        contaminants: data.contaminants,
        use: data.use,
        inletPressureBar: data.inletPressureBar,
        preference: data.preference ?? 'cost',
      })
    }
  }

  const stepProps = { data, update, onNext: next, onBack: back }

  return (
    <div className="max-w-xl mx-auto px-4 py-8">
      <div className="mb-6 flex gap-1">
        {STEPS.map((_, i) => (
          <div
            key={i}
            className={`flex-1 h-1 rounded-full transition-colors ${i <= step ? 'bg-sky-500' : 'bg-slate-700'}`}
          />
        ))}
      </div>

      <div className="text-xs text-slate-500 mb-6 uppercase tracking-wider font-medium">
        {t('configurator.step', { current: step + 1, total: STEPS.length })}
      </div>

      {step === 0 && <StepWaterSource {...stepProps} />}
      {step === 1 && <StepProblems {...stepProps} />}
      {step === 2 && <StepUse {...stepProps} onNext={advanceFromUse} />}
      {step === 3 && (
        <StepPressure
          data={data}
          update={update}
          onBack={back}
          onNext={next}
          previewModules={previewModules}
        />
      )}
      {step === 4 && (
        <StepPreference
          data={data}
          update={update}
          onBack={back}
          onNext={finish}
        />
      )}
    </div>
  )
}
