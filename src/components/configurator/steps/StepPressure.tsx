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
  onFinish: () => void
  previewModules: PreviewModule[]
}

interface PressureOption {
  value: number
  labelKey: string
  labelParams: Record<string, number>
  needsPump: boolean
}

const SOURCE_DEFAULT_PRESSURE: Record<WaterSourceType, number> = {
  tap: 2.5,
  well: 2.0,
  river: 0.1,
  rain: 0.1,
  pond: 0.1,
  spring: 0.1,
}

function buildOptions(previewModules: PreviewModule[]): {
  options: PressureOption[]
  thresholds: number[]
} {
  const thresholds = [...new Set(
    previewModules.map(m => m.minPressureBar).filter(p => p > 0)
  )].sort((a, b) => a - b)

  if (thresholds.length === 0) {
    return {
      options: [{ value: 0, labelKey: 'configurator.pressure.anyPressure', labelParams: {}, needsPump: false }],
      thresholds: [],
    }
  }

  const options: PressureOption[] = []

  const belowValue = thresholds[0] * 0.5
  options.push({
    value: belowValue,
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

  const aboveValue = thresholds[thresholds.length - 1] + 1
  options.push({
    value: aboveValue,
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

export function StepPressure({ data, update, onBack, onFinish, previewModules }: StepPressureProps) {
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
      <h2 className="text-2xl font-bold text-gray-900">{t('configurator.steps.pressure.title')}</h2>
      <p className="text-sm text-gray-500">{t('configurator.steps.pressure.description')}</p>

      {noRequirements ? (
        <div className="flex items-start gap-3 p-4 bg-green-50 border border-green-200 rounded-lg">
          <CheckCircle size={20} className="text-green-600 flex-shrink-0 mt-0.5" />
          <p className="text-sm text-green-800">{t('configurator.steps.pressure.noRequirements')}</p>
        </div>
      ) : (
        <div className="space-y-3">
          {options.map((option, i) => {
            const selected = selectedIndex === i
            return (
              <button
                key={i}
                className={`w-full p-4 rounded-lg border-2 text-left transition-colors ${
                  selected ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-gray-300'
                }`}
                onClick={() => handleSelect(i)}
              >
                <div className="font-medium text-gray-800">
                  {t(option.labelKey, option.labelParams)}
                </div>
                {option.needsPump ? (
                  <div className="flex items-center gap-1.5 mt-1">
                    <AlertTriangle size={13} className="text-amber-500 flex-shrink-0" />
                    <span className="text-xs text-amber-700">{t('configurator.pressure.pumpAdded')}</span>
                  </div>
                ) : (
                  <div className="flex items-center gap-1.5 mt-1">
                    <CheckCircle size={13} className="text-green-500 flex-shrink-0" />
                    <span className="text-xs text-green-700">{t('configurator.pressure.allWork')}</span>
                  </div>
                )}
              </button>
            )
          })}
        </div>
      )}

      <div className="flex gap-3">
        <Button variant="secondary" onClick={onBack} className="flex-1">{t('common.back')}</Button>
        <Button onClick={onFinish} className="flex-1">{t('configurator.getResults')}</Button>
      </div>
    </div>
  )
}
