import { useTranslation } from 'react-i18next'
import { MapPin, AlertTriangle, Search } from 'lucide-react'
import Modal from '@/components/ui/Modal'
import { BADGE_CLASS } from '@/components/encyclopedia/contaminantConfig'
import type { Contaminant } from '@/types'

interface ContaminantDetailModalProps {
  contaminant: Contaminant | null
  onClose: () => void
}

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

export function ContaminantDetailModal({ contaminant, onClose }: ContaminantDetailModalProps) {
  const { t } = useTranslation()

  return (
    <Modal open={contaminant !== null} onClose={onClose}>
      {contaminant && (
        <>
          <div className="h-1 w-full rounded-t-2xl" style={{ backgroundColor: contaminant.color }} />
          <div className="p-6">
            <div className="mb-4 pr-8">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-2xl">{contaminant.icon}</span>
                <span className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-semibold ${BADGE_CLASS[contaminant.category] ?? 'text-slate-400 border border-slate-400/30 bg-slate-400/10'}`}>
                  {t(`contaminant.category.${contaminant.category}`)}
                </span>
              </div>
              <h3 className="text-xl font-bold text-white leading-tight">
                {t(contaminant.nameKey)}
              </h3>
            </div>

            <p className="text-slate-300 text-sm leading-relaxed mb-5">
              {t(contaminant.descriptionKey)}
            </p>

            <div className="space-y-4 border-t border-slate-700/50 pt-5">
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
          </div>
        </>
      )}
    </Modal>
  )
}
