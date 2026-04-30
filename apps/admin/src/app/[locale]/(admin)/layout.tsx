"use client";

import { AdminSidebar } from "@/components/layout/admin-sidebar";
import { AdminTopNav } from "@/components/layout/admin-top-nav";
import { Toaster } from "@/components/ui/toaster";
import { ToastProvider } from "@/lib/hooks/use-toast";
import type { ReactNode } from "react";
import { useState } from "react";

interface AdminLayoutProps {
  children: ReactNode;
}

const AdminLayout = ({ children }: AdminLayoutProps) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <ToastProvider>
      <div className="flex h-screen overflow-hidden bg-background">
        <AdminSidebar
          mobileOpen={mobileMenuOpen}
          onClose={() => setMobileMenuOpen(false)}
        />
        <div className="flex flex-1 flex-col overflow-hidden min-w-0">
          <AdminTopNav
            onMenuToggle={() => setMobileMenuOpen((v) => !v)}
            menuOpen={mobileMenuOpen}
          />
          <main className="flex-1 overflow-y-auto p-6 lg:p-8">{children}</main>
        </div>
      </div>
      <Toaster />
    </ToastProvider>
  );
};

export default AdminLayout;
