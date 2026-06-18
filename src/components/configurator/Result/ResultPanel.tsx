import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { AlertTriangle, Info, RotateCcw } from 'lucide-react'
import { motion } from 'framer-motion'
import { SystemDiagram } from './SystemDiagram'
import { BOMTable } from './BOMTable'
import { RemainingBadges } from './RemainingBadges'
import type { GreedySimulationResult, TierResult, BudgetTier } from '@/types'

interface ResultPanelProps {
  result: GreedySimulationResult
  onRestart: () => void
}


export function ResultPanel({ result, onRestart }: ResultPanelProps) {
  const { t } = useTranslation()
  const [activeBudget, setActiveBudget] = useState<BudgetTier>(result.primaryBudget)

  const primary = result.tiers.find(t => t.budget === activeBudget) ?? result.tiers[0]
  const alternatives = result.tiers.filter(t => t.budget !== activeBudget)

  const moduleKey = (modules: string[]) => [...modules].sort().join(',')
  const seenKeys = new Set([moduleKey(primary?.modules ?? [])])
  const uniqueAlternatives = alternatives.filter(alt => {
    const key = moduleKey(alt.modules)
    if (seenKeys.has(key)) return false
    seenKeys.add(key)
    return true
  })

  if (!primary) return null

  const total = primary.removedContaminants.length + primary.remainingContaminants.length
  const removed = primary.removedContaminants.length
  const allClear = primary.remainingContaminants.length === 0

  const coverageClass = allClear
    ? 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30'
    : removed / Math.max(total, 1) >= 0.5
      ? 'text-amber-400 bg-amber-500/10 border-amber-500/30'
      : 'text-red-400 bg-red-500/10 border-red-500/30'

  const coverageLabel = total === 0
    ? null
    : allClear
      ? t('result.coverageAll', { total })
      : t('result.coverage', { removed, total })

  return (
    <div className="max-w-xl mx-auto px-4 py-8 space-y-8">
      <div>
        <h2 className="text-2xl font-bold text-white mb-1">{t('result.title')}</h2>
        <p className="text-slate-400 text-sm">{t('result.subtitle')}</p>
      </div>

      <motion.div
        key={activeBudget}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35 }}
        className="space-y-5"
      >
        <div className="flex flex-wrap items-start gap-3">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-0.5">
              <h3 className="text-lg font-semibold text-white">
                {t(`result.tierLabel.${primary.budget}`)}
              </h3>
              <span className="text-xs text-slate-500">
                {t('result.tierCost', { limit: primary.budgetLimitUSD })}
              </span>
            </div>
            <p className="text-sm text-slate-400">
              {primary.modules.length > 0
                ? primary.modules.filter(id => id !== 'booster_pump').join(' → ').replace(/_/g, ' ')
                : t('result.noModules')}
            </p>
          </div>
          {coverageLabel && (
            <span className={`shrink-0 text-xs font-semibold px-3 py-1.5 rounded-full border ${coverageClass}`}>
              {coverageLabel}
            </span>
          )}
        </div>

        <RemainingBadges remainingContaminants={primary.remainingContaminants} />

        {primary.hasPump && (
          <div className="flex items-start gap-3 p-3 bg-amber-500/10 border border-amber-500/30 rounded-xl">
            <AlertTriangle size={16} className="text-amber-400 shrink-0 mt-0.5" />
            <p className="text-sm text-amber-300">{t('result.pumpWarning')}</p>
          </div>
        )}

        {primary.missingRecommended.length > 0 && (
          <div className="flex items-start gap-3 p-3 bg-slate-800/60 border border-slate-600/50 rounded-xl">
            <Info size={16} className="text-slate-400 shrink-0 mt-0.5" />
            <p className="text-sm text-slate-400">
              {t('result.missingRecommended.warning', {
                filters: primary.missingRecommended
                  .map(ft => t(`result.missingRecommended.filterNames.${ft}`, { defaultValue: ft }))
                  .join(', '),
              })}
            </p>
          </div>
        )}

        {primary.modules.length > 0 ? (
          <>
            <SystemDiagram tier={primary} />
            <BOMTable tier={primary} />
          </>
        ) : (
          <div className="p-6 bg-slate-800/60 border border-slate-700 rounded-xl text-center">
            <p className="text-slate-400 text-sm">{t('result.noModules')}</p>
          </div>
        )}
      </motion.div>

      {uniqueAlternatives.length > 0 && (
        <div>
          <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">
            {t('result.alternatives.title')}
          </h3>
          <div className="space-y-3">
            {uniqueAlternatives.map(alt => (
              <AltCard key={alt.budget} alt={alt} onSelect={() => {
                setActiveBudget(alt.budget)
                window.scrollTo({ top: 0, behavior: 'smooth' })
              }} />
            ))}
          </div>
        </div>
      )}

      <button
        onClick={onRestart}
        className="flex items-center gap-2 text-sm text-slate-500 hover:text-slate-300 transition-colors"
      >
        <RotateCcw size={14} />
        {t('result.restart')}
      </button>
    </div>
  )
}

function AltCard({ alt, onSelect }: { alt: TierResult; onSelect: () => void }) {
  const { t } = useTranslation()
  const total = alt.removedContaminants.length + alt.remainingContaminants.length
  const removed = alt.removedContaminants.length
  const allClear = alt.remainingContaminants.length === 0
  const covColor = allClear
    ? 'text-emerald-400'
    : removed / Math.max(total, 1) >= 0.5
      ? 'text-amber-400'
      : 'text-red-400'

  return (
    <div className="p-4 bg-slate-800/60 border border-slate-700 rounded-xl space-y-3">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <p className="font-medium text-slate-200 text-sm">{t(`result.tierLabel.${alt.budget}`)}</p>
            <span className="text-xs text-slate-500">{t('result.tierCost', { limit: alt.budgetLimitUSD })}</span>
          </div>
          <p className={`text-xs mt-0.5 ${covColor}`}>
            {total > 0 && (allClear
              ? t('result.coverageAll', { total })
              : t('result.coverage', { removed, total }))}
            {total > 0 && ' · '}
            ${alt.estimatedCostUSD}
          </p>
        </div>
        <button
          onClick={onSelect}
          className="shrink-0 text-xs text-sky-400 hover:text-sky-300 font-medium border border-sky-500/30 hover:border-sky-400/50 px-3 py-1.5 rounded-lg transition-colors"
        >
          {t('result.alternatives.select')}
        </button>
      </div>
      {alt.modules.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {alt.modules.map(id => (
            <span
              key={id}
              className="text-xs text-slate-400 bg-slate-900/60 border border-slate-700/80 rounded-md px-2 py-0.5"
            >
              {id.replace(/_/g, ' ')}
            </span>
          ))}
        </div>
      )}
      <RemainingBadges remainingContaminants={alt.remainingContaminants} />
    </div>
  )
}
