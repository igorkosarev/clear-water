import { useMemo } from 'react'
import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { MapPin, AlertTriangle, Search } from 'lucide-react'
import type { Contaminant, TreatmentMethod } from '@/types'
import contaminantsData from '@/data/contaminants.json'
import methodsData from '@/data/treatment-methods.json'

// ─── Particle system ────────────────────────────────────────────────────────

type Particle = {
  x: number; y: number
  w: number; h: number; r: string
  dur: number; dl: number
  kx: number[]; ky: number[]; ko: number[]; ks: number[]
  kr?: number[]
}

type PatternFn = (s: number, i: number) => Omit<Particle, 'x' | 'y' | 'dur' | 'dl'>

// Fixed positions and timings — shared across all contaminants (16 particles)
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

const BLOB_RADII = [
  '35% 65% 55% 45%',
  '60% 40% 65% 35%',
  '45% 55% 60% 40%',
  '50% 60% 40% 50%',
]

// Each contaminant gets a deterministic shape + movement pattern
const PATTERNS: Record<string, PatternFn> = {
  bacteria: (s, i) => {
    const f = i % 2 ? 1 : -1
    const m = 12 + (i % 4) * 4
    return {
      w: s, h: Math.round(s * 0.85),
      r: BLOB_RADII[i % 4] ?? '50%',
      kx: [0, f * m, -f * m * 0.6, f * m * 0.3, 0],
      ky: [0, -f * m * 0.7, f * m * 0.5, -f * m * 0.3, 0],
      ko: [0.15, 0.6, 0.25, 0.55, 0.15],
      ks: [1, 1.1 + (i % 3) * 0.05, 0.88, 1.15, 1],
    }
  },
  // Small dots that dart and spike in scale — viral burst effect
  viruses: (s, i) => {
    const f = i % 2 ? 1 : -1
    const m = 22 + (i % 3) * 8
    const sz = Math.min(s, 9)
    return {
      w: sz, h: sz, r: '50%',
      kx: [0, f * m, f * m, -f * m * 0.3, 0],
      ky: [0, 0, f * m * 0.5, f * m * 0.5, 0],
      ko: [0.1, 0.7, 0.7, 0.3, 0.1],
      ks: [1, 1, 2.0 + (i % 3) * 0.25, 1, 1],
    }
  },
  // Horizontal capsules with sinusoidal side-to-side swim
  protozoa: (s, i) => {
    const f = i % 2 ? 1 : -1
    const baseH = Math.min(s, 13)
    return {
      w: Math.round(baseH * 2.5), h: baseH, r: '50%',
      kx: [0, f * 10, f * 18, f * 10, 0],
      ky: [0, f * 10, 0, -f * 10, 0],
      ko: [0.2, 0.5, 0.35, 0.5, 0.2],
      ks: [1, 1.05, 1, 1.05, 1],
    }
  },
  // Angular fragments that slowly fall and drift
  turbidity: (s, i) => {
    const f = i % 2 ? 1 : -1
    return {
      w: s, h: Math.round(s * 0.65), r: '3px',
      kx: [0, f * 6, -f * 4, f * 7, 0],
      ky: [0, 15, 28, 15, 0],
      ko: [0.25, 0.65, 0.4, 0.65, 0.25],
      ks: [1, 0.95, 0.9, 0.95, 1],
    }
  },
  // Dense small circles — gravity-like sinking, minimal horizontal drift
  heavy_metals: (s, i) => {
    const f = i % 2 ? 1 : -1
    const sz = Math.min(s, 10)
    return {
      w: sz, h: sz, r: '50%',
      kx: [0, f * 3, -f * 2, f * 3, 0],
      ky: [0, 18, 30, 18, 0],
      ko: [0.3, 0.75, 0.55, 0.75, 0.3],
      ks: [1, 1, 1, 1, 1],
    }
  },
  // Bubbles that rise and swell — dissolving gas effect
  chlorine: (s, i) => {
    const f = i % 2 ? 1 : -1
    return {
      w: s, h: s, r: '50%',
      kx: [0, f * 8, -f * 6, f * 5, 0],
      ky: [0, -20, -32, -20, 0],
      ko: [0.12, 0.5, 0.12, 0.5, 0.12],
      ks: [1, 1.1, 1.25, 1.1, 1],
    }
  },
  // Teardrop shapes bobbing gently up and down
  nitrates: (s, i) => {
    const f = i % 2 ? 1 : -1
    const r = i % 2 ? '50% 50% 50% 20%' : '50% 50% 20% 50%'
    return {
      w: s, h: Math.round(s * 1.2), r,
      kx: [0, f * 5, -f * 3, f * 5, 0],
      ky: [0, -14, 0, 14, 0],
      ko: [0.2, 0.55, 0.3, 0.55, 0.2],
      ks: [1, 1.08, 0.95, 1.08, 1],
    }
  },
  // Rotating squares drifting diagonally — crystal lattice effect
  fluoride: (s, i) => {
    const f = i % 2 ? 1 : -1
    const rotStep = 90 + (i % 4) * 30
    return {
      w: s, h: s, r: '8px',
      kx: [0, f * 12, f * 20, f * 12, 0],
      ky: [0, -f * 10, -f * 18, -f * 10, 0],
      ko: [0.2, 0.6, 0.35, 0.6, 0.2],
      ks: [1, 1.05, 1, 1.05, 1],
      kr: [0, f * rotStep, f * rotStep * 2, f * rotStep * 3, f * rotStep * 4],
    }
  },
}

// Build all particle arrays at module init — deterministic, no render side effects
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

