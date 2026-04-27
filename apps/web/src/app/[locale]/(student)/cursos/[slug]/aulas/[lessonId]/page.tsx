import { cookies } from 'next/headers'
import Link from 'next/link'
import { redirect } from 'next/navigation'
import { getTranslations } from 'next-intl/server'
import { LessonContent } from '@/components/player/LessonContent'
import { LessonSidebar } from '@/components/player/LessonSidebar'
import { VideoPlayer } from '@/components/player/VideoPlayer'
import { getLessonStream } from '@/lib/api/lessons'

interface LessonPageProps {
  params: Promise<{
    locale: string
    slug: string
    lessonId: string
  }>
}

const LessonPage = async ({ params }: LessonPageProps) => {
  const { locale, slug, lessonId } = await params

  const cookieStore = await cookies()
  const token = cookieStore.get('ybr_access_token')?.value

  if (!token) {
    redirect(`/${locale}/login`)
  }

  const tNav = await getTranslations({ locale, namespace: 'nav' })

  let lessonData: Awaited<ReturnType<typeof getLessonStream>>
  try {
    lessonData = await getLessonStream({ lessonId, token })
  } catch (error: unknown) {
    const statusCode = (error as { statusCode?: number }).statusCode
    if (statusCode === 401) redirect(`/${locale}/login`)
    if (statusCode === 403) redirect(`/${locale}/dashboard`)
    throw error
  }

  return (
    <main className="max-w-[1440px] mx-auto px-4 md:px-8 py-8 flex flex-col md:flex-row gap-gutter">
      {/* Left column: video + tabs (70%) */}
      <div className="w-full md:w-[70%] flex flex-col gap-stack-md">
        {/* Breadcrumb */}
        <nav
          className="flex items-center gap-2 text-label-md text-on-surface-variant mb-2 flex-wrap"
          aria-label="breadcrumb"
        >
          <Link href={`/${locale}/meus-cursos`} className="hover:text-primary transition-colors">
            {tNav('myCourses')}
          </Link>
          <span aria-hidden="true" className="text-outline">
            ›
          </span>
          <Link
            href={`/${locale}/cursos/${slug}`}
            className="hover:text-primary transition-colors capitalize"
          >
            {slug.replace(/-/g, ' ')}
          </Link>
          <span aria-hidden="true" className="text-outline">
            ›
          </span>
          <span className="text-primary font-bold">{lessonData.title}</span>
        </nav>

        {/* HLS Video Player */}
        <VideoPlayer
          src={lessonData.streamUrl}
          {...(lessonData.thumbnailUrl ? { poster: lessonData.thumbnailUrl } : {})}
          lessonId={lessonId}
          initialWatchedSeconds={lessonData.progress?.watchedSeconds ?? 0}
          durationSeconds={lessonData.durationSeconds}
        />

        {/* Tabs: Aula / Materiais / Minhas Notas */}
        <LessonContent
          lessonTitle={lessonData.title}
          durationSeconds={lessonData.durationSeconds}
        />
      </div>

      {/* Right sidebar: module/lesson list (30%) */}
      {/* modules=[] until Phase 1.4 backend (GET /student/courses/:id) is implemented */}
      <LessonSidebar modules={[]} currentLessonId={lessonId} courseSlug={slug} locale={locale} />
    </main>
  )
}

export default LessonPage
