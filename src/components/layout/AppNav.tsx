'use client'

import Link from 'next/link'
import { Notification01Icon, PreferenceHorizontalIcon, Search01Icon, UserCircleIcon } from 'hugeicons-react'
import { Button } from '@heroui/react'

export function AppNav() {
  function handleToggleFilters() {
    window.dispatchEvent(new CustomEvent('jobs:toggle-filter-row'))
  }

  return (
    <header className="fixed top-0 left-0 right-0 z-40 w-full bg-white border-b border-[#E8E6E1]" style={{ height: '74px' }}>
      <nav className="h-full max-w-6xl mx-auto px-4 md:px-6 lg:px-10 flex items-center justify-between gap-4">
        {/* Left: Logo + divider + breadcrumb */}
        <div className="flex items-center gap-3 shrink-0">
          <Link href="/jobs" className="font-jakarta font-bold text-[17px] text-ink tracking-tight">
            #kabur<span className="text-primary">portal</span>
          </Link>
          <span className="w-px h-4 bg-ink/10" />
          <Link href="/jobs" className="hidden sm:block text-sm text-ink-muted hover:text-ink transition-colors">
            Lowongan
          </Link>
        </div>

        {/* Center: Search + filter actions (hidden on mobile) */}
        <div className="hidden md:flex flex-1 max-w-[540px] items-center gap-3">
          <div className="relative w-full">
            <input
              type="text"
              placeholder="Job Position"
              className="w-full bg-white rounded-pill pl-6 pr-24 py-3 text-sm text-ink placeholder:text-ink-muted border border-[#B8CCEF] focus:border-[#8CB1EE] focus:outline-none transition-colors"
            />
            <button
              type="button"
              aria-label="Cari"
              className="absolute right-2 top-1/2 -translate-y-1/2 inline-flex items-center justify-center w-10 h-10 rounded-full bg-primary text-white hover:bg-primary-dark transition-colors"
            >
              <Search01Icon size={18} strokeWidth={2.2} />
            </button>
          </div>
          <button
            type="button"
            aria-label="Filter"
            onClick={handleToggleFilters}
            className="inline-flex items-center justify-center w-12 h-11 rounded-xl border border-[#BFC7D4] bg-white text-ink hover:bg-ink/5 transition-colors"
          >
            <PreferenceHorizontalIcon size={20} strokeWidth={2.2} />
          </button>
        </div>

        {/* Right: Icon buttons + avatar */}
        <div className="flex items-center gap-1">
          <Button
            isIconOnly
            size="sm"
            variant="light"
            aria-label="Notifikasi"
            className="min-w-10 w-10 h-10 text-ink-muted hover:text-ink"
          >
            <Notification01Icon size={18} />
          </Button>
          <Button
            isIconOnly
            size="sm"
            variant="light"
            aria-label="Profil"
            className="min-w-10 w-10 h-10 text-ink-muted hover:text-ink"
          >
            <UserCircleIcon size={18} />
          </Button>
          <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-white font-jakarta font-bold text-[10px] shrink-0 ml-1">
            BS
          </div>
        </div>
      </nav>
    </header>
  )
}
