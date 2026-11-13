'use client'

import { Camera, Loader2, Palette, Play, Save, Upload } from 'lucide-react'
import Image from 'next/image'
import { useCallback, useEffect, useRef, useState } from 'react'
import { adminSettingsApi } from '@/lib/api/settings'
import { useAdminAuthStore } from '@/stores/auth'

// ─── Color utilities ────────────────────────────────────────────────────────

const hexToRgb = (hex: string): { r: number; g: number; b: number } | null => {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex)
  if (!result) return null
  return {
    r: parseInt(result[1] ?? '0', 16),
    g: parseInt(result[2] ?? '0', 16),
    b: parseInt(result[3] ?? '0', 16),
  }
}

// Returns the relative luminance (WCAG) for a hex color
const getLuminance = (hex: string): number => {
  const rgb = hexToRgb(hex)
  if (!rgb) return 0
  const toLinear = (c: number) => {
    const s = c / 255
    return s <= 0.03928 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4
  }
  return 0.2126 * toLinear(rgb.r) + 0.7152 * toLinear(rgb.g) + 0.0722 * toLinear(rgb.b)
}

// Auto-suggest on-primary color (white or black) based on primary luminance
const suggestOnPrimary = (primaryHex: string): string => {
  const lum = getLuminance(primaryHex)
  return lum > 0.179 ? '#000000' : '#ffffff'
}

// ─── Preview component ──────────────────────────────────────────────────────

interface VideoPreviewProps {
  primaryColor: string
  onPrimaryColor: string
  accentColor: string
  sidebarBgColor: string
  onSidebarColor: string
  logoUrl: string | null
  brandName: string
}

const VideoPreview = ({
  primaryColor,
  onPrimaryColor,
  accentColor,
  sidebarBgColor,
  onSidebarColor,
  logoUrl,
  brandName,
}: VideoPreviewProps) => (
  <div className="rounded-xl overflow-hidden border border-outline-variant shadow-card bg-[#0e0e0e]">
    {/* Preview label */}
    <div className="px-4 py-2 bg-surface-container border-b border-outline-variant">
      <p className="text-xs text-on-surface-variant font-semibold uppercase tracking-widest">
        Preview — Tela de aula do aluno
      </p>
    </div>

    {/* Header */}
    <div className="flex items-center justify-between px-4 py-2.5 bg-[#111111] border-b border-white/5">
      {logoUrl ? (
        <div className="relative h-8 w-36 shrink-0">
          <Image
            src={logoUrl}
            alt="Logo"
            fill
            sizes="144px"
            className="object-contain object-left"
          />
        </div>
      ) : (
        <div
          className="h-7 px-3 rounded flex items-center text-xs font-bold"
          style={{ backgroundColor: primaryColor, color: onPrimaryColor }}
        >
          {brandName || 'Minha Marca'}
        </div>
      )}
      <div className="flex items-center gap-2">
        <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white/60 border border-white/10">
          A
        </div>
      </div>
    </div>

    {/* Content area */}
    <div className="flex" style={{ minHeight: 220 }}>
      {/* Video area */}
      <div className="flex-1 bg-black flex flex-col">
        {/* Fake video */}
        <div className="flex-1 relative flex items-center justify-center bg-[#0a0a0a]">
          <div className="aspect-video w-full max-w-[340px] relative bg-[#1a1a1a] rounded flex items-center justify-center">
            <div
              className="w-12 h-12 rounded-full flex items-center justify-center shadow-lg"
              style={{ backgroundColor: primaryColor }}
            >
              <Play
                className="w-5 h-5 ml-0.5"
                style={{ color: onPrimaryColor }}
                fill={onPrimaryColor}
              />
            </div>
          </div>
        </div>

        {/* Progress bar */}
        <div className="px-4 pb-3 pt-2">
          <div className="flex items-center gap-2 text-[10px] text-white/40 mb-1.5">
            <span>02:34</span>
            <div className="flex-1 h-1 bg-white/10 rounded-full overflow-hidden">
              <div
                className="h-full rounded-full"
                style={{ width: '42%', backgroundColor: accentColor }}
              />
            </div>
            <span>06:10</span>
          </div>
        </div>
      </div>

      {/* Sidebar */}
      <div
        className="w-40 border-l border-white/5 flex flex-col py-2 shrink-0"
        style={{ backgroundColor: sidebarBgColor }}
      >
        <p
          className="text-[9px] font-bold uppercase tracking-widest px-3 mb-1.5"
          style={{ color: onSidebarColor, opacity: 0.4 }}
        >
          Aulas
        </p>
        {[
          { label: 'Introdução', done: true },
          { label: 'Módulo 1', done: true },
          { label: 'Módulo 2', active: true },
          { label: 'Módulo 3', done: false },
        ].map(({ label, done, active }) => (
          <div
            key={label}
            className="flex items-center gap-2 px-3 py-1.5 text-[10px] font-medium"
            style={{
              color: onSidebarColor,
              opacity: active ? 1 : done ? 0.5 : 0.25,
              borderLeft: active ? `2px solid ${primaryColor}` : '2px solid transparent',
            }}
          >
            <div
              className="w-3 h-3 rounded-full border shrink-0"
              style={{
                borderColor: active || done ? accentColor : `${onSidebarColor}22`,
                backgroundColor: done ? accentColor : 'transparent',
              }}
            />
            {label}
          </div>
        ))}

        <div className="mt-auto px-3 pb-2">
          <button
            type="button"
            className="w-full py-1.5 rounded text-[10px] font-bold"
            style={{ backgroundColor: primaryColor, color: onPrimaryColor }}
          >
            Próxima aula →
          </button>
        </div>
      </div>
    </div>
  </div>
)

