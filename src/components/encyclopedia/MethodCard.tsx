import { useTranslation } from 'react-i18next'
import { Link } from 'react-router-dom'
import { Card } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import type { TreatmentMethod } from '@/types'

interface MethodCardProps {
  method: TreatmentMethod
}

export function MethodCard({ method }: MethodCardProps) {
  const { t } = useTranslation()

  const complexityVariant = {
    beginner: 'success',
    intermediate: 'warning',
    advanced: 'danger',
  } as const

  return (
    <Link to={`/learn/methods/${method.id}`}>
      <Card className="p-4 hover:shadow-md transition-shadow cursor-pointer">
        <h3 className="font-semibold text-gray-900">{t(method.nameKey)}</h3>
        <p className="text-sm text-gray-500 mt-1 line-clamp-2">{t(method.descriptionKey)}</p>
        <div className="flex gap-2 mt-3 flex-wrap">
          <Badge variant={complexityVariant[method.complexity]}>{method.complexity}</Badge>
          <Badge variant="info">{method.costTier}</Badge>
        </div>
      </Card>
    </Link>
  )
}
