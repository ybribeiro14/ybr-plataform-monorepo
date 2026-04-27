import { DM_Serif_Display, Inter } from "next/font/google";
import "./globals.css";

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

interface RootLayoutProps {
  children: React.ReactNode;
}

const RootLayout = ({ children }: RootLayoutProps) => (
  // suppressHydrationWarning: lang attribute is set by [locale]/layout via next-intl
  <html
    lang="en"
    className={`${inter.variable} ${dmSerifDisplay.variable}`}
    suppressHydrationWarning
  >
    <body className="font-sans antialiased">{children}</body>
  </html>
);

export default RootLayout;
