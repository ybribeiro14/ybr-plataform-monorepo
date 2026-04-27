"use client";

import { coursesApi } from "@/lib/api/courses";
import type {
  CourseWithModules,
  Lesson,
  ModuleWithLessons,
} from "@/lib/types/courses";
import { ConfirmDialog } from "@ybr/ui";
import {
  ArrowDown,
  ArrowLeft,
  ArrowUp,
  BookOpen,
  ChevronDown,
  ChevronRight,
  Cloud,
  FileText,
  GripVertical,
  Lightbulb,
  Pencil,
  PlayCircle,
  Plus,
  Trash2,
} from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";

/* ─── Inline form ────────────────────────────────────────────────── */
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
        className="flex-1 rounded-lg border border-outline-variant bg-surface-container-low px-3 py-2 text-sm text-on-surface placeholder:text-outline focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
      />
      <button
        type="submit"
        disabled={saving || !value.trim()}
        className="rounded-full bg-primary px-3 py-2 text-xs font-semibold text-on-primary hover:bg-primary-container disabled:opacity-50"
      >
        {saving ? "..." : submitLabel}
      </button>
      <button
        type="button"
        onClick={onCancel}
        className="rounded-full border border-outline-variant px-3 py-2 text-xs font-medium text-on-surface-variant hover:bg-surface-container"
      >
        ✕
      </button>
    </form>
  );
};

/* ─── Lesson row (left panel) ────────────────────────────────────── */
interface LessonRowProps {
  lesson: Lesson;
  isSelected: boolean;
  onSelect: (lesson: Lesson) => void;
  onEdit: (id: string, title: string) => void;
  onDelete: (id: string) => Promise<void>;
}

const LessonRow = ({
  lesson,
  isSelected,
  onSelect,
  onEdit,
  onDelete,
}: LessonRowProps) => {
  const [deleting, setDeleting] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const tc = useTranslations("common");
  const tl = useTranslations("lessons");

  const handleDeleteConfirm = async () => {
    setDeleteDialogOpen(false);
    setDeleting(true);
    await onDelete(lesson.id);
    setDeleting(false);
  };

  const hasVideo = lesson.muxPlaybackId || lesson.bunnyVideoId;

  return (
    <>
      <button
        type="button"
        onClick={() => onSelect(lesson)}
        className={`w-full flex items-center justify-between p-3 rounded-xl transition-colors cursor-pointer group text-left ${
          isSelected
            ? "bg-white border-2 border-primary shadow-sm"
            : "bg-white border border-outline-variant hover:bg-surface-container-low"
        }`}
      >
        <div className="flex items-center gap-3 min-w-0">
          {hasVideo ? (
            <PlayCircle
              className={`h-4 w-4 shrink-0 ${isSelected ? "text-primary" : "text-outline"}`}
            />
          ) : (
            <FileText
              className={`h-4 w-4 shrink-0 ${isSelected ? "text-primary" : "text-outline"}`}
            />
          )}
          <span
            className={`text-sm truncate ${isSelected ? "font-semibold text-primary" : "text-on-surface-variant"}`}
          >
            {lesson.title}
          </span>
        </div>
        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onEdit(lesson.id, lesson.title);
            }}
            aria-label={tc("edit")}
            className="p-1 rounded text-outline hover:text-primary"
          >
            <Pencil className="h-3 w-3" />
          </button>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              if (!deleting) setDeleteDialogOpen(true);
            }}
            disabled={deleting}
            aria-label={tc("delete")}
            className="p-1 rounded text-outline hover:text-error disabled:opacity-50"
          >
            <Trash2 className="h-3 w-3" />
          </button>
        </div>
      </button>

      <ConfirmDialog
        open={deleteDialogOpen}
        title={tl("deleteConfirm")}
        description={lesson.title}
        confirmLabel={tc("delete")}
        cancelLabel={tc("cancel")}
        variant="danger"
        onConfirm={handleDeleteConfirm}
        onCancel={() => setDeleteDialogOpen(false)}
      />
    </>
  );
};

