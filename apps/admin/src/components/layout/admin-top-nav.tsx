'use client'

import { Bell, HelpCircle, Search } from 'lucide-react'
import { useTranslations } from 'next-intl'

const AdminTopNav = () => {
  const t = useTranslations('topNav')

  return (
    <header className="flex justify-between items-center w-full px-6 py-3 bg-[#FDFBF9] border-b border-outline-variant shadow-sm shadow-primary/5 shrink-0 z-10">
      {/* Search */}
      <div className="flex items-center flex-1">
        <div className="relative w-full max-w-md">
          <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-outline pointer-events-none">
            <Search className="h-4 w-4" />
          </span>
          <input
            type="search"
            className="block w-full pl-10 pr-3 py-2 border border-outline-variant rounded-full bg-white text-sm text-on-surface placeholder:text-outline focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
            placeholder={t('searchPlaceholder')}
            aria-label={t('searchPlaceholder')}
          />
        </div>
      </div>

      {/* Actions + user */}
      <div className="flex items-center gap-3">
        <button
          type="button"
          aria-label={t('notifications')}
          className="relative p-2 text-on-surface-variant hover:text-primary hover:bg-surface-container rounded-full transition-colors"
        >
          <Bell className="h-5 w-5" />
          <span
            className="absolute top-1.5 right-1.5 w-2 h-2 bg-primary rounded-full"
            aria-hidden="true"
          />
        </button>
        <button
          type="button"
          aria-label={t('help')}
          className="p-2 text-on-surface-variant hover:text-primary hover:bg-surface-container rounded-full transition-colors"
        >
          <HelpCircle className="h-5 w-5" />
        </button>
        <div className="h-6 w-px bg-outline-variant mx-1" aria-hidden="true" />
        <div className="flex items-center gap-3">
          <div className="text-right hidden sm:block">
            <p className="text-xs font-bold text-on-surface">Admin YBR</p>
            <p className="text-[10px] text-outline uppercase tracking-tighter">Gestor Master</p>
          </div>
          <div
            className="w-10 h-10 rounded-full bg-primary flex items-center justify-center text-on-primary text-sm font-bold shrink-0"
            aria-hidden="true"
          >
            A
          </div>
        </div>
      </div>
    </header>
  )
}

export { AdminTopNav }
