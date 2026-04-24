# 09 — Design System — Artisanal Sophistication

**Date:** 2026-04-24 | **Updated:** 2026-07-07

---

## Design Philosophy

The "Artisanal Sophistication" theme communicates **premium quality with artisanal warmth**. It is inspired by the warmth and tradition of Brazilian confectionery, adapted for a professional and elegant digital experience targeting Brazilian creators in the US.

**Design principles:**

- Warm terracotta and cream tones that evoke hand-crafted quality
- DM Serif Display for headings — elegance and tradition
- Inter for body text — modern readability
- Generous white space — luxury feel
- Subtle gold accents — achievement and progress
- Mobile-first, accessible (WCAG 2.1 AA)

**Visual reference:** [priscila-bravin-store](../../../priscila-bravin-store/src/app/globals.css)  
**Layout prototypes:** `ybr-plataform/layout/` (desktop and mobile HTML)  
**Design spec:** `ybr-plataform/layout/desktop-layout/artisanal_sophistication/DESIGN.md`

---

## Layout Prototypes Reference

| Screen            | Desktop File                                                   | Key Elements                   |
| ----------------- | -------------------------------------------------------------- | ------------------------------ |
| Login             | `layout/desktop-layout/login_desktop/code.html`                | Auth form                      |
| Student Dashboard | `layout/desktop-layout/dashboard_desktop/code.html`            | Welcome, courses in progress   |
| Lesson Player     | `layout/desktop-layout/player_de_aula_desktop/code.html`       | HLS player, sidebar, notes     |
| Checkout          | `layout/desktop-layout/checkout_desktop/code.html`             | Stripe Elements                |
| My Courses        | `layout/desktop-layout/meus_cursos_desktop/code.html`          | Course cards with progress     |
| Course Overview   | `layout/desktop-layout/vis_o_geral_do_curso_desktop/code.html` | Expandable modules             |
| Sales Page        | `layout/desktop-layout/p_gina_de_vendas_desktop/code.html`     | Full landing page              |
| Mobile (all)      | `layout/mobile-layout/`                                        | Mobile versions of all screens |

---

## Color Tokens

### Full Palette — Artisanal Sophistication

#### Surfaces

| Token                       | Hex       | Use                                     |
| --------------------------- | --------- | --------------------------------------- |
| `surface`                   | `#fff8f6` | Main application background             |
| `surface-dim`               | `#e9d6cf` | Secondary section backgrounds, dividers |
| `surface-bright`            | `#fff8f6` | Lightest surface (same as surface)      |
| `surface-container-lowest`  | `#ffffff` | Modal and overlay backgrounds           |
| `surface-container-low`     | `#fff1eb` | Alternating section backgrounds         |
| `surface-container`         | `#fdeae2` | Card and container backgrounds          |
| `surface-container-high`    | `#f7e4dc` | Input and field backgrounds             |
| `surface-container-highest` | `#f1dfd7` | Subtle separation border                |
| `background`                | `#fff8f6` | Global page background                  |

#### Text on Surfaces

| Token                | Hex       | Use                                   |
| -------------------- | --------- | ------------------------------------- |
| `on-surface`         | `#231915` | Primary text (warm deep brown)        |
| `on-surface-variant` | `#56433a` | Secondary text, placeholders          |
| `inverse-surface`    | `#392e29` | Tooltip and dark snackbar backgrounds |
| `inverse-on-surface` | `#ffede6` | Text on inverse-surface               |
| `outline`            | `#897268` | Input borders and dividers            |
| `outline-variant`    | `#dcc1b5` | Subtle card borders                   |

#### Primary — Terracotta

