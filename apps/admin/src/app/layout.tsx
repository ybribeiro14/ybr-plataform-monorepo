import { routing } from "@/i18n/routing";
import type { Metadata } from "next";
import { NextIntlClientProvider } from "next-intl";
import { getMessages } from "next-intl/server";
import { Inter } from "next/font/google";
import { cookies } from "next/headers";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
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
    process.env.NEXT_PUBLIC_ADMIN_URL ?? "https://admin.ybr-platform.com",
  ),
};

interface RootLayoutProps {
  children: React.ReactNode;
}

const SUPPORTED_LOCALES = routing.locales as readonly string[];

const RootLayout = async ({ children }: RootLayoutProps) => {
  const cookieStore = await cookies();
  const cookieLocale = cookieStore.get("ybr_locale")?.value;
  const locale =
    cookieLocale && SUPPORTED_LOCALES.includes(cookieLocale)
      ? cookieLocale
      : routing.defaultLocale;

  const messages = await getMessages();

  return (
    <html lang={locale} className={inter.variable} suppressHydrationWarning>
      <body className="font-sans antialiased">
        <NextIntlClientProvider messages={messages}>
          {children}
        </NextIntlClientProvider>
      </body>
    </html>
  );
};

export default RootLayout;
