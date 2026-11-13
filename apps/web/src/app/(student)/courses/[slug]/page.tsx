import type { StudentLesson, StudentModule } from "@/lib/api/student";
import { getCourseDetails, getEnrollments } from "@/lib/api/student";
import { CheckCircle2, Circle, PlayCircle } from "lucide-react";
import { getTranslations } from "next-intl/server";
import { cookies } from "next/headers";
import Image from "next/image";
import Link from "next/link";
import { redirect } from "next/navigation";

interface CourseOverviewPageProps {
  params: Promise<{ slug: string }>;
}

const formatDuration = (seconds: number | null): string => {
  if (!seconds) return "";
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${String(secs).padStart(2, "0")} min`;
};

const getLessonStatus = (
  lesson: StudentLesson,
): "completed" | "in-progress" | "not-started" => {
  if (lesson.progress?.completed) return "completed";
  if ((lesson.progress?.watchedSeconds ?? 0) > 0) return "in-progress";
  return "not-started";
};

const getModuleStatus = (
  module: StudentModule,
): "completed" | "in-progress" | "not-started" => {
  const total = module.lessons.length;
  if (total === 0) return "not-started";
  const completed = module.lessons.filter((l) => l.progress?.completed).length;
  if (completed === total) return "completed";
  if (
    completed > 0 ||
    module.lessons.some((l) => (l.progress?.watchedSeconds ?? 0) > 0)
  )
    return "in-progress";
  return "not-started";
};

const findNextLessonId = (modules: StudentModule[]): string | null => {
  const sorted = [...modules].sort((a, b) => a.position - b.position);
  for (const module of sorted) {
    const sortedLessons = [...module.lessons].sort(
      (a, b) => a.position - b.position,
    );
    for (const lesson of sortedLessons) {
      if (!lesson.progress?.completed && lesson.hasVideo) {
        return lesson.lessonId;
      }
    }
  }
  return null;
};

const CourseOverviewPage = async ({ params }: CourseOverviewPageProps) => {
  const { slug } = await params;

  const cookieStore = await cookies();
  const token = cookieStore.get("ybr_access_token")?.value;

  if (!token) {
    redirect("/login");
  }

  const t = await getTranslations("course.overview");

  let enrollments: Awaited<ReturnType<typeof getEnrollments>>;
  try {
    enrollments = await getEnrollments(token);
  } catch (error: unknown) {
    const statusCode = (error as { statusCode?: number }).statusCode;
    if (statusCode === 401) redirect("/login");
    redirect("/meus-cursos");
  }

  const enrollment = enrollments.find((e) => e.slug === slug);
  if (!enrollment) {
    redirect("/meus-cursos");
  }

  let courseDetails: Awaited<ReturnType<typeof getCourseDetails>>;
  try {
    courseDetails = await getCourseDetails(enrollment.courseId, token);
  } catch (error: unknown) {
    const statusCode = (error as { statusCode?: number }).statusCode;
    if (statusCode === 401) redirect("/login");
    const errors = (error as { errors?: Array<{ code: string }> }).errors;
    if (errors?.some((e) => e.code === "PROFILE_INCOMPLETE")) {
      redirect(`/profile?returnTo=/courses/${slug}`);
    }
    redirect("/my-courses");
  }

  const nextLessonId = findNextLessonId(courseDetails.modules);
  const allCompleted = courseDetails.progressPercent === 100;

  const ctaLabel = allCompleted
    ? t("completedCourse")
    : courseDetails.progressPercent === 0
      ? t("startCourse")
      : t("continueCourse");

  const ctaHref = nextLessonId
    ? `/courses/${slug}/lessons/${nextLessonId}`
    : "/my-courses";

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative h-80 w-full flex items-end overflow-hidden">
        <div className="absolute inset-0 z-0">
          {courseDetails.thumbnailUrl ? (
            <Image
              src={courseDetails.thumbnailUrl}
              alt={courseDetails.title}
              fill
              sizes="100vw"
              className="object-cover blur-sm scale-110"
              priority
            />
          ) : (
            <div className="w-full h-full bg-primary-container" />
          )}
          <div className="absolute inset-0 bg-linear-to-t from-stone-950 via-stone-950/40 to-transparent" />
        </div>

        <div className="relative z-10 px-10 pb-10 w-full">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div>
              <h2 className="text-white text-4xl font-semibold mb-2 leading-tight">
                {courseDetails.title}
              </h2>
              {courseDetails.description && (
                <p className="text-stone-300 max-w-2xl line-clamp-2">
                  {courseDetails.description}
                </p>
              )}
            </div>

            {/* Progress Card */}
            <div className="bg-surface-container-low/90 backdrop-blur p-5 rounded-xl border border-outline-variant shadow-lg flex items-center gap-5 min-w-60 shrink-0">
              <div
                className="relative w-14 h-14 rounded-full flex items-center justify-center shadow-sm"
                style={{
                  background: `conic-gradient(#755b00 ${courseDetails.progressPercent}%, #dcc1b5 0)`,
                }}
              >
                <div className="absolute inset-1 bg-surface-container-low rounded-full" />
                <span className="relative font-bold text-primary text-xs">
                  {courseDetails.progressPercent}%
                </span>
              </div>
              <div>
                <p className="text-xs text-on-surface-variant font-medium uppercase tracking-wider mb-1">
                  {t("progress")}
                </p>
                <p className="text-on-surface font-bold text-sm">
                  {courseDetails.completedLessons} /{" "}
                  {courseDetails.totalLessons} {t("lessons")}
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Tabs + Content */}
      <section className="max-w-[1280px] mx-auto px-10 py-10">
        {/* Tabs */}
        <div className="flex gap-8 border-b border-outline-variant mb-8">
          <button
            type="button"
            className="pb-4 text-primary font-semibold border-b-2 border-primary text-sm"
          >
            {t("content")}
          </button>
          <button
            type="button"
            className="pb-4 text-on-surface-variant text-sm cursor-not-allowed opacity-50"
            disabled
          >
            {t("materials")}
          </button>
          <button
            type="button"
            className="pb-4 text-on-surface-variant text-sm cursor-not-allowed opacity-50"
            disabled
          >
            {t("community")}
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
          {/* Modules Accordion (2/3) */}
          <div className="lg:col-span-2 space-y-4">
            {[...courseDetails.modules]
              .sort((a, b) => a.position - b.position)
              .map((module) => {
                const moduleStatus = getModuleStatus(module);
                return (
                  <div
                    key={module.moduleId}
                    className={[
                      "rounded-xl border overflow-hidden shadow-sm",
                      moduleStatus === "in-progress"
                        ? "border-primary-container bg-surface-container-lowest"
                        : "border-outline-variant bg-surface-container-lowest",
                    ].join(" ")}
                  >
                    {/* Module Header */}
                    <div
                      className={[
                        "p-5 flex items-center gap-4",
                        moduleStatus === "in-progress"
                          ? "bg-primary/5"
                          : "bg-surface-container",
                      ].join(" ")}
                    >
                      {moduleStatus === "completed" ? (
                        <CheckCircle2
                          className="w-6 h-6 text-success shrink-0"
                          aria-hidden="true"
                        />
                      ) : moduleStatus === "in-progress" ? (
                        <PlayCircle
                          className="w-6 h-6 text-primary shrink-0"
                          aria-hidden="true"
                        />
                      ) : (
                        <Circle
                          className="w-6 h-6 text-on-surface-variant shrink-0"
                          aria-hidden="true"
                        />
                      )}
                      <div>
                        <h4
                          className={[
                            "font-semibold text-base",
                            moduleStatus === "in-progress"
                              ? "text-primary"
                              : "text-on-surface",
                          ].join(" ")}
                        >
                          {module.title}
                        </h4>
                        <p
                          className={[
                            "text-xs mt-0.5",
                            moduleStatus === "in-progress"
                              ? "text-primary/70"
                              : "text-on-surface-variant",
                          ].join(" ")}
                        >
                          {module.lessons.length} {t("lessons")}
                          {moduleStatus !== "not-started" && (
                            <>
                              {" "}
                              •{" "}
                              {moduleStatus === "completed"
                                ? t("moduleCompleted")
                                : t("moduleInProgress")}
                            </>
                          )}
                        </p>
                      </div>
                    </div>

                    {/* Lessons */}
                    <div className="divide-y divide-outline-variant/40">
                      {[...module.lessons]
                        .sort((a, b) => a.position - b.position)
                        .map((lesson) => {
                          const status = getLessonStatus(lesson);
                          const lessonHref = lesson.hasVideo
                            ? `/courses/${slug}/lessons/${lesson.lessonId}`
                            : undefined;

                          return (
                            <div
                              key={lesson.lessonId}
                              className={[
                                "flex items-center justify-between px-5 py-4 group",
                                status === "in-progress"
                                  ? "bg-primary-container"
                                  : lessonHref
                                    ? "hover:bg-surface-container transition-colors cursor-pointer"
                                    : "",
                              ].join(" ")}
                            >
                              <div className="flex items-center gap-4 min-w-0">
                                {status === "completed" ? (
                                  <CheckCircle2
                                    className="w-5 h-5 text-success shrink-0"
                                    aria-label={t("completedLabel")}
                                  />
                                ) : status === "in-progress" ? (
                                  <PlayCircle
                                    className="w-5 h-5 text-primary shrink-0"
                                    aria-label={t("inProgress")}
                                  />
                                ) : (
                                  <Circle
                                    className="w-5 h-5 text-outline shrink-0"
                                    aria-label={t("notStarted")}
                                  />
                                )}
                                <div className="min-w-0">
                                  {lessonHref ? (
                                    <Link
                                      href={lessonHref}
                                      className={[
                                        "text-sm font-medium block truncate",
                                        status === "in-progress"
                                          ? "text-primary font-bold"
                                          : "text-on-surface group-hover:text-primary transition-colors",
                                      ].join(" ")}
                                    >
                                      {lesson.title}
                                    </Link>
                                  ) : (
                                    <p className="text-sm font-medium text-on-surface-variant truncate">
                                      {lesson.title}
                                    </p>
                                  )}
                                  {lesson.durationSeconds && (
                                    <p className="text-xs text-on-surface-variant mt-0.5">
                                      {formatDuration(lesson.durationSeconds)}
                                    </p>
                                  )}
                                </div>
                              </div>
                              {status === "in-progress" && (
                                <span className="text-xs font-bold text-primary px-3 py-1 bg-primary/10 rounded-full shrink-0 ml-2">
                                  {t("inProgress")}
                                </span>
                              )}
                            </div>
                          );
                        })}
                    </div>
                  </div>
                );
              })}
          </div>

          {/* Sidebar (1/3) */}
          <div className="space-y-6">
            <div className="bg-surface-container-lowest p-6 rounded-xl border border-outline-variant shadow-sm">
              <p className="text-xs text-on-surface-variant font-medium uppercase tracking-wider mb-3">
                {t("progress")}
              </p>
              <div className="flex items-center gap-3 mb-3">
                <div className="flex-1 bg-surface-container h-2 rounded-full overflow-hidden">
                  <div
                    className="bg-primary h-full rounded-full transition-[width] duration-300"
                    style={{ width: `${courseDetails.progressPercent}%` }}
                  />
                </div>
                <span className="text-sm font-bold text-primary whitespace-nowrap">
                  {courseDetails.progressPercent}%
                </span>
              </div>
              <p className="text-sm text-on-surface-variant mb-5">
                {courseDetails.completedLessons} / {courseDetails.totalLessons}{" "}
                {t("lessons")}
              </p>

              {allCompleted ? (
                <div className="w-full py-3 bg-success-container text-success rounded-full font-semibold text-sm text-center">
                  {t("completedCourse")}
                </div>
              ) : (
                <Link
                  href={ctaHref}
                  className="w-full py-3 bg-primary text-on-primary rounded-full font-semibold text-sm hover:opacity-90 transition-opacity block text-center"
                >
                  {ctaLabel}
                </Link>
              )}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default CourseOverviewPage;
