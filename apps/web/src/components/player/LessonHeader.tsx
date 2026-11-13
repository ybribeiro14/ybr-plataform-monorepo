'use client'

import { GraduationCap } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import { useBranding } from '@/context/branding-context'

const LessonHeader = () => {
  const { brandName, logoUrl } = useBranding()

  return (
    <header className="flex items-center gap-3 mb-4">
      <Link
        href="/dashboard"
        className="flex items-center gap-3 group"
        aria-label={`Ir para o início — ${brandName ?? 'Plataforma'}`}
      >
        {logoUrl ? (
          <Image
            src={logoUrl}
            alt={brandName ?? 'Logo'}
            width={32}
            height={32}
            className="rounded-lg object-cover shrink-0"
          />
        ) : (
          <div
            className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center shrink-0"
            aria-hidden="true"
          >
            <GraduationCap className="text-on-primary" size={16} />
          </div>
        )}
        <span className="text-sm font-semibold text-primary group-hover:opacity-80 transition-opacity truncate max-w-[180px]">
          {brandName ?? 'Plataforma'}
        </span>
      </Link>
    </header>
  )
}

export { LessonHeader }
