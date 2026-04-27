import Link from "next/link";
import type { ReactNode } from "react";

interface AuthLayoutProps {
  children: ReactNode;
}

const AuthLayout = ({ children }: AuthLayoutProps) => {
  return (
    <div
      className="min-h-screen flex flex-col font-body-md text-on-surface"
      style={{
        backgroundColor: "#fff8f6",
        backgroundImage: "radial-gradient(#fdeae2 1px, transparent 1px)",
        backgroundSize: "40px 40px",
      }}
    >
      {/* Top decorative stripe */}
      <div className="fixed top-0 left-0 w-full h-1 bg-gradient-to-r from-primary to-secondary-container opacity-50 z-10" />

      {/* Main content */}
      <main className="flex-grow flex items-center justify-center p-gutter">
        <div className="w-full max-w-[480px]">{children}</div>
      </main>

      {/* Footer */}
      <footer className="w-full mt-auto py-8 bg-stone-100 border-t border-stone-200">
        <div className="flex flex-col md:flex-row justify-between items-center px-12 max-w-[1280px] mx-auto gap-stack-md">
          <span className="text-xs uppercase tracking-widest font-sans text-stone-500">
            © 2024 YBR Platform. Excelência em Confeitaria.
          </span>
          <div className="flex gap-stack-md">
            <Link
              href="#"
              className="text-xs uppercase tracking-widest font-sans text-stone-500 hover:text-primary underline underline-offset-4 transition-all"
            >
              Termos
            </Link>
            <Link
              href="#"
              className="text-xs uppercase tracking-widest font-sans text-stone-500 hover:text-primary underline underline-offset-4 transition-all"
            >
              Privacidade
            </Link>
            <Link
              href="#"
              className="text-xs uppercase tracking-widest font-sans text-stone-500 hover:text-primary underline underline-offset-4 transition-all"
            >
              Ajuda
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default AuthLayout;
