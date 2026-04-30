"use client";

import { useTranslations } from "next-intl";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import {
  createInviteLink,
  listInviteLinks,
  revokeInviteLink,
  type InviteLink,
} from "../../../../../../lib/api/invites";

const CourseInvitesPage = () => {
  const t = useTranslations("invites");
  const tCommon = useTranslations("common");
  const params = useParams<{ courseId: string; locale: string }>();
  const courseId = params.courseId;

  const [links, setLinks] = useState<InviteLink[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copiedToken, setCopiedToken] = useState<string | null>(null);
  const [expiresAt, setExpiresAt] = useState("");

  const webUrl = process.env.NEXT_PUBLIC_WEB_URL ?? "http://localhost:3000";

  const load = async () => {
    try {
      setLoading(true);
      const data = await listInviteLinks(courseId);
      setLinks(data);
    } catch {
      setError(tCommon("error"));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, [courseId]);

  const handleCreate = async () => {
    try {
      setCreating(true);
      await createInviteLink(courseId, expiresAt || undefined);
      setExpiresAt("");
      await load();
    } catch {
      alert(tCommon("error"));
    } finally {
      setCreating(false);
    }
  };

  const handleRevoke = async (token: string) => {
    if (!confirm(t("revokeConfirm"))) return;
    try {
      await revokeInviteLink(token);
      await load();
    } catch {
      alert(tCommon("error"));
    }
  };

  const handleCopy = async (token: string) => {
    const url = `${webUrl}/invite/${token}`;
    await navigator.clipboard.writeText(url);
    setCopiedToken(token);
    setTimeout(() => setCopiedToken(null), 2000);
  };

  const activeLinks = links.filter((l) => l.isActive);
  const inactiveLinks = links.filter((l) => !l.isActive);

  return (
    <div className="max-w-3xl mx-auto py-8 px-4 space-y-8">
      <div>
        <h1 className="text-2xl font-semibold text-on-surface">{t("title")}</h1>
        <p className="text-on-surface-variant mt-1 text-sm">{t("subtitle")}</p>
      </div>

      {/* Create new link */}
      <div className="bg-surface border border-outline-variant rounded-xl p-6 space-y-4">
        <h2 className="font-semibold text-on-surface">{t("form.title")}</h2>
        <div className="space-y-3">
          <div>
            <label
              className="block text-sm text-on-surface-variant mb-1"
              htmlFor="expiresAt"
            >
              {t("form.expiryLabel")}
            </label>
            <input
              id="expiresAt"
              type="datetime-local"
              value={expiresAt}
              onChange={(e) => setExpiresAt(e.target.value)}
              className="w-full px-3 py-2 border border-outline-variant rounded-lg bg-surface text-on-surface text-sm focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>
          <button
            type="button"
            onClick={handleCreate}
            disabled={creating}
            className="w-full py-2.5 rounded-full bg-primary text-on-primary font-semibold text-sm hover:opacity-90 transition-opacity disabled:opacity-50"
          >
            {creating ? tCommon("loading") : t("form.submit")}
          </button>
        </div>
      </div>

      {/* Active links */}
      {loading && (
        <p className="text-on-surface-variant text-sm">{tCommon("loading")}</p>
      )}
      {error && <p className="text-red-600 text-sm">{error}</p>}

      {!loading && activeLinks.length === 0 && (
        <p className="text-on-surface-variant text-sm text-center py-4">
          {t("noLinks")}
        </p>
      )}

      {activeLinks.length > 0 && (
        <div className="space-y-3">
          {activeLinks.map((link) => (
            <div
              key={link.id}
              className="bg-surface border border-outline-variant rounded-xl p-4 space-y-3"
            >
              <div className="flex items-center justify-between gap-2">
                <span className="text-xs px-2 py-0.5 rounded-full bg-primary-container text-primary font-semibold">
                  {t("active")}
                </span>
                <span className="text-xs text-on-surface-variant">
                  {link.expiresAt
                    ? `${t("expires")}: ${new Date(link.expiresAt).toLocaleDateString("pt-BR")}`
                    : t("noExpiry")}
                </span>
              </div>

              <div className="flex items-center gap-2 bg-surface-container rounded-lg px-3 py-2">
                <span className="flex-1 text-xs text-on-surface-variant font-mono truncate">
                  {webUrl}/invite/{link.token}
                </span>
                <button
                  type="button"
                  onClick={() => handleCopy(link.token)}
                  className="shrink-0 text-xs text-primary font-semibold hover:opacity-80"
                >
                  {copiedToken === link.token ? t("copied") : t("copy")}
                </button>
              </div>

              <button
                type="button"
                onClick={() => handleRevoke(link.token)}
                className="text-xs text-red-500 hover:text-red-700 transition-colors"
              >
                {t("revoke")}
              </button>
            </div>
          ))}
        </div>
      )}

      {inactiveLinks.length > 0 && (
        <div className="space-y-2">
          <h3 className="text-xs font-semibold text-on-surface-variant uppercase tracking-wide">
            {t("revoked")}
          </h3>
          {inactiveLinks.map((link) => (
            <div
              key={link.id}
              className="bg-surface-container rounded-lg px-3 py-2 opacity-60"
            >
              <span className="text-xs text-on-surface-variant font-mono truncate block">
                {webUrl}/invite/{link.token.slice(0, 16)}...
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default CourseInvitesPage;
