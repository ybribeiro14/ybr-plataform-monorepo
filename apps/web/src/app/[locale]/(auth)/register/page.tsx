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
      className="rounded-xl p-8 shadow-[0px_4px_20px_rgba(152,66,7,0.06)] border"
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