| Token                      | Hex       | Use                                          |
| -------------------------- | --------- | -------------------------------------------- |
| `primary`                  | `#984207` | Primary action color — buttons, links, focus |
| `on-primary`               | `#ffffff` | Text on primary elements                     |
| `primary-container`        | `#b85a21` | Lighter variant — button hover state         |
| `on-primary-container`     | `#fffbff` | Text on primary-container                    |
| `inverse-primary`          | `#ffb691` | Accent in dark themes                        |
| `primary-fixed`            | `#ffdbcb` | Category chips and badges                    |
| `primary-fixed-dim`        | `#ffb691` | Darker chip variant                          |
| `on-primary-fixed`         | `#341100` | Text on primary-fixed                        |
| `on-primary-fixed-variant` | `#793100` | Secondary text on primary-fixed              |
| `surface-tint`             | `#9b450a` | Tint applied to elevated surfaces            |

#### Secondary — Gold/Amber

| Token                        | Hex       | Use                                                    |
| ---------------------------- | --------- | ------------------------------------------------------ |
| `secondary`                  | `#755b00` | Secondary highlight — completion badges, progress bars |
| `on-secondary`               | `#ffffff` | Text on secondary elements                             |
| `secondary-container`        | `#fed977` | Gold badge backgrounds, highlights                     |
| `on-secondary-container`     | `#785d00` | Text on secondary-container                            |
| `secondary-fixed`            | `#ffe08f` | Fixed chip variant                                     |
| `secondary-fixed-dim`        | `#e6c364` | Darker gold chip variant                               |
| `on-secondary-fixed`         | `#241a00` | Text on secondary-fixed                                |
| `on-secondary-fixed-variant` | `#584400` | Secondary text on secondary-fixed                      |

#### Tertiary — Ocean Blue

| Token                       | Hex       | Use                                |
| --------------------------- | --------- | ---------------------------------- |
| `tertiary`                  | `#006480` | Support links, informational icons |
| `on-tertiary`               | `#ffffff` | Text on tertiary elements          |
| `tertiary-container`        | `#007ea1` | Informational alert backgrounds    |
| `on-tertiary-container`     | `#fbfdff` | Text on tertiary-container         |
| `tertiary-fixed`            | `#bce9ff` | Informational chip backgrounds     |
| `tertiary-fixed-dim`        | `#70d2fa` | Informational chip variant         |
| `on-tertiary-fixed`         | `#001f2a` | Text on tertiary-fixed             |
| `on-tertiary-fixed-variant` | `#004d63` | Secondary text on tertiary-fixed   |

#### Error State

| Token                | Hex       | Use                                   |
| -------------------- | --------- | ------------------------------------- |
| `error`              | `#ba1a1a` | Error messages, invalid input borders |
| `on-error`           | `#ffffff` | Text on error elements                |
| `error-container`    | `#ffdad6` | Error alert backgrounds               |
| `on-error-container` | `#93000a` | Text on error-container               |

---

## TailwindCSS 4.x Configuration

### globals.css — Full Token Set

