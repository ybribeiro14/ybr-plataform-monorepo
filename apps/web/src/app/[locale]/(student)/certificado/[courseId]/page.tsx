"use client";

import type { CertificateData } from "@/lib/api/certificates";
import { generateCertificate } from "@/lib/api/certificates";
import { useAuthStore } from "@/stores/auth";
import { Award, CheckCircle, Copy, Download, ExternalLink } from "lucide-react";
import { useTranslations } from "next-intl";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";

const CertificatePage = () => {
  const t = useTranslations("certificate");
  const params = useParams();
  const courseId = params.courseId as string;
  const locale = params.locale as string;

  const { accessToken } = useAuthStore();

  const [certificate, setCertificate] = useState<CertificateData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    // Auto-generate on mount (idempotent)
    if (accessToken) {
      handleGenerate();
    }
  }, [accessToken]);

  const handleGenerate = async () => {
    if (!accessToken) return;
    setIsLoading(true);
    setError(null);
    try {
      const cert = await generateCertificate(courseId, accessToken);
      setCertificate(cert);
    } catch (err) {
      const message = err instanceof Error ? err.message : t("error");
      if (
        message.includes("COURSE_NOT_COMPLETED") ||
        message.includes("not completed")
      ) {
        setError(t("notCompleted"));
      } else {
        setError(message);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopyLink = async () => {
    if (!certificate) return;
    const url = `${window.location.origin}/${locale}/verificar/${certificate.verificationCode}`;
    await navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleLinkedIn = () => {
    if (!certificate) return;
    const url = `${window.location.origin}/${locale}/verificar/${certificate.verificationCode}`;
    const linkedInUrl = `https://www.linkedin.com/shareArticle?mini=true&url=${encodeURIComponent(url)}&title=${encodeURIComponent(`Certificado: ${certificate.courseTitle}`)}&summary=${encodeURIComponent(`Conclui o curso ${certificate.courseTitle} na YBR Platform!`)}`;
    window.open(linkedInUrl, "_blank", "noopener,noreferrer");
  };

  const issuedDate = certificate
    ? new Date(certificate.issuedAt).toLocaleDateString("pt-BR", {
        day: "2-digit",
        month: "long",
        year: "numeric",
      })
    : "";

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <div className="w-10 h-10 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-on-surface-variant text-sm">{t("loading")}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-12">
      {/* Back link */}
      <Link
        href={`/${locale}/meus-cursos`}
        className="text-sm text-on-surface-variant hover:text-on-surface flex items-center gap-1 mb-8"
      >
        ← {t("backToCourses")}
      </Link>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-6 text-red-800 text-sm">
          {error}
        </div>
      )}

      {certificate ? (
        <div className="space-y-6">
          {/* Certificate card */}
          <div className="bg-surface border border-outline-variant rounded-2xl p-8 text-center shadow-sm">
            {/* Gold award icon */}
            <div className="flex justify-center mb-6">
              <div className="w-16 h-16 rounded-full bg-amber-50 border border-amber-200 flex items-center justify-center">
                <Award className="w-8 h-8 text-amber-600" />
              </div>
            </div>

            {/* Title */}
            <p className="text-xs font-semibold text-amber-600 tracking-widest uppercase mb-2">
              {t("title")}
            </p>

            {/* Student name */}
            <h1 className="text-3xl font-bold text-on-surface mb-1">
              {certificate.studentName}
            </h1>
            <p className="text-on-surface-variant text-sm mb-4">
              {t("courseLabel")}
            </p>

            {/* Course title */}
            <h2 className="text-xl font-semibold text-on-surface mb-6">
              {certificate.courseTitle}
            </h2>

            {/* Divider */}
            <div className="w-24 h-px bg-outline-variant mx-auto mb-6" />

            {/* Issued date */}
            <p className="text-sm text-on-surface-variant">
              {t("issuedOn")}{" "}
              <span className="text-on-surface font-medium">{issuedDate}</span>
            </p>

            {/* Verification code */}
            <div className="mt-4 inline-flex items-center gap-2 bg-surface-container rounded-lg px-3 py-1.5">
              <CheckCircle className="w-3.5 h-3.5 text-green-600" />
              <span className="text-xs text-on-surface-variant font-mono">
                {certificate.verificationCode}
              </span>
            </div>
          </div>

          {/* Actions */}
          <div className="flex flex-col sm:flex-row gap-3">
            {certificate.certificateUrl && (
              <a
                href={certificate.certificateUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 flex items-center justify-center gap-2 bg-primary text-on-primary rounded-full px-5 py-3 font-semibold text-sm hover:opacity-90 transition-opacity"
              >
                <Download className="w-4 h-4" />
                {t("downloadPdf")}
              </a>
            )}

            <button
              type="button"
              onClick={handleLinkedIn}
              className="flex-1 flex items-center justify-center gap-2 bg-blue-600 text-white rounded-full px-5 py-3 font-semibold text-sm hover:bg-blue-700 transition-colors"
            >
              <ExternalLink className="w-4 h-4" />
              {t("shareLinkedIn")}
            </button>

            <button
              type="button"
              onClick={handleCopyLink}
              className="flex items-center justify-center gap-2 border border-outline-variant text-on-surface rounded-full px-5 py-3 font-semibold text-sm hover:bg-surface-container transition-colors"
            >
              <Copy className="w-4 h-4" />
              {copied ? t("linkCopied") : t("copyLink")}
            </button>
          </div>
        </div>
      ) : !error ? (
        <div className="text-center py-16">
          <Award className="w-12 h-12 text-on-surface-variant mx-auto mb-4" />
          <h1 className="text-xl font-semibold text-on-surface mb-2">
            {t("title")}
          </h1>
          <p className="text-on-surface-variant text-sm mb-6">
            {t("notCompleted")}
          </p>
          <Link
            href={`/${locale}/meus-cursos`}
            className="text-primary text-sm underline"
          >
            {t("backToCourses")}
          </Link>
        </div>
      ) : null}
    </div>
  );
};

export default CertificatePage;
