import { createContext, useContext, useEffect, useState } from 'react'
import type { ReactNode } from 'react'
import timezoneCountry from '@/data/timezone-country.json'

const STORAGE_KEY = 'cw_country'

interface CountryContextValue {
  country: string | null
  setCountry: (code: string | null) => void
}

const CountryContext = createContext<CountryContextValue>({
  country: null,
  setCountry: () => {},
})

export function useCountry() {
  return useContext(CountryContext)
}

function detectFromTimezone(): string | null {
  try {
    const tz = Intl.DateTimeFormat().resolvedOptions().timeZone
    return (timezoneCountry as Record<string, string>)[tz] ?? null
  } catch {
    return null
  }
}

export function CountryProvider({ children }: { children: ReactNode }) {
  const [country, setCountryState] = useState<string | null>(() => {
    try {
      return localStorage.getItem(STORAGE_KEY) || null
    } catch {
      return null
    }
  })

  useEffect(() => {
    // Already resolved from localStorage — skip network detection
    if (country !== null) return

    let cancelled = false

    const detect = async () => {
      try {
        const res = await fetch('/geo')
        if (!res.ok) throw new Error('geo failed')
        const data = await res.json() as { country: string | null }
        if (cancelled) return
        const resolved = data.country ?? detectFromTimezone()
        if (resolved) {
          setCountryState(resolved)
          localStorage.setItem(STORAGE_KEY, resolved)
        }
      } catch {
        if (cancelled) return
        const resolved = detectFromTimezone()
        if (resolved) {
          setCountryState(resolved)
          localStorage.setItem(STORAGE_KEY, resolved)
        }
      }
    }

    detect()
    return () => { cancelled = true }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const setCountry = (code: string | null) => {
    setCountryState(code)
    try {
      if (code) {
        localStorage.setItem(STORAGE_KEY, code)
      } else {
        localStorage.removeItem(STORAGE_KEY)
      }
    } catch {}
  }

  return (
    <CountryContext.Provider value={{ country, setCountry }}>
      {children}
    </CountryContext.Provider>
  )
}
