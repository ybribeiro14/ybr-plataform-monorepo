"use client";

import { coursesApi } from "@/lib/api/courses";
import type {
  CourseWithModules,
  Lesson,
  ModuleWithLessons,
} from "@/lib/types/courses";
import {
  ArrowDown,
  ArrowLeft,
  ArrowUp,
  BookOpen,
  ChevronDown,
  ChevronRight,
  Pencil,
  Plus,
  Trash2,
} from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";

/* ─── Inline form for adding/editing a module title ─────────────── */
interface InlineTitleFormProps {
  initialValue?: string;
  placeholder: string;
  submitLabel: string;
  onSubmit: (title: string) => Promise<void>;
  onCancel: () => void;
}

const InlineTitleForm = ({
  initialValue = "",
  placeholder,
  submitLabel,
  onSubmit,
  onCancel,
}: InlineTitleFormProps) => {
  const [value, setValue] = useState(initialValue);
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = value.trim();
    if (!trimmed) return;
    setSaving(true);
    await onSubmit(trimmed);
    setSaving(false);
  };

  return (
    <form onSubmit={handleSubmit} className="flex items-center gap-2">
      <input
        type="text"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder={placeholder}
        className="flex-1 rounded-lg border border-outline-variant bg-surface-container px-3 py-2 text-sm text-on-surface placeholder:text-outline focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
      />
      <button
        type="submit"
        disabled={saving || !value.trim()}
        className="rounded-lg bg-primary px-3 py-2 text-xs font-semibold text-on-primary hover:bg-primary-hover disabled:opacity-50"
      >
        {saving ? "..." : submitLabel}
      </button>
      <button
        type="button"
        onClick={onCancel}
        className="rounded-lg border border-outline-variant px-3 py-2 text-xs font-medium text-on-surface-variant hover:bg-surface-container"
      >
        ✕
      </button>
    </form>
  );
};

/* ─── Lesson row ─────────────────────────────────────────────────── */
interface LessonRowProps {
  lesson: Lesson;
  onEdit: (id: string, title: string) => void;
  onDelete: (id: string) => Promise<void>;
}

const LessonRow = ({ lesson, onEdit, onDelete }: LessonRowProps) => {
  const [deleting, setDeleting] = useState(false);
  const tc = useTranslations("common");
  const tl = useTranslations("lessons");

  const handleDelete = async () => {
    if (!window.confirm(tl("deleteConfirm"))) return;
    setDeleting(true);
    await onDelete(lesson.id);
    setDeleting(false);
  };

  return (
    <div className="flex items-center justify-between rounded-lg border border-outline-variant bg-white px-4 py-3">
      <div className="flex items-center gap-3">
        <div className="flex h-7 w-7 items-center justify-center rounded-full bg-surface-container text-xs font-medium text-on-surface-variant">
          {lesson.position + 1}
        </div>
        <span className="text-sm text-on-surface">{lesson.title}</span>
        {lesson.isFreePreview && (
          <span className="rounded-full bg-secondary-light px-2 py-0.5 text-xs font-medium text-secondary">
            Preview
          </span>
        )}
        {!lesson.muxPlaybackId && !lesson.bunnyVideoId && (
          <span className="rounded-full bg-surface-container px-2 py-0.5 text-xs text-on-surface-variant">
            Sem vídeo
          </span>
        )}
      </div>
      <div className="flex items-center gap-1">
        <button
          type="button"
          onClick={() => onEdit(lesson.id, lesson.title)}
          aria-label={tc("edit")}
          className="rounded-lg p-1.5 text-on-surface-variant hover:bg-surface-container hover:text-primary"
        >
          <Pencil className="h-3.5 w-3.5" />
        </button>
        <button
          type="button"
          disabled={deleting}
          onClick={handleDelete}
          aria-label={tc("delete")}
          className="rounded-lg p-1.5 text-on-surface-variant hover:bg-red-50 hover:text-error disabled:opacity-50"
        >
          <Trash2 className="h-3.5 w-3.5" />
        </button>
      </div>
    </div>
  );
};

/* ─── Module item ────────────────────────────────────────────────── */
interface ModuleItemProps {
  module: ModuleWithLessons;
  index: number;
  total: number;
  onMoveUp: (id: string) => Promise<void>;
  onMoveDown: (id: string) => Promise<void>;
  onEditModule: (id: string, title: string) => void;
  onDeleteModule: (id: string) => Promise<void>;
  onAddLesson: (moduleId: string, title: string) => Promise<void>;
  onEditLesson: (id: string, title: string) => void;
  onDeleteLesson: (id: string, moduleId: string) => Promise<void>;
}

