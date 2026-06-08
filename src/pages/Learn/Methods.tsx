import { useMemo } from 'react'
import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { Zap, AlertTriangle, Target } from 'lucide-react'
import type { TreatmentMethod, Contaminant } from '@/types'
import methodsData from '@/data/treatment-methods.json'
import contaminantsData from '@/data/contaminants.json'

// ─── Particle system ────────────────────────────────────────────────────────

type Particle = {
  x: number; y: number
  w: number; h: number; r: string
  dur: number; dl: number
  kx: number[]; ky: number[]; ko: number[]; ks: number[]
  kr?: number[]
}

type PatternFn = (s: number, i: number) => Omit<Particle, 'x' | 'y' | 'dur' | 'dl'>

const BASE_POS = [
  { x:  8, y: 15, s: 10, dur: 6.0, dl: 0.0 },
  { x: 25, y:  8, s:  7, dur: 8.5, dl: 1.2 },
  { x: 50, y: 18, s: 14, dur: 5.5, dl: 0.5 },
  { x: 72, y: 12, s:  9, dur: 7.0, dl: 2.0 },
  { x: 88, y: 28, s: 12, dur: 9.0, dl: 0.8 },
  { x: 15, y: 42, s:  6, dur: 5.0, dl: 1.5 },
  { x: 35, y: 58, s: 18, dur: 7.5, dl: 0.3 },
  { x: 60, y: 45, s:  8, dur: 6.5, dl: 2.2 },
  { x: 82, y: 52, s: 15, dur: 8.0, dl: 1.0 },
  { x: 10, y: 72, s: 11, dur: 4.5, dl: 1.8 },
  { x: 42, y: 80, s:  8, dur: 10,  dl: 0.2 },
  { x: 65, y: 75, s: 20, dur: 5.8, dl: 2.5 },
  { x: 85, y: 82, s:  9, dur: 7.2, dl: 0.7 },
  { x: 28, y: 88, s: 13, dur: 6.8, dl: 1.6 },
  { x: 55, y: 92, s:  6, dur: 9.5, dl: 0.4 },
  { x: 78, y: 88, s: 16, dur: 5.2, dl: 2.8 },
]

const PATTERNS: Record<string, PatternFn> = {
  // 🔥 Rising heat bubbles — fast vertical escape
  boiling: (s, i) => {
    const f = i % 2 ? 1 : -1
    const sz = Math.min(s, 12)
    return {
      w: sz, h: sz, r: '50%',
      kx: [0, f * 8, -f * 5, f * 3, 0],
      ky: [0, -24, -40, -24, 0],
      ko: [0.1, 0.6, 0.12, 0.6, 0.1],
      ks: [1, 1.15, 1.35, 1.15, 1],
    }
  },
  // 🪨 Angular pebble fragments slowly falling
  biosand: (s, i) => {
    const f = i % 2 ? 1 : -1
    return {
      w: s, h: Math.round(s * 0.7), r: '4px 2px 5px 3px',
      kx: [0, f * 5, -f * 8, f * 4, 0],
      ky: [0, 12, 24, 12, 0],
      ko: [0.2, 0.7, 0.45, 0.7, 0.2],
      ks: [1, 0.92, 0.85, 0.92, 1],
    }
  },
  // 🫙 Gentle floating dots — slow circular drift
  ceramic_filtration: (s, i) => {
    const f = i % 2 ? 1 : -1
    const m = 8 + (i % 4) * 3
    const sz = Math.min(s, 11)
    return {
      w: sz, h: sz, r: '50%',
      kx: [0, f * m, 0, -f * m, 0],
      ky: [0, f * 6, f * 14, f * 6, 0],
      ko: [0.15, 0.55, 0.3, 0.55, 0.15],
      ks: [1, 1.05, 1, 1.05, 1],
    }
  },
  // ⬛ Dense squares slowly sinking — adsorption pull
  activated_carbon: (s, i) => {
    const f = i % 2 ? 1 : -1
    const sz = Math.min(s, 11)
    return {
      w: sz, h: sz, r: '3px',
      kx: [0, f * 4, -f * 3, f * 2, 0],
      ky: [0, 20, 35, 20, 0],
      ko: [0.25, 0.8, 0.55, 0.8, 0.25],
      ks: [1, 1, 1, 1, 1],
    }
  },
  // ☀️ Tiny dots that dart then burst — UV kill flash
  uv_disinfection: (s, i) => {
    const f = i % 2 ? 1 : -1
    const sz = Math.min(s, 8)
    const m = 18 + (i % 4) * 7
    return {
      w: sz, h: sz, r: '50%',
      kx: [0, f * m, f * m * 0.3, -f * m * 0.2, 0],
      ky: [0, f * m * 0.4, f * m, f * m * 0.5, 0],
      ko: [0.1, 0.8, 0.8, 0.3, 0.1],
      ks: [1, 1, 2.5 + (i % 3) * 0.3, 1, 1],
    }
  },
  // 🌊 Horizontal capsules flowing sideways — membrane flow
  reverse_osmosis: (s, i) => {
    const f = i % 2 ? 1 : -1
    const baseH = Math.min(s, 11)
    return {
      w: Math.round(baseH * 2.8), h: baseH, r: '50%',
      kx: [0, f * 18, f * 28, f * 18, 0],
      ky: [0, f * 6, 0, -f * 6, 0],
      ko: [0.15, 0.5, 0.3, 0.5, 0.15],
      ks: [1, 1.04, 1, 1.04, 1],
    }
  },
  // 🧪 Bubbles rising and dissolving — gas disinfection
  chlorination: (s, i) => {
    const f = i % 2 ? 1 : -1
    return {
      w: s, h: s, r: '50%',
      kx: [0, f * 6, -f * 8, f * 4, 0],
      ky: [0, -18, -30, -18, 0],
      ko: [0.1, 0.55, 0.1, 0.55, 0.1],
      ks: [1, 1.12, 1.28, 1.12, 1],
    }
  },
}

