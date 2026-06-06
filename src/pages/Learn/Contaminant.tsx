import { useParams, Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { Badge } from '@/components/ui/Badge'
import type { Contaminant } from '@/types'
import contaminants from '@/data/contaminants.json'

export default function ContaminantDetail() {
  const { id } = useParams<{ id: string }>()
  const { t } = useTranslation()
  const contaminant = (contaminants as Contaminant[]).find(c => c.id === id)

  if (!contaminant) {
    return <div className="p-8 text-gray-500">{t('common.notFound')}</div>
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <Link to="/learn" className="text-sm text-blue-600 hover:underline mb-6 block">← {t('learn.back')}</Link>
      <div className="flex items-center gap-4 mb-4">
        <span className="text-5xl">{contaminant.icon}</span>
        <div>
          <h1 className="text-3xl font-bold text-gray-900">{t(contaminant.nameKey)}</h1>
          <Badge variant="info" className="mt-1">{contaminant.category}</Badge>
        </div>
      </div>
      <p className="text-gray-600 mt-4">{t(contaminant.descriptionKey)}</p>
    </div>
  )
}
