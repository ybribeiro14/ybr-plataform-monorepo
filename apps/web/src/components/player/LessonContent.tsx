'use client'

import * as Tabs from '@radix-ui/react-tabs'
import { BookOpen, FileText, NotebookPen } from 'lucide-react'
import { useTranslations } from 'next-intl'

interface LessonContentProps {
  lessonTitle: string
  durationSeconds: number | null
}

const formatDuration = (seconds: number | null): string | null => {
  if (!seconds) return null
  const mins = Math.floor(seconds / 60)
  return `${mins} min`
}

const LessonContent = ({ lessonTitle, durationSeconds }: LessonContentProps) => {
  const t = useTranslations('course.lesson')

  return (
    <>
      {/* Tabs nav */}
      <Tabs.Root defaultValue="lesson" className="mt-6 flex flex-col gap-stack-md">
        <Tabs.List className="border-b border-outline-variant flex gap-8" aria-label={lessonTitle}>
          <Tabs.Trigger
            value="lesson"
            className="pb-4 text-on-surface-variant font-button flex items-center gap-2 border-b-2 border-transparent data-[state=active]:text-primary data-[state=active]:border-primary transition-colors"
          >
            <BookOpen size={16} aria-hidden="true" />
            {t('tabs.lesson')}
          </Tabs.Trigger>
          <Tabs.Trigger
            value="materials"
            className="pb-4 text-on-surface-variant font-button flex items-center gap-2 border-b-2 border-transparent data-[state=active]:text-primary data-[state=active]:border-primary transition-colors"
          >
            <FileText size={16} aria-hidden="true" />
            {t('tabs.materials')}
          </Tabs.Trigger>
          <Tabs.Trigger
            value="notes"
            className="pb-4 text-on-surface-variant font-button flex items-center gap-2 border-b-2 border-transparent data-[state=active]:text-primary data-[state=active]:border-primary transition-colors"
          >
            <NotebookPen size={16} aria-hidden="true" />
            {t('tabs.notes')}
          </Tabs.Trigger>
        </Tabs.List>

        {/* Aula tab */}
        <Tabs.Content
          value="lesson"
          className="py-stack-md flex flex-col gap-stack-sm outline-none"
        >
          <h2 className="font-display-md text-display-md text-on-surface">{lessonTitle}</h2>
          {durationSeconds !== null && (
            <div className="flex items-center gap-1 text-on-surface-variant text-label-md">
              <span aria-hidden="true">⏱</span>
              <span>{formatDuration(durationSeconds)}</span>
            </div>
          )}
        </Tabs.Content>

        {/* Materiais tab */}
        <Tabs.Content value="materials" className="py-stack-md outline-none">
          <p className="text-body-md text-on-surface-variant">{t('materials.noMaterials')}</p>
        </Tabs.Content>

        {/* Notas tab */}
        <Tabs.Content value="notes" className="py-stack-md outline-none">
          <textarea
            className="w-full min-h-[160px] rounded-xl border border-outline-variant bg-surface-container-low px-4 py-3 text-body-md text-on-surface placeholder:text-outline resize-none focus:outline-none focus:ring-2 focus:ring-primary"
            placeholder={t('notes.placeholder')}
            aria-label={t('tabs.notes')}
          />
        </Tabs.Content>
      </Tabs.Root>
    </>
  )
}

export type { LessonContentProps }
export { LessonContent }
