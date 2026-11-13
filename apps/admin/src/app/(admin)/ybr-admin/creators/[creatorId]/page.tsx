"use client";

import {
  getCreatorStorage,
  listCreators,
  toggleCreatorStatus,
  updateCreator,
  type Creator,
  type CreatorStorageStats,
} from "@/lib/api/ybr-admin";
import {
  ArrowLeft,
  BookOpen,
  CheckCircle,
  Database,
  Film,
  HardDrive,
  Users,
  XCircle,
} from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";

const formatBytes = (bytes: number): string => {
  if (bytes === 0) return "0 B";
  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${(bytes / Math.pow(k, i)).toFixed(1)} ${sizes[i]}`;
};

const formatDuration = (seconds: number): string => {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  if (h > 0) return `${h}h ${m}min`;
  return `${m}min`;
};

const planColors: Record<string, string> = {
  starter: "bg-surface-container text-on-surface-variant",
  growth: "bg-blue-50 text-blue-700",
  pro: "bg-purple-50 text-purple-700",
  agency: "bg-amber-50 text-amber-700",
};

const CreatorDetailPage = () => {
  const params = useParams();
  const creatorId = params.creatorId as string;

  const [creator, setCreator] = useState<
    (Creator & { coursesLimit?: number | null }) | null
  >(null);
  const [storage, setStorage] = useState<CreatorStorageStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [storageLoading, setStorageLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [editMode, setEditMode] = useState(false);
  const [saving, setSaving] = useState(false);
  const [formPlan, setFormPlan] = useState<
    "starter" | "growth" | "pro" | "agency"
  >("starter");
  const [formLimit, setFormLimit] = useState<string>("");
  const [toggling, setToggling] = useState(false);

  useEffect(() => {
    const load = async () => {
      try {
        const all = await listCreators();
        const found = all.find((c) => c.id === creatorId);
        if (!found) {
          setError("Criador não encontrado");
          return;
        }
        setCreator(found);
        setFormPlan(found.plan as "starter" | "growth" | "pro" | "agency");
        setFormLimit(
          found.coursesLimit != null ? String(found.coursesLimit) : "10",
        );
      } catch {
        setError("Erro ao carregar dados do criador");
      } finally {
        setLoading(false);
      }

      try {
        const data = await getCreatorStorage(creatorId);
        setStorage(data);
      } catch {
        setStorage(null);
      } finally {
        setStorageLoading(false);
      }
    };
    load();
  }, [creatorId]);

  const handleSave = async () => {
    if (!creator) return;
    setSaving(true);
    try {
      const limitVal =
        formLimit.trim() === "" ? null : Number.parseInt(formLimit, 10);
      await updateCreator(creatorId, {
        plan: formPlan,
        coursesLimit: Number.isNaN(limitVal as number) ? null : limitVal,
      });
      setCreator((prev) =>
        prev ? { ...prev, plan: formPlan, coursesLimit: limitVal } : prev,
      );
      setEditMode(false);
    } catch {
      // silently fail
    } finally {
      setSaving(false);
    }
  };

  const handleToggleStatus = async () => {
    if (!creator) return;
    setToggling(true);
    try {
      await toggleCreatorStatus(creator.id, !creator.isActive);
      setCreator((prev) =>
        prev ? { ...prev, isActive: !prev.isActive } : prev,
      );
    } catch {
      // silently fail
    } finally {
      setToggling(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <div className="w-8 h-8 border-2 border-[#1ab5ad] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (error || !creator) {
    return (
      <div className="max-w-4xl mx-auto py-8 px-4">
        <p className="text-error">{error ?? "Criador não encontrado"}</p>
        <Link
          href="/ybr-admin/creators"
          className="mt-4 inline-flex items-center gap-2 text-[#1ab5ad] text-sm"
        >
          <ArrowLeft className="h-4 w-4" /> Voltar
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto py-8 px-4 space-y-6">
      {/* Back */}
      <Link
        href="/ybr-admin/creators"
        className="inline-flex items-center gap-2 text-on-surface-variant hover:text-[#1ab5ad] text-sm transition-colors"
      >
        <ArrowLeft className="h-4 w-4" />
        Todos os criadores
      </Link>

      {/* Header card */}
      <div className="bg-surface rounded-xl border border-outline-variant p-6 shadow-card">
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-full bg-[#e6f7f6] flex items-center justify-center text-[#1ab5ad] text-xl font-black shrink-0">
              {creator.name.charAt(0).toUpperCase()}
            </div>
            <div>
              <h1 className="text-xl font-bold text-on-surface">
                {creator.name}
              </h1>
              <p className="text-sm text-on-surface-variant">{creator.email}</p>
              <div className="flex items-center gap-2 mt-2">
                <span
                  className={`text-xs font-semibold px-2 py-0.5 rounded-full ${planColors[creator.plan] ?? planColors.starter}`}
                >
                  {creator.plan.charAt(0).toUpperCase() + creator.plan.slice(1)}
                </span>
                {creator.isActive ? (
                  <span className="flex items-center gap-1 text-xs font-semibold text-success bg-success-container px-2 py-0.5 rounded-full">
                    <CheckCircle className="h-3 w-3" /> Ativo
                  </span>
                ) : (
                  <span className="flex items-center gap-1 text-xs font-semibold text-error bg-error-container px-2 py-0.5 rounded-full">
                    <XCircle className="h-3 w-3" /> Suspenso
                  </span>
                )}
              </div>
            </div>
          </div>

          <div className="flex gap-2 flex-wrap">
            <button
              type="button"
              onClick={handleToggleStatus}
              disabled={toggling}
              className={`px-4 py-2 rounded-full text-sm font-semibold transition-colors disabled:opacity-50 ${
                creator.isActive
                  ? "bg-error-container text-error hover:bg-red-100"
                  : "bg-success-container text-success hover:bg-green-100"
              }`}
            >
              {toggling ? "…" : creator.isActive ? "Suspender" : "Ativar"}
            </button>
          </div>
        </div>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-surface rounded-xl border border-outline-variant p-4 shadow-card text-center">
          <BookOpen className="h-5 w-5 text-[#1ab5ad] mx-auto mb-2" />
          <p className="text-2xl font-black text-on-surface">
            {creator.activeCourses}
          </p>
          <p className="text-xs text-on-surface-variant mt-0.5">
            Cursos Ativos
          </p>
        </div>
        <div className="bg-surface rounded-xl border border-outline-variant p-4 shadow-card text-center">
          <Users className="h-5 w-5 text-[#1ab5ad] mx-auto mb-2" />
          <p className="text-2xl font-black text-on-surface">
            {creator.activeStudents}
          </p>
          <p className="text-xs text-on-surface-variant mt-0.5">
            Alunos Ativos
          </p>
        </div>
        <div className="bg-surface rounded-xl border border-outline-variant p-4 shadow-card text-center">
          <Film className="h-5 w-5 text-[#1ab5ad] mx-auto mb-2" />
          <p className="text-2xl font-black text-on-surface">
            {storageLoading ? "—" : (storage?.videos.totalVideos ?? 0)}
          </p>
          <p className="text-xs text-on-surface-variant mt-0.5">Vídeos</p>
        </div>
        <div className="bg-surface rounded-xl border border-outline-variant p-4 shadow-card text-center">
          <Database className="h-5 w-5 text-[#1ab5ad] mx-auto mb-2" />
          <p className="text-2xl font-black text-on-surface">
            {storageLoading
              ? "—"
              : formatBytes(storage?.documents.totalBytes ?? 0)}
          </p>
          <p className="text-xs text-on-surface-variant mt-0.5">Docs Storage</p>
        </div>
      </div>

      {/* Storage detail */}
      <div className="bg-surface rounded-xl border border-outline-variant p-6 shadow-card">
        <h2 className="text-base font-bold text-on-surface mb-4 flex items-center gap-2">
          <HardDrive className="h-5 w-5 text-[#1ab5ad]" />
          Uso de Storage
        </h2>
        {storageLoading ? (
          <p className="text-sm text-on-surface-variant">Carregando...</p>
        ) : storage ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="p-4 bg-surface-container-low rounded-lg">
              <p className="text-xs text-on-surface-variant uppercase tracking-wider mb-2">
                Documentos (R2)
              </p>
              <p className="text-lg font-bold text-on-surface">
                {formatBytes(storage.documents.totalBytes)}
              </p>
              <p className="text-sm text-on-surface-variant mt-0.5">
                {storage.documents.totalFiles} arquivo
                {storage.documents.totalFiles !== 1 ? "s" : ""}
              </p>
            </div>
            <div className="p-4 bg-surface-container-low rounded-lg">
              <p className="text-xs text-on-surface-variant uppercase tracking-wider mb-2">
                Vídeos (Bunny/Mux)
              </p>
              <p className="text-lg font-bold text-on-surface">
                {storage.videos.totalVideos} vídeo
                {storage.videos.totalVideos !== 1 ? "s" : ""}
              </p>
              <p className="text-sm text-on-surface-variant mt-0.5">
                {formatDuration(storage.videos.totalDurationSeconds)} de
                conteúdo
              </p>
            </div>
          </div>
        ) : (
          <p className="text-sm text-on-surface-variant">
            Dados de storage indisponíveis.
          </p>
        )}
      </div>

      {/* Plan & Limits */}
      <div className="bg-surface rounded-xl border border-outline-variant p-6 shadow-card">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-base font-bold text-on-surface">
            Plano e Limites
          </h2>
          {!editMode ? (
            <button
              type="button"
              onClick={() => setEditMode(true)}
              className="px-3 py-1.5 rounded-full text-sm font-semibold bg-[#e6f7f6] text-[#1ab5ad] hover:bg-[#1ab5ad] hover:text-white transition-colors"
            >
              Editar
            </button>
          ) : (
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setEditMode(false)}
                className="px-3 py-1.5 rounded-full text-sm font-semibold border border-outline-variant text-on-surface-variant hover:bg-surface-container transition-colors"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleSave}
                disabled={saving}
                className="px-3 py-1.5 rounded-full text-sm font-semibold bg-[#1ab5ad] text-white hover:bg-[#17a099] transition-colors disabled:opacity-50"
              >
                {saving ? "Salvando..." : "Salvar"}
              </button>
            </div>
          )}
        </div>

        {!editMode ? (
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-xs text-on-surface-variant uppercase tracking-wider">
                Plano
              </p>
              <p className="text-base font-semibold text-on-surface capitalize mt-1">
                {creator.plan}
              </p>
            </div>
            <div>
              <p className="text-xs text-on-surface-variant uppercase tracking-wider">
                Limite de Cursos
              </p>
              <p className="text-base font-semibold text-on-surface mt-1">
                {creator.coursesLimit != null
                  ? creator.coursesLimit
                  : "10 (padrão)"}
              </p>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label
                className="block text-xs text-on-surface-variant uppercase tracking-wider mb-1.5"
                htmlFor="plan-select"
              >
                Plano
              </label>
              <select
                id="plan-select"
                value={formPlan}
                onChange={(e) => setFormPlan(e.target.value as typeof formPlan)}
                className="w-full px-3 py-2 rounded-lg border border-outline-variant bg-surface text-on-surface text-sm focus:outline-none focus:ring-2 focus:ring-[#1ab5ad]"
              >
                <option value="starter">Starter</option>
                <option value="growth">Growth</option>
                <option value="pro">Pro</option>
                <option value="agency">Agency</option>
              </select>
            </div>
            <div>
              <label
                className="block text-xs text-on-surface-variant uppercase tracking-wider mb-1.5"
                htmlFor="limit-input"
              >
                Limite de Cursos
              </label>
              <input
                id="limit-input"
                type="number"
                min="0"
                value={formLimit}
                onChange={(e) => setFormLimit(e.target.value)}
                placeholder="Ex: 10"
                className="w-full px-3 py-2 rounded-lg border border-outline-variant bg-surface text-on-surface text-sm focus:outline-none focus:ring-2 focus:ring-[#1ab5ad]"
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CreatorDetailPage;
