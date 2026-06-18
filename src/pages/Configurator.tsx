import { Fragment, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Droplets, Waves, ShieldAlert, Utensils, Gauge, DollarSign, ArrowRight, ChevronRight,
} from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { Wizard } from '@/components/configurator/Wizard'
import { ResultPanel } from '@/components/configurator/Result/ResultPanel'
import { runSimulation } from '@/engine/simulation'
import type { WaterInput, GreedySimulationResult } from '@/types'

type Phase = 'intro' | 'wizard' | 'result'

// ─── Particles ────────────────────────────────────────────────────────────────

const HERO_PARTICLES = [
  { x:  5, y: 72, size:  7, dur: 6.2, delay: 0.0, dx:  6, dy: -20, accent: true  },
  { x: 13, y: 48, size: 13, dur: 7.8, delay: 1.1, dx: -4, dy: -16, accent: false },
  { x: 25, y: 80, size:  5, dur: 5.4, delay: 0.3, dx:  9, dy: -28, accent: true  },
  { x: 38, y: 60, size: 18, dur: 9.2, delay: 1.6, dx: -3, dy: -12, accent: true  },
  { x: 52, y: 76, size:  6, dur: 6.6, delay: 0.2, dx:  5, dy: -22, accent: false },
  { x: 63, y: 46, size: 11, dur: 7.2, delay: 0.9, dx: -6, dy: -15, accent: true  },
  { x: 75, y: 66, size:  8, dur: 5.8, delay: 1.9, dx:  4, dy: -24, accent: false },
  { x: 86, y: 56, size: 15, dur: 7.5, delay: 0.6, dx: -5, dy: -18, accent: true  },
  { x: 93, y: 33, size:  5, dur: 5.2, delay: 1.3, dx: -4, dy: -26, accent: false },
  { x:  8, y: 24, size: 11, dur: 6.9, delay: 0.7, dx:  7, dy: -14, accent: true  },
  { x: 32, y: 38, size:  6, dur: 5.9, delay: 2.1, dx: -5, dy: -18, accent: false },
  { x: 49, y: 16, size: 22, dur: 9.8, delay: 0.1, dx:  2, dy:  -9, accent: true  },
  { x: 68, y: 30, size:  7, dur: 6.3, delay: 1.7, dx: -6, dy: -16, accent: false },
  { x: 89, y: 82, size: 13, dur: 7.9, delay: 1.2, dx:  4, dy: -22, accent: true  },
  { x: 20, y: 10, size:  5, dur: 4.9, delay: 0.5, dx:  5, dy: -30, accent: false },
]

// ─── Wizard steps preview ─────────────────────────────────────────────────────

