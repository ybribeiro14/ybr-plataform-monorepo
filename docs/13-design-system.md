# 13 — Design System: Artisanal Sophistication

**Data:** 2026-04-24

---

## Visão Geral

O design system **"Artisanal Sophistication"** é a identidade visual da YBR Platform. Fundamentado no conceito de **Alta Confeitaria Artesanal**, o sistema equilibra sofisticação editorial com calor humano — evocando a sensação de um ateliê de luxo onde precisão técnica encontra sensibilidade artística.

**Princípios:**

- **Calor sobre frieza** — Warm Cream no lugar de branco clínico
- **Tipografia editorial** — DM Serif Display confere autoridade e tradição
- **Minimalismo tátil** — formas arredondadas, sombras suaves, espaço generoso
- **Acessibilidade nativa** — contraste WCAG AA garantido nos pares de cores definidos

---

## Referências de Layout

Os protótipos HTML de referência são a fonte primária de verdade para implementação:

| Tela                 | Arquivo                                                        | Observações                          |
| -------------------- | -------------------------------------------------------------- | ------------------------------------ |
| Login                | `layout/desktop-layout/login_desktop/code.html`                | Formulário centralizado, fundo creme |
| Dashboard do Aluno   | `layout/desktop-layout/dashboard_desktop/code.html`            | Grid de cursos, progresso            |
| Player de Aula       | `layout/desktop-layout/player_de_aula_desktop/code.html`       | Player + sidebar de módulos          |
| Checkout             | `layout/desktop-layout/checkout_desktop/code.html`             | Stripe Elements embutido             |
| Meus Cursos          | `layout/desktop-layout/meus_cursos_desktop/code.html`          | Cards de curso com progresso         |
| Visão Geral do Curso | `layout/desktop-layout/vis_o_geral_do_curso_desktop/code.html` | Módulos expandíveis                  |
| Página de Vendas     | `layout/desktop-layout/p_gina_de_vendas_desktop/code.html`     | Landing page completa                |
| Mobile (todas)       | `layout/mobile-layout/`                                        | Versões mobile de todas as telas     |

---

## Tokens de Cor

### Paleta Completa — Artisanal Sophistication

#### Superfícies (Surfaces)

| Token                       | Hex       | Uso                                         |
| --------------------------- | --------- | ------------------------------------------- |
| `surface`                   | `#fff8f6` | Fundo principal da aplicação                |
| `surface-dim`               | `#e9d6cf` | Fundo de seções secundárias, divisores      |
| `surface-bright`            | `#fff8f6` | Superfície mais clara (idêntico ao surface) |
| `surface-container-lowest`  | `#ffffff` | Fundo de modais e overlays                  |
| `surface-container-low`     | `#fff1eb` | Fundo de seções alternadas                  |
| `surface-container`         | `#fdeae2` | Fundo de cards e containers                 |
| `surface-container-high`    | `#f7e4dc` | Fundo de inputs e campos                    |
| `surface-container-highest` | `#f1dfd7` | Borda de separação sutil                    |
| `background`                | `#fff8f6` | Fundo global da página                      |

#### Texto sobre Superfícies

| Token                | Hex       | Uso                                 |
| -------------------- | --------- | ----------------------------------- |
| `on-surface`         | `#231915` | Texto principal (deep brown quente) |
| `on-surface-variant` | `#56433a` | Texto secundário, placeholder       |
| `inverse-surface`    | `#392e29` | Fundo de tooltips e snackbars dark  |
| `inverse-on-surface` | `#ffede6` | Texto sobre inverse-surface         |
| `outline`            | `#897268` | Bordas de inputs e divisores        |
| `outline-variant`    | `#dcc1b5` | Bordas sutis de cards               |

#### Primária — Terracotta

| Token                      | Hex       | Uso                                         |
| -------------------------- | --------- | ------------------------------------------- |
| `primary`                  | `#984207` | Cor de ação principal — botões, links, foco |
| `on-primary`               | `#ffffff` | Texto sobre elementos primary               |
| `primary-container`        | `#b85a21` | Variante mais clara — hover de botões       |
| `on-primary-container`     | `#fffbff` | Texto sobre primary-container               |
| `inverse-primary`          | `#ffb691` | Accent em temas escuros                     |
| `primary-fixed`            | `#ffdbcb` | Chips e badges de categoria                 |
| `primary-fixed-dim`        | `#ffb691` | Variante mais escura de chips               |
| `on-primary-fixed`         | `#341100` | Texto sobre primary-fixed                   |
| `on-primary-fixed-variant` | `#793100` | Texto secundário sobre primary-fixed        |
| `surface-tint`             | `#9b450a` | Tint aplicado a superfícies elevadas        |

