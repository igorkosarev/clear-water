import { useTranslation } from 'react-i18next'
import { MethodCard } from '@/components/encyclopedia/MethodCard'
import type { TreatmentMethod } from '@/types'
import methods from '@/data/treatment-methods.json'

export default function Methods() {
  const { t } = useTranslation()

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-2">{t('learn.methods.title')}</h1>
      <p className="text-gray-500 mb-8">{t('learn.methods.subtitle')}</p>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {(methods as TreatmentMethod[]).map(m => (
          <MethodCard key={m.id} method={m} />
        ))}
      </div>
    </div>
  )
}
