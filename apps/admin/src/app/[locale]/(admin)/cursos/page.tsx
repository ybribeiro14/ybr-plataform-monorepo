"use client";

import { coursesApi } from "@/lib/api/courses";
import type { CourseWithCounts } from "@/lib/types/courses";
import { ConfirmDialog } from "@ybr/ui";
import { BookOpen, Eye, Pencil, Plus, Star } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import Link from "next/link";
import { useEffect, useState } from "react";

type FilterTab = "all" | "published" | "draft" | "archived";

interface PendingAction {
  type: "archive" | "publish";
  courseId: string;
  courseTitle?: string;
}

const formatPrice = (cents: number, currency: string): string =>
  new Intl.NumberFormat("pt-BR", { style: "currency", currency }).format(
    cents / 100,
  );

const CoursesPage = () => {
  const t = useTranslations("courses");
  const tc = useTranslations("common");
  const locale = useLocale();

  const [courses, setCourses] = useState<CourseWithCounts[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<FilterTab>("all");
  const [pendingAction, setPendingAction] = useState<PendingAction | null>(
    null,
  );

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);
    coursesApi
      .listCourses()
      .then((data) => {
        if (!cancelled) setCourses(data);
      })
      .catch((err) => {
        if (!cancelled)
          setError(err instanceof Error ? err.message : tc("error"));
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [tc]);

  const handleArchive = (courseId: string, courseTitle: string) => {
    setPendingAction({ type: "archive", courseId, courseTitle });
  };

  const handlePublish = (courseId: string) => {
    setPendingAction({ type: "publish", courseId });
  };

  const handleDialogCancel = () => setPendingAction(null);

  const handleDialogConfirm = async () => {
    if (!pendingAction) return;
    const { type, courseId } = pendingAction;
    setPendingAction(null);
    setActionLoading(courseId);
    try {
      if (type === "archive") {
        await coursesApi.deleteCourse(courseId);
        setCourses((prev) => prev.filter((c) => c.id !== courseId));
      } else {
        const updated = await coursesApi.publishCourse(courseId);
        setCourses((prev) =>
          prev.map((c) => (c.id === courseId ? { ...c, ...updated } : c)),
        );
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : tc("error"));
    } finally {
      setActionLoading(null);
    }
  };

  const tabs: { key: FilterTab; label: string }[] = [
    { key: "all", label: t("filterAll") },
    { key: "published", label: t("filterPublished") },
    { key: "draft", label: t("filterDrafts") },
    { key: "archived", label: t("filterArchived") },
  ];

  const filteredCourses =
    activeTab === "all"
      ? courses
      : courses.filter((c) => c.status === activeTab);

  const publishedCount = courses.filter((c) => c.status === "published").length;

  return (
    <div>
      {/* Breadcrumb + header */}
      <header className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-4">
        <div>
          <nav className="flex items-center gap-2 text-xs text-on-surface-variant uppercase tracking-widest mb-2">
            <span>Dashboard</span>
            <span aria-hidden="true">›</span>
            <span className="text-primary">{t("title")}</span>
          </nav>
          <h2 className="font-display-md text-display-md text-on-surface">
            {t("title")}
          </h2>
        </div>
        <Link
          href={`/${locale}/cursos/novo`}
          className="flex items-center gap-2 h-12 px-8 rounded-full bg-primary text-on-primary font-button text-button shadow-lg shadow-primary/20 hover:bg-primary-container transition-all w-fit"
        >
          <Plus className="h-5 w-5" />
          {t("createCourse")}
        </Link>
      </header>

      {/* Stats bar */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-surface-container-low border border-outline-variant p-4 rounded-xl">
          <p className="text-xs text-on-surface-variant uppercase tracking-wider mb-1">
            {t("stats.totalStudents")}
          </p>
          <p className="font-title-lg text-title-lg text-primary">—</p>
        </div>
        <div className="bg-surface-container-low border border-outline-variant p-4 rounded-xl">
          <p className="text-xs text-on-surface-variant uppercase tracking-wider mb-1">
            {t("stats.monthlyRevenue")}
          </p>
          <p className="font-title-lg text-title-lg text-primary">—</p>
        </div>
        <div className="bg-surface-container-low border border-outline-variant p-4 rounded-xl">
          <p className="text-xs text-on-surface-variant uppercase tracking-wider mb-1">
            {t("stats.completionRate")}
          </p>
          <p className="font-title-lg text-title-lg text-primary">—</p>
        </div>
        <div className="bg-surface-container-low border border-outline-variant p-4 rounded-xl">
          <p className="text-xs text-on-surface-variant uppercase tracking-wider mb-1">
            {t("stats.activeCourses")}
          </p>
          <p className="font-title-lg text-title-lg text-primary">
            {publishedCount}
          </p>
        </div>
      </div>

      {/* Filter tabs + sort */}
      <div className="flex items-center justify-between mb-6 bg-white p-4 rounded-xl border border-outline-variant shadow-sm">
        <div className="flex items-center gap-4">
          {tabs.map((tab) => (
            <button
              key={tab.key}
              type="button"
              onClick={() => setActiveTab(tab.key)}
              className={`text-sm pb-1 transition-colors ${
                activeTab === tab.key
                  ? "font-semibold text-primary border-b-2 border-primary"
                  : "text-on-surface-variant hover:text-on-surface"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-2 text-on-surface-variant">
          <span className="text-xs uppercase tracking-tighter">
            {t("sortBy")}
          </span>
          <select className="border-none text-sm font-semibold text-on-surface bg-transparent focus:ring-0 cursor-pointer">
            <option>{t("sortNewest")}</option>
            <option>{t("sortBestSelling")}</option>
            <option>{t("sortAlphabetical")}</option>
          </select>
        </div>
      </div>

      {/* Loading state */}
      {loading && (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="rounded-xl border border-outline-variant overflow-hidden"
            >
              <div className="h-48 animate-pulse bg-surface-container" />
              <div className="p-6 space-y-3">
                <div className="h-5 w-3/4 animate-pulse rounded bg-surface-container" />
                <div className="h-4 w-full animate-pulse rounded bg-surface-container" />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Error state */}
      {!loading && error && (
        <div className="rounded-xl border border-error bg-red-50 p-6 text-sm text-error">
          {error}
        </div>
      )}

      {/* Empty state */}
      {!loading && !error && filteredCourses.length === 0 && (
        <div className="flex flex-col items-center justify-center rounded-xl border border-outline-variant bg-white py-16 text-center">
          <BookOpen className="mb-4 h-10 w-10 text-outline" />
          <p className="font-serif text-lg text-on-surface">{t("noCourses")}</p>
          <Link
            href={`/${locale}/cursos/novo`}
            className="mt-4 flex items-center gap-2 rounded-full bg-primary px-6 h-10 text-sm font-semibold text-on-primary hover:bg-primary-container"
          >
            <Plus className="h-4 w-4" />
            {t("createCourse")}
          </Link>
        </div>
      )}

      {/* Card grid */}
      {!loading && !error && filteredCourses.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
          {filteredCourses.map((course) => {
            const isPublished = course.status === "published";
            const isDraft = course.status === "draft";

            return (
              <div
                key={course.id}
                className="group bg-white rounded-xl border border-outline-variant hover:shadow-xl hover:shadow-primary/5 transition-all duration-300 overflow-hidden flex flex-col"
              >
                {/* Thumbnail */}
                <div className="relative h-48 overflow-hidden bg-surface-container">
                  {course.thumbnailUrl ? (
                    // biome-ignore lint/performance/noImgElement: thumbnail from S3, acceptable in admin
                    <img
                      src={course.thumbnailUrl}
                      alt={course.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <BookOpen className="h-10 w-10 text-outline" />
                    </div>
                  )}
                  {/* Status badge */}
                  <div className="absolute top-4 left-4">
                    {isPublished && (
                      <span className="bg-primary-container/90 backdrop-blur-sm text-white text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-widest">
                        {t("status.published")}
                      </span>
                    )}
                    {isDraft && (
                      <span className="bg-secondary-container/90 backdrop-blur-sm text-on-secondary-container text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-widest">
                        {t("status.draft")}
                      </span>
                    )}
                    {course.status === "archived" && (
                      <span className="bg-outline/80 backdrop-blur-sm text-white text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-widest">
                        {t("status.archived")}
                      </span>
                    )}
                  </div>
                  {/* Rating badge for published */}
                  {isPublished && (
                    <div className="absolute bottom-4 right-4 bg-white/90 backdrop-blur-sm px-2 py-1 rounded-lg flex items-center gap-1 text-primary">
                      <Star className="h-3 w-3 fill-current" />
                      <span className="text-xs font-bold">5.0</span>
                    </div>
                  )}
                </div>

                {/* Card body */}
                <div className="p-6 flex-1 flex flex-col">
                  <h3 className="font-title-lg text-title-lg text-on-surface mb-4 leading-tight">
                    {course.title}
                  </h3>

                  {/* Stats row */}
                  <div
                    className={`grid grid-cols-3 gap-2 mb-6 border-y border-outline-variant/30 py-4 ${isDraft ? "opacity-50" : ""}`}
                  >
                    <div className="text-center">
                      <p className="text-[10px] text-on-surface-variant uppercase tracking-tighter mb-1">
                        {t("table.modules")}
                      </p>
                      <p className="text-sm font-bold text-on-surface">
                        {course.moduleCount}
                      </p>
                    </div>
                    <div className="text-center border-x border-outline-variant/30">
                      <p className="text-[10px] text-on-surface-variant uppercase tracking-tighter mb-1">
                        {t("table.lessons")}
                      </p>
                      <p className="text-sm font-bold text-on-surface">
                        {course.lessonCount}
                      </p>
                    </div>
                    <div className="text-center">
                      <p className="text-[10px] text-on-surface-variant uppercase tracking-tighter mb-1">
                        {tc("status")}
                      </p>
                      <p className="text-sm font-bold text-on-surface">
                        {formatPrice(course.priceCents, course.currency)}
                      </p>
                    </div>
                  </div>

                  {/* Action buttons */}
                  <div className="flex items-center gap-3 mt-auto">
                    {isPublished && (
                      <>
                        <button
                          type="button"
                          disabled={actionLoading === course.id}
                          onClick={() => handleArchive(course.id, course.title)}
                          className="flex-1 border border-outline text-outline font-button text-sm h-10 rounded-full hover:bg-surface-container transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
                        >
                          <Eye className="h-4 w-4" />
                          {t("viewPage")}
                        </button>
                        <Link
                          href={`/${locale}/cursos/${course.id}/editar`}
                          className="flex-1 bg-primary text-on-primary font-button text-sm h-10 rounded-full hover:bg-primary-container transition-colors flex items-center justify-center gap-2"
                        >
                          <Pencil className="h-4 w-4" />
                          {tc("edit")}
                        </Link>
                      </>
                    )}
                    {isDraft && (
                      <>
                        <Link
                          href={`/${locale}/cursos/${course.id}/conteudo`}
                          className="flex-1 border border-outline text-outline font-button text-sm h-10 rounded-full hover:bg-surface-container transition-colors flex items-center justify-center gap-2"
                        >
                          <Eye className="h-4 w-4" />
                          {t("preview")}
                        </Link>
                        <button
                          type="button"
                          disabled={actionLoading === course.id}
                          onClick={() => handlePublish(course.id)}
                          className="flex-1 bg-primary text-on-primary font-button text-sm h-10 rounded-full hover:bg-primary-container transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
                        >
                          <Pencil className="h-4 w-4" />
                          {t("continue")}
                        </button>
                      </>
                    )}
                    {course.status === "archived" && (
                      <Link
                        href={`/${locale}/cursos/${course.id}/editar`}
                        className="flex-1 border border-outline text-outline font-button text-sm h-10 rounded-full hover:bg-surface-container transition-colors flex items-center justify-center gap-2"
                      >
                        <Pencil className="h-4 w-4" />
                        {tc("edit")}
                      </Link>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
      {/* Confirm dialogs */}
      <ConfirmDialog
        open={pendingAction?.type === "archive"}
        title={t("archive")}
        description={`${t("archiveConfirm")} "${pendingAction?.courseTitle ?? ""}"?`}
        confirmLabel={tc("confirm")}
        cancelLabel={tc("cancel")}
        variant="danger"
        onConfirm={handleDialogConfirm}
        onCancel={handleDialogCancel}
      />
      <ConfirmDialog
        open={pendingAction?.type === "publish"}
        title={tc("publish")}
        description={t("publishConfirm")}
        confirmLabel={tc("publish")}
        cancelLabel={tc("cancel")}
        onConfirm={handleDialogConfirm}
        onCancel={handleDialogCancel}
      />
    </div>
  );
};

export default CoursesPage;