#### Secundária — Gold/Amber

| Token                        | Hex       | Uso                                                             |
| ---------------------------- | --------- | --------------------------------------------------------------- |
| `secondary`                  | `#755b00` | Cor de destaque secundário — badges de conclusão, progress bars |
| `on-secondary`               | `#ffffff` | Texto sobre elementos secondary                                 |
| `secondary-container`        | `#fed977` | Fundo de badges dourados, highlights                            |
| `on-secondary-container`     | `#785d00` | Texto sobre secondary-container                                 |
| `secondary-fixed`            | `#ffe08f` | Variante fixa de chips                                          |
| `secondary-fixed-dim`        | `#e6c364` | Variante mais escura de chips gold                              |
| `on-secondary-fixed`         | `#241a00` | Texto sobre secondary-fixed                                     |
| `on-secondary-fixed-variant` | `#584400` | Texto secundário sobre secondary-fixed                          |

#### Terciária — Ocean Blue

| Token                       | Hex       | Uso                                   |
| --------------------------- | --------- | ------------------------------------- |
| `tertiary`                  | `#006480` | Links de suporte, ícones informativos |
| `on-tertiary`               | `#ffffff` | Texto sobre elementos tertiary        |
| `tertiary-container`        | `#007ea1` | Fundo de alertas informativos         |
| `on-tertiary-container`     | `#fbfdff` | Texto sobre tertiary-container        |
| `tertiary-fixed`            | `#bce9ff` | Background de chips informativos      |
| `tertiary-fixed-dim`        | `#70d2fa` | Variante de chips informativos        |
| `on-tertiary-fixed`         | `#001f2a` | Texto sobre tertiary-fixed            |
| `on-tertiary-fixed-variant` | `#004d63` | Texto secundário sobre tertiary-fixed |

#### Estado de Erro

| Token                | Hex       | Uso                                           |
| -------------------- | --------- | --------------------------------------------- |
| `error`              | `#ba1a1a` | Mensagens de erro, bordas de inputs inválidos |
| `on-error`           | `#ffffff` | Texto sobre elementos error                   |
| `error-container`    | `#ffdad6` | Fundo de alertas de erro                      |
| `on-error-container` | `#93000a` | Texto sobre error-container                   |

---

## Configuração no TailwindCSS 4.x

### globals.css — Tokens Completos

