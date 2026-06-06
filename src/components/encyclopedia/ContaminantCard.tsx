import { useTranslation } from 'react-i18next'
import { Link } from 'react-router-dom'
import { Card } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import type { Contaminant } from '@/types'

interface ContaminantCardProps {
  contaminant: Contaminant
}

export function ContaminantCard({ contaminant }: ContaminantCardProps) {
  const { t } = useTranslation()

  return (
    <Link to={`/learn/contaminants/${contaminant.id}`}>
      <Card className="p-4 hover:shadow-md transition-shadow cursor-pointer">
        <div className="flex items-start gap-3">
          <span className="text-2xl">{contaminant.icon}</span>
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-gray-900 truncate">{t(contaminant.nameKey)}</h3>
            <p className="text-sm text-gray-500 mt-1 line-clamp-2">{t(contaminant.descriptionKey)}</p>
            <div className="mt-2">
              <Badge variant="info">{contaminant.category}</Badge>
            </div>
          </div>
        </div>
      </Card>
    </Link>
  )
}
