"use client";

import {
  BookOpen,
  CreditCard,
  HelpCircle,
  LayoutDashboard,
  LogOut,
  Settings,
  Users,
  X,
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

interface AdminSidebarProps {
  mobileOpen?: boolean;
  onClose?: () => void;
}

const AdminSidebar = ({ mobileOpen = false, onClose }: AdminSidebarProps) => {
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
    { labelKey: "financeiro", href: `/${locale}/financeiro`, Icon: CreditCard },
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

  const navContent = (
    <>
      {/* Logo */}
      <div className="flex items-center gap-3 px-2 mb-8">
        <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center text-on-primary shrink-0">
          <BookOpen className="h-5 w-5" />
        </div>
        <div>
          <h1 className="font-semibold text-lg leading-none text-primary">
            YBR Platform
          </h1>
          <span className="text-[10px] uppercase tracking-widest text-outline">
            Ateliê de Luxo
          </span>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-1" aria-label="Navegação principal">
        {navItems.map(({ labelKey, href, Icon }) => {
          const isActive = pathname === href || pathname.startsWith(`${href}/`);
          return (
            <Link
              key={labelKey}
              href={href}
              aria-current={isActive ? "page" : undefined}
              {...(onClose ? { onClick: onClose } : {})}
              className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 ${
                isActive
                  ? "bg-primary-container text-primary font-bold"
                  : "text-on-surface-variant hover:bg-surface-container hover:text-primary hover:translate-x-1"
              }`}
            >
              <Icon
                className={`h-5 w-5 shrink-0 ${isActive ? "text-primary" : ""}`}
              />
              <span className="font-sans text-sm uppercase tracking-wide">
                {t(labelKey)}
              </span>
            </Link>
          );
        })}
      </nav>

      {/* Footer links */}
      <div className="pt-4 border-t border-outline-variant space-y-1">
        <Link
          href={`/${locale}/suporte`}
          {...(onClose ? { onClick: onClose } : {})}
          className="flex items-center gap-3 px-4 py-3 rounded-lg text-on-surface-variant hover:bg-surface-container hover:text-primary transition-all duration-200 hover:translate-x-1"
        >
          <HelpCircle className="h-5 w-5 shrink-0" />
          <span className="font-sans text-sm uppercase tracking-wide">
            {t("suporte")}
          </span>
        </Link>
        <button
          type="button"
          onClick={handleLogout}
          aria-label={t("logout")}
          className="flex w-full items-center gap-3 px-4 py-3 rounded-lg text-on-surface-variant hover:bg-surface-container hover:text-error transition-all duration-200 hover:translate-x-1"
        >
          <LogOut className="h-5 w-5 shrink-0" />
          <span className="font-sans text-sm uppercase tracking-wide">
            {t("logout")}
          </span>
        </button>
      </div>
    </>
  );

  return (
    <>
      {/* Desktop sidebar */}
      <aside className="hidden md:flex flex-col h-screen w-64 border-r border-outline-variant bg-surface-container-low shrink-0 py-6 px-4 space-y-2">
        {navContent}
      </aside>

      {/* Mobile backdrop */}
      <div
        className={`fixed inset-0 bg-on-surface/40 z-40 md:hidden transition-opacity duration-300 ${
          mobileOpen
            ? "opacity-100 pointer-events-auto"
            : "opacity-0 pointer-events-none"
        }`}
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Mobile drawer */}
      <aside
        className={`fixed top-0 bottom-0 left-0 w-72 bg-surface z-50 flex flex-col py-6 px-4 space-y-2 shadow-modal md:hidden transition-transform duration-300 ease-out ${
          mobileOpen ? "translate-x-0" : "-translate-x-full"
        }`}
        aria-label="Menu de navegação"
        aria-hidden={!mobileOpen}
      >
        <button
          type="button"
          onClick={onClose}
          className="self-end p-2 -mr-2 mb-2 text-on-surface-variant hover:text-on-surface hover:bg-surface-container rounded-lg transition-colors"
          aria-label="Fechar menu"
        >
          <X className="h-5 w-5" />
        </button>
        {navContent}
      </aside>
    </>
  );
};

export { AdminSidebar };
