import { useEffect } from 'react'
import { motion } from 'framer-motion'
import { useTranslation } from 'react-i18next'
import { Link, useLocation } from 'react-router-dom'
import { ChevronLeft, ChevronRight } from 'lucide-react'

// ─── Animation variants ───────────────────────────────────────────────────────

const sectionVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: 'easeOut' as const } },
}

// ─── Section IDs (anchors) ────────────────────────────────────────────────────

const SECTION_ORDER = [
  'multiStage',
  'surfaceWater',
  'waterTesting',
  'certification',
  'howToChoose',
  'misconceptions',
] as const

type SectionKey = typeof SECTION_ORDER[number]

// ─── Helper components ────────────────────────────────────────────────────────

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="text-2xl md:text-3xl font-bold text-white mb-4">{children}</h2>
  )
}

function SubTitle({ children }: { children: React.ReactNode }) {
  return (
    <h3 className="text-base font-semibold text-slate-200 mt-6 mb-2">{children}</h3>
  )
}

function Body({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-slate-300 leading-relaxed text-sm">{children}</p>
  )
}

function BulletList({ items }: { items: string[] }) {
  return (
    <ul className="space-y-2 mt-2">
      {items.map((item, i) => (
        <li key={i} className="flex gap-3 text-sm text-slate-300 leading-relaxed">
          <span className="mt-1.5 flex-shrink-0 w-1.5 h-1.5 rounded-full bg-sky-400" />
          {item}
        </li>
      ))}
    </ul>
  )
}

