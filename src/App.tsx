import { Outlet, Link, NavLink } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { CountryProvider } from '@/context/CountryContext'
import { CountrySelector } from '@/components/ui/CountrySelector'
import { LanguageSelector } from '@/components/ui/LanguageSelector'

export default function App() {
  const { t } = useTranslation()

  const navClass = ({ isActive }: { isActive: boolean }) =>
    `text-sm font-medium transition-colors ${isActive ? 'text-blue-600' : 'text-gray-600 hover:text-gray-900'}`

  return (
    <CountryProvider>
      <div className="min-h-screen flex flex-col bg-white">
        <header className="border-b border-gray-200 px-4 py-3">
          <div className="max-w-5xl mx-auto flex items-center justify-between">
            <Link to="/" className="font-bold text-lg text-blue-700">💧 Clear Water</Link>
            <nav className="flex items-center gap-6">
              <NavLink to="/configurator" className={navClass}>{t('nav.configurator')}</NavLink>
              <NavLink to="/learn/contaminants" className={navClass}>{t('nav.contaminants')}</NavLink>
              <NavLink to="/learn/methods" className={navClass}>{t('nav.methods')}</NavLink>
              <NavLink to="/systems" className={navClass}>{t('nav.systems')}</NavLink>
              <NavLink to="/build" className={navClass}>{t('nav.build')}</NavLink>
              <NavLink to="/suppliers" className={navClass}>{t('nav.suppliers')}</NavLink>
            </nav>
            <div className="flex items-center gap-2">
              <CountrySelector />
              <LanguageSelector />
            </div>
          </div>
        </header>

        <main className="flex-1">
          <Outlet />
        </main>

        <footer className="border-t border-gray-100 px-4 py-6 text-center text-sm text-gray-400">
          {t('footer.tagline')}
        </footer>
      </div>
    </CountryProvider>
  )
}
