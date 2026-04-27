"use client";

import { coursesApi } from "@/lib/api/courses";
import type { CourseWithCounts } from "@/lib/types/courses";
import { BookOpen, Plus } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import Link from "next/link";
import { useEffect, useState } from "react";

const STATUS_STYLES: Record<string, string> = {
  draft: "bg-surface-container text-on-surface-variant",
  published: "bg-green-100 text-green-800",
  archived: "bg-outline-variant text-on-surface-variant",
};

const formatPrice = (cents: number, currency: string): string =>
  new Intl.NumberFormat("pt-BR", { style: "currency", currency }).format(
    cents / 100,
  );

const formatDate = (dateStr: string): string =>
  new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(new Date(dateStr));

const CoursesPage = () => {
  const t = useTranslations("courses");
  const tc = useTranslations("common");
  const locale = useLocale();

  const [courses, setCourses] = useState<CourseWithCounts[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

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

  const handleArchive = async (courseId: string, courseTitle: string) => {
    if (!window.confirm(`${t("archiveConfirm")} "${courseTitle}"?`)) return;
    setActionLoading(courseId);
    try {
      await coursesApi.deleteCourse(courseId);
      setCourses((prev) => prev.filter((c) => c.id !== courseId));
    } catch (err) {
      window.alert(err instanceof Error ? err.message : tc("error"));
    } finally {
      setActionLoading(null);
    }
  };

  const handlePublish = async (courseId: string) => {
    if (!window.confirm(t("publishConfirm"))) return;
    setActionLoading(courseId);
    try {
      const updated = await coursesApi.publishCourse(courseId);
      setCourses((prev) =>
        prev.map((c) => (c.id === courseId ? { ...c, ...updated } : c)),
      );
    } catch (err) {
      window.alert(err instanceof Error ? err.message : tc("error"));
    } finally {
      setActionLoading(null);
    }
  };

  return (
    <div>
      {/* Page header */}
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="font-serif text-3xl text-on-surface">{t("title")}</h1>
          <p className="mt-1 text-sm text-on-surface-variant">
            {t("subtitle")}
          </p>
        </div>
        <Link
          href={`/${locale}/cursos/novo`}
          className="flex items-center gap-2 rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-on-primary transition-colors hover:bg-primary-hover"
        >
          <Plus className="h-4 w-4" />
          {t("createCourse")}
        </Link>
      </div>

      {/* Loading skeletons */}
      {loading && (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="h-20 animate-pulse rounded-2xl bg-surface-container"
            />
          ))}
        </div>
      )}

      {/* Error state */}
      {!loading && error && (
        <div className="rounded-2xl border border-error bg-red-50 p-6 text-sm text-error">
          {error}
        </div>
      )}

      {/* Empty state */}
      {!loading && !error && courses.length === 0 && (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-outline-variant bg-white py-16 text-center">
          <BookOpen className="mb-4 h-10 w-10 text-outline" />
          <p className="font-serif text-lg text-on-surface">{t("noCourses")}</p>
          <Link
            href={`/${locale}/cursos/novo`}
            className="mt-4 flex items-center gap-2 rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-on-primary hover:bg-primary-hover"
          >
            <Plus className="h-4 w-4" />
            {t("createCourse")}
          </Link>
        </div>
      )}

      {/* Courses table */}
      {!loading && !error && courses.length > 0 && (
        <div className="overflow-hidden rounded-2xl border border-outline-variant bg-white shadow-sm">
          <table className="w-full">
            <thead>
              <tr className="border-b border-outline-variant bg-surface-container">
                <th className="px-6 py-3.5 text-left text-xs font-semibold uppercase tracking-wide text-on-surface-variant">
                  {t("table.title")}
                </th>
                <th className="px-4 py-3.5 text-left text-xs font-semibold uppercase tracking-wide text-on-surface-variant">
                  {tc("status")}
                </th>
                <th className="px-4 py-3.5 text-left text-xs font-semibold uppercase tracking-wide text-on-surface-variant">
                  {t("table.modules")}
                </th>
                <th className="px-4 py-3.5 text-left text-xs font-semibold uppercase tracking-wide text-on-surface-variant">
                  {t("table.price")}
                </th>
                <th className="px-4 py-3.5 text-left text-xs font-semibold uppercase tracking-wide text-on-surface-variant">
                  {tc("createdAt")}
                </th>
                <th className="px-6 py-3.5 text-right text-xs font-semibold uppercase tracking-wide text-on-surface-variant">
                  {tc("actions")}
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-variant">
              {courses.map((course) => (
                <tr
                  key={course.id}
                  className="group hover:bg-surface-container/50"
                >
                  {/* Title + thumbnail */}
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      {course.thumbnailUrl ? (
                        // biome-ignore lint/performance/noImgElement: thumbnail from external S3, unoptimized is acceptable
                        <img
                          src={course.thumbnailUrl}
                          alt={course.title}
                          className="h-10 w-16 flex-shrink-0 rounded-lg object-cover"
                        />
                      ) : (
                        <div className="flex h-10 w-16 flex-shrink-0 items-center justify-center rounded-lg bg-surface-container">
                          <BookOpen className="h-4 w-4 text-outline" />
                        </div>
                      )}
                      <span className="text-sm font-medium text-on-surface">
                        {course.title}
                      </span>
                    </div>
                  </td>

                  {/* Status badge */}
                  <td className="px-4 py-4">
                    <span
                      className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${
                        STATUS_STYLES[course.status] ?? STATUS_STYLES.draft
                      }`}
                    >
                      {t(`status.${course.status}`)}
                    </span>
                  </td>

                  {/* Modules/lessons */}
                  <td className="px-4 py-4 text-sm text-on-surface-variant">
                    {course.moduleCount} {t("table.modulesUnit")} ·{" "}
                    {course.lessonCount} {t("table.lessonsUnit")}
                  </td>

                  {/* Price */}
                  <td className="px-4 py-4 text-sm text-on-surface">
                    {formatPrice(course.priceCents, course.currency)}
                  </td>

                  {/* Created at */}
                  <td className="px-4 py-4 text-sm text-on-surface-variant">
                    {formatDate(course.createdAt)}
                  </td>

                  {/* Actions */}
                  <td className="px-6 py-4">
                    <div className="flex items-center justify-end gap-2">
                      <Link
                        href={`/${locale}/cursos/${course.id}/conteudo`}
                        className="rounded-lg px-3 py-1.5 text-xs font-medium text-primary hover:bg-primary-light transition-colors"
                      >
                        {t("viewContent")}
                      </Link>
                      <Link
                        href={`/${locale}/cursos/${course.id}/editar`}
                        className="rounded-lg px-3 py-1.5 text-xs font-medium text-on-surface-variant hover:bg-surface-container transition-colors"
                      >
                        {tc("edit")}
                      </Link>
                      {course.status === "draft" && (
                        <button
                          type="button"
                          disabled={actionLoading === course.id}
                          onClick={() => handlePublish(course.id)}
                          className="rounded-lg px-3 py-1.5 text-xs font-medium text-secondary hover:bg-secondary-light/30 transition-colors disabled:opacity-50"
                        >
                          {tc("publish")}
                        </button>
                      )}
                      <button
                        type="button"
                        disabled={actionLoading === course.id}
                        onClick={() => handleArchive(course.id, course.title)}
                        className="rounded-lg px-3 py-1.5 text-xs font-medium text-error hover:bg-red-50 transition-colors disabled:opacity-50"
                      >
                        {t("archive")}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default CoursesPage;
