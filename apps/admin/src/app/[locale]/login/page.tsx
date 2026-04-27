"use client";

import { adminAuthApi } from "@/lib/api/auth";
import { useAdminAuthStore } from "@/stores/auth";
import { zodResolver } from "@hookform/resolvers/zod";
import type { LoginInput } from "@ybr/schemas";
import { loginSchema } from "@ybr/schemas";
import { Eye, EyeOff, LayoutDashboard, Lock } from "lucide-react";
import { useTranslations } from "next-intl";
import { useParams, useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";

const AdminLoginPage = () => {
  const t = useTranslations("auth.login");
  const router = useRouter();
  const params = useParams();
  const locale = params.locale as string;

  const { setAuth } = useAdminAuthStore();

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
      const result = await adminAuthApi.login(data);

      if (result.user.role !== "creator" && result.user.role !== "admin") {
        setServerError(t("error.unauthorized"));
        return;
      }

      setAuth(result.user, result.accessToken, result.refreshToken);
      router.push(`/${locale}/dashboard`);
    } catch (error) {
      setServerError(
        error instanceof Error ? error.message : t("error.invalidCredentials"),
      );
    }
  };

  const handleTogglePassword = () => setShowPassword((prev) => !prev);

  return (
    <div className="flex min-h-screen items-center justify-center bg-(--color-background) px-4 py-16">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="mb-8 flex flex-col items-center text-center">
          <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-primary shadow-sm">
            <LayoutDashboard
              className="text-on-primary"
              size={26}
              aria-hidden="true"
            />
          </div>
          <h1 className="font-serif text-3xl text-on-surface">{t("title")}</h1>
          <p className="mt-2 text-sm text-on-surface-variant">
            {t("subtitle")}
          </p>
        </div>

        {/* Card */}
        <div className="rounded-2xl border border-outline-variant bg-white p-8 shadow-sm">
          <form
            onSubmit={handleSubmit(handleFormSubmit)}
            noValidate
            className="space-y-5"
          >
            {/* Server error */}
            {serverError && (
              <div
                role="alert"
                className="rounded-lg border border-error/30 bg-error/10 px-4 py-3 text-sm text-error"
              >
                {serverError}
              </div>
            )}

            {/* Email */}
            <div className="space-y-1.5">
              <label
                htmlFor="email"
                className="block text-sm font-medium text-on-surface-variant"
              >
                {t("emailLabel")}
              </label>
              <input
                {...register("email")}
                id="email"
                type="email"
                autoComplete="email"
                placeholder={t("emailPlaceholder")}
                className={`h-12 w-full rounded-lg border bg-surface-container-low px-4 text-on-surface placeholder:text-outline outline-none transition-all focus:border-primary focus:ring-2 focus:ring-primary/20 ${
                  errors.email ? "border-error" : "border-outline-variant"
                }`}
              />
              {errors.email && (
                <p className="text-xs text-error">{errors.email.message}</p>
              )}
            </div>

            {/* Password */}
            <div className="space-y-1.5">
              <label
                htmlFor="password"
                className="block text-sm font-medium text-on-surface-variant"
              >
                {t("passwordLabel")}
              </label>
              <div className="relative">
                <input
                  {...register("password")}
                  id="password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="current-password"
                  placeholder={t("passwordPlaceholder")}
                  className={`h-12 w-full rounded-lg border bg-surface-container-low px-4 pr-11 text-on-surface placeholder:text-outline outline-none transition-all focus:border-primary focus:ring-2 focus:ring-primary/20 ${
                    errors.password ? "border-error" : "border-outline-variant"
                  }`}
                />
                <button
                  type="button"
                  onClick={handleTogglePassword}
                  aria-label={showPassword ? "Ocultar senha" : "Mostrar senha"}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-on-surface-variant hover:text-on-surface transition-colors"
                >
                  {showPassword ? (
                    <EyeOff size={18} aria-hidden="true" />
                  ) : (
                    <Eye size={18} aria-hidden="true" />
                  )}
                </button>
              </div>
              {errors.password && (
                <p className="text-xs text-error">{errors.password.message}</p>
              )}
            </div>

            {/* Forgot password link */}
            <div className="flex justify-end">
              <span className="text-sm text-on-surface-variant">
                {t("forgotPassword")}
              </span>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex h-12 w-full items-center justify-center gap-2 rounded-full bg-primary font-semibold text-on-primary shadow-sm transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isSubmitting ? (
                <span className="h-4 w-4 animate-spin rounded-full border-2 border-on-primary/30 border-t-on-primary" />
              ) : (
                <>
                  <Lock size={16} aria-hidden="true" />
                  {t("submitButton")}
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export { AdminLoginPage };
export default AdminLoginPage;
