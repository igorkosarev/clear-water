import { motion } from 'framer-motion'
import { useTranslation } from 'react-i18next'
import { Link } from 'react-router-dom'
import { ArrowRight } from 'lucide-react'
import type { Contaminant } from '@/types'
import contaminantsData from '@/data/contaminants.json'
import {
  CONTAMINANT_ICONS,
  CHEMICAL_SYMBOLS,
  CATEGORY_META,
  CATEGORY_ORDER,
} from '@/components/encyclopedia/contaminantConfig'
import { ChemBadge } from '@/components/encyclopedia/ChemBadge'

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

// ─── Section header particles (fixed top-px positions, full viewport width) ──

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

const contaminants = contaminantsData as Contaminant[]

const grouped = CATEGORY_ORDER.reduce<Record<string, Contaminant[]>>((acc, cat) => {
  acc[cat] = contaminants.filter(c => c.category === cat)
  return acc
}, {})

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
      <div className="bg-slate-950 divide-y divide-slate-800/50">
        {CATEGORY_ORDER.map(cat => {
          const meta = CATEGORY_META[cat]
          const items = grouped[cat] ?? []
          if (!meta || items.length === 0) return null
          const { Icon } = meta

          return (
            <motion.section
              key={cat}
              className="relative overflow-hidden"
              variants={sectionVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: '-80px' }}
            >
              {/* ── Full-section background ── */}
              <div className="absolute inset-0 bg-slate-900" />

              {/* Color wash covers the whole section */}
              <motion.div
                className="absolute inset-0 pointer-events-none"
                animate={{ opacity: [0.7, 1, 0.7] }}
                transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' as const }}
                style={{
                  background: `radial-gradient(ellipse at 70% 30%, ${meta.color}22 0%, ${meta.color}0a 50%, transparent 75%)`,
                }}
              />

              {/* ── Header zone: particles + icon (full-width, fixed height) ── */}
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

                {/* Large watermark icon, centered in header zone */}
                <motion.div
                  className="absolute inset-0 flex items-center justify-center"
                  style={{ color: meta.color, opacity: 0.07 }}
                  animate={{ scale: [1, 1.06, 1] }}
                  transition={{ duration: 9, repeat: Infinity, ease: 'easeInOut' as const }}
                >
                  <Icon size={310} strokeWidth={0.65} />
                </motion.div>

                {/* Floating particles across full width */}
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
                  {items.map(c => {
                    const sym = CHEMICAL_SYMBOLS[c.id]
                    const CIcon = sym ? null : CONTAMINANT_ICONS[c.id]

                    return (
                      <motion.div
                        key={c.id}
                        variants={cardVariants}
                        className="bg-slate-950/75 border border-slate-700/60 rounded-2xl overflow-hidden flex flex-col backdrop-blur-sm"
                      >
                        {/* Accent strip */}
                        <div className="h-0.5 w-full flex-shrink-0" style={{ backgroundColor: c.color }} />

                        <div className="p-5 flex flex-col gap-3 flex-1">
                          {/* Name + icon / chem badge */}
                          <div className="flex items-start justify-between gap-2">
                            <h3 className="text-white font-bold text-base leading-snug">
                              {t(c.nameKey)}
                            </h3>
                            {sym ? (
                              <ChemBadge symbol={sym} color={c.color} />
                            ) : CIcon ? (
                              <CIcon size={20} strokeWidth={1.5} style={{ color: c.color }} className="flex-shrink-0 mt-0.5" />
                            ) : null}
                          </div>

                          {/* Description */}
                          <p className="text-slate-400 text-sm leading-relaxed line-clamp-3 flex-1">
                            {t(c.descriptionKey)}
                          </p>

                          {/* Learn more */}
                          <Link
                            to={`/learn/contaminants/${c.id}`}
                            className="inline-flex items-center gap-1.5 self-start mt-1 px-3 py-1.5 rounded-full text-xs font-semibold bg-slate-800/80 hover:bg-slate-700 text-slate-200 transition-colors"
                          >
                            {t('learn.contaminants.learnMore', { defaultValue: 'Learn more' })}
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
