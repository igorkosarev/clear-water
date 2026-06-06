import { useTranslation } from 'react-i18next'
import { Button } from '@/components/ui/Button'
import type { WaterInput, ContaminantId } from '@/types'
import contaminants from '@/data/contaminants.json'

interface StepProps {
  data: Partial<WaterInput>
  update: (patch: Partial<WaterInput>) => void
  onNext: () => void
  onBack: () => void
}

export function StepProblems({ data, update, onNext, onBack }: StepProps) {
  const { t } = useTranslation()
  const selected = data.contaminants ?? []

  const toggle = (id: ContaminantId) => {
    const next = selected.includes(id) ? selected.filter(c => c !== id) : [...selected, id]
    update({ contaminants: next })
  }

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold text-gray-900">{t('configurator.steps.problems.title')}</h2>
      <p className="text-gray-500">{t('configurator.steps.problems.description')}</p>
      <div className="grid grid-cols-2 gap-3">
        {(contaminants as Array<{ id: string; nameKey: string; icon: string }>).map(c => (
          <button
            key={c.id}
            className={`p-3 rounded-lg border-2 text-left flex items-center gap-2 transition-colors ${selected.includes(c.id) ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-gray-300'}`}
            onClick={() => toggle(c.id)}
          >
            <span>{c.icon}</span>
            <span className="text-sm font-medium text-gray-800">{t(c.nameKey)}</span>
          </button>
        ))}
      </div>
      <div className="flex gap-3">
        <Button variant="secondary" onClick={onBack} className="flex-1">{t('common.back')}</Button>
        <Button onClick={onNext} disabled={selected.length === 0} className="flex-1">{t('common.next')}</Button>
      </div>
    </div>
  )
}
