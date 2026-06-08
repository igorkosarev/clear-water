import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { motion } from 'framer-motion'
import { Wand2, FlaskConical, Filter, Layers, Wrench, MapPin } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'

interface SectionConfig {
  key: string
  route: string
  Icon: LucideIcon
  color: string
}

const SECTIONS: SectionConfig[] = [
  { key: 'configurator', route: '/configurator', Icon: Wand2,        color: '#3b82f6' },
  { key: 'contaminants', route: '/learn/contaminants', Icon: FlaskConical, color: '#10b981' },
  { key: 'methods',      route: '/learn/methods',      Icon: Filter,  color: '#f59e0b' },
  { key: 'systems',      route: '/systems',            Icon: Layers,  color: '#8b5cf6' },
  { key: 'build',        route: '/build',              Icon: Wrench,  color: '#f97316' },
  { key: 'suppliers',    route: '/suppliers',          Icon: MapPin,  color: '#06b6d4' },
]

// ─── Hero particles — deterministic, no Math.random() ────────────────────────

type HeroParticle = {
  x: number; y: number; size: number
  dur: number; delay: number
  dx: number; dy: number
  blue: boolean
}

const HERO_PARTICLES: HeroParticle[] = [
  { x:  5, y: 82, size:  6, dur:  5.5, delay: 0.0, dx:  3, dy: -28, blue: true  },
  { x: 15, y: 65, size: 16, dur:  7.0, delay: 0.8, dx: -5, dy: -20, blue: false },
  { x: 23, y: 90, size:  5, dur:  4.5, delay: 0.4, dx:  8, dy: -32, blue: true  },
  { x: 38, y: 72, size: 28, dur:  8.5, delay: 1.2, dx: -3, dy: -15, blue: true  },
  { x: 50, y: 88, size:  7, dur:  6.0, delay: 0.2, dx:  5, dy: -24, blue: false },
  { x: 62, y: 58, size: 13, dur:  7.5, delay: 0.7, dx: -7, dy: -18, blue: true  },
  { x: 74, y: 78, size: 10, dur:  5.8, delay: 1.6, dx:  4, dy: -26, blue: false },
  { x: 84, y: 68, size: 18, dur:  7.0, delay: 0.3, dx: -4, dy: -22, blue: true  },
  { x: 93, y: 42, size:  6, dur:  5.0, delay: 1.1, dx: -6, dy: -28, blue: false },
  { x:  9, y: 32, size: 11, dur:  6.5, delay: 0.6, dx:  6, dy: -16, blue: true  },
  { x: 30, y: 48, size:  8, dur:  5.5, delay: 2.0, dx: -4, dy: -22, blue: false },
  { x: 48, y: 22, size: 32, dur:  9.0, delay: 0.1, dx:  2, dy: -10, blue: true  },
  { x: 68, y: 38, size:  9, dur:  6.0, delay: 1.4, dx: -8, dy: -20, blue: false },
  { x: 88, y: 88, size: 14, dur:  7.5, delay: 0.9, dx:  5, dy: -26, blue: true  },
  { x: 20, y: 18, size:  5, dur:  4.5, delay: 0.5, dx:  7, dy: -32, blue: false },
  { x: 55, y: 50, size: 24, dur:  8.0, delay: 1.8, dx: -3, dy: -18, blue: true  },
  { x: 78, y: 25, size:  7, dur:  5.2, delay: 0.3, dx:  5, dy: -25, blue: false },
  { x: 42, y: 10, size: 38, dur: 10.0, delay: 0.0, dx: -2, dy:  -8, blue: true  },
  { x:  3, y: 55, size:  5, dur:  4.8, delay: 1.3, dx:  9, dy: -30, blue: false },
  { x: 95, y: 70, size: 20, dur:  7.2, delay: 2.2, dx: -5, dy: -20, blue: true  },
  { x: 33, y: 30, size:  8, dur:  5.5, delay: 0.8, dx:  4, dy: -22, blue: false },
  { x: 60, y: 92, size: 12, dur:  6.8, delay: 1.0, dx: -6, dy: -28, blue: true  },
]

// ─── Section animation variants ───────────────────────────────────────────────

const sectionVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.12, delayChildren: 0.05 } },
}

