import { useTranslation } from 'react-i18next'
import { Link } from 'react-router-dom'
import systemTemplates from '@/data/system-templates.json'

const BUDGET_BADGE: Record<string, string> = {
  low:    'text-emerald-400 border-emerald-500/40 bg-emerald-500/10',
  medium: 'text-sky-400 border-sky-500/40 bg-sky-500/10',
  high:   'text-amber-400 border-amber-500/40 bg-amber-500/10',
}

export default function Systems() {
  const { t } = useTranslation()

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-white mb-2">{t('systems.title')}</h1>
      <p className="text-slate-400 mb-8">{t('systems.subtitle')}</p>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {systemTemplates.map(s => (
          <Link
            key={s.id}
            to={`/systems/${s.id}`}
            className="block bg-slate-800/60 border border-slate-700 rounded-xl p-5 hover:border-slate-500 transition-colors h-full"
          >
            <h2 className="font-semibold text-white mb-1">{t(s.nameKey)}</h2>
            <p className="text-sm text-slate-400 mb-3 line-clamp-2">{t(s.descriptionKey)}</p>
            <span className={`inline-block text-xs font-medium px-2.5 py-1 rounded-full border ${BUDGET_BADGE[s.budgetTier] ?? ''}`}>
              {s.budgetTier}
            </span>
          </Link>
        ))}
      </div>
    </div>
  )
}
