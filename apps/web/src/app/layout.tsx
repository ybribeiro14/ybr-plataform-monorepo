// Minimal root layout required by Next.js App Router.
// Locale-specific layout lives in app/[locale]/layout.tsx
interface RootLayoutProps {
  children: React.ReactNode;
}

const RootLayout = ({ children }: RootLayoutProps) => (
  <html>
    <body>{children}</body>
  </html>
);

export default RootLayout;