```css
/* apps/web/src/app/globals.css */
@import "tailwindcss";

@theme {
  /* ═══════════════════════════════════════════
     Fonts
     ═══════════════════════════════════════════ */
  --font-serif: var(--font-dm-serif-display);
  --font-sans: var(--font-inter);

  /* ═══════════════════════════════════════════
     Artisanal Sophistication Palette
     ═══════════════════════════════════════════ */

  /* Surfaces */
  --color-surface: #fff8f6;
  --color-surface-dim: #e9d6cf;
  --color-surface-bright: #fff8f6;
  --color-surface-container-lowest: #ffffff;
  --color-surface-container-low: #fff1eb;
  --color-surface-container: #fdeae2;
  --color-surface-container-high: #f7e4dc;
  --color-surface-container-highest: #f1dfd7;
  --color-background: #fff8f6;
  --color-on-surface: #231915;
  --color-on-surface-variant: #56433a;
  --color-inverse-surface: #392e29;
  --color-inverse-on-surface: #ffede6;
  --color-outline: #897268;
  --color-outline-variant: #dcc1b5;

  /* Primary — Terracotta */
  --color-primary: #984207;
  --color-on-primary: #ffffff;
  --color-primary-container: #b85a21;
  --color-on-primary-container: #fffbff;
  --color-inverse-primary: #ffb691;
  --color-primary-fixed: #ffdbcb;
  --color-primary-fixed-dim: #ffb691;
  --color-on-primary-fixed: #341100;
  --color-on-primary-fixed-variant: #793100;
  --color-surface-tint: #9b450a;

  /* Secondary — Gold */
  --color-secondary: #755b00;
  --color-on-secondary: #ffffff;
  --color-secondary-container: #fed977;
  --color-on-secondary-container: #785d00;
  --color-secondary-fixed: #ffe08f;
  --color-secondary-fixed-dim: #e6c364;
  --color-on-secondary-fixed: #241a00;
  --color-on-secondary-fixed-variant: #584400;

  /* Tertiary — Ocean Blue */
  --color-tertiary: #006480;
  --color-on-tertiary: #ffffff;
  --color-tertiary-container: #007ea1;
  --color-on-tertiary-container: #fbfdff;
  --color-tertiary-fixed: #bce9ff;
  --color-tertiary-fixed-dim: #70d2fa;
  --color-on-tertiary-fixed: #001f2a;
  --color-on-tertiary-fixed-variant: #004d63;

  /* Error */
  --color-error: #ba1a1a;
  --color-on-error: #ffffff;
  --color-error-container: #ffdad6;
  --color-on-error-container: #93000a;

  /* Semantic aliases for frequent use */
  --color-terracotta: #984207;
  --color-terracotta-hover: #b85a21;
  --color-gold: #755b00;
  --color-gold-container: #fed977;
  --color-warm-cream: #fff8f6;
  --color-deep-brown: #231915;
  --color-card-border: #e8e0d9;

  /* ═══════════════════════════════════════════
     Typography Scale
     ═══════════════════════════════════════════ */
  --text-display-lg: 3rem; /* 48px */
  --text-display-md: 2.25rem; /* 36px */
  --text-title-lg: 1.75rem; /* 28px */
  --text-title-md: 1.25rem; /* 20px */
  --text-body-lg: 1.125rem; /* 18px */
  --text-body-md: 1rem; /* 16px */
  --text-label-md: 0.875rem; /* 14px */
  --text-label-sm: 0.75rem; /* 12px */

  /* ═══════════════════════════════════════════
     Border Radius
     ═══════════════════════════════════════════ */
  --radius-sm: 0.25rem; /* 4px  — small badges */
  --radius: 0.5rem; /* 8px  — default */
  --radius-md: 0.75rem; /* 12px — secondary inputs */
  --radius-lg: 1rem; /* 16px — cards, primary inputs */
  --radius-xl: 1.5rem; /* 24px — large cards, modals */
  --radius-full: 9999px; /* pill — buttons, rounded tags */

  /* ═══════════════════════════════════════════
     Shadows — Artisanal (terracotta-tinted)
     ═══════════════════════════════════════════ */
  --shadow-card: 0px 4px 20px rgba(196, 99, 42, 0.08);
  --shadow-card-hover: 0px 8px 32px rgba(196, 99, 42, 0.14);
  --shadow-modal: 0px 16px 48px rgba(35, 25, 21, 0.18);
  --shadow-button: 0px 2px 8px rgba(152, 66, 7, 0.25);

  /* ═══════════════════════════════════════════
     Spacing
     ═══════════════════════════════════════════ */
  --spacing-unit: 0.5rem; /* 8px — base unit */
  --container-max: 80rem; /* 1280px */
  --gutter: 1.5rem; /* 24px */
  --margin-mobile: 1rem; /* 16px */
  --section-gap: 5rem; /* 80px */

  /* ═══════════════════════════════════════════
     Animations
     ═══════════════════════════════════════════ */
  --animate-accordion-down: accordion-down 0.2s ease-out;
  --animate-accordion-up: accordion-up 0.2s ease-out;
  --transition-standard: 150ms ease-in-out;
}

/* Accordion animations (Radix) */
@keyframes accordion-down {
  from {
    height: 0;
  }
  to {
    height: var(--radix-accordion-content-height);
  }
}

@keyframes accordion-up {
  from {
    height: var(--radix-accordion-content-height);
  }
  to {
    height: 0;
  }
}

/* ═══════════════════════════════════════════
   Global base styles
   ═══════════════════════════════════════════ */
@layer base {
  * {
    border-color: var(--color-outline-variant);
  }

  body {
    background-color: var(--color-background);
    color: var(--color-on-surface);
    font-family: var(--font-sans);
  }

  h1,
  h2,
  h3 {
    font-family: var(--font-serif);
    color: var(--color-on-surface);
  }

  h4,
  h5,
  h6 {
    font-family: var(--font-sans);
    font-weight: 600;
    color: var(--color-on-surface);
  }
}
```

