'use client'

import {
  BookOpen,
  CreditCard,
  GraduationCap,
  HelpCircle,
  ImageIcon,
  LayoutDashboard,
  LogOut,
  User,
  Users,
  X,
} from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useTranslations } from 'next-intl'
import { type ComponentType, useEffect, useState } from 'react'
import { adminSettingsApi } from '@/lib/api/settings'
import { useAdminAuthStore } from '@/stores/auth'

interface NavItem {
  labelKey: string
  href: string
  Icon: ComponentType<{ className?: string }>
}

interface AdminSidebarProps {
  mobileOpen?: boolean
  onClose?: () => void
}

// ── Admin sidebar — dark navy + teal identity ──────────────────────────────
const AdminNavContent = ({
  navItems,
  pathname,
  t,
  user,
  onClose,
  onLogout,
}: {
  navItems: NavItem[]
  pathname: string
  t: ReturnType<typeof useTranslations>
  user: { name: string } | null
  onClose?: (() => void) | undefined
  onLogout: () => void
}) => (
  <>
    {/* Logo */}
    <div className="px-4 mb-6">
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 rounded-lg overflow-hidden shrink-0 bg-[#0a1c2b] flex items-center justify-center">
          <Image src="/logo.png" alt="YBR" width={32} height={32} className="object-contain" />
        </div>
        <div className="min-w-0">
          <p className="text-[13px] font-semibold text-[#e2e8f0] leading-none truncate">
            YBR Platform
          </p>
          <span className="inline-flex items-center mt-1 px-1.5 py-0.5 rounded text-[9px] font-semibold tracking-widest uppercase bg-[#1ab5ad]/15 text-[#1ab5ad]">
            Admin
          </span>
        </div>
      </div>
    </div>

    {/* Nav label */}
    <p className="px-4 mb-2 text-[10px] font-semibold tracking-[0.12em] uppercase text-[#3d5a72]">
      Navegação
    </p>

    {/* Navigation */}
    <nav className="flex-1 px-2 space-y-0.5" aria-label="Navegação principal">
      {navItems.map(({ labelKey, href, Icon }) => {
        const isActive = pathname === href || pathname.startsWith(`${href}/`)
        return (
          <Link
            key={labelKey}
            href={href}
            aria-current={isActive ? 'page' : undefined}
            {...(onClose ? { onClick: onClose } : {})}
            className={`group flex items-center gap-3 px-3 py-2.5 rounded-md text-[13px] font-medium transition-colors duration-150 min-h-[40px] ${
              isActive
                ? 'bg-[#1ab5ad]/12 text-[#1ab5ad]'
                : 'text-[#7a8fa6] hover:text-[#c8d6e0] hover:bg-white/5'
            }`}
          >
            <Icon
              className={`h-4 w-4 shrink-0 transition-colors ${
                isActive ? 'text-[#1ab5ad]' : 'text-[#4a6070] group-hover:text-[#7a8fa6]'
              }`}
            />
            <span>{t(labelKey)}</span>
          </Link>
        )
      })}
    </nav>

    {/* User + Logout */}
    <div className="px-2 pt-3 mt-2 border-t border-[#132d42]">
      {user && (
        <div className="flex items-center gap-3 px-3 py-2.5 mb-1 rounded-md">
          <div className="w-7 h-7 rounded-full bg-[#1ab5ad]/20 flex items-center justify-center shrink-0">
            <span className="text-[11px] font-bold text-[#1ab5ad]">
              {user.name.charAt(0).toUpperCase()}
            </span>
          </div>
          <div className="min-w-0">
            <p className="text-[12px] font-medium text-[#c8d6e0] truncate leading-none">
              {user.name}
            </p>
            <p className="text-[10px] text-[#3d5a72] mt-0.5">Admin</p>
          </div>
        </div>
      )}
      <button
        type="button"
        onClick={onLogout}
        aria-label={t('logout')}
        className="flex w-full items-center gap-3 px-3 py-2.5 rounded-md text-[13px] font-medium text-[#4a6070] hover:text-red-400 hover:bg-red-500/8 transition-colors duration-150 min-h-[40px]"
      >
        <LogOut className="h-4 w-4 shrink-0" />
        <span>{t('logout')}</span>
      </button>
    </div>
  </>
)

// ── Creator sidebar — warm neutral ─────────────────────────────────────────
const CreatorNavContent = ({
  navItems,
  pathname,
  t,
  brandName,
  logoUrl,
  onClose,
  onLogout,
}: {
  navItems: NavItem[]
  pathname: string
  t: ReturnType<typeof useTranslations>
  brandName: string | null
  logoUrl: string | null
  onClose?: (() => void) | undefined
  onLogout: () => void
}) => (
  <>
    {/* Logo */}
    <div className="flex items-center gap-3 px-4 mb-6">
      {logoUrl ? (
        <Image
          src={logoUrl}
          alt={brandName ?? 'Logo'}
          width={36}
          height={36}
          className="rounded-full object-cover shrink-0"
        />
      ) : (
        <div className="w-9 h-9 rounded-full bg-primary flex items-center justify-center text-on-primary shrink-0">
          <GraduationCap className="h-4 w-4" />
        </div>
      )}
      <div>
        <p className="text-[13px] font-semibold text-on-surface leading-none truncate max-w-[140px]">
          {brandName ?? 'Plataforma'}
        </p>
        <span className="text-[10px] text-on-surface-variant mt-0.5 block">Criador</span>
      </div>
    </div>

    <p className="px-4 mb-2 text-[10px] font-semibold tracking-[0.12em] uppercase text-on-surface-variant/50">
      Menu
    </p>

    <nav className="flex-1 px-2 space-y-0.5" aria-label="Navegação principal">
      {navItems.map(({ labelKey, href, Icon }) => {
        const isActive = pathname === href || pathname.startsWith(`${href}/`)
        return (
          <Link
            key={labelKey}
            href={href}
            aria-current={isActive ? 'page' : undefined}
            {...(onClose ? { onClick: onClose } : {})}
            className={`group flex items-center gap-3 px-3 py-2.5 rounded-md text-[13px] font-medium transition-colors duration-150 min-h-[40px] ${
              isActive
                ? 'bg-primary/10 text-primary'
                : 'text-on-surface-variant hover:text-on-surface hover:bg-surface-container'
            }`}
          >
            <Icon
              className={`h-4 w-4 shrink-0 ${
                isActive
                  ? 'text-primary'
                  : 'text-on-surface-variant/60 group-hover:text-on-surface-variant'
              }`}
            />
            <span>{t(labelKey)}</span>
          </Link>
        )
      })}
    </nav>

    <div className="px-2 pt-3 mt-2 border-t border-outline-variant space-y-0.5">
      <Link
        href="/support"
        {...(onClose ? { onClick: onClose } : {})}
        className="flex items-center gap-3 px-3 py-2.5 rounded-md text-[13px] font-medium text-on-surface-variant hover:text-on-surface hover:bg-surface-container transition-colors duration-150 min-h-[40px]"
      >
        <HelpCircle className="h-4 w-4 shrink-0 text-on-surface-variant/60" />
        <span>{t('suporte')}</span>
      </Link>
      <button
        type="button"
        onClick={onLogout}
        aria-label={t('logout')}
        className="flex w-full items-center gap-3 px-3 py-2.5 rounded-md text-[13px] font-medium text-on-surface-variant hover:text-error hover:bg-error-container transition-colors duration-150 min-h-[40px]"
      >
        <LogOut className="h-4 w-4 shrink-0" />
        <span>{t('logout')}</span>
      </button>
    </div>
  </>
)

const AdminSidebar = ({ mobileOpen = false, onClose }: AdminSidebarProps) => {
  const t = useTranslations('nav')
  const pathname = usePathname()
  const { user, logout, accessToken } = useAdminAuthStore()

  const [brandName, setBrandName] = useState<string | null>(null)
  const [logoUrl, setLogoUrl] = useState<string | null>(null)

  const isAdmin = user?.role === 'admin'

  useEffect(() => {
    if (!accessToken || isAdmin) return
    adminSettingsApi
      .getBranding(accessToken)
      .then(data => {
        setBrandName(data.brandName ?? null)
        setLogoUrl(data.logoUrl ?? null)
      })
      .catch(() => {
        // Non-critical — sidebar works without branding
      })
  }, [accessToken, isAdmin])

  const adminNavItems: NavItem[] = [
    {
      labelKey: 'dashboard',
      href: '/dashboard',
      Icon: LayoutDashboard,
    },
    {
      labelKey: 'creators',
      href: '/ybr-admin/creators',
      Icon: Users,
    },
  ]

  const creatorNavItems: NavItem[] = [
    {
      labelKey: 'dashboard',
      href: '/dashboard',
      Icon: LayoutDashboard,
    },
    { labelKey: 'courses', href: '/courses', Icon: BookOpen },
    { labelKey: 'students', href: '/students', Icon: Users },
    { labelKey: 'financeiro', href: '/finance', Icon: CreditCard },
    { labelKey: 'profile', href: '/settings/profile', Icon: User },
    { labelKey: 'branding', href: '/settings/branding', Icon: ImageIcon },
  ]

  const navItems = isAdmin ? adminNavItems : creatorNavItems

  const handleLogout = () => {
    logout()
    window.location.href = '/login'
  }

  if (isAdmin) {
    const sharedProps = { navItems, pathname, t, user, onLogout: handleLogout }

    return (
      <>
        {/* Desktop — dark navy */}
        <aside className="hidden md:flex flex-col h-screen w-60 border-r border-[#0f2436] bg-[#0d2233] shrink-0 py-5">
          <AdminNavContent {...sharedProps} />
        </aside>

        {/* Mobile backdrop */}
        <div
          className={`fixed inset-0 bg-black/60 z-40 md:hidden transition-opacity duration-200 ${
            mobileOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
          }`}
          onClick={onClose}
          aria-hidden="true"
        />

        {/* Mobile drawer */}
        <aside
          className={`fixed top-0 bottom-0 left-0 w-64 bg-[#0d2233] z-50 flex flex-col py-5 shadow-2xl md:hidden transition-transform duration-250 ease-out ${
            mobileOpen ? 'translate-x-0' : '-translate-x-full'
          }`}
          aria-label="Menu de navegação"
          aria-hidden={!mobileOpen}
        >
          <button
            type="button"
            onClick={onClose}
            className="self-end mr-3 mb-4 p-1.5 text-[#4a6070] hover:text-[#94a3b8] hover:bg-white/5 rounded-md transition-colors"
            aria-label="Fechar menu"
          >
            <X className="h-4 w-4" />
          </button>
          <AdminNavContent {...sharedProps} onClose={onClose} />
        </aside>
      </>
    )
  }

  // ── Creator ────────────────────────────────────────────────────────────────
  const creatorProps = {
    navItems,
    pathname,
    t,
    brandName,
    logoUrl,
    onLogout: handleLogout,
  }

  return (
    <>
      {/* Desktop */}
      <aside className="hidden md:flex flex-col h-screen w-60 border-r border-outline-variant bg-surface-container-low shrink-0 py-5">
        <CreatorNavContent {...creatorProps} />
      </aside>

      {/* Mobile backdrop */}
      <div
        className={`fixed inset-0 bg-on-surface/40 z-40 md:hidden transition-opacity duration-200 ${
          mobileOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Mobile drawer */}
      <aside
        className={`fixed top-0 bottom-0 left-0 w-64 bg-surface z-50 flex flex-col py-5 shadow-modal md:hidden transition-transform duration-250 ease-out ${
          mobileOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
        aria-label="Menu de navegação"
        aria-hidden={!mobileOpen}
      >
        <button
          type="button"
          onClick={onClose}
          className="self-end mr-3 mb-4 p-1.5 text-on-surface-variant hover:text-on-surface hover:bg-surface-container rounded-md transition-colors"
          aria-label="Fechar menu"
        >
          <X className="h-4 w-4" />
        </button>
        <CreatorNavContent {...creatorProps} onClose={onClose} />
      </aside>
    </>
  )
}

export { AdminSidebar }
