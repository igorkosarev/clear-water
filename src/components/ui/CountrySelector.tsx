import { useRef, useState, useEffect, useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { Globe, ChevronDown, Search, X } from 'lucide-react'
import { useCountry } from '@/context/CountryContext'
import countriesData from '@/data/countries.json'

interface Country {
  code: string
  name: string
}

const countries = countriesData as Country[]

export function flagEmoji(code: string): string {
  return code
    .toUpperCase()
    .split('')
    .map(c => String.fromCodePoint(0x1f1e6 + c.charCodeAt(0) - 65))
    .join('')
}

export function CountrySelector() {
  const { t } = useTranslation()
  const { country, setCountry } = useCountry()
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState('')
  const containerRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const listRef = useRef<HTMLUListElement>(null)
  const [focusedIndex, setFocusedIndex] = useState(0)

  const selected = useMemo(
    () => countries.find(c => c.code === country) ?? null,
    [country]
  )

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return countries
    return countries.filter(
      c => c.name.toLowerCase().includes(q) || c.code.toLowerCase().includes(q)
    )
  }, [query])

  // Reset focused index when filter changes
  useEffect(() => { setFocusedIndex(0) }, [filtered])

  // Focus input when dropdown opens
  useEffect(() => {
    if (open) {
      setTimeout(() => inputRef.current?.focus(), 0)
    } else {
      setQuery('')
    }
  }, [open])

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
    if (!open) {
      if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setOpen(true) }
      return
    }
    if (e.key === 'Escape') { setOpen(false); return }
    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setFocusedIndex(i => Math.min(i + 1, filtered.length - 1))
    }
    if (e.key === 'ArrowUp') {
      e.preventDefault()
      setFocusedIndex(i => Math.max(i - 1, 0))
    }
    if (e.key === 'Enter' && filtered[focusedIndex]) {
      e.preventDefault()
      setCountry(filtered[focusedIndex].code)
      setOpen(false)
    }
  }

  // Scroll focused item into view
  useEffect(() => {
    const list = listRef.current
    if (!list) return
    const item = list.children[focusedIndex] as HTMLElement | undefined
    item?.scrollIntoView({ block: 'nearest' })
  }, [focusedIndex])

  return (
    <div ref={containerRef} className="relative" onKeyDown={handleKeyDown}>
      <button
        type="button"
        aria-expanded={open}
        aria-haspopup="listbox"
        className="flex items-center gap-1.5 px-2 py-1 rounded-md text-sm text-slate-300 hover:text-white hover:bg-slate-700 transition-colors"
        onClick={() => setOpen(o => !o)}
      >
        {selected ? (
          <span className="text-base leading-none">{flagEmoji(selected.code)}</span>
        ) : (
          <Globe size={14} className="text-gray-400" />
        )}
        <span className="hidden sm:inline max-w-[90px] truncate">
          {selected ? selected.name : t('country.select')}
        </span>
        <ChevronDown size={12} className={`flex-shrink-0 transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-1 w-64 bg-white border border-gray-200 rounded-xl shadow-lg z-50 overflow-hidden">
          {/* Search */}
          <div className="flex items-center gap-2 px-3 py-2 border-b border-gray-100">
            <Search size={14} className="text-gray-400 flex-shrink-0" />
            <input
              ref={inputRef}
              type="text"
              className="flex-1 text-sm outline-none placeholder:text-gray-400"
              placeholder={t('country.search')}
              value={query}
              onChange={e => setQuery(e.target.value)}
            />
            {query && (
              <button
                type="button"
                onClick={() => setQuery('')}
                className="text-gray-400 hover:text-gray-600"
              >
                <X size={12} />
              </button>
            )}
          </div>

          {/* Clear selection */}
          {selected && (
            <button
              type="button"
              className="w-full text-left px-3 py-2 text-xs text-gray-400 hover:bg-gray-50 border-b border-gray-100"
              onClick={() => { setCountry(null); setOpen(false) }}
            >
              {t('country.clear')}
            </button>
          )}

          {/* List */}
          <ul
            ref={listRef}
            role="listbox"
            className="max-h-60 overflow-y-auto py-1"
          >
            {filtered.length === 0 ? (
              <li className="px-3 py-2 text-sm text-gray-400">{t('common.notFound')}</li>
            ) : (
              filtered.map((c, i) => (
                <li
                  key={c.code}
                  role="option"
                  aria-selected={c.code === country}
                  className={`flex items-center gap-2.5 px-3 py-1.5 cursor-pointer text-sm transition-colors ${
                    i === focusedIndex ? 'bg-blue-50 text-blue-700' : 'text-gray-700 hover:bg-gray-50'
                  } ${c.code === country ? 'font-medium' : ''}`}
                  onClick={() => { setCountry(c.code); setOpen(false) }}
                  onMouseEnter={() => setFocusedIndex(i)}
                >
                  <span className="text-base leading-none w-5 text-center">{flagEmoji(c.code)}</span>
                  <span className="truncate">{c.name}</span>
                  {c.code === country && (
                    <span className="ml-auto text-blue-500 text-xs">✓</span>
                  )}
                </li>
              ))
            )}
          </ul>
        </div>
      )}
    </div>
  )
}
