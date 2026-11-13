'use client'

import type { LucideIcon } from 'lucide-react'
import {
  Award,
  BookOpen,
  GraduationCap,
  HelpCircle,
  LayoutDashboard,
  LogOut,
  UserCircle,
} from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useTranslations } from 'next-intl'
import { useBranding } from '@/context/branding-context'
import { useAuthStore } from '@/stores/auth'

interface NavItem {
  icon: LucideIcon
  label: string
  href: string
}

const StudentSidebar = () => {
  const pathname = usePathname()
  const t = useTranslations('nav')
  const router = useRouter()
  const { logout } = useAuthStore()
  const { brandName, logoUrl } = useBranding()

  const navItems: NavItem[] = [
    {
      icon: LayoutDashboard,
      label: t('dashboard'),
      href: '/dashboard',
    },
    { icon: BookOpen, label: t('myCourses'), href: '/my-courses' },
    { icon: Award, label: t('certificates'), href: '/certificates' },
    { icon: UserCircle, label: t('profile'), href: '/profile' },
    { icon: HelpCircle, label: t('support'), href: '/support' },
  ]

  const handleLogout = () => {
    logout()
    router.push('/login')
  }

  return (
    <aside
      className="hidden md:flex md:fixed left-0 top-0 bottom-0 w-64 border-r border-outline-variant bg-surface-container-lowest flex-col h-screen py-6 px-4 z-50"
      aria-label="Navegação do aluno"
    >
      <div className="mb-10 px-2 flex items-center gap-3">
        {logoUrl ? (
          <Image
            src={logoUrl}
            alt={brandName ?? 'Logo'}
            width={36}
            height={36}
            className="rounded-full object-cover shrink-0"
          />
        ) : (
          <div className="w-9 h-9 rounded-full bg-primary flex items-center justify-center shrink-0">
            <GraduationCap className="text-on-primary" size={18} aria-hidden="true" />
          </div>
        )}
        <h1 className="text-base text-primary font-bold leading-tight truncate">
          {brandName ?? 'Plataforma'}
        </h1>
      </div>

      <nav className="flex-1 space-y-1" aria-label="Main navigation">
        {navItems.map(({ icon: Icon, label, href }) => {
          const isActive = pathname.startsWith(href)
          return (
            <Link
              key={href}
              href={href}
              className={[
                'flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200',
                isActive
                  ? 'text-primary bg-primary-container font-semibold'
                  : 'text-on-surface-variant hover:bg-surface-container hover:translate-x-1',
              ].join(' ')}
              aria-current={isActive ? 'page' : undefined}
            >
              <Icon className="w-5 h-5 shrink-0" aria-hidden="true" />
              {label}
            </Link>
          )
        })}
      </nav>

      <button
        type="button"
        onClick={handleLogout}
        className="flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium text-on-surface-variant hover:bg-surface-container hover:text-error transition-all duration-200 w-full mt-2"
        aria-label={t('logout')}
      >
        <LogOut className="w-5 h-5 shrink-0" aria-hidden="true" />
        {t('logout')}
      </button>
    </aside>
  )
}

export { StudentSidebar }
