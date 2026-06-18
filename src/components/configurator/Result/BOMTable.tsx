import { useTranslation } from 'react-i18next'
import type { TierResult } from '@/types'
import modules from '@/data/modules.json'

interface BOMTableProps {
  tier: TierResult
}

type RawModule = { id: string; nameKey: string; costUSD: number; diyDifficulty: string }

const DIFFICULTY_COLORS: Record<string, string> = {
  easy:   'text-emerald-400',
  medium: 'text-amber-400',
  hard:   'text-red-400',
}

export function BOMTable({ tier }: BOMTableProps) {
  const { t } = useTranslation()
  const allModules = modules as RawModule[]

  const lines = tier.modules
    .map(id => {
      const mod = allModules.find(m => m.id === id)
      return mod ? { id, name: t(mod.nameKey), cost: mod.costUSD, difficulty: mod.diyDifficulty } : null
    })
    .filter(Boolean)

  return (
    <div>
      <h3 className="font-semibold text-white mb-3">{t('result.bom.title')}</h3>
      <div className="border border-slate-700 rounded-xl overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-slate-800/80 text-slate-400 text-xs uppercase tracking-wide">
            <tr>
              <th className="text-left px-4 py-3">{t('result.bom.component')}</th>
              <th className="text-center px-3 py-3">{t('result.bom.difficulty')}</th>
              <th className="text-right px-4 py-3 whitespace-nowrap">{t('result.bom.cost')}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800">
            {lines.map(line => line && (
              <tr key={line.id} className="bg-slate-900/50">
                <td className="px-4 py-3 text-slate-200">{line.name}</td>
                <td className={`px-3 py-3 text-center text-xs font-semibold ${DIFFICULTY_COLORS[line.difficulty] ?? 'text-slate-400'}`}>
                  {t(`result.bom.difficulty_${line.difficulty}`)}
                </td>
                <td className="px-4 py-3 text-right text-slate-400">${line.cost}</td>
              </tr>
            ))}
            <tr className="bg-slate-800/80 font-semibold">
              <td className="px-4 py-3 text-white" colSpan={2}>{t('result.bom.total')}</td>
              <td className="px-4 py-3 text-right text-white">${tier.estimatedCostUSD}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  )
}
