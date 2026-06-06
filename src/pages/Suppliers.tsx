import { useTranslation } from 'react-i18next'
import { Card } from '@/components/ui/Card'
import suppliers from '@/data/suppliers.json'

export default function Suppliers() {
  const { t } = useTranslation()

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-2">{t('suppliers.title')}</h1>
      <p className="text-gray-500 mb-8">{t('suppliers.subtitle')}</p>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {suppliers.map(s => (
          <Card key={s.id} className="p-5">
            <h3 className="font-semibold text-gray-900 mb-1">{s.name}</h3>
            <p className="text-sm text-gray-500 mb-3">{s.country}</p>
            <a
              href={s.url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-blue-600 hover:underline"
            >
              {s.url}
            </a>
          </Card>
        ))}
      </div>
    </div>
  )
}
