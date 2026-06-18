import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { AlertTriangle, Info, RotateCcw, ArrowRight } from 'lucide-react'
import { motion } from 'framer-motion'
import { SystemDiagram } from './SystemDiagram'
import { BOMTable } from './BOMTable'
import { RemainingBadges } from './RemainingBadges'
import type { GreedySimulationResult, TierResult, BudgetTier } from '@/types'
import modulesData from '@/data/modules.json'

// ─── Config ───────────────────────────────────────────────────────────────────

interface ResultPanelProps {
  result: GreedySimulationResult
  onRestart: () => void
}

const TIER_COLOR: Record<BudgetTier, string> = {
  low:    '#10b981',
  medium: '#38bdf8',
  high:   '#f59e0b',
}

type RawModule = { id: string; nameKey: string; costUSD: number }
const allModules = modulesData as RawModule[]

// ─── Coverage helpers ─────────────────────────────────────────────────────────

function coverageStats(tier: TierResult) {
  const total   = tier.removedContaminants.length + tier.remainingContaminants.length
  const removed = tier.removedContaminants.length
  const pct     = total === 0 ? 0 : Math.round((removed / total) * 100)
  const allClear = tier.remainingContaminants.length === 0
  return { total, removed, pct, allClear }
}

function coverageColor(pct: number, allClear: boolean) {
  if (allClear) return { text: 'text-emerald-400', bar: '#10b981', badge: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30' }
  if (pct >= 50)  return { text: 'text-amber-400',  bar: '#f59e0b', badge: 'text-amber-400 bg-amber-500/10 border-amber-500/30'   }
  return             { text: 'text-red-400',    bar: '#ef4444', badge: 'text-red-400 bg-red-500/10 border-red-500/30'         }
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function CoverageBar({ pct, color }: { pct: number; color: string }) {
  return (
    <div className="h-1 w-full rounded-full bg-slate-800 overflow-hidden">
      <motion.div
        className="h-full rounded-full"
        style={{ backgroundColor: color }}
        initial={{ width: 0 }}
        animate={{ width: `${pct}%` }}
        transition={{ duration: 0.7, ease: 'easeOut', delay: 0.1 }}
      />
    </div>
  )
}

function ModuleChips({ moduleIds }: { moduleIds: string[] }) {
  const { t } = useTranslation()
  const visible = moduleIds.filter(id => id !== 'booster_pump')
  return (
    <div className="flex flex-wrap gap-1.5">
      {visible.map((id, i) => {
        const mod = allModules.find(m => m.id === id)
        return (
          <span key={id} className="inline-flex items-center gap-1 text-xs text-slate-400 bg-slate-900/70 border border-slate-700/70 rounded-md px-2 py-0.5">
            {mod ? t(mod.nameKey) : id.replace(/_/g, ' ')}
            {i < visible.length - 1 && <ArrowRight size={9} className="text-slate-600 shrink-0" />}
          </span>
        )
      })}
    </div>
  )
}

// ─── AltCard ─────────────────────────────────────────────────────────────────

function AltCard({ alt, onSelect }: { alt: TierResult; onSelect: () => void }) {
  const { t } = useTranslation()
  const { total, removed, pct, allClear } = coverageStats(alt)
  const col = coverageColor(pct, allClear)
  const tierColor = TIER_COLOR[alt.budget]

  return (
    <div className="rounded-xl border border-slate-700/60 bg-slate-900/60 overflow-hidden">
      <div className="h-0.5 w-full" style={{ backgroundColor: tierColor }} />
      <div className="p-4 space-y-3">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2 mb-0.5">
              <span className="font-semibold text-slate-200 text-sm">
                {t(`result.tierLabel.${alt.budget}`)}
              </span>
              <span className="text-xs text-slate-600">{t('result.tierCost', { limit: alt.budgetLimitUSD })}</span>
            </div>
            {total > 0 && (
              <div className="flex items-center gap-2">
                <span className={`text-xs font-medium ${col.text}`}>
                  {allClear
                    ? t('result.coverageAll', { total })
                    : t('result.coverage', { removed, total })}
                </span>
                <span className="text-xs text-slate-600">·</span>
                <span className="text-xs text-slate-400">${alt.estimatedCostUSD}</span>
              </div>
            )}
          </div>
          <button
            onClick={onSelect}
            className="shrink-0 text-xs font-semibold text-sky-400 hover:text-white bg-sky-500/10 hover:bg-sky-500/20 border border-sky-500/30 hover:border-sky-400/60 px-3 py-1.5 rounded-lg transition-all"
          >
            {t('result.alternatives.select')}
          </button>
        </div>

        {total > 0 && <CoverageBar pct={pct} color={col.bar} />}

        <ModuleChips moduleIds={alt.modules} />

        <RemainingBadges remainingContaminants={alt.remainingContaminants} />
      </div>
    </div>
  )
}

// ─── ResultPanel ──────────────────────────────────────────────────────────────

export function ResultPanel({ result, onRestart }: ResultPanelProps) {
  const { t } = useTranslation()
  const [activeBudget, setActiveBudget] = useState<BudgetTier>(result.primaryBudget)

  const primary = result.tiers.find(t => t.budget === activeBudget) ?? result.tiers[0]
  const alternatives = result.tiers.filter(t => t.budget !== activeBudget)

  const moduleKey = (modules: string[]) => [...modules].sort().join(',')
  const seenKeys = new Set([moduleKey(primary?.modules ?? [])])
  const uniqueAlternatives = alternatives
    .filter(alt => alt.modules.length > 0)
    .filter(alt => {
      const key = moduleKey(alt.modules)
      if (seenKeys.has(key)) return false
      seenKeys.add(key)
      return true
    })

  if (!primary) return null

  const { total, removed, pct, allClear } = coverageStats(primary)
  const col = coverageColor(pct, allClear)
  const tierColor = TIER_COLOR[primary.budget]

  const coverageLabel = total === 0
    ? null
    : allClear
      ? t('result.coverageAll', { total })
      : t('result.coverage', { removed, total })

  return (
    <div className="max-w-xl mx-auto px-4 py-10 space-y-8">

      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h2 className="text-2xl font-bold text-white mb-1">{t('result.title')}</h2>
        <p className="text-slate-400 text-sm">{t('result.subtitle')}</p>
      </motion.div>

      {/* Primary card */}
      <motion.div
        key={activeBudget}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="rounded-2xl border border-slate-700/60 bg-slate-800/40 overflow-hidden"
      >
        {/* Tier accent stripe */}
        <div className="h-1 w-full" style={{ backgroundColor: tierColor }} />

        <div className="p-5 space-y-5">
          {/* Tier header */}
          <div className="flex flex-wrap items-start gap-3">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <h3 className="text-lg font-bold text-white">
                  {t(`result.tierLabel.${primary.budget}`)}
                </h3>
                <span className="text-xs text-slate-500">
                  {t('result.tierCost', { limit: primary.budgetLimitUSD })}
                </span>
              </div>
              {coverageLabel && (
                <div className="flex items-center gap-2">
                  <span className={`text-xs font-semibold ${col.text}`}>{coverageLabel}</span>
                  {total > 0 && (
                    <>
                      <span className="text-slate-600 text-xs">·</span>
                      <span className="text-xs text-slate-400">${primary.estimatedCostUSD}</span>
                    </>
                  )}
                </div>
              )}
            </div>
            {coverageLabel && (
              <span className={`shrink-0 text-xs font-bold px-3 py-1.5 rounded-full border ${col.badge}`}>
                {pct}%
              </span>
            )}
          </div>

          {/* Coverage bar */}
          {total > 0 && <CoverageBar pct={pct} color={col.bar} />}

          {/* Remaining badges */}
          <RemainingBadges remainingContaminants={primary.remainingContaminants} />

          {/* Warnings */}
          {primary.hasPump && (
            <div className="flex items-start gap-3 p-3 bg-amber-500/10 border border-amber-500/30 rounded-xl">
              <AlertTriangle size={15} className="text-amber-400 shrink-0 mt-0.5" />
              <p className="text-sm text-amber-300">{t('result.pumpWarning')}</p>
            </div>
          )}

          {primary.missingRecommended.length > 0 && (
            <div className="flex items-start gap-3 p-3 bg-slate-900/60 border border-slate-700/50 rounded-xl">
              <Info size={15} className="text-slate-400 shrink-0 mt-0.5" />
              <p className="text-sm text-slate-400">
                {t('result.missingRecommended.warning', {
                  filters: primary.missingRecommended
                    .map(ft => t(`result.missingRecommended.filterNames.${ft}`, { defaultValue: ft }))
                    .join(', '),
                })}
              </p>
            </div>
          )}

          {/* Diagram + BOM */}
          {primary.modules.length > 0 ? (
            <div className="space-y-5">
              <SystemDiagram tier={primary} />
              <BOMTable tier={primary} />
            </div>
          ) : (
            <div className="p-6 bg-slate-900/60 border border-slate-700 rounded-xl text-center">
              <p className="text-slate-400 text-sm">{t('result.noModules')}</p>
            </div>
          )}
        </div>
      </motion.div>

      {/* Alternatives */}
      {uniqueAlternatives.length > 0 && (
        <div>
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-widest mb-3">
            {t('result.alternatives.title')}
          </p>
          <div className="space-y-3">
            {uniqueAlternatives.map(alt => (
              <AltCard
                key={alt.budget}
                alt={alt}
                onSelect={() => {
                  setActiveBudget(alt.budget)
                  window.scrollTo({ top: 0, behavior: 'smooth' })
                }}
              />
            ))}
          </div>
        </div>
      )}

      {/* Restart */}
      <button
        onClick={onRestart}
        className="flex items-center gap-2 text-sm text-slate-500 hover:text-slate-200 transition-colors group"
      >
        <RotateCcw size={13} className="group-hover:rotate-[-30deg] transition-transform duration-300" />
        {t('result.restart')}
      </button>

    </div>
  )
}
