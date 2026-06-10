import { motion } from 'framer-motion'
import { useTranslation } from 'react-i18next'
import { Link } from 'react-router-dom'
import {
  Biohazard, FlaskConical, BookOpen, ArrowRight,
} from 'lucide-react'
import type { LucideIcon } from 'lucide-react'

// ─── Hero particles ───────────────────────────────────────────────────────────

type HeroParticle = {
  x: number; y: number; size: number
  dur: number; delay: number
  dx: number; dy: number; accent: boolean
}

const HERO_PARTICLES: HeroParticle[] = [
  { x:  4, y: 70, size:  8, dur: 6.2, delay: 0.0, dx:  6, dy: -20, accent: true  },
  { x: 14, y: 50, size: 14, dur: 7.8, delay: 1.1, dx: -4, dy: -16, accent: false },
  { x: 26, y: 82, size:  5, dur: 5.4, delay: 0.3, dx:  9, dy: -28, accent: true  },
  { x: 38, y: 62, size: 20, dur: 9.2, delay: 1.6, dx: -3, dy: -12, accent: true  },
  { x: 50, y: 78, size:  7, dur: 6.6, delay: 0.2, dx:  5, dy: -22, accent: false },
  { x: 62, y: 48, size: 11, dur: 7.2, delay: 0.9, dx: -6, dy: -15, accent: true  },
  { x: 74, y: 68, size:  9, dur: 5.8, delay: 1.9, dx:  4, dy: -24, accent: false },
  { x: 85, y: 58, size: 16, dur: 7.5, delay: 0.6, dx: -5, dy: -18, accent: true  },
  { x: 94, y: 35, size:  6, dur: 5.2, delay: 1.3, dx: -4, dy: -26, accent: false },
  { x:  8, y: 25, size: 12, dur: 6.9, delay: 0.7, dx:  7, dy: -14, accent: true  },
  { x: 32, y: 40, size:  7, dur: 5.9, delay: 2.1, dx: -5, dy: -18, accent: false },
  { x: 48, y: 18, size: 24, dur: 9.8, delay: 0.1, dx:  2, dy:  -9, accent: true  },
  { x: 68, y: 32, size:  8, dur: 6.3, delay: 1.7, dx: -6, dy: -16, accent: false },
  { x: 88, y: 80, size: 14, dur: 7.9, delay: 1.2, dx:  4, dy: -22, accent: true  },
  { x: 20, y: 12, size:  5, dur: 4.9, delay: 0.5, dx:  5, dy: -30, accent: false },
]

// ─── Card particles ───────────────────────────────────────────────────────────

type CardParticle = { x: number; y: number; s: number; dur: number; dl: number; dx: number; dy: number }

const CARD_PARTICLES: CardParticle[] = [
  { x:  5, y: 20, s:  5, dur: 6.0, dl: 0.0, dx:  6, dy: -20 },
  { x: 18, y: 65, s:  9, dur: 7.5, dl: 0.8, dx: -5, dy: -15 },
  { x: 35, y: 35, s:  6, dur: 5.5, dl: 0.3, dx:  8, dy: -25 },
  { x: 55, y: 75, s: 13, dur: 8.5, dl: 1.5, dx: -3, dy: -18 },
  { x: 72, y: 15, s:  7, dur: 6.8, dl: 0.6, dx:  4, dy: -22 },
  { x: 88, y: 50, s: 10, dur: 7.2, dl: 1.2, dx: -6, dy: -14 },
  { x: 45, y: 55, s:  5, dur: 5.8, dl: 1.8, dx:  5, dy: -19 },
  { x: 92, y: 80, s:  8, dur: 6.5, dl: 0.4, dx: -4, dy: -24 },
]

// ─── Card definitions ─────────────────────────────────────────────────────────

interface CardDef {
  to: string
  color: string
  Icon: LucideIcon
  titleKey: string
  descKey: string
  statKey: string
  statLabelKey: string
}

