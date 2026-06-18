import { useTranslation } from 'react-i18next'
import { AlertTriangle, AlertCircle, FlaskConical } from 'lucide-react'
import type { ConfidenceScore, WaterUseType } from '@/types'

interface Props {
  confidence: ConfidenceScore
  use: WaterUseType
  advisories: string[]
}

export function FallbackBanner({ confidence, use, advisories }: Props) {
  const { t } = useTranslation()

  const isLowData = confidence.data === 'low'
  const isLowRec  = confidence.recommendation === 'low'
  const highStakes = ['drinking', 'cooking', 'emergency_survival'].includes(use)
  const needsTesting = advisories.includes('water_testing')

  if (!isLowData && !isLowRec) return null

  // Critical: low data + drinking water
  if (isLowData && highStakes) {
    return (
      <div className="rounded-xl border border-red-500/30 bg-red-500/8 p-4 space-y-2">
        <div className="flex items-start gap-3">
          <AlertCircle size={15} className="text-red-400 shrink-0 mt-0.5" />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-red-300">
              {t('result.fallback.drinkingWaterWarning')}
            </p>
            <p className="text-xs text-slate-400 mt-1 leading-relaxed">
              {t('result.fallback.limitedData')}
            </p>
          </div>
        </div>
        {needsTesting && (
          <div className="flex items-start gap-2 pt-1">
            <FlaskConical size={13} className="text-amber-400 shrink-0 mt-0.5" />
            <p className="text-xs text-amber-400/80">{t('result.fallback.testBeforeInstall')}</p>
          </div>
        )}
      </div>
    )
  }

  // Warning: low data (non-critical use)
  if (isLowData) {
    return (
      <div className="rounded-xl border border-amber-500/30 bg-amber-500/8 p-4">
        <div className="flex items-start gap-3">
          <AlertTriangle size={15} className="text-amber-400 shrink-0 mt-0.5" />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-amber-300">
              {t('result.fallback.limitedData')}
            </p>
            {needsTesting && (
              <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                {t('result.fallback.testBeforeInstall')}
              </p>
            )}
          </div>
        </div>
      </div>
    )
  }

  // Info: low recommendation confidence only
  if (isLowRec) {
    return (
      <div className="rounded-xl border border-amber-500/20 bg-amber-500/5 p-4">
        <div className="flex items-start gap-3">
          <AlertTriangle size={15} className="text-amber-400/70 shrink-0 mt-0.5" />
          <p className="text-sm text-slate-400">
            {t('result.fallback.incompleteAddressing')}
          </p>
        </div>
      </div>
    )
  }

  return null
}
