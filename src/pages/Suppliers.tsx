import { useTranslation } from 'react-i18next'
import { Card } from '@/components/ui/Card'
import { flagEmoji } from '@/components/ui/CountrySelector'
import { useCountry } from '@/context/CountryContext'
import suppliersData from '@/data/suppliers.json'
import type { Supplier } from '@/types'

const allSuppliers = suppliersData as Supplier[]

export default function Suppliers() {
  const { t } = useTranslation()
  const { country } = useCountry()

  const filtered = country
    ? allSuppliers.filter(s => s.country === country)
    : allSuppliers

  const suppliers = filtered.length > 0 ? filtered : allSuppliers
  const showingAll = !country || filtered.length === 0

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-2">{t('suppliers.title')}</h1>
      <p className="text-gray-500 mb-2">{t('suppliers.subtitle')}</p>
      {showingAll && (
        <p className="text-sm text-amber-600 mb-6">{t('suppliers.showingAll')}</p>
      )}
      {!showingAll && (
        <p className="text-sm text-blue-600 mb-6">
          {flagEmoji(country!)} {t('suppliers.filteredBy', { country })}
        </p>
      )}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {suppliers.map(s => (
          <Card key={s.id} className="p-5">
            <div className="flex items-start justify-between mb-1">
              <h3 className="font-semibold text-gray-900">{s.name}</h3>
              <span className="text-lg leading-none">{flagEmoji(s.country)}</span>
            </div>
            <p className="text-sm text-gray-500 mb-3">{s.country}</p>
            <a
              href={s.url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-blue-600 hover:underline"
            >
              {s.url}
            </a>
          </Card>
        ))}
      </div>
    </div>
  )
}
