import { useParams, Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { Badge } from '@/components/ui/Badge'
import type { TreatmentMethod } from '@/types'
import methods from '@/data/treatment-methods.json'

export default function MethodDetail() {
  const { id } = useParams<{ id: string }>()
  const { t } = useTranslation()
  const method = (methods as TreatmentMethod[]).find(m => m.id === id)

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
      <Link to="/learn" className="text-sm text-blue-600 hover:underline mb-6 block">← {t('learn.back')}</Link>
      <h1 className="text-3xl font-bold text-gray-900 mb-2">{t(method.nameKey)}</h1>
      <div className="flex gap-2 mb-4">
        <Badge variant={complexityVariant[method.complexity]}>{method.complexity}</Badge>
        <Badge variant="info">{method.costTier}</Badge>
      </div>
      <p className="text-gray-600">{t(method.descriptionKey)}</p>
    </div>
  )
}
