'use client'

import { AppSidebar } from '@/components/layout/AppSidebar'
import { AppBottomNav } from '@/components/layout/AppBottomNav'
import { Footer } from '@/components/layout/Footer'
import { SidebarProvider, useSidebar } from '@/contexts/SidebarContext'

interface AppLayoutProps {
  children: React.ReactNode
  title?: string
  subtitle?: string
}

function AppLayoutInner({ children, title, subtitle }: AppLayoutProps) {
  const { expanded } = useSidebar()
  const contentPadding = expanded ? 'lg:pl-60' : 'lg:pl-[72px]'

  return (
    <div className="min-h-screen bg-app-bg flex flex-col">
      <AppSidebar />
      <AppBottomNav />
      <div className={`flex-1 flex flex-col pl-0 ${contentPadding} transition-[padding] duration-300 pb-20 lg:pb-0`}>
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
        <main className="max-w-7xl mx-auto px-4 md:px-6 lg:px-10 py-8 w-full flex-1">
          {children}
        </main>
        <Footer />
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
