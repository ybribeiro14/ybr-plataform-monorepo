"use client";

import { authApi } from "@/lib/api/auth";
import { useAuthStore } from "@/stores/auth";
import { zodResolver } from "@hookform/resolvers/zod";
import type { RegisterInput } from "@ybr/schemas";
import { registerSchema } from "@ybr/schemas";
import { Eye, EyeOff } from "lucide-react";
import { useTranslations } from "next-intl";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

const registerFormSchema = registerSchema
  .extend({
    confirmPassword: z.string().min(1, "Confirmação de senha é obrigatória"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "As senhas não conferem.",
    path: ["confirmPassword"],
  });

type RegisterFormInput = z.infer<typeof registerFormSchema>;

const RegisterPage = () => {
  const t = useTranslations("auth.register");
  const router = useRouter();
  const params = useParams();
  const locale = params.locale as string;

  const { setAuth } = useAuthStore();

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<RegisterFormInput>({
    resolver: zodResolver(registerFormSchema),
  });

  const handleFormSubmit = async (data: RegisterFormInput) => {
    setServerError(null);
    const { confirmPassword: _, ...registerData } = data;
    try {
      await authApi.register(registerData as RegisterInput);
      // Auto-login after successful registration
      const loginResult = await authApi.login({
        email: registerData.email,
        password: registerData.password,
      });
      setAuth(
        loginResult.user,
        loginResult.accessToken,
        loginResult.refreshToken,
      );
      router.push(`/${locale}/dashboard`);
    } catch (error) {
      const message = error instanceof Error ? error.message : "";
      if (message === "EMAIL_ALREADY_EXISTS") {
        setServerError(t("error.emailTaken"));
      } else if (
        message.toLowerCase().includes("senha") ||
        message.toLowerCase().includes("password")
      ) {
        setServerError(t("error.weakPassword"));
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
          className="font-serif text-3xl mb-2"
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
        {/* Name field */}
        <div className="space-y-1.5">
          <label
            htmlFor="name"
            className="block text-sm font-semibold ml-0.5"
            style={{ color: "var(--color-on-surface-variant)" }}
          >
            {t("nameLabel")}
          </label>
          <input
            {...register("name")}
            id="name"
            type="text"
            autoComplete="name"
            placeholder={t("namePlaceholder")}
            className="w-full h-12 px-4 rounded-lg border transition-all outline-none placeholder:opacity-50 font-sans text-sm focus:ring-2"
            style={{
              borderColor: errors.name
                ? "var(--color-error)"
                : "var(--color-outline-variant)",
              backgroundColor: "var(--color-surface-container)",
              color: "var(--color-on-surface)",
            }}
          />
          {errors.name && (
            <p
              className="text-xs ml-0.5"
              style={{ color: "var(--color-error)" }}
            >
              {errors.name.message}
            </p>
          )}
        </div>

        {/* Email field */}
        <div className="space-y-1.5">
          <label
            htmlFor="email"
            className="block text-sm font-semibold ml-0.5"
            style={{ color: "var(--color-on-surface-variant)" }}
          >
            {t("emailLabel")}
          </label>
          <input
            {...register("email")}
            id="email"
            type="email"
            autoComplete="email"
            placeholder={t("emailPlaceholder")}
            className="w-full h-12 px-4 rounded-lg border transition-all outline-none placeholder:opacity-50 font-sans text-sm focus:ring-2"
            style={{
              borderColor: errors.email
                ? "var(--color-error)"
                : "var(--color-outline-variant)",
              backgroundColor: "var(--color-surface-container)",
              color: "var(--color-on-surface)",
            }}
          />
          {errors.email && (
            <p
              className="text-xs ml-0.5"
              style={{ color: "var(--color-error)" }}
            >
              {errors.email.message}
            </p>
          )}
        </div>

        {/* Password field */}
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

        {/* Divider */}
        <div className="relative py-2">
          <div className="absolute inset-0 flex items-center">
            <div
              className="w-full border-t"
              style={{ borderColor: "var(--color-outline-variant)" }}
            />
          </div>
          <div className="relative flex justify-center text-xs uppercase tracking-widest">
            <span
              className="px-4 font-medium"
              style={{
                backgroundColor: "var(--color-surface)",
                color: "var(--color-outline)",
              }}
            >
              {t("orContinueWith")}
            </span>
          </div>
        </div>

        {/* Google button */}
        <button
          type="button"
          onClick={() => {
            const apiUrl =
              process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3002";
            window.location.href = `${apiUrl}/auth/google`;
          }}
          className="w-full h-12 rounded-full font-sans font-semibold text-base flex items-center justify-center gap-2 transition-colors active:scale-95 border"
          style={{
            borderColor: "var(--color-outline-variant)",
            backgroundColor: "var(--color-surface)",
            color: "var(--color-on-surface)",
          }}
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
          {t("googleButton")}
        </button>
      </form>

      {/* Footer */}
      <div className="mt-6 text-center">
        <p
          className="font-sans text-sm"
          style={{ color: "var(--color-on-surface-variant)" }}
        >
          {t("hasAccount")}{" "}
          <Link
            href={`/${locale}/login`}
            className="font-semibold hover:underline transition-all"
            style={{ color: "var(--color-primary)" }}
          >
            {t("loginLink")}
          </Link>
        </p>
      </div>
    </div>
  );
};

export default RegisterPage;
