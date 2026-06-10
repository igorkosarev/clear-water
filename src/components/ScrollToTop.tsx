import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'

export function ScrollToTop() {
  const { pathname, state } = useLocation()
  useEffect(() => {
    if (!(state as { scrollTo?: string } | null)?.scrollTo) {
      window.scrollTo(0, 0)
    }
  }, [pathname])
  return null
}
