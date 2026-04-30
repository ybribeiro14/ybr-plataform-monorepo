"use client";

import { AdminSidebar } from "@/components/layout/admin-sidebar";
import { Menu } from "lucide-react";
import type { ReactNode } from "react";
import { useState } from "react";

interface EditorLayoutProps {
  children: ReactNode;
}

const EditorLayout = ({ children }: EditorLayoutProps) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      <AdminSidebar
        mobileOpen={mobileMenuOpen}
        onClose={() => setMobileMenuOpen(false)}
      />
      <div className="flex flex-1 flex-col overflow-hidden min-w-0">
        {/* Mobile bar — editor pages have their own desktop header */}
        <div className="flex items-center h-12 px-4 border-b border-outline-variant bg-surface-container-lowest md:hidden shrink-0">
          <button
            type="button"
            onClick={() => setMobileMenuOpen((v) => !v)}
            className="p-2 -ml-2 text-on-surface-variant hover:text-on-surface hover:bg-surface-container rounded-lg transition-colors"
            aria-label="Abrir menu de navegação"
            aria-expanded={mobileMenuOpen}
          >
            <Menu className="h-5 w-5" />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
};

export default EditorLayout;
