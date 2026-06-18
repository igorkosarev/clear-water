import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { motion } from 'framer-motion'
import { Info, MapPin, ExternalLink } from 'lucide-react'
import { flagEmoji } from '@/components/ui/CountrySelector'
import { useCountry } from '@/context/CountryContext'
import suppliersData from '@/data/suppliers.json'
import countriesData from '@/data/countries.json'
import modulesData from '@/data/modules.json'
import type { Supplier } from '@/types'

const allModules = modulesData as { id: string; nameKey: string }[]

interface Country { code: string; name: string }

const allSuppliers = suppliersData as Supplier[]
const countries = countriesData as Country[]

const PARTICLES = [
  { x:  8, y: 30, s:  8, dur: 6.2, dl: 0.0, dx:  6, dy: -20, accent: true  },
  { x: 20, y: 60, s: 14, dur: 7.8, dl: 1.1, dx: -4, dy: -16, accent: false },
  { x: 35, y: 25, s:  5, dur: 5.4, dl: 0.3, dx:  9, dy: -28, accent: true  },
  { x: 55, y: 70, s: 18, dur: 9.2, dl: 1.6, dx: -3, dy: -12, accent: true  },
  { x: 70, y: 40, s:  6, dur: 6.6, dl: 0.2, dx:  5, dy: -22, accent: false },
  { x: 82, y: 55, s: 11, dur: 7.2, dl: 0.9, dx: -6, dy: -15, accent: true  },
  { x: 90, y: 20, s:  9, dur: 5.8, dl: 1.9, dx:  4, dy: -24, accent: false },
  { x: 15, y: 80, s:  7, dur: 6.9, dl: 0.7, dx:  7, dy: -14, accent: true  },
  { x: 48, y: 15, s: 12, dur: 8.5, dl: 1.3, dx: -5, dy: -20, accent: false },
]

function countryName(code: string): string {
  return countries.find(c => c.code === code)?.name ?? code
}

export default function Suppliers() {
  const { t } = useTranslation()
  const { country } = useCountry()
  const [showAllOverride, setShowAllOverride] = useState(false)

  useEffect(() => { setShowAllOverride(false) }, [country])

  const filteredForCountry = country
    ? allSuppliers.filter(s => s.country === country)
    : allSuppliers

  const hasCountry = Boolean(country)
  const hasResults = filteredForCountry.length > 0
  const showEmpty = hasCountry && !hasResults && !showAllOverride
  const displayedSuppliers = showEmpty ? [] : (showAllOverride || !hasCountry) ? allSuppliers : filteredForCountry

  return (
    <div className="min-h-screen bg-slate-950 text-white">

      {/* ── Hero ── */}
      <section className="relative overflow-hidden min-h-[280px] flex items-center">

        {/* Animated radial wash */}
        <motion.div
          className="absolute inset-0 pointer-events-none"
          animate={{ opacity: [0.55, 0.95, 0.55] }}
          transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' as const }}
          style={{
            background: 'radial-gradient(ellipse at 50% 60%, rgba(34,211,238,0.16) 0%, rgba(14,165,233,0.07) 42%, transparent 68%)',
          }}
        />

        {/* Particles */}
        {PARTICLES.map((p, i) => (
          <motion.div
            key={i}
            className="absolute rounded-full pointer-events-none"
            style={{
              left: `${p.x}%`, top: `${p.y}%`,
              width: p.s, height: p.s,
              backgroundColor: p.accent ? '#22d3ee' : '#ffffff',
            }}
            animate={{
              x: [0, p.dx, p.dx * 0.4, 0],
              y: [0, p.dy * 0.5, p.dy, p.dy * 0.5, 0],
              opacity: [0, 0.25, 0.08, 0.25, 0],
            }}
            transition={{ duration: p.dur, delay: p.dl, repeat: Infinity, ease: 'easeInOut' as const }}
          />
        ))}

        {/* Watermark */}
        <motion.div
          className="absolute right-[-20px] bottom-[-20px] pointer-events-none text-cyan-400"
          style={{ opacity: 0.04 }}
          animate={{ scale: [1, 1.06, 1] }}
          transition={{ duration: 9, repeat: Infinity, ease: 'easeInOut' as const }}
        >
          <MapPin size={280} strokeWidth={0.6} />
        </motion.div>

        {/* Text */}
        <div className="relative z-10 w-full max-w-3xl mx-auto px-6 py-16 text-center">
          <motion.div
            initial={{ opacity: 0, y: 22 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
          >
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-3 tracking-tight">
              {t('suppliers.title')}
            </h1>
            <p className="text-slate-400 text-base leading-relaxed max-w-sm mx-auto">
              {t('suppliers.subtitle')}
            </p>
          </motion.div>
        </div>
      </section>

      {/* ── Content ── */}
      <section className="border-t border-slate-800/60 bg-slate-900/30">
        <div className="max-w-2xl mx-auto px-6 py-10">

          {/* Status pill */}
          <div className="flex items-center gap-2 mb-6">
            {(!hasCountry || showAllOverride) && (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-slate-800 text-slate-400 border border-slate-700/50">
                {allSuppliers.length} suppliers worldwide
              </span>
            )}
            {hasCountry && hasResults && !showAllOverride && (
              <>
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-sky-500/10 text-sky-400 border border-sky-500/20">
                  {flagEmoji(country!)} {filteredForCountry.length} in {countryName(country!)}
                </span>
                <button
                  type="button"
                  onClick={() => setShowAllOverride(true)}
                  className="text-xs text-slate-500 hover:text-slate-300 transition-colors"
                >
                  Show all
                </button>
              </>
            )}
            {showAllOverride && hasCountry && (
              <button
                type="button"
                onClick={() => setShowAllOverride(false)}
                className="text-xs text-sky-400 hover:text-sky-300 transition-colors"
              >
                {flagEmoji(country!)} Filter by {countryName(country!)}
              </button>
            )}
          </div>

          {/* Empty state */}
          {showEmpty && (
            <div className="flex items-start gap-3 bg-amber-400/10 border border-amber-400/20 rounded-xl px-5 py-4 mb-6">
              <Info size={18} className="text-amber-400 flex-shrink-0 mt-0.5" />
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
            <div className="flex flex-col gap-4">
              {displayedSuppliers.map((s, i) => (
                <motion.div
                  key={s.id}
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: i * 0.06 }}
                  className="bg-slate-900 border border-slate-800 rounded-2xl p-5 hover:border-slate-700 transition-colors"
                >
                  <div className="flex items-start justify-between gap-3 mb-2">
                    <h3 className="font-bold text-white text-base leading-snug">{s.name}</h3>
                    <span className="text-2xl leading-none flex-shrink-0">{flagEmoji(s.country)}</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-sm text-slate-400 mb-3">
                    <MapPin size={12} className="flex-shrink-0 text-slate-500" />
                    <span>{countryName(s.country)}</span>
                  </div>
                  {s.modules.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 mb-4">
                      {s.modules.map(mid => {
                        const mod = allModules.find(m => m.id === mid)
                        if (!mod) return null
                        return (
                          <span
                            key={mid}
                            className="px-2 py-0.5 rounded-full text-xs bg-slate-800 text-slate-400 border border-slate-700/60"
                          >
                            {t(mod.nameKey)}
                          </span>
                        )
                      })}
                    </div>
                  )}
                  <a
                    href={s.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 text-sm text-sky-400 hover:text-sky-300 transition-colors"
                  >
                    <ExternalLink size={13} className="flex-shrink-0" />
                    <span>{s.url.replace(/^https?:\/\//, '')}</span>
                  </a>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </section>

    </div>
  )
}
