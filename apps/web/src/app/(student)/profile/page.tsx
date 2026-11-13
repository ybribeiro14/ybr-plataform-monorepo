'use client'

import {
  AlertCircle,
  AtSign,
  Camera,
  CheckCircle2,
  ChevronDown,
  Link2,
  Loader2,
  LogOut,
  MapPin,
  Phone,
  Save,
  Trash2,
  User,
  UserCircle,
  X,
} from 'lucide-react'
import Image from 'next/image'
import { useParams, useRouter } from 'next/navigation'
import { useTranslations } from 'next-intl'
import { useCallback, useEffect, useRef, useState } from 'react'
import type { StudentProfile, UpdateProfileInput } from '@/lib/api/student'
import { deleteAvatar, getProfile, updateProfile, uploadAvatar } from '@/lib/api/student'
import { useAuthStore } from '@/stores/auth'

type PhoneCountry = 'BR' | 'US'

const PHONE_COUNTRIES: { code: PhoneCountry; flag: string; dial: string }[] = [
  { code: 'BR', flag: '🇧🇷', dial: '+55' },
  { code: 'US', flag: '🇺🇸', dial: '+1' },
]

const maskCpf = (value: string): string => {
  const d = value.replace(/\D/g, '').slice(0, 11)
  if (d.length <= 3) return d
  if (d.length <= 6) return `${d.slice(0, 3)}.${d.slice(3)}`
  if (d.length <= 9) return `${d.slice(0, 3)}.${d.slice(3, 6)}.${d.slice(6)}`
  return `${d.slice(0, 3)}.${d.slice(3, 6)}.${d.slice(6, 9)}-${d.slice(9)}`
}

const maskPhoneBR = (value: string): string => {
  const d = value.replace(/\D/g, '').slice(0, 11)
  if (d.length <= 2) return d.length === 0 ? '' : `(${d}`
  if (d.length <= 6) return `(${d.slice(0, 2)}) ${d.slice(2)}`
  if (d.length <= 10) return `(${d.slice(0, 2)}) ${d.slice(2, 6)}-${d.slice(6)}`
  return `(${d.slice(0, 2)}) ${d.slice(2, 3)} ${d.slice(3, 7)}-${d.slice(7)}`
}

const maskPhoneUS = (value: string): string => {
  const d = value.replace(/\D/g, '').slice(0, 10)
  if (d.length <= 3) return d.length === 0 ? '' : `(${d}`
  if (d.length <= 6) return `(${d.slice(0, 3)}) ${d.slice(3)}`
  return `(${d.slice(0, 3)}) ${d.slice(3, 6)}-${d.slice(6)}`
}

const detectPhoneCountry = (phone: string): PhoneCountry => {
  const digits = phone.replace(/\D/g, '')
  if (phone.startsWith('+1') || (digits.length === 10 && !phone.startsWith('+'))) {
    return 'US'
  }
  return 'BR'
}

const BR_STATES = [
  'AC',
  'AL',
  'AP',
  'AM',
  'BA',
  'CE',
  'DF',
  'ES',
  'GO',
  'MA',
  'MT',
  'MS',
  'MG',
  'PA',
  'PB',
  'PR',
  'PE',
  'PI',
  'RJ',
  'RN',
  'RS',
  'RO',
  'RR',
  'SC',
  'SP',
  'SE',
  'TO',
]

const US_STATES = [
  'AL',
  'AK',
  'AZ',
  'AR',
  'CA',
  'CO',
  'CT',
  'DE',
  'FL',
  'GA',
  'HI',
  'ID',
  'IL',
  'IN',
  'IA',
  'KS',
  'KY',
  'LA',
  'ME',
  'MD',
  'MA',
  'MI',
  'MN',
  'MS',
  'MO',
  'MT',
  'NE',
  'NV',
  'NH',
  'NJ',
  'NM',
  'NY',
  'NC',
  'ND',
  'OH',
  'OK',
  'OR',
  'PA',
  'RI',
  'SC',
  'SD',
  'TN',
  'TX',
  'UT',
  'VT',
  'VA',
  'WA',
  'WV',
  'WI',
  'WY',
]