---

## Typography

### Typography Scale

| Level        | Family           | Size | Weight | Line-height | Letter-spacing | Use                                    |
| ------------ | ---------------- | ---- | ------ | ----------- | -------------- | -------------------------------------- |
| `display-lg` | DM Serif Display | 48px | 400    | 1.1         | -0.02em        | Landing page hero titles               |
| `display-md` | DM Serif Display | 36px | 400    | 1.2         | —              | Primary section headings               |
| `title-lg`   | DM Serif Display | 28px | 400    | 1.3         | —              | Internal page titles                   |
| `title-md`   | Inter            | 20px | 600    | 1.4         | —              | Card and modal titles                  |
| `body-lg`    | Inter            | 18px | 400    | 1.6         | —              | Primary body text                      |
| `body-md`    | Inter            | 16px | 400    | 1.6         | —              | Secondary body, paragraphs             |
| `label-md`   | Inter            | 14px | 600    | 1.2         | +0.05em        | Labels, form labels, secondary buttons |
| `label-sm`   | Inter            | 12px | 500    | 1.2         | +0.03em        | Badges, captions, metadata             |
| `button`     | Inter            | 16px | 600    | 1           | —              | Primary button text                    |

### Font Loading (Next.js — `[locale]/layout.tsx`)

```typescript
// apps/web/src/app/[locale]/layout.tsx
import { DM_Serif_Display, Inter } from 'next/font/google'
import { NextIntlClientProvider } from 'next-intl'
import { getMessages } from 'next-intl/server'

const dmSerifDisplay = DM_Serif_Display({
  weight: ['400'],
  subsets: ['latin'],
  variable: '--font-dm-serif-display',
  display: 'swap',
})

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
})

const LocaleLayout = async ({
  children,
  params,
}: {
  children: React.ReactNode
  params: Promise<{ locale: string }>
}) => {
  const { locale } = await params
  const messages = await getMessages()

  return (
    <html lang={locale} className={`${dmSerifDisplay.variable} ${inter.variable}`}>
      <body className="bg-background text-on-surface font-sans antialiased">
        <NextIntlClientProvider messages={messages}>
          {children}
        </NextIntlClientProvider>
      </body>
    </html>
  )
}

export default LocaleLayout
```

> **Note:** Fonts are loaded in `[locale]/layout.tsx`, not the root layout, so the `lang` attribute is properly set per locale.

---

## Components

### Buttons

```typescript
const buttonVariants = cva(
  // Base: pill-shaped, min 48px height, Inter semibold
  "inline-flex items-center justify-center gap-2 rounded-full min-h-[48px] px-6 font-sans text-base font-semibold transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        // Primary: filled Terracotta
        primary:
          "bg-[#984207] text-white hover:bg-[#b85a21] focus-visible:ring-[#984207] shadow-[0px_2px_8px_rgba(152,66,7,0.25)]",
        // Secondary: Terracotta outline
        secondary:
          "border-2 border-[#984207] text-[#984207] bg-transparent hover:bg-[#fff1eb] focus-visible:ring-[#984207]",
        // Ghost: transparent
        ghost: "text-[#56433a] hover:bg-[#fdeae2] focus-visible:ring-[#897268]",
        // Gold: special highlight CTAs
        gold: "bg-[#fed977] text-[#241a00] hover:bg-[#e6c364] focus-visible:ring-[#755b00]",
        // Destructive
        destructive:
          "bg-[#ba1a1a] text-white hover:bg-[#93000a] focus-visible:ring-[#ba1a1a]",
      },
      size: {
        sm: "min-h-[36px] px-4 text-sm",
        md: "min-h-[48px] px-6 text-base",
        lg: "min-h-[56px] px-8 text-lg",
        icon: "min-h-[48px] w-12 px-0",
      },
    },
    defaultVariants: { variant: "primary", size: "md" },
  },
);
```

