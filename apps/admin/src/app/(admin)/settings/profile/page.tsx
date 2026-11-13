"use client";

import {
  adminSettingsApi,
  type CreatorProfile,
  type UpdateProfileInput,
} from "@/lib/api/settings";
import { useAdminAuthStore } from "@/stores/auth";
import { Camera, ChevronDown, Globe, Loader2, Save, User } from "lucide-react";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";

type GenderValue = "female" | "male" | "nonbinary" | "prefer_not_to_say" | null;
type PhoneCountry = "BR" | "US";

const PHONE_COUNTRIES: { code: PhoneCountry; flag: string; dial: string }[] = [
  { code: "BR", flag: "🇧🇷", dial: "+55" },
  { code: "US", flag: "🇺🇸", dial: "+1" },
];

const maskCpf = (value: string): string => {
  const d = value.replace(/\D/g, "").slice(0, 11);
  if (d.length <= 3) return d;
  if (d.length <= 6) return `${d.slice(0, 3)}.${d.slice(3)}`;
  if (d.length <= 9) return `${d.slice(0, 3)}.${d.slice(3, 6)}.${d.slice(6)}`;
  return `${d.slice(0, 3)}.${d.slice(3, 6)}.${d.slice(6, 9)}-${d.slice(9)}`;
};

const maskPhoneBR = (value: string): string => {
  const d = value.replace(/\D/g, "").slice(0, 11);
  if (d.length <= 2) return d.length === 0 ? "" : `(${d}`;
  if (d.length <= 6) return `(${d.slice(0, 2)}) ${d.slice(2)}`;
  if (d.length <= 10)
    return `(${d.slice(0, 2)}) ${d.slice(2, 6)}-${d.slice(6)}`;
  return `(${d.slice(0, 2)}) ${d.slice(2, 3)} ${d.slice(3, 7)}-${d.slice(7)}`;
};

const maskPhoneUS = (value: string): string => {
  const d = value.replace(/\D/g, "").slice(0, 10);
  if (d.length <= 3) return d.length === 0 ? "" : `(${d}`;
  if (d.length <= 6) return `(${d.slice(0, 3)}) ${d.slice(3)}`;
  return `(${d.slice(0, 3)}) ${d.slice(3, 6)}-${d.slice(6)}`;
};

const detectPhoneCountry = (phone: string): PhoneCountry => {
  const digits = phone.replace(/\D/g, "");
  if (
    phone.startsWith("+1") ||
    (digits.length === 10 && !phone.startsWith("+"))
  ) {
    return "US";
  }
  return "BR";
};

// Local form state uses explicit nulls (compatible with exactOptionalPropertyTypes)
interface ProfileForm {
  name: string;
  bio: string;
  website: string;
  phone: string;
  phoneCountry: PhoneCountry;
  cpf: string;
  birthDate: string;
  gender: GenderValue;
  country: string;
  zipCode: string;
  street: string;
  streetNumber: string;
  complement: string;
  neighborhood: string;
  city: string;
  state: string;
  locale: "pt-BR" | "en";
}

const GENDER_OPTIONS = [
  { value: "", label: "Prefiro não informar" },
  { value: "female", label: "Feminino" },
  { value: "male", label: "Masculino" },
  { value: "nonbinary", label: "Não-binário" },
  { value: "prefer_not_to_say", label: "Prefiro não responder" },
] as const;

const LANGUAGE_OPTIONS = [
  { value: "pt-BR", label: "Português (BR)" },
  { value: "en", label: "English" },
] as const;

const toUpdateInput = (form: ProfileForm): UpdateProfileInput => {
  const input: UpdateProfileInput = {
    bio: form.bio || null,
    website: form.website || null,
    phone: form.phone || null,
    cpf: form.cpf || null,
    birthDate: form.birthDate || null,
    gender: form.gender,
    country: form.country || null,
    zipCode: form.zipCode || null,
    street: form.street || null,
    streetNumber: form.streetNumber || null,
    complement: form.complement || null,
    neighborhood: form.neighborhood || null,
    city: form.city || null,
    state: form.state || null,
  };
  if (form.name) input.name = form.name;
  return input;
};

