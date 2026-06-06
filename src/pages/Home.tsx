import { useTranslation } from 'react-i18next'
import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/Button'

export default function Home() {
  const { t } = useTranslation()

  return (
    <main className="flex-1 flex flex-col items-center justify-center px-4 py-16 text-center">
      <h1 className="text-5xl font-bold text-gray-900 mb-4">{t('home.hero.title')}</h1>
      <p className="text-xl text-gray-500 max-w-2xl mb-8">{t('home.hero.subtitle')}</p>
      <Link to="/configurator">
        <Button size="lg">{t('home.hero.cta')}</Button>
      </Link>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mt-20 max-w-3xl w-full">
        {(['configurator', 'learn', 'build'] as const).map(section => (
          <Link key={section} to={`/${section}`} className="group">
            <div className="p-6 rounded-xl border border-gray-200 hover:border-blue-300 hover:shadow-md transition-all text-left">
              <h2 className="font-semibold text-gray-900 mb-2">{t(`home.features.${section}.title`)}</h2>
              <p className="text-sm text-gray-500">{t(`home.features.${section}.description`)}</p>
            </div>
          </Link>
        ))}
      </div>
    </main>
  )
}
