import { useTranslation } from 'react-i18next'
import { ContaminantCard } from '@/components/encyclopedia/ContaminantCard'
import { MethodCard } from '@/components/encyclopedia/MethodCard'
import type { Contaminant, TreatmentMethod } from '@/types'
import contaminants from '@/data/contaminants.json'
import methods from '@/data/treatment-methods.json'

export default function Learn() {
  const { t } = useTranslation()

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-2">{t('learn.title')}</h1>
      <p className="text-gray-500 mb-10">{t('learn.subtitle')}</p>

      <section className="mb-12">
        <h2 className="text-xl font-semibold text-gray-800 mb-4">{t('learn.contaminants.title')}</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {(contaminants as Contaminant[]).map(c => (
            <ContaminantCard key={c.id} contaminant={c} />
          ))}
        </div>
      </section>

      <section>
        <h2 className="text-xl font-semibold text-gray-800 mb-4">{t('learn.methods.title')}</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {(methods as TreatmentMethod[]).map(m => (
            <MethodCard key={m.id} method={m} />
          ))}
        </div>
      </section>
    </div>
  )
}
