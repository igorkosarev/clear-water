import { useParams, Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'

export default function AssemblyGuide() {
  const { id } = useParams<{ id: string }>()
  const { t } = useTranslation()

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <Link to="/build" className="text-sm text-blue-600 hover:underline mb-6 block">← {t('build.back')}</Link>
      <h1 className="text-3xl font-bold text-gray-900 mb-4">{t('build.guide.title')}</h1>
      <p className="text-gray-500">{t('build.guide.comingSoon')} ({id})</p>
    </div>
  )
}