const PARTICLE_CONFIGS: Record<string, Particle[]> = {}
for (const id of Object.keys(PATTERNS)) {
  const pattern = PATTERNS[id]
  if (pattern) {
    PARTICLE_CONFIGS[id] = BASE_POS.map((pos, i) => ({
      x: pos.x, y: pos.y, dur: pos.dur, dl: pos.dl,
      ...pattern(pos.s, i),
    }))
  }
}

// ─── Styling constants ───────────────────────────────────────────────────────

const COMPLEXITY_CLASS: Record<string, string> = {
  beginner:     'text-emerald-400 border border-emerald-400/30 bg-emerald-400/10',
  intermediate: 'text-amber-400  border border-amber-400/30  bg-amber-400/10',
  advanced:     'text-red-400    border border-red-400/30    bg-red-400/10',
}

const COST_CLASS: Record<string, string> = {
  low:    'text-emerald-400 border border-emerald-400/30 bg-emerald-400/10',
  medium: 'text-amber-400  border border-amber-400/30  bg-amber-400/10',
  high:   'text-red-400    border border-red-400/30    bg-red-400/10',
}

// ─── Animation variants ──────────────────────────────────────────────────────

const contentVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.08, delayChildren: 0.05 } },
}

const itemVariants = {
  hidden: { opacity: 0, y: 18 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: 'easeOut' as const } },
}

// ─── Static data ─────────────────────────────────────────────────────────────

const methods = methodsData as TreatmentMethod[]
const contaminants = contaminantsData as Contaminant[]

// ─── Sub-components ──────────────────────────────────────────────────────────

interface InfoRowProps {
  icon: React.ReactNode
  label: string
  text: string
}

function InfoRow({ icon, label, text }: InfoRowProps) {
  return (
    <div>
      <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">
        {icon}
        <span>{label}</span>
      </div>
      <p className="text-sm text-slate-300 leading-relaxed">{text}</p>
    </div>
  )
}

interface SectionProps {
  method: TreatmentMethod
  removedContaminants: Contaminant[]
  index: number
}

