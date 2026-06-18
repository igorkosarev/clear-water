import { useState } from 'react'
import { motion } from 'framer-motion'
import { useTranslation } from 'react-i18next'
import { Link } from 'react-router-dom'
import { Layers, Leaf, Droplet, Sun, Waves, ArrowRight, ShieldCheck } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import systemTemplates from '@/data/system-templates.json'

// ─── Config ───────────────────────────────────────────────────────────────────

const BUDGET_COLOR: Record<string, string> = {
  low:    '#1D9E75',
  medium: '#378ADD',
  high:   '#EF9F27',
}

const BUDGET_LABEL: Record<string, string> = {
  low:    'Low budget',
  medium: 'Medium budget',
  high:   'High budget',
}

const SYSTEM_ICON: Record<string, LucideIcon> = {
  basic_boil_ceramic: Layers,
  biosand_system:     Leaf,
  tap_upgrade:        Droplet,
  mid_tier_uv:        Sun,
  full_ro_system:     Waves,
}

const SOURCE_LABELS: Record<string, string> = {
  well:   'Well',
  tap:    'Tap',
  river:  'River',
  pond:   'Pond',
  spring: 'Spring',
  rain:   'Rain',
}

const SOURCE_ORDER = ['well', 'tap', 'river', 'pond', 'spring', 'rain']

// ─── Particles ────────────────────────────────────────────────────────────────

type CardParticle = { x: number; y: number; s: number; dur: number; dl: number; dx: number; dy: number }

const CARD_PARTICLES: CardParticle[] = [
  { x:  5, y: 20, s: 4, dur: 6.0, dl: 0.0, dx:  6, dy: -20 },
  { x: 18, y: 65, s: 7, dur: 7.5, dl: 0.8, dx: -5, dy: -15 },
  { x: 35, y: 35, s: 5, dur: 5.5, dl: 0.3, dx:  8, dy: -25 },
  { x: 72, y: 15, s: 6, dur: 6.8, dl: 0.6, dx:  4, dy: -22 },
  { x: 88, y: 50, s: 8, dur: 7.2, dl: 1.2, dx: -6, dy: -14 },
  { x: 92, y: 80, s: 5, dur: 6.5, dl: 0.4, dx: -4, dy: -24 },
]

// ─── Animations ───────────────────────────────────────────────────────────────

