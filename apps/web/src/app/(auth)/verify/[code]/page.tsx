"use client";

import type { VerifiedCertificate } from "@/lib/api/certificates";
import { verifyCertificate } from "@/lib/api/certificates";
import { CheckCircle, Shield, XCircle } from "lucide-react";
import { useTranslations } from "next-intl";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";

const VerifyPage = () => {
  const t = useTranslations("verify");
  const params = useParams();
  const code = params.code as string;

  const [certificate, setCertificate] = useState<VerifiedCertificate | null>(
    null,
  );
  const [isLoading, setIsLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    const run = async () => {
      try {
        const cert = await verifyCertificate(code);
        setCertificate(cert);
      } catch {
        setNotFound(true);
      } finally {
        setIsLoading(false);
      }
    };
    run();
  }, [code]);

  const issuedDate = certificate
    ? new Date(certificate.issuedAt).toLocaleDateString("pt-BR", {
        day: "2-digit",
        month: "long",
        year: "numeric",
      })
    : "";

  if (isLoading) {
    return (
      <div className="text-center py-16">
        <div className="w-10 h-10 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
        <p className="text-on-surface-variant text-sm">{t("verifying")}</p>
      </div>
    );
  }

  return (
    <div className="w-full">
      {/* Header */}
      <div className="text-center mb-8">
        <Shield className="w-10 h-10 text-on-surface-variant mx-auto mb-3" />
        <h1 className="text-2xl font-bold text-on-surface">{t("title")}</h1>
        <p className="text-on-surface-variant text-sm mt-1">{t("subtitle")}</p>
      </div>

      {notFound ? (
        <div className="bg-red-50 border border-red-200 rounded-2xl p-6 text-center">
          <XCircle className="w-10 h-10 text-red-500 mx-auto mb-3" />
          <p className="text-red-800 text-sm font-medium">{t("invalid")}</p>
        </div>
      ) : certificate ? (
        <div className="bg-surface border border-outline-variant rounded-2xl p-6 shadow-sm">
          {/* Valid badge */}
          <div className="flex items-center gap-2 mb-6 bg-green-50 border border-green-200 rounded-full px-4 py-2 w-fit mx-auto">
            <CheckCircle className="w-4 h-4 text-green-600" />
            <span className="text-green-800 text-sm font-semibold">
              {t("valid")}
            </span>
          </div>

          <p className="text-center text-on-surface-variant text-sm mb-6">
            {t("validDescription")}
          </p>

          {/* Details */}
          <div className="space-y-4 border-t border-outline-variant pt-4">
            <div className="flex justify-between items-start gap-4">
              <span className="text-sm text-on-surface-variant shrink-0">
                {t("studentLabel")}
              </span>
              <span className="text-sm font-semibold text-on-surface text-right">
                {certificate.studentName}
              </span>
            </div>
            <div className="flex justify-between items-start gap-4">
              <span className="text-sm text-on-surface-variant shrink-0">
                {t("courseLabel")}
              </span>
              <span className="text-sm font-semibold text-on-surface text-right">
                {certificate.courseTitle}
              </span>
            </div>
            <div className="flex justify-between items-start gap-4">
              <span className="text-sm text-on-surface-variant shrink-0">
                {t("instructorLabel")}
              </span>
              <span className="text-sm font-semibold text-on-surface text-right">
                {certificate.creatorName}
              </span>
            </div>
            <div className="flex justify-between items-start gap-4">
              <span className="text-sm text-on-surface-variant shrink-0">
                {t("issuedOn")}
              </span>
              <span className="text-sm font-semibold text-on-surface text-right">
                {issuedDate}
              </span>
            </div>
          </div>

          {/* Verification code */}
          <div className="mt-4 bg-surface-container rounded-lg px-3 py-2 text-center">
            <p className="text-xs text-on-surface-variant mb-0.5">Código</p>
            <p className="text-xs font-mono text-on-surface break-all">
              {certificate.verificationCode}
            </p>
          </div>
        </div>
      ) : null}
    </div>
  );
};

export default VerifyPage;
