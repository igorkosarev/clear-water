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
            className="fixed inset-0 bg-black/40 z-40 md:hidden"
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
            className="fixed top-0 right-0 h-[100dvh] w-[280px] max-w-[80vw] bg-white z-50 flex flex-col shadow-2xl md:hidden"
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ duration: 0.28, ease: [0.25, 0.46, 0.45, 0.94] }}
          >
            {/* Drawer header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 flex-shrink-0">
              <span className="font-bold text-lg text-blue-700">💧 Clear Water</span>
              <button
                type="button"
                aria-label={t('nav.close')}
                onClick={onClose}
                className="p-1.5 rounded-md text-gray-500 hover:text-gray-900 hover:bg-gray-100 transition-colors"
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
                  onClick={onClose}
                  className={({ isActive }) =>
                    `block px-5 py-3.5 text-base font-medium transition-colors border-b border-gray-50 last:border-0 ${
                      isActive
                        ? 'text-blue-600 bg-blue-50'
                        : 'text-gray-700 hover:text-gray-900 hover:bg-gray-50'
                    }`
                  }
                >
                  {t(item.labelKey)}
                </NavLink>
              ))}
            </nav>

            {/* Selectors at bottom */}
            <div className="border-t border-gray-100 px-5 py-4 flex items-center gap-3 flex-shrink-0">
              <CountrySelector />
              <LanguageSelector />
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