const ModuleItem = ({
  module,
  index,
  total,
  onMoveUp,
  onMoveDown,
  onEditModule,
  onDeleteModule,
  onAddLesson,
  onEditLesson,
  onDeleteLesson,
}: ModuleItemProps) => {
  const [expanded, setExpanded] = useState(true);
  const [addingLesson, setAddingLesson] = useState(false);
  const [deletingModule, setDeletingModule] = useState(false);
  const [movingUp, setMovingUp] = useState(false);
  const [movingDown, setMovingDown] = useState(false);
  const tc = useTranslations("common");
  const tm = useTranslations("modules");
  const tl = useTranslations("lessons");

  const handleDeleteModule = async () => {
    if (!window.confirm(tm("deleteConfirm"))) return;
    setDeletingModule(true);
    await onDeleteModule(module.id);
    setDeletingModule(false);
  };

  const handleMoveUp = async () => {
    setMovingUp(true);
    await onMoveUp(module.id);
    setMovingUp(false);
  };

  const handleMoveDown = async () => {
    setMovingDown(true);
    await onMoveDown(module.id);
    setMovingDown(false);
  };

  return (
    <div className="overflow-hidden rounded-2xl border border-outline-variant bg-white shadow-sm">
      {/* Module header */}
      <div className="flex items-center justify-between border-b border-outline-variant bg-surface-container px-5 py-4">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => setExpanded((v) => !v)}
            aria-label={expanded ? "Recolher módulo" : "Expandir módulo"}
            className="text-on-surface-variant hover:text-on-surface"
          >
            {expanded ? (
              <ChevronDown className="h-4 w-4" />
            ) : (
              <ChevronRight className="h-4 w-4" />
            )}
          </button>
          <span className="text-sm font-semibold text-on-surface">
            {module.title}
          </span>
          <span className="text-xs text-on-surface-variant">
            {module.lessons.length} {tl("title").toLowerCase()}
          </span>
        </div>

        <div className="flex items-center gap-1">
          <button
            type="button"
            disabled={index === 0 || movingUp}
            onClick={handleMoveUp}
            aria-label="Mover módulo para cima"
            className="rounded-lg p-1.5 text-on-surface-variant hover:bg-white disabled:opacity-30 disabled:cursor-not-allowed"
          >
            <ArrowUp className="h-3.5 w-3.5" />
          </button>
          <button
            type="button"
            disabled={index === total - 1 || movingDown}
            onClick={handleMoveDown}
            aria-label="Mover módulo para baixo"
            className="rounded-lg p-1.5 text-on-surface-variant hover:bg-white disabled:opacity-30 disabled:cursor-not-allowed"
          >
            <ArrowDown className="h-3.5 w-3.5" />
          </button>
          <button
            type="button"
            onClick={() => onEditModule(module.id, module.title)}
            aria-label={tc("edit")}
            className="rounded-lg p-1.5 text-on-surface-variant hover:bg-white hover:text-primary"
          >
            <Pencil className="h-3.5 w-3.5" />
          </button>
          <button
            type="button"
            disabled={deletingModule}
            onClick={handleDeleteModule}
            aria-label={tc("delete")}
            className="rounded-lg p-1.5 text-on-surface-variant hover:bg-red-50 hover:text-error disabled:opacity-50"
          >
            <Trash2 className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>

      {/* Lessons list */}
      {expanded && (
        <div className="p-4 space-y-2">
          {module.lessons.length === 0 && !addingLesson && (
            <p className="py-2 text-center text-xs text-on-surface-variant">
              {tl("noLessons")}
            </p>
          )}

          {module.lessons.map((lesson) => (
            <LessonRow
              key={lesson.id}
              lesson={lesson}
              onEdit={onEditLesson}
              onDelete={(lessonId) => onDeleteLesson(lessonId, module.id)}
            />
          ))}

          {/* Add lesson inline form */}
          {addingLesson ? (
            <InlineTitleForm
              placeholder={tl("form.titlePlaceholder")}
              submitLabel={tl("form.submit")}
              onSubmit={async (title) => {
                await onAddLesson(module.id, title);
                setAddingLesson(false);
              }}
              onCancel={() => setAddingLesson(false)}
            />
          ) : (
            <button
              type="button"
              onClick={() => setAddingLesson(true)}
              className="flex w-full items-center gap-2 rounded-lg border border-dashed border-outline-variant px-4 py-2.5 text-xs font-medium text-on-surface-variant hover:border-primary hover:text-primary transition-colors"
            >
              <Plus className="h-3.5 w-3.5" />
              {tl("addLesson")}
            </button>
          )}
        </div>
      )}
    </div>
  );
};

