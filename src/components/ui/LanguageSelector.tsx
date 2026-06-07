import { useRef, useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { ChevronDown } from 'lucide-react'
import languages from '@/data/languages.json'

interface Language {
  code: string
  nativeName: string
}

const langList = languages as Language[]

export function LanguageSelector() {
  const { i18n } = useTranslation()
  const [open, setOpen] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)

  const current = langList.find(l => l.code === i18n.language)
    ?? langList.find(l => i18n.language.startsWith(l.code))
    ?? langList[0]

  // Close on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') setOpen(false)
  }

  const select = (code: string) => {
    i18n.changeLanguage(code)
    setOpen(false)
  }

  return (
    <div ref={containerRef} className="relative" onKeyDown={handleKeyDown}>
      <button
        type="button"
        aria-expanded={open}
        aria-haspopup="listbox"
        className="flex items-center gap-1.5 px-2 py-1 rounded-md text-sm text-slate-300 hover:text-white hover:bg-slate-700 transition-colors"
        onClick={() => setOpen(o => !o)}
      >
        <span>{current.nativeName}</span>
        <ChevronDown
          size={12}
          className={`flex-shrink-0 transition-transform ${open ? 'rotate-180' : ''}`}
        />
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-1 min-w-[120px] bg-white border border-gray-200 rounded-xl shadow-lg z-50 overflow-hidden py-1">
          <ul role="listbox">
            {langList.map(lang => (
              <li
                key={lang.code}
                role="option"
                aria-selected={lang.code === current.code}
                className={`flex items-center justify-between px-3 py-1.5 cursor-pointer text-sm transition-colors ${
                  lang.code === current.code
                    ? 'bg-blue-50 text-blue-700 font-medium'
                    : 'text-gray-700 hover:bg-gray-50'
                }`}
                onClick={() => select(lang.code)}
              >
                <span>{lang.nativeName}</span>
                {lang.code === current.code && (
                  <span className="text-blue-500 ml-2 text-xs">✓</span>
                )}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}
