import { AdminSidebar } from "@/components/layout/admin-sidebar";
import type { ReactNode } from "react";

interface AdminLayoutProps {
  children: ReactNode;
}

const AdminLayout = ({ children }: AdminLayoutProps) => (
  <div className="flex h-screen overflow-hidden bg-background">
    <AdminSidebar />
    <div className="flex flex-1 flex-col overflow-hidden">
      <main className="flex-1 overflow-y-auto p-6 lg:p-8">{children}</main>
    </div>
  </div>
);

export default AdminLayout;