/* ─── Main page ──────────────────────────────────────────────────── */
const CourseContentPage = () => {
  const t = useTranslations("courses");
  const tc = useTranslations("common");
  const tm = useTranslations("modules");
  const tl = useTranslations("lessons");
  const locale = useLocale();
  const params = useParams<{ courseId: string }>();

  const [course, setCourse] = useState<CourseWithModules | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Module form state
  const [addingModule, setAddingModule] = useState(false);
  const [editingModuleId, setEditingModuleId] = useState<string | null>(null);
  const [editingModuleTitle, setEditingModuleTitle] = useState("");

  // Lesson form state
  const [editingLessonId, setEditingLessonId] = useState<string | null>(null);
  const [editingLessonModuleId, setEditingLessonModuleId] = useState<
    string | null
  >(null);
  const [editingLessonTitle, setEditingLessonTitle] = useState("");

  // Publish state
  const [publishing, setPublishing] = useState(false);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);
    coursesApi
      .getCourse(params.courseId)
      .then((data) => {
        if (!cancelled) setCourse(data);
      })
      .catch((err) => {
        if (!cancelled)
          setError(
            err instanceof Error ? err.message : "Erro ao carregar curso",
          );
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [params.courseId]);

  /* ── Module operations ────────────────────────────────────────── */
  const handleAddModule = async (title: string) => {
    if (!course) return;
    try {
      const mod = await coursesApi.createModule(course.id, {
        title,
        position: course.modules.length,
      });
      setCourse((prev) =>
        prev
          ? { ...prev, modules: [...prev.modules, { ...mod, lessons: [] }] }
          : prev,
      );
    } catch (err) {
      window.alert(err instanceof Error ? err.message : tc("error"));
    }
  };

  const handleEditModule = (id: string, title: string) => {
    setEditingModuleId(id);
    setEditingModuleTitle(title);
  };

  const handleSaveModule = async (title: string) => {
    if (!editingModuleId || !course) return;
    try {
      await coursesApi.updateModule(editingModuleId, { title });
      setCourse((prev) =>
        prev
          ? {
              ...prev,
              modules: prev.modules.map((m) =>
                m.id === editingModuleId ? { ...m, title } : m,
              ),
            }
          : prev,
      );
    } catch (err) {
      window.alert(err instanceof Error ? err.message : tc("error"));
    } finally {
      setEditingModuleId(null);
    }
  };

  const handleDeleteModule = async (moduleId: string) => {
    try {
      await coursesApi.deleteModule(moduleId);
      setCourse((prev) =>
        prev
          ? { ...prev, modules: prev.modules.filter((m) => m.id !== moduleId) }
          : prev,
      );
    } catch (err) {
      window.alert(err instanceof Error ? err.message : tc("error"));
    }
  };

  const handleMoveModule = async (
    moduleId: string,
    direction: "up" | "down",
  ) => {
    if (!course) return;
    const idx = course.modules.findIndex((m) => m.id === moduleId);
    if (direction === "up" && idx === 0) return;
    if (direction === "down" && idx === course.modules.length - 1) return;

    const newModules = [...course.modules];
    const swapIdx = direction === "up" ? idx - 1 : idx + 1;
    const current = newModules[idx];
    const swap = newModules[swapIdx];
    if (!current || !swap) return;

    newModules[idx] = swap;
    newModules[swapIdx] = current;

    const reordered = newModules.map((m, i) => ({ ...m, position: i }));
    setCourse((prev) => (prev ? { ...prev, modules: reordered } : prev));

    try {
      await coursesApi.reorderModules(
        reordered.map((m) => ({ id: m.id, position: m.position })),
      );
    } catch (err) {
      window.alert(err instanceof Error ? err.message : tc("error"));
      // Revert
      setCourse((prev) => (prev ? { ...prev, modules: course.modules } : prev));
    }
  };

  /* ── Lesson operations ────────────────────────────────────────── */
  const handleAddLesson = async (moduleId: string, title: string) => {
    if (!course) return;
    const mod = course.modules.find((m) => m.id === moduleId);
    if (!mod) return;
    try {
      const lesson = await coursesApi.createLesson(moduleId, {
        title,
        position: mod.lessons.length,
        isFreePreview: false,
      });
      setCourse((prev) =>
        prev
          ? {
              ...prev,
              modules: prev.modules.map((m) =>
                m.id === moduleId
                  ? { ...m, lessons: [...m.lessons, lesson] }
                  : m,
              ),
            }
          : prev,
      );
    } catch (err) {
      window.alert(err instanceof Error ? err.message : tc("error"));
    }
  };

  const handleEditLesson = (id: string, title: string) => {
    const mod = course?.modules.find((m) => m.lessons.some((l) => l.id === id));
    if (!mod) return;
    setEditingLessonId(id);
    setEditingLessonModuleId(mod.id);
    setEditingLessonTitle(title);
  };

  const handleSaveLesson = async (title: string) => {
    if (!editingLessonId || !editingLessonModuleId) return;
    try {
      await coursesApi.updateLesson(editingLessonId, { title });
      setCourse((prev) =>
        prev
          ? {
              ...prev,
              modules: prev.modules.map((m) =>
                m.id === editingLessonModuleId
                  ? {
                      ...m,
                      lessons: m.lessons.map((l) =>
                        l.id === editingLessonId ? { ...l, title } : l,
                      ),
                    }
                  : m,
              ),
            }
          : prev,
      );
    } catch (err) {
      window.alert(err instanceof Error ? err.message : tc("error"));
    } finally {
      setEditingLessonId(null);
      setEditingLessonModuleId(null);
    }
  };

  const handleDeleteLesson = async (lessonId: string, moduleId: string) => {
    try {
      await coursesApi.deleteLesson(lessonId);
      setCourse((prev) =>
        prev
          ? {
              ...prev,
              modules: prev.modules.map((m) =>
                m.id === moduleId
                  ? {
                      ...m,
                      lessons: m.lessons.filter((l) => l.id !== lessonId),
                    }
                  : m,
              ),
            }
          : prev,
      );
    } catch (err) {
      window.alert(err instanceof Error ? err.message : tc("error"));
    }
  };

  /* ── Publish ──────────────────────────────────────────────────── */
  const handlePublish = async () => {
    if (!course || !window.confirm(t("publishConfirm"))) return;
    setPublishing(true);
    try {
      const updated = await coursesApi.publishCourse(course.id);
      setCourse((prev) => (prev ? { ...prev, status: updated.status } : prev));
    } catch (err) {
      window.alert(err instanceof Error ? err.message : tc("error"));
    } finally {
      setPublishing(false);
    }
  };

  /* ── Render ───────────────────────────────────────────────────── */
  if (loading) {
    return (
      <div className="space-y-4">
        <div className="h-8 w-48 animate-pulse rounded-lg bg-surface-container" />
        <div className="grid gap-6 lg:grid-cols-3">
          <div className="h-64 animate-pulse rounded-2xl bg-surface-container" />
          <div className="col-span-2 space-y-3">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="h-24 animate-pulse rounded-2xl bg-surface-container"
              />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-2xl border border-error bg-red-50 p-6 text-sm text-error">
        {error}
      </div>
    );
  }

  if (!course) return null;

  const STATUS_LABELS: Record<string, string> = {
    draft: tc("draft"),
    published: tc("published"),
    archived: t("status.archived"),
  };

  const totalLessons = course.modules.reduce(
    (sum, m) => sum + m.lessons.length,
    0,
  );

  return (
    <div>
      {/* Back link */}
      <Link
        href={`/${locale}/cursos`}
        className="mb-6 flex items-center gap-2 text-sm text-on-surface-variant hover:text-on-surface"
      >
        <ArrowLeft className="h-4 w-4" />
        {tc("back")}
      </Link>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Left column — course info */}
        <div className="space-y-4">
          {/* Thumbnail */}
          <div className="overflow-hidden rounded-2xl border border-outline-variant bg-white shadow-sm">
            {course.thumbnailUrl ? (
              // biome-ignore lint/performance/noImgElement: thumbnail from external S3, unoptimized is acceptable in admin
              <img
                src={course.thumbnailUrl}
                alt={course.title}
                className="aspect-video w-full object-cover"
              />
            ) : (
              <div className="flex aspect-video w-full items-center justify-center bg-surface-container">
                <BookOpen className="h-10 w-10 text-outline" />
              </div>
            )}
            <div className="p-4">
              <h2 className="font-serif text-lg text-on-surface">
                {course.title}
              </h2>
              <div className="mt-2 flex items-center gap-2">
                <span
                  className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${
                    course.status === "published"
                      ? "bg-green-100 text-green-800"
                      : "bg-surface-container text-on-surface-variant"
                  }`}
                >
                  {STATUS_LABELS[course.status] ?? course.status}
                </span>
              </div>
              <p className="mt-3 text-xs text-on-surface-variant">
                {course.modules.length} {tm("title").toLowerCase()} ·{" "}
                {totalLessons} aulas
              </p>
            </div>
          </div>

          {/* Actions */}
          <div className="flex flex-col gap-2">
            <Link
              href={`/${locale}/cursos/${course.id}/editar`}
              className="flex w-full items-center justify-center rounded-full border border-outline-variant px-4 py-2.5 text-sm font-semibold text-on-surface hover:bg-surface-container transition-colors"
            >
              {t("editCourse")}
            </Link>
            {course.status !== "published" && (
              <button
                type="button"
                disabled={publishing}
                onClick={handlePublish}
                className="w-full rounded-full bg-primary px-4 py-2.5 text-sm font-semibold text-on-primary hover:bg-primary-hover transition-colors disabled:opacity-60"
              >
                {publishing ? tc("loading") : tc("publish")}
              </button>
            )}
            {course.status === "published" && (
              <span className="text-center text-xs text-on-surface-variant">
                ✓ {tc("published")}
              </span>
            )}
          </div>
        </div>

        {/* Right column — modules + lessons */}
        <div className="col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-serif text-xl text-on-surface">
              {tm("title")}
            </h3>
          </div>

          {/* Empty state */}
          {course.modules.length === 0 && !addingModule && (
            <div className="flex flex-col items-center justify-center rounded-2xl border border-outline-variant bg-white py-12 text-center">
              <BookOpen className="mb-3 h-8 w-8 text-outline" />
              <p className="text-sm text-on-surface-variant">
                {tm("noModules")}
              </p>
            </div>
          )}

          {/* Module list */}
          {course.modules.map((mod, idx) => {
            if (editingModuleId === mod.id) {
              return (
                <div
                  key={mod.id}
                  className="rounded-2xl border border-primary bg-white p-4 shadow-sm"
                >
                  <InlineTitleForm
                    initialValue={editingModuleTitle}
                    placeholder={tm("form.titlePlaceholder")}
                    submitLabel={tc("save")}
                    onSubmit={handleSaveModule}
                    onCancel={() => setEditingModuleId(null)}
                  />
                </div>
              );
            }

            return (
              <div key={mod.id}>
                {editingLessonId && editingLessonModuleId === mod.id ? (
                  <div className="overflow-hidden rounded-2xl border border-primary bg-white shadow-sm">
                    <div className="border-b border-outline-variant bg-surface-container px-5 py-3">
                      <span className="text-sm font-semibold text-on-surface">
                        {mod.title}
                      </span>
                    </div>
                    <div className="p-4">
                      <InlineTitleForm
                        initialValue={editingLessonTitle}
                        placeholder={tl("form.titlePlaceholder")}
                        submitLabel={tc("save")}
                        onSubmit={handleSaveLesson}
                        onCancel={() => {
                          setEditingLessonId(null);
                          setEditingLessonModuleId(null);
                        }}
                      />
                    </div>
                  </div>
                ) : (
                  <ModuleItem
                    module={mod}
                    index={idx}
                    total={course.modules.length}
                    onMoveUp={(id) => handleMoveModule(id, "up")}
                    onMoveDown={(id) => handleMoveModule(id, "down")}
                    onEditModule={handleEditModule}
                    onDeleteModule={handleDeleteModule}
                    onAddLesson={handleAddLesson}
                    onEditLesson={handleEditLesson}
                    onDeleteLesson={handleDeleteLesson}
                  />
                )}
              </div>
            );
          })}

          {/* Add module form */}
          {addingModule ? (
            <div className="rounded-2xl border border-primary bg-white p-4 shadow-sm">
              <InlineTitleForm
                placeholder={tm("form.titlePlaceholder")}
                submitLabel={tm("form.submit")}
                onSubmit={async (title) => {
                  await handleAddModule(title);
                  setAddingModule(false);
                }}
                onCancel={() => setAddingModule(false)}
              />
            </div>
          ) : (
            <button
              type="button"
              onClick={() => setAddingModule(true)}
              className="flex w-full items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-outline-variant px-4 py-4 text-sm font-medium text-on-surface-variant hover:border-primary hover:text-primary transition-colors"
            >
              <Plus className="h-4 w-4" />
              {tm("addModule")}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default CourseContentPage;
