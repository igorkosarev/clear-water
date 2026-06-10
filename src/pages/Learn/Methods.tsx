import { useEffect } from 'react'
import { motion } from 'framer-motion'
import { useTranslation } from 'react-i18next'
import { Link, useLocation } from 'react-router-dom'
import {
  Flame, Layers, Filter, Hexagon, Sun, Waves, TestTube, Wind,
  Thermometer, FlaskConical, Droplets, Package, ShieldCheck, ArrowRight,
  Sunrise, GitMerge, Sparkles,
} from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import type { TreatmentMethod } from '@/types'
import methodsData from '@/data/treatment-methods.json'

// ─── Hero particles ───────────────────────────────────────────────────────────

type HeroParticle = {
  x: number; y: number; size: number
  dur: number; delay: number
  dx: number; dy: number
  accent: boolean
}

const HERO_PARTICLES: HeroParticle[] = [
  { x:  5, y: 75, size:  7, dur: 6.0, delay: 0.0, dx:  5, dy: -22, accent: true  },
  { x: 18, y: 58, size: 12, dur: 7.5, delay: 1.0, dx: -4, dy: -16, accent: false },
  { x: 28, y: 84, size:  5, dur: 5.0, delay: 0.3, dx:  8, dy: -28, accent: true  },
  { x: 40, y: 68, size: 22, dur: 9.0, delay: 1.4, dx: -2, dy: -12, accent: true  },
  { x: 52, y: 82, size:  8, dur: 6.5, delay: 0.1, dx:  4, dy: -20, accent: false },
  { x: 64, y: 52, size: 10, dur: 7.0, delay: 0.8, dx: -6, dy: -15, accent: true  },
  { x: 76, y: 72, size:  9, dur: 5.5, delay: 1.8, dx:  3, dy: -22, accent: false },
  { x: 87, y: 62, size: 15, dur: 7.2, delay: 0.5, dx: -5, dy: -18, accent: true  },
  { x: 95, y: 38, size:  5, dur: 5.2, delay: 1.1, dx: -4, dy: -24, accent: false },
  { x:  9, y: 28, size: 11, dur: 6.8, delay: 0.7, dx:  7, dy: -14, accent: true  },
  { x: 32, y: 44, size:  7, dur: 5.8, delay: 2.0, dx: -5, dy: -18, accent: false },
  { x: 49, y: 18, size: 26, dur: 9.5, delay: 0.2, dx:  2, dy:  -8, accent: true  },
  { x: 69, y: 34, size:  8, dur: 6.2, delay: 1.6, dx: -6, dy: -16, accent: false },
  { x: 90, y: 82, size: 13, dur: 7.8, delay: 1.1, dx:  4, dy: -22, accent: true  },
  { x: 22, y: 14, size:  5, dur: 4.8, delay: 0.6, dx:  5, dy: -28, accent: false },
  { x: 56, y: 50, size: 18, dur: 8.2, delay: 2.0, dx: -3, dy: -14, accent: true  },
  { x: 79, y: 22, size:  6, dur: 5.4, delay: 0.4, dx:  3, dy: -21, accent: false },
  { x: 44, y:  9, size: 30, dur:10.0, delay: 0.0, dx: -1, dy:  -6, accent: true  },
]

const ACCENT = '#10b981'

// ─── Method icons ─────────────────────────────────────────────────────────────

export const METHOD_ICONS: Record<string, LucideIcon> = {
  boiling:                 Flame,
  biosand:                 Layers,
  ceramic_filtration:      Filter,
  activated_carbon:        Hexagon,
  uv_disinfection:         Sun,
  reverse_osmosis:         Waves,
  chlorination:            TestTube,
  hollow_fiber:            Wind,
  distillation:            Thermometer,
  ion_exchange:            FlaskConical,
  water_softening:         Droplets,
  sediment_filtration:     Package,
  solar_disinfection:      Sunrise,
  coagulation_flocculation: GitMerge,
  aeration:                Sparkles,
}

// ─── Mechanism groups ─────────────────────────────────────────────────────────

export const MECHANISM_ORDER = ['thermal', 'mechanical', 'disinfection', 'adsorption_ion'] as const

export const MECHANISM_META: Record<string, { label: string; description: string; color: string; Icon: LucideIcon }> = {
  thermal: {
    label: 'Thermal',
    description: 'Heat-based purification that kills pathogens or separates water from dissolved impurities through evaporation and condensation.',
    color: '#ef4444',
    Icon: Flame,
  },
  mechanical: {
    label: 'Mechanical Filtration',
    description: 'Physical barriers and membranes that remove particles, sediment, and microorganisms by size exclusion.',
    color: '#f59e0b',
    Icon: Layers,
  },
  disinfection: {
    label: 'Disinfection',
    description: 'Chemical and radiation-based methods that neutralise bacteria, viruses, and other biological pathogens.',
    color: '#10b981',
    Icon: ShieldCheck,
  },
  adsorption_ion: {
    label: 'Adsorption & Ion Exchange',
    description: 'Sorption and ion-exchange processes that remove dissolved chemicals, heavy metals, and mineral ions from water.',
    color: '#60a5fa',
    Icon: FlaskConical,
  },
}

