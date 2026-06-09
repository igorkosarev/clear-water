import { motion } from 'framer-motion'
import { useTranslation } from 'react-i18next'
import { Link } from 'react-router-dom'
import { ArrowRight, Flame, Layers, Filter, Hexagon, Sun, Waves, TestTube, Wind, Thermometer, FlaskConical, Droplets, Package } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import type { TreatmentMethod } from '@/types'
import methodsData from '@/data/treatment-methods.json'
import { COMPLEXITY_CLASS, COST_CLASS } from '@/components/encyclopedia/contaminantConfig'

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

// ─── Icons ────────────────────────────────────────────────────────────────────

export const METHOD_ICONS: Record<string, LucideIcon> = {
  boiling:             Flame,
  biosand:             Layers,
  ceramic_filtration:  Filter,
  activated_carbon:    Hexagon,
  uv_disinfection:     Sun,
  reverse_osmosis:     Waves,
  chlorination:        TestTube,
  hollow_fiber:        Wind,
  distillation:        Thermometer,
  ion_exchange:        FlaskConical,
  water_softening:     Droplets,
  sediment_filtration: Package,
}

// ─── Animation variants ───────────────────────────────────────────────────────

const gridVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.07, delayChildren: 0.1 } },
}

const cardVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.45, ease: 'easeOut' as const } },
}

// ─── Static data ──────────────────────────────────────────────────────────────

const methods = methodsData as TreatmentMethod[]

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function Methods() {
  const { t } = useTranslation()

  return (
    <div>
      {/* ── Hero ── */}
      <section className="relative bg-slate-950 text-white overflow-hidden min-h-[380px] md:min-h-[440px] flex items-center">
        <motion.div
          className="absolute inset-0 pointer-events-none"
          animate={{ opacity: [0.6, 1, 0.6] }}
          transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }}
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
            transition={{ duration: p.dur, delay: p.delay, repeat: Infinity, ease: 'easeInOut' }}
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

      {/* ── Card grid ── */}
      <div className="bg-slate-950 px-4 py-12">
        <div className="max-w-5xl mx-auto">
          <motion.div
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5"
            variants={gridVariants}
            initial="hidden"
            animate="visible"
          >
            {methods.map(m => {
              const Icon = METHOD_ICONS[m.id]

              return (
                <motion.div
                  key={m.id}
                  variants={cardVariants}
                  className="bg-slate-900/80 border border-slate-800 rounded-2xl overflow-hidden flex flex-col"
                >
                  {/* Accent strip */}
                  <div className="h-1 w-full flex-shrink-0" style={{ backgroundColor: m.color }} />

                  <div className="p-5 flex flex-col gap-3 flex-1">
                    {/* Badges + icon */}
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex flex-wrap gap-1.5">
                        <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-semibold ${COMPLEXITY_CLASS[m.complexity] ?? 'text-slate-400 border border-slate-400/30 bg-slate-400/10'}`}>
                          {t(`method.complexity.${m.complexity}`)}
                        </span>
                        <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-semibold ${COST_CLASS[m.costTier] ?? 'text-slate-400 border border-slate-400/30 bg-slate-400/10'}`}>
                          {t(`method.costTier.${m.costTier}`)}
                        </span>
                      </div>
                      {Icon && <Icon size={20} strokeWidth={1.5} style={{ color: m.color }} className="flex-shrink-0" />}
                    </div>

                    {/* Name */}
                    <h3 className="text-white font-bold text-base leading-snug">
                      {t(m.nameKey)}
                    </h3>

                    {/* Description */}
                    <p className="text-slate-400 text-sm leading-relaxed line-clamp-3 flex-1">
                      {t(m.descriptionKey)}
                    </p>

                    {/* Learn more */}
                    <Link
                      to={`/learn/methods/${m.id}`}
                      className="inline-flex items-center gap-1.5 self-start mt-1 px-3 py-1.5 rounded-full text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 transition-colors"
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
      </div>
    </div>
  )
}
