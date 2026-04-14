'use client'

import Link from 'next/link'
import Image from 'next/image'
import { useRef, useState, useEffect } from 'react'
import { Notification01Icon, PreferenceHorizontalIcon, Search01Icon, UserCircleIcon, Logout01Icon } from 'hugeicons-react'
import { Button } from '@heroui/react'
import { useSession, signOut } from 'next-auth/react'
import { useRouter } from 'next/navigation'

function UserAvatarMenu() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function onClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', onClickOutside)
    return () => document.removeEventListener('mousedown', onClickOutside)
  }, [])

  function handleClick() {
    if (status === 'unauthenticated') {
      router.push('/login')
      return
    }
    setOpen((v) => !v)
  }

  const user = session?.user
  const picture = user?.image

  const avatarEl = picture ? (
    <Image
      src={picture}
      alt={user?.name ?? 'Profile'}
      width={32}
      height={32}
      className="w-8 h-8 rounded-full object-cover"
      referrerPolicy="no-referrer"
    />
  ) : status === 'authenticated' ? (
    <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-white font-jakarta font-bold text-[10px]">
      {user?.name ? user.name.split(' ').map((n) => n[0]).slice(0, 2).join('').toUpperCase() : '?'}
    </div>
  ) : (
    <UserCircleIcon size={32} className="text-ink-muted" strokeWidth={1.8} />
  )

  return (
    <div ref={ref} className="relative ml-1 shrink-0">
      <button
        type="button"
        aria-label="Profil"
        onClick={handleClick}
        className="flex items-center justify-center rounded-full hover:opacity-80 transition-opacity focus:outline-none"
      >
        {avatarEl}
      </button>

      {open && status === 'authenticated' && (
        <div className="absolute right-0 top-[calc(100%+8px)] w-52 rounded-xl border border-black/10 bg-white shadow-[0_8px_24px_rgba(0,0,0,0.10)] z-50 overflow-hidden">
          <div className="px-4 py-3 border-b border-black/8">
            <p className="text-xs font-semibold text-ink truncate">{user?.name}</p>
            <p className="text-[11px] text-ink-muted truncate mt-0.5">{user?.email}</p>
          </div>
          <button
            type="button"
            onClick={() => { setOpen(false); signOut({ callbackUrl: '/login' }) }}
            className="w-full flex items-center gap-2.5 px-4 py-3 text-sm text-red-600 hover:bg-red-50 transition-colors"
          >
            <Logout01Icon size={16} strokeWidth={2} />
            Keluar
          </button>
        </div>
      )}
    </div>
  )
}

export function AppNav() {
  function handleToggleFilters() {
    window.dispatchEvent(new CustomEvent('jobs:toggle-filter-row'))
  }

  return (
    <header className="fixed top-0 left-0 right-0 z-40 w-full bg-white border-b border-[#E8E6E1]" style={{ height: '74px' }}>
      <nav className="h-full max-w-7xl mx-auto px-4 md:px-6 lg:px-10 flex items-center justify-between gap-4">
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
          <UserAvatarMenu />
        </div>
      </nav>
    </header>
  )
}
