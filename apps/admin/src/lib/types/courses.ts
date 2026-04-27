interface Course {
  id: string
  creatorId: string
  title: string
  slug: string
  description: string | null
  thumbnailUrl: string | null
  priceCents: number
  currency: 'USD' | 'BRL'
  status: 'draft' | 'published' | 'archived'
  language: 'pt-BR' | 'en-US'
  createdAt: string
  updatedAt: string
}

interface CourseWithCounts extends Course {
  moduleCount: number
  lessonCount: number
}

interface Module {
  id: string
  courseId: string
  title: string
  description: string | null
  position: number
  isPublished: boolean
  createdAt: string
  updatedAt: string
}

interface Lesson {
  id: string
  moduleId: string
  title: string
  description: string | null
  position: number
  isFreePreview: boolean
  isPublished: boolean
  durationSeconds: number | null
  bunnyVideoId: string | null
  muxAssetId: string | null
  muxPlaybackId: string | null
  createdAt: string
  updatedAt: string
}

interface ModuleWithLessons extends Module {
  lessons: Lesson[]
}

interface CourseWithModules extends Course {
  modules: ModuleWithLessons[]
}

export type { Course, CourseWithCounts, CourseWithModules, Lesson, Module, ModuleWithLessons }
