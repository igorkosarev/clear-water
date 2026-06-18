import { useState, Fragment } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { Check } from 'lucide-react'
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

const STEPS = ['source', 'problems', 'use', 'pressure', 'preference'] as const
const STEP_KEYS = [
  'configurator.progress.source',
  'configurator.progress.problems',
  'configurator.progress.use',
  'configurator.progress.pressure',
  'configurator.progress.preference',
]

const slideVariants = {
  enter: (dir: number) => ({ opacity: 0, x: dir > 0 ? 28 : -28 }),
  center: { opacity: 1, x: 0, transition: { duration: 0.3, ease: 'easeOut' as const } },
  exit:   (dir: number) => ({ opacity: 0, x: dir > 0 ? -28 : 28, transition: { duration: 0.18, ease: 'easeIn' as const } }),
}

interface WizardProps {
  onComplete: (input: WaterInput) => void
  onBack?: () => void
}

export function Wizard({ onComplete, onBack }: WizardProps) {
  const { t } = useTranslation()
  const { country } = useCountry()
  const [step, setStep] = useState(0)
  const [direction, setDirection] = useState(1)
  const [data, setData] = useState<Partial<WaterInput>>({ preference: 'cost' })
  const [previewModules, setPreviewModules] = useState<PreviewModule[]>([])

  const update = (patch: Partial<WaterInput>) => setData(prev => ({ ...prev, ...patch }))

  const next = () => { setDirection(1); setStep(s => Math.min(s + 1, STEPS.length - 1)) }
  const back = () => {
    if (step === 0) { onBack?.(); return }
    setDirection(-1)
    setStep(s => Math.max(s - 1, 0))
  }

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
    const primaryTier = result.tiers.find(tier => tier.budget === result.primaryBudget) ?? result.tiers[0]
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
    if (data.source && data.contaminants && data.use && data.inletPressureBar !== undefined) {
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
    <div className="max-w-lg mx-auto px-4 py-5 sm:py-8">

      {/* ── Progress ── */}
      <div className="mb-8">
        {/* Step label */}
        <div className="flex items-center justify-between mb-4">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-widest">
            {t('configurator.step', { current: step + 1, total: STEPS.length })}
          </span>
          <span className="text-xs text-sky-400 font-medium">
            {t(STEP_KEYS[step])}
          </span>
        </div>

        {/* Step dots */}
        <div className="flex items-center">
          {STEPS.map((_, i) => (
            <Fragment key={i}>
              <div
                className={`w-6 h-6 sm:w-7 sm:h-7 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 transition-all duration-300 ${
                  i < step
                    ? 'bg-sky-500 text-white'
                    : i === step
                      ? 'bg-sky-500 text-white shadow-lg shadow-sky-500/30'
                      : 'bg-slate-800 text-slate-600 border border-slate-700/60'
                }`}
              >
                {i < step ? <Check size={11} strokeWidth={3} /> : i + 1}
              </div>
              {i < STEPS.length - 1 && (
                <div className={`flex-1 h-px mx-1 sm:mx-1.5 rounded-full transition-colors duration-300 ${
                  i < step ? 'bg-sky-500' : 'bg-slate-800'
                }`} />
              )}
            </Fragment>
          ))}
        </div>
      </div>

      {/* ── Step content ── */}
      <AnimatePresence mode="wait" custom={direction}>
        <motion.div
          key={step}
          custom={direction}
          variants={slideVariants}
          initial="enter"
          animate="center"
          exit="exit"
        >
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
        </motion.div>
      </AnimatePresence>
    </div>
  )
}
