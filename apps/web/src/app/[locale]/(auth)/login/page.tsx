"use client";

import { authApi } from "@/lib/api/auth";
import { useAuthStore } from "@/stores/auth";
import { zodResolver } from "@hookform/resolvers/zod";
import type { LoginInput } from "@ybr/schemas";
import { loginSchema } from "@ybr/schemas";
import { Eye, EyeOff, Lock, Utensils } from "lucide-react";
import { useTranslations } from "next-intl";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";

const LoginPage = () => {
  const t = useTranslations("auth.login");
  const router = useRouter();
  const params = useParams();
  const locale = params.locale as string;

  const { setAuth } = useAuthStore();

  const [showPassword, setShowPassword] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
  });

  const handleFormSubmit = async (data: LoginInput) => {
    setServerError(null);
    try {
      const result = await authApi.login(data);
      setAuth(result.user, result.accessToken, result.refreshToken);
      router.push(`/${locale}/dashboard`);
    } catch (error) {
      const message = error instanceof Error ? error.message : "";
      if (
        message.includes("429") ||
        message.toLowerCase().includes("many attempts")
      ) {
        setServerError(t("error.tooManyAttempts"));
      } else {
        setServerError(t("error.invalidCredentials"));
      }
    }
  };

  const handleTogglePassword = () => setShowPassword((prev) => !prev);

  return (
    <div className="w-full flex flex-col items-center">
      {/* ─── Logo section — mobile only (above card) ─── */}
      <div className="mb-stack-lg flex flex-col items-center md:hidden">
        <div className="w-16 h-16 rounded-full bg-primary-container flex items-center justify-center mb-stack-sm shadow-sm">
          <Utensils className="text-on-primary" size={24} aria-hidden="true" />
        </div>
        <span className="font-display-md text-display-md text-primary italic">
          YBR
        </span>
      </div>

      {/* ─── Card ─── */}
      <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-stack-lg md:p-10 shadow-[0px_4px_20px_rgba(152,66,7,0.06)] flex flex-col items-center w-full">
        {/* Logo section — desktop only (inside card) */}
        <div className="mb-stack-lg text-center hidden md:flex md:flex-col md:items-center">
          <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center mb-stack-md mx-auto shadow-sm">
            <Utensils
              className="text-on-primary"
              size={28}
              aria-hidden="true"
            />
          </div>
          <span className="font-title-lg text-title-lg text-primary block mb-unit">
            {t("brandName")}
          </span>
          <h1 className="font-display-md text-display-md text-on-surface">
            {t("title")}
          </h1>
          <p className="font-body-md text-body-md text-on-surface-variant mt-2">
            {t("subtitle")}
          </p>
        </div>

        {/* Title section — mobile only (inside card, no logo) */}
        <div className="mb-stack-lg text-center md:hidden">
          <h1 className="font-title-lg text-title-lg text-on-surface">
            {t("title")}
          </h1>
          <p className="font-body-md text-body-md text-on-surface-variant mt-2">
            {t("subtitleMobile")}
          </p>
        </div>

        {/* Form */}
        <form
          onSubmit={handleSubmit(handleFormSubmit)}
          noValidate
          className="w-full space-y-stack-md"
        >
          {/* Email field */}
          <div className="space-y-unit">
            <label
              htmlFor="email"
              className="font-label-md text-label-md text-on-surface-variant ml-1 block"
            >
              {t("emailLabel")}
            </label>
            <input
              {...register("email")}
              id="email"
              type="email"
              autoComplete="email"
              placeholder={t("emailPlaceholder")}
              className={`w-full h-12 px-stack-md rounded-lg border bg-surface-container-low text-on-surface focus:ring-2 focus:ring-primary focus:border-primary transition-all placeholder:text-outline outline-none ${errors.email ? "border-error" : "border-outline-variant"}`}
            />
            {errors.email && (
              <p className="text-xs ml-0.5 text-error">
                {errors.email.message}
              </p>
            )}
          </div>

          {/* Password field */}
          <div className="space-y-unit">
            <div className="flex items-center justify-between">
              <label
                htmlFor="password"
                className="font-label-md text-label-md text-on-surface-variant ml-1 block"
              >
                {t("passwordLabel")}
              </label>
              {/* Desktop: "Esqueceu a senha?" — Mobile: "Esqueceu sua senha?" */}
              <Link
                href={`/${locale}/forgot-password`}
                className="font-label-md text-label-md text-primary hover:underline"
              >
                <span className="hidden md:inline">{t("forgotPassword")}</span>
                <span className="md:hidden">{t("forgotPasswordMobile")}</span>
              </Link>
            </div>
            <div className="relative">
              <input
                {...register("password")}
                id="password"
                type={showPassword ? "text" : "password"}
                autoComplete="current-password"
                placeholder={t("passwordPlaceholder")}
                className={`w-full h-12 px-stack-md pr-11 rounded-lg border bg-surface-container-low text-on-surface focus:ring-2 focus:ring-primary focus:border-primary transition-all placeholder:text-outline outline-none ${errors.password ? "border-error" : "border-outline-variant"}`}
              />
              <button
                type="button"
                onClick={handleTogglePassword}
                aria-label={showPassword ? "Ocultar senha" : "Mostrar senha"}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-outline-variant hover:text-primary transition-colors"
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
            {errors.password && (
              <p className="text-xs ml-0.5 text-error">
                {errors.password.message}
              </p>
            )}
          </div>

          {/* Server error */}
          {serverError && (
            <p className="text-sm text-center py-2 px-3 rounded-lg text-error bg-error-container">
              {serverError}
            </p>
          )}

          {/* Submit button */}
          <div className="pt-unit">
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full h-12 bg-primary text-on-primary rounded-full font-button text-button hover:bg-surface-tint active:scale-95 transition-all shadow-md disabled:opacity-60 disabled:cursor-not-allowed disabled:active:scale-100"
            >
              {isSubmitting ? "..." : t("submitButton")}
            </button>
          </div>

          {/* Divider */}
          <div className="relative py-unit">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-outline-variant" />
            </div>
            <div className="relative flex justify-center text-xs uppercase tracking-widest">
              <span className="bg-surface-container-lowest px-4 text-outline font-medium">
                {/* Desktop: "OU CONTINUE COM" — Mobile: "ou continue com" */}
                <span className="hidden md:inline">{t("orContinueWith")}</span>
                <span className="md:hidden">{t("orContinueWithMobile")}</span>
              </span>
            </div>
          </div>

          {/* Google button — OAuth not yet implemented */}
          <button
            type="button"
            disabled
            className="w-full h-12 border border-outline-variant bg-surface-container-lowest text-on-surface-variant rounded-full font-button text-button flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
            aria-label={t("googleButton")}
          >
            <svg
              className="w-5 h-5 shrink-0"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                fill="#4285F4"
              />
              <path
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                fill="#34A853"
              />
              <path
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                fill="#FBBC05"
              />
              <path
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                fill="#EA4335"
              />
            </svg>
            {/* Desktop: "Entrar com Google" — Mobile: "Google" */}
            <span className="hidden md:inline">{t("googleButton")}</span>
            <span className="md:hidden">{t("googleButtonMobile")}</span>
          </button>
        </form>

        {/* No account link — desktop only (inside card) */}
        <div className="mt-stack-lg text-center hidden md:block">
          <p className="font-body-md text-body-md text-on-surface-variant">
            {t("noAccount")}{" "}
            <Link
              href={`/${locale}/register`}
              className="text-primary font-semibold hover:underline"
            >
              {t("registerLink")}
            </Link>
          </p>
        </div>
      </div>

      {/* ─── Secondary actions — mobile only (below card) ─── */}
      <div className="mt-stack-lg text-center space-y-stack-md md:hidden">
        <p className="font-body-md text-body-md text-on-surface-variant">
          {t("noAccount")}{" "}
          <Link
            href={`/${locale}/register`}
            className="text-primary font-semibold hover:underline"
          >
            {t("registerLink")}
          </Link>
        </p>
        <div className="flex items-center justify-center gap-2 text-on-surface-variant/60">
          <Lock size={14} aria-hidden="true" />
          <span className="font-label-md text-[12px] uppercase tracking-widest">
            {t("sslSecurity")}
          </span>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