/* ─── Module block (left panel) ──────────────────────────────────── */
interface ModuleItemProps {
  module: ModuleWithLessons;
  index: number;
  total: number;
  selectedLessonId: string | null;
  onMoveUp: (id: string) => Promise<void>;
  onMoveDown: (id: string) => Promise<void>;
  onEditModule: (id: string, title: string) => void;
  onDeleteModule: (id: string) => Promise<void>;
  onAddLesson: (moduleId: string, title: string) => Promise<void>;
  onEditLesson: (id: string, title: string) => void;
  onDeleteLesson: (id: string, moduleId: string) => Promise<void>;
  onSelectLesson: (lesson: Lesson) => void;
}

const ModuleItem = ({
  module,
  index,
  total,
  selectedLessonId,
  onMoveUp,
  onMoveDown,
  onEditModule,
  onDeleteModule,
  onAddLesson,
  onEditLesson,
  onDeleteLesson,
  onSelectLesson,
}: ModuleItemProps) => {
  const [expanded, setExpanded] = useState(true);
  const [addingLesson, setAddingLesson] = useState(false);
  const [deletingModule, setDeletingModule] = useState(false);
  const [deleteModuleDialogOpen, setDeleteModuleDialogOpen] = useState(false);
  const [movingUp, setMovingUp] = useState(false);
  const [movingDown, setMovingDown] = useState(false);
  const tc = useTranslations("common");
  const tm = useTranslations("modules");
  const tl = useTranslations("lessons");

  const handleDeleteModuleConfirm = async () => {
    setDeleteModuleDialogOpen(false);
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
    <div className="space-y-2">
      {/* Module header */}
      <div className="flex items-center justify-between p-3 bg-surface-container-low rounded-xl border border-outline-variant group cursor-default">
        <div className="flex items-center gap-3 min-w-0">
          <GripVertical className="h-4 w-4 text-outline shrink-0" />
          <div className="min-w-0">
            <span className="text-[10px] uppercase font-bold text-primary/70 block">
              Módulo {index + 1}
            </span>
            <h4 className="font-bold text-on-surface-variant text-sm truncate">
              {module.title}
            </h4>
          </div>
        </div>
        <div className="flex items-center gap-1">
          <button
            type="button"
            disabled={index === 0 || movingUp}
            onClick={handleMoveUp}
            aria-label="Mover módulo para cima"
            className="p-1 text-outline hover:text-primary disabled:opacity-30"
          >
            <ArrowUp className="h-3.5 w-3.5" />
          </button>
          <button
            type="button"
            disabled={index === total - 1 || movingDown}
            onClick={handleMoveDown}
            aria-label="Mover módulo para baixo"
            className="p-1 text-outline hover:text-primary disabled:opacity-30"
          >
            <ArrowDown className="h-3.5 w-3.5" />
          </button>
          <button
            type="button"
            onClick={() => onEditModule(module.id, module.title)}
            aria-label={tc("edit")}
            className="p-1 text-outline hover:text-primary"
          >
            <Pencil className="h-3.5 w-3.5" />
          </button>
          <button
            type="button"
            disabled={deletingModule}
            onClick={() => setDeleteModuleDialogOpen(true)}
            aria-label={tc("delete")}
            className="p-1 text-outline hover:text-error"
          >
            <Trash2 className="h-3.5 w-3.5" />
          </button>
          <button
            type="button"
            onClick={() => setExpanded((v) => !v)}
            aria-label={expanded ? "Recolher módulo" : "Expandir módulo"}
            className="p-1 text-outline hover:text-on-surface"
          >
            {expanded ? (
              <ChevronDown className="h-3.5 w-3.5" />
            ) : (
              <ChevronRight className="h-3.5 w-3.5" />
            )}
          </button>
        </div>
      </div>

      {/* Lessons list */}
      {expanded && (
        <div className="pl-6 space-y-2">
          {module.lessons.length === 0 && !addingLesson && (
            <p className="py-2 text-center text-xs text-on-surface-variant">
              {tl("noLessons")}
            </p>
          )}

          {module.lessons.map((lesson) => (
            <LessonRow
              key={lesson.id}
              lesson={lesson}
              isSelected={selectedLessonId === lesson.id}
              onSelect={onSelectLesson}
              onEdit={onEditLesson}
              onDelete={(id) => onDeleteLesson(id, module.id)}
            />
          ))}

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
              className="flex w-full items-center gap-2 p-2 text-primary text-sm font-semibold hover:underline"
            >
              <Plus className="h-3.5 w-3.5" />
              {tl("addLesson")}
            </button>
          )}
        </div>
      )}

      <ConfirmDialog
        open={deleteModuleDialogOpen}
        title={tm("deleteConfirm")}
        description={module.title}
        confirmLabel={tc("delete")}
        cancelLabel={tc("cancel")}
        variant="danger"
        onConfirm={handleDeleteModuleConfirm}
        onCancel={() => setDeleteModuleDialogOpen(false)}
      />
    </div>
  );
};

