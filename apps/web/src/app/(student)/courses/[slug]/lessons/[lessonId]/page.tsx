import { cookies } from 'next/headers'
import Link from 'next/link'
import { redirect } from 'next/navigation'
import { getTranslations } from 'next-intl/server'
import { LessonContent } from '@/components/player/LessonContent'
import { LessonHeader } from '@/components/player/LessonHeader'
import type { ModuleItem } from '@/components/player/LessonSidebar'
import { LessonSidebar } from '@/components/player/LessonSidebar'
import { VideoPlayer } from '@/components/player/VideoPlayer'
import { getLessonStream } from '@/lib/api/lessons'
import { getCourseDetails, getEnrollments } from '@/lib/api/student'

interface LessonPageProps {
  params: Promise<{
    slug: string
    lessonId: string
  }>
}

const LessonPage = async ({ params }: LessonPageProps) => {
  const { slug, lessonId } = await params

  const cookieStore = await cookies()
  const token = cookieStore.get('ybr_access_token')?.value

  if (!token) {
    redirect('/login')
  }

  const tNav = await getTranslations('nav')

  // Fetch lesson stream + enrollments in parallel
  let lessonData: Awaited<ReturnType<typeof getLessonStream>>
  let sidebarModules: ModuleItem[] = []

  try {
    const [streamResult, enrollments] = await Promise.all([
      getLessonStream({ lessonId, token }),
      getEnrollments(token),
    ])

    lessonData = streamResult

    const enrollment = enrollments.find(e => e.slug === slug)
    if (enrollment) {
      try {
        const courseDetails = await getCourseDetails(enrollment.courseId, token)
        sidebarModules = courseDetails.modules.map(m => ({
          id: m.moduleId,
          title: m.title,
          position: m.position,
          completedCount: m.lessons.filter(l => l.progress?.completed).length,
          lessons: m.lessons.map(l => ({
            id: l.lessonId,
            title: l.title,
            position: l.position,
            durationSeconds: l.durationSeconds,
            isCompleted: l.progress?.completed ?? false,
          })),
        }))
      } catch {
        // Sidebar is non-critical — continue without it
      }
    }
  } catch (error: unknown) {
    const statusCode = (error as { statusCode?: number }).statusCode
    if (statusCode === 401) redirect('/login')
    const errors = (error as { errors?: Array<{ code: string }> }).errors
    if (errors?.some(e => e.code === 'PROFILE_INCOMPLETE')) {
      redirect(`/profile?returnTo=/courses/${slug}/lessons/${lessonId}`)
    }
    if (statusCode === 403) redirect('/dashboard')
    throw error
  }

  return (
    <div className="min-h-screen bg-[var(--color-sidebar-bg)]">
      <div className="px-4 md:px-8 pt-4">
        <LessonHeader />
      </div>
      <main className="max-w-[1440px] mx-auto px-4 md:px-8 pb-8 flex flex-col md:flex-row gap-gutter">
        {/* Left column: video + tabs (70%) */}
        <div className="w-full md:w-[70%] flex flex-col gap-stack-md">
          {/* Breadcrumb */}
          <nav
            className="flex items-center gap-2 text-label-md text-[var(--color-on-sidebar)] opacity-70 mb-2 flex-wrap"
            aria-label="breadcrumb"
          >
            <Link href="/my-courses" className="hover:opacity-100 transition-opacity">
              {tNav('myCourses')}
            </Link>
            <span aria-hidden="true">›</span>
            <Link
              href={`/courses/${slug}`}
              className="hover:opacity-100 transition-opacity capitalize"
            >
              {slug.replace(/-/g, ' ')}
            </Link>
            <span aria-hidden="true">›</span>
            <span className="text-[var(--color-on-sidebar)] font-bold opacity-100">
              {lessonData.title}
            </span>
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
        <LessonSidebar modules={sidebarModules} currentLessonId={lessonId} courseSlug={slug} />
      </main>
    </div>
  )
}

export default LessonPage