```css
/* apps/web/src/app/globals.css */
@import "tailwindcss";

@theme {
  /* ═══════════════════════════════════════════
     Fontes
     ═══════════════════════════════════════════ */
  --font-serif: var(--font-dm-serif-display);
  --font-sans: var(--font-inter);

  /* ═══════════════════════════════════════════
     Paleta Artisanal Sophistication
     ═══════════════════════════════════════════ */

  /* Superfícies */
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

  /* Primária — Terracotta */
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

  /* Secundária — Gold */
  --color-secondary: #755b00;
  --color-on-secondary: #ffffff;
  --color-secondary-container: #fed977;
  --color-on-secondary-container: #785d00;
  --color-secondary-fixed: #ffe08f;
  --color-secondary-fixed-dim: #e6c364;
  --color-on-secondary-fixed: #241a00;
  --color-on-secondary-fixed-variant: #584400;

  /* Terciária — Ocean Blue */
  --color-tertiary: #006480;
  --color-on-tertiary: #ffffff;
  --color-tertiary-container: #007ea1;
  --color-on-tertiary-container: #fbfdff;
  --color-tertiary-fixed: #bce9ff;
  --color-tertiary-fixed-dim: #70d2fa;
  --color-on-tertiary-fixed: #001f2a;
  --color-on-tertiary-fixed-variant: #004d63;

  /* Erro */
  --color-error: #ba1a1a;
  --color-on-error: #ffffff;
  --color-error-container: #ffdad6;
  --color-on-error-container: #93000a;

  /* Aliases semânticos para uso frequente */
  --color-terracotta: #984207;
  --color-terracotta-hover: #b85a21;
  --color-gold: #755b00;
  --color-gold-container: #fed977;
  --color-warm-cream: #fff8f6;
  --color-deep-brown: #231915;
  --color-card-border: #e8e0d9;

  /* ═══════════════════════════════════════════
     Tipografia
     ═══════════════════════════════════════════ */

  /* Tamanhos da escala tipográfica */
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
  --radius-sm: 0.25rem; /* 4px  — badges pequenos */
  --radius: 0.5rem; /* 8px  — padrão */
  --radius-md: 0.75rem; /* 12px — inputs secundários */
  --radius-lg: 1rem; /* 16px — cards, inputs principais */
  --radius-xl: 1.5rem; /* 24px — cards grandes, modais */
  --radius-full: 9999px; /* pill — botões, tags arredondadas */

  /* ═══════════════════════════════════════════
     Sombras — Artisanal (tingidas de terracotta)
     ═══════════════════════════════════════════ */
  --shadow-card: 0px 4px 20px rgba(196, 99, 42, 0.08);
  --shadow-card-hover: 0px 8px 32px rgba(196, 99, 42, 0.14);
  --shadow-modal: 0px 16px 48px rgba(35, 25, 21, 0.18);
  --shadow-button: 0px 2px 8px rgba(152, 66, 7, 0.25);

  /* ═══════════════════════════════════════════
     Espaçamento
     ═══════════════════════════════════════════ */
  --spacing-unit: 0.5rem; /* 8px — unidade base */
  --container-max: 80rem; /* 1280px */
  --gutter: 1.5rem; /* 24px */
  --margin-mobile: 1rem; /* 16px */
  --section-gap: 5rem; /* 80px */

  /* ═══════════════════════════════════════════
     Animações
     ═══════════════════════════════════════════ */
  --animate-accordion-down: accordion-down 0.2s ease-out;
  --animate-accordion-up: accordion-up 0.2s ease-out;
  --transition-standard: 150ms ease-in-out;
}

/* Animações do Accordion (Radix) */
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
   Estilos base globais
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

  /* Tipografia padrão para headings */
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

## Tipografia

### Escala Tipográfica

| Nível        | Família          | Tamanho | Peso | Line-height | Letter-spacing | Uso                                              |
| ------------ | ---------------- | ------- | ---- | ----------- | -------------- | ------------------------------------------------ |
| `display-lg` | DM Serif Display | 48px    | 400  | 1.1         | -0.02em        | Título hero de landing pages                     |
| `display-md` | DM Serif Display | 36px    | 400  | 1.2         | —              | Títulos de seção principais                      |
| `title-lg`   | DM Serif Display | 28px    | 400  | 1.3         | —              | Títulos de páginas internas                      |
| `title-md`   | Inter            | 20px    | 600  | 1.4         | —              | Títulos de cards e modais                        |
| `body-lg`    | Inter            | 18px    | 400  | 1.6         | —              | Corpo de texto principal                         |
| `body-md`    | Inter            | 16px    | 400  | 1.6         | —              | Corpo secundário, parágrafos                     |
| `label-md`   | Inter            | 14px    | 600  | 1.2         | +0.05em        | Labels, labels de formulário, botões secundários |
| `label-sm`   | Inter            | 12px    | 500  | 1.2         | +0.03em        | Badges, captions, metadados                      |
| `button`     | Inter            | 16px    | 600  | 1           | —              | Texto de botões principais                       |

### Carregamento de Fontes (Next.js)

```typescript
// apps/web/src/app/layout.tsx
import { DM_Serif_Display, Inter } from 'next/font/google'

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

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="pt-BR"
      className={`${dmSerifDisplay.variable} ${inter.variable}`}
    >
      <body>{children}</body>
    </html>
  )
}
```

### Classes Tailwind para Tipografia

```typescript
// Uso nos componentes
<h1 className="font-serif text-[48px] leading-[1.1] tracking-[-0.02em] text-on-surface">
  Bem-vindo à YBR Platform
</h1>

<h2 className="font-serif text-[36px] leading-[1.2] text-on-surface">
  Seus cursos
</h2>

<p className="font-sans text-[18px] leading-[1.6] text-on-surface">
  Aprenda confeitaria artesanal com especialistas.