### Cards

```typescript
// Standard card structure
<div className="
  bg-white border border-[#e8e0d9] rounded-xl
  shadow-[0px_4px_20px_rgba(196,99,42,0.08)]
  hover:shadow-[0px_8px_32px_rgba(196,99,42,0.14)]
  transition-shadow duration-200 overflow-hidden
">
  <div className="aspect-video w-full bg-[#fdeae2] overflow-hidden">
    <img src={thumbnail} alt={title} className="w-full h-full object-cover" />
  </div>
  <div className="p-5 flex flex-col gap-3">
    <span className="text-xs font-semibold tracking-[0.05em] text-[#755b00] uppercase">
      {category}
    </span>
    <h3 className="font-serif text-[20px] leading-[1.3] text-[#231915]">{title}</h3>
    <p className="text-sm leading-[1.6] text-[#56433a]">{description}</p>
    {/* Progress bar */}
    <div className="h-1.5 w-full bg-[#f1dfd7] rounded-full overflow-hidden">
      <div className="h-full bg-[#fed977] rounded-full transition-all duration-500"
        style={{ width: `${progress}%` }} />
    </div>
    <span className="text-xs text-[#56433a]">{progress}% complete</span>
  </div>
</div>
```

### Form Inputs

```typescript
<div className="flex flex-col gap-1.5">
  <label htmlFor="email" className="text-sm font-semibold text-[#231915]">
    Email
  </label>
  <input
    id="email"
    type="email"
    placeholder="your@email.com"
    className="
      w-full rounded-lg border border-[#897268] bg-[#fff8f6]
      px-4 py-3 text-base text-[#231915] placeholder:text-[#897268]
      transition-all duration-150
      focus:outline-none focus:border-2 focus:border-[#984207] focus:ring-2 focus:ring-[#984207]/20
      hover:border-[#56433a]
      invalid:border-[#ba1a1a]
    "
  />
  {error && (
    <p className="text-xs text-[#ba1a1a] flex items-center gap-1">
      <AlertCircle size={12} />
      {error}
    </p>
  )}
</div>
```

### Progress Bars

```typescript
// Elegant gold progress bar
const ProgressBar = ({ value, label, size = 'md' }: {
  value: number  // 0-100
  label?: string
  size?: 'sm' | 'md'
}) => {
  const heights = { sm: 'h-1', md: 'h-1.5' }

  return (
    <div className="flex flex-col gap-1">
      {label && (
        <div className="flex justify-between items-center">
          <span className="text-xs font-medium text-[#56433a]">{label}</span>
          <span className="text-xs font-semibold text-[#755b00]">{value}%</span>
        </div>
      )}
      <div className={`w-full ${heights[size]} bg-[#f1dfd7] rounded-full overflow-hidden`}>
        <div
          role="progressbar"
          aria-valuenow={value}
          aria-valuemin={0}
          aria-valuemax={100}
          className={`${heights[size]} bg-[#fed977] rounded-full transition-all duration-500 ease-out`}
          style={{ width: `${Math.min(100, Math.max(0, value))}%` }}
        />
      </div>
    </div>
  )
}
```

---

## Spacing & Layout

### Spacing System (8px base unit)

| Variable        | Value | rem     | Typical Use                  |
| --------------- | ----- | ------- | ---------------------------- |
| `stack-xs`      | 4px   | 0.25rem | Space between icon and text  |
| `stack-sm`      | 8px   | 0.5rem  | Minimum internal spacing     |
| `stack-md`      | 16px  | 1rem    | Space between form elements  |
| `stack-lg`      | 32px  | 2rem    | Space between element groups |
| `stack-xl`      | 48px  | 3rem    | Space between minor sections |
| `section-gap`   | 80px  | 5rem    | Space between page sections  |
| `gutter`        | 24px  | 1.5rem  | Grid gutter                  |
| `margin-mobile` | 16px  | 1rem    | Mobile side margins          |

### Container & Grid

```typescript
// Standard container — centered, max 1280px
<div className="mx-auto w-full max-w-[1280px] px-6 md:px-8">
  {children}
