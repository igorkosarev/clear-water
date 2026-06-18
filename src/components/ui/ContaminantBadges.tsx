import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { ContaminantDetailModal } from '@/components/configurator/Result/ContaminantDetailModal'
import type { Contaminant, ContaminantId } from '@/types'
import contaminantsData from '@/data/contaminants.json'

interface ContaminantBadgesProps {
  contaminants: ContaminantId[]
  labelKey: string
}

const allContaminants = contaminantsData as Contaminant[]

export function ContaminantBadges({ contaminants, labelKey }: ContaminantBadgesProps) {
  const { t } = useTranslation()
  const [selected, setSelected] = useState<Contaminant | null>(null)

  if (contaminants.length === 0) return null

  return (
    <>
      <div>
        <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
          {t(labelKey)}
        </p>
        <div className="flex flex-wrap gap-2">
          {contaminants.map(id => {
            const c = allContaminants.find(x => x.id === id)
            return (
              <button
                key={id}
                onClick={e => { e.preventDefault(); c && setSelected(c) }}
                className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border transition-all hover:brightness-110 active:scale-95"
                style={c
                  ? { backgroundColor: `${c.color}18`, color: c.color, borderColor: `${c.color}44` }
                  : undefined
                }
              >
                {c ? (
                  <>
                    <span>{c.icon}</span>
                    <span>{t(c.nameKey)}</span>
                  </>
                ) : (
                  <span>{id}</span>
                )}
              </button>
            )
          })}
        </div>
      </div>

      <ContaminantDetailModal
        contaminant={selected}
        onClose={() => setSelected(null)}
      />
    </>
  )
}