const ProfilePage = () => {
  const t = useTranslations('profile')
  const params = useParams()
  const locale = params.locale as string
  const router = useRouter()
  const { user, setUser, logout, accessToken } = useAuthStore()

  const [profile, setProfile] = useState<StudentProfile | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false)
  const [saveSuccess, setSaveSuccess] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const avatarInputRef = useRef<HTMLInputElement>(null)

  const [form, setForm] = useState<UpdateProfileInput & { name: string }>({
    name: '',
  })
  const [isFetchingAddress, setIsFetchingAddress] = useState(false)
  const [phoneCountry, setPhoneCountry] = useState<PhoneCountry>('BR')
  const [phoneDropdownOpen, setPhoneDropdownOpen] = useState(false)
  const phoneDropdownRef = useRef<HTMLDivElement>(null)

  const loadProfile = useCallback(async () => {
    if (!accessToken) return
    try {
      setIsLoading(true)
      const data = await getProfile(accessToken)
      setProfile(data)
      const rawPhone = data.phone ?? ''
      const detectedCountry = detectPhoneCountry(rawPhone)
      setPhoneCountry(detectedCountry)
      setForm({
        name: data.name,
        phone: detectedCountry === 'US' ? maskPhoneUS(rawPhone) : maskPhoneBR(rawPhone),
        cpf: maskCpf(data.cpf ?? ''),
        birthDate: data.birthDate ?? '',
        gender: data.gender ?? undefined,
        bio: data.bio ?? '',
        country: data.country ?? 'BR',
        zipCode: data.zipCode ?? '',
        street: data.street ?? '',
        streetNumber: data.streetNumber ?? '',
        complement: data.complement ?? '',
        neighborhood: data.neighborhood ?? '',
        city: data.city ?? '',
        state: data.state ?? '',
        linkedinUrl: data.linkedinUrl ?? '',
        instagramHandle: data.instagramHandle ?? '',
      })
    } catch {
      setErrorMessage(t('errorLoading'))
    } finally {
      setIsLoading(false)
    }
  }, [accessToken, t])

  useEffect(() => {
    void loadProfile()
  }, [loadProfile])

  const handleLogout = () => {
    logout()
    router.push(`/${locale}/login`)
  }

  const handleFieldChange = (field: keyof typeof form, value: string) => {
    if (field === 'phone') {
      const masked = phoneCountry === 'US' ? maskPhoneUS(value) : maskPhoneBR(value)
      setForm(prev => ({ ...prev, phone: masked }))
      return
    }
    if (field === 'cpf') {
      setForm(prev => ({ ...prev, cpf: maskCpf(value) }))
      return
    }
    setForm(prev => ({ ...prev, [field]: value }))
  }

  const handlePhoneCountryChange = (country: PhoneCountry) => {
    setPhoneCountry(country)
    setPhoneDropdownOpen(false)
    setForm(prev => ({ ...prev, phone: '' }))
  }

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (phoneDropdownRef.current && !phoneDropdownRef.current.contains(e.target as Node)) {
        setPhoneDropdownOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleZipBlur = async () => {
    const zip = form.zipCode?.replace(/\D/g, '') ?? ''
    if (!accessToken) return

    if (form.country === 'BR' && zip.length === 8) {
      setIsFetchingAddress(true)
      try {
        const res = await fetch(`https://viacep.com.br/ws/${zip}/json/`)
        const data: {
          logradouro?: string
          bairro?: string
          localidade?: string
          uf?: string
          erro?: boolean
        } = await res.json()
        if (!data.erro) {
          setForm(prev => ({
            ...prev,
            street: data.logradouro ?? prev.street,
            neighborhood: data.bairro ?? prev.neighborhood,
            city: data.localidade ?? prev.city,
            state: data.uf ?? prev.state,
          }))
        }
      } catch {
        // silently ignore
      } finally {
        setIsFetchingAddress(false)
      }
    } else if (form.country === 'US' && zip.length === 5) {
      setIsFetchingAddress(true)
      try {
        const res = await fetch(`https://api.zippopotam.us/us/${zip}`)
        if (res.ok) {
          const data: {
            places?: Array<{
              'place name': string
              'state abbreviation': string
            }>
          } = await res.json()
          const place = data.places?.[0]
          if (place) {
            setForm(prev => ({
              ...prev,
              city: place['place name'] ?? prev.city,
              state: place['state abbreviation'] ?? prev.state,
            }))
          }
        }
      } catch {
        // silently ignore
      } finally {
        setIsFetchingAddress(false)
      }
    }
  }

  const handleSave = async () => {
    if (!accessToken) return
    setIsSaving(true)
    setErrorMessage(null)
    try {
      const updated = await updateProfile(accessToken, form)
      setProfile(updated)
      if (user) {
        setUser({
          ...user,
          name: updated.name,
          isProfileComplete: updated.isProfileComplete,
        })
      }
      setSaveSuccess(true)
      setTimeout(() => setSaveSuccess(false), 3000)
    } catch {
      setErrorMessage(t('errorSaving'))
    } finally {
      setIsSaving(false)
    }
  }

  const handleAvatarClick = () => {
    avatarInputRef.current?.click()
  }

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file || !accessToken) return
    setIsUploadingAvatar(true)
    try {
      const avatarUrl = await uploadAvatar(accessToken, file)
      setProfile(prev => (prev ? { ...prev, avatarUrl } : prev))
      if (user) setUser({ ...user, avatarUrl })
    } catch {
      setErrorMessage(t('errorAvatar'))
    } finally {
      setIsUploadingAvatar(false)
      if (avatarInputRef.current) avatarInputRef.current.value = ''
    }
  }

  const handleRemoveAvatar = async () => {
    if (!accessToken) return
    setIsUploadingAvatar(true)
    try {
      await deleteAvatar(accessToken)
      setProfile(prev => (prev ? { ...prev, avatarUrl: null } : prev))
      if (user) setUser({ ...user, avatarUrl: null })
    } catch {
      setErrorMessage(t('errorAvatar'))
    } finally {
      setIsUploadingAvatar(false)
    }
  }

  const isBR = form.country === 'BR'
  const isUS = form.country === 'US'
  const stateOptions = isBR ? BR_STATES : isUS ? US_STATES : []

  if (isLoading) {
    return (
      <main className="p-8 lg:p-10 flex items-center justify-center min-h-64">
        <Loader2 className="w-8 h-8 animate-spin text-primary" aria-label={t('loading')} />
      </main>
    )
  }

  return (
    <main className="p-6 lg:p-10 max-w-3xl">
      {/* Header */}
      <div className="mb-8">
        <h1 className="font-title-lg text-4xl text-on-surface mb-2">{t('title')}</h1>
        <p className="text-body-md text-on-surface-variant">{t('subtitle')}</p>
      </div>

      {/* Profile incomplete banner */}
      {profile && !profile.isProfileComplete && (
        <div className="mb-6 flex items-start gap-3 p-4 rounded-xl bg-amber-50 border border-amber-200">
          <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" aria-hidden="true" />
          <div className="flex-1">
            <p className="text-sm font-semibold text-amber-900">{t('incompleteTitle')}</p>
            <p className="text-sm text-amber-700 mt-0.5">{t('incompleteDescription')}</p>
          </div>
        </div>
      )}

      {/* Success toast */}
      {saveSuccess && (
        <div className="mb-6 flex items-center gap-3 p-4 rounded-xl bg-green-50 border border-green-200">
          <CheckCircle2 className="w-5 h-5 text-green-600 shrink-0" aria-hidden="true" />
          <p className="text-sm font-semibold text-green-800">{t('saveSuccess')}</p>
        </div>
      )}

      {/* Error toast */}
      {errorMessage && (
        <div className="mb-6 flex items-center gap-3 p-4 rounded-xl bg-red-50 border border-red-200">
          <X className="w-5 h-5 text-red-600 shrink-0" aria-hidden="true" />
          <p className="text-sm text-red-800">{errorMessage}</p>
          <button
            type="button"
            onClick={() => setErrorMessage(null)}
            className="ml-auto text-red-500 hover:text-red-700"
            aria-label={t('dismiss')}
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      <div className="space-y-6">
        {/* ─── Seção 1: Avatar + dados pessoais ─── */}
        <section className="bg-surface border border-outline-variant rounded-2xl overflow-hidden shadow-sm">
          <div className="px-6 py-4 border-b border-outline-variant bg-surface-container/30">
            <div className="flex items-center gap-2">
              <User className="w-4 h-4 text-primary" aria-hidden="true" />
              <h2 className="text-sm font-semibold text-on-surface uppercase tracking-wider">
                {t('sectionPersonal')}
              </h2>
            </div>
          </div>

          <div className="p-6">
            {/* Avatar upload */}
            <div className="flex items-start gap-6 mb-6">
              <div className="relative shrink-0">
                <div className="w-20 h-20 rounded-full overflow-hidden bg-primary-container border-2 border-primary/20">
                  {profile?.avatarUrl ? (
                    <Image
                      src={profile.avatarUrl}
                      alt={t('avatarAlt')}
                      width={80}
                      height={80}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <UserCircle className="w-12 h-12 text-primary/50" aria-hidden="true" />
                    </div>
                  )}
                </div>
                {isUploadingAvatar && (
                  <div className="absolute inset-0 rounded-full bg-black/40 flex items-center justify-center">
                    <Loader2 className="w-5 h-5 animate-spin text-white" />
                  </div>
                )}
              </div>
              <div className="flex flex-col gap-2">
                <p className="text-sm font-medium text-on-surface">{t('avatarLabel')}</p>
                <p className="text-xs text-on-surface-variant">{t('avatarHint')}</p>
                <div className="flex gap-2 mt-1 flex-wrap">
                  <button
                    type="button"
                    onClick={handleAvatarClick}
                    disabled={isUploadingAvatar}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-primary text-on-primary text-xs font-semibold disabled:opacity-50 hover:opacity-90 transition"
                    aria-label={t('uploadAvatarButton')}
                  >
                    <Camera className="w-3.5 h-3.5" aria-hidden="true" />
                    {t('uploadAvatarButton')}
                  </button>
                  {profile?.avatarUrl && (
                    <button
                      type="button"
                      onClick={handleRemoveAvatar}
                      disabled={isUploadingAvatar}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-outline-variant text-on-surface-variant text-xs font-semibold disabled:opacity-50 hover:border-red-300 hover:text-red-600 transition"
                      aria-label={t('removeAvatarButton')}
                    >
                      <Trash2 className="w-3.5 h-3.5" aria-hidden="true" />
                      {t('removeAvatarButton')}
                    </button>
                  )}
                </div>
              </div>
              <input
                ref={avatarInputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp,image/gif"
                className="hidden"
                onChange={handleAvatarChange}
                aria-label={t('avatarFileInput')}
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="sm:col-span-2">
                <label
                  htmlFor="name"
                  className="block text-xs font-semibold text-on-surface-variant uppercase tracking-wider mb-1.5"
                >
                  {t('name')} <span className="text-red-500">*</span>
                </label>
                <input
                  id="name"
                  type="text"
                  value={form.name}
                  onChange={e => handleFieldChange('name', e.target.value)}
                  className="w-full px-4 py-2.5 rounded-lg border border-outline-variant bg-surface text-on-surface text-sm focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition"
                  aria-required="true"
                />
              </div>

              <div>
                <label
                  htmlFor="phone"
                  className="block text-xs font-semibold text-on-surface-variant uppercase tracking-wider mb-1.5"
                >
                  <span className="flex items-center gap-1">
                    <Phone className="w-3 h-3" aria-hidden="true" />
                    {t('phone')} <span className="text-red-500">*</span>
                  </span>
                </label>
                <div className="flex" ref={phoneDropdownRef}>
                  <div className="relative">
                    <button
                      type="button"
                      onClick={() => setPhoneDropdownOpen(v => !v)}
                      className="flex items-center gap-1.5 px-3 py-2.5 rounded-l-lg border border-r-0 border-outline-variant bg-surface text-on-surface text-sm hover:bg-surface-container/40 transition min-w-[80px]"
                      aria-haspopup="listbox"
                      aria-expanded={phoneDropdownOpen}
                    >
                      <span>{PHONE_COUNTRIES.find(c => c.code === phoneCountry)?.flag}</span>
                      <span className="text-on-surface-variant text-xs">
                        {PHONE_COUNTRIES.find(c => c.code === phoneCountry)?.dial}
                      </span>
                      <ChevronDown className="w-3 h-3 text-on-surface-variant" aria-hidden="true" />
                    </button>
                    {phoneDropdownOpen && (
                      <div className="absolute left-0 top-full mt-1 z-20 bg-surface border border-outline-variant rounded-lg shadow-lg overflow-hidden min-w-[120px]">
                        {PHONE_COUNTRIES.map(c => (
                          <div key={c.code}>
                            <button
                              type="button"
                              onClick={() => handlePhoneCountryChange(c.code)}
                              className="flex items-center gap-2 w-full px-3 py-2 text-sm hover:bg-surface-container/50 transition"
                              aria-pressed={phoneCountry === c.code}
                            >
                              <span>{c.flag}</span>
                              <span className="text-on-surface-variant">{c.dial}</span>
                              <span className="text-on-surface font-medium">{c.code}</span>
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                  <input
                    id="phone"
                    type="tel"
                    value={form.phone ?? ''}
                    onChange={e => handleFieldChange('phone', e.target.value)}
                    placeholder={phoneCountry === 'BR' ? '(11) 9 1234-5678' : '(555) 000-0000'}
                    className="flex-1 px-4 py-2.5 rounded-r-lg border border-outline-variant bg-surface text-on-surface text-sm focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition"
                    aria-required="true"
                  />
                </div>
              </div>

              {isBR && (
                <div>
                  <label
                    htmlFor="cpf"
                    className="block text-xs font-semibold text-on-surface-variant uppercase tracking-wider mb-1.5"
                  >
                    {t('cpf')}
                  </label>
                  <input
                    id="cpf"
                    type="text"
                    value={form.cpf ?? ''}
                    onChange={e => handleFieldChange('cpf', e.target.value)}
                    placeholder="000.000.000-00"
                    className="w-full px-4 py-2.5 rounded-lg border border-outline-variant bg-surface text-on-surface text-sm focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition"
                  />
                </div>
              )}

              <div>
                <label
                  htmlFor="birthDate"
                  className="block text-xs font-semibold text-on-surface-variant uppercase tracking-wider mb-1.5"
                >
                  {t('birthDate')}
                </label>
                <input
                  id="birthDate"
                  type="date"
                  value={form.birthDate ?? ''}
                  onChange={e => handleFieldChange('birthDate', e.target.value)}
                  className="w-full px-4 py-2.5 rounded-lg border border-outline-variant bg-surface text-on-surface text-sm focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition"
                />
              </div>

              <div>
                <label
                  htmlFor="gender"
                  className="block text-xs font-semibold text-on-surface-variant uppercase tracking-wider mb-1.5"
                >
                  {t('gender')}
                </label>
                <select
                  id="gender"
                  value={form.gender ?? ''}
                  onChange={e => handleFieldChange('gender', e.target.value)}
                  className="w-full px-4 py-2.5 rounded-lg border border-outline-variant bg-surface text-on-surface text-sm focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition"
                >
                  <option value="">{t('genderPlaceholder')}</option>
                  <option value="female">{t('genderFemale')}</option>
                  <option value="male">{t('genderMale')}</option>
                  <option value="nonbinary">{t('genderNonbinary')}</option>
                  <option value="prefer_not_to_say">{t('genderPreferNot')}</option>
                </select>
              </div>

              <div className="sm:col-span-2">
                <label
                  htmlFor="bio"
                  className="block text-xs font-semibold text-on-surface-variant uppercase tracking-wider mb-1.5"
                >
                  {t('bio')}
                </label>
                <textarea
                  id="bio"
                  rows={3}
                  value={form.bio ?? ''}
                  onChange={e => handleFieldChange('bio', e.target.value)}
                  placeholder={t('bioPlaceholder')}
                  maxLength={500}
                  className="w-full px-4 py-2.5 rounded-lg border border-outline-variant bg-surface text-on-surface text-sm focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition resize-none"
                />
                <p className="text-xs text-on-surface-variant mt-1 text-right">
                  {(form.bio ?? '').length}/500
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* ─── Seção 2: Endereço ─── */}
        <section className="bg-surface border border-outline-variant rounded-2xl overflow-hidden shadow-sm">
          <div className="px-6 py-4 border-b border-outline-variant bg-surface-container/30">
            <div className="flex items-center gap-2">
              <MapPin className="w-4 h-4 text-primary" aria-hidden="true" />
              <h2 className="text-sm font-semibold text-on-surface uppercase tracking-wider">
                {t('sectionAddress')}
              </h2>
            </div>
          </div>

          <div className="p-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="sm:col-span-2">
                <label
                  htmlFor="country"
                  className="block text-xs font-semibold text-on-surface-variant uppercase tracking-wider mb-1.5"
                >
                  {t('country')}
                </label>
                <select
                  id="country"
                  value={form.country ?? 'BR'}
                  onChange={e => {
                    setForm(prev => ({
                      ...prev,
                      country: e.target.value,
                      zipCode: '',
                      street: '',
                      streetNumber: '',
                      complement: '',
                      neighborhood: '',
                      city: '',
                      state: '',
                    }))
                  }}
                  className="w-full px-4 py-2.5 rounded-lg border border-outline-variant bg-surface text-on-surface text-sm focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition"
                >
                  <option value="BR">🇧🇷 Brasil</option>
                  <option value="US">🇺🇸 United States</option>
                  <option value="OTHER">{t('countryOther')}</option>
                </select>
              </div>

              <div className="relative">
                <label
                  htmlFor="zipCode"
                  className="block text-xs font-semibold text-on-surface-variant uppercase tracking-wider mb-1.5"
                >
                  {isBR ? t('cep') : t('zipCode')}
                </label>
                <input
                  id="zipCode"
                  type="text"
                  value={form.zipCode ?? ''}
                  onChange={e => handleFieldChange('zipCode', e.target.value)}
                  onBlur={handleZipBlur}
                  placeholder={isBR ? '00000-000' : '00000'}
                  className="w-full px-4 py-2.5 rounded-lg border border-outline-variant bg-surface text-on-surface text-sm focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition"
                />
                {isFetchingAddress && (
                  <Loader2 className="absolute right-3 top-9 w-4 h-4 animate-spin text-primary" />
                )}
              </div>

              <div className={isUS ? 'sm:col-span-2' : ''}>
                <label
                  htmlFor="street"
                  className="block text-xs font-semibold text-on-surface-variant uppercase tracking-wider mb-1.5"
                >
                  {t('street')}
                  {isUS && (
                    <span className="normal-case font-normal ml-1 text-on-surface-variant/70">
                      ({t('streetHintUS')})
                    </span>
                  )}
                </label>
                <input
                  id="street"
                  type="text"
                  value={form.street ?? ''}
                  onChange={e => handleFieldChange('street', e.target.value)}
                  placeholder={isUS ? '123 Main St' : undefined}
                  className="w-full px-4 py-2.5 rounded-lg border border-outline-variant bg-surface text-on-surface text-sm focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition"
                />
              </div>

              {!isUS && (
                <div>
                  <label
                    htmlFor="streetNumber"
                    className="block text-xs font-semibold text-on-surface-variant uppercase tracking-wider mb-1.5"
                  >
                    {t('streetNumber')}
                  </label>
                  <input
                    id="streetNumber"
                    type="text"
                    value={form.streetNumber ?? ''}
                    onChange={e => handleFieldChange('streetNumber', e.target.value)}
                    className="w-full px-4 py-2.5 rounded-lg border border-outline-variant bg-surface text-on-surface text-sm focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition"
                  />
                </div>
              )}

              <div>
                <label
                  htmlFor="complement"
                  className="block text-xs font-semibold text-on-surface-variant uppercase tracking-wider mb-1.5"
                >
                  {t('complement')}
                </label>
                <input
                  id="complement"
                  type="text"
                  value={form.complement ?? ''}
                  onChange={e => handleFieldChange('complement', e.target.value)}
                  placeholder={isUS ? 'Apt, Suite, Unit...' : t('complementPlaceholder')}
                  className="w-full px-4 py-2.5 rounded-lg border border-outline-variant bg-surface text-on-surface text-sm focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition"
                />
              </div>

              {!isUS && (
                <div>
                  <label
                    htmlFor="neighborhood"
                    className="block text-xs font-semibold text-on-surface-variant uppercase tracking-wider mb-1.5"
                  >
                    {t('neighborhood')}
                  </label>
                  <input
                    id="neighborhood"
                    type="text"
                    value={form.neighborhood ?? ''}
                    onChange={e => handleFieldChange('neighborhood', e.target.value)}
                    className="w-full px-4 py-2.5 rounded-lg border border-outline-variant bg-surface text-on-surface text-sm focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition"
                  />
                </div>
              )}

              <div>
                <label
                  htmlFor="city"
                  className="block text-xs font-semibold text-on-surface-variant uppercase tracking-wider mb-1.5"
                >
                  {t('city')}
                </label>
                <input
                  id="city"
                  type="text"
                  value={form.city ?? ''}
                  onChange={e => handleFieldChange('city', e.target.value)}
                  className="w-full px-4 py-2.5 rounded-lg border border-outline-variant bg-surface text-on-surface text-sm focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition"
                />
              </div>

              <div>
                <label
                  htmlFor="state"
                  className="block text-xs font-semibold text-on-surface-variant uppercase tracking-wider mb-1.5"
                >
                  {isBR ? t('stateUF') : t('state')}
                </label>
                {stateOptions.length > 0 ? (
                  <select
                    id="state"
                    value={form.state ?? ''}
                    onChange={e => handleFieldChange('state', e.target.value)}
                    className="w-full px-4 py-2.5 rounded-lg border border-outline-variant bg-surface text-on-surface text-sm focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition"
                  >
                    <option value="">{t('statePlaceholder')}</option>
                    {stateOptions.map(s => (
                      <option key={s} value={s}>
                        {s}
                      </option>
                    ))}
                  </select>
                ) : (
                  <input
                    id="state"
                    type="text"
                    value={form.state ?? ''}
                    onChange={e => handleFieldChange('state', e.target.value)}
                    className="w-full px-4 py-2.5 rounded-lg border border-outline-variant bg-surface text-on-surface text-sm focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition"
                  />
                )}
              </div>
            </div>
          </div>
        </section>

        {/* ─── Seção 3: Redes sociais ─── */}
        <section className="bg-surface border border-outline-variant rounded-2xl overflow-hidden shadow-sm">
          <div className="px-6 py-4 border-b border-outline-variant bg-surface-container/30">
            <div className="flex items-center gap-2">
              <Link2 className="w-4 h-4 text-primary" aria-hidden="true" />
              <h2 className="text-sm font-semibold text-on-surface uppercase tracking-wider">
                {t('sectionSocial')}
              </h2>
              <span className="ml-1 text-xs text-on-surface-variant normal-case font-normal">
                ({t('optional')})
              </span>
            </div>
          </div>

          <div className="p-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label
                htmlFor="linkedinUrl"
                className="block text-xs font-semibold text-on-surface-variant uppercase tracking-wider mb-1.5"
              >
                <span className="flex items-center gap-1">
                  <Link2 className="w-3 h-3" aria-hidden="true" />
                  LinkedIn
                </span>
              </label>
              <input
                id="linkedinUrl"
                type="url"
                value={form.linkedinUrl ?? ''}
                onChange={e => handleFieldChange('linkedinUrl', e.target.value)}
                placeholder="https://linkedin.com/in/seu-perfil"
                className="w-full px-4 py-2.5 rounded-lg border border-outline-variant bg-surface text-on-surface text-sm focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition"
              />
            </div>

            <div>
              <label
                htmlFor="instagramHandle"
                className="block text-xs font-semibold text-on-surface-variant uppercase tracking-wider mb-1.5"
              >
                <span className="flex items-center gap-1">
                  <AtSign className="w-3 h-3" aria-hidden="true" />
                  Instagram
                </span>
              </label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant text-sm select-none">
                  @
                </span>
                <input
                  id="instagramHandle"
                  type="text"
                  value={form.instagramHandle ?? ''}
                  onChange={e => handleFieldChange('instagramHandle', e.target.value)}
                  placeholder="seu.perfil"
                  className="w-full pl-8 pr-4 py-2.5 rounded-lg border border-outline-variant bg-surface text-on-surface text-sm focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition"
                />
              </div>
            </div>
          </div>
        </section>

        {/* ─── Ações ─── */}
        <div className="flex items-center justify-between pt-2 pb-8">
          <button
            type="button"
            onClick={handleLogout}
            className="flex items-center gap-2 px-5 py-2.5 rounded-full border border-outline-variant text-on-surface-variant hover:bg-red-50 hover:text-red-600 hover:border-red-300 transition text-sm font-medium"
            aria-label={t('logoutButton')}
          >
            <LogOut className="w-4 h-4" aria-hidden="true" />
            {t('logoutButton')}
          </button>

          <button
            type="button"
            onClick={handleSave}
            disabled={isSaving}
            className="flex items-center gap-2 px-6 py-2.5 rounded-full bg-primary text-on-primary text-sm font-semibold disabled:opacity-60 hover:opacity-90 transition min-h-[44px]"
            aria-label={t('saveButton')}
          >
            {isSaving ? (
              <Loader2 className="w-4 h-4 animate-spin" aria-hidden="true" />
            ) : (
              <Save className="w-4 h-4" aria-hidden="true" />
            )}
            {isSaving ? t('saving') : t('saveButton')}
          </button>
        </div>
      </div>
    </main>
  )
}

export default ProfilePage