</div>

// 12-column grid
<div className="grid grid-cols-12 gap-6">
  <div className="col-span-12 md:col-span-8">{/* Main content */}</div>
  <div className="col-span-12 md:col-span-4">{/* Sidebar */}</div>
</div>
```

---

## Accessibility (WCAG 2.1 AA)

### Color Contrast

| Color pair             | Ratio  | Level | Use                             |
| ---------------------- | ------ | ----- | ------------------------------- |
| `#231915` on `#fff8f6` | 16.8:1 | AAA   | Primary text on background      |
| `#984207` on `#fff8f6` | 5.2:1  | AA    | Links and actions on background |
| `#ffffff` on `#984207` | 5.2:1  | AA    | Text on primary button          |
| `#56433a` on `#fff8f6` | 7.6:1  | AAA   | Secondary text on background    |
| `#793100` on `#ffdbcb` | 5.0:1  | AA    | Text on primary-fixed badge     |
| `#241a00` on `#ffe08f` | 13.5:1 | AAA   | Text on gold badge              |
| `#ba1a1a` on `#fff8f6` | 5.9:1  | AA    | Error message on background     |

### Required Patterns

```typescript
// 1. Visible focus on all interactive elements
className="focus-visible:ring-2 focus-visible:ring-[#984207] focus-visible:ring-offset-2"

// 2. Minimum touch target size: 48×48px (WCAG 2.5.5)
// All buttons: min-h-[48px]

// 3. Labels on all inputs
<label htmlFor="email">Email</label>
<input id="email" aria-describedby="email-error" />
{error && <p id="email-error" role="alert">{error}</p>}

// 4. Alt text on content images
<img src={thumbnail} alt={`Course thumbnail: ${courseTitle}`} />

// 5. Semantic landmarks
<header role="banner">...</header>
<nav aria-label="Main navigation">...</nav>
<main>...</main>
<aside aria-label="Course modules">...</aside>
<footer role="contentinfo">...</footer>
```

---

## Quick Token Reference

```typescript
// Most-used tokens — copy to a constants file
export const DESIGN_TOKENS = {
  colors: {
    background: "#fff8f6",
    surface: "#fff8f6",
    surfaceContainer: "#fdeae2",
    cardBorder: "#e8e0d9",
    textPrimary: "#231915",
    textSecondary: "#56433a",
    textDisabled: "#897268",
    primary: "#984207",
    primaryHover: "#b85a21",
    primaryText: "#ffffff",
    gold: "#fed977",
    goldText: "#241a00",
    error: "#ba1a1a",
    errorBg: "#ffdad6",
  },
  shadows: {
    card: "0px 4px 20px rgba(196, 99, 42, 0.08)",
    cardHover: "0px 8px 32px rgba(196, 99, 42, 0.14)",
    modal: "0px 16px 48px rgba(35, 25, 21, 0.18)",
  },
} as const;
```

---

## References

- Design spec: `ybr-plataform/layout/desktop-layout/artisanal_sophistication/DESIGN.md`
- Layout prototypes: `ybr-plataform/layout/`
- Reference globals.css: `priscila-bravin-store/src/app/globals.css`
- Material Design 3 (system base): https://m3.material.io/
- WCAG 2.1 AA Checklist: https://www.w3.org/WAI/WCAG21/quickref/
- DM Serif Display: https://fonts.google.com/specimen/DM+Serif+Display
- Inter: https://fonts.google.com/specimen/Inter
- Shadcn/UI Docs: https://ui.shadcn.com
- TailwindCSS v4 Docs: https://tailwindcss.com/docs