</p>

<span className="font-sans text-[14px] font-semibold tracking-[0.05em] text-on-surface-variant">
  MÓDULO 1
</span>
```

---

## Espaçamento e Layout

### Sistema de Espaçamento (base 8px)

| Variável        | Valor | Equivalente rem | Uso típico                           |
| --------------- | ----- | --------------- | ------------------------------------ |
| `stack-xs`      | 4px   | 0.25rem         | Espaço entre ícone e texto           |
| `stack-sm`      | 8px   | 0.5rem          | Espaço interno mínimo                |
| `stack-md`      | 16px  | 1rem            | Espaço entre elementos de formulário |
| `stack-lg`      | 32px  | 2rem            | Espaço entre grupos de elementos     |
| `stack-xl`      | 48px  | 3rem            | Espaço entre seções menores          |
| `section-gap`   | 80px  | 5rem            | Espaço entre seções de página        |
| `gutter`        | 24px  | 1.5rem          | Calha do grid                        |
| `margin-mobile` | 16px  | 1rem            | Margem lateral no mobile             |

### Container e Grid

```typescript
// Container padrão — centralizado, max 1280px
<div className="mx-auto w-full max-w-[1280px] px-6 md:px-8">
  {children}
</div>

// Grid de 12 colunas
<div className="grid grid-cols-12 gap-6">
  <div className="col-span-12 md:col-span-8">
    {/* Conteúdo principal */}
  </div>
  <div className="col-span-12 md:col-span-4">
    {/* Sidebar */}
  </div>
</div>
```

---

## Componentes Principais

### Botões

```typescript
// apps/web/src/components/ui/button.tsx
// Baseado em Shadcn/UI com tema Artisanal

const buttonVariants = cva(
  // Base: pill-shaped, altura mínima 48px, font Inter semibold
  "inline-flex items-center justify-center gap-2 rounded-full min-h-[48px] px-6 font-sans text-base font-semibold transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        // Primário: Terracotta preenchido
        primary:
          "bg-[#984207] text-white hover:bg-[#b85a21] focus-visible:ring-[#984207] shadow-[0px_2px_8px_rgba(152,66,7,0.25)]",
        // Secundário: Contorno Terracotta
        secondary:
          "border-2 border-[#984207] text-[#984207] bg-transparent hover:bg-[#fff1eb] focus-visible:ring-[#984207]",
        // Ghost: Sem borda, fundo transparente
        ghost: "text-[#56433a] hover:bg-[#fdeae2] focus-visible:ring-[#897268]",
        // Gold: Para CTAs de destaque especial
        gold: "bg-[#fed977] text-[#241a00] hover:bg-[#e6c364] focus-visible:ring-[#755b00]",
        // Destrutivo
        destructive:
          "bg-[#ba1a1a] text-white hover:bg-[#93000a] focus-visible:ring-[#ba1a1a]",
      },
      size: {
        sm: "min-h-[36px] px-4 text-sm",
        md: "min-h-[48px] px-6 text-base", // padrão
        lg: "min-h-[56px] px-8 text-lg",
        icon: "min-h-[48px] w-12 px-0",
      },
    },
    defaultVariants: {
      variant: "primary",
      size: "md",
    },
  },
);
```

**Uso:**

```typescript
// Primário — CTA principal
<Button variant="primary" size="lg">
  Comprar agora
</Button>

// Secundário — ação alternativa
<Button variant="secondary">
  Ver detalhes do curso
</Button>

// Gold — destaque especial (promoção, conclusão)
<Button variant="gold" size="lg">
  Resgatar certificado
