"use client";

import {
  getInviteInfo,
  type InviteTokenInfo,
  registerViaInvite,
} from "@/lib/api/invites";
import { CheckCircle, Utensils } from "lucide-react";
import { useTranslations } from "next-intl";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";

const InvitePage = () => {
  const t = useTranslations("invite");
  const params = useParams<{ token: string }>();
  const { token } = params;

  const [info, setInfo] = useState<InviteTokenInfo | null>(null);
  const [loadError, setLoadError] = useState(false);
  const [loading, setLoading] = useState(true);
  const [submitted, setSubmitted] = useState(false);
  const [courseTitle, setCourseTitle] = useState("");

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
  });
  const [formError, setFormError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const load = async () => {
      try {
        const data = await getInviteInfo(token);
        setInfo(data);
      } catch {
        setLoadError(true);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [token]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (formData.password.length < 8) {
      setFormError(t("error.generic"));
      return;
    }

    try {
      setSubmitting(true);
      const result = await registerViaInvite(token, formData);
      setCourseTitle(result.courseTitle);
      setSubmitted(true);
    } catch (err) {
      const msg = err instanceof Error ? err.message : "";
      if (
        msg.includes("EMAIL_ALREADY_EXISTS") ||
        msg.toLowerCase().includes("email already")
      ) {
        setFormError(t("error.emailExists"));
      } else {
        setFormError(t("error.generic"));
      }
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <p className="text-on-surface-variant">{t("loading")}</p>
      </div>
    );
  }

  if (loadError || !info) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center space-y-3">
          <p className="text-on-surface font-semibold">{t("invalid")}</p>
          <Link href="/login" className="text-primary text-sm hover:underline">
            {t("alreadyHaveAccount")} {t("loginLink")}
          </Link>
        </div>
      </div>
    );
  }

  if (submitted) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-6">
        <div className="w-full max-w-md bg-surface border border-outline-variant rounded-2xl p-8 text-center space-y-4 shadow-card">
          <CheckCircle className="w-12 h-12 text-primary mx-auto" />
          <h1 className="text-xl font-semibold text-on-surface">
            {t("pendingTitle")}
          </h1>
          <p className="text-on-surface-variant text-sm">
            {t("pendingMessage").replace("{courseTitle}", courseTitle)}
          </p>
          <Link
            href="/login"
            className="block mt-4 text-primary text-sm hover:underline"
          >
            {t("alreadyHaveAccount")} {t("loginLink")}
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-6">
      <div className="w-full max-w-md space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="w-16 h-16 rounded-full bg-primary-container flex items-center justify-center mx-auto">
            <Utensils className="text-primary" size={24} aria-hidden="true" />
          </div>
          <h1 className="text-2xl font-display text-on-surface">
            {t("title")}
          </h1>
        </div>

        {/* Course info card */}
        <div className="bg-surface border border-outline-variant rounded-xl p-4 space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-on-surface-variant">{t("courseLabel")}</span>
            <span className="font-semibold text-on-surface">
              {info.courseTitle}
            </span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-on-surface-variant">{t("creatorLabel")}</span>
            <span className="text-on-surface">{info.creatorName}</span>
          </div>
        </div>

        {/* Registration form */}
        <div className="bg-surface border border-outline-variant rounded-2xl p-6 shadow-card space-y-4">
          <h2 className="font-semibold text-on-surface">{t("formTitle")}</h2>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label
                className="block text-sm text-on-surface-variant mb-1"
                htmlFor="name"
              >
                {t("nameLabel")}
              </label>
              <input
                id="name"
                type="text"
                required
                value={formData.name}
                onChange={(e) =>
                  setFormData((d) => ({ ...d, name: e.target.value }))
                }
                placeholder={t("namePlaceholder")}
                className="w-full px-4 py-3 border border-outline-variant rounded-lg bg-surface text-on-surface text-sm focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>

            <div>
              <label
                className="block text-sm text-on-surface-variant mb-1"
                htmlFor="email"
              >
                {t("emailLabel")}
              </label>
              <input
                id="email"
                type="email"
                required
                value={formData.email}
                onChange={(e) =>
                  setFormData((d) => ({ ...d, email: e.target.value }))
                }
                placeholder={t("emailPlaceholder")}
                className="w-full px-4 py-3 border border-outline-variant rounded-lg bg-surface text-on-surface text-sm focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>

            <div>
              <label
                className="block text-sm text-on-surface-variant mb-1"
                htmlFor="password"
              >
                {t("passwordLabel")}
              </label>
              <input
                id="password"
                type="password"
                required
                minLength={8}
                value={formData.password}
                onChange={(e) =>
                  setFormData((d) => ({ ...d, password: e.target.value }))
                }
                placeholder={t("passwordPlaceholder")}
                className="w-full px-4 py-3 border border-outline-variant rounded-lg bg-surface text-on-surface text-sm focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>

            {formError && <p className="text-red-600 text-sm">{formError}</p>}

            <button
              type="submit"
              disabled={submitting}
              className="w-full py-3 rounded-full bg-primary text-on-primary font-semibold text-sm hover:opacity-90 transition-opacity disabled:opacity-50"
            >
              {submitting ? t("loading") : t("submit")}
            </button>
          </form>

          <p className="text-center text-sm text-on-surface-variant">
            {t("alreadyHaveAccount")}{" "}
            <Link
              href="/login"
              className="text-primary hover:underline font-medium"
            >
              {t("loginLink")}
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default InvitePage;
