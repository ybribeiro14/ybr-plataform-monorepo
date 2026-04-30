import Link from "next/link";
import type { ReactNode } from "react";

interface AuthLayoutProps {
  children: ReactNode;
}

const AuthLayout = ({ children }: AuthLayoutProps) => {
  const currentYear = new Date().getFullYear();

  return (
    <div className="min-h-screen flex flex-col font-body-md text-on-surface bg-background">
      {/* Main content */}
      <main className="flex-grow flex items-center justify-center p-gutter">
        <div className="w-full max-w-[480px]">{children}</div>
      </main>

      {/* Footer */}
      <footer className="w-full mt-auto py-8 bg-surface-container-low border-t border-outline-variant">
        <div className="flex flex-col md:flex-row justify-between items-center px-12 max-w-[1280px] mx-auto gap-stack-md">
          <span className="text-xs uppercase tracking-widest font-sans text-on-surface-variant">
            © {currentYear} YBR Platform
          </span>
          <div className="flex gap-stack-md">
            <Link
              href="#"
              className="text-xs uppercase tracking-widest font-sans text-on-surface-variant hover:text-primary underline underline-offset-4 transition-all"
            >
              Termos
            </Link>
            <Link
              href="#"
              className="text-xs uppercase tracking-widest font-sans text-on-surface-variant hover:text-primary underline underline-offset-4 transition-all"
            >
              Privacidade
            </Link>
            <Link
              href="#"
              className="text-xs uppercase tracking-widest font-sans text-on-surface-variant hover:text-primary underline underline-offset-4 transition-all"
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
