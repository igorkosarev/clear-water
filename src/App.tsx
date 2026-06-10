import { useState } from 'react'
import { Outlet, Link, NavLink } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { Menu } from 'lucide-react'
import { CountryProvider } from '@/context/CountryContext'
import { CountrySelector } from '@/components/ui/CountrySelector'
import { LanguageSelector } from '@/components/ui/LanguageSelector'
import { MobileDrawer } from '@/components/ui/MobileDrawer'
import type { NavItem } from '@/components/ui/MobileDrawer'
import { ScrollToTop } from '@/components/ScrollToTop'

const NAV_ITEMS: NavItem[] = [
  { to: '/configurator', labelKey: 'nav.configurator' },
  { to: '/learn',        labelKey: 'nav.learn',        end: false },
  { to: '/systems',      labelKey: 'nav.systems' },
  { to: '/build',        labelKey: 'nav.build' },
  { to: '/suppliers',    labelKey: 'nav.suppliers' },
]

export default function App() {
  const { t } = useTranslation()
  const [drawerOpen, setDrawerOpen] = useState(false)

  const navClass = ({ isActive }: { isActive: boolean }) =>
    `text-sm font-medium transition-colors ${
      isActive ? 'text-blue-400' : 'text-slate-300 hover:text-white'
    }`

  return (
    <CountryProvider>
      <div className="min-h-screen flex flex-col bg-slate-900">
        <header className="bg-slate-900 border-b border-slate-700/50 px-4 py-3">
          <div className="max-w-5xl mx-auto flex items-center justify-between">

            <Link to="/" className="font-bold text-lg text-blue-400 flex-shrink-0">
              💧 Clear Water
            </Link>

            {/* Desktop nav */}
            <nav className="hidden md:flex items-center gap-6">
              {NAV_ITEMS.map(item => (
                <NavLink key={item.to} to={item.to} end={item.end ?? true} className={navClass}>
                  {t(item.labelKey)}
                </NavLink>
              ))}
            </nav>

            {/* Desktop selectors */}
            <div className="hidden md:flex items-center gap-2">
              <CountrySelector />
              <LanguageSelector />
            </div>

            {/* Mobile burger */}
            <button
              type="button"
              aria-label={t('nav.open')}
              aria-expanded={drawerOpen}
              onClick={() => setDrawerOpen(true)}
              className="md:hidden p-1.5 rounded-md text-slate-300 hover:text-white hover:bg-slate-700 transition-colors"
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
          <ScrollToTop />
          <Outlet />
        </main>

        <footer className="bg-slate-950 border-t border-slate-800 px-4 py-6 text-center text-sm text-slate-500">
          {t('footer.tagline')}
        </footer>
      </div>
    </CountryProvider>
  )
}
