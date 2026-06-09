import { motion } from 'framer-motion'
import { useTranslation } from 'react-i18next'
import { Link } from 'react-router-dom'
import { ArrowRight } from 'lucide-react'
import type { Contaminant } from '@/types'
import contaminantsData from '@/data/contaminants.json'
import {
  CONTAMINANT_ICONS,
  CATEGORY_META,
  CATEGORY_ORDER,
} from '@/components/encyclopedia/contaminantConfig'

// ─── Hero particles ───────────────────────────────────────────────────────────

type HeroParticle = {
  x: number; y: number; size: number
  dur: number; delay: number
  dx: number; dy: number
  accent: boolean
}

const HERO_PARTICLES: HeroParticle[] = [
  { x:  6, y: 80, size:  6, dur: 5.5, delay: 0.0, dx:  4, dy: -26, accent: true  },
  { x: 14, y: 62, size: 14, dur: 7.0, delay: 0.9, dx: -5, dy: -18, accent: false },
  { x: 24, y: 88, size:  5, dur: 4.5, delay: 0.4, dx:  7, dy: -30, accent: true  },
  { x: 38, y: 70, size: 24, dur: 8.5, delay: 1.3, dx: -3, dy: -14, accent: true  },
  { x: 50, y: 85, size:  7, dur: 6.0, delay: 0.2, dx:  5, dy: -22, accent: false },
  { x: 63, y: 56, size: 11, dur: 7.5, delay: 0.7, dx: -6, dy: -17, accent: true  },
  { x: 75, y: 76, size:  9, dur: 5.8, delay: 1.7, dx:  4, dy: -24, accent: false },
  { x: 85, y: 66, size: 16, dur: 7.0, delay: 0.4, dx: -4, dy: -20, accent: true  },
  { x: 94, y: 40, size:  5, dur: 5.0, delay: 1.2, dx: -5, dy: -26, accent: false },
  { x:  8, y: 30, size: 10, dur: 6.5, delay: 0.6, dx:  6, dy: -15, accent: true  },
  { x: 30, y: 46, size:  7, dur: 5.5, delay: 2.1, dx: -4, dy: -20, accent: false },
  { x: 47, y: 20, size: 28, dur: 9.0, delay: 0.1, dx:  2, dy:  -9, accent: true  },
  { x: 67, y: 36, size:  8, dur: 6.0, delay: 1.5, dx: -7, dy: -18, accent: false },
  { x: 88, y: 86, size: 12, dur: 7.5, delay: 1.0, dx:  5, dy: -24, accent: true  },
  { x: 20, y: 16, size:  5, dur: 4.5, delay: 0.5, dx:  6, dy: -30, accent: false },
  { x: 54, y: 48, size: 20, dur: 8.0, delay: 1.9, dx: -3, dy: -16, accent: true  },
  { x: 77, y: 24, size:  6, dur: 5.2, delay: 0.3, dx:  4, dy: -23, accent: false },
  { x: 42, y:  8, size: 32, dur:10.0, delay: 0.0, dx: -2, dy:  -7, accent: true  },
]

const ACCENT = '#ef4444'

// ─── Section banner particles ─────────────────────────────────────────────────

type SectionParticle = {
  x: number; y: number; s: number
  dur: number; dl: number
  dx: number; dy: number
}

const SECTION_PARTICLES: SectionParticle[] = [
  { x:  5, y: 22, s:  7, dur: 6.5, dl: 0.0, dx:  9, dy: -14 },
  { x: 16, y: 70, s: 12, dur: 8.0, dl: 1.2, dx: -6, dy: -20 },
  { x: 27, y: 44, s:  5, dur: 5.5, dl: 0.5, dx: 11, dy: -10 },
  { x: 40, y: 82, s: 18, dur: 9.5, dl: 1.8, dx: -4, dy: -15 },
  { x: 54, y: 16, s:  9, dur: 7.0, dl: 0.3, dx:  6, dy: -22 },
  { x: 68, y: 56, s:  6, dur: 6.0, dl: 2.0, dx: -8, dy: -12 },
  { x: 80, y: 30, s: 21, dur:10.0, dl: 0.8, dx:  4, dy: -10 },
  { x: 91, y: 76, s: 10, dur: 7.5, dl: 1.5, dx: -5, dy: -18 },
  { x: 47, y: 58, s:  8, dur: 5.8, dl: 1.0, dx:  7, dy: -16 },
  { x: 11, y: 48, s: 14, dur: 8.5, dl: 0.4, dx: -3, dy: -12 },
]

// ─── Animation variants ───────────────────────────────────────────────────────

const gridVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.06, delayChildren: 0.05 } },
}

const cardVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.45, ease: 'easeOut' as const } },
}

// ─── Static data ──────────────────────────────────────────────────────────────

const contaminants = contaminantsData as Contaminant[]

const grouped = CATEGORY_ORDER.reduce<Record<string, Contaminant[]>>((acc, cat) => {
  acc[cat] = contaminants.filter(c => c.category === cat)
  return acc
}, {})

// ─── Category banner ──────────────────────────────────────────────────────────

type CategoryMeta = (typeof CATEGORY_META)[string]