function MethodSection({ method, removedContaminants, index }: SectionProps) {
  const { t } = useTranslation()
  const isEven = index % 2 === 0
  const { color, icon, id } = method
  const particles = PARTICLE_CONFIGS[id] ?? []

  const iconSide = isEven ? 'right' : 'left'

  return (
    <section
      id={id}
      className="relative bg-slate-950 overflow-hidden min-h-[620px] md:min-h-[700px]"
    >
      {/* ── Full-bleed radial gradient centred on icon side ── */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: iconSide === 'right'
            ? `radial-gradient(ellipse at 75% 50%, ${color}38 0%, ${color}14 48%, transparent 72%)`
            : `radial-gradient(ellipse at 25% 50%, ${color}38 0%, ${color}14 48%, transparent 72%)`,
        }}
      />

      {/* ── Particles — span full section ── */}
      {particles.map((p, i) => (
        <motion.div
          key={i}
          className="absolute pointer-events-none"
          style={{
            left: `${p.x}%`,
            top: `${p.y}%`,
            width: p.w,
            height: p.h,
            borderRadius: p.r,
            backgroundColor: color,
          }}
          animate={{
            x: p.kx,
            y: p.ky,
            opacity: p.ko,
            scale: p.ks,
            ...(p.kr ? { rotate: p.kr } : {}),
          }}
          transition={{ duration: p.dur, delay: p.dl, repeat: Infinity, ease: 'easeInOut' }}
        />
      ))}

      {/* ── Text-side gradient darkening ── */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: isEven
            ? 'linear-gradient(to right, rgba(2,6,23,0.96) 0%, rgba(2,6,23,0.85) 35%, rgba(2,6,23,0.45) 62%, transparent 82%)'
            : 'linear-gradient(to left,  rgba(2,6,23,0.96) 0%, rgba(2,6,23,0.85) 35%, rgba(2,6,23,0.45) 62%, transparent 82%)',
        }}
      />
      {/* Mobile: full darkening overlay */}
      <div className="absolute inset-0 bg-slate-950/72 md:hidden pointer-events-none" />

      {/* ── Constrained content + icon (max-width prevents wide-screen spread) ── */}
      <div className="relative z-10 w-full max-w-6xl mx-auto px-6 md:px-10 min-h-[620px] md:min-h-[700px]">

        {/* Glow blob — absolute within constrained container */}
        <motion.div
          className="absolute top-1/2 -translate-y-1/2 rounded-full pointer-events-none"
          style={{ [iconSide]: '0%', width: 400, height: 400, backgroundColor: color, filter: 'blur(110px)' }}
          animate={{ opacity: [0.1, 0.24, 0.1], scale: [0.88, 1.1, 0.88] }}
          transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }}
        />

        {/* Icon — absolute within constrained container */}
        <motion.div
          className="absolute top-1/2 -translate-y-1/2 pointer-events-none hidden md:block"
          style={{ [iconSide]: '3%' }}
          animate={{ scale: [1, 1.06, 1] }}
          transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
        >
          <motion.span
            className="block select-none text-[130px] md:text-[180px] leading-none"
            style={{ opacity: 0 }}
            initial={{ scale: 0.5, opacity: 0 }}
            whileInView={{ scale: 1, opacity: 0.55 }}
            transition={{ duration: 0.7, delay: 0.1, type: 'spring' as const, bounce: 0.3 }}
            viewport={{ once: true }}
            role="img"
            aria-label={id}
          >
            {icon}
          </motion.span>
        </motion.div>

        {/* Text content */}
        <div className={`w-full min-h-[620px] md:min-h-[700px] flex items-center ${isEven ? 'justify-start' : 'justify-end'}`}>
        <motion.div
          className="w-full max-w-[520px] py-16"
          variants={contentVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-60px' }}
        >
          <motion.div variants={itemVariants} className="flex flex-wrap gap-2 mb-3">
            <span className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-semibold ${COMPLEXITY_CLASS[method.complexity] ?? 'text-slate-400 border border-slate-400/30 bg-slate-400/10'}`}>
              {t(`method.complexity.${method.complexity}`)}
            </span>
            <span className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-semibold ${COST_CLASS[method.costTier] ?? 'text-slate-400 border border-slate-400/30 bg-slate-400/10'}`}>
              {t(`method.costTier.${method.costTier}`)}
            </span>
          </motion.div>

          <motion.h2 variants={itemVariants} className="text-3xl font-bold text-white mb-3">
            {t(method.nameKey)}
          </motion.h2>

          <motion.p variants={itemVariants} className="text-slate-300 leading-relaxed mb-7">
            {t(method.descriptionKey)}
          </motion.p>

          <motion.div variants={itemVariants} className="space-y-5 border-t border-slate-700/50 pt-6 mb-7">
            <InfoRow icon={<Zap size={13} />} label={t('learn.methods.howItWorks')} text={t(method.howItWorksKey)} />
            <InfoRow icon={<AlertTriangle size={13} />} label={t('learn.methods.limitations')} text={t(method.limitationsKey)} />
            <InfoRow icon={<Target size={13} />} label={t('learn.methods.typicalUse')} text={t(method.typicalUseKey)} />
          </motion.div>

          {removedContaminants.length > 0 && (
            <motion.div variants={itemVariants}>
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                {t('learn.methods.removes')}
              </p>
              <div className="flex flex-wrap gap-2">
                {removedContaminants.map(c => (
                  <Link key={c.id} to={`/learn/contaminants#${c.id}`}>
                    <span
                      className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium transition-all hover:brightness-125"
                      style={{ backgroundColor: `${c.color}22`, color: c.color, border: `1px solid ${c.color}44` }}
                    >
                      {t(c.nameKey)}
                    </span>
                  </Link>
                ))}
              </div>
            </motion.div>
          )}
        </motion.div>
        </div>
      </div>
    </section>
  )
}

// ─── Page ────────────────────────────────────────────────────────────────────

export default function Methods() {
  const { t } = useTranslation()

  const contaminantById = useMemo(() => {
    const map: Record<string, Contaminant> = {}
    for (const c of contaminants) {
      map[c.id] = c
    }
    return map
  }, [])

  const removedByMethod = useMemo(() => {
    const map: Record<string, Contaminant[]> = {}
    for (const m of methods) {
      map[m.id] = m.removes.flatMap(id => {
        const c = contaminantById[id]
        return c ? [c] : []
      })
    }
    return map
  }, [contaminantById])

  return (
    <div>
      {/* Hero */}
      <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-gray-900 text-white px-4 py-20 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            {t('learn.methods.title')}
          </h1>
          <p className="text-slate-300 text-lg max-w-xl mx-auto leading-relaxed">
            {t('learn.methods.subtitle')}
          </p>
        </motion.div>
      </div>

      {/* Sections */}
      {methods.map((m, i) => (
        <MethodSection
          key={m.id}
          method={m}
          removedContaminants={removedByMethod[m.id] ?? []}
          index={i}
        />
      ))}
    </div>
  )
}
