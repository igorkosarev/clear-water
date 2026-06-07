import { useState } from 'react'
import { Outlet, Link, NavLink } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { Menu } from 'lucide-react'
import { CountryProvider } from '@/context/CountryContext'
import { CountrySelector } from '@/components/ui/CountrySelector'
import { LanguageSelector } from '@/components/ui/LanguageSelector'
import { MobileDrawer } from '@/components/ui/MobileDrawer'
import type { NavItem } from '@/components/ui/MobileDrawer'

const NAV_ITEMS: NavItem[] = [
  { to: '/configurator',       labelKey: 'nav.configurator' },
  { to: '/learn/contaminants', labelKey: 'nav.contaminants' },
  { to: '/learn/methods',      labelKey: 'nav.methods' },
  { to: '/systems',            labelKey: 'nav.systems' },
  { to: '/build',              labelKey: 'nav.build' },
  { to: '/suppliers',          labelKey: 'nav.suppliers' },
]

export default function App() {
  const { t } = useTranslation()
  const [drawerOpen, setDrawerOpen] = useState(false)

  const navClass = ({ isActive }: { isActive: boolean }) =>
    `text-sm font-medium transition-colors ${isActive ? 'text-blue-600' : 'text-gray-600 hover:text-gray-900'}`

  return (
    <CountryProvider>
      <div className="min-h-screen flex flex-col bg-white">
        <header className="border-b border-gray-200 px-4 py-3">
          <div className="max-w-5xl mx-auto flex items-center justify-between">

            <Link to="/" className="font-bold text-lg text-blue-700 flex-shrink-0">
              💧 Clear Water
            </Link>

            {/* Desktop nav — hidden on mobile */}
            <nav className="hidden md:flex items-center gap-6">
              {NAV_ITEMS.map(item => (
                <NavLink key={item.to} to={item.to} className={navClass}>
                  {t(item.labelKey)}
                </NavLink>
              ))}
            </nav>

            {/* Desktop selectors — hidden on mobile */}
            <div className="hidden md:flex items-center gap-2">
              <CountrySelector />
              <LanguageSelector />
            </div>

            {/* Mobile burger button — hidden on desktop */}
            <button
              type="button"
              aria-label={t('nav.open')}
              aria-expanded={drawerOpen}
              onClick={() => setDrawerOpen(true)}
              className="md:hidden p-1.5 rounded-md text-gray-600 hover:text-gray-900 hover:bg-gray-100 transition-colors"
            >
              <Menu size={22} />
            </button>
          </div>
        </header>

        <MobileDrawer
          open={drawerOpen}
          onClose={() => setDrawerOpen(false)}
          navItems={NAV_ITEMS}
        />

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
