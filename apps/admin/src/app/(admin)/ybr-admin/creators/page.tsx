"use client";

import { useTranslations } from "next-intl";
import Link from "next/link";
import { useEffect, useState } from "react";
import {
  createCreator,
  listCreators,
  toggleCreatorStatus,
  type Creator,
} from "@/lib/api/ybr-admin";

const YBRAdminCreatorsPage = () => {
  const t = useTranslations("ybrAdmin");
  const tCommon = useTranslations("common");

  const [creators, setCreators] = useState<Creator[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [togglingId, setTogglingId] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    plan: "starter" as const,
  });

  const load = async () => {
    try {
      setLoading(true);
      const data = await listCreators();
      setCreators(data);
    } catch {
      setError(tCommon("error"));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    if (!formData.name.trim() || !formData.email.trim()) return;

    try {
      setSubmitting(true);
      await createCreator(formData);
      setShowForm(false);
      setFormData({ name: "", email: "", plan: "starter" });
      await load();
    } catch (err) {
      setFormError(err instanceof Error ? err.message : tCommon("error"));
    } finally {
      setSubmitting(false);
    }
  };

  const planColors: Record<string, string> = {
    starter: "bg-surface-container text-on-surface-variant",
    growth: "bg-blue-50 text-blue-700",
    pro: "bg-purple-50 text-purple-700",
    agency: "bg-amber-50 text-amber-700",
  };

  const handleToggleStatus = async (creator: Creator) => {
    setTogglingId(creator.id);
    try {
      await toggleCreatorStatus(creator.id, !creator.isActive);
      setCreators((prev) =>
        prev.map((c) =>
          c.id === creator.id ? { ...c, isActive: !c.isActive } : c,
        ),
      );
    } catch {
      // silently fail — show error state inline if needed
    } finally {
      setTogglingId(null);
    }
  };

  return (
    <div className="max-w-6xl mx-auto py-8 px-4 space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-on-surface">
            {t("title")}
          </h1>
          <p className="text-on-surface-variant mt-1 text-sm">
            {t("subtitle")}
          </p>
        </div>
        <button
          type="button"
          onClick={() => setShowForm((v) => !v)}
          className="shrink-0 px-4 py-2.5 rounded-full bg-primary text-on-primary font-semibold text-sm hover:opacity-90 transition-opacity"
        >
          {t("newCreator")}
        </button>
      </div>

      {/* Create form */}
      {showForm && (
        <div className="bg-surface border border-outline-variant rounded-xl p-6 space-y-4">
          <h2 className="font-semibold text-on-surface">{t("form.title")}</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label
                  className="block text-sm text-on-surface-variant mb-1"
                  htmlFor="name"
                >
                  {t("form.nameLabel")}
                </label>
                <input
                  id="name"
                  type="text"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData((d) => ({ ...d, name: e.target.value }))
                  }
                  placeholder={t("form.namePlaceholder")}
                  required
                  className="w-full px-3 py-2 border border-outline-variant rounded-lg bg-surface text-on-surface text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
              <div>
                <label
                  className="block text-sm text-on-surface-variant mb-1"
                  htmlFor="email"
                >
                  {t("form.emailLabel")}
                </label>
                <input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) =>
                    setFormData((d) => ({ ...d, email: e.target.value }))
                  }
                  placeholder={t("form.emailPlaceholder")}
                  required
                  className="w-full px-3 py-2 border border-outline-variant rounded-lg bg-surface text-on-surface text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
            </div>
            <div>
              <label
                className="block text-sm text-on-surface-variant mb-1"
                htmlFor="plan"
              >
                {t("form.planLabel")}
              </label>
              <select
                id="plan"
                value={formData.plan}
                onChange={(e) =>
                  setFormData((d) => ({
                    ...d,
                    plan: e.target.value as typeof formData.plan,
                  }))
                }
                className="w-full px-3 py-2 border border-outline-variant rounded-lg bg-surface text-on-surface text-sm focus:outline-none focus:ring-2 focus:ring-primary"
              >
                <option value="starter">{t("form.planStarter")}</option>
                <option value="growth">{t("form.planGrowth")}</option>
                <option value="pro">{t("form.planPro")}</option>
                <option value="agency">{t("form.planAgency")}</option>
              </select>
            </div>
            {formError && <p className="text-red-600 text-sm">{formError}</p>}
            <div className="flex gap-3">
              <button
                type="submit"
                disabled={submitting}
                className="flex-1 py-2.5 rounded-full bg-primary text-on-primary font-semibold text-sm hover:opacity-90 transition-opacity disabled:opacity-50"
              >
                {submitting ? tCommon("loading") : t("form.submit")}
              </button>
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="flex-1 py-2.5 rounded-full border border-outline-variant text-on-surface-variant text-sm hover:bg-surface-container transition-colors"
              >
                {tCommon("cancel")}
              </button>
            </div>
          </form>
        </div>
      )}

      {loading && (
        <p className="text-on-surface-variant text-sm">{tCommon("loading")}</p>
      )}
      {error && <p className="text-red-600 text-sm">{error}</p>}

      {!loading && !error && creators.length === 0 && (
        <div className="bg-surface border border-outline-variant rounded-xl p-10 text-center">
          <p className="text-on-surface-variant">{t("noCreators")}</p>
        </div>
      )}

      {!loading && creators.length > 0 && (
        <div className="bg-surface border border-outline-variant rounded-xl overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-outline-variant bg-surface-container">
                <th className="px-4 py-3 text-left font-semibold text-on-surface-variant uppercase tracking-wide text-xs">
                  {t("table.name")}
                </th>
                <th className="px-4 py-3 text-left font-semibold text-on-surface-variant uppercase tracking-wide text-xs">
                  {t("table.email")}
                </th>
                <th className="px-4 py-3 text-center font-semibold text-on-surface-variant uppercase tracking-wide text-xs">
                  {t("table.plan")}
                </th>
                <th className="px-4 py-3 text-center font-semibold text-on-surface-variant uppercase tracking-wide text-xs">
                  {t("table.activeCourses")}
                </th>
                <th className="px-4 py-3 text-center font-semibold text-on-surface-variant uppercase tracking-wide text-xs">
                  {t("table.activeStudents")}
                </th>
                <th className="px-4 py-3 text-left font-semibold text-on-surface-variant uppercase tracking-wide text-xs">
                  {t("table.createdAt")}
                </th>
                <th className="px-4 py-3 text-center font-semibold text-on-surface-variant uppercase tracking-wide text-xs">
                  {t("table.status")}
                </th>
                <th className="px-4 py-3 text-left font-semibold text-on-surface-variant uppercase tracking-wide text-xs">
                  {tCommon("actions")}
                </th>
              </tr>
            </thead>
            <tbody>
              {creators.map((creator) => (
                <tr
                  key={creator.id}
                  className="border-b border-outline-variant last:border-0 hover:bg-surface-container/40 transition-colors"
                >
                  <td className="px-4 py-3 font-medium text-on-surface">
                    {creator.name}
                  </td>
                  <td className="px-4 py-3 text-on-surface-variant">
                    {creator.email}
                  </td>
                  <td className="px-4 py-3 text-center">
                    <span
                      className={`text-xs px-2 py-0.5 rounded-full font-semibold ${planColors[creator.plan] ?? planColors.starter}`}
                    >
                      {creator.plan}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-center text-on-surface-variant">
                    {creator.activeCourses}
                  </td>
                  <td className="px-4 py-3 text-center text-on-surface-variant">
                    {creator.activeStudents}
                  </td>
                  <td className="px-4 py-3 text-on-surface-variant">
                    {new Date(creator.createdAt).toLocaleDateString("pt-BR")}
                  </td>
                  <td className="px-4 py-3 text-center">
                    <button
                      type="button"
                      disabled={togglingId === creator.id}
                      onClick={() => handleToggleStatus(creator)}
                      className={`text-xs px-3 py-1 rounded-full font-semibold transition-colors disabled:opacity-50 ${
                        creator.isActive
                          ? "bg-green-50 text-green-700 hover:bg-green-100"
                          : "bg-red-50 text-red-700 hover:bg-red-100"
                      }`}
                    >
                      {togglingId === creator.id
                        ? "..."
                        : creator.isActive
                          ? t("table.active")
                          : t("table.suspended")}
                    </button>
                  </td>
                  <td className="px-4 py-3">
                    <Link
                      href={`/ybr-admin/creators/${creator.id}`}
                      className="text-xs text-[#1ab5ad] hover:underline font-semibold"
                    >
                      Ver detalhes
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default YBRAdminCreatorsPage;
