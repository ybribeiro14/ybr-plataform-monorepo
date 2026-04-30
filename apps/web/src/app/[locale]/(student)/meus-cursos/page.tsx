import type { EnrollmentWithProgress } from "@/lib/api/student";
import { getEnrollments } from "@/lib/api/student";
import { Play } from "lucide-react";
import { getTranslations } from "next-intl/server";
import { cookies } from "next/headers";
import Image from "next/image";
import Link from "next/link";
import { redirect } from "next/navigation";

interface MeusCoursosPageProps {
  params: Promise<{ locale: string }>;
}

const MeusCoursosPage = async ({ params }: MeusCoursosPageProps) => {
  const { locale } = await params;

  const cookieStore = await cookies();
  const token = cookieStore.get("ybr_access_token")?.value;

  if (!token) {
    redirect(`/${locale}/login`);
  }

  const t = await getTranslations({ locale, namespace: "myCourses" });

  let enrollments: EnrollmentWithProgress[] = [];
  try {
    enrollments = await getEnrollments(token);
  } catch (error: unknown) {
    const statusCode = (error as { statusCode?: number }).statusCode;
    if (statusCode === 401) redirect(`/${locale}/login`);
  }

  return (
    <main className="p-8 lg:p-10 max-w-350">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-4">
        <div>
          <h2 className="font-title-lg text-4xl text-primary mb-2">
            {t("title")}
          </h2>
          <p className="text-on-surface-variant">{t("subtitle")}</p>
        </div>
      </div>

      {enrollments.length === 0 ? (
        <div className="bg-surface-container rounded-xl p-16 text-center border border-outline-variant">
          <p className="text-on-surface-variant mb-6">{t("noCourses")}</p>
          <Link
            href={`/${locale}/explorar`}
            className="inline-block px-8 py-3 bg-primary text-on-primary rounded-full font-semibold text-sm hover:opacity-90 transition-opacity"
          >
            {t("browseCourses")}
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {enrollments.map((enrollment) => (
            <div
              key={enrollment.enrollmentId}
              className="bg-surface-container-lowest border border-outline-variant rounded-xl overflow-hidden flex flex-col group transition-all hover:-translate-y-1 shadow-card hover:shadow-card-hover"
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
                <div className="absolute inset-0 bg-linear-to-t from-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <Play
                    className="w-12 h-12 text-white fill-white"
                    aria-hidden="true"
                  />
                </div>
              </div>
              <div className="p-5 flex-1 flex flex-col">
                <h3 className="text-on-surface font-semibold mb-1 leading-snug line-clamp-2 group-hover:text-primary transition-colors">
                  {enrollment.title}
                </h3>
                <div className="mt-auto pt-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-semibold text-primary">
                      {t("progress", { percent: enrollment.progressPercent })}
                    </span>
                    <span className="text-xs text-on-surface-variant">
                      {t("lessons", {
                        completed: enrollment.completedLessons,
                        total: enrollment.totalLessons,
                      })}
                    </span>
                  </div>
                  <div className="w-full bg-surface-container h-1.5 rounded-full mb-5">
                    <div
                      className="bg-primary h-full rounded-full transition-[width] duration-300"
                      style={{ width: `${enrollment.progressPercent}%` }}
                    />
                  </div>
                  <Link
                    href={`/${locale}/cursos/${enrollment.slug}`}
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
    </main>
  );
};

export default MeusCoursosPage;
