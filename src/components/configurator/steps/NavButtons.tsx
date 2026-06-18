import { useTranslation } from 'react-i18next'
import { ChevronLeft, ArrowRight, Sparkles } from 'lucide-react'

interface NavButtonsProps {
  onBack: () => void
  onNext: () => void
  canNext?: boolean
  nextLabel?: string
  isFinal?: boolean
}

export function NavButtons({ onBack, onNext, canNext = true, nextLabel, isFinal = false }: NavButtonsProps) {
  const { t } = useTranslation()
  const label = nextLabel ?? (isFinal ? t('configurator.getResults') : t('common.next'))

  return (
    <div className="flex gap-3 pt-2">
      <button
        onClick={onBack}
        className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl border border-slate-700/60 text-slate-400 hover:text-white hover:border-slate-500 text-sm font-medium transition-colors"
      >
        <ChevronLeft size={15} strokeWidth={2} />
        {t('common.back')}
      </button>
      <button
        onClick={onNext}
        disabled={!canNext}
        className={`flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all disabled:opacity-40 disabled:cursor-not-allowed ${
          isFinal
            ? 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg shadow-emerald-500/20'
            : 'bg-sky-600 hover:bg-sky-500 text-white'
        }`}
      >
        {label}
        {isFinal ? <Sparkles size={14} strokeWidth={2} /> : <ArrowRight size={14} strokeWidth={2.2} />}
      </button>
    </div>
  )
}