/* ─── Main page ──────────────────────────────────────────────────── */
const CourseContentPage = () => {
  const t = useTranslations("courses");
  const tc = useTranslations("common");
  const tm = useTranslations("modules");
  const tl = useTranslations("lessons");
  const te = useTranslations("contentEditor");
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

  // Selected lesson for right-panel editor
  const [selectedLessonId, setSelectedLessonId] = useState<string | null>(null);
  const [editorTitle, setEditorTitle] = useState("");
  const [editorDescription, setEditorDescription] = useState("");
  const [savingLesson, setSavingLesson] = useState(false);

  // Publish dialog + action errors
  const [publishDialogOpen, setPublishDialogOpen] = useState(false);
  const [publishing, setPublishing] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);

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

  /* ── Select lesson for right-panel ────────────────────────────── */
  const handleSelectLesson = (lesson: Lesson) => {
    setSelectedLessonId(lesson.id);
    setEditorTitle(lesson.title);
    setEditorDescription(lesson.description ?? "");
  };

  /* ── Save lesson content from right panel ──────────────────────── */
  const handleSaveLessonContent = async () => {
    if (!selectedLessonId) return;
    setSavingLesson(true);
    try {
      await coursesApi.updateLesson(selectedLessonId, {
        title: editorTitle,
        description: editorDescription,
      });
      setCourse((prev) =>
        prev
          ? {
              ...prev,
              modules: prev.modules.map((m) => ({
                ...m,
                lessons: m.lessons.map((l) =>
                  l.id === selectedLessonId
                    ? {
                        ...l,
                        title: editorTitle,
                        description: editorDescription,
                      }
                    : l,
                ),
              })),
            }
          : prev,
      );
    } catch (err) {
      setActionError(err instanceof Error ? err.message : tc("error"));
    } finally {
      setSavingLesson(false);
    }
  };

  /* ── Module operations ─────────────────────────────────────────── */
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
      setActionError(err instanceof Error ? err.message : tc("error"));
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
      setActionError(err instanceof Error ? err.message : tc("error"));
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
      setActionError(err instanceof Error ? err.message : tc("error"));
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
      setActionError(err instanceof Error ? err.message : tc("error"));
      setCourse((prev) => (prev ? { ...prev, modules: course.modules } : prev));
    }
  };

  /* ── Lesson operations ─────────────────────────────────────────── */
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
      setActionError(err instanceof Error ? err.message : tc("error"));
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
      if (selectedLessonId === editingLessonId) setEditorTitle(title);
    } catch (err) {
      setActionError(err instanceof Error ? err.message : tc("error"));
    } finally {
      setEditingLessonId(null);
      setEditingLessonModuleId(null);
    }
  };

  const handleDeleteLesson = async (lessonId: string, moduleId: string) => {
    try {
      await coursesApi.deleteLesson(lessonId);
      if (selectedLessonId === lessonId) setSelectedLessonId(null);
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
      setActionError(err instanceof Error ? err.message : tc("error"));
    }
  };

  /* ── Publish ───────────────────────────────────────────────────── */
  const handlePublish = () => {
    if (!course) return;
    setPublishDialogOpen(true);
  };

  const handlePublishConfirm = async () => {
    if (!course) return;
    setPublishDialogOpen(false);
    setPublishing(true);
    try {
      const updated = await coursesApi.publishCourse(course.id);
      setCourse((prev) => (prev ? { ...prev, status: updated.status } : prev));
    } catch (err) {
      setActionError(err instanceof Error ? err.message : tc("error"));
    } finally {
      setPublishing(false);
    }
  };

  const selectedLesson =
    course?.modules
      .flatMap((m) => m.lessons)
      .find((l) => l.id === selectedLessonId) ?? null;

  /* ── Loading ───────────────────────────────────────────────────── */
  if (loading) {
    return (
      <div className="flex flex-col h-full">
        <div className="flex items-center justify-between px-6 py-3 border-b border-outline-variant bg-[#FDFBF9] shrink-0">
          <div className="h-6 w-48 animate-pulse rounded bg-surface-container" />
          <div className="h-10 w-32 animate-pulse rounded-full bg-surface-container" />
        </div>
        <div className="flex flex-grow overflow-hidden">
          <div className="w-[30%] border-r border-outline-variant p-4 space-y-3">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="h-16 animate-pulse rounded-xl bg-surface-container"
              />
            ))}
          </div>
          <div className="flex-1 p-8 space-y-6">
            <div className="h-10 w-64 animate-pulse rounded bg-surface-container" />
            <div className="h-40 animate-pulse rounded-2xl bg-surface-container" />
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8">
        <div className="rounded-2xl border border-error bg-red-50 p-6 text-sm text-error">
          {error}
        </div>
      </div>
    );
  }

  if (!course) return null;

  return (
    <div className="flex flex-col h-full overflow-hidden">
      {/* Action error banner */}
      {actionError && (
        <div className="flex items-center justify-between gap-4 bg-error/10 border-b border-error/20 px-6 py-3 text-sm text-error">
          <span>{actionError}</span>
          <button
            type="button"
            onClick={() => setActionError(null)}
            aria-label={tc("close")}
            className="font-semibold hover:underline shrink-0"
          >
            {tc("close")}
          </button>
        </div>
      )}

      {/* Publish confirm dialog */}
      <ConfirmDialog
        open={publishDialogOpen}
        title={tc("publish")}
        description={t("publishConfirm")}
        confirmLabel={tc("publish")}
        cancelLabel={tc("cancel")}
        onConfirm={handlePublishConfirm}
        onCancel={() => setPublishDialogOpen(false)}
      />
      {/* ── Editor top header ─────────────────────────────────────── */}
      <header className="flex items-center justify-between px-6 py-3 bg-[#FDFBF9] border-b border-outline-variant shadow-sm shadow-primary/5 shrink-0 z-10">
        <div className="flex items-center gap-4">
          <Link
            href={`/${locale}/cursos`}
            className="p-2 rounded-full hover:bg-surface-container text-on-surface-variant transition-colors"
            aria-label={tc("back")}
          >
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <div>
            <span className="font-title-lg text-title-lg text-primary">
              {te("title")}
            </span>
            <p className="text-xs text-outline font-label-md uppercase tracking-wide">
              {course.title}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 px-3 py-1.5 bg-surface-container-low border border-outline-variant rounded-full text-on-surface-variant">
            <Cloud className="h-3.5 w-3.5" />
            <span className="text-xs font-label-md">{te("saving")}</span>
          </div>
          <div className="flex items-center gap-3">
            <button
              type="button"
              className="px-6 py-2 rounded-full border border-primary text-primary font-button text-button hover:bg-surface-container-lowest transition-colors"
            >
              {te("preview")}
            </button>
            {course.status !== "published" && (
              <button
                type="button"
                disabled={publishing}
                onClick={handlePublish}
                className="px-8 py-2 rounded-full bg-primary text-on-primary font-button text-button hover:bg-primary-container transition-colors shadow-md shadow-primary/20 disabled:opacity-60"
              >
                {publishing ? tc("loading") : tc("publish")}
              </button>
            )}
            {selectedLesson && (
              <button
                type="button"
                disabled={savingLesson}
                onClick={handleSaveLessonContent}
                className="px-8 py-2 rounded-full bg-primary text-on-primary font-button text-button hover:bg-primary-container transition-colors shadow-md shadow-primary/20 disabled:opacity-60"
              >
                {savingLesson ? "..." : te("save")}
              </button>
            )}
          </div>
        </div>
      </header>

      {/* ── Split workspace ───────────────────────────────────────── */}
      <div className="flex flex-grow overflow-hidden">
        {/* Left panel — Course structure (30%) */}
        <section className="w-[30%] border-r border-outline-variant bg-surface-container-lowest flex flex-col overflow-hidden">
          {/* Panel header */}
          <div className="p-4 border-b border-outline-variant bg-white flex justify-between items-center shrink-0">
            <h3
              className="font-title-lg text-on-surface"
              style={{ fontSize: "18px" }}
            >
              {te("courseStructure")}
            </h3>
            <button
              type="button"
              onClick={() => setAddingModule(true)}
              className="p-1 text-primary hover:bg-surface-container-low rounded-full transition-colors"
              aria-label={tm("addModule")}
            >
              <Plus className="h-5 w-5" />
            </button>
          </div>

          {/* Scrollable structure tree */}
          <div className="flex-grow overflow-y-auto p-4 space-y-4">
            {course.modules.length === 0 && !addingModule && (
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <BookOpen className="mb-2 h-6 w-6 text-outline" />
                <p className="text-xs text-on-surface-variant">
                  {tm("noModules")}
                </p>
              </div>
            )}

            {course.modules.map((mod, idx) => {
              if (editingModuleId === mod.id) {
                return (
                  <div
                    key={mod.id}
                    className="rounded-xl border border-primary bg-white p-3 shadow-sm"
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

              if (editingLessonId && editingLessonModuleId === mod.id) {
                return (
                  <div
                    key={mod.id}
                    className="rounded-xl border border-primary bg-white p-3 shadow-sm"
                  >
                    <p className="mb-2 text-xs font-semibold text-on-surface">
                      {mod.title}
                    </p>
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
                );
              }

              return (
                <ModuleItem
                  key={mod.id}
                  module={mod}
                  index={idx}
                  total={course.modules.length}
                  selectedLessonId={selectedLessonId}
                  onMoveUp={(id) => handleMoveModule(id, "up")}
                  onMoveDown={(id) => handleMoveModule(id, "down")}
                  onEditModule={handleEditModule}
                  onDeleteModule={handleDeleteModule}
                  onAddLesson={handleAddLesson}
                  onEditLesson={handleEditLesson}
                  onDeleteLesson={handleDeleteLesson}
                  onSelectLesson={handleSelectLesson}
                />
              );
            })}

            {/* Add module form */}
            {addingModule ? (
              <div className="rounded-xl border border-primary bg-white p-3 shadow-sm">
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
            ) : null}

            {/* Pro tip card */}
            <div className="p-4 bg-tertiary/10 border border-tertiary/20 rounded-2xl mt-2">
              <Lightbulb className="h-4 w-4 text-tertiary" />
              <h5 className="text-sm font-bold text-tertiary mt-2">
                {te("proTip")}
              </h5>
              <p className="text-xs text-on-surface-variant mt-1 leading-relaxed">
                {te("proTipText")}
              </p>
            </div>
          </div>
        </section>

        {/* Right panel — Lesson editor workspace (70%) */}
        <section className="flex-1 bg-surface flex flex-col overflow-y-auto">
          {selectedLesson ? (
            <div className="max-w-[800px] w-full mx-auto p-12 space-y-12">
              {/* Lesson title */}
              <div className="space-y-3">
                <label
                  htmlFor="editor-lesson-title"
                  className="font-label-md text-label-md text-outline uppercase tracking-widest block"
                >
                  {te("lessonTitle")}
                </label>
                <input
                  id="editor-lesson-title"
                  type="text"
                  value={editorTitle}
                  onChange={(e) => setEditorTitle(e.target.value)}
                  className="w-full bg-transparent border-0 border-b border-outline-variant focus:ring-0 focus:border-primary font-display-md text-display-md pb-2 placeholder-outline text-on-surface outline-none"
                  placeholder="Título da aula"
                />
              </div>

              {/* Video upload zone */}
              <div className="space-y-3">
                <p className="font-label-md text-label-md text-outline uppercase tracking-widest block">
                  {te("videoContent")}
                </p>
                {selectedLesson.muxPlaybackId || selectedLesson.bunnyVideoId ? (
                  <div className="w-full aspect-video bg-on-surface rounded-2xl flex items-center justify-center">
                    <PlayCircle className="h-12 w-12 text-surface opacity-60" />
                  </div>
                ) : (
                  <div className="w-full aspect-video bg-surface-container-high rounded-[2rem] border-2 border-dashed border-outline-variant flex flex-col items-center justify-center p-8 hover:border-primary/50 transition-colors cursor-pointer">
                    <PlayCircle className="h-10 w-10 text-outline mb-4" />
                    <p className="text-sm font-semibold text-on-surface-variant">
                      Clique para enviar um vídeo
                    </p>
                    <p className="text-xs text-outline mt-1">
                      MP4, MOV — máx. 4GB
                    </p>
                  </div>
                )}
              </div>

              {/* Description */}
              <div className="space-y-3">
                <label
                  htmlFor="editor-lesson-description"
                  className="font-label-md text-label-md text-outline uppercase tracking-widest block"
                >
                  {te("lessonDescription")}
                </label>
                <div className="bg-surface-container-lowest rounded-2xl border border-outline-variant shadow-sm overflow-hidden">
                  <div className="flex items-center gap-2 p-3 border-b border-outline-variant bg-surface-container-low">
                    <button
                      type="button"
                      className="p-2 hover:bg-white rounded-lg transition-colors font-bold text-sm text-on-surface-variant"
                    >
                      B
                    </button>
                    <button
                      type="button"
                      className="p-2 hover:bg-white rounded-lg transition-colors italic text-sm text-on-surface-variant"
                    >
                      I
                    </button>
                    <button
                      type="button"
                      className="p-2 hover:bg-white rounded-lg transition-colors text-sm text-on-surface-variant"
                    >
                      ≡
                    </button>
                  </div>
                  <textarea
                    id="editor-lesson-description"
                    value={editorDescription}
                    onChange={(e) => setEditorDescription(e.target.value)}
                    rows={8}
                    className="w-full p-6 font-body-lg text-body-lg text-on-surface-variant leading-relaxed resize-none focus:outline-none bg-transparent"
                    placeholder="Descreva o conteúdo desta aula..."
                  />
                </div>
              </div>

              {/* Materials */}
              <div className="space-y-3 pb-12">
                <p className="font-label-md text-label-md text-outline uppercase tracking-widest block">
                  {te("materials")}
                </p>
                <div className="grid grid-cols-2 gap-4">
                  <button
                    type="button"
                    className="flex items-center justify-center gap-3 p-4 border-2 border-dashed border-outline-variant rounded-xl hover:bg-surface-container-low transition-colors group"
                  >
                    <Plus className="h-4 w-4 text-primary group-hover:scale-110 transition-transform" />
                    <span className="text-sm font-semibold text-on-surface-variant">
                      {te("attachFile")}
                    </span>
                  </button>
                </div>
              </div>
            </div>
          ) : (
            /* Empty state — no lesson selected */
            <div className="flex flex-col items-center justify-center h-full text-center p-8">
              <PlayCircle className="h-12 w-12 text-outline mb-4" />
              <h3
                className="font-title-lg text-on-surface"
                style={{ fontSize: "20px" }}
              >
                Selecione uma aula
              </h3>
              <p className="text-sm text-on-surface-variant mt-2 max-w-xs">
                Clique em uma aula na lista à esquerda para editar seu conteúdo.
              </p>
            </div>
          )}
        </section>
      </div>
    </div>
  );
};

export default CourseContentPage;
