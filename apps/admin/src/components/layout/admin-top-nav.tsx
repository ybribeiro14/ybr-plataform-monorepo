"use client";

import { useAdminAuthStore } from "@/stores/auth";
import { Bell, HelpCircle, Menu, Search } from "lucide-react";
import { useTranslations } from "next-intl";

interface AdminTopNavProps {
  onMenuToggle: () => void;
  menuOpen: boolean;
}

const AdminTopNav = ({ onMenuToggle, menuOpen }: AdminTopNavProps) => {
  const t = useTranslations("topNav");
  const { user } = useAdminAuthStore();
  const isAdmin = user?.role === "admin";

  return (
    <header className="flex justify-between items-center w-full px-4 md:px-6 py-3 bg-surface-container-lowest border-b border-outline-variant shadow-card shrink-0 z-10">
      {/* Mobile hamburger + Search */}
      <div className="flex items-center flex-1 gap-3">
        <button
          type="button"
          onClick={onMenuToggle}
          aria-label="Abrir menu de navegação"
          aria-expanded={menuOpen}
          className="md:hidden p-2 -ml-1 text-on-surface-variant hover:text-on-surface hover:bg-surface-container rounded-lg transition-colors shrink-0"
        >
          <Menu className="h-5 w-5" />
        </button>
        <div className="relative w-full max-w-md">
          <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-outline pointer-events-none">
            <Search className="h-4 w-4" />
          </span>
          <input
            type="search"
            className="block w-full pl-10 pr-3 py-2 border border-outline-variant rounded-full bg-surface text-sm text-on-surface placeholder:text-outline focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
            placeholder={t("searchPlaceholder")}
            aria-label={t("searchPlaceholder")}
          />
        </div>
      </div>

      {/* Actions + user */}
      <div className="flex items-center gap-3">
        <button
          type="button"
          aria-label={t("notifications")}
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
          aria-label={t("help")}
          className="p-2 text-on-surface-variant hover:text-primary hover:bg-surface-container rounded-full transition-colors hidden md:flex"
        >
          <HelpCircle className="h-5 w-5" />
        </button>
        <div className="h-6 w-px bg-outline-variant mx-1" aria-hidden="true" />
        <div className="flex items-center gap-3">
          <div className="text-right hidden sm:block">
            <p className="text-xs font-bold text-on-surface">
              {user?.name ?? "—"}
            </p>
            <p className="text-[10px] text-outline uppercase tracking-tighter">
              {isAdmin ? "YBR Admin" : "Criador"}
            </p>
          </div>
          <div
            className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold shrink-0 ${
              isAdmin ? "bg-[#1ab5ad] text-white" : "bg-primary text-on-primary"
            }`}
            aria-hidden="true"
          >
            {user?.name?.charAt(0).toUpperCase() ?? "U"}
          </div>
        </div>
      </div>
    </header>
  );
};

export { AdminTopNav };
