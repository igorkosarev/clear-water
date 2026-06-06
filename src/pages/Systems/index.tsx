import { useTranslation } from 'react-i18next'
import { Link } from 'react-router-dom'
import { Card } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import systemTemplates from '@/data/system-templates.json'

export default function Systems() {
  const { t } = useTranslation()

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-2">{t('systems.title')}</h1>
      <p className="text-gray-500 mb-8">{t('systems.subtitle')}</p>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {systemTemplates.map(s => (
          <Link key={s.id} to={`/systems/${s.id}`}>
            <Card className="p-5 hover:shadow-md transition-shadow cursor-pointer h-full">
              <h2 className="font-semibold text-gray-900 mb-1">{t(s.nameKey)}</h2>
              <p className="text-sm text-gray-500 mb-3 line-clamp-2">{t(s.descriptionKey)}</p>
              <Badge variant="info">{s.budgetTier}</Badge>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  )
}
