import { useTranslation } from 'react-i18next'
import { CheckCircle, AlertTriangle, Database, Shield } from 'lucide-react'
import type {
  TierResult,
  WaterInput,
  GreedySimulationResult,
  ConfidenceLevel,
} from '@/types'
import modulesData from '@/data/modules.json'
import contaminantsData from '@/data/contaminants.json'

interface Props {
  tier: TierResult
  input: WaterInput
  result: GreedySimulationResult
}

type RawModule = { id: string; nameKey: string; type: string; removes: string[] }
type RawContaminant = { id: string; nameKey: string; color: string }

const allModules = modulesData as RawModule[]
const allContaminants = contaminantsData as RawContaminant[]

function confidenceStyle(level: ConfidenceLevel) {
  if (level === 'high')   return { dot: 'bg-emerald-400', text: 'text-emerald-400' }
  if (level === 'medium') return { dot: 'bg-amber-400',   text: 'text-amber-400'   }
  return                         { dot: 'bg-red-400',     text: 'text-red-400'     }
}

function ContaminantBadge({ id }: { id: string }) {
  const { t } = useTranslation()
  const c = allContaminants.find(x => x.id === id)
  if (!c) return null
  return (
    <span
      className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium"
      style={{
        backgroundColor: `${c.color}18`,
        color: c.color,
        border: `1px solid ${c.color}30`,
      }}
    >
      {t(c.nameKey)}
    </span>
  )
}

export function RecommendationExplainer({ tier, input, result }: Props) {
  const { t } = useTranslation()

  const allRequired = [
    ...new Set([...result.inferredContaminants, ...input.contaminants]),
  ]

  const selectSteps = tier.reasoningSteps.filter(s => s.action === 'select')
  const requireSteps = tier.reasoningSteps.filter(s => s.action === 'require')

  // Build explanations in physical order (excludes booster_pump — already shown via hasPump warning)
  const orderedModuleIds = tier.modules.filter(id => id !== 'booster_pump')

  const moduleExplanations = orderedModuleIds.map(id => {
    const mod = allModules.find(m => m.id === id)
    const isPrerequisite =
      requireSteps.some(s => s.moduleId === id) && !selectSteps.some(s => s.moduleId === id)
    const addressed = (mod?.removes ?? []).filter(c => allRequired.includes(c))
    return { id, mod, isPrerequisite, addressed }
  })

  const { confidence } = tier
  const dataStyle = confidenceStyle(confidence.data)
  const recStyle  = confidenceStyle(confidence.recommendation)

  return (
    <div className="space-y-5">

      {/* Section header */}
      <p className="text-xs font-semibold text-slate-500 uppercase tracking-widest">
        {t('result.explainer.title')}
      </p>

      {/* Module list */}
      <div className="space-y-2">
        {moduleExplanations.map(({ id, mod, isPrerequisite, addressed }) => (
          <div
            key={id}
            className="rounded-xl border border-slate-800 bg-slate-900/60 p-3"
          >
            <div className="flex items-start gap-2.5">
              <CheckCircle
                size={14}
                className={`shrink-0 mt-0.5 ${isPrerequisite ? 'text-slate-600' : 'text-emerald-400'}`}
              />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap mb-1">
                  <span className="text-sm font-medium text-white">
                    {mod ? t(mod.nameKey) : id.replace(/_/g, ' ')}
                  </span>
                  {isPrerequisite && (
                    <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-wide px-1.5 py-0.5 rounded bg-slate-800 border border-slate-700/60">
                      {t('result.explainer.prereqTag')}
                    </span>
                  )}
                </div>
                {addressed.length > 0 ? (
                  <div className="flex flex-wrap gap-1">
                    {addressed.map(c => <ContaminantBadge key={c} id={c} />)}
                  </div>
                ) : isPrerequisite ? (
                  <p className="text-xs text-slate-500">
                    {t('result.explainer.prerequisiteNote')}
                  </p>
                ) : null}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Unaddressed contaminants */}
      {tier.remainingContaminants.length > 0 && (
        <div className="space-y-2">
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-widest">
            {t('result.explainer.unaddressed.title')}
          </p>
          {tier.remainingContaminants.map(cid => {
            const c = allContaminants.find(x => x.id === cid)
            const coveredByHigher = result.tiers.some(
              t2 => t2.budget !== tier.budget && t2.removedContaminants.includes(cid),
            )
            return (
              <div
                key={cid}
                className="rounded-xl border border-amber-500/20 bg-amber-500/5 p-3 flex items-start gap-2.5"
              >
                <AlertTriangle size={14} className="text-amber-400 shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-amber-300">
                    {c ? t(c.nameKey) : cid}
                  </p>
                  <p className="text-xs text-slate-400 mt-0.5">
                    {coveredByHigher
                      ? t('result.explainer.unaddressed.higherBudget')
                      : t('result.explainer.unaddressed.specialized')}
                  </p>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Confidence card */}
      <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-4 space-y-3.5">
        <p className="text-xs font-semibold text-slate-500 uppercase tracking-widest">
          {t('result.explainer.confidence.title')}
        </p>

        {/* Data confidence */}
        <div className="flex items-start gap-3">
          <Database size={14} className="text-slate-500 shrink-0 mt-0.5" />
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs text-slate-300">
                {t('result.explainer.confidence.dataLabel')}
              </span>
              <div className={`w-1.5 h-1.5 rounded-full shrink-0 ${dataStyle.dot}`} />
              <span className={`text-xs font-semibold ${dataStyle.text}`}>
                {t(`result.explainer.confidence.level.${confidence.data}`)}
              </span>
            </div>
            {confidence.dataReasons.map((r, i) => (
              <p key={i} className="text-xs text-slate-500 leading-relaxed">{r}</p>
            ))}
          </div>
        </div>

        {/* Recommendation confidence */}
        <div className="flex items-start gap-3">
          <Shield size={14} className="text-slate-500 shrink-0 mt-0.5" />
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs text-slate-300">
                {t('result.explainer.confidence.recLabel')}
              </span>
              <div className={`w-1.5 h-1.5 rounded-full shrink-0 ${recStyle.dot}`} />
              <span className={`text-xs font-semibold ${recStyle.text}`}>
                {t(`result.explainer.confidence.level.${confidence.recommendation}`)}
              </span>
            </div>
            {confidence.recommendationReasons.map((r, i) => (
              <p key={i} className="text-xs text-slate-500 leading-relaxed">{r}</p>
            ))}
          </div>
        </div>

        {/* Advisory */}
        {result.advisories.includes('water_testing') && (
          <div className="pt-3 border-t border-slate-800">
            <p className="text-xs text-amber-400/80 leading-relaxed">
              {t('result.explainer.advisory.waterTesting')}
            </p>
          </div>
        )}
      </div>

    </div>
  )
}
