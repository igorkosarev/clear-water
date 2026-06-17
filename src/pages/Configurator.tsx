import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Droplets } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { Wizard } from '@/components/configurator/Wizard'
import { ResultPanel } from '@/components/configurator/Result/ResultPanel'
import { runSimulation } from '@/engine/simulation'
import type { WaterInput, GreedySimulationResult } from '@/types'

type Phase = 'intro' | 'wizard' | 'result'

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
        {phase === 'intro' && (
          <motion.div
            key="intro"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, transition: { duration: 0.2 } }}
            className="relative overflow-hidden min-h-[70vh] flex items-center"
          >
            <motion.div
              className="absolute inset-0 pointer-events-none"
              animate={{ opacity: [0.5, 0.85, 0.5] }}
              transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }}
              style={{
                background:
                  'radial-gradient(ellipse at 50% 40%, rgba(14,165,233,0.12) 0%, transparent 70%)',
              }}
            />
            <div className="relative z-10 w-full max-w-2xl mx-auto px-4 py-20 text-center">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7 }}
                className="space-y-6"
              >
                <div className="flex items-center justify-center gap-3">
                  <Droplets size={28} className="text-sky-400" strokeWidth={1.5} />
                  <h1 className="text-3xl md:text-4xl font-bold text-white">
                    {t('configurator.intro.title')}
                  </h1>
                </div>
                <p className="text-slate-400 text-base max-w-md mx-auto leading-relaxed">
                  {t('configurator.intro.description')}
                </p>
                <motion.button
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={() => setPhase('wizard')}
                  className="inline-flex items-center gap-2 px-8 py-3.5 bg-sky-500 hover:bg-sky-400 text-white font-semibold rounded-2xl text-base transition-colors shadow-lg shadow-sky-500/20"
                >
                  {t('configurator.intro.cta')}
                </motion.button>
              </motion.div>
            </div>
          </motion.div>
        )}

        {phase === 'wizard' && (
          <motion.div
            key="wizard"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, transition: { duration: 0.2 } }}
            transition={{ duration: 0.4 }}
          >
            <Wizard
              onComplete={handleWizardComplete}
              onBack={() => setPhase('intro')}
            />
          </motion.div>
        )}

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
