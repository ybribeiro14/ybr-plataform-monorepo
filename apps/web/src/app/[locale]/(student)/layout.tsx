import { StudentBottomNav } from "@/components/layout/StudentBottomNav";
import { StudentSidebar } from "@/components/layout/StudentSidebar";
import type { ReactNode } from "react";

interface StudentLayoutProps {
  children: ReactNode;
  params: Promise<{ locale: string }>;
}

const StudentLayout = async ({ children, params }: StudentLayoutProps) => {
  const { locale } = await params;

  return (
    <div className="flex min-h-screen bg-background">
      <StudentSidebar locale={locale} />
      <div className="flex-1 md:ml-64 min-w-0 pb-16 md:pb-0">{children}</div>
      <StudentBottomNav locale={locale} />
    </div>
  );
};

export default StudentLayout;