function Divider() {
  return <div className="my-10 border-t border-slate-800/60" />
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function Basics() {
  const { t } = useTranslation()
  const location = useLocation()

  useEffect(() => {
    const hash = location.hash.replace('#', '')
    if (hash) {
      requestAnimationFrame(() => {
        document.getElementById(hash)?.scrollIntoView({ behavior: 'smooth' })
      })
    }
  }, [location.hash])

  const navKeys: SectionKey[] = [...SECTION_ORDER]

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      {/* Back link */}
      <div className="max-w-3xl mx-auto px-6 pt-6">
        <Link
          to="/learn"
          className="inline-flex items-center gap-1 text-slate-400 hover:text-white text-sm transition-colors"
        >
          <ChevronLeft size={16} />
          {t('learn.basics.back')}
        </Link>
      </div>

      {/* Page header */}
      <div className="max-w-3xl mx-auto px-6 pt-8 pb-2">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <h1 className="text-3xl md:text-4xl font-bold text-white mb-3">
            {t('basics.pageTitle')}
          </h1>
          <p className="text-slate-400 text-sm leading-relaxed max-w-2xl">
            {t('basics.pageDescription')}
          </p>
        </motion.div>
      </div>

      {/* In-page nav */}
      <div className="max-w-3xl mx-auto px-6 py-6">
        <nav className="flex flex-wrap gap-2">
          {navKeys.map(key => (
            <a
              key={key}
              href={`#section-${key}`}
              className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-xs font-medium transition-colors"
            >
              {t(`basics.nav.${key}`)}
            </a>
          ))}
        </nav>
      </div>

      {/* Content */}
      <div className="max-w-3xl mx-auto px-6 pb-20">

        {/* 1. Multi-stage treatment */}
        <motion.section
          id="section-multiStage"
          variants={sectionVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-60px' }}
          className="scroll-mt-6"
        >
          <SectionTitle>{t('basics.multiStage.title')}</SectionTitle>
          <Body>{t('basics.multiStage.intro')}</Body>

          <SubTitle>{t('basics.multiStage.whySingleTitle')}</SubTitle>
          <Body>{t('basics.multiStage.whySingleBody')}</Body>

          <SubTitle>{t('basics.multiStage.trainConceptTitle')}</SubTitle>
          <Body>{t('basics.multiStage.trainConceptBody')}</Body>

          <SubTitle>{t('basics.multiStage.examplesTitle')}</SubTitle>
          <div className="space-y-4 mt-3">
            {(t('basics.multiStage.examples', { returnObjects: true }) as Array<{ name: string; chain: string; note: string }>).map((ex, i) => (
              <div key={i} className="rounded-xl border border-slate-700/50 bg-slate-900 p-4">
                <p className="text-sm font-semibold text-white mb-1">{ex.name}</p>
                <p className="text-xs font-mono text-sky-400 mb-2">{ex.chain}</p>
                <p className="text-xs text-slate-400 leading-relaxed">{ex.note}</p>
              </div>
            ))}
          </div>

          <div className="mt-6 rounded-xl bg-sky-950/40 border border-sky-800/40 px-5 py-4 flex items-center justify-between gap-4">
            <p className="text-sm text-slate-300">{t('basics.multiStage.ctaText')}</p>
            <Link
              to="/configurator"
              className="flex-shrink-0 inline-flex items-center gap-1.5 text-sm font-medium text-sky-400 hover:text-sky-300 transition-colors"
            >
              {t('basics.multiStage.ctaLink')}
              <ChevronRight size={14} />
            </Link>
          </div>
        </motion.section>

        <Divider />

        {/* 2. Surface water */}
        <motion.section
          id="section-surfaceWater"
          variants={sectionVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-60px' }}
          className="scroll-mt-6"
        >
          <SectionTitle>{t('basics.surfaceWater.title')}</SectionTitle>
          <Body>{t('basics.surfaceWater.intro')}</Body>

          <SubTitle>{t('basics.surfaceWater.biologyTitle')}</SubTitle>
          <Body>{t('basics.surfaceWater.biologyBody')}</Body>

          <SubTitle>{t('basics.surfaceWater.agricultureTitle')}</SubTitle>
          <Body>{t('basics.surfaceWater.agricultureBody')}</Body>

          <SubTitle>{t('basics.surfaceWater.industrialTitle')}</SubTitle>
          <Body>{t('basics.surfaceWater.industrialBody')}</Body>

          <SubTitle>{t('basics.surfaceWater.clarityTitle')}</SubTitle>
          <Body>{t('basics.surfaceWater.clarityBody')}</Body>

          <div className="mt-5 rounded-xl border border-amber-700/40 bg-amber-950/30 px-5 py-4">
            <p className="text-xs font-semibold text-amber-400 uppercase tracking-wider mb-1">
              {t('basics.surfaceWater.minimumTreatmentTitle')}
            </p>
            <p className="text-sm text-slate-300 leading-relaxed">
              {t('basics.surfaceWater.minimumTreatmentBody')}
            </p>
          </div>
        </motion.section>

        <Divider />

        {/* 3. Water testing */}
        <motion.section
          id="section-waterTesting"
          variants={sectionVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-60px' }}
          className="scroll-mt-6"
        >
          <SectionTitle>{t('basics.waterTesting.title')}</SectionTitle>
          <Body>{t('basics.waterTesting.intro')}</Body>

          <SubTitle>{t('basics.waterTesting.whenTitle')}</SubTitle>
          <BulletList items={t('basics.waterTesting.whenItems', { returnObjects: true }) as string[]} />

          <SubTitle>{t('basics.waterTesting.typesTitle')}</SubTitle>
          <BulletList items={t('basics.waterTesting.typesItems', { returnObjects: true }) as string[]} />

          <SubTitle>{t('basics.waterTesting.interpretTitle')}</SubTitle>
          <Body>{t('basics.waterTesting.interpretBody')}</Body>

          <SubTitle>{t('basics.waterTesting.kitsVsLabTitle')}</SubTitle>
          <Body>{t('basics.waterTesting.kitsVsLabBody')}</Body>

          <SubTitle>{t('basics.waterTesting.verifyTitle')}</SubTitle>
          <Body>{t('basics.waterTesting.verifyBody')}</Body>
        </motion.section>

        <Divider />

        {/* 4. Certification */}
        <motion.section
          id="section-certification"
          variants={sectionVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-60px' }}
          className="scroll-mt-6"
        >
          <SectionTitle>{t('basics.certification.title')}</SectionTitle>
          <Body>{t('basics.certification.intro')}</Body>

          <SubTitle>{t('basics.certification.whyDifferTitle')}</SubTitle>
          <Body>{t('basics.certification.whyDifferBody')}</Body>

          <SubTitle>{t('basics.certification.nsfTitle')}</SubTitle>
          <div className="mt-3 rounded-xl border border-slate-700/50 overflow-hidden">
            {(t('basics.certification.nsfItems', { returnObjects: true }) as Array<{ std: string; covers: string }>).map((item, i) => (
              <div
                key={i}
                className={`flex gap-4 px-4 py-3 text-sm ${i % 2 === 0 ? 'bg-slate-900' : 'bg-slate-900/50'}`}
              >
                <span className="flex-shrink-0 font-mono font-semibold text-sky-400 w-28">{item.std}</span>
                <span className="text-slate-300 leading-relaxed">{item.covers}</span>
              </div>
            ))}
          </div>

          <SubTitle>{t('basics.certification.whoTitle')}</SubTitle>
          <Body>{t('basics.certification.whoBody')}</Body>

          <SubTitle>{t('basics.certification.redFlagsTitle')}</SubTitle>
          <BulletList items={t('basics.certification.redFlags', { returnObjects: true }) as string[]} />
        </motion.section>

        <Divider />

        {/* 5. How to choose */}
        <motion.section
          id="section-howToChoose"
          variants={sectionVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-60px' }}
          className="scroll-mt-6"
        >
          <SectionTitle>{t('basics.howToChoose.title')}</SectionTitle>
          <Body>{t('basics.howToChoose.intro')}</Body>

          <SubTitle>{t('basics.howToChoose.stepsTitle')}</SubTitle>
          <ol className="space-y-3 mt-3">
            {(t('basics.howToChoose.steps', { returnObjects: true }) as string[]).map((step, i) => (
              <li key={i} className="flex gap-4 text-sm text-slate-300 leading-relaxed">
                <span className="flex-shrink-0 w-6 h-6 rounded-full bg-slate-800 border border-slate-600 flex items-center justify-center text-xs font-bold text-sky-400">
                  {i + 1}
                </span>
                {step}
              </li>
            ))}
          </ol>

          <div className="mt-6 rounded-xl bg-sky-950/40 border border-sky-800/40 px-5 py-4 flex items-center justify-between gap-4">
            <p className="text-sm text-slate-300">{t('basics.howToChoose.ctaText')}</p>
            <Link
              to="/configurator"
              className="flex-shrink-0 inline-flex items-center gap-1.5 text-sm font-medium text-sky-400 hover:text-sky-300 transition-colors"
            >
              {t('basics.howToChoose.ctaLink')}
              <ChevronRight size={14} />
            </Link>
          </div>
        </motion.section>

        <Divider />

        {/* 6. Misconceptions */}
        <motion.section
          id="section-misconceptions"
          variants={sectionVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-60px' }}
          className="scroll-mt-6"
        >
          <SectionTitle>{t('basics.misconceptions.title')}</SectionTitle>
          <Body>{t('basics.misconceptions.intro')}</Body>

          <div className="space-y-4 mt-5">
            {(t('basics.misconceptions.items', { returnObjects: true }) as Array<{ myth: string; fact: string }>).map((item, i) => (
              <div key={i} className="rounded-xl border border-slate-700/50 bg-slate-900 overflow-hidden">
                <div className="flex items-start gap-3 px-4 py-3 border-b border-slate-700/40 bg-slate-800/50">
                  <span className="mt-0.5 flex-shrink-0 text-xs font-bold text-red-400 uppercase tracking-wide">Myth</span>
                  <p className="text-sm font-medium text-slate-200">{item.myth}</p>
                </div>
                <div className="flex items-start gap-3 px-4 py-3">
                  <span className="mt-0.5 flex-shrink-0 text-xs font-bold text-emerald-400 uppercase tracking-wide">Fact</span>
                  <p className="text-sm text-slate-300 leading-relaxed">{item.fact}</p>
                </div>
              </div>
            ))}
          </div>
        </motion.section>

      </div>
    </div>
  )
}