// ─── Section header particles ─────────────────────────────────────────────────

type SectionParticle = {
  x: number; topPx: number; s: number
  dur: number; dl: number
  dx: number; dy: number
}

const SECTION_PARTICLES: SectionParticle[] = [
  { x:  4, topPx:  30, s:  7, dur: 6.5, dl: 0.0, dx:  9, dy: -18 },
  { x: 13, topPx: 140, s: 12, dur: 8.0, dl: 1.2, dx: -6, dy: -25 },
  { x: 23, topPx:  60, s:  5, dur: 5.5, dl: 0.5, dx: 11, dy: -14 },
  { x: 35, topPx: 160, s: 18, dur: 9.5, dl: 1.8, dx: -4, dy: -20 },
  { x: 51, topPx:  20, s:  9, dur: 7.0, dl: 0.3, dx:  6, dy: -28 },
  { x: 64, topPx: 120, s:  6, dur: 6.0, dl: 2.0, dx: -8, dy: -16 },
  { x: 76, topPx:  45, s: 21, dur:10.0, dl: 0.8, dx:  4, dy: -12 },
  { x: 87, topPx: 150, s: 10, dur: 7.5, dl: 1.5, dx: -5, dy: -22 },
  { x: 46, topPx:  90, s:  8, dur: 5.8, dl: 1.0, dx:  7, dy: -20 },
  { x: 96, topPx:  70, s: 14, dur: 8.5, dl: 0.4, dx: -3, dy: -16 },
]

// ─── Animation variants ───────────────────────────────────────────────────────

const sectionVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.5, ease: 'easeOut' as const } },
}

const headerVariants = {
  hidden: { opacity: 0, y: 28 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: 'easeOut' as const } },
}

const gridVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.06, delayChildren: 0.08 } },
}

const cardVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.45, ease: 'easeOut' as const } },
}

// ─── Static data ──────────────────────────────────────────────────────────────

const methods = methodsData as TreatmentMethod[]

