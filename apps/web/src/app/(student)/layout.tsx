'use client'

import type { ReactNode } from 'react'
import { AuthInitializer } from '@/components/auth/auth-initializer'
import { StudentBottomNav } from '@/components/layout/StudentBottomNav'
import { StudentSidebar } from '@/components/layout/StudentSidebar'

interface StudentLayoutProps {
  children: ReactNode
}

const StudentLayout = ({ children }: StudentLayoutProps) => {
  return (
    <>
      <AuthInitializer />
      <div className="flex min-h-screen bg-background">
        <StudentSidebar />
        <div className="flex-1 md:ml-64 min-w-0 pb-16 md:pb-0">{children}</div>
        <StudentBottomNav />
      </div>
    </>
  )
}

export default StudentLayout
