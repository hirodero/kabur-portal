'use client'

import { Suspense } from 'react'
import { AppSidebar } from '@/components/layout/AppSidebar'
import { AppBottomNav } from '@/components/layout/AppBottomNav'
import { AppNav } from '@/components/layout/AppNav'
import { SidebarProvider, useSidebar } from '@/contexts/SidebarContext'

interface AppLayoutProps {
  children: React.ReactNode
  title?: string
  subtitle?: string
  layoutMode?: 'sidebar' | 'topnav'
}

function AppLayoutInner({ children, title, subtitle, layoutMode = 'sidebar' }: AppLayoutProps) {
  const { expanded } = useSidebar()
  const contentPadding =
    layoutMode === 'topnav' ? 'lg:pl-0' : expanded ? 'lg:pl-60' : 'lg:pl-[72px]'

  return (
    <div className="min-h-screen bg-app-bg flex flex-col">
      {layoutMode === 'topnav' ? (
        <Suspense>
          <AppNav />
        </Suspense>
      ) : (
        <Suspense>
          <AppSidebar />
        </Suspense>
      )}
      <Suspense>
        <AppBottomNav />
      </Suspense>
      <div className={`flex-1 flex flex-col pl-0 ${contentPadding} transition-[padding] duration-300 pb-20 lg:pb-0 ${layoutMode === 'topnav' ? 'pt-[74px]' : ''}`}>
        {title && (
          <div className="app-header px-4 md:px-6 lg:px-10 py-7">
            <div className="max-w-6xl mx-auto">
              <h1 className="font-jakarta font-bold text-2xl text-white">{title}</h1>
              {subtitle && (
                <p className="text-white/60 text-sm mt-1 font-jakarta">{subtitle}</p>
              )}
            </div>
          </div>
        )}
        <main
          className={`max-w-7xl mx-auto px-4 md:px-6 lg:px-10 w-full flex-1 min-w-0 overflow-x-hidden ${
            layoutMode === 'topnav' ? 'py-4' : 'py-8'
          }`}
        >
          {children}
        </main>
        {/* Footer hidden in app pages — only shown on landing page */}
      </div>
    </div>
  )
}

export function AppLayout(props: AppLayoutProps) {
  return (
    <SidebarProvider>
      <AppLayoutInner {...props} />
    </SidebarProvider>
  )
}
