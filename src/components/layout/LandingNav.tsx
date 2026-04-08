'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'

export function LandingNav() {
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 60)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-4 sm:px-8 py-4 sm:py-5 transition-all duration-300 ${
        scrolled
          ? 'bg-white/90 backdrop-blur-md border-b'
          : 'bg-transparent'
      }`}
    >
      <Link
        href="/detail"
        className={`font-jakarta font-bold text-xl tracking-tight transition-colors duration-300 ${
          scrolled ? 'text-ink' : 'text-white'
        }`}
      >
        #Kabur<span className="text-primary">Portal</span>
      </Link>

      <Link
        href="/login"
        className={`text-sm px-5 py-2 rounded-pill border transition-all duration-200 ${
          scrolled
            ? 'border-ink/20 text-ink hover:bg-primary hover:text-white hover:border-primary'
            : 'border-white/40 text-white hover:bg-white hover:text-ink'
        }`}
      >
        Masuk →
      </Link>
    </nav>
  )
}
