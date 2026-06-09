import { motion } from 'framer-motion'
import { Beaker } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { SimulationCanvas } from '@/components/simulation/SimulationCanvas'
import type { FilterType, ContaminantId } from '@/types'

// full_ro_system: sediment → activated_carbon → ro_membrane → uv
const DEMO_FILTERS: FilterType[] = ['booster_pump','sediment', 'activated_carbon', 'ro', 'uv']

const ALL_CONTAMINANT_IDS: ContaminantId[] = [
  'bacteria', 'viruses', 'protozoa', 'turbidity',
  'lead', 'arsenic', 'chlorine', 'nitrates', 'fluoride', 'pfas',
]

export default function Configurator() {
  const { t } = useTranslation()

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      {/* Hero */}
      <div className="relative overflow-hidden border-b border-slate-800/60">
        <motion.div
          className="absolute inset-0 pointer-events-none"
          animate={{ opacity: [0.5, 0.85, 0.5] }}
          transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' as const }}
          style={{
            background:
              'radial-gradient(ellipse at 50% 50%, rgba(14,165,233,0.13) 0%, transparent 70%)',
          }}
        />
        <div className="relative z-10 max-w-2xl mx-auto px-4 py-12 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
          >
            <div className="flex items-center justify-center gap-3 mb-4">
              <Beaker size={26} className="text-sky-400" strokeWidth={1.5} />
              <h1 className="text-3xl md:text-4xl font-bold text-white">
                {t('configurator.title', { defaultValue: 'Water Filtration Simulator' })}
              </h1>
            </div>
            <p className="text-slate-400 text-sm max-w-md mx-auto leading-relaxed">
              {t('configurator.demoDescription', {
                defaultValue:
                  'Watch how contaminants are removed step by step as water passes through each filter module.',
              })}
            </p>
          </motion.div>
        </div>
      </div>

      {/* Simulation canvas */}
      <div className="max-w-xl mx-auto px-4 py-10">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider text-center mb-6">
            {t('configurator.systemLabel', { defaultValue: 'System: Full RO with UV' })}
          </p>
          <SimulationCanvas filters={DEMO_FILTERS} inputContaminants={ALL_CONTAMINANT_IDS} />
        </motion.div>
      </div>
    </div>
  )
}
