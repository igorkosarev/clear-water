import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { CheckCircle, AlertTriangle } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import type { WaterInput, WaterSourceType } from '@/types'

export interface PreviewModule {
  id: string
  nameKey: string
  minPressureBar: number
}

interface StepPressureProps {
  data: Partial<Omit<WaterInput, 'country'>>
  update: (patch: Partial<WaterInput>) => void
  onBack: () => void
  onNext: () => void
  previewModules: PreviewModule[]
}

interface PressureOption {
  value: number
  labelKey: string
  labelParams: Record<string, number>
  needsPump: boolean
}

const SOURCE_DEFAULT_PRESSURE: Record<WaterSourceType, number> = {
  tap:    2.5,
  well:   2.0,
  river:  0.1,
  rain:   0.1,
  pond:   0.1,
  spring: 0.1,
}

function buildOptions(previewModules: PreviewModule[]): {
  options: PressureOption[]
  thresholds: number[]
} {
  const thresholds = [...new Set(
    previewModules.map(m => m.minPressureBar).filter(p => p > 0),
  )].sort((a, b) => a - b)

  if (thresholds.length === 0) {
    return {
      options: [{ value: 0, labelKey: 'configurator.pressure.anyPressure', labelParams: {}, needsPump: false }],
      thresholds: [],
    }
  }

  const options: PressureOption[] = []

  options.push({
    value: thresholds[0] * 0.5,
    labelKey: 'configurator.pressure.below',
    labelParams: { value: thresholds[0] },
    needsPump: true,
  })

  for (let i = 0; i < thresholds.length - 1; i++) {
    const value = (thresholds[i] + thresholds[i + 1]) / 2
    options.push({
      value,
      labelKey: 'configurator.pressure.between',
      labelParams: { min: thresholds[i], max: thresholds[i + 1] },
      needsPump: previewModules.some(m => m.minPressureBar > value),
    })
  }

  options.push({
    value: thresholds[thresholds.length - 1] + 1,
    labelKey: 'configurator.pressure.aboveOrEqual',
    labelParams: { value: thresholds[thresholds.length - 1] },
    needsPump: false,
  })

  return { options, thresholds }
}

function getDefaultIndex(source: WaterSourceType | undefined, thresholds: number[]): number {
  const defaultPressure = SOURCE_DEFAULT_PRESSURE[source ?? 'tap'] ?? 2.5
  if (thresholds.length === 0) return 0
  if (defaultPressure < thresholds[0]) return 0
  for (let i = 0; i < thresholds.length - 1; i++) {
    if (defaultPressure >= thresholds[i] && defaultPressure < thresholds[i + 1]) return i + 1
  }
  return thresholds.length
}

export function StepPressure({ data, update, onBack, onNext, previewModules }: StepPressureProps) {
  const { t } = useTranslation()
  const { options, thresholds } = buildOptions(previewModules)
  const defaultIndex = getDefaultIndex(data.source, thresholds)
  const [selectedIndex, setSelectedIndex] = useState(defaultIndex)

  useEffect(() => {
    const option = options[selectedIndex]
    if (option !== undefined) {
      update({ inletPressureBar: option.value })
    }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const handleSelect = (index: number) => {
    setSelectedIndex(index)
    update({ inletPressureBar: options[index].value })
  }

  const noRequirements = thresholds.length === 0

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold text-white">{t('configurator.steps.pressure.title')}</h2>
      <p className="text-sm text-slate-400">{t('configurator.steps.pressure.description')}</p>

      {noRequirements ? (
        <div className="flex items-start gap-3 p-4 bg-emerald-500/10 border border-emerald-500/30 rounded-xl">
          <CheckCircle size={18} className="text-emerald-400 shrink-0 mt-0.5" />
          <p className="text-sm text-emerald-300">{t('configurator.steps.pressure.noRequirements')}</p>
        </div>
      ) : (
        <div className="space-y-2">
          {options.map((option, i) => {
            const isSelected = selectedIndex === i
            return (
              <button
                key={i}
                className={`w-full p-4 rounded-xl border text-left transition-all ${
                  isSelected
                    ? 'border-sky-500 bg-sky-500/10 text-white'
                    : 'border-slate-700 bg-slate-800/60 text-slate-300 hover:border-slate-500'
                }`}
                onClick={() => handleSelect(i)}
              >
                <div className="font-medium text-sm">
                  {t(option.labelKey, option.labelParams)}
                </div>
                {option.needsPump ? (
                  <div className="flex items-center gap-1.5 mt-1">
                    <AlertTriangle size={12} className="text-amber-400 shrink-0" />
                    <span className="text-xs text-amber-400">{t('configurator.pressure.pumpAdded')}</span>
                  </div>
                ) : (
                  <div className="flex items-center gap-1.5 mt-1">
                    <CheckCircle size={12} className="text-emerald-400 shrink-0" />
                    <span className="text-xs text-emerald-400">{t('configurator.pressure.allWork')}</span>
                  </div>
                )}
              </button>
            )
          })}
        </div>
      )}

      <div className="flex gap-3 pt-2">
        <Button variant="dark-secondary" onClick={onBack} className="flex-1">{t('common.back')}</Button>
        <button
          onClick={onNext}
          className="flex-1 inline-flex items-center justify-center font-semibold rounded-lg transition-colors px-4 py-2 text-sm bg-sky-600 hover:bg-sky-500 text-white"
        >
          {t('common.next')}
        </button>
      </div>
    </div>
  )
}
