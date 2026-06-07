import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { motion } from 'framer-motion'
import { Wand2, FlaskConical, Filter, Layers, Wrench, MapPin } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'

interface SectionConfig {
  key: string
  route: string
  Icon: LucideIcon
}

const SECTIONS: SectionConfig[] = [
  { key: 'configurator', route: '/configurator', Icon: Wand2 },
  { key: 'contaminants', route: '/learn/contaminants', Icon: FlaskConical },
  { key: 'methods', route: '/learn/methods', Icon: Filter },
  { key: 'systems', route: '/systems', Icon: Layers },
  { key: 'build', route: '/build', Icon: Wrench },
  { key: 'suppliers', route: '/suppliers', Icon: MapPin },
]

const fadeUp = {
  hidden: { opacity: 0, y: 36 },
  visible: { opacity: 1, y: 0 },
}

export default function Home() {
  const { t } = useTranslation()

  return (
    <div className="bg-slate-900">
      {/* ── Hero ── */}
      <section className="relative bg-gradient-to-br from-slate-950 via-slate-900 to-slate-800 text-white overflow-hidden min-h-[560px] flex items-center">
        {/* Subtle radial glow */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background: 'radial-gradient(ellipse at 50% 40%, rgba(59,130,246,0.12) 0%, transparent 65%)',
          }}
        />

        <div className="relative z-10 w-full max-w-5xl mx-auto px-4 py-32 text-center">
          <motion.h1
            className="text-5xl sm:text-6xl font-bold mb-6 leading-tight tracking-tight"
            initial={{ opacity: 0, y: 28 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
          >
            {t('home.hero.title')}
          </motion.h1>
          <motion.p
            className="text-xl text-slate-300 max-w-2xl mx-auto mb-10"
            initial={{ opacity: 0, y: 28 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.15 }}
          >
            {t('home.hero.subtitle')}
          </motion.p>
          <motion.div
            initial={{ opacity: 0, y: 28 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.3 }}
          >
            <Link
              to="/configurator"
              className="inline-flex items-center gap-2 px-8 py-4 bg-white text-slate-900 font-bold rounded-full text-lg hover:bg-slate-100 transition-colors shadow-xl"
            >
              {t('home.hero.cta')}
              <span aria-hidden>→</span>
            </Link>
          </motion.div>
        </div>
      </section>

      {/* ── Feature sections ── */}
      {SECTIONS.map(({ key, route, Icon }, i) => {
        const isEven = i % 2 === 0
        return (
          <section
            key={key}
            className={`py-20 border-b border-slate-800 last:border-0 ${
              isEven ? 'bg-slate-900' : 'bg-slate-800/60'
            }`}
          >
            <motion.div
              className={`max-w-5xl mx-auto px-4 flex flex-col items-center gap-12 md:gap-16 ${
                isEven ? 'md:flex-row' : 'md:flex-row-reverse'
              }`}
              variants={fadeUp}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: '-80px' }}
              transition={{ duration: 0.6 }}
            >
              {/* Icon block */}
              <div className="flex-shrink-0 flex items-center justify-center w-36 h-36 rounded-3xl bg-blue-500/15 border border-blue-500/25 text-blue-400">
                <Icon size={60} strokeWidth={1.25} />
              </div>

              {/* Text */}
              <div className="flex-1 text-center md:text-left">
                <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
                  {t(`home.sections.${key}.title`)}
                </h2>
                <p className="text-lg text-slate-400 mb-8 max-w-lg">
                  {t(`home.sections.${key}.description`)}
                </p>
                <Link
                  to={route}
                  className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white font-semibold rounded-full hover:bg-blue-500 transition-colors"
                >
                  {t(`home.sections.${key}.cta`)}
                  <span aria-hidden>→</span>
                </Link>
              </div>
            </motion.div>
          </section>
        )
      })}
    </div>
  )
}
