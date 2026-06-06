import { useTranslation } from 'react-i18next'
import { Link } from 'react-router-dom'
import { Card } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import modules from '@/data/modules.json'

export default function ModuleLibrary() {
  const { t } = useTranslation()

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <Link to="/build" className="text-sm text-blue-600 hover:underline mb-6 block">← {t('build.back')}</Link>
      <h1 className="text-3xl font-bold text-gray-900 mb-8">{t('build.modules.title')}</h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {modules.map(m => (
          <Card key={m.id} className="p-5">
            <h3 className="font-semibold text-gray-900 mb-1">{t(m.nameKey)}</h3>
            <p className="text-sm text-gray-500 mb-3 line-clamp-2">{t(m.descriptionKey)}</p>
            <div className="flex gap-2 flex-wrap items-center justify-between">
              <div className="flex gap-2">
                <Badge variant="default">{m.type}</Badge>
                <Badge variant="info">{m.diyDifficulty}</Badge>
              </div>
              <span className="text-sm font-medium text-gray-700">${m.costUSD}</span>
            </div>
          </Card>
        ))}
      </div>
    </div>
  )
}