const slideVariant = {
  hidden: { opacity: 0, y: 22 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.55, ease: 'easeOut' as const } },
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function Home() {
  const { t } = useTranslation()

  return (
    <div className="bg-slate-900">

      {/* ── Hero ── */}
      <section className="relative bg-gradient-to-br from-slate-950 via-slate-900 to-slate-800 text-white overflow-hidden min-h-[580px] flex items-center">

        {/* Pulsing radial glow */}
        <motion.div
          className="absolute inset-0 pointer-events-none"
          animate={{ opacity: [0.7, 1, 0.7] }}
          transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }}
          style={{
            background: 'radial-gradient(ellipse at 50% 45%, rgba(59,130,246,0.18) 0%, rgba(59,130,246,0.06) 45%, transparent 70%)',
          }}
        />

        {/* Floating particles */}
        {HERO_PARTICLES.map((p, i) => (
          <motion.div
            key={i}
            className="absolute rounded-full pointer-events-none"
            style={{
              left: `${p.x}%`,
              top: `${p.y}%`,
              width: p.size,
              height: p.size,
              backgroundColor: p.blue ? '#3b82f6' : '#ffffff',
            }}
            animate={{
              x: [0, p.dx, p.dx * 0.4, 0],
              y: [0, p.dy * 0.5, p.dy, p.dy * 0.5, 0],
              opacity: [0, 0.35, 0.15, 0.35, 0],
            }}
            transition={{
              duration: p.dur,
              delay: p.delay,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
          />
        ))}

        {/* Content */}
        <div className="relative z-10 w-full max-w-5xl mx-auto px-4 py-32 text-center">
          <motion.h1
            className="text-5xl sm:text-6xl font-bold mb-6 leading-tight tracking-tight"
            initial={{ opacity: 0, y: 32 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.75 }}
          >
            {t('home.hero.title')}
          </motion.h1>

          <motion.p
            className="text-xl text-slate-300 max-w-2xl mx-auto mb-10"
            initial={{ opacity: 0, y: 32 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.75, delay: 0.18 }}
          >
            {t('home.hero.subtitle')}
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 32 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.75, delay: 0.35 }}
          >
            <motion.div
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.97 }}
              className="inline-block"
            >
              <Link
                to="/configurator"
                className="inline-flex items-center gap-2 px-8 py-4 bg-white text-slate-900 font-bold rounded-full text-lg hover:bg-slate-100 transition-colors shadow-xl"
              >
                {t('home.hero.cta')}
                <span aria-hidden>→</span>
              </Link>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* ── Feature sections ── */}
      {SECTIONS.map(({ key, route, Icon, color }, i) => {
        const isEven = i % 2 === 0
        const iconSide = isEven ? 'right' : 'left'

        return (
          <section
            key={key}
            className="relative bg-slate-950 overflow-hidden min-h-[420px] md:min-h-[480px] border-b border-slate-800/40 last:border-0"
          >
            {/* Radial color glow on icon side */}
            <div
              className="absolute inset-0 pointer-events-none"
              style={{
                background: iconSide === 'right'
                  ? `radial-gradient(ellipse at 78% 50%, ${color}28 0%, ${color}0d 50%, transparent 75%)`
                  : `radial-gradient(ellipse at 22% 50%, ${color}28 0%, ${color}0d 50%, transparent 75%)`,
              }}
            />

            {/* Text-side gradient darkening */}
            <div
              className="absolute inset-0 pointer-events-none"
              style={{
                background: isEven
                  ? 'linear-gradient(to right, rgba(2,6,23,0.98) 0%, rgba(2,6,23,0.88) 38%, rgba(2,6,23,0.4) 65%, transparent 85%)'
                  : 'linear-gradient(to left,  rgba(2,6,23,0.98) 0%, rgba(2,6,23,0.88) 38%, rgba(2,6,23,0.4) 65%, transparent 85%)',
              }}
            />
            <div className="absolute inset-0 bg-slate-950/80 md:hidden pointer-events-none" />

            {/* Constrained content + icon */}
            <div className="relative z-10 w-full max-w-6xl mx-auto px-6 md:px-10 min-h-[420px] md:min-h-[480px]">

              {/* Glow blob behind icon */}
              <motion.div
                className="absolute top-1/2 -translate-y-1/2 rounded-full pointer-events-none hidden md:block"
                style={{ [iconSide]: '0%', width: 340, height: 340, backgroundColor: color, filter: 'blur(100px)' }}
                animate={{ opacity: [0.08, 0.20, 0.08], scale: [0.9, 1.08, 0.9] }}
                transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut', delay: i * 0.4 }}
              />

              {/* Large decorative icon */}
              <motion.div
                className="absolute top-1/2 -translate-y-1/2 pointer-events-none hidden md:block"
                style={{ [iconSide]: '3%', color }}
                animate={{ scale: [1, 1.05, 1] }}
                transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut', delay: i * 0.3 }}
              >
                <motion.div
                  initial={{ opacity: 0, scale: 0.6 }}
                  whileInView={{ opacity: 0.38, scale: 1 }}
                  transition={{ duration: 0.7, delay: 0.1, type: 'spring' as const, bounce: 0.3 }}
                  viewport={{ once: true }}
                >
                  <Icon size={220} strokeWidth={0.7} />
                </motion.div>
              </motion.div>

              {/* Content */}
              <div className={`w-full min-h-[420px] md:min-h-[480px] flex items-center ${isEven ? 'justify-start' : 'justify-end'}`}>
                <motion.div
                  className="w-full max-w-[500px] py-14"
                  variants={sectionVariants}
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ once: true, margin: '-80px' }}
                >
                  {/* Accent line */}
                  <motion.div
                    variants={slideVariant}
                    className="w-10 h-1 rounded-full mb-5"
                    style={{ backgroundColor: color }}
                  />

                  <motion.h2
                    variants={slideVariant}
                    className="text-3xl sm:text-4xl font-bold text-white mb-4"
                  >
                    {t(`home.sections.${key}.title`)}
                  </motion.h2>

                  <motion.p variants={slideVariant} className="text-lg text-slate-400 mb-8 max-w-md">
                    {t(`home.sections.${key}.description`)}
                  </motion.p>

                  <motion.div variants={slideVariant}>
                    <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }} className="inline-block">
                      <Link
                        to={route}
                        className="inline-flex items-center gap-2 px-6 py-3 font-semibold rounded-full text-white transition-all"
                        style={{ backgroundColor: color }}
                      >
                        {t(`home.sections.${key}.cta`)}
                        <span aria-hidden>→</span>
                      </Link>
                    </motion.div>
                  </motion.div>
                </motion.div>
              </div>
            </div>
          </section>
        )
      })}
    </div>
  )
}
