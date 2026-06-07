import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Info } from 'lucide-react'
import { Card } from '@/components/ui/Card'
import { flagEmoji } from '@/components/ui/CountrySelector'
import { useCountry } from '@/context/CountryContext'
import suppliersData from '@/data/suppliers.json'
import countriesData from '@/data/countries.json'
import type { Supplier } from '@/types'

interface Country { code: string; name: string }

const allSuppliers = suppliersData as Supplier[]
const countries = countriesData as Country[]

function countryName(code: string): string {
  return countries.find(c => c.code === code)?.name ?? code
}

export default function Suppliers() {
  const { t } = useTranslation()
  const { country } = useCountry()
  const [showAllOverride, setShowAllOverride] = useState(false)

  // Reset override whenever the selected country changes
  const filteredForCountry = country
    ? allSuppliers.filter(s => s.country === country)
    : allSuppliers

  const hasCountry = Boolean(country)
  const hasResults = filteredForCountry.length > 0
  const showEmpty = hasCountry && !hasResults && !showAllOverride
  const displayedSuppliers = showEmpty ? [] : (showAllOverride || !hasCountry) ? allSuppliers : filteredForCountry

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-2">{t('suppliers.title')}</h1>
      <p className="text-gray-500 mb-6">{t('suppliers.subtitle')}</p>

      {/* Status line */}
      {!hasCountry && (
        <p className="text-sm text-amber-600 mb-6">{t('suppliers.showingAll')}</p>
      )}
      {hasCountry && hasResults && !showAllOverride && (
        <p className="text-sm text-blue-600 mb-6">
          {flagEmoji(country!)} {t('suppliers.filteredBy', { country: countryName(country!) })}
        </p>
      )}
      {(showAllOverride && hasCountry) && (
        <p className="text-sm text-amber-600 mb-6">{t('suppliers.showingAll')}</p>
      )}

      {/* Empty state banner */}
      {showEmpty && (
        <div className="flex items-start gap-3 bg-amber-400/10 border border-amber-400/20 rounded-xl px-5 py-4 mb-6">
          <Info size={18} className="text-amber-400 flex-shrink-0 mt-0.5" aria-label={t('suppliers.bannerInfo')} />
          <div>
            <p className="text-sm font-semibold text-amber-300 mb-1">
              {t('suppliers.bannerInfo')}
            </p>
            <p className="text-sm text-slate-300">
              {t('suppliers.noSuppliersForCountry', { country: countryName(country!) })}
            </p>
            <button
              type="button"
              className="mt-2 text-sm text-blue-400 hover:text-blue-300 hover:underline font-medium transition-colors"
              onClick={() => setShowAllOverride(true)}
            >
              {t('suppliers.showAll')}
            </button>
          </div>
        </div>
      )}

      {/* Supplier cards */}
      {displayedSuppliers.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {displayedSuppliers.map(s => (
            <Card key={s.id} className="p-5">
              <div className="flex items-start justify-between mb-1">
                <h3 className="font-semibold text-gray-900">{s.name}</h3>
                <span className="text-lg leading-none">{flagEmoji(s.country)}</span>
              </div>
              <p className="text-sm text-gray-500 mb-3">{countryName(s.country)}</p>
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
      )}
    </div>
  )
}
