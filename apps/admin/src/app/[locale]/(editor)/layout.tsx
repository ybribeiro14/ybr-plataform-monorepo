import type { ReactNode } from 'react'
import { AdminSidebar } from '@/components/layout/admin-sidebar'

interface EditorLayoutProps {
  children: ReactNode
}

const EditorLayout = ({ children }: EditorLayoutProps) => (
  <div className="flex h-screen overflow-hidden bg-background">
    <AdminSidebar />
    <div className="flex flex-1 flex-col overflow-hidden">{children}</div>
  </div>
)

export default EditorLayout
