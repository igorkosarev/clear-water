import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useTranslation } from 'react-i18next'
import { ChevronLeft, MapPin, AlertTriangle, Search, Zap, Target } from 'lucide-react'
import type { Contaminant, TreatmentMethod } from '@/types'
import contaminantsData from '@/data/contaminants.json'
import methodsData from '@/data/treatment-methods.json'
import Modal from '@/components/ui/Modal'
import {
  CONTAMINANT_ICONS,
  BADGE_CLASS,
  COMPLEXITY_CLASS,
  COST_CLASS,
} from '@/components/encyclopedia/contaminantConfig'

// ─── Particle system ─────────────────────────────────────────────────────────

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

const BLOB_RADII = [
  '35% 65% 55% 45%',
  '60% 40% 65% 35%',
  '45% 55% 60% 40%',
  '50% 60% 40% 50%',
]

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

// ─── Sub-components ───────────────────────────────────────────────────────────

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

// ─── Animation variants ───────────────────────────────────────────────────────

const contentVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.08, delayChildren: 0.05 } },
}

const itemVariants = {
  hidden: { opacity: 0, y: 18 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: 'easeOut' as const } },
}

// ─── Static data ──────────────────────────────────────────────────────────────

const contaminants = contaminantsData as Contaminant[]
const methods = methodsData as TreatmentMethod[]

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function ContaminantDetail() {
  const { id } = useParams<{ id: string }>()
  const { t } = useTranslation()
  const [selectedMethod, setSelectedMethod] = useState<TreatmentMethod | null>(null)

  const contaminant = contaminants.find(c => c.id === id)
  const removingMethods = contaminant
    ? methods.filter(m => m.removes.includes(contaminant.id))
    : []

  useEffect(() => {
    if (contaminant) {
      document.title = `${t(contaminant.nameKey)} — Clear Water`
    }
    return () => { document.title = 'Clear Water' }
  }, [contaminant, t])

  if (!contaminant) {
    return (
      <div className="min-h-screen bg-slate-950 text-white flex items-center justify-center">
        <div className="text-center">
          <p className="text-slate-400 mb-4">{t('learn.contaminants.notFound', { defaultValue: 'Contaminant not found.' })}</p>
          <Link to="/learn/contaminants" className="text-sky-400 hover:text-sky-300 text-sm transition-colors">
            ← {t('learn.contaminants.backToList', { defaultValue: 'Back to Contaminants' })}
          </Link>
        </div>
      </div>
    )
  }

  const { color } = contaminant
  const particles = PARTICLE_CONFIGS[contaminant.id] ?? []
  const SectionIcon = CONTAMINANT_ICONS[contaminant.id]

  return (
    <div className="bg-slate-950 min-h-screen">
      {/* ── Back link ── */}
      <div className="relative z-20 max-w-6xl mx-auto px-6 md:px-10 pt-6">
        <Link
          to="/learn/contaminants"
          className="inline-flex items-center gap-1 text-slate-400 hover:text-white text-sm transition-colors"
        >
          <ChevronLeft size={16} />
          {t('learn.contaminants.backToList', { defaultValue: 'Back to Contaminants' })}
        </Link>
      </div>

      {/* ── Full-bleed section ── */}
      <section className="relative overflow-hidden min-h-[620px] md:min-h-[700px]">
        {/* Radial gradient */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background: `radial-gradient(ellipse at 75% 50%, ${color}38 0%, ${color}14 48%, transparent 72%)`,
          }}
        />

        {/* Particles */}
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

        {/* Text-side darkening gradient */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background: 'linear-gradient(to right, rgba(2,6,23,0.96) 0%, rgba(2,6,23,0.85) 35%, rgba(2,6,23,0.45) 62%, transparent 82%)',
          }}
        />
        <div className="absolute inset-0 bg-slate-950/72 md:hidden pointer-events-none" />

        {/* Constrained content */}
        <div className="relative z-10 w-full max-w-6xl mx-auto px-6 md:px-10 min-h-[620px] md:min-h-[700px]">

          {/* Glow blob */}
          <motion.div
            className="absolute top-1/2 -translate-y-1/2 rounded-full pointer-events-none"
            style={{ right: '0%', width: 400, height: 400, backgroundColor: color, filter: 'blur(110px)' }}
            animate={{ opacity: [0.1, 0.24, 0.1], scale: [0.88, 1.1, 0.88] }}
            transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }}
          />

          {/* Large icon */}
          {SectionIcon && (
            <motion.div
              className="absolute top-1/2 -translate-y-1/2 pointer-events-none hidden md:block"
              style={{ right: '3%', color }}
              animate={{ scale: [1, 1.05, 1] }}
              transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
            >
              <motion.div
                initial={{ opacity: 0, scale: 0.6 }}
                animate={{ opacity: 0.38, scale: 1 }}
                transition={{ duration: 0.7, delay: 0.1, type: 'spring' as const, bounce: 0.3 }}
              >
                <SectionIcon size={220} strokeWidth={0.7} />
              </motion.div>
            </motion.div>
          )}

          {/* Text content */}
          <div className="w-full min-h-[620px] md:min-h-[700px] flex items-center justify-start">
            <motion.div
              className="w-full max-w-[520px] py-16"
              variants={contentVariants}
              initial="hidden"
              animate="visible"
            >
              <motion.span
                variants={itemVariants}
                className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-semibold mb-3
                  ${BADGE_CLASS[contaminant.category] ?? 'text-slate-400 border border-slate-400/30 bg-slate-400/10'}`}
              >
                {t(`contaminant.category.${contaminant.category}`)}
              </motion.span>

              <motion.h1 variants={itemVariants} className="text-3xl md:text-4xl font-bold text-white mb-3">
                {t(contaminant.nameKey)}
              </motion.h1>

              <motion.p variants={itemVariants} className="text-slate-300 leading-relaxed mb-7">
                {t(contaminant.descriptionKey)}
              </motion.p>

              <motion.div
                variants={itemVariants}
                className="space-y-5 border-t border-slate-700/50 pt-6 mb-7"
              >
                <InfoRow icon={<MapPin size={13} />} label={t('learn.contaminants.sources')} text={t(contaminant.sourcesKey)} />
                <InfoRow icon={<AlertTriangle size={13} />} label={t('learn.contaminants.healthRisks')} text={t(contaminant.healthRisksKey)} />
                <InfoRow icon={<Search size={13} />} label={t('learn.contaminants.detection')} text={t(contaminant.detectionKey)} />
              </motion.div>

              {removingMethods.length > 0 && (
                <motion.div variants={itemVariants}>
                  <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                    {t('learn.contaminants.removedBy')}
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {removingMethods.map(m => (
                      <button
                        key={m.id}
                        onClick={() => setSelectedMethod(m)}
                        className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium transition-all hover:brightness-125 cursor-pointer"
                        style={{ backgroundColor: `${color}22`, color, border: `1px solid ${color}44` }}
                      >
                        {t(m.nameKey)}
                      </button>
                    ))}
                  </div>
                </motion.div>
              )}
            </motion.div>
          </div>
        </div>
      </section>

      {/* Method preview modal */}
      <Modal open={selectedMethod !== null} onClose={() => setSelectedMethod(null)}>
        {selectedMethod && (
          <>
            <div className="h-1 w-full rounded-t-2xl" style={{ backgroundColor: selectedMethod.color }} />
            <div className="p-6">
              <div className="mb-4 pr-8">
                <div className="flex flex-wrap gap-1.5 mb-2">
                  <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-semibold ${COMPLEXITY_CLASS[selectedMethod.complexity] ?? ''}`}>
                    {t(`method.complexity.${selectedMethod.complexity}`)}
                  </span>
                  <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-semibold ${COST_CLASS[selectedMethod.costTier] ?? ''}`}>
                    {t(`method.costTier.${selectedMethod.costTier}`)}
                  </span>
                </div>
                <h3 className="text-lg font-bold text-white leading-tight">
                  {t(selectedMethod.nameKey)}
                </h3>
              </div>
              <p className="text-slate-300 text-sm leading-relaxed mb-5">
                {t(selectedMethod.descriptionKey)}
              </p>
              <div className="space-y-4 border-t border-slate-700/50 pt-5">
                <InfoRow icon={<Zap size={13} />} label={t('learn.methods.howItWorks')} text={t(selectedMethod.howItWorksKey)} />
                <InfoRow icon={<AlertTriangle size={13} />} label={t('learn.methods.limitations')} text={t(selectedMethod.limitationsKey)} />
                <InfoRow icon={<Target size={13} />} label={t('learn.methods.typicalUse')} text={t(selectedMethod.typicalUseKey)} />
              </div>
            </div>
          </>
        )}
      </Modal>
    </div>
  )
}