const cardVariants = {
  hidden: { opacity: 0, y: 24 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: 'easeOut' as const, delay: i * 0.08 },
  }),
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function Systems() {
  const { t } = useTranslation()
  const [activeSource, setActiveSource] = useState<string | null>(null)

  const usedSources = SOURCE_ORDER.filter(src =>
    systemTemplates.some(s => s.suitableFor.includes(src))
  )

  const filtered = activeSource
    ? systemTemplates.filter(s => s.suitableFor.includes(activeSource))
    : systemTemplates

  return (
    <div className="bg-slate-950 min-h-screen text-white">

      {/* ── Hero ── */}
      <section className="relative overflow-hidden">
        <motion.div
          className="absolute inset-0 pointer-events-none"
          animate={{ opacity: [0.5, 0.9, 0.5] }}
          transition={{ duration: 7, repeat: Infinity, ease: 'easeInOut' as const }}
          style={{
            background:
              'radial-gradient(ellipse at 50% 60%, rgba(55,138,221,0.14) 0%, rgba(29,158,117,0.07) 40%, transparent 65%)',
          }}
        />
        <div className="relative z-10 max-w-5xl mx-auto px-6 py-16 text-center">
          <motion.h1
            className="text-4xl md:text-5xl font-bold text-white mb-3 tracking-tight"
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.65 }}
          >
            {t('systems.title')}
          </motion.h1>
          <motion.p
            className="text-slate-400 text-base max-w-xl mx-auto"
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.65, delay: 0.15 }}
          >
            {t('systems.subtitle')}
          </motion.p>
        </div>
      </section>

      {/* ── Filter tabs ── */}
      <div className="max-w-5xl mx-auto px-6 pb-6">
        <motion.div
          className="flex gap-2 flex-wrap"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.4, delay: 0.25 }}
        >
          <button
            onClick={() => setActiveSource(null)}
            className={`text-xs px-4 py-1.5 rounded-full border transition-colors ${
              activeSource === null
                ? 'bg-slate-800 text-slate-200 border-slate-600'
                : 'border-slate-700 text-slate-500 hover:text-slate-400'
            }`}
          >
            {t('systems.filterAll', { defaultValue: 'All systems' })}
          </button>
          {usedSources.map(src => (
            <button
              key={src}
              onClick={() => setActiveSource(activeSource === src ? null : src)}
              className={`text-xs px-4 py-1.5 rounded-full border transition-colors ${
                activeSource === src
                  ? 'bg-slate-800 text-slate-200 border-slate-600'
                  : 'border-slate-700 text-slate-500 hover:text-slate-400'
              }`}
            >
              {SOURCE_LABELS[src] ?? src}
            </button>
          ))}
        </motion.div>
      </div>

      {/* ── Cards ── */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-slate-900" />
        <motion.div
          className="absolute inset-0 pointer-events-none"
          animate={{ opacity: [0.6, 1, 0.6] }}
          transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' as const }}
          style={{
            background: 'radial-gradient(ellipse at 50% 0%, rgba(55,138,221,0.06) 0%, transparent 55%)',
          }}
        />
        <div className="relative z-10 max-w-5xl mx-auto px-6 py-10 pb-16">
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {filtered.map((s, i) => {
              const color = BUDGET_COLOR[s.budgetTier] ?? '#378ADD'
              const Icon  = SYSTEM_ICON[s.id] ?? Layers

              return (
                <motion.div
                  key={s.id}
                  custom={i}
                  variants={cardVariants}
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ once: true, margin: '-40px' }}
                >
                  <Link to={`/systems/${s.id}`} className="group block h-full">
                    <motion.div
                      className="relative h-full rounded-2xl overflow-hidden border border-slate-700/50 flex flex-col"
                      whileHover={{ scale: 1.02, borderColor: `${color}55` }}
                      transition={{ duration: 0.22 }}
                    >
                      <div className="absolute inset-0 bg-slate-900" />

                      {/* Color wash */}
                      <motion.div
                        className="absolute inset-0 pointer-events-none"
                        animate={{ opacity: [0.65, 1, 0.65] }}
                        transition={{ duration: 5 + i * 0.8, repeat: Infinity, ease: 'easeInOut' as const }}
                        style={{
                          background: `radial-gradient(ellipse at 75% 20%, ${color}28 0%, ${color}0c 45%, transparent 70%)`,
                        }}
                      />

                      {/* Hover glow */}
                      <div
                        className="absolute inset-0 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                        style={{ background: `radial-gradient(ellipse at 50% 50%, ${color}14 0%, transparent 60%)` }}
                      />

                      {/* Watermark icon */}
                      <motion.div
                        className="absolute right-[-16px] top-[-16px] pointer-events-none"
                        style={{ color, opacity: 0.06 }}
                        animate={{ scale: [1, 1.07, 1] }}
                        transition={{ duration: 8 + i * 0.5, repeat: Infinity, ease: 'easeInOut' as const }}
                      >
                        <Icon size={160} strokeWidth={0.7} />
                      </motion.div>

                      {/* Floating particles */}
                      {CARD_PARTICLES.map((p, pi) => (
                        <motion.div
                          key={pi}
                          className="absolute rounded-full pointer-events-none"
                          style={{
                            left:            `${p.x}%`,
                            top:             `${p.y}%`,
                            width:           p.s,
                            height:          p.s,
                            backgroundColor: color,
                          }}
                          animate={{
                            x:       [0, p.dx * 0.6, 0],
                            y:       [0, p.dy * 0.6, 0],
                            opacity: [0, 0.2, 0],
                          }}
                          transition={{
                            duration: p.dur,
                            delay:    p.dl + i * 0.25,
                            repeat:   Infinity,
                            ease:     'easeInOut' as const,
                          }}
                        />
                      ))}

                      {/* Content */}
                      <div className="relative z-10 p-6 flex flex-col flex-1 min-h-[240px]">

                        {/* Icon + budget */}
                        <div className="flex items-start justify-between gap-2 mb-4">
                          <div
                            className="flex items-center justify-center w-10 h-10 rounded-xl flex-shrink-0"
                            style={{ backgroundColor: `${color}22`, color }}
                          >
                            <Icon size={20} strokeWidth={1.6} />
                          </div>
                          <span
                            className="text-xs px-3 py-1 rounded-full"
                            style={{
                              backgroundColor: `${color}18`,
                              color,
                              border: `0.5px solid ${color}45`,
                            }}
                          >
                            {BUDGET_LABEL[s.budgetTier] ?? s.budgetTier}
                          </span>
                        </div>

                        {/* Name */}
                        <h2 className="text-base font-bold text-white mb-2 leading-snug">
                          {t(s.nameKey)}
                        </h2>

                        {/* Description */}
                        <p className="text-slate-400 text-sm leading-relaxed line-clamp-2 flex-1">
                          {t(s.descriptionKey)}
                        </p>

                        {/* Sources */}
                        <div className="flex gap-1.5 flex-wrap mt-3">
                          {s.suitableFor.map(src => (
                            <span
                              key={src}
                              className="text-xs px-2.5 py-1 rounded-full bg-slate-800/80 text-slate-400 border border-slate-700/60"
                            >
                              {SOURCE_LABELS[src] ?? src}
                            </span>
                          ))}
                        </div>

                        {/* Footer */}
                        <div className="flex items-center justify-between mt-4 pt-4 border-t border-slate-800">
                          <span className="flex items-center gap-1.5 text-xs text-slate-500">
                            <ShieldCheck size={14} style={{ color }} />
                            {s.targetContaminants.length}{' '}
                            {t('systems.removedCount', { defaultValue: 'contaminants removed' })}
                          </span>
                          <span
                            className="inline-flex items-center gap-1 text-xs font-medium"
                            style={{ color }}
                          >
                            {t('systems.viewDetails', { defaultValue: 'View details' })}
                            <ArrowRight
                              size={12}
                              className="group-hover:translate-x-1 transition-transform duration-200"
                            />
                          </span>
                        </div>
                      </div>
                    </motion.div>
                  </Link>
                </motion.div>
              )
            })}
          </div>
        </div>
      </section>
    </div>
  )
}