</Button>
```

---

### Cards

```typescript
// Estrutura de card padrão
<div className="
  bg-white
  border border-[#e8e0d9]
  rounded-xl
  shadow-[0px_4px_20px_rgba(196,99,42,0.08)]
  hover:shadow-[0px_8px_32px_rgba(196,99,42,0.14)]
  transition-shadow duration-200
  overflow-hidden
">
  {/* Thumbnail do curso */}
  <div className="aspect-video w-full bg-[#fdeae2] overflow-hidden">
    <img src={thumbnail} alt={title} className="w-full h-full object-cover" />
  </div>

  {/* Conteúdo */}
  <div className="p-5 flex flex-col gap-3">
    <span className="text-xs font-semibold tracking-[0.05em] text-[#755b00] uppercase">
      {category}
    </span>
    <h3 className="font-serif text-[20px] leading-[1.3] text-[#231915]">
      {title}
    </h3>
    <p className="text-sm leading-[1.6] text-[#56433a]">
      {description}
    </p>

    {/* Progress bar (para cursos em andamento) */}
    <div className="h-1.5 w-full bg-[#f1dfd7] rounded-full overflow-hidden">
      <div
        className="h-full bg-[#fed977] rounded-full transition-all duration-500"
        style={{ width: `${progress}%` }}
      />
    </div>
    <span className="text-xs text-[#56433a]">{progress}% concluído</span>
  </div>
</div>
```

---

### Inputs de Formulário

```typescript
// Input padrão — tema Artisanal
<div className="flex flex-col gap-1.5">
  <label
    htmlFor="email"
    className="text-sm font-semibold text-[#231915]"
  >
    E-mail
  </label>

  <input
    id="email"
    type="email"
    placeholder="seu@email.com"
    className="
      w-full
      rounded-lg
      border border-[#897268]
      bg-[#fff8f6]
      px-4 py-3
      text-base text-[#231915]
      placeholder:text-[#897268]
      transition-all duration-150
      focus:outline-none
      focus:border-2 focus:border-[#984207]
      focus:ring-2 focus:ring-[#984207]/20
      hover:border-[#56433a]
      invalid:border-[#ba1a1a]
      invalid:focus:border-[#ba1a1a]
    "
  />

  {/* Mensagem de erro */}
  {error && (
    <p className="text-xs text-[#ba1a1a] flex items-center gap-1">
      <AlertCircle size={12} />
      {error}
    </p>
  )}
</div>
```

**Estados dos Inputs:**

| Estado   | Borda                  | Background     | Observações                 |
| -------- | ---------------------- | -------------- | --------------------------- |
| Default  | `#897268` (1px)        | `#fff8f6`      | Estado inicial              |
| Hover    | `#56433a` (1px)        | `#fff8f6`      | Cor mais escura             |
| Focus    | `#984207` (2px) + ring | `#fff8f6`      | Terracotta + glow sutil     |
| Error    | `#ba1a1a` (1px/2px)    | `#ffdad6` tint | Background levemente rosado |
| Disabled | `#dcc1b5` (1px)        | `#f1dfd7`      | Reduzido opacidade          |
| Filled   | `#897268` (1px)        | `#fff8f6`      | Sem mudança visual          |

---

### Progress Bars

```typescript
// Progress bar elegante — Gold para progresso
interface ProgressBarProps {
  value: number  // 0-100
  label?: string
  size?: 'sm' | 'md'
}

const ProgressBar = ({ value, label, size = 'md' }: ProgressBarProps) => {
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

### Badges

```typescript
// Variantes de badges do sistema
const badgeVariants = {
  // Categoria de curso — Terracotta
  category: 'bg-[#ffdbcb] text-[#793100] border-[#ffb691]',
  // Conclusão / Sucesso — Gold
  success: 'bg-[#ffe08f] text-[#241a00] border-[#e6c364]',
  // Grátis / Preview — Terciário
  free: 'bg-[#bce9ff] text-[#001f2a] border-[#70d2fa]',
  // Novo — Primário vibrante
  new: 'bg-[#984207] text-white border-transparent',
  // Neutro
  neutral: 'bg-[#f1dfd7] text-[#56433a] border-[#dcc1b5]',
  // Erro
  error: 'bg-[#ffdad6] text-[#93000a] border-[#ba1a1a]',
}

const Badge = ({
  children,
  variant = 'neutral',
}: {
  children: React.ReactNode
  variant?: keyof typeof badgeVariants
}) => (
  <span className={`
    inline-flex items-center gap-1
    px-2.5 py-0.5
    text-xs font-semibold tracking-[0.03em]
    border rounded-full
    ${badgeVariants[variant]}
  `}>
    {children}
  </span>
)
```

---

### Elevação e Sombras

```typescript
// Classes de sombra por nível de elevação
const elevation = {
  // Nível 0: Flat (sem elevação)
  0: "",
  // Nível 1: Card padrão
  1: "shadow-[0px_4px_20px_rgba(196,99,42,0.08)]",
  // Nível 2: Card hover / Dropdown
  2: "shadow-[0px_8px_32px_rgba(196,99,42,0.14)]",
  // Nível 3: Modal / Dialog
  3: "shadow-[0px_16px_48px_rgba(35,25,21,0.18)]",
  // Nível 4: Tooltip / Popover
  4: "shadow-[0px_4px_16px_rgba(35,25,21,0.16)]",
};
```

---

## Componentes de Layout

### Navbar

```typescript
// Altura: 64px (h-16)
// Background: #fff8f6 com border-bottom #e8e0d9
// Posição: sticky top-0 z-50

<nav className="
  sticky top-0 z-50
  h-16
  bg-[#fff8f6]
  border-b border-[#e8e0d9]
  backdrop-blur-sm
">
  <div className="mx-auto max-w-[1280px] h-full px-6 flex items-center justify-between">
    {/* Logo + Navegação + Ações */}
  </div>
</nav>
```

### Sidebar de Curso (Player)

```typescript
// Largura: 320px no desktop, drawer no mobile
// Background: #ffffff
// Border: border-l border-[#e8e0d9]

<aside className="
  w-80 h-full
  bg-white
  border-l border-[#e8e0d9]
  overflow-y-auto
  flex flex-col
">
  {/* Lista de módulos e aulas */}
</aside>
```

### Seção Hero

```typescript
<section className="py-[80px] bg-[#fff8f6]">
  <div className="mx-auto max-w-[1280px] px-6 md:px-8">
    <div className="max-w-2xl">
      <span className="label-md text-[#755b00] uppercase tracking-[0.05em]">
        Nova turma aberta
      </span>
      <h1 className="font-serif text-[48px] leading-[1.1] tracking-[-0.02em] text-[#231915] mt-4">
        Aprenda confeitaria artesanal com quem domina a técnica
      </h1>
      <p className="text-[18px] leading-[1.6] text-[#56433a] mt-6">
        Do básico ao avançado, com acompanhamento especializado.
      </p>
      <div className="flex gap-4 mt-8">
        <Button variant="primary" size="lg">Quero começar agora</Button>
        <Button variant="secondary" size="lg">Ver programa completo</Button>
      </div>
    </div>
  </div>
</section>
```

---

## Regras de Acessibilidade

### Contraste de Cor (WCAG AA)

| Par de cores              | Ratio  | Nível | Uso                               |
| ------------------------- | ------ | ----- | --------------------------------- |
| `#231915` sobre `#fff8f6` | 16.8:1 | AAA   | Texto principal sobre background  |
| `#984207` sobre `#fff8f6` | 5.2:1  | AA    | Links e ações sobre background    |
| `#ffffff` sobre `#984207` | 5.2:1  | AA    | Texto sobre botão primário        |
| `#56433a` sobre `#fff8f6` | 7.6:1  | AAA   | Texto secundário sobre background |
| `#793100` sobre `#ffdbcb` | 5.0:1  | AA    | Texto sobre badge primary-fixed   |
| `#241a00` sobre `#ffe08f` | 13.5:1 | AAA   | Texto sobre badge gold            |
| `#ba1a1a` sobre `#fff8f6` | 5.9:1  | AA    | Mensagem de erro sobre background |

### Requisitos de Acessibilidade

```typescript
// 1. Foco visível em todos os elementos interativos
// Nunca usar `outline-none` sem substituto visível
className="focus-visible:ring-2 focus-visible:ring-[#984207] focus-visible:ring-offset-2"

// 2. Tamanho mínimo de área de toque: 48x48px (WCAG 2.5.5)
// Todos os botões: min-h-[48px]

// 3. Labels em todos os inputs
<label htmlFor="email">E-mail</label>
<input id="email" aria-describedby="email-error" />
{error && <p id="email-error" role="alert">{error}</p>}

// 4. Texto alternativo em imagens de conteúdo
<img src={thumbnail} alt={`Thumbnail do curso: ${courseTitle}`} />

// 5. Landmarks semânticos
<header role="banner">...</header>
<nav aria-label="Navegação principal">...</nav>
<main>...</main>
<aside aria-label="Módulos do curso">...</aside>
<footer role="contentinfo">...</footer>

// 6. Indicadores de estado para screen readers
<div
  role="progressbar"
  aria-valuenow={75}
  aria-valuemin={0}
  aria-valuemax={100}
  aria-label="Progresso do curso: 75%"
>
```

---

## Configuração do Shadcn/UI

### components.json

```json
{
  "$schema": "https://ui.shadcn.com/schema.json",
  "style": "default",
  "rsc": true,
  "tsx": true,
  "tailwind": {
    "config": "tailwind.config.ts",
    "css": "src/app/globals.css",
    "baseColor": "stone",
    "cssVariables": true,
    "prefix": ""
  },
  "aliases": {
    "components": "@/components",
    "utils": "@/lib/utils",
    "ui": "@/components/ui",
    "lib": "@/lib",
    "hooks": "@/hooks"
  }
}
```

### Customização dos Componentes Shadcn

```typescript
// Após instalação, customizar os componentes gerados:
// apps/web/src/components/ui/button.tsx → usar buttonVariants do design system
// apps/web/src/components/ui/input.tsx → aplicar estilos Artisanal
// apps/web/src/components/ui/card.tsx → sombra terracotta, borda #e8e0d9
// apps/web/src/components/ui/badge.tsx → variantes do design system
// apps/web/src/components/ui/progress.tsx → cor gold para progresso
```

---

## Guia de Implementação Passo a Passo

### 1. Instalar Fontes

```bash
# As fontes são carregadas via next/font/google
# Nenhuma instalação de pacote necessária
```

### 2. Configurar globals.css

Copiar a configuração completa da seção "Configuração no TailwindCSS 4.x" acima para `apps/web/src/app/globals.css`.

### 3. Configurar Layout Raiz

```typescript
// apps/web/src/app/layout.tsx
import { DM_Serif_Display, Inter } from 'next/font/google'
import './globals.css'

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

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR" className={`${dmSerifDisplay.variable} ${inter.variable}`}>
      <body className="bg-[#fff8f6] text-[#231915] font-sans antialiased">
        {children}
      </body>
    </html>
  )
}
```

### 4. Inicializar Shadcn/UI

```bash
pnpm dlx shadcn@latest init
# Selecionar: Default style, Stone base color, CSS variables: yes
```

### 5. Instalar Componentes Necessários

```bash
pnpm dlx shadcn@latest add button input card badge progress accordion dialog
```

### 6. Validar Contraste

Usar a ferramenta [Colour Contrast Analyser](https://www.tpgi.com/color-contrast-checker/) para validar todos os pares de cores antes do release.

---

## Tokens Rápidos para Uso no Código

```typescript
// Mapa de tokens mais usados — copiar para um arquivo de constantes

export const DESIGN_TOKENS = {
  colors: {
    // Background e superfícies
    background: "#fff8f6",
    surface: "#fff8f6",
    surfaceContainer: "#fdeae2",
    cardBorder: "#e8e0d9",

    // Textos
    textPrimary: "#231915",
    textSecondary: "#56433a",
    textDisabled: "#897268",

    // Ações primárias
    primary: "#984207",
    primaryHover: "#b85a21",
    primaryText: "#ffffff",

    // Destaque gold
    gold: "#fed977",
    goldText: "#241a00",

    // Estados
    error: "#ba1a1a",
    errorBg: "#ffdad6",
    success: "#755b00",
    successBg: "#ffe08f",
  },
  shadows: {
    card: "0px 4px 20px rgba(196, 99, 42, 0.08)",
    cardHover: "0px 8px 32px rgba(196, 99, 42, 0.14)",
    modal: "0px 16px 48px rgba(35, 25, 21, 0.18)",
  },
} as const;
```

---

## Referências

- Especificação DESIGN.md: `ybr-plataform/layout/desktop-layout/artisanal_sophistication/DESIGN.md`
- Protótipos de layout: `ybr-plataform/layout/`
- globals.css de referência: `priscila-bravin-store/src/app/globals.css`
- Material Design 3 (base do sistema): https://m3.material.io/
- WCAG 2.1 AA Checklist: https://www.w3.org/WAI/WCAG21/quickref/
- DM Serif Display (Google Fonts): https://fonts.google.com/specimen/DM+Serif+Display
- Inter (Google Fonts): https://fonts.google.com/specimen/Inter
- Shadcn/UI Docs: https://ui.shadcn.com
- TailwindCSS v4 Docs: https://tailwindcss.com/docs
