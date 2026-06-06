import { useTranslation } from 'react-i18next'
import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/Button'

export default function Build() {
  const { t } = useTranslation()

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-2">{t('build.title')}</h1>
      <p className="text-gray-500 mb-8">{t('build.subtitle')}</p>
      <div className="flex gap-4">
        <Link to="/build/modules">
          <Button variant="secondary">{t('build.moduleLibrary')}</Button>
        </Link>
      </div>
    </div>
  )
}
