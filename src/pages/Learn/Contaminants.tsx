import { useMemo } from 'react'
import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { MapPin, AlertTriangle, Search } from 'lucide-react'
import type { Contaminant, TreatmentMethod } from '@/types'
import contaminantsData from '@/data/contaminants.json'
import methodsData from '@/data/treatment-methods.json'

// Deterministic particle layout — no Math.random() needed
const PARTICLES = [
  { x: 12, y: 20, size: 8,  dur: 6.0, delay: 0.0, dx: 15,  dy: -12 },
  { x: 75, y: 15, size: 14, dur: 8.0, delay: 1.2, dx: -10, dy: 15  },
  { x: 30, y: 70, size: 6,  dur: 5.0, delay: 0.5, dx: 12,  dy: -8  },
  { x: 85, y: 60, size: 10, dur: 7.0, delay: 2.0, dx: -15, dy: 10  },
  { x: 50, y: 85, size: 18, dur: 9.0, delay: 0.8, dx: 8,   dy: -18 },
  { x: 20, y: 45, size: 7,  dur: 5.5, delay: 1.5, dx: -8,  dy: 12  },
  { x: 65, y: 30, size: 12, dur: 7.5, delay: 0.3, dx: 10,  dy: -10 },
  { x: 40, y: 10, size: 9,  dur: 6.5, delay: 2.2, dx: -12, dy: 8   },
  { x: 90, y: 80, size: 16, dur: 8.5, delay: 1.0, dx: -8,  dy: -12 },
  { x: 15, y: 90, size: 5,  dur: 4.5, delay: 1.8, dx: 15,  dy: -10 },
  { x: 55, y: 50, size: 22, dur: 10,  delay: 0.2, dx: -6,  dy: 8   },
  { x: 45, y: 35, size: 6,  dur: 5.8, delay: 2.5, dx: 10,  dy: 15  },
]

const CATEGORY_CLASS: Record<string, string> = {
  biological:  'bg-red-100 text-red-700',
  chemical:    'bg-blue-100 text-blue-700',
  physical:    'bg-amber-100 text-amber-700',
  radiological:'bg-purple-100 text-purple-700',
}

// Static data — computed once at module level
const contaminants = contaminantsData as Contaminant[]
const methods = methodsData as TreatmentMethod[]

interface InfoRowProps {
  icon: React.ReactNode
  label: string
  text: string
}

function InfoRow({ icon, label, text }: InfoRowProps) {
  return (
    <div>
      <div className="flex items-center gap-1.5 text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">
        {icon}
        <span>{label}</span>
      </div>
      <p className="text-sm text-gray-600 leading-relaxed">{text}</p>
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

  return (
    <section
      id={id}
      className="flex flex-col md:flex-row md:min-h-[680px] border-b border-gray-100 last:border-0"
    >
      {/* ── Visual panel ─────────────────────────────────────── */}
      <div
        className={`relative flex items-center justify-center overflow-hidden
          h-72 md:h-auto md:w-2/5 bg-slate-950
          ${isEven ? 'md:order-first' : 'md:order-last'}`}
      >
        {/* Radial colour gradient */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background: `radial-gradient(ellipse at 50% 50%, ${color}40 0%, ${color}18 45%, transparent 75%)`,
          }}
        />

        {/* Floating particles */}
        {PARTICLES.map((p, i) => (
          <motion.div
            key={i}
            className="absolute rounded-full pointer-events-none"
            style={{
              left: `${p.x}%`,
              top: `${p.y}%`,
              width: p.size,
              height: p.size,
              backgroundColor: color,
            }}
            animate={{
              x: [0, p.dx, p.dx * 0.4, -p.dx * 0.3, 0],
              y: [0, p.dy * 0.5, p.dy, p.dy * 0.2, 0],
              opacity: [0.15, 0.5, 0.2, 0.55, 0.15],
              scale: [1, 1.2, 0.9, 1.25, 1],
            }}
            transition={{
              duration: p.dur,
              delay: p.delay,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
          />
        ))}

        {/* Glow halo + emoji icon */}
        <div className="relative z-10 flex items-center justify-center">
          <motion.div
            className="absolute rounded-full"
            style={{ width: 200, height: 200, backgroundColor: color, filter: 'blur(60px)' }}
            animate={{ opacity: [0.1, 0.28, 0.1], scale: [0.8, 1.1, 0.8] }}
            transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
          />
          <motion.span
            className="relative text-7xl md:text-8xl select-none"
            animate={{ scale: [1, 1.07, 1] }}
            transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
            role="img"
            aria-label={id}
          >
            {icon}
          </motion.span>
        </div>
      </div>

      {/* ── Content panel ────────────────────────────────────── */}
      <div
        className={`flex-1 md:w-3/5 bg-white flex items-center
          ${isEven ? 'md:order-last' : 'md:order-first'}`}
      >
        <motion.div
          className="w-full max-w-lg mx-auto px-8 py-12 md:py-16"
          initial={{ opacity: 0, y: 28 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55 }}
          viewport={{ once: true, margin: '-60px' }}
        >
          {/* Category badge */}
          <span
            className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-semibold mb-3
              ${CATEGORY_CLASS[contaminant.category] ?? 'bg-gray-100 text-gray-600'}`}
          >
            {t(`contaminant.category.${contaminant.category}`)}
          </span>

          {/* Title */}
          <h2 className="text-3xl font-bold text-gray-900 mb-3">
            {t(contaminant.nameKey)}
          </h2>

          {/* Lead description */}
          <p className="text-gray-600 leading-relaxed mb-7">
            {t(contaminant.descriptionKey)}
          </p>

          {/* Info rows */}
          <div className="space-y-5 border-t border-gray-100 pt-6 mb-7">
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
          </div>

          {/* Removed-by methods */}
          {removingMethods.length > 0 && (
            <div>
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
                {t('learn.contaminants.removedBy')}
              </p>
              <div className="flex flex-wrap gap-2">
                {removingMethods.map(m => (
                  <Link key={m.id} to={`/learn/methods/${m.id}`}>
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-50 text-blue-700 hover:bg-blue-100 transition-colors">
                      {t(m.nameKey)}
                    </span>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </motion.div>
      </div>
    </section>
  )
}

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
