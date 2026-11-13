"use client";

import { coursesApi } from "@/lib/api/courses";
import type { CourseWithModules } from "@/lib/types/courses";
import { CurrencyInput } from "@ybr/ui";
import { ArrowLeft, Upload, X } from "lucide-react";
import { useTranslations } from "next-intl";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { Controller, useForm } from "react-hook-form";

interface CourseFormValues {
  title: string;
  description: string;
  priceDisplay: string;
  currency: "USD" | "BRL";
  language: "pt-BR" | "en-US";
}

const EditCoursePage = () => {
  const t = useTranslations("courses");
  const tc = useTranslations("common");
  const router = useRouter();
  const params = useParams<{ courseId: string }>();

  const [course, setCourse] = useState<CourseWithModules | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [thumbnailFile, setThumbnailFile] = useState<File | null>(null);
  const [thumbnailPreview, setThumbnailPreview] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const {
    register,
    handleSubmit,
    reset,
    control,
    watch,
    formState: { errors },
  } = useForm<CourseFormValues>();

  const watchedCurrency = watch("currency");

  useEffect(() => {
    const load = async () => {
      try {
        const data = await coursesApi.getCourse(params.courseId);
        setCourse(data);
        reset({
          title: data.title,
          description: data.description ?? "",
          priceDisplay: (data.priceCents / 100).toFixed(2),
          currency: data.currency as "USD" | "BRL",
          language: data.language as "pt-BR" | "en-US",
        });
        if (data.thumbnailUrl) setThumbnailPreview(data.thumbnailUrl);
      } catch (err) {
        setLoadError(err instanceof Error ? err.message : tc("error"));
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [params.courseId, reset, tc]);

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
    if (!course) return;
    setSubmitting(true);
    setSubmitError(null);
    try {
      const priceCents = Math.round(
        parseFloat(values.priceDisplay || "0") * 100,
      );
      await coursesApi.updateCourse(course.id, {
        title: values.title,
        description: values.description || undefined,
        priceCents,
        currency: values.currency,
        language: values.language,
      });
      if (thumbnailFile) {
        await coursesApi.uploadThumbnail(course.id, thumbnailFile);
      }
      router.push("/courses");
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : tc("error"));
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="mx-auto max-w-2xl space-y-4">
        <div className="h-8 w-48 animate-pulse rounded-lg bg-surface-container" />
        <div className="h-64 animate-pulse rounded-2xl bg-surface-container" />
      </div>
    );
  }

  if (loadError) {
    return (
      <div className="mx-auto max-w-2xl rounded-2xl border border-error bg-red-50 p-6 text-sm text-error">
        {loadError}
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl">
      {/* Back link */}
      <Link
        href="/courses"
        className="mb-6 flex items-center gap-2 text-sm text-on-surface-variant hover:text-on-surface"
      >
        <ArrowLeft className="h-4 w-4" />
        {tc("back")}
      </Link>

      <div className="mb-8">
        <h1 className="font-serif text-3xl text-on-surface">
          {t("editCourse")}
        </h1>
        <p className="mt-1 text-sm text-on-surface-variant">{course?.title}</p>
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
              htmlFor="thumbnail-input-editar"
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
              id="thumbnail-input-editar"
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
        <div className="mt-6 flex items-center justify-between">
          <Link
            href={`/courses/${params.courseId}/content`}
            className="text-sm font-medium text-primary hover:underline"
          >
            {t("viewContent")} →
          </Link>
          <div className="flex items-center gap-3">
            <Link
              href="/courses"
              className="rounded-full border border-outline-variant px-5 py-2.5 text-sm font-semibold text-on-surface-variant hover:bg-surface-container transition-colors"
            >
              {tc("cancel")}
            </Link>
            <button
              type="submit"
              disabled={submitting}
              className="rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-on-primary hover:bg-primary-hover transition-colors disabled:opacity-60"
            >
              {submitting ? tc("loading") : t("form.submitUpdate")}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default EditCoursePage;
