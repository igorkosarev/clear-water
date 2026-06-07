import { useMemo } from 'react'
import { useParams, Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { Badge } from '@/components/ui/Badge'
import type { Contaminant, TreatmentMethod } from '@/types'
import methods from '@/data/treatment-methods.json'
import contaminants from '@/data/contaminants.json'

export default function MethodDetail() {
  const { id } = useParams<{ id: string }>()
  const { t } = useTranslation()
  const method = (methods as TreatmentMethod[]).find(m => m.id === id)

  const removedContaminants = useMemo(() => {
    if (!method) return []
    return (contaminants as Contaminant[]).filter(c => method.removes.includes(c.id))
  }, [method])

  if (!method) {
    return <div className="p-8 text-gray-500">{t('common.notFound')}</div>
  }

  const complexityVariant = {
    beginner: 'success',
    intermediate: 'warning',
    advanced: 'danger',
  } as const

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <Link to="/learn/methods" className="text-sm text-blue-600 hover:underline mb-6 block">
        ← {t('learn.methods.back')}
      </Link>

      <h1 className="text-3xl font-bold text-gray-900 mb-2">{t(method.nameKey)}</h1>
      <div className="flex gap-2 mb-4">
        <Badge variant={complexityVariant[method.complexity]}>{method.complexity}</Badge>
        <Badge variant="info">{method.costTier}</Badge>
      </div>

      <p className="text-gray-600">{t(method.descriptionKey)}</p>

      {removedContaminants.length > 0 && (
        <div className="mt-8 pt-6 border-t border-gray-100">
          <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">
            {t('learn.methods.removes')}
          </h2>
          <div className="flex flex-wrap gap-2">
            {removedContaminants.map(c => (
              <Link key={c.id} to={`/learn/contaminants#${c.id}`}>
                <span
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium hover:opacity-80 transition-opacity"
                  style={{
                    backgroundColor: c.color + '1a',
                    color: c.color,
                    border: `1px solid ${c.color}44`,
                  }}
                >
                  <span className="text-base leading-none">{c.icon}</span>
                  {t(c.nameKey)}
                </span>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
