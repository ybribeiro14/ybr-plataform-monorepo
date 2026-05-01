import type { EnrollmentWithProgress } from "@/lib/api/student";
import { getEnrollments, getProfile } from "@/lib/api/student";
import { AlertCircle, Play } from "lucide-react";
import { getTranslations } from "next-intl/server";
import { cookies } from "next/headers";
import Image from "next/image";
import Link from "next/link";
import { redirect } from "next/navigation";

interface DashboardPageProps {
  params: Promise<{ locale: string }>;
}

const decodeJwtName = (token: string): string => {
  try {
    const [, payloadPart] = token.split(".");
    const decoded = JSON.parse(
      Buffer.from(payloadPart ?? "", "base64url").toString("utf8"),
    ) as {
      name?: string;
      sub?: string;
    };
    return decoded.name ?? "Aluno";
  } catch {
    return "Aluno";
  }
};

const DashboardPage = async ({ params }: DashboardPageProps) => {
  const { locale } = await params;

  const cookieStore = await cookies();
  const token = cookieStore.get("ybr_access_token")?.value;

  if (!token) {
    redirect(`/${locale}/login`);
  }

  const t = await getTranslations({ locale, namespace: "dashboard" });
  const tNav = await getTranslations({ locale, namespace: "nav" });

  let enrollments: EnrollmentWithProgress[] = [];
  let isProfileComplete = true;
  try {
    enrollments = await getEnrollments(token);
  } catch (error: unknown) {
    const statusCode = (error as { statusCode?: number }).statusCode;
    if (statusCode === 401) redirect(`/${locale}/login`);
  }
  try {
    const profile = await getProfile(token);
    isProfileComplete = profile.isProfileComplete;
  } catch {
    // non-critical — assume complete to avoid blocking dashboard
  }

  const userName = decodeJwtName(token);

  const continueCourse =
    enrollments.find((e) => e.progressPercent > 0 && e.progressPercent < 100) ??
    null;

  return (
    <main className="p-8 lg:p-10 max-w-350">
      {/* Welcome section */}
      <section className="mb-10">
        <h2 className="font-title-lg text-4xl text-primary mb-2">
          {t("title", { name: userName })}
        </h2>
        <p className="text-body-md text-on-surface-variant">{t("subtitle")}</p>
      </section>

      {/* Profile incomplete alert */}
      {!isProfileComplete && (
        <div className="mb-8 flex items-start gap-3 p-4 rounded-xl bg-amber-50 border border-amber-200">
          <AlertCircle
            className="w-5 h-5 text-amber-600 shrink-0 mt-0.5"
            aria-hidden="true"
          />
          <div className="flex-1">
            <p className="text-sm font-semibold text-amber-900">
              {t("profileIncompleteTitle")}
            </p>
            <p className="text-sm text-amber-700 mt-0.5">
              {t("profileIncompleteDescription")}
            </p>
          </div>
          <Link
            href={`/${locale}/profile`}
            className="shrink-0 px-4 py-1.5 rounded-full bg-amber-600 text-white text-xs font-semibold hover:bg-amber-700 transition"
          >
            {t("profileIncompleteCta")}
          </Link>
        </div>
      )}

      {/* Continue watching hero */}
      {continueCourse && (
        <section className="mb-12">
          <h3 className="text-xs font-bold text-on-surface-variant uppercase tracking-widest mb-4">
            {t("continueWatching")}
          </h3>
          <div className="bg-surface-container-lowest rounded-xl border border-outline-variant overflow-hidden shadow-sm flex flex-col md:flex-row max-w-3xl">
            <div className="md:w-2/5 h-48 md:h-auto relative bg-surface-container shrink-0">
              {continueCourse.thumbnailUrl ? (
                <Image
                  src={continueCourse.thumbnailUrl}
                  alt={continueCourse.title}
                  fill
                  sizes="(max-width: 768px) 100vw, 40vw"
                  className="object-cover"
                  priority
                />
              ) : (
                <div className="w-full h-full bg-primary-container flex items-center justify-center">
                  <Play
                    className="w-12 h-12 text-primary/30"
                    aria-hidden="true"
                  />
                </div>
              )}
              <div className="absolute inset-0 bg-linear-to-t from-black/60 to-transparent flex items-end p-4">
                <span className="bg-primary text-on-primary px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider">
                  Em andamento
                </span>
              </div>
            </div>
            <div className="flex-1 p-8 flex flex-col justify-center">
              <h3 className="text-xl font-semibold text-on-surface mb-4 leading-snug">
                {continueCourse.title}
              </h3>
              <div className="mb-6">
                <div className="flex justify-between text-xs font-semibold text-on-surface-variant mb-2 uppercase tracking-wider">
                  <span>
                    {t("progress", {
                      completed: continueCourse.completedLessons,
                      total: continueCourse.totalLessons,
                    })}
                  </span>
                  <span>{continueCourse.progressPercent}%</span>
                </div>
                <div className="w-full h-1.5 bg-surface-container rounded-full overflow-hidden">
                  <div
                    className="h-full bg-primary rounded-full transition-[width] duration-300"
                    style={{ width: `${continueCourse.progressPercent}%` }}
                  />
                </div>
              </div>
              <Link
                href={`/${locale}/courses/${continueCourse.slug}`}
                className="w-fit px-8 py-3 bg-primary text-on-primary rounded-full font-semibold text-sm hover:opacity-90 transition-opacity flex items-center gap-2"
              >
                {t("continue")}
                <Play className="w-4 h-4 fill-current" aria-hidden="true" />
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* Courses grid */}
      <section>
        <div className="flex justify-between items-end mb-6">
          <h3 className="text-2xl font-semibold text-on-surface">
            {tNav("myCourses")}
          </h3>
          <Link
            href={`/${locale}/my-courses`}
            className="text-primary text-sm font-medium hover:underline"
          >
            {t("browseCourses")}
          </Link>
        </div>

        {enrollments.length === 0 ? (
          <div className="bg-surface-container rounded-xl p-12 text-center border border-outline-variant">
            <p className="text-on-surface-variant">{t("noCourses")}</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {enrollments.map((enrollment) => (
              <div
                key={enrollment.enrollmentId}
                className="bg-surface-container-lowest border border-outline-variant rounded-xl overflow-hidden shadow-sm flex flex-col group transition-all hover:-translate-y-1"
              >
                <div className="aspect-video relative overflow-hidden bg-surface-container">
                  {enrollment.thumbnailUrl ? (
                    <Image
                      src={enrollment.thumbnailUrl}
                      alt={enrollment.title}
                      fill
                      sizes="(max-width: 768px) 100vw, (max-width: 1280px) 50vw, 25vw"
                      className="object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                  ) : (
                    <div className="w-full h-full bg-primary-container flex items-center justify-center">
                      <Play
                        className="w-8 h-8 text-primary/30"
                        aria-hidden="true"
                      />
                    </div>
                  )}
                </div>
                <div className="p-5 flex-1 flex flex-col">
                  <h4 className="text-on-surface font-semibold mb-1 leading-snug line-clamp-2 group-hover:text-primary transition-colors">
                    {enrollment.title}
                  </h4>
                  <div className="mt-auto pt-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-semibold text-primary">
                        {enrollment.progressPercent}%
                      </span>
                      <span className="text-xs text-on-surface-variant">
                        {enrollment.completedLessons}/{enrollment.totalLessons}
                      </span>
                    </div>
                    <div className="w-full bg-surface-container h-1.5 rounded-full mb-4">
                      <div
                        className="bg-primary h-full rounded-full transition-[width] duration-300"
                        style={{ width: `${enrollment.progressPercent}%` }}
                      />
                    </div>
                    <Link
                      href={`/${locale}/courses/${enrollment.slug}`}
                      className="w-full py-3 bg-primary text-on-primary rounded-full font-semibold text-sm hover:opacity-90 transition-opacity block text-center"
                    >
                      {enrollment.progressPercent === 0
                        ? t("start")
                        : t("continue")}
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </main>
  );
};

export default DashboardPage;
