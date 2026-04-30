"use client";

import { authApi } from "@/lib/api/auth";
import { zodResolver } from "@hookform/resolvers/zod";
import { Eye, EyeOff } from "lucide-react";
import { useTranslations } from "next-intl";
import Link from "next/link";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { Suspense, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

const resetPasswordFormSchema = z
  .object({
    password: z
      .string()
      .min(8, "Senha deve ter pelo menos 8 caracteres")
      .regex(/[A-Z]/, "Senha deve conter pelo menos uma letra maiúscula")
      .regex(/[0-9]/, "Senha deve conter pelo menos um número"),
    confirmPassword: z.string().min(1, "Confirmação de senha é obrigatória"),
  })
  .refine(
    (data: { password: string; confirmPassword: string }) =>
      data.password === data.confirmPassword,
    {
      message: "As senhas não conferem.",
      path: ["confirmPassword"],
    },
  );

type ResetPasswordFormInput = z.infer<typeof resetPasswordFormSchema>;

const ResetPasswordForm = () => {
  const t = useTranslations("auth.resetPassword");
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const locale = params.locale as string;
  const token = searchParams.get("token");

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ResetPasswordFormInput>({
    resolver: zodResolver(resetPasswordFormSchema),
  });

  const handleFormSubmit = async (data: ResetPasswordFormInput) => {
    if (!token) return;

    setServerError(null);
    try {
      await authApi.resetPassword({ token, password: data.password });
      setIsSuccess(true);
    } catch (error) {
      const message = error instanceof Error ? error.message : "";
      if (
        message.toLowerCase().includes("token") ||
        message.toLowerCase().includes("invalid") ||
        message.toLowerCase().includes("expired")
      ) {
        setServerError(t("error.invalidToken"));
      } else {
        setServerError(
          message || "Ocorreu um erro inesperado. Tente novamente.",
        );
      }
    }
  };

  const handleTogglePassword = () => setShowPassword((prev) => !prev);
  const handleToggleConfirmPassword = () =>
    setShowConfirmPassword((prev) => !prev);

  // Missing or invalid token state
  if (!token) {
    return (
      <div
        className="rounded-xl p-8 shadow-card border text-center"
        style={{
          backgroundColor: "#ffffff",
          borderColor: "var(--color-outline-variant)",
        }}
      >
        <p
          className="font-sans text-sm mb-6 leading-relaxed py-3 px-4 rounded-lg"
          style={{
            color: "var(--color-error)",
            backgroundColor: "var(--color-error-container)",
          }}
        >
          {t("error.invalidToken")}
        </p>
        <Link
          href={`/${locale}/forgot-password`}
          className="font-sans font-semibold text-sm hover:underline transition-all"
          style={{ color: "var(--color-primary)" }}
        >
          Solicitar novo link
        </Link>
      </div>
    );
  }

  // Success state
  if (isSuccess) {
    return (
      <div
        className="rounded-xl p-8 shadow-card border text-center"
        style={{
          backgroundColor: "#ffffff",
          borderColor: "var(--color-outline-variant)",
        }}
      >
        <div
          className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6"
          style={{ backgroundColor: "var(--color-surface-container)" }}
        >
          <svg
            width="32"
            height="32"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            style={{ color: "var(--color-primary)" }}
            aria-hidden="true"
          >
            <path d="M20 6L9 17l-5-5" />
          </svg>
        </div>

        <h2
          className="font-serif text-2xl mb-3"
          style={{ color: "var(--color-on-surface)" }}
        >
          Senha redefinida!
        </h2>
        <p
          className="font-sans text-sm leading-relaxed mb-8"
          style={{ color: "var(--color-on-surface-variant)" }}
        >
          {t("success")}
        </p>

        <Link
          href={`/${locale}/login`}
          className="inline-flex items-center justify-center w-full h-12 rounded-full font-sans font-semibold text-base transition-all active:scale-95 shadow-md"
          style={{
            backgroundColor: "var(--color-primary)",
            color: "var(--color-on-primary)",
          }}
          onClick={() => router.push(`/${locale}/login`)}
        >
          Entrar agora
        </Link>
      </div>
    );
  }

  return (
    <div
      className="rounded-xl p-8 shadow-card border"
      style={{
        backgroundColor: "#ffffff",
        borderColor: "var(--color-outline-variant)",
      }}
    >
      {/* Header */}
      <div className="mb-8 text-center">
        <h1
          className="font-sans text-3xl mb-2"
          style={{ color: "var(--color-on-surface)" }}
        >
          {t("title")}
        </h1>
        <p
          className="font-sans text-sm"
          style={{ color: "var(--color-on-surface-variant)" }}
        >
          {t("subtitle")}
        </p>
      </div>

      {/* Form */}
      <form
        onSubmit={handleSubmit(handleFormSubmit)}
        noValidate
        className="space-y-4"
      >
        {/* New password field */}
        <div className="space-y-1.5">
          <label
            htmlFor="password"
            className="block text-sm font-semibold ml-0.5"
            style={{ color: "var(--color-on-surface-variant)" }}
          >
            {t("passwordLabel")}
          </label>
          <div className="relative">
            <input
              {...register("password")}
              id="password"
              type={showPassword ? "text" : "password"}
              autoComplete="new-password"
              placeholder={t("passwordPlaceholder")}
              className="w-full h-12 px-4 pr-11 rounded-lg border transition-all outline-none placeholder:opacity-50 font-sans text-sm focus:ring-2"
              style={{
                borderColor: errors.password
                  ? "var(--color-error)"
                  : "var(--color-outline-variant)",
                backgroundColor: "var(--color-surface-container)",
                color: "var(--color-on-surface)",
              }}
            />
            <button
              type="button"
              onClick={handleTogglePassword}
              aria-label={showPassword ? "Ocultar senha" : "Mostrar senha"}
              className="absolute right-3 top-1/2 -translate-y-1/2 transition-colors"
              style={{ color: "var(--color-outline)" }}
            >
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
          {errors.password && (
            <p
              className="text-xs ml-0.5"
              style={{ color: "var(--color-error)" }}
            >
              {errors.password.message}
            </p>
          )}
        </div>

        {/* Confirm password field */}
        <div className="space-y-1.5">
          <label
            htmlFor="confirmPassword"
            className="block text-sm font-semibold ml-0.5"
            style={{ color: "var(--color-on-surface-variant)" }}
          >
            {t("confirmPasswordLabel")}
          </label>
          <div className="relative">
            <input
              {...register("confirmPassword")}
              id="confirmPassword"
              type={showConfirmPassword ? "text" : "password"}
              autoComplete="new-password"
              placeholder={t("confirmPasswordPlaceholder")}
              className="w-full h-12 px-4 pr-11 rounded-lg border transition-all outline-none placeholder:opacity-50 font-sans text-sm focus:ring-2"
              style={{
                borderColor: errors.confirmPassword
                  ? "var(--color-error)"
                  : "var(--color-outline-variant)",
                backgroundColor: "var(--color-surface-container)",
                color: "var(--color-on-surface)",
              }}
            />
            <button
              type="button"
              onClick={handleToggleConfirmPassword}
              aria-label={
                showConfirmPassword
                  ? "Ocultar confirmação de senha"
                  : "Mostrar confirmação de senha"
              }
              className="absolute right-3 top-1/2 -translate-y-1/2 transition-colors"
              style={{ color: "var(--color-outline)" }}
            >
              {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
          {errors.confirmPassword && (
            <p
              className="text-xs ml-0.5"
              style={{ color: "var(--color-error)" }}
            >
              {errors.confirmPassword.message}
            </p>
          )}
        </div>

        {/* Server error */}
        {serverError && (
          <p
            className="text-sm text-center py-2 px-3 rounded-lg"
            style={{
              color: "var(--color-error)",
              backgroundColor: "var(--color-error-container)",
            }}
          >
            {serverError}
          </p>
        )}

        {/* Submit button */}
        <div className="pt-2">
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full h-12 rounded-full font-sans font-semibold text-base transition-all active:scale-95 shadow-md disabled:opacity-60 disabled:cursor-not-allowed disabled:active:scale-100"
            style={{
              backgroundColor: "var(--color-primary)",
              color: "var(--color-on-primary)",
            }}
          >
            {isSubmitting ? "..." : t("submitButton")}
          </button>
        </div>
      </form>
    </div>
  );
};

const ResetPasswordPage = () => {
  return (
    <Suspense
      fallback={
        <div
          className="rounded-xl p-8 border"
          style={{
            backgroundColor: "#ffffff",
            borderColor: "var(--color-outline-variant)",
          }}
        >
          <div className="animate-pulse space-y-4">
            <div
              className="h-8 rounded"
              style={{ backgroundColor: "var(--color-surface-container)" }}
            />
            <div
              className="h-12 rounded-lg"
              style={{ backgroundColor: "var(--color-surface-container)" }}
            />
            <div
              className="h-12 rounded-lg"
              style={{ backgroundColor: "var(--color-surface-container)" }}
            />
            <div
              className="h-12 rounded-full"
              style={{ backgroundColor: "var(--color-surface-container)" }}
            />
          </div>
        </div>
      }
    >
      <ResetPasswordForm />
    </Suspense>
  );
};

export default ResetPasswordPage;