const BADGE_CLASS: Record<string, string> = {
  biological:   'text-red-400    border border-red-400/30    bg-red-400/10',
  chemical:     'text-blue-400   border border-blue-400/30   bg-blue-400/10',
  physical:     'text-amber-400  border border-amber-400/30  bg-amber-400/10',
  radiological: 'text-purple-400 border border-purple-400/30 bg-purple-400/10',
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

const contaminants = contaminantsData as Contaminant[]
const methods = methodsData as TreatmentMethod[]

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
  contaminant: Contaminant
  removingMethods: TreatmentMethod[]
  index: number
}

function ContaminantSection({ contaminant, removingMethods, index }: SectionProps) {
  const { t } = useTranslation()
  const isEven = index % 2 === 0
  const { color, icon, id } = contaminant
  const particles = PARTICLE_CONFIGS[id as string] ?? []

  return (
    <section
      id={id}
      className="flex flex-col md:flex-row md:min-h-[680px] overflow-hidden"
    >
      {/* ── Visual panel ── */}
      <div
        className={`relative flex items-center justify-center overflow-hidden
          h-72 md:h-auto md:w-2/5 bg-slate-950
          ${isEven ? 'md:order-first' : 'md:order-last'}`}
      >
        {/* Radial gradient */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background: `radial-gradient(ellipse at 50% 50%, ${color}44 0%, ${color}1a 45%, transparent 75%)`,
          }}
        />

        {/* Unique particles per contaminant */}
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
            transition={{
              duration: p.dur,
              delay: p.dl,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
          />
        ))}

        {/* Glow halo */}
        <div className="relative z-10 flex items-center justify-center">
          <motion.div
            className="absolute rounded-full"
            style={{ width: 200, height: 200, backgroundColor: color, filter: 'blur(60px)' }}
            animate={{ opacity: [0.1, 0.3, 0.1], scale: [0.8, 1.12, 0.8] }}
            transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
          />
          {/* Icon — dramatic entrance on first scroll */}
          <motion.span
            className="relative text-7xl md:text-8xl select-none"
            initial={{ scale: 0.4, opacity: 0 }}
            whileInView={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.15, type: 'spring', bounce: 0.4 }}
            viewport={{ once: true }}
            animate={{ scale: [1, 1.07, 1] }}
            role="img"
            aria-label={id}
          >
            {icon}
          </motion.span>
        </div>
      </div>

      {/* ── Content panel — dark with colour tint ── */}
      <div
        className={`flex-1 md:w-3/5 bg-slate-900 flex items-center
          ${isEven ? 'md:order-last' : 'md:order-first'}`}
        style={{
          backgroundImage: `linear-gradient(135deg, ${color}1e 0%, ${color}0d 60%, transparent 100%)`,
        }}
      >
        <motion.div
          className="w-full max-w-lg mx-auto px-8 py-12 md:py-16"
          variants={contentVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-60px' }}
        >
          {/* Category badge */}
          <motion.span
            variants={itemVariants}
            className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-semibold mb-3
              ${BADGE_CLASS[contaminant.category] ?? 'text-slate-400 border border-slate-400/30 bg-slate-400/10'}`}
          >
            {t(`contaminant.category.${contaminant.category}`)}
          </motion.span>

          {/* Title */}
          <motion.h2 variants={itemVariants} className="text-3xl font-bold text-white mb-3">
            {t(contaminant.nameKey)}
          </motion.h2>

          {/* Description */}
          <motion.p variants={itemVariants} className="text-slate-300 leading-relaxed mb-7">
            {t(contaminant.descriptionKey)}
          </motion.p>

          {/* Info rows */}
          <motion.div
            variants={itemVariants}
            className="space-y-5 border-t border-slate-700/50 pt-6 mb-7"
          >
            <InfoRow
              icon={<MapPin size={13} />}
              label={t('learn.contaminants.sources')}
              text={t(contaminant.sourcesKey)}
            />
            <InfoRow
              icon={<AlertTriangle size={13} />}
              label={t('learn.contaminants.healthRisks')}
              text={t(contaminant.healthRisksKey)}
            />
            <InfoRow
              icon={<Search size={13} />}
              label={t('learn.contaminants.detection')}
              text={t(contaminant.detectionKey)}
            />
          </motion.div>

          {/* Removing methods */}
          {removingMethods.length > 0 && (
            <motion.div variants={itemVariants}>
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                {t('learn.contaminants.removedBy')}
              </p>
              <div className="flex flex-wrap gap-2">
                {removingMethods.map(m => (
                  <Link key={m.id} to={`/learn/methods/${m.id}`}>
                    <span
                      className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium transition-all hover:brightness-125"
                      style={{
                        backgroundColor: `${color}22`,
                        color,
                        border: `1px solid ${color}44`,
                      }}
                    >
                      {t(m.nameKey)}
                    </span>
                  </Link>
                ))}
              </div>
            </motion.div>
          )}
        </motion.div>
      </div>
    </section>
  )
}

// ─── Page ────────────────────────────────────────────────────────────────────

export default function Contaminants() {
  const { t } = useTranslation()

  const methodsByContaminant = useMemo(() => {
    const map: Record<string, TreatmentMethod[]> = {}
    for (const c of contaminants) {
      map[c.id] = methods.filter(m => m.removes.includes(c.id))
    }
    return map
  }, [])

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
            {t('learn.contaminants.title')}
          </h1>
          <p className="text-slate-300 text-lg max-w-xl mx-auto leading-relaxed">
            {t('learn.contaminants.subtitle')}
          </p>
        </motion.div>
      </div>

      {/* Sections */}
      {contaminants.map((c, i) => (
        <ContaminantSection
          key={c.id}
          contaminant={c}
          removingMethods={methodsByContaminant[c.id] ?? []}
          index={i}
        />
      ))}
    </div>
  )
}
