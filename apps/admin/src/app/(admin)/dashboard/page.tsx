"use client";

import { getPlatformStats, type PlatformStats } from "@/lib/api/ybr-admin";
import { useAdminAuthStore } from "@/stores/auth";
import {
  BarChart2,
  BookOpen,
  Plus,
  TrendingUp,
  UserPlus,
  Users,
} from "lucide-react";
import { useTranslations } from "next-intl";
import Link from "next/link";
import { useEffect, useState } from "react";

const AdminPlatformDashboard = () => {
  const [stats, setStats] = useState<PlatformStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getPlatformStats()
      .then(setStats)
      .catch(() => setStats(null))
      .finally(() => setLoading(false));
  }, []);

  const formatNumber = (n: number) => n.toLocaleString("pt-BR");

  return (
    <div className="space-y-8">
      {/* Header */}
      <section>
        <h2 className="text-2xl font-bold text-on-surface">Painel YBR Admin</h2>
        <p className="text-on-surface-variant mt-1 text-sm">
          Visão geral de toda a plataforma
        </p>
      </section>

      {/* KPI Cards */}
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Total creators */}
        <div className="bg-surface p-6 rounded-xl border border-outline-variant shadow-card">
          <div className="flex justify-between items-start mb-4">
            <div className="p-2 rounded-lg bg-[#e6f7f6] text-[#1ab5ad]">
              <Users className="h-5 w-5" />
            </div>
            <span className="text-xs font-bold text-[#1ab5ad] bg-[#e6f7f6] px-2 py-1 rounded-full">
              {loading ? "—" : stats ? `${stats.activeCreators} ativos` : "—"}
            </span>
          </div>
          <p className="text-label-md text-on-surface-variant uppercase tracking-wider text-xs">
            Total de Criadores
          </p>
          <p className="text-3xl font-black text-on-surface mt-2 leading-none">
            {loading ? "—" : formatNumber(stats?.totalCreators ?? 0)}
          </p>
        </div>

        {/* Published courses */}
        <div className="bg-surface p-6 rounded-xl border border-outline-variant shadow-card">
          <div className="flex justify-between items-start mb-4">
            <div className="p-2 rounded-lg bg-[#e6f7f6] text-[#1ab5ad]">
              <BookOpen className="h-5 w-5" />
            </div>
            <span className="text-xs font-bold text-success bg-success-container px-2 py-1 rounded-full">
              {loading
                ? "—"
                : stats
                  ? `${stats.publishedCourses} publicados`
                  : "—"}
            </span>
          </div>
          <p className="text-label-md text-on-surface-variant uppercase tracking-wider text-xs">
            Total de Cursos
          </p>
          <p className="text-3xl font-black text-on-surface mt-2 leading-none">
            {loading ? "—" : formatNumber(stats?.totalCourses ?? 0)}
          </p>
        </div>

        {/* Total students */}
        <div className="bg-[#e6f7f6] p-6 rounded-xl border border-[#1ab5ad]/20 shadow-card">
          <div className="flex justify-between items-start mb-4">
            <div className="p-2 rounded-lg bg-white text-[#1ab5ad]">
              <TrendingUp className="h-5 w-5" />
            </div>
            <span className="text-xs font-bold text-[#17a099] bg-white px-2 py-1 rounded-full">
              {loading
                ? "—"
                : stats
                  ? `${stats.totalEnrollments} matrículas`
                  : "—"}
            </span>
          </div>
          <p className="text-label-md text-[#1ab5ad] uppercase tracking-wider text-xs">
            Total de Alunos
          </p>
          <p className="text-3xl font-black text-[#0d2233] mt-2 leading-none">
            {loading ? "—" : formatNumber(stats?.totalStudents ?? 0)}
          </p>
        </div>
      </section>

      {/* Quick actions */}
      <section className="bg-surface rounded-xl border border-outline-variant p-6 shadow-card">
        <h3 className="text-lg font-bold text-on-surface mb-4">
          Ações Rápidas
        </h3>
        <div className="flex flex-wrap gap-3">
          <Link
            href="/ybr-admin/creators"
            className="flex items-center gap-2 px-4 py-2 rounded-full bg-[#1ab5ad] text-white text-sm font-semibold hover:bg-[#17a099] transition-colors"
          >
            <Users className="h-4 w-4" />
            Gerenciar Criadores
          </Link>
          <Link
            href="/ybr-admin/creators"
            className="flex items-center gap-2 px-4 py-2 rounded-full border border-outline-variant bg-surface text-on-surface text-sm font-semibold hover:bg-surface-container transition-colors"
          >
            <Plus className="h-4 w-4" />
            Novo Criador
          </Link>
        </div>
      </section>
    </div>
  );
};

