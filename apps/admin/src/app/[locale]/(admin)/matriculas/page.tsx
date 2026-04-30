"use client";

import { useTranslations } from "next-intl";
import { useEffect, useState } from "react";
import {
  activateEnrollment,
  listPendingEnrollments,
  revokeEnrollment,
  type PendingEnrollment,
} from "../../../../lib/api/invites";

const PendingEnrollmentsPage = () => {
  const t = useTranslations("enrollments");
  const tCommon = useTranslations("common");
  const [enrollments, setEnrollments] = useState<PendingEnrollment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionId, setActionId] = useState<string | null>(null);

  const load = async () => {
    try {
      setLoading(true);
      const data = await listPendingEnrollments();
      setEnrollments(data);
    } catch {
      setError(tCommon("error"));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const handleActivate = async (enrollment: PendingEnrollment) => {
    if (!confirm(`${t("activateConfirm")} ${enrollment.studentName}?`)) return;
    try {
      setActionId(enrollment.id);
      await activateEnrollment(enrollment.id);
      alert(t("activateSuccess"));
      await load();
    } catch {
      alert(tCommon("error"));
    } finally {
      setActionId(null);
    }
  };

  const handleRevoke = async (enrollment: PendingEnrollment) => {
    if (!confirm(`${t("revokeConfirm")} ${enrollment.studentName}?`)) return;
    try {
      setActionId(enrollment.id);
      await revokeEnrollment(enrollment.id);
      alert(t("revokeSuccess"));
      await load();
    } catch {
      alert(tCommon("error"));
    } finally {
      setActionId(null);
    }
  };

  return (
    <div className="max-w-5xl mx-auto py-8 px-4 space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-on-surface">{t("title")}</h1>
        <p className="text-on-surface-variant mt-1 text-sm">{t("subtitle")}</p>
      </div>

      {loading && (
        <p className="text-on-surface-variant text-sm">{tCommon("loading")}</p>
      )}

      {error && <p className="text-red-600 text-sm">{error}</p>}

      {!loading && !error && enrollments.length === 0 && (
        <div className="bg-surface border border-outline-variant rounded-xl p-10 text-center">
          <p className="text-on-surface-variant">{t("noPending")}</p>
        </div>
      )}

      {!loading && enrollments.length > 0 && (
        <div className="bg-surface border border-outline-variant rounded-xl overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-outline-variant bg-surface-container">
                <th className="px-4 py-3 text-left font-semibold text-on-surface-variant uppercase tracking-wide text-xs">
                  {t("studentName")}
                </th>
                <th className="px-4 py-3 text-left font-semibold text-on-surface-variant uppercase tracking-wide text-xs">
                  {t("studentEmail")}
                </th>
                <th className="px-4 py-3 text-left font-semibold text-on-surface-variant uppercase tracking-wide text-xs">
                  {t("course")}
                </th>
                <th className="px-4 py-3 text-left font-semibold text-on-surface-variant uppercase tracking-wide text-xs">
                  {t("enrolledAt")}
                </th>
                <th className="px-4 py-3 text-left font-semibold text-on-surface-variant uppercase tracking-wide text-xs">
                  {tCommon("actions")}
                </th>
              </tr>
            </thead>
            <tbody>
              {enrollments.map((enrollment) => (
                <tr
                  key={enrollment.id}
                  className="border-b border-outline-variant last:border-0 hover:bg-surface-container/40 transition-colors"
                >
                  <td className="px-4 py-3 font-medium text-on-surface">
                    {enrollment.studentName}
                  </td>
                  <td className="px-4 py-3 text-on-surface-variant">
                    {enrollment.studentEmail}
                  </td>
                  <td className="px-4 py-3 text-on-surface-variant">
                    {enrollment.courseTitle}
                  </td>
                  <td className="px-4 py-3 text-on-surface-variant">
                    {new Date(enrollment.enrolledAt).toLocaleDateString(
                      "pt-BR",
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => handleActivate(enrollment)}
                        disabled={actionId === enrollment.id}
                        className="px-3 py-1.5 text-xs rounded-full bg-primary text-on-primary hover:opacity-90 transition-opacity disabled:opacity-50"
                      >
                        {t("activate")}
                      </button>
                      <button
                        type="button"
                        onClick={() => handleRevoke(enrollment)}
                        disabled={actionId === enrollment.id}
                        className="px-3 py-1.5 text-xs rounded-full border border-outline-variant text-on-surface-variant hover:bg-surface-container transition-colors disabled:opacity-50"
                      >
                        {t("revoke")}
                      </button>
                    </div>
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

export default PendingEnrollmentsPage;
