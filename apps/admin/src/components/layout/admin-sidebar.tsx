"use client";

import {
  BarChart2,
  BookOpen,
  LayoutDashboard,
  LogOut,
  Settings,
  Users,
} from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ComponentType } from "react";

interface NavItem {
  labelKey: string;
  href: string;
  Icon: ComponentType<{ className?: string }>;
}

const AdminSidebar = () => {
  const t = useTranslations("nav");
  const locale = useLocale();
  const pathname = usePathname();

  const navItems: NavItem[] = [
    {
      labelKey: "dashboard",
      href: `/${locale}/dashboard`,
      Icon: LayoutDashboard,
    },
    { labelKey: "courses", href: `/${locale}/cursos`, Icon: BookOpen },
    { labelKey: "students", href: `/${locale}/alunos`, Icon: Users },
    { labelKey: "analytics", href: `/${locale}/analises`, Icon: BarChart2 },
    { labelKey: "settings", href: `/${locale}/configuracoes`, Icon: Settings },
  ];

  const handleLogout = () => {
    // biome-ignore lint/suspicious/noDocumentCookie: logout requires direct cookie expiry
    document.cookie =
      "ybr_access_token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
    // biome-ignore lint/suspicious/noDocumentCookie: logout requires direct cookie expiry
    document.cookie =
      "ybr_refresh_token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
    window.location.href = `/${locale}/login`;
  };

  return (
    <aside className="flex w-64 flex-shrink-0 flex-col border-r border-outline-variant bg-white">
      {/* Logo */}
      <div className="border-b border-outline-variant px-6 py-5">
        <span className="font-serif text-xl text-primary">YBR Admin</span>
      </div>

      {/* Navigation */}
      <nav
        className="flex-1 space-y-0.5 px-3 py-5"
        aria-label="Navegação principal"
      >
        {navItems.map(({ labelKey, href, Icon }) => {
          const isActive = pathname === href || pathname.startsWith(`${href}/`);
          return (
            <Link
              key={labelKey}
              href={href}
              aria-current={isActive ? "page" : undefined}
              className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors ${
                isActive
                  ? "bg-surface-container text-primary"
                  : "text-on-surface-variant hover:bg-surface-container hover:text-on-surface"
              }`}
            >
              <Icon
                className={`h-4 w-4 flex-shrink-0 ${isActive ? "text-primary" : ""}`}
              />
              {t(labelKey)}
            </Link>
          );
        })}
      </nav>

      {/* Logout */}
      <div className="border-t border-outline-variant px-3 py-4">
        <button
          type="button"
          onClick={handleLogout}
          aria-label={t("logout")}
          className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-on-surface-variant transition-colors hover:bg-surface-container hover:text-on-surface"
        >
          <LogOut className="h-4 w-4 flex-shrink-0" />
          {t("logout")}
        </button>
      </div>
    </aside>
  );
};

export { AdminSidebar };