const CreatorDashboardPlaceholder = () => {
  const t = useTranslations("dashboard");

  return (
    <div className="space-y-8">
      <section>
        <h2 className="font-display-md text-display-md font-bold text-on-surface">
          {t("greeting")}
        </h2>
        <p className="font-body-md text-body-md text-on-surface-variant mt-1">
          {t("welcomeBack")}
        </p>
      </section>

      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-surface p-6 rounded-xl border border-outline-variant shadow-card hover:shadow-card-hover transition-shadow">
          <div className="flex justify-between items-start mb-4">
            <div className="p-2 bg-primary-muted rounded-lg text-primary">
              <Users className="h-5 w-5" />
            </div>
            <span className="text-xs font-bold text-success bg-success-container px-2 py-1 rounded-full">
              +12%
            </span>
          </div>
          <p className="font-label-md text-label-md text-on-surface-variant uppercase tracking-wider">
            {t("stats.totalStudents")}
          </p>
          <p className="text-display-md font-black text-on-surface mt-2 tracking-tight leading-none">
            —
          </p>
        </div>

        <div className="bg-primary-container p-6 rounded-xl border border-primary/20 shadow-card hover:shadow-card-hover transition-shadow">
          <div className="flex justify-between items-start mb-4">
            <div className="p-2 bg-primary-muted rounded-lg text-primary">
              <TrendingUp className="h-5 w-5" />
            </div>
            <span className="text-xs font-bold text-success bg-success-container px-2 py-1 rounded-full">
              +8.4%
            </span>
          </div>
          <p className="font-label-md text-label-md text-on-surface-variant uppercase tracking-wider">
            {t("stats.monthlyRevenue")}
          </p>
          <p className="text-display-md font-black text-primary mt-2 tracking-tight leading-none">
            —
          </p>
        </div>

        <div className="bg-surface p-6 rounded-xl border border-outline-variant shadow-card hover:shadow-card-hover transition-shadow">
          <div className="flex justify-between items-start mb-4">
            <div className="p-2 bg-surface-container rounded-lg text-on-surface-variant">
              <BarChart2 className="h-5 w-5" />
            </div>
            <span className="text-xs font-bold text-on-surface-variant bg-surface-container px-2 py-1 rounded-full">
              {t("stats.stable")}
            </span>
          </div>
          <p className="font-label-md text-label-md text-on-surface-variant uppercase tracking-wider">
            {t("stats.completionRate")}
          </p>
          <p className="text-display-md font-black text-on-surface mt-2 tracking-tight leading-none">
            —
          </p>
        </div>

        <div className="bg-surface p-6 rounded-xl border border-outline-variant shadow-card hover:shadow-card-hover transition-shadow">
          <div className="flex justify-between items-start mb-4">
            <div className="p-2 bg-primary-muted rounded-lg text-primary">
              <UserPlus className="h-5 w-5" />
            </div>
            <span className="text-xs font-bold text-success bg-success-container px-2 py-1 rounded-full">
              {t("stats.new")}
            </span>
          </div>
          <p className="font-label-md text-label-md text-on-surface-variant uppercase tracking-wider">
            {t("stats.newEnrollments")}
          </p>
          <p className="text-display-md font-black text-on-surface mt-2 tracking-tight leading-none">
            —
          </p>
        </div>
      </section>
    </div>
  );
};

const AdminDashboardPage = () => {
  const user = useAdminAuthStore((s) => s.user);

  if (user?.role === "admin") return <AdminPlatformDashboard />;
  return <CreatorDashboardPlaceholder />;
};

export default AdminDashboardPage;