// ─── Main page ───────────────────────────────────────────────────────────────

const CreatorBrandingPage = () => {
  const { accessToken } = useAdminAuthStore()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [uploadingLogo, setUploadingLogo] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const logoInputRef = useRef<HTMLInputElement>(null)

  const [form, setForm] = useState({
    brandName: '',
    primaryColor: '#6366f1',
    onPrimaryColor: '#ffffff',
    accentColor: '#10b981',
    onAccentColor: '#ffffff',
    sidebarBgColor: '#1c1917',
    onSidebarColor: '#f5f5f4',
    logoUrl: null as string | null,
  })

  useEffect(() => {
    if (!accessToken) return
    adminSettingsApi
      .getBranding(accessToken)
      .then(data => {
        setForm({
          brandName: data.brandName ?? '',
          primaryColor: data.primaryColor ?? '#6366f1',
          onPrimaryColor: data.onPrimaryColor ?? '#ffffff',
          accentColor: data.accentColor ?? '#10b981',
          onAccentColor: data.onAccentColor ?? '#ffffff',
          sidebarBgColor: data.sidebarBgColor ?? '#1c1917',
          onSidebarColor: data.onSidebarColor ?? '#f5f5f4',
          logoUrl: data.logoUrl ?? null,
        })
      })
      .catch(() => setError('Não foi possível carregar as configurações de marca.'))
      .finally(() => setLoading(false))
  }, [accessToken])

  const handlePrimaryColorChange = useCallback((hex: string) => {
    setForm(prev => ({
      ...prev,
      primaryColor: hex,
      // Auto-suggest on-primary color for contrast, but only if user hasn't manually set it
      onPrimaryColor:
        prev.onPrimaryColor === suggestOnPrimary(prev.primaryColor)
          ? suggestOnPrimary(hex)
          : prev.onPrimaryColor,
    }))
  }, [])

  const handleLogoClick = () => logoInputRef.current?.click()

  const handleLogoChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file || !accessToken) return
    setUploadingLogo(true)
    setError(null)
    try {
      const { logoUrl } = await adminSettingsApi.uploadLogo(accessToken, file)
      setForm(prev => ({ ...prev, logoUrl }))
      setSuccess('Logo enviada com sucesso!')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao enviar logo.')
    } finally {
      setUploadingLogo(false)
    }
  }

  const handleSave = async () => {
    if (!accessToken) return
    setSaving(true)
    setError(null)
    setSuccess(null)
    try {
      await adminSettingsApi.updateBranding(accessToken, {
        ...(form.brandName ? { brandName: form.brandName } : {}),
        primaryColor: form.primaryColor,
        onPrimaryColor: form.onPrimaryColor,
        accentColor: form.accentColor,
        onAccentColor: form.onAccentColor,
        sidebarBgColor: form.sidebarBgColor,
        onSidebarColor: form.onSidebarColor,
      })
      setSuccess('Identidade visual salva com sucesso!')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao salvar.')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2
          className="animate-spin h-6 w-6 text-primary"
          aria-label="Carregando configurações de marca"
        />
      </div>
    )
  }

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      {/* Page header */}
      <div>
        <h2 className="text-2xl font-bold text-on-surface">Identidade Visual</h2>
        <p className="text-on-surface-variant mt-1 text-sm">
          Configure a logo, nome da marca e cores que serão exibidos no portal dos seus alunos.
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

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-8 items-start">
        {/* ── Left: config panel ── */}
        <div className="space-y-6">
          {/* Logo upload */}
          <div className="bg-surface border border-outline-variant rounded-xl p-6 shadow-card">
            <h3 className="text-base font-semibold text-on-surface mb-1 flex items-center gap-2">
              <Camera className="h-4 w-4 text-primary" aria-hidden="true" />
              Logo da Marca
            </h3>
            <p className="text-xs text-on-surface-variant mb-4">
              PNG com fundo transparente ou SVG. Proporção recomendada 3:1 a 5:1 (ex: 400×120px).
              Máximo 2 MB.
            </p>

            <div className="flex items-center gap-4">
              <button
                type="button"
                onClick={handleLogoClick}
                className="relative w-36 h-12 rounded-lg border-2 border-dashed border-outline-variant bg-surface-container-low flex items-center justify-center overflow-hidden hover:border-primary transition-colors group focus:outline-none focus:ring-2 focus:ring-primary"
                aria-label="Enviar logo"
              >
                {form.logoUrl ? (
                  <Image
                    src={form.logoUrl}
                    alt="Logo"
                    fill
                    sizes="144px"
                    className="object-contain p-1"
                  />
                ) : (
                  <div className="flex flex-col items-center gap-1 text-on-surface-variant group-hover:text-primary transition-colors">
                    <Upload className="h-4 w-4" aria-hidden="true" />
                    <span className="text-[10px] font-medium">Enviar logo</span>
                  </div>
                )}
                {uploadingLogo && (
                  <div className="absolute inset-0 bg-surface/80 flex items-center justify-center">
                    <Loader2 className="h-4 w-4 animate-spin text-primary" aria-hidden="true" />
                  </div>
                )}
              </button>
              <input
                ref={logoInputRef}
                type="file"
                accept="image/png,image/svg+xml"
                className="sr-only"
                onChange={handleLogoChange}
                aria-label="Selecionar logo"
              />
              {form.logoUrl && (
                <button
                  type="button"
                  onClick={() => setForm(prev => ({ ...prev, logoUrl: null }))}
                  className="text-xs text-error hover:underline"
                >
                  Remover
                </button>
              )}
            </div>
          </div>

          {/* Brand name */}
          <div className="bg-surface border border-outline-variant rounded-xl p-6 shadow-card">
            <h3 className="text-base font-semibold text-on-surface mb-4">Nome da Marca</h3>
            <input
              type="text"
              value={form.brandName}
              onChange={e => setForm(prev => ({ ...prev, brandName: e.target.value }))}
              className="w-full h-10 px-3 rounded-lg border border-outline-variant bg-surface-container-low text-on-surface text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-all"
              placeholder="Ex: Escola da Joana"
              maxLength={255}
            />
            <p className="text-xs text-on-surface-variant mt-2">
              Exibido no header do portal dos alunos quando não houver logo.
            </p>
          </div>

          {/* Colors */}
          <div className="bg-surface border border-outline-variant rounded-xl p-6 shadow-card">
            <h3 className="text-base font-semibold text-on-surface mb-1 flex items-center gap-2">
              <Palette className="h-4 w-4 text-primary" aria-hidden="true" />
              Cores da Marca
            </h3>
            <p className="text-xs text-on-surface-variant mb-5">
              A cor primária será usada em botões, barra de progresso e destaques. A cor do texto
              deve contrastar bem com a primária.
            </p>

            <div className="space-y-5">
              {/* Primary color */}
              <div>
                <label
                  htmlFor="primaryColor"
                  className="block text-xs font-semibold text-on-surface-variant mb-2 uppercase tracking-wide"
                >
                  Cor primária
                </label>
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <input
                      id="primaryColor"
                      type="color"
                      value={form.primaryColor}
                      onChange={e => handlePrimaryColorChange(e.target.value)}
                      className="w-12 h-12 rounded-lg border border-outline-variant cursor-pointer p-1 bg-surface-container-low"
                      aria-label="Selecionar cor primária"
                    />
                  </div>
                  <div className="flex-1">
                    <input
                      type="text"
                      value={form.primaryColor}
                      onChange={e => {
                        const val = e.target.value
                        if (/^#[0-9A-Fa-f]{0,6}$/.test(val)) {
                          if (val.length === 7) handlePrimaryColorChange(val)
                          else setForm(prev => ({ ...prev, primaryColor: val }))
                        }
                      }}
                      className="w-full h-10 px-3 rounded-lg border border-outline-variant bg-surface-container-low text-on-surface text-sm font-mono focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-all"
                      placeholder="#6366f1"
                      maxLength={7}
                    />
                  </div>
                  <div
                    className="w-10 h-10 rounded-full border border-outline-variant shrink-0"
                    style={{ backgroundColor: form.primaryColor }}
                    aria-hidden="true"
                  />
                </div>
              </div>

              {/* On-primary (text on primary) */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label
                    htmlFor="onPrimaryColor"
                    className="block text-xs font-semibold text-on-surface-variant uppercase tracking-wide"
                  >
                    Texto sobre a cor primária
                  </label>
                  <button
                    type="button"
                    onClick={() =>
                      setForm(prev => ({
                        ...prev,
                        onPrimaryColor: suggestOnPrimary(prev.primaryColor),
                      }))
                    }
                    className="text-[10px] text-primary hover:underline"
                  >
                    Sugerir automaticamente
                  </button>
                </div>
                <div className="flex items-center gap-3">
                  <input
                    id="onPrimaryColor"
                    type="color"
                    value={form.onPrimaryColor}
                    onChange={e =>
                      setForm(prev => ({
                        ...prev,
                        onPrimaryColor: e.target.value,
                      }))
                    }
                    className="w-12 h-12 rounded-lg border border-outline-variant cursor-pointer p-1 bg-surface-container-low"
                    aria-label="Selecionar cor do texto sobre primária"
                  />
                  <div className="flex-1">
                    <input
                      type="text"
                      value={form.onPrimaryColor}
                      onChange={e => {
                        const val = e.target.value
                        if (/^#[0-9A-Fa-f]{0,6}$/.test(val) && val.length === 7) {
                          setForm(prev => ({ ...prev, onPrimaryColor: val }))
                        }
                      }}
                      className="w-full h-10 px-3 rounded-lg border border-outline-variant bg-surface-container-low text-on-surface text-sm font-mono focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-all"
                      placeholder="#ffffff"
                      maxLength={7}
                    />
                  </div>
                  {/* Contrast preview swatch */}
                  <div
                    className="w-10 h-10 rounded-full border border-outline-variant shrink-0 flex items-center justify-center text-xs font-bold"
                    style={{
                      backgroundColor: form.primaryColor,
                      color: form.onPrimaryColor,
                    }}
                    aria-hidden="true"
                  >
                    Aa
                  </div>
                </div>
                <p className="text-xs text-on-surface-variant mt-1.5">
                  Certifique-se de que o texto seja legível sobre a cor primária.
                </p>
              </div>
            </div>
          </div>

          {/* Lesson area colors */}
          <div className="bg-surface border border-outline-variant rounded-xl p-6 shadow-card">
            <h3 className="text-base font-semibold text-on-surface mb-1 flex items-center gap-2">
              <Palette className="h-4 w-4 text-primary" aria-hidden="true" />
              Cores da Área de Aula
            </h3>
            <p className="text-xs text-on-surface-variant mb-5">
              Personalize o fundo e o texto da sidebar de navegação das aulas, e a cor de destaque
              para progresso e conclusão.
            </p>

            <div className="space-y-5">
              {/* Accent color */}
              <div>
                <label
                  htmlFor="accentColor"
                  className="block text-xs font-semibold text-on-surface-variant mb-2 uppercase tracking-wide"
                >
                  Cor de destaque (progresso e conclusão)
                </label>
                <div className="flex items-center gap-3">
                  <input
                    id="accentColor"
                    type="color"
                    value={form.accentColor}
                    onChange={e =>
                      setForm(prev => ({
                        ...prev,
                        accentColor: e.target.value,
                      }))
                    }
                    className="w-12 h-12 rounded-lg border border-outline-variant cursor-pointer p-1 bg-surface-container-low"
                    aria-label="Selecionar cor de destaque"
                  />
                  <div className="flex-1">
                    <input
                      type="text"
                      value={form.accentColor}
                      onChange={e => {
                        const val = e.target.value
                        if (/^#[0-9A-Fa-f]{0,6}$/.test(val) && val.length === 7) {
                          setForm(prev => ({ ...prev, accentColor: val }))
                        }
                      }}
                      className="w-full h-10 px-3 rounded-lg border border-outline-variant bg-surface-container-low text-on-surface text-sm font-mono focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-all"
                      placeholder="#10b981"
                      maxLength={7}
                    />
                  </div>
                  <div
                    className="w-10 h-10 rounded-full border border-outline-variant shrink-0"
                    style={{ backgroundColor: form.accentColor }}
                    aria-hidden="true"
                  />
                </div>
              </div>

              {/* On-accent */}
              <div>
                <label
                  htmlFor="onAccentColor"
                  className="block text-xs font-semibold text-on-surface-variant mb-2 uppercase tracking-wide"
                >
                  Texto sobre a cor de destaque
                </label>
                <div className="flex items-center gap-3">
                  <input
                    id="onAccentColor"
                    type="color"
                    value={form.onAccentColor}
                    onChange={e =>
                      setForm(prev => ({
                        ...prev,
                        onAccentColor: e.target.value,
                      }))
                    }
                    className="w-12 h-12 rounded-lg border border-outline-variant cursor-pointer p-1 bg-surface-container-low"
                    aria-label="Selecionar texto sobre destaque"
                  />
                  <div className="flex-1">
                    <input
                      type="text"
                      value={form.onAccentColor}
                      onChange={e => {
                        const val = e.target.value
                        if (/^#[0-9A-Fa-f]{0,6}$/.test(val) && val.length === 7) {
                          setForm(prev => ({ ...prev, onAccentColor: val }))
                        }
                      }}
                      className="w-full h-10 px-3 rounded-lg border border-outline-variant bg-surface-container-low text-on-surface text-sm font-mono focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-all"
                      placeholder="#ffffff"
                      maxLength={7}
                    />
                  </div>
                  <div
                    className="w-10 h-10 rounded-full border border-outline-variant shrink-0 flex items-center justify-center text-xs font-bold"
                    style={{
                      backgroundColor: form.accentColor,
                      color: form.onAccentColor,
                    }}
                    aria-hidden="true"
                  >
                    Aa
                  </div>
                </div>
              </div>

              {/* Sidebar background */}
              <div>
                <label
                  htmlFor="sidebarBgColor"
                  className="block text-xs font-semibold text-on-surface-variant mb-2 uppercase tracking-wide"
                >
                  Fundo da sidebar de aulas
                </label>
                <div className="flex items-center gap-3">
                  <input
                    id="sidebarBgColor"
                    type="color"
                    value={form.sidebarBgColor}
                    onChange={e =>
                      setForm(prev => ({
                        ...prev,
                        sidebarBgColor: e.target.value,
                      }))
                    }
                    className="w-12 h-12 rounded-lg border border-outline-variant cursor-pointer p-1 bg-surface-container-low"
                    aria-label="Selecionar cor de fundo da sidebar"
                  />
                  <div className="flex-1">
                    <input
                      type="text"
                      value={form.sidebarBgColor}
                      onChange={e => {
                        const val = e.target.value
                        if (/^#[0-9A-Fa-f]{0,6}$/.test(val) && val.length === 7) {
                          setForm(prev => ({ ...prev, sidebarBgColor: val }))
                        }
                      }}
                      className="w-full h-10 px-3 rounded-lg border border-outline-variant bg-surface-container-low text-on-surface text-sm font-mono focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-all"
                      placeholder="#1c1917"
                      maxLength={7}
                    />
                  </div>
                  <div
                    className="w-10 h-10 rounded-full border border-outline-variant shrink-0"
                    style={{ backgroundColor: form.sidebarBgColor }}
                    aria-hidden="true"
                  />
                </div>
              </div>

              {/* On-sidebar */}
              <div>
                <label
                  htmlFor="onSidebarColor"
                  className="block text-xs font-semibold text-on-surface-variant mb-2 uppercase tracking-wide"
                >
                  Texto e ícones na sidebar
                </label>
                <div className="flex items-center gap-3">
                  <input
                    id="onSidebarColor"
                    type="color"
                    value={form.onSidebarColor}
                    onChange={e =>
                      setForm(prev => ({
                        ...prev,
                        onSidebarColor: e.target.value,
                      }))
                    }
                    className="w-12 h-12 rounded-lg border border-outline-variant cursor-pointer p-1 bg-surface-container-low"
                    aria-label="Selecionar cor do texto na sidebar"
                  />
                  <div className="flex-1">
                    <input
                      type="text"
                      value={form.onSidebarColor}
                      onChange={e => {
                        const val = e.target.value
                        if (/^#[0-9A-Fa-f]{0,6}$/.test(val) && val.length === 7) {
                          setForm(prev => ({ ...prev, onSidebarColor: val }))
                        }
                      }}
                      className="w-full h-10 px-3 rounded-lg border border-outline-variant bg-surface-container-low text-on-surface text-sm font-mono focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-all"
                      placeholder="#f5f5f4"
                      maxLength={7}
                    />
                  </div>
                  <div
                    className="w-10 h-10 rounded-full border border-outline-variant shrink-0 flex items-center justify-center text-xs font-bold"
                    style={{
                      backgroundColor: form.sidebarBgColor,
                      color: form.onSidebarColor,
                    }}
                    aria-hidden="true"
                  >
                    Aa
                  </div>
                </div>
              </div>
            </div>
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
              {saving ? 'Salvando...' : 'Salvar identidade visual'}
            </button>
          </div>
        </div>

        {/* ── Right: live preview ── */}
        <div className="space-y-4 xl:sticky xl:top-6">
          <VideoPreview
            primaryColor={form.primaryColor}
            onPrimaryColor={form.onPrimaryColor}
            accentColor={form.accentColor}
            sidebarBgColor={form.sidebarBgColor}
            onSidebarColor={form.onSidebarColor}
            logoUrl={form.logoUrl}
            brandName={form.brandName}
          />
          <p className="text-xs text-on-surface-variant text-center">
            O preview atualiza em tempo real conforme você ajusta as cores.
          </p>
        </div>
      </div>
    </div>
  )
}

export default CreatorBrandingPage
