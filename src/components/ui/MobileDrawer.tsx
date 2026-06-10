import { useEffect } from 'react'
import { NavLink } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { motion, AnimatePresence } from 'framer-motion'
import { X } from 'lucide-react'
import { CountrySelector } from './CountrySelector'
import { LanguageSelector } from './LanguageSelector'

export interface NavItem {
  to: string
  labelKey: string
  end?: boolean
}

interface MobileDrawerProps {
  open: boolean
  onClose: () => void
  navItems: NavItem[]
}

export function MobileDrawer({ open, onClose, navItems }: MobileDrawerProps) {
  const { t } = useTranslation()

  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [open])

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Overlay */}
          <motion.div
            className="fixed inset-0 bg-black/60 z-40 md:hidden"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={onClose}
            aria-hidden="true"
          />

          {/* Drawer panel */}
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-label={t('nav.open')}
            className="fixed top-0 right-0 h-[100dvh] w-[280px] max-w-[80vw] bg-slate-900 z-50 flex flex-col shadow-2xl md:hidden border-l border-slate-700/50"
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ duration: 0.28, ease: [0.25, 0.46, 0.45, 0.94] }}
          >
            {/* Drawer header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-slate-700/50 flex-shrink-0">
              <span className="font-bold text-lg text-blue-400">💧 Clear Water</span>
              <button
                type="button"
                aria-label={t('nav.close')}
                onClick={onClose}
                className="p-1.5 rounded-md text-slate-400 hover:text-white hover:bg-slate-700 transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            {/* Nav links */}
            <nav className="flex-1 overflow-y-auto py-2">
              {navItems.map(item => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  end={item.end ?? true}
                  onClick={onClose}
                  className={({ isActive }) =>
                    `block px-5 py-3.5 text-base font-medium transition-colors border-b border-slate-800 last:border-0 ${
                      isActive
                        ? 'text-blue-400 bg-blue-400/10'
                        : 'text-slate-200 hover:text-white hover:bg-slate-800'
                    }`
                  }
                >
                  {t(item.labelKey)}
                </NavLink>
              ))}
            </nav>

            {/* Selectors at bottom */}
            <div className="border-t border-slate-700/50 px-5 py-4 flex items-center gap-3 flex-shrink-0">
              <CountrySelector />
              <LanguageSelector />
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