const STEPS = [
  { Icon: Waves,       color: '#38bdf8', key: 'source'     },
  { Icon: ShieldAlert, color: '#f43f5e', key: 'problems'   },
  { Icon: Utensils,    color: '#a78bfa', key: 'use'        },
  { Icon: Gauge,       color: '#fb923c', key: 'pressure'   },
  { Icon: DollarSign,  color: '#10b981', key: 'preference' },
]

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function Configurator() {
  const { t } = useTranslation()
  const [phase, setPhase] = useState<Phase>('intro')
  const [result, setResult] = useState<GreedySimulationResult | null>(null)

  const handleWizardComplete = (input: WaterInput) => {
    const sim = runSimulation(input)
    setResult(sim)
    setPhase('result')
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const handleRestart = () => {
    setResult(null)
    setPhase('intro')
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <AnimatePresence mode="wait">

        {/* ── Intro ── */}
        {phase === 'intro' && (
          <motion.div
            key="intro"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, transition: { duration: 0.2 } }}
          >
            {/* Hero */}
            <section className="relative overflow-hidden min-h-[400px] flex items-center">

              {/* Animated radial wash */}
              <motion.div
                className="absolute inset-0 pointer-events-none"
                animate={{ opacity: [0.55, 0.95, 0.55] }}
                transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
                style={{
                  background: 'radial-gradient(ellipse at 50% 60%, rgba(14,165,233,0.20) 0%, rgba(16,185,129,0.07) 42%, transparent 68%)',
                }}
              />

              {/* Floating particles */}
              {HERO_PARTICLES.map((p, i) => (
                <motion.div
                  key={i}
                  className="absolute rounded-full pointer-events-none"
                  style={{
                    left: `${p.x}%`, top: `${p.y}%`,
                    width: p.size, height: p.size,
                    backgroundColor: p.accent ? '#38bdf8' : '#ffffff',
                  }}
                  animate={{
                    x: [0, p.dx, p.dx * 0.4, 0],
                    y: [0, p.dy * 0.5, p.dy, p.dy * 0.5, 0],
                    opacity: [0, 0.28, 0.10, 0.28, 0],
                  }}
                  transition={{ duration: p.dur, delay: p.delay, repeat: Infinity, ease: 'easeInOut' }}
                />
              ))}

              {/* Watermark */}
              <motion.div
                className="absolute right-[-40px] bottom-[-40px] pointer-events-none text-sky-400"
                style={{ opacity: 0.05 }}
                animate={{ scale: [1, 1.06, 1] }}
                transition={{ duration: 9, repeat: Infinity, ease: 'easeInOut' }}
              >
                <Droplets size={320} strokeWidth={0.6} />
              </motion.div>

              {/* Text */}
              <div className="relative z-10 w-full max-w-2xl mx-auto px-6 py-20 text-center">
                <motion.div
                  initial={{ opacity: 0, y: 22 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.7 }}
                  className="space-y-6"
                >
                  <h1 className="text-4xl md:text-5xl font-bold text-white tracking-tight leading-tight">
                    {t('configurator.intro.title')}
                  </h1>
                  <p className="text-slate-400 text-base leading-relaxed max-w-md mx-auto">
                    {t('configurator.intro.description')}
                  </p>
                  <motion.button
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.97 }}
                    onClick={() => setPhase('wizard')}
                    className="inline-flex items-center gap-2.5 px-8 py-3.5 bg-sky-500 hover:bg-sky-400 text-white font-semibold rounded-2xl text-base transition-colors shadow-xl shadow-sky-500/25"
                  >
                    {t('configurator.intro.cta')}
                    <ArrowRight size={17} strokeWidth={2.2} />
                  </motion.button>
                </motion.div>
              </div>
            </section>

            {/* Steps strip */}
            <section className="border-t border-slate-800/60 bg-slate-900/40">
              <div className="max-w-3xl mx-auto px-6 py-12">
                <motion.p
                  className="text-xs font-semibold text-slate-500 uppercase tracking-widest text-center mb-8"
                  initial={{ opacity: 0 }}
                  whileInView={{ opacity: 1 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4 }}
                >
                  {t('configurator.intro.stepsLabel')}
                </motion.p>

                <div className="flex flex-col sm:flex-row sm:items-stretch gap-3 sm:gap-2">
                  {STEPS.map(({ Icon, color, key }, i) => (
                    <Fragment key={key}>
                      <motion.div
                        className="flex sm:flex-col items-center sm:items-center gap-4 sm:gap-3 flex-1 sm:text-center"
                        initial={{ opacity: 0, y: 12 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.45, delay: i * 0.08 }}
                      >
                        {/* Icon + number */}
                        <div className="relative flex-shrink-0">
                          <div
                            className="w-12 h-12 rounded-2xl flex items-center justify-center"
                            style={{ backgroundColor: `${color}1a`, boxShadow: `0 0 0 1px ${color}30` }}
                          >
                            <Icon size={21} strokeWidth={1.5} style={{ color }} />
                          </div>
                          <span
                            className="absolute -top-1.5 -right-1.5 w-4.5 h-4.5 rounded-full text-[9px] font-bold flex items-center justify-center leading-none"
                            style={{ backgroundColor: `${color}22`, color, border: `1px solid ${color}44`, width: 18, height: 18 }}
                          >
                            {i + 1}
                          </span>
                        </div>

                        {/* Labels */}
                        <div className="sm:px-1">
                          <div className="text-sm font-semibold text-slate-200 leading-snug">
                            {t(`configurator.progress.${key}`)}
                          </div>
                          <div className="text-xs text-slate-500 mt-0.5 leading-snug">
                            {t(`configurator.progressHint.${key}`)}
                          </div>
                        </div>
                      </motion.div>

                      {/* Connector */}
                      {i < STEPS.length - 1 && (
                        <>
                          <div className="flex sm:hidden items-center pl-[22px] py-0.5">
                            <div className="w-px h-4 bg-gradient-to-b from-slate-700 to-transparent" />
                          </div>
                          <div className="hidden sm:flex items-center flex-shrink-0 pb-6">
                            <ChevronRight size={13} className="text-slate-700" />
                          </div>
                        </>
                      )}
                    </Fragment>
                  ))}
                </div>
              </div>
            </section>
          </motion.div>
        )}

        {/* ── Wizard ── */}
        {phase === 'wizard' && (
          <motion.div
            key="wizard"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, transition: { duration: 0.2 } }}
            transition={{ duration: 0.4 }}
          >
            <Wizard onComplete={handleWizardComplete} onBack={() => setPhase('intro')} />
          </motion.div>
        )}

        {/* ── Result ── */}
        {phase === 'result' && result && (
          <motion.div
            key="result"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, transition: { duration: 0.2 } }}
            transition={{ duration: 0.4 }}
          >
            <ResultPanel result={result} onRestart={handleRestart} />
          </motion.div>
        )}

      </AnimatePresence>
    </div>
  )
}