const CARDS: CardDef[] = [
  {
    to:          '/learn/contaminants',
    color:       '#f43f5e',
    Icon:        Biohazard,
    titleKey:    'learn.index.contaminantsCard.title',
    descKey:     'learn.index.contaminantsCard.description',
    statKey:     'learn.index.contaminantsCard.stat',
    statLabelKey:'learn.index.contaminantsCard.statLabel',
  },
  {
    to:          '/learn/methods',
    color:       '#10b981',
    Icon:        FlaskConical,
    titleKey:    'learn.index.methodsCard.title',
    descKey:     'learn.index.methodsCard.description',
    statKey:     'learn.index.methodsCard.stat',
    statLabelKey:'learn.index.methodsCard.statLabel',
  },
  {
    to:          '/learn/basics',
    color:       '#60a5fa',
    Icon:        BookOpen,
    titleKey:    'learn.index.basicsCard.title',
    descKey:     'learn.index.basicsCard.description',
    statKey:     'learn.index.basicsCard.stat',
    statLabelKey:'learn.index.basicsCard.statLabel',
  },
]

// ─── Animations ───────────────────────────────────────────────────────────────

const cardVariants = {
  hidden: { opacity: 0, y: 32 },
  visible: (i: number) => ({
    opacity: 1, y: 0,
    transition: { duration: 0.55, ease: 'easeOut' as const, delay: 0.1 + i * 0.12 },
  }),
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function LearnIndex() {
  const { t } = useTranslation()

  return (
    <div className="bg-slate-950 text-white">

      {/* ── Hero ── */}
      <section className="relative overflow-hidden min-h-[340px] md:min-h-[400px] flex items-center">
        {/* Animated radial background */}
        <motion.div
          className="absolute inset-0 pointer-events-none"
          animate={{ opacity: [0.55, 0.95, 0.55] }}
          transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' as const }}
          style={{
            background: 'radial-gradient(ellipse at 50% 60%, rgba(96,165,250,0.18) 0%, rgba(16,185,129,0.08) 38%, transparent 65%)',
          }}
        />

        {/* Floating particles */}
        {HERO_PARTICLES.map((p, i) => (
          <motion.div
            key={i}
            className="absolute rounded-full pointer-events-none"
            style={{
              left: `${p.x}%`,
              top:  `${p.y}%`,
              width:  p.size,
              height: p.size,
              backgroundColor: p.accent ? '#60a5fa' : '#ffffff',
            }}
            animate={{
              x: [0, p.dx, p.dx * 0.4, 0],
              y: [0, p.dy * 0.5, p.dy, p.dy * 0.5, 0],
              opacity: [0, 0.28, 0.10, 0.28, 0],
            }}
            transition={{ duration: p.dur, delay: p.delay, repeat: Infinity, ease: 'easeInOut' as const }}
          />
        ))}

        {/* Hero text */}
        <div className="relative z-10 max-w-3xl mx-auto px-6 py-16 text-center w-full">
          <motion.div
            initial={{ opacity: 0, y: 22 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
          >
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-4 tracking-tight">
              {t('learn.index.title')}
            </h1>
            <p className="text-slate-400 text-base leading-relaxed max-w-xl mx-auto">
              {t('learn.index.description')}
            </p>
          </motion.div>
        </div>
      </section>

      {/* ── Cards section ── */}
      <section className="relative overflow-hidden">
        {/* Section background */}
        <div className="absolute inset-0 bg-slate-900" />

        {/* Subtle animated wash across the whole section */}
        <motion.div
          className="absolute inset-0 pointer-events-none"
          animate={{ opacity: [0.6, 1, 0.6] }}
          transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' as const }}
          style={{
            background: 'radial-gradient(ellipse at 50% 0%, rgba(96,165,250,0.07) 0%, transparent 55%)',
          }}
        />

        <div className="relative z-10 max-w-5xl mx-auto px-6 py-16">
          <div className="grid md:grid-cols-3 gap-6">
            {CARDS.map((card, i) => (
              <motion.div
                key={card.to}
                custom={i}
                variants={cardVariants}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, margin: '-60px' }}
              >
                <Link to={card.to} className="group block h-full">
                  <motion.div
                    className="relative h-full rounded-2xl overflow-hidden border border-slate-700/50"
                    whileHover={{ scale: 1.02, borderColor: `${card.color}55` }}
                    transition={{ duration: 0.22 }}
                  >
                    {/* Card inner background base */}
                    <div className="absolute inset-0 bg-slate-900" />

                    {/* Animated color wash */}
                    <motion.div
                      className="absolute inset-0 pointer-events-none"
                      animate={{ opacity: [0.65, 1, 0.65] }}
                      transition={{ duration: 5 + i * 1.2, repeat: Infinity, ease: 'easeInOut' as const }}
                      style={{
                        background: `radial-gradient(ellipse at 70% 25%, ${card.color}28 0%, ${card.color}0c 45%, transparent 70%)`,
                      }}
                    />

                    {/* Hover glow */}
                    <motion.div
                      className="absolute inset-0 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                      style={{
                        background: `radial-gradient(ellipse at 50% 50%, ${card.color}14 0%, transparent 60%)`,
                      }}
                    />

                    {/* Watermark icon */}
                    <motion.div
                      className="absolute right-[-12px] top-[-12px] pointer-events-none"
                      style={{ color: card.color, opacity: 0.06 }}
                      animate={{ scale: [1, 1.07, 1] }}
                      transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' as const }}
                    >
                      <card.Icon size={160} strokeWidth={0.7} />
                    </motion.div>

                    {/* Floating card particles */}
                    {CARD_PARTICLES.slice(0, 6).map((p, pi) => (
                      <motion.div
                        key={pi}
                        className="absolute rounded-full pointer-events-none"
                        style={{
                          left: `${p.x}%`,
                          top:  `${p.y}%`,
                          width:  p.s,
                          height: p.s,
                          backgroundColor: card.color,
                        }}
                        animate={{
                          x: [0, p.dx * 0.6, 0],
                          y: [0, p.dy * 0.6, 0],
                          opacity: [0, 0.22, 0],
                        }}
                        transition={{
                          duration: p.dur,
                          delay: p.dl + i * 0.3,
                          repeat: Infinity,
                          ease: 'easeInOut' as const,
                        }}
                      />
                    ))}

                    {/* Card content */}
                    <div className="relative z-10 p-6 flex flex-col h-full min-h-[260px]">
                      {/* Icon + stat row */}
                      <div className="flex items-start justify-between mb-5">
                        <div
                          className="flex items-center justify-center w-12 h-12 rounded-xl"
                          style={{ backgroundColor: `${card.color}22`, color: card.color }}
                        >
                          <card.Icon size={24} strokeWidth={1.6} />
                        </div>
                        <div className="text-right">
                          <div
                            className="text-2xl font-bold leading-none"
                            style={{ color: card.color }}
                          >
                            {t(card.statKey)}
                          </div>
                          <div className="text-xs text-slate-500 mt-0.5">
                            {t(card.statLabelKey)}
                          </div>
                        </div>
                      </div>

                      {/* Title */}
                      <h2 className="text-lg font-bold text-white mb-2 leading-snug">
                        {t(card.titleKey)}
                      </h2>

                      {/* Description */}
                      <p className="text-slate-400 text-sm leading-relaxed flex-1">
                        {t(card.descKey)}
                      </p>

                      {/* CTA */}
                      <div
                        className="mt-5 inline-flex items-center gap-1.5 text-sm font-medium transition-colors"
                        style={{ color: card.color }}
                      >
                        {t('common.learnMore', { defaultValue: 'Explore' })}
                        <ArrowRight
                          size={14}
                          className="group-hover:translate-x-1 transition-transform duration-200"
                        />
                      </div>
                    </div>
                  </motion.div>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

    </div>
  )
}
