import { Outlet, Link, NavLink } from 'react-router-dom'
import { useTranslation } from 'react-i18next'

export default function App() {
  const { t, i18n } = useTranslation()

  const navClass = ({ isActive }: { isActive: boolean }) =>
    `text-sm font-medium transition-colors ${isActive ? 'text-blue-600' : 'text-gray-600 hover:text-gray-900'}`

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <header className="border-b border-gray-200 px-4 py-3">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <Link to="/" className="font-bold text-lg text-blue-700">💧 Clear Water</Link>
          <nav className="flex items-center gap-6">
            <NavLink to="/configurator" className={navClass}>{t('nav.configurator')}</NavLink>
            <NavLink to="/learn" className={navClass}>{t('nav.learn')}</NavLink>
            <NavLink to="/systems" className={navClass}>{t('nav.systems')}</NavLink>
            <NavLink to="/build" className={navClass}>{t('nav.build')}</NavLink>
            <NavLink to="/suppliers" className={navClass}>{t('nav.suppliers')}</NavLink>
          </nav>
          <button
            className="text-xs text-gray-500 hover:text-gray-700"
            onClick={() => i18n.changeLanguage(i18n.language === 'en' ? 'ru' : 'en')}
          >
            {i18n.language === 'en' ? 'RU' : 'EN'}
          </button>
        </div>
      </header>

      <main className="flex-1">
        <Outlet />
      </main>

      <footer className="border-t border-gray-100 px-4 py-6 text-center text-sm text-gray-400">
        {t('footer.tagline')}
      </footer>
    </div>
  )
}
