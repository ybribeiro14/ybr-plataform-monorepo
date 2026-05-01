"use client";

import { CheckCircle2, PlayCircle } from "lucide-react";
import { useTranslations } from "next-intl";
import Link from "next/link";
import { ModuleProgress } from "./ModuleProgress";

interface LessonItem {
  id: string;
  title: string;
  position: number;
  durationSeconds: number | null;
  isCompleted: boolean;
}

interface ModuleItem {
  id: string;
  title: string;
  position: number;
  completedCount: number;
  lessons: LessonItem[];
}

interface LessonSidebarProps {
  modules: ModuleItem[];
  currentLessonId: string;
  courseSlug: string;
  locale: string;
}

const formatDuration = (seconds: number | null): string => {
  if (!seconds) return "";
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${String(secs).padStart(2, "0")}`;
};

const LessonSidebar = ({
  modules,
  currentLessonId,
  courseSlug,
  locale,
}: LessonSidebarProps) => {
  const t = useTranslations("course.lesson");
  const tOverview = useTranslations("course.overview");

  return (
    <aside
      className="w-full md:w-[30%] h-fit bg-surface-container-lowest rounded-2xl border border-outline-variant shadow-sm overflow-hidden flex flex-col"
      aria-label={t("sidebar.contentTitle")}
    >
      {/* Sidebar header */}
      <div className="p-6 border-b border-outline-variant bg-surface-container-low">
        <h3 className="font-title-lg text-title-lg text-on-surface mb-1">
          {t("sidebar.contentTitle")}
        </h3>
        <p className="text-label-md text-on-surface-variant">
          {tOverview("modules")}
        </p>
      </div>

      {/* Scrollable lesson list */}
      <nav
        className="overflow-y-auto max-h-[calc(100vh-320px)] [scrollbar-width:thin] [scrollbar-color:#E8E0D9_transparent]"
        aria-label={tOverview("modules")}
      >
        {modules.length === 0 ? (
          <div className="p-6 text-label-md text-on-surface-variant text-center">
            {t("loading")}
          </div>
        ) : (
          modules.map((module) => {
            const totalLessons = module.lessons.length;
            const progressPercent =
              totalLessons > 0
                ? Math.round((module.completedCount / totalLessons) * 100)
                : 0;

            return (
              <div key={module.id}>
                {/* Module header */}
                <div className="px-4 py-3 bg-surface-container border-b border-outline-variant">
                  <p className="font-button text-on-surface text-sm">
                    {module.title}
                  </p>
                  <div className="flex items-center justify-between mt-1.5">
                    <span className="text-label-md text-on-surface-variant">
                      {module.completedCount}/{totalLessons}
                    </span>
                    <span className="text-label-md font-bold text-primary">
                      {progressPercent}%
                    </span>
                  </div>
                  <div className="mt-2">
                    <ModuleProgress percent={progressPercent} />
                  </div>
                </div>

                {/* Lessons */}
                {module.lessons.map((lesson) => {
                  const isActive = lesson.id === currentLessonId;
                  const href = `/${locale}/courses/${courseSlug}/lessons/${lesson.id}`;

                  return (
                    <Link
                      key={lesson.id}
                      href={href}
                      aria-current={isActive ? "page" : undefined}
                      className={[
                        "flex items-center gap-4 p-4 border-b border-surface-variant transition-colors",
                        isActive
                          ? "bg-primary/5 border-l-4 border-l-primary"
                          : "hover:bg-surface-container-low cursor-pointer",
                      ].join(" ")}
                    >
                      {/* Icon */}
                      {lesson.isCompleted ? (
                        <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary-container text-primary flex items-center justify-center">
                          <CheckCircle2 size={16} aria-hidden="true" />
                        </div>
                      ) : isActive ? (
                        <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center">
                          <PlayCircle size={16} aria-hidden="true" />
                        </div>
                      ) : (
                        <div className="flex-shrink-0 w-8 h-8 rounded-full bg-surface-container-high text-on-surface-variant flex items-center justify-center border border-outline-variant">
                          <span className="text-xs font-bold">
                            {lesson.position.toString().padStart(2, "0")}
                          </span>
                        </div>
                      )}

                      {/* Text */}
                      <div className="flex-grow min-w-0">
                        <p
                          className={[
                            "text-label-md mb-0.5",
                            isActive
                              ? "text-primary font-bold"
                              : "text-on-surface-variant",
                          ].join(" ")}
                        >
                          {t("sidebar.lesson")}{" "}
                          {lesson.position.toString().padStart(2, "0")}
                        </p>
                        <h4
                          className={[
                            "font-button truncate",
                            isActive ? "text-primary" : "text-on-surface",
                          ].join(" ")}
                        >
                          {lesson.title}
                        </h4>
                      </div>

                      {/* Duration */}
                      {lesson.durationSeconds !== null && (
                        <span
                          className={[
                            "text-label-md flex-shrink-0",
                            isActive ? "text-primary" : "text-outline",
                          ].join(" ")}
                        >
                          {formatDuration(lesson.durationSeconds)}
                        </span>
                      )}
                    </Link>
                  );
                })}
              </div>
            );
          })
        )}
      </nav>
    </aside>
  );
};

export { LessonSidebar };
export type { LessonItem, LessonSidebarProps, ModuleItem };
