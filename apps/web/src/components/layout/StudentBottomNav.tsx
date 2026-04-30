"use client";

import type { LucideIcon } from "lucide-react";
import { Award, BookOpen, HelpCircle, LayoutDashboard } from "lucide-react";
import { useTranslations } from "next-intl";
import Link from "next/link";
import { usePathname } from "next/navigation";

interface StudentBottomNavProps {
  locale: string;
}

interface NavItem {
  icon: LucideIcon;
  label: string;
  href: string;
}

const StudentBottomNav = ({ locale }: StudentBottomNavProps) => {
  const pathname = usePathname();
  const t = useTranslations("nav");

  const navItems: NavItem[] = [
    {
      icon: LayoutDashboard,
      label: t("dashboard"),
      href: `/${locale}/dashboard`,
    },
    { icon: BookOpen, label: t("myCourses"), href: `/${locale}/meus-cursos` },
    {
      icon: Award,
      label: t("certificates"),
      href: `/${locale}/certificados`,
    },
    { icon: HelpCircle, label: t("support"), href: `/${locale}/suporte` },
  ];

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 md:hidden bg-surface border-t border-outline-variant z-50"
      aria-label="Navegação do aluno"
    >
      <div className="flex h-16">
        {navItems.map(({ icon: Icon, label, href }) => {
          const isActive = pathname.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              aria-current={isActive ? "page" : undefined}
              className={[
                "flex-1 flex flex-col items-center justify-center gap-1 min-h-[48px] transition-colors",
                isActive
                  ? "text-primary"
                  : "text-on-surface-variant hover:text-on-surface",
              ].join(" ")}
            >
              <div
                className={[
                  "p-1.5 rounded-xl transition-colors",
                  isActive ? "bg-primary-container" : "",
                ].join(" ")}
              >
                <Icon className="w-5 h-5" aria-hidden="true" />
              </div>
              <span className="text-[10px] font-medium leading-none">
                {label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
};

export { StudentBottomNav };