function CategoryBanner({ meta, count }: { meta: CategoryMeta; count: number }) {
  const { Icon } = meta

  return (
    <motion.div
      className="relative rounded-2xl overflow-hidden mb-8"
      style={{ borderTop: `2px solid ${meta.color}` }}
      initial={{ opacity: 0, y: 36 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-40px' }}
      transition={{ duration: 0.6, ease: 'easeOut' as const }}
    >
      {/* Base background */}
      <div className="absolute inset-0 bg-slate-900" />

      {/* Radial color wash */}
      <div
        className="absolute inset-0"
        style={{
          background: `radial-gradient(ellipse at 60% 50%, ${meta.color}28 0%, ${meta.color}0c 55%, transparent 80%)`,
        }}
      />

      {/* Pulsing glow behind icon */}
      <motion.div
        className="absolute inset-0 flex items-center justify-center pointer-events-none"
        animate={{ opacity: [0.5, 1, 0.5] }}
        transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' as const }}
      >
        <div
          style={{
            width: 380,
            height: 380,
            borderRadius: '50%',
            background: `radial-gradient(circle, ${meta.color}18 0%, transparent 70%)`,
          }}
        />
      </motion.div>

      {/* Large background icon (centered, watermark) */}
      <motion.div
        className="absolute inset-0 flex items-center justify-center pointer-events-none"
        style={{ color: meta.color, opacity: 0.07 }}
        animate={{ scale: [1, 1.07, 1] }}
        transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' as const }}
      >
        <Icon size={300} strokeWidth={0.7} />
      </motion.div>

      {/* Floating particles */}
      {SECTION_PARTICLES.map((p, i) => (
        <motion.div
          key={i}
          className="absolute rounded-full pointer-events-none"
          style={{
            left: `${p.x}%`,
            top: `${p.y}%`,
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

      {/* Content */}
      <div className="relative z-10 flex items-center justify-between gap-6 px-8 py-10 md:py-12">
        <div>
          <h2
            className="text-3xl md:text-4xl font-bold text-white mb-2 tracking-tight leading-tight"
            style={{ textShadow: `0 0 60px ${meta.color}55` }}
          >
            {meta.label}
          </h2>
          <p className="text-slate-400 text-sm leading-relaxed max-w-sm">
            {meta.description}
          </p>
        </div>
        <span
          className="flex-shrink-0 px-5 py-2.5 rounded-full text-sm font-bold tabular-nums"
          style={{
            backgroundColor: `${meta.color}18`,
            color: meta.color,
            border: `1px solid ${meta.color}45`,
          }}
        >
          {count}
        </span>
      </div>
    </motion.div>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function Contaminants() {
  const { t } = useTranslation()

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
            {t('learn.contaminants.title')}
          </motion.h1>
          <motion.p
            className="text-slate-300 text-lg max-w-2xl mx-auto leading-relaxed"
            initial={{ opacity: 0, y: 32 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.75, delay: 0.18 }}
          >
            {t('learn.contaminants.subtitle')}
          </motion.p>
        </div>
      </section>

      {/* ── Category sections ── */}
      <div className="bg-slate-950 px-4 py-12 space-y-16">
        <div className="max-w-5xl mx-auto space-y-16">
          {CATEGORY_ORDER.map(cat => {
            const meta = CATEGORY_META[cat]
            const items = grouped[cat] ?? []
            if (!meta || items.length === 0) return null

            return (
              <section key={cat}>
                <CategoryBanner meta={meta} count={items.length} />

                {/* Card grid */}
                <motion.div
                  className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5"
                  variants={gridVariants}
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ once: true, margin: '-60px' }}
                >
                  {items.map(c => {
                    const Icon = CONTAMINANT_ICONS[c.id]

                    return (
                      <motion.div
                        key={c.id}
                        variants={cardVariants}
                        className="bg-slate-900/80 border border-slate-800 rounded-2xl overflow-hidden flex flex-col"
                      >
                        {/* Accent strip */}
                        <div className="h-1 w-full flex-shrink-0" style={{ backgroundColor: c.color }} />

                        <div className="p-5 flex flex-col gap-3 flex-1">
                          {/* Icon row */}
                          {Icon && (
                            <div className="flex justify-end">
                              <Icon size={20} strokeWidth={1.5} style={{ color: c.color }} />
                            </div>
                          )}

                          {/* Name */}
                          <h3 className="text-white font-bold text-base leading-snug">
                            {t(c.nameKey)}
                          </h3>

                          {/* Description */}
                          <p className="text-slate-400 text-sm leading-relaxed line-clamp-3 flex-1">
                            {t(c.descriptionKey)}
                          </p>

                          {/* Learn more */}
                          <Link
                            to={`/learn/contaminants/${c.id}`}
                            className="inline-flex items-center gap-1.5 self-start mt-1 px-3 py-1.5 rounded-full text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 transition-colors"
                          >
                            {t('learn.contaminants.learnMore', { defaultValue: 'Learn more' })}
                            <ArrowRight size={12} />
                          </Link>
                        </div>
                      </motion.div>
                    )
                  })}
                </motion.div>
              </section>
            )
          })}
        </div>
      </div>
    </div>
  )
}
