"use client";

import type { LucideIcon } from "lucide-react";
import { Award, BookOpen, HelpCircle, LayoutDashboard } from "lucide-react";
import { useTranslations } from "next-intl";
import Link from "next/link";
import { usePathname } from "next/navigation";

interface StudentSidebarProps {
  locale: string;
}

interface NavItem {
  icon: LucideIcon;
  label: string;
  href: string;
}

const StudentSidebar = ({ locale }: StudentSidebarProps) => {
  const pathname = usePathname();
  const t = useTranslations("nav");

  const navItems: NavItem[] = [
    {
      icon: LayoutDashboard,
      label: t("dashboard"),
      href: `/${locale}/dashboard`,
    },
    { icon: BookOpen, label: t("myCourses"), href: `/${locale}/meus-cursos` },
    { icon: Award, label: t("certificates"), href: `/${locale}/certificados` },
    { icon: HelpCircle, label: t("support"), href: `/${locale}/suporte` },
  ];

  return (
    <aside
      className="hidden md:flex md:fixed left-0 top-0 bottom-0 w-64 border-r border-outline-variant bg-surface-container-lowest flex-col h-screen py-6 px-4 z-50"
      aria-label="Navegação do aluno"
    >
      <div className="mb-10 px-2">
        <h1 className="text-lg text-primary font-bold leading-tight">
          Ateliê YBR
        </h1>
        <p className="text-xs text-on-surface-variant uppercase tracking-widest mt-1">
          Alta Confeitaria
        </p>
      </div>

      <nav className="flex-1 space-y-1" aria-label="Main navigation">
        {navItems.map(({ icon: Icon, label, href }) => {
          const isActive = pathname.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              className={[
                "flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200",
                isActive
                  ? "text-primary bg-primary-container font-semibold"
                  : "text-on-surface-variant hover:bg-surface-container hover:translate-x-1",
              ].join(" ")}
              aria-current={isActive ? "page" : undefined}
            >
              <Icon className="w-5 h-5 shrink-0" aria-hidden="true" />
              {label}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
};

export { StudentSidebar };