const EMPTY_FORM: ProfileForm = {
  name: "",
  bio: "",
  website: "",
  phone: "",
  phoneCountry: "BR",
  cpf: "",
  birthDate: "",
  gender: null,
  country: "BR",
  zipCode: "",
  street: "",
  streetNumber: "",
  complement: "",
  neighborhood: "",
  city: "",
  state: "",
  locale: "pt-BR",
};

const CreatorProfilePage = () => {
  const { accessToken, user } = useAdminAuthStore();
  const [profile, setProfile] = useState<CreatorProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [phoneDropdownOpen, setPhoneDropdownOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const phoneDropdownRef = useRef<HTMLDivElement>(null);

  const [form, setForm] = useState<ProfileForm>(EMPTY_FORM);

  useEffect(() => {
    if (!accessToken) return;
    adminSettingsApi
      .getProfile(accessToken)
      .then((data) => {
        setProfile(data);
        const rawPhone = data.phone ?? "";
        const phoneCountry = detectPhoneCountry(rawPhone);
        const maskedPhone =
          phoneCountry === "US" ? maskPhoneUS(rawPhone) : maskPhoneBR(rawPhone);
        setForm({
          name: data.name,
          bio: data.bio ?? "",
          website: data.website ?? "",
          phone: maskedPhone,
          phoneCountry,
          cpf: maskCpf(data.cpf ?? ""),
          birthDate: data.birthDate ?? "",
          gender: (data.gender as GenderValue) ?? null,
          country: data.country ?? "BR",
          zipCode: data.zipCode ?? "",
          street: data.street ?? "",
          streetNumber: data.streetNumber ?? "",
          complement: data.complement ?? "",
          neighborhood: data.neighborhood ?? "",
          city: data.city ?? "",
          state: data.state ?? "",
          locale: (data.preferredLocale as "pt-BR" | "en") ?? "pt-BR",
        });
      })
      .catch(() => setError("Não foi possível carregar o perfil."))
      .finally(() => setLoading(false));
  }, [accessToken]);

  const handleChange = (field: keyof ProfileForm, value: string) => {
    if (field === "gender") {
      setForm((prev) => ({ ...prev, gender: (value || null) as GenderValue }));
      return;
    }
    if (field === "cpf") {
      setForm((prev) => ({ ...prev, cpf: maskCpf(value) }));
      return;
    }
    if (field === "phone") {
      const mask = form.phoneCountry === "US" ? maskPhoneUS : maskPhoneBR;
      setForm((prev) => ({ ...prev, phone: mask(value) }));
      return;
    }
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handlePhoneCountryChange = (country: PhoneCountry) => {
    setForm((prev) => ({ ...prev, phoneCountry: country, phone: "" }));
  };

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        phoneDropdownRef.current &&
        !phoneDropdownRef.current.contains(e.target as Node)
      ) {
        setPhoneDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleAvatarClick = () => fileInputRef.current?.click();

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !accessToken) return;
    setUploadingAvatar(true);
    setError(null);
    try {
      const { avatarUrl } = await adminSettingsApi.uploadAvatar(
        accessToken,
        file,
      );
      setProfile((prev) => (prev ? { ...prev, avatarUrl } : prev));
      setSuccess("Foto atualizada com sucesso!");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao enviar foto.");
    } finally {
      setUploadingAvatar(false);
    }
  };

  const handleViaCep = async (cep: string) => {
    const cleanCep = cep.replace(/\D/g, "");
    if (cleanCep.length !== 8) return;
    try {
      const res = await fetch(`https://viacep.com.br/ws/${cleanCep}/json/`);
      const data = await res.json();
      if (data.erro) return;
      setForm((prev) => ({
        ...prev,
        street: data.logradouro ?? prev.street,
        neighborhood: data.bairro ?? prev.neighborhood,
        city: data.localidade ?? prev.city,
        state: data.uf ?? prev.state,
      }));
    } catch {
      // silently fail — user can fill manually
    }
  };

  const handleSave = async () => {
    if (!accessToken) return;
    setSaving(true);
    setError(null);
    setSuccess(null);
    try {
      const { locale } = form;
      await adminSettingsApi.updateProfile(accessToken, toUpdateInput(form));
      if (locale !== profile?.preferredLocale) {
        await adminSettingsApi.updateLanguage(accessToken, locale);
        // Set cookie so middleware picks it up immediately
        document.cookie = `ybr_locale=${locale}; path=/; max-age=${60 * 60 * 24 * 365}; samesite=lax`;
        setProfile((prev) =>
          prev ? { ...prev, preferredLocale: locale } : prev,
        );
      }
      setSuccess("Perfil salvo com sucesso!");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao salvar perfil.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2
          className="animate-spin h-6 w-6 text-primary"
          aria-label="Carregando perfil"
        />
      </div>
    );
  }

  const avatarUrl = profile?.avatarUrl;
  const initials = (profile?.name ?? user?.name ?? "C").charAt(0).toUpperCase();

  return (
    <div className="max-w-3xl mx-auto space-y-8">
      {/* Page header */}
      <div>
        <h2 className="text-2xl font-bold text-on-surface">
          Perfil do Creator
        </h2>
        <p className="text-on-surface-variant mt-1 text-sm">
          Gerencie seus dados pessoais, endereço e preferências de idioma.
        </p>
      </div>

      {/* Feedback */}
      {error && (
        <div className="p-4 rounded-xl bg-error-container text-on-error-container text-sm border border-error/20">
          {error}
        </div>
      )}
      {success && (
        <div className="p-4 rounded-xl bg-[#e6f7f6] text-[#1ab5ad] text-sm border border-[#1ab5ad]/20">
          {success}
        </div>
      )}

      {/* Avatar section */}
      <div className="bg-surface border border-outline-variant rounded-xl p-6 shadow-card">
        <h3 className="text-base font-semibold text-on-surface mb-4 flex items-center gap-2">
          <User className="h-4 w-4 text-primary" aria-hidden="true" />
          Foto de Perfil
        </h3>
        <div className="flex items-center gap-6">
          <button
            type="button"
            onClick={handleAvatarClick}
            className="relative w-20 h-20 rounded-full bg-primary-container border-2 border-outline-variant overflow-hidden shrink-0 group hover:opacity-90 transition-opacity focus:outline-none focus:ring-2 focus:ring-primary"
            aria-label="Alterar foto de perfil"
          >
            {avatarUrl ? (
              <Image
                src={avatarUrl}
                alt="Foto de perfil"
                fill
                sizes="80px"
                className="object-cover"
              />
            ) : (
              <span className="flex items-center justify-center w-full h-full text-2xl font-bold text-primary">
                {initials}
              </span>
            )}
            <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
              <Camera className="h-5 w-5 text-white" aria-hidden="true" />
            </div>
            {uploadingAvatar && (
              <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                <Loader2
                  className="h-5 w-5 text-white animate-spin"
                  aria-hidden="true"
                />
              </div>
            )}
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/jpg,image/png,image/webp"
            className="sr-only"
            onChange={handleAvatarChange}
            aria-label="Selecionar foto de perfil"
          />
          <div>
            <p className="text-sm font-medium text-on-surface">
              Clique na foto para alterar
            </p>
            <p className="text-xs text-on-surface-variant mt-1">
              JPEG, PNG ou WebP — máximo 5 MB
            </p>
          </div>
        </div>
      </div>

      {/* Personal data */}
      <div className="bg-surface border border-outline-variant rounded-xl p-6 shadow-card space-y-5">
        <h3 className="text-base font-semibold text-on-surface flex items-center gap-2">
          <User className="h-4 w-4 text-primary" aria-hidden="true" />
          Dados Pessoais
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {/* Name */}
          <div>
            <label
              htmlFor="name"
              className="block text-xs font-semibold text-on-surface-variant mb-1.5 uppercase tracking-wide"
            >
              Nome completo
            </label>
            <input
              id="name"
              type="text"
              value={form.name ?? ""}
              onChange={(e) => handleChange("name", e.target.value)}
              className="w-full h-10 px-3 rounded-lg border border-outline-variant bg-surface-container-low text-on-surface text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-all"
              placeholder="Seu nome completo"
            />
          </div>

          {/* Email (read-only) */}
          <div>
            <label
              htmlFor="email"
              className="block text-xs font-semibold text-on-surface-variant mb-1.5 uppercase tracking-wide"
            >
              E-mail
            </label>
            <input
              id="email"
              type="email"
              value={profile?.email ?? ""}
              readOnly
              className="w-full h-10 px-3 rounded-lg border border-outline-variant bg-surface-container text-on-surface-variant text-sm cursor-not-allowed"
            />
          </div>

          {/* Phone */}
          <div>
            <label
              htmlFor="phone"
              className="block text-xs font-semibold text-on-surface-variant mb-1.5 uppercase tracking-wide"
            >
              Telefone
            </label>
            <div className="flex h-10 rounded-lg border border-outline-variant bg-surface-container-low overflow-hidden focus-within:ring-2 focus-within:ring-primary focus-within:border-primary transition-all">
              <div ref={phoneDropdownRef} className="relative shrink-0 h-full">
                <button
                  type="button"
                  onClick={() => setPhoneDropdownOpen((prev) => !prev)}
                  aria-label="Selecionar país do telefone"
                  aria-expanded={phoneDropdownOpen}
                  aria-haspopup="listbox"
                  className="h-full pl-2.5 pr-2 flex items-center gap-1.5 bg-surface-container border-r border-outline-variant text-sm focus:outline-none hover:bg-surface-container-high transition-colors cursor-pointer"
                >
                  <span className="text-base leading-none">
                    {
                      PHONE_COUNTRIES.find((c) => c.code === form.phoneCountry)
                        ?.flag
                    }
                  </span>
                  <span className="text-on-surface-variant font-medium">
                    {
                      PHONE_COUNTRIES.find((c) => c.code === form.phoneCountry)
                        ?.dial
                    }
                  </span>
                  <ChevronDown className="h-3 w-3 text-on-surface-variant" />
                </button>
                {phoneDropdownOpen && (
                  <div
                    role="listbox"
                    aria-label="País do telefone"
                    className="absolute top-full left-0 mt-1 rounded-lg border border-outline-variant bg-surface shadow-lg z-50 overflow-hidden min-w-[110px]"
                  >
                    {PHONE_COUNTRIES.map((country) => (
                      <button
                        key={country.code}
                        type="button"
                        role="option"
                        aria-selected={form.phoneCountry === country.code}
                        onClick={() => {
                          handlePhoneCountryChange(country.code);
                          setPhoneDropdownOpen(false);
                        }}
                        className={`w-full flex items-center gap-2 px-3 py-2 text-sm text-left transition-colors ${
                          form.phoneCountry === country.code
                            ? "bg-primary-container text-primary"
                            : "text-on-surface hover:bg-surface-container"
                        }`}
                      >
                        <span className="text-base leading-none">
                          {country.flag}
                        </span>
                        <span className="font-medium">{country.code}</span>
                        <span className="text-on-surface-variant ml-auto">
                          {country.dial}
                        </span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
              <input
                id="phone"
                type="tel"
                value={form.phone ?? ""}
                onChange={(e) => handleChange("phone", e.target.value)}
                className="flex-1 h-full px-3 bg-transparent text-on-surface text-sm focus:outline-none"
                placeholder={
                  form.phoneCountry === "BR"
                    ? "(11) 9 9999-9999"
                    : "(555) 555-5555"
                }
              />
            </div>
          </div>

          {/* CPF */}
          <div>
            <label
              htmlFor="cpf"
              className="block text-xs font-semibold text-on-surface-variant mb-1.5 uppercase tracking-wide"
            >
              CPF
            </label>
            <input
              id="cpf"
              type="text"
              inputMode="numeric"
              value={form.cpf ?? ""}
              onChange={(e) => handleChange("cpf", e.target.value)}
              className="w-full h-10 px-3 rounded-lg border border-outline-variant bg-surface-container-low text-on-surface text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-all"
              placeholder="000.000.000-00"
              maxLength={14}
            />
          </div>

          {/* Birth date */}
          <div>
            <label
              htmlFor="birthDate"
              className="block text-xs font-semibold text-on-surface-variant mb-1.5 uppercase tracking-wide"
            >
              Data de nascimento
            </label>
            <input
              id="birthDate"
              type="date"
              value={form.birthDate ?? ""}
              onChange={(e) => handleChange("birthDate", e.target.value)}
              className="w-full h-10 px-3 rounded-lg border border-outline-variant bg-surface-container-low text-on-surface text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-all"
            />
          </div>

          {/* Gender */}
          <div>
            <label
              htmlFor="gender"
              className="block text-xs font-semibold text-on-surface-variant mb-1.5 uppercase tracking-wide"
            >
              Gênero
            </label>
            <select
              id="gender"
              value={form.gender ?? ""}
              onChange={(e) => handleChange("gender", e.target.value)}
              className="w-full h-10 px-3 rounded-lg border border-outline-variant bg-surface-container-low text-on-surface text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-all"
            >
              {GENDER_OPTIONS.map(({ value, label }) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Bio */}
        <div>
          <label
            htmlFor="bio"
            className="block text-xs font-semibold text-on-surface-variant mb-1.5 uppercase tracking-wide"
          >
            Bio
          </label>
          <textarea
            id="bio"
            value={form.bio ?? ""}
            onChange={(e) => handleChange("bio", e.target.value)}
            rows={3}
            className="w-full px-3 py-2.5 rounded-lg border border-outline-variant bg-surface-container-low text-on-surface text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-all resize-none"
            placeholder="Conte um pouco sobre você..."
            maxLength={1000}
          />
          <p className="text-xs text-on-surface-variant mt-1">
            {(form.bio ?? "").length}/1000
          </p>
        </div>

        {/* Website */}
        <div>
          <label
            htmlFor="website"
            className="block text-xs font-semibold text-on-surface-variant mb-1.5 uppercase tracking-wide"
          >
            Website
          </label>
          <input
            id="website"
            type="url"
            value={form.website ?? ""}
            onChange={(e) => handleChange("website", e.target.value)}
            className="w-full h-10 px-3 rounded-lg border border-outline-variant bg-surface-container-low text-on-surface text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-all"
            placeholder="https://seusite.com"
          />
        </div>
      </div>

      {/* Address */}
      <div className="bg-surface border border-outline-variant rounded-xl p-6 shadow-card space-y-5">
        <h3 className="text-base font-semibold text-on-surface">Endereço</h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {/* Country */}
          <div>
            <label
              htmlFor="country"
              className="block text-xs font-semibold text-on-surface-variant mb-1.5 uppercase tracking-wide"
            >
              País
            </label>
            <select
              id="country"
              value={form.country ?? "BR"}
              onChange={(e) => handleChange("country", e.target.value)}
              className="w-full h-10 px-3 rounded-lg border border-outline-variant bg-surface-container-low text-on-surface text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-all"
            >
              <option value="BR">Brasil</option>
              <option value="US">Estados Unidos</option>
            </select>
          </div>

          {/* ZIP */}
          <div>
            <label
              htmlFor="zipCode"
              className="block text-xs font-semibold text-on-surface-variant mb-1.5 uppercase tracking-wide"
            >
              {form.country === "US" ? "ZIP Code" : "CEP"}
            </label>
            <input
              id="zipCode"
              type="text"
              value={form.zipCode ?? ""}
              onChange={(e) => handleChange("zipCode", e.target.value)}
              onBlur={(e) => {
                if (form.country === "BR") handleViaCep(e.target.value);
              }}
              className="w-full h-10 px-3 rounded-lg border border-outline-variant bg-surface-container-low text-on-surface text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-all"
              placeholder={form.country === "US" ? "90210" : "00000-000"}
              maxLength={10}
            />
          </div>

          {/* State */}
          <div>
            <label
              htmlFor="state"
              className="block text-xs font-semibold text-on-surface-variant mb-1.5 uppercase tracking-wide"
            >
              Estado / UF
            </label>
            <input
              id="state"
              type="text"
              value={form.state ?? ""}
              onChange={(e) => handleChange("state", e.target.value)}
              className="w-full h-10 px-3 rounded-lg border border-outline-variant bg-surface-container-low text-on-surface text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-all"
              placeholder="SP"
              maxLength={50}
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {/* Street */}
          <div className="md:col-span-2">
            <label
              htmlFor="street"
              className="block text-xs font-semibold text-on-surface-variant mb-1.5 uppercase tracking-wide"
            >
              Logradouro
            </label>
            <input
              id="street"
              type="text"
              value={form.street ?? ""}
              onChange={(e) => handleChange("street", e.target.value)}
              className="w-full h-10 px-3 rounded-lg border border-outline-variant bg-surface-container-low text-on-surface text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-all"
              placeholder="Rua, Avenida..."
            />
          </div>

          {/* Number */}
          <div>
            <label
              htmlFor="streetNumber"
              className="block text-xs font-semibold text-on-surface-variant mb-1.5 uppercase tracking-wide"
            >
              Número
            </label>
            <input
              id="streetNumber"
              type="text"
              value={form.streetNumber ?? ""}
              onChange={(e) => handleChange("streetNumber", e.target.value)}
              className="w-full h-10 px-3 rounded-lg border border-outline-variant bg-surface-container-low text-on-surface text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-all"
              placeholder="123"
              maxLength={20}
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {/* Complement */}
          <div>
            <label
              htmlFor="complement"
              className="block text-xs font-semibold text-on-surface-variant mb-1.5 uppercase tracking-wide"
            >
              Complemento
            </label>
            <input
              id="complement"
              type="text"
              value={form.complement ?? ""}
              onChange={(e) => handleChange("complement", e.target.value)}
              className="w-full h-10 px-3 rounded-lg border border-outline-variant bg-surface-container-low text-on-surface text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-all"
              placeholder="Apto, Sala..."
              maxLength={100}
            />
          </div>

          {/* Neighborhood */}
          <div>
            <label
              htmlFor="neighborhood"
              className="block text-xs font-semibold text-on-surface-variant mb-1.5 uppercase tracking-wide"
            >
              Bairro
            </label>
            <input
              id="neighborhood"
              type="text"
              value={form.neighborhood ?? ""}
              onChange={(e) => handleChange("neighborhood", e.target.value)}
              className="w-full h-10 px-3 rounded-lg border border-outline-variant bg-surface-container-low text-on-surface text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-all"
              placeholder="Centro"
              maxLength={100}
            />
          </div>

          {/* City */}
          <div>
            <label
              htmlFor="city"
              className="block text-xs font-semibold text-on-surface-variant mb-1.5 uppercase tracking-wide"
            >
              Cidade
            </label>
            <input
              id="city"
              type="text"
              value={form.city ?? ""}
              onChange={(e) => handleChange("city", e.target.value)}
              className="w-full h-10 px-3 rounded-lg border border-outline-variant bg-surface-container-low text-on-surface text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-all"
              placeholder="São Paulo"
              maxLength={100}
            />
          </div>
        </div>
      </div>

      {/* Language preference */}
      <div className="bg-surface border border-outline-variant rounded-xl p-6 shadow-card">
        <h3 className="text-base font-semibold text-on-surface mb-4 flex items-center gap-2">
          <Globe className="h-4 w-4 text-primary" aria-hidden="true" />
          Idioma da Plataforma
        </h3>
        <div className="flex flex-wrap gap-3">
          {LANGUAGE_OPTIONS.map(({ value, label }) => (
            <button
              key={value}
              type="button"
              onClick={() => handleChange("locale", value)}
              className={`px-5 py-2 rounded-full text-sm font-semibold border transition-all ${
                form.locale === value
                  ? "bg-primary text-on-primary border-primary"
                  : "bg-surface-container-low text-on-surface-variant border-outline-variant hover:border-primary hover:text-primary"
              }`}
              aria-pressed={form.locale === value}
            >
              {label}
            </button>
          ))}
        </div>
        <p className="text-xs text-on-surface-variant mt-3">
          O idioma será aplicado ao painel imediatamente após salvar.
        </p>
      </div>

      {/* Save button */}
      <div className="flex justify-end">
        <button
          type="button"
          onClick={handleSave}
          disabled={saving}
          className="flex items-center gap-2 px-8 py-3 bg-primary text-on-primary rounded-full font-semibold text-sm hover:bg-primary-hover active:scale-95 transition-all shadow-button disabled:opacity-60 disabled:cursor-not-allowed disabled:active:scale-100"
          aria-busy={saving}
        >
          {saving ? (
            <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
          ) : (
            <Save className="h-4 w-4" aria-hidden="true" />
          )}
          {saving ? "Salvando..." : "Salvar perfil"}
        </button>
      </div>
    </div>
  );
};

export default CreatorProfilePage;
