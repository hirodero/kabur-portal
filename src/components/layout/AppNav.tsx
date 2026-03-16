'use client'

import Link from 'next/link'
import { Notification01Icon, UserCircleIcon } from 'hugeicons-react'
import { Button } from '@heroui/react'

export function AppNav() {
  return (
    <header className="sticky top-0 z-40 w-full bg-white border-b border-[#E8E6E1]" style={{ height: '56px' }}>
      <nav className="h-full max-w-6xl mx-auto px-4 md:px-6 lg:px-10 flex items-center justify-between gap-4">
        {/* Left: Logo + divider + breadcrumb */}
        <div className="flex items-center gap-3 shrink-0">
          <Link href="/" className="font-jakarta font-bold text-[15px] text-ink tracking-tight">
            #Kabur<span className="text-primary">Portal</span>
          </Link>
          <span className="w-px h-4 bg-ink/10" />
          <Link
            href="/home"
            className="hidden sm:block text-xs text-ink-muted hover:text-ink transition-colors"
          >
            Lowongan
          </Link>
        </div>

        {/* Center: Search bar (hidden on mobile) */}
        <div className="hidden md:flex flex-1 max-w-sm">
          <div className="relative w-full">
            <input
              type="text"
              placeholder="Cari lowongan, negara, sektor..."
              className="w-full bg-app-bg rounded-pill px-4 py-1.5 text-xs text-ink placeholder:text-ink-faint border border-transparent focus:border-border focus:outline-none transition-colors"
            />
          </div>
        </div>

        {/* Right: Icon buttons + avatar */}
        <div className="flex items-center gap-1">
          <Button
            isIconOnly
            size="sm"
            variant="light"
            aria-label="Notifikasi"
            className="min-w-9 w-9 h-9 text-ink-muted hover:text-ink"
          >
            <Notification01Icon size={18} />
          </Button>
          <Button
            isIconOnly
            size="sm"
            variant="light"
            aria-label="Profil"
            className="min-w-9 w-9 h-9 text-ink-muted hover:text-ink"
          >
            <UserCircleIcon size={18} />
          </Button>
          <div className="w-7 h-7 rounded-full bg-primary flex items-center justify-center text-white font-jakarta font-bold text-[10px] shrink-0 ml-1">
            BS
          </div>
        </div>
      </nav>
    </header>
  )
}