const grouped = MECHANISM_ORDER.reduce<Record<string, TreatmentMethod[]>>((acc, key) => {
  acc[key] = methods.filter(m => m.mechanismGroup === key)
  return acc
}, {})

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function Methods() {
  const { t } = useTranslation()
  const location = useLocation()

  useEffect(() => {
    const scrollTo = (location.state as { scrollTo?: string } | null)?.scrollTo
    if (!scrollTo) return
    requestAnimationFrame(() => {
      document.getElementById(`section-${scrollTo}`)?.scrollIntoView({ behavior: 'smooth' })
    })
  }, [location.state])

  return (
    <div>
      {/* ── Hero ── */}
      <section className="relative bg-slate-950 text-white overflow-hidden min-h-[380px] md:min-h-[440px] flex items-center">
        <motion.div
          className="absolute inset-0 pointer-events-none"
          animate={{ opacity: [0.6, 1, 0.6] }}
          transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' as const }}
          style={{ background: `radial-gradient(ellipse at 50% 50%, ${ACCENT}2e 0%, ${ACCENT}0a 45%, transparent 70%)` }}
        />

        {HERO_PARTICLES.map((p, i) => (
          <motion.div
            key={i}
            className="absolute rounded-full pointer-events-none"
            style={{
              left: `${p.x}%`,
              top: `${p.y}%`,
              width: p.size,
              height: p.size,
              backgroundColor: p.accent ? ACCENT : '#ffffff',
            }}
            animate={{
              x: [0, p.dx, p.dx * 0.4, 0],
              y: [0, p.dy * 0.5, p.dy, p.dy * 0.5, 0],
              opacity: [0, 0.32, 0.12, 0.32, 0],
            }}
            transition={{ duration: p.dur, delay: p.delay, repeat: Infinity, ease: 'easeInOut' as const }}
          />
        ))}

        <div className="absolute inset-0 bg-slate-950/55 md:hidden pointer-events-none" />

        <div className="relative z-10 w-full max-w-5xl mx-auto px-4 py-20 text-center">
          <motion.h1
            className="text-4xl md:text-5xl font-bold mb-4 leading-tight tracking-tight"
            initial={{ opacity: 0, y: 32 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.75 }}
          >
            {t('learn.methods.title')}
          </motion.h1>
          <motion.p
            className="text-slate-300 text-lg max-w-2xl mx-auto leading-relaxed"
            initial={{ opacity: 0, y: 32 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.75, delay: 0.18 }}
          >
            {t('learn.methods.subtitle')}
          </motion.p>
        </div>
      </section>

      {/* ── Mechanism sections ── */}
      <div className="bg-slate-950 divide-y divide-slate-800/50">
        {MECHANISM_ORDER.map(mechKey => {
          const meta = MECHANISM_META[mechKey]
          const items = grouped[mechKey] ?? []
          if (!meta || items.length === 0) return null
          const { Icon } = meta

          return (
            <motion.section
              key={mechKey}
              id={`section-${mechKey}`}
              className="relative overflow-hidden"
              variants={sectionVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: '-80px' }}
            >
              {/* ── Full-section background ── */}
              <div className="absolute inset-0 bg-slate-900" />

              {/* Color wash */}
              <motion.div
                className="absolute inset-0 pointer-events-none"
                animate={{ opacity: [0.7, 1, 0.7] }}
                transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' as const }}
                style={{
                  background: `radial-gradient(ellipse at 70% 30%, ${meta.color}22 0%, ${meta.color}0a 50%, transparent 75%)`,
                }}
              />

              {/* ── Header zone: particles + watermark icon ── */}
              <div className="absolute left-0 right-0 top-0 overflow-hidden pointer-events-none" style={{ height: 220 }}>
                {/* Pulsing glow */}
                <motion.div
                  className="absolute inset-0 flex items-center justify-center"
                  animate={{ opacity: [0.4, 0.9, 0.4] }}
                  transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' as const }}
                >
                  <div style={{
                    width: 420,
                    height: 420,
                    borderRadius: '50%',
                    background: `radial-gradient(circle, ${meta.color}1a 0%, transparent 70%)`,
                  }} />
                </motion.div>

                {/* Watermark icon */}
                <motion.div
                  className="absolute inset-0 flex items-center justify-center"
                  style={{ color: meta.color, opacity: 0.07 }}
                  animate={{ scale: [1, 1.06, 1] }}
                  transition={{ duration: 9, repeat: Infinity, ease: 'easeInOut' as const }}
                >
                  <Icon size={310} strokeWidth={0.65} />
                </motion.div>

                {/* Floating particles */}
                {SECTION_PARTICLES.map((p, i) => (
                  <motion.div
                    key={i}
                    className="absolute rounded-full"
                    style={{
                      left: `${p.x}%`,
                      top: p.topPx,
                      width: p.s,
                      height: p.s,
                      backgroundColor: meta.color,
                    }}
                    animate={{
                      x: [0, p.dx, p.dx * 0.5, 0],
                      y: [0, p.dy * 0.5, p.dy, p.dy * 0.5, 0],
                      opacity: [0, 0.38, 0.14, 0.38, 0],
                    }}
                    transition={{ duration: p.dur, delay: p.dl, repeat: Infinity, ease: 'easeInOut' as const }}
                  />
                ))}
              </div>

              {/* ── Readable content ── */}
              <div className="relative z-10 max-w-5xl mx-auto px-4">

                {/* Section heading */}
                <motion.div
                  className="pt-14 pb-10 md:pt-16 md:pb-12 flex items-end justify-between gap-6"
                  variants={headerVariants}
                >
                  <div>
                    <div
                      className="inline-block w-10 h-1 rounded-full mb-4"
                      style={{ backgroundColor: meta.color }}
                    />
                    <h2
                      className="text-4xl md:text-5xl font-bold text-white tracking-tight leading-tight mb-3"
                      style={{ textShadow: `0 0 80px ${meta.color}55` }}
                    >
                      {meta.label}
                    </h2>
                    <p className="text-slate-400 text-base leading-relaxed max-w-lg">
                      {meta.description}
                    </p>
                  </div>
                  <span
                    className="flex-shrink-0 px-5 py-2.5 rounded-full text-sm font-bold tabular-nums mb-1"
                    style={{
                      backgroundColor: `${meta.color}18`,
                      color: meta.color,
                      border: `1px solid ${meta.color}45`,
                    }}
                  >
                    {items.length}
                  </span>
                </motion.div>

                {/* Card grid */}
                <motion.div
                  className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 pb-14"
                  variants={gridVariants}
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ once: true, margin: '-60px' }}
                >
                  {items.map(m => {
                    const MIcon = METHOD_ICONS[m.id]
                    return (
                      <motion.div
                        key={m.id}
                        variants={cardVariants}
                        className="bg-slate-950/75 border border-slate-700/60 rounded-2xl overflow-hidden flex flex-col backdrop-blur-sm"
                      >
                        <div className="h-0.5 w-full flex-shrink-0" style={{ backgroundColor: m.color }} />
                        <div className="p-5 flex flex-col gap-3 flex-1">
                          <div className="flex items-start justify-between gap-2">
                            <h3 className="text-white font-bold text-base leading-snug">
                              {t(m.nameKey)}
                            </h3>
                            {MIcon && (
                              <MIcon size={20} strokeWidth={1.5} style={{ color: m.color }} className="flex-shrink-0 mt-0.5" />
                            )}
                          </div>
                          <p className="text-slate-400 text-sm leading-relaxed line-clamp-3 flex-1">
                            {t(m.descriptionKey)}
                          </p>
                          <Link
                            to={`/learn/methods/${m.id}`}
                            className="inline-flex items-center gap-1.5 self-start mt-1 px-3 py-1.5 rounded-full text-xs font-semibold bg-slate-800/80 hover:bg-slate-700 text-slate-200 transition-colors"
                          >
                            {t('learn.methods.learnMore', { defaultValue: 'Learn more' })}
                            <ArrowRight size={12} />
                          </Link>
                        </div>
                      </motion.div>
                    )
                  })}
                </motion.div>

              </div>
            </motion.section>
          )
        })}
      </div>
    </div>
  )
}
