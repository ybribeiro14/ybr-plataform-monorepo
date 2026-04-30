import { BarChart2, Plus, TrendingUp, UserPlus, Users } from "lucide-react";
import { useTranslations } from "next-intl";
import Link from "next/link";

const AdminDashboardPage = () => {
  const t = useTranslations("dashboard");

  return (
    <div className="space-y-8">
      {/* Page header */}
      <section>
        <h2 className="font-display-md text-display-md font-bold text-on-surface">
          {t("greeting")}
        </h2>
        <p className="font-body-md text-body-md text-on-surface-variant mt-1">
          {t("welcomeBack")}
        </p>
      </section>

      {/* KPI Cards */}
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-surface p-6 rounded-xl border border-outline-variant shadow-card hover:shadow-card-hover transition-shadow">
          <div className="flex justify-between items-start mb-4">
            <div className="p-2 bg-primary-muted rounded-lg text-primary">
              <Users className="h-5 w-5" />
            </div>
            <span className="text-xs font-bold text-success bg-success-container px-2 py-1 rounded-full">
              +12%
            </span>
          </div>
          <p className="font-label-md text-label-md text-on-surface-variant uppercase tracking-wider">
            {t("stats.totalStudents")}
          </p>
          <p className="text-display-md font-black text-on-surface mt-2 tracking-tight leading-none">
            —
          </p>
        </div>

        <div className="bg-primary-container p-6 rounded-xl border border-primary/20 shadow-card hover:shadow-card-hover transition-shadow">
          <div className="flex justify-between items-start mb-4">
            <div className="p-2 bg-primary-muted rounded-lg text-primary">
              <TrendingUp className="h-5 w-5" />
            </div>
            <span className="text-xs font-bold text-success bg-success-container px-2 py-1 rounded-full">
              +8.4%
            </span>
          </div>
          <p className="font-label-md text-label-md text-on-surface-variant uppercase tracking-wider">
            {t("stats.monthlyRevenue")}
          </p>
          <p className="text-display-md font-black text-primary mt-2 tracking-tight leading-none">
            —
          </p>
        </div>

        <div className="bg-surface p-6 rounded-xl border border-outline-variant shadow-card hover:shadow-card-hover transition-shadow">
          <div className="flex justify-between items-start mb-4">
            <div className="p-2 bg-surface-container rounded-lg text-on-surface-variant">
              <BarChart2 className="h-5 w-5" />
            </div>
            <span className="text-xs font-bold text-on-surface-variant bg-surface-container px-2 py-1 rounded-full">
              {t("stats.stable")}
            </span>
          </div>
          <p className="font-label-md text-label-md text-on-surface-variant uppercase tracking-wider">
            {t("stats.completionRate")}
          </p>
          <p className="text-display-md font-black text-on-surface mt-2 tracking-tight leading-none">
            —
          </p>
        </div>

        <div className="bg-surface p-6 rounded-xl border border-outline-variant shadow-card hover:shadow-card-hover transition-shadow">
          <div className="flex justify-between items-start mb-4">
            <div className="p-2 bg-primary-muted rounded-lg text-primary">
              <UserPlus className="h-5 w-5" />
            </div>
            <span className="text-xs font-bold text-success bg-success-container px-2 py-1 rounded-full">
              {t("stats.new")}
            </span>
          </div>
          <p className="font-label-md text-label-md text-on-surface-variant uppercase tracking-wider">
            {t("stats.newEnrollments")}
          </p>
          <p className="text-display-md font-black text-on-surface mt-2 tracking-tight leading-none">
            —
          </p>
        </div>
      </section>

      {/* Chart + Recent Activity */}
      <section className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Revenue Chart */}
        <div className="lg:col-span-2 bg-surface rounded-xl border border-outline-variant p-6 shadow-card">
          <div className="flex justify-between items-center mb-8">
            <h3 className="text-title-lg font-bold text-on-surface">
              {t("revenueChart")}
            </h3>
            <div className="flex items-center gap-2">
              <div
                className="w-3 h-3 rounded-full bg-primary"
                aria-hidden="true"
              />
              <span className="text-xs text-on-surface-variant">
                {t("grossRevenue")}
              </span>
            </div>
          </div>
          <div className="h-64 relative w-full flex items-end justify-between px-2">
            <div
              className="absolute inset-0 flex flex-col justify-between pt-4 pb-8 pointer-events-none"
              aria-hidden="true"
            >
              <div className="border-t border-outline-variant/40 w-full" />
              <div className="border-t border-outline-variant/40 w-full" />
              <div className="border-t border-outline-variant/40 w-full" />
              <div className="border-t border-outline-variant/40 w-full" />
            </div>
            <svg
              className="absolute inset-x-0 bottom-8 h-48 w-full overflow-visible"
              preserveAspectRatio="none"
              viewBox="0 0 100 100"
              aria-hidden="true"
            >
              <path
                d="M0,80 Q10,75 20,60 T40,65 T60,40 T80,30 T100,10"
                fill="none"
                stroke="var(--color-primary)"
                strokeWidth="2"
                vectorEffect="non-scaling-stroke"
              />
              <path
                d="M0,80 Q10,75 20,60 T40,65 T60,40 T80,30 T100,10 V100 H0 Z"
                fill="var(--color-primary-container)"
              />
            </svg>
            <span className="text-[10px] text-on-surface-variant font-bold">
              01 OUT
            </span>
            <span className="text-[10px] text-on-surface-variant font-bold">
              08 OUT
            </span>
            <span className="text-[10px] text-on-surface-variant font-bold">
              15 OUT
            </span>
            <span className="text-[10px] text-on-surface-variant font-bold">
              22 OUT
            </span>
            <span className="text-[10px] text-on-surface-variant font-bold">
              30 OUT
            </span>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-surface rounded-xl border border-outline-variant p-6 shadow-card">
          <h3 className="text-title-lg font-bold text-on-surface mb-6">
            {t("recentActivity")}
          </h3>
          <div className="space-y-6">
            <div className="flex gap-4">
              <div className="w-10 h-10 rounded-full bg-surface-container flex items-center justify-center shrink-0">
                <Users className="h-4 w-4 text-on-surface-variant" />
              </div>
              <div>
                <p className="text-sm font-bold text-on-surface">
                  {t("activity.enrollment")}
                </p>
                <p className="text-xs text-on-surface-variant">
                  {t("activity.enrollmentDetail")}
                </p>
                <p className="text-[10px] text-outline mt-1 uppercase tracking-tighter">
                  {t("activity.timeAgo2min")}
                </p>
              </div>
            </div>
            <div className="flex gap-4">
              <div className="w-10 h-10 rounded-full bg-primary-muted flex items-center justify-center shrink-0">
                <TrendingUp className="h-4 w-4 text-primary" />
              </div>
              <div>
                <p className="text-sm font-bold text-on-surface">
                  {t("activity.payment")}
                </p>
                <p className="text-xs text-on-surface-variant">
                  {t("activity.paymentDetail")}
                </p>
                <p className="text-[10px] text-outline mt-1 uppercase tracking-tighter">
                  {t("activity.timeAgo45min")}
                </p>
              </div>
            </div>
            <div className="flex gap-4">
              <div className="w-10 h-10 rounded-full bg-surface-container flex items-center justify-center shrink-0">
                <BarChart2 className="h-4 w-4 text-on-surface-variant" />
              </div>
              <div>
                <p className="text-sm font-bold text-on-surface">
                  {t("activity.certificate")}
                </p>
                <p className="text-xs text-on-surface-variant">
                  {t("activity.certificateDetail")}
                </p>
                <p className="text-[10px] text-outline mt-1 uppercase tracking-tighter">
                  {t("activity.timeAgo2h")}
                </p>
              </div>
            </div>
          </div>
          <button
            type="button"
            className="w-full mt-8 py-2 text-primary font-bold text-sm border border-primary/20 rounded-full hover:bg-primary/5 transition-all"
          >
            {t("viewAll")}
          </button>
        </div>
      </section>

      {/* Course Summary Table */}
      <section className="bg-surface rounded-xl border border-outline-variant shadow-card overflow-hidden">
        <div className="p-6 border-b border-outline-variant flex justify-between items-center">
          <h3 className="text-title-lg font-bold text-on-surface">
            {t("courseSummary")}
          </h3>
          <button
            type="button"
            className="flex items-center text-xs font-bold text-on-surface-variant hover:text-primary transition-colors"
          >
            {t("filterByStatus")} ↓
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-surface-container/50 text-[10px] font-bold text-on-surface-variant uppercase tracking-widest">
                <th className="px-6 py-4">{t("table.course")}</th>
                <th className="px-6 py-4">{t("table.activeStudents")}</th>
                <th className="px-6 py-4">{t("table.status")}</th>
                <th className="px-6 py-4">{t("table.revenue")}</th>
                <th className="px-6 py-4 text-right">{t("table.actions")}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-variant/30">
              <tr>
                <td
                  colSpan={5}
                  className="px-6 py-10 text-center text-sm text-on-surface-variant"
                >
                  —
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      {/* FAB */}
      <Link
        href="#"
        className="fixed bottom-8 right-8 w-14 h-14 bg-primary text-on-primary rounded-full shadow-lg shadow-primary/30 flex items-center justify-center hover:scale-105 active:scale-95 transition-all group"
        aria-label={t("newCourse")}
      >
        <Plus className="h-6 w-6" />
        <span className="absolute right-16 bg-on-surface text-surface px-3 py-1 rounded text-xs whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity">
          {t("newCourse")}
        </span>
      </Link>
    </div>
  );
};

export default AdminDashboardPage;
