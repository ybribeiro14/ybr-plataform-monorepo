import { routing } from "@/i18n/routing";
import type { Metadata } from "next";
import { NextIntlClientProvider } from "next-intl";
import { getMessages } from "next-intl/server";
import { DM_Serif_Display, Inter } from "next/font/google";
import { notFound } from "next/navigation";
import "../globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const dmSerifDisplay = DM_Serif_Display({
  weight: ["400"],
  subsets: ["latin"],
  variable: "--font-dm-serif",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "Creator Panel | YBR Platform",
    template: "%s | YBR Admin",
  },
  description: "YBR Platform creator dashboard",
  robots: { index: false, follow: false },
  metadataBase: new URL(
    process.env["NEXT_PUBLIC_ADMIN_URL"] ?? "https://admin.ybr-platform.com",
  ),
};

interface LocaleLayoutProps {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}

const LocaleLayout = async ({ children, params }: LocaleLayoutProps) => {
  const { locale } = await params;

  if (!routing.locales.includes(locale as (typeof routing.locales)[number])) {
    notFound();
  }

  const messages = await getMessages();

  return (
    <html
      lang={locale}
      className={`${inter.variable} ${dmSerifDisplay.variable}`}
    >
      <body className="font-sans antialiased">
        <NextIntlClientProvider messages={messages}>
          {children}
        </NextIntlClientProvider>
      </body>
    </html>
  );
};

export default LocaleLayout;
