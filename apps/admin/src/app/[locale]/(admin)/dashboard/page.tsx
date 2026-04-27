import { useTranslations } from "next-intl";

const AdminDashboardPage = () => {
  const t = useTranslations("dashboard");

  return (
    <div>
      {/* Page header */}
      <div className="mb-8">
        <h1 className="font-serif text-3xl text-on-surface">{t("title")}</h1>
        <p className="mt-1 text-sm text-on-surface-variant">{t("subtitle")}</p>
      </div>

      {/* Stats cards */}
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-2xl border border-outline-variant bg-white p-6 shadow-sm">
          <p className="text-sm font-medium text-on-surface-variant">
            {t("stats.totalStudents")}
          </p>
          <p className="mt-2 text-3xl font-bold text-on-surface">—</p>
        </div>

        <div className="rounded-2xl border border-outline-variant bg-white p-6 shadow-sm">
          <p className="text-sm font-medium text-on-surface-variant">
            {t("stats.totalRevenue")}
          </p>
          <p className="mt-2 text-3xl font-bold text-on-surface">—</p>
        </div>

        <div className="rounded-2xl border border-outline-variant bg-white p-6 shadow-sm">
          <p className="text-sm font-medium text-on-surface-variant">
            {t("stats.activeCourses")}
          </p>
          <p className="mt-2 text-3xl font-bold text-on-surface">—</p>
        </div>

        <div className="rounded-2xl border border-outline-variant bg-white p-6 shadow-sm">
          <p className="text-sm font-medium text-on-surface-variant">
            {t("stats.completionRate")}
          </p>
          <p className="mt-2 text-3xl font-bold text-on-surface">—</p>
        </div>
      </div>

      {/* Quick sections */}
      <div className="mt-8 grid gap-6 sm:grid-cols-2">
        <div className="rounded-2xl border border-outline-variant bg-white p-6 shadow-sm">
          <h2 className="mb-4 text-base font-semibold text-on-surface">
            {t("recentEnrollments")}
          </h2>
          <p className="text-sm text-on-surface-variant">—</p>
        </div>

        <div className="rounded-2xl border border-outline-variant bg-white p-6 shadow-sm">
          <h2 className="mb-4 text-base font-semibold text-on-surface">
            {t("topCourses")}
          </h2>
          <p className="text-sm text-on-surface-variant">—</p>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboardPage;
