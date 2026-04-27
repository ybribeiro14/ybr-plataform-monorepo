import { useTranslations } from "next-intl";

const DashboardPage = () => {
  const t = useTranslations("dashboard");
  const tMyCourses = useTranslations("myCourses");
  const tNav = useTranslations("nav");

  return (
    <main className="min-h-screen bg-(--color-background)">
      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-12">
          <h1 className="font-serif text-4xl text-on-surface">
            {t("subtitle")}
          </h1>
          <p className="mt-2 text-on-surface-variant">
            {t("continueWatching")}
          </p>
        </div>

        {/* Placeholder cards */}
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {/* Meus Cursos */}
          <div className="rounded-2xl border border-outline-variant bg-(--color-surface-container-lowest) p-6 shadow-sm">
            <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-full bg-secondary-container">
              <svg
                className="h-5 w-5 text-secondary"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
                />
              </svg>
            </div>
            <h2 className="text-lg font-semibold text-on-surface">
              {tNav("myCourses")}
            </h2>
            <p className="mt-1 text-sm text-on-surface-variant">
              {t("noCourses")}
            </p>
          </div>

          {/* Progresso */}
          <div className="rounded-2xl border border-outline-variant bg-(--color-surface-container-lowest) p-6 shadow-sm">
            <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-full bg-secondary-container">
              <svg
                className="h-5 w-5 text-secondary"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                />
              </svg>
            </div>
            <h2 className="text-lg font-semibold text-on-surface">
              {tMyCourses("title")}
            </h2>
            <p className="mt-1 text-sm text-on-surface-variant">
              {tMyCourses("noCourses")}
            </p>
          </div>

          {/* Certificados */}
          <div className="rounded-2xl border border-outline-variant bg-(--color-surface-container-lowest) p-6 shadow-sm">
            <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-full bg-secondary-container">
              <svg
                className="h-5 w-5 text-secondary"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z"
                />
              </svg>
            </div>
            <h2 className="text-lg font-semibold text-on-surface">
              {t("certificatesTitle")}
            </h2>
            <p className="mt-1 text-sm text-on-surface-variant">
              {t("noCertificates")}
            </p>
          </div>
        </div>
      </div>
    </main>
  );
};

export default DashboardPage;
