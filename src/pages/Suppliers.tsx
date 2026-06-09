import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { motion } from 'framer-motion'
import { Info, MapPin, ExternalLink } from 'lucide-react'
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

  const filteredForCountry = country
    ? allSuppliers.filter(s => s.country === country)
    : allSuppliers

  const hasCountry = Boolean(country)
  const hasResults = filteredForCountry.length > 0
  const showEmpty = hasCountry && !hasResults && !showAllOverride
  const displayedSuppliers = showEmpty ? [] : (showAllOverride || !hasCountry) ? allSuppliers : filteredForCountry

  return (
    <div className="min-h-screen bg-slate-950 text-white">

      {/* ── Header ── */}
      <div className="border-b border-slate-800/60">
        <div className="max-w-4xl mx-auto px-4 py-10 text-center">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="flex items-center justify-center gap-3 mb-3">
              <MapPin size={24} className="text-cyan-400" strokeWidth={1.5} />
              <h1 className="text-3xl md:text-4xl font-bold text-white">
                {t('suppliers.title')}
              </h1>
            </div>
            <p className="text-slate-400 text-sm max-w-md mx-auto leading-relaxed">
              {t('suppliers.subtitle')}
            </p>
          </motion.div>
        </div>
      </div>

      {/* ── Content ── */}
      <div className="max-w-4xl mx-auto px-4 py-8">

        {/* Status line */}
        {!hasCountry && (
          <p className="text-sm text-slate-400 mb-6">{t('suppliers.showingAll')}</p>
        )}
        {hasCountry && hasResults && !showAllOverride && (
          <p className="text-sm text-sky-400 mb-6">
            {flagEmoji(country!)} {t('suppliers.filteredBy', { country: countryName(country!) })}
          </p>
        )}
        {showAllOverride && hasCountry && (
          <p className="text-sm text-slate-400 mb-6">{t('suppliers.showingAll')}</p>
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
                className="mt-2 text-sm text-sky-400 hover:text-sky-300 hover:underline font-medium transition-colors"
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
            {displayedSuppliers.map((s, i) => (
              <motion.div
                key={s.id}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: i * 0.06 }}
                className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 flex flex-col gap-3"
              >
                <div className="flex items-start justify-between gap-2">
                  <h3 className="font-semibold text-white leading-snug">{s.name}</h3>
                  <span className="text-xl leading-none flex-shrink-0">{flagEmoji(s.country)}</span>
                </div>
                <p className="text-sm text-slate-400">{countryName(s.country)}</p>
                <a
                  href={s.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-sm text-sky-400 hover:text-sky-300 transition-colors truncate"
                >
                  <ExternalLink size={13} className="flex-shrink-0" />
                  <span className="truncate">{s.url.replace(/^https?:\/\//, '')}</span>
                </a>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
