"use client";

import { routing } from "@/i18n/routing";
import { useLocale, useTranslations } from "next-intl";
import { usePathname, useRouter } from "next/navigation";

type Locale = (typeof routing.locales)[number];

const LOCALE_LABELS: Record<Locale, string> = {
  en: "EN",
  "pt-BR": "PT",
  es: "ES",
};

const LocaleSwitcher = () => {
  const t = useTranslations("locale");
  const locale = useLocale() as Locale;
  const router = useRouter();
  const pathname = usePathname();

  const handleLocaleChange = (newLocale: Locale) => {
    // Replace the locale segment in the current pathname
    const pathnameWithoutLocale =
      pathname.replace(/^\/(en|pt-BR|es)/, "") || "/";
    router.push(`/${newLocale}${pathnameWithoutLocale}`);
  };

  return (
    <nav
      className="flex items-center gap-1 rounded-full border border-[var(--color-outline)] px-2 py-1"
      aria-label={t("switchLanguage")}
    >
      {routing.locales.map((loc) => (
        <button
          key={loc}
          type="button"
          onClick={() => handleLocaleChange(loc as Locale)}
          aria-label={t(loc)}
          aria-current={locale === loc ? "true" : undefined}
          className={[
            "rounded-full px-2 py-0.5 text-xs font-medium transition-colors",
            locale === loc
              ? "bg-[var(--color-primary)] text-white"
              : "text-[var(--color-on-surface-variant)] hover:bg-[var(--color-surface-container)]",
          ].join(" ")}
        >
          {LOCALE_LABELS[loc as Locale]}
        </button>
      ))}
    </nav>
  );
};

export { LocaleSwitcher };
