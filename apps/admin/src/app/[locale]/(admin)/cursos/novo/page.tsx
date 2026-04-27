"use client";

import { coursesApi } from "@/lib/api/courses";
import { CurrencyInput } from "@ybr/ui";
import { ArrowLeft, Upload, X } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useRef, useState } from "react";
import { Controller, useForm } from "react-hook-form";

interface CourseFormValues {
  title: string;
  description: string;
  priceDisplay: string;
  currency: "USD" | "BRL";
  language: "pt-BR" | "en-US";
}

const NewCoursePage = () => {
  const t = useTranslations("courses");
  const tc = useTranslations("common");
  const locale = useLocale();
  const router = useRouter();

  const [thumbnailFile, setThumbnailFile] = useState<File | null>(null);
  const [thumbnailPreview, setThumbnailPreview] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const {
    register,
    handleSubmit,
    control,
    watch,
    formState: { errors },
  } = useForm<CourseFormValues>({
    defaultValues: {
      currency: "USD",
      language: "pt-BR",
      priceDisplay: "",
    },
  });

  const watchedCurrency = watch("currency");

  const handleThumbnailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setThumbnailFile(file);
    const reader = new FileReader();
    reader.onload = (ev) => setThumbnailPreview(ev.target?.result as string);
    reader.readAsDataURL(file);
  };

  const removeThumbnail = () => {
    setThumbnailFile(null);
    setThumbnailPreview(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const onSubmit = async (values: CourseFormValues) => {
    setSubmitting(true);
    setSubmitError(null);
    try {
      const priceCents = Math.round(
        parseFloat(values.priceDisplay || "0") * 100,
      );
      const course = await coursesApi.createCourse({
        title: values.title,
        description: values.description || undefined,
        priceCents,
        currency: values.currency,
        language: values.language,
      });
      if (thumbnailFile) {
        await coursesApi.uploadThumbnail(course.id, thumbnailFile);
      }
      router.push(`/${locale}/cursos/${course.id}/conteudo`);
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : tc("error"));
      setSubmitting(false);
    }
  };

  return (
    <div className="mx-auto max-w-2xl">
      {/* Back link */}
      <Link
        href={`/${locale}/cursos`}
        className="mb-6 flex items-center gap-2 text-sm text-on-surface-variant hover:text-on-surface"
      >
        <ArrowLeft className="h-4 w-4" />
        {tc("back")}
      </Link>

      <div className="mb-8">
        <h1 className="font-serif text-3xl text-on-surface">
          {t("newCourse")}
        </h1>
        <p className="mt-1 text-sm text-on-surface-variant">
          {t("newCourseSubtitle")}
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} noValidate>
        <div className="space-y-6 rounded-2xl border border-outline-variant bg-white p-6 shadow-sm">
          {/* Title */}
          <div>
            <label
              className="mb-1.5 block text-sm font-medium text-on-surface"
              htmlFor="title"
            >
              {t("form.titleLabel")} <span className="text-error">*</span>
            </label>
            <input
              id="title"
              type="text"
              placeholder={t("form.titlePlaceholder")}
              className={`w-full rounded-lg border bg-surface-container px-4 py-3 text-sm text-on-surface placeholder:text-outline focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary ${
                errors.title ? "border-error" : "border-outline-variant"
              }`}
              {...register("title", {
                required: tc("required"),
                minLength: { value: 3, message: t("form.titleMinLength") },
              })}
            />
            {errors.title && (
              <p className="mt-1 text-xs text-error">{errors.title.message}</p>
            )}
          </div>

          {/* Description */}
          <div>
            <label
              className="mb-1.5 block text-sm font-medium text-on-surface"
              htmlFor="description"
            >
              {t("form.descriptionLabel")}
            </label>
            <textarea
              id="description"
              rows={4}
              placeholder={t("form.descriptionPlaceholder")}
              className="w-full resize-none rounded-lg border border-outline-variant bg-surface-container px-4 py-3 text-sm text-on-surface placeholder:text-outline focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
              {...register("description")}
            />
          </div>

          {/* Price + Currency row */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label
                className="mb-1.5 block text-sm font-medium text-on-surface"
                htmlFor="priceDisplay"
              >
                {t("form.priceLabel")} <span className="text-error">*</span>
              </label>
              <Controller
                name="priceDisplay"
                control={control}
                rules={{ required: tc("required") }}
                render={({ field }) => (
                  <CurrencyInput
                    id="priceDisplay"
                    value={field.value}
                    onChange={field.onChange}
                    onBlur={field.onBlur}
                    currency={watchedCurrency}
                    hasError={!!errors.priceDisplay}
                  />
                )}
              />
              {errors.priceDisplay && (
                <p className="mt-1 text-xs text-error">
                  {errors.priceDisplay.message}
                </p>
              )}
            </div>

            <div>
              <label
                className="mb-1.5 block text-sm font-medium text-on-surface"
                htmlFor="currency"
              >
                {t("form.currencyLabel")}
              </label>
              <select
                id="currency"
                className="w-full rounded-lg border border-outline-variant bg-surface-container px-4 py-3 text-sm text-on-surface focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                {...register("currency")}
              >
                <option value="USD">{t("form.currencyUSD")}</option>
                <option value="BRL">{t("form.currencyBRL")}</option>
              </select>
            </div>
          </div>

          {/* Language */}
          <div>
            <label
              className="mb-1.5 block text-sm font-medium text-on-surface"
              htmlFor="language"
            >
              {t("form.languageLabel")}
            </label>
            <select
              id="language"
              className="w-full rounded-lg border border-outline-variant bg-surface-container px-4 py-3 text-sm text-on-surface focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
              {...register("language")}
            >
              <option value="pt-BR">{t("form.languagePtBr")}</option>
              <option value="en-US">{t("form.languageEnUs")}</option>
            </select>
          </div>

          {/* Thumbnail */}
          <div>
            <label
              className="mb-1.5 block text-sm font-medium text-on-surface"
              htmlFor="thumbnail-input-novo"
            >
              {t("form.thumbnailLabel")}
            </label>
            {thumbnailPreview ? (
              <div className="relative inline-block">
                {/* biome-ignore lint/performance/noImgElement: data: URL preview before upload */}
                <img
                  src={thumbnailPreview}
                  alt="Preview"
                  className="h-36 w-64 rounded-xl object-cover"
                />
                <button
                  type="button"
                  onClick={removeThumbnail}
                  aria-label="Remover thumbnail"
                  className="absolute -right-2 -top-2 flex h-6 w-6 items-center justify-center rounded-full bg-error text-white"
                >
                  <X className="h-3 w-3" />
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="flex h-36 w-full flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-outline-variant text-on-surface-variant hover:border-primary hover:text-primary transition-colors"
              >
                <Upload className="h-6 w-6" />
                <span className="text-sm">{t("form.thumbnailHint")}</span>
              </button>
            )}
            <input
              ref={fileInputRef}
              id="thumbnail-input-novo"
              type="file"
              accept="image/jpeg,image/png,image/webp"
              onChange={handleThumbnailChange}
              className="hidden"
            />
          </div>
        </div>

        {/* Submit error */}
        {submitError && (
          <div className="mt-4 rounded-xl border border-error bg-red-50 px-4 py-3 text-sm text-error">
            {submitError}
          </div>
        )}

        {/* Actions */}
        <div className="mt-6 flex items-center justify-end gap-3">
          <Link
            href={`/${locale}/cursos`}
            className="rounded-full border border-outline-variant px-5 py-2.5 text-sm font-semibold text-on-surface-variant hover:bg-surface-container transition-colors"
          >
            {tc("cancel")}
          </Link>
          <button
            type="submit"
            disabled={submitting}
            className="rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-on-primary hover:bg-primary-hover transition-colors disabled:opacity-60"
          >
            {submitting ? tc("loading") : t("form.submitCreate")}
          </button>
        </div>
      </form>
    </div>
  );
};

export default NewCoursePage;
