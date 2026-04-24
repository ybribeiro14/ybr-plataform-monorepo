# 10 — Prompt para Ferramenta de AI Design

**Data:** 2026-04-24  
**Finalidade:** Gerar o design da plataforma em um formato que o AI de desenvolvimento possa consumir e replicar fielmente.

---

## Como usar este documento

### Fluxo recomendado

```
OPÇÃO A — v0.dev (melhor para iterar visualmente):
1. Usar o Prompt v0.dev abaixo → gera componentes React/Shadcn/Tailwind
2. Publicar o projeto gerado no v0.dev → obtém uma URL pública
3. Compartilhar a URL com o Copilot → ele lê o código gerado e replica fielmente

OPÇÃO B — Claude Design (melhor para telas individuais com alto controle):
1. Usar o Prompt Claude Design abaixo → gera React artifacts por tela
2. Copiar o código do artifact gerado
3. Colar em apps/web/src/components/ui-reference/[nome-da-tela].tsx
4. Compartilhar o arquivo com o Copilot → ele usa como referência fiel
```

**Por que v0.dev é o melhor formato para o Copilot:**
- Gera React + TypeScript + Shadcn/UI + TailwindCSS — exatamente nossa stack
- Produz código que o Copilot pode ler, entender e adaptar com precisão
- URL pública = referência viva, iterável por conversa
- Tem "Open in Figma" para referência visual adicional

**Por que Claude Design também é excelente:**
- Responde prompts muito detalhados com alta fidelidade por tela
- Permite especificar estados (loading, error, empty) na mesma conversa
- Artifact React copiável direto para o projeto como referência
- Ideal para telas complexas (player, checkout, admin) onde controle > velocidade

**Por que NÃO só imagem/Figma:**
- Imagens não contêm medidas, estados, responsividade ou lógica
- Figma exporta CSS genérico, não componentes Shadcn específicos da nossa stack
- Código gerado = ponto de partida real, não só referência visual

---

## PROMPT PARA CLAUDE DESIGN

> Use no [claude.ai](https://claude.ai) com artefatos React habilitados. Envie um prompt por tela ou por grupo de telas relacionadas. O artifact gerado é o que o Copilot vai usar como referência.

---

### Como usar o Claude Design para este projeto

Envie esta mensagem base **uma vez** no início da conversa para estabelecer o design system, depois peça cada tela individualmente:

---

#### MENSAGEM DE SETUP (enviar uma vez, no início)

```
You are a senior UI engineer building a React component for the YBR Platform — a premium online course platform for Brazilian women living in the United States.

STRICT RULES for every component you generate:
- Use React + TypeScript + TailwindCSS only (no external UI libs, no CSS files)
- All user-facing text must be in Portuguese (pt-BR) — never English in labels, buttons, or placeholders
- Mobile-first: design for 390px width first, then responsive up to 1440px
- Export the component as a named export (no default exports)
- Use realistic pt-BR placeholder content — never "Lorem Ipsum"

DESIGN SYSTEM — apply to every component:

Colors:
  Primary (terracotta): #C4632A — use for all primary CTAs, active states, progress fills
  Background: #F9F3EC — warm cream, main page background
  Surface: #FFFFFF — cards and panels
  Text primary: #1C1C1C — headings
  Text secondary: #5A5A5A — body
  Text muted: #8F8F8F — captions, placeholders
  Gold accent: #C9A84C — badges, stars, highlights
  Border: #E8E0D9 — card borders, input borders
  Success: #2E7D52
  Error: #DC2626

Typography:
  Headings: font-family Georgia or "DM Serif Display" — simulate with className="font-serif"
  Body: system sans-serif — className="font-sans"

Component tokens:
  Cards: bg-white rounded-xl border border-[#E8E0D9] shadow-sm
  Primary button: bg-[#C4632A] text-white rounded-full min-h-[48px] hover:bg-[#A3521F]
  Outline button: border border-[#C4632A] text-[#C4632A] rounded-full min-h-[48px]
  Inputs: rounded-lg border border-[#E8E0D9] h-11 px-3 focus:outline-none focus:ring-2 focus:ring-[#C4632A]
  Progress bar track: bg-[#E8E0D9] rounded-full — fill: bg-[#C4632A]
  Gold badge: bg-[#C9A84C]/10 text-[#C9A84C] rounded-full px-2 py-0.5 text-xs font-medium
  Primary badge: bg-[#C4632A]/10 text-[#C4632A] rounded-full px-2 py-0.5 text-xs font-medium

Icons: Use inline SVG or emoji as placeholders for Lucide icons. Mark them with comments like {/* lucide: Play */}

Confirm you understood the design system by saying "Design system loaded ✓ — ready to build screens."
```

---

#### PROMPTS POR TELA (enviar após o setup)

Copie e envie um de cada vez. O Claude vai gerar um artifact React para cada tela.

---

**TELA 01 — Login**
```
Build SCREEN 01: Login Page

Route: /login
Component name: LoginPage

Layout: Full viewport height, centered card (max-w-sm, w-full), cream background (#F9F3EC)

Content structure (top to bottom):
1. Logo area: circle 48px bg-[#C4632A] with "Y" in white text-xl font-serif, followed by "YBR" text-2xl font-serif text-[#1C1C1C] — centered
2. Heading: "Bem-vinda de volta" — text-2xl font-serif text-[#1C1C1C]
3. Subtext: "Entre na sua conta para continuar aprendendo" — text-sm text-[#5A5A5A] text-center
4. Form:
   - Label + Input: "Email" → type email, placeholder "seu@email.com"
   - Label + Input: "Senha" → type password, placeholder "••••••••", eye icon toggle button on right
   - Right-aligned link: "Esqueceu sua senha?" text-sm text-[#C4632A]
   - Primary button full-width: "Entrar"
5. Divider: horizontal line with "ou continue com" text-xs text-[#8F8F8F] centered
6. Google button: outline full-width, Google "G" colored SVG icon on left, "Entrar com Google"
7. Footer text: "Não tem conta?" + link "Crie gratuitamente →" text-[#C4632A]
8. Trust line: {/* lucide: Lock */} small icon + "Conexão segura SSL" text-xs text-[#8F8F8F] centered

States to show:
- Default state (empty form)
- Loading state: button shows spinner + "Entrando..."
- Error state: input border turns red, error message "Email ou senha incorretos" below password

Show the component in both mobile (390px) and with a responsive note for desktop (centered card on wider screens).
```

---

**TELA 02 — Cadastro**
```
Build SCREEN 02: Register Page

Route: /cadastro
Component name: RegisterPage

Layout: Full viewport, centered card max-w-sm, cream background

Content:
1. Logo (same as login)
2. Heading: "Crie sua conta"
3. Subtext: "Junte-se a mais de 800 alunas"
4. Form:
   - "Nome completo" input, placeholder "Seu nome completo"
   - "Email" input, placeholder "seu@email.com"
   - "Senha" password input with strength meter below:
     Strength bar: 4 segments, progressively fill with colors:
     1 = red (#DC2626), 2 = orange (#B45309), 3 = yellow (#C9A84C), 4 = green (#2E7D52)
     Label below: "Fraca" | "Razoável" | "Boa" | "Forte"
   - "Confirmar senha" password input
5. Checkbox: square checkbox + "Li e aceito os Termos de Uso e Política de Privacidade" — link text underlined
6. Primary button full-width: "Criar conta gratuita"
7. Divider + Google button (same as login)
8. Footer: "Já tem conta?" + link "Entrar →"

States:
- Default
- Loading: button shows "Criando conta..."
- Error: inline error below each invalid field
```

---

**TELA 03 — Recuperar Senha**
```
Build SCREEN 03: Forgot Password — two states in one component

Route: /esqueci-senha
Component name: ForgotPasswordPage

Use a local state (step: 'form' | 'sent') to toggle between views.

STATE 1 — Form:
- Back arrow link on top-left: "← Voltar" text-sm text-[#5A5A5A]
- Large envelope icon (SVG, 64px, color #C4632A) centered
- Heading: "Esqueceu sua senha?"
- Text: "Digite seu email e enviaremos um link para criar uma nova senha."
- Email input
- Button: "Enviar link de recuperação"
- Link below: "Lembrou a senha? Voltar para o login"

STATE 2 — Success (shown after button click):
- Large checkmark circle (SVG, 64px, green #2E7D52) centered
- Heading: "Email enviado!"
- Text: "Verifique sua caixa de entrada em [email digitado]"
- Outline button: "Reenviar email" — disabled with countdown "Reenviar em 45s" that counts down using useEffect
- Link: "Voltar para o login"
```

---

**TELA 04 — Redefinir Senha**
```
Build SCREEN 04: Reset Password

Route: /redefinir-senha
Component name: ResetPasswordPage

Content:
- Large lock icon (SVG, 64px, #C4632A) centered
- Heading: "Crie uma nova senha"
- Subtext: "Sua nova senha deve ter pelo menos 8 caracteres"
- "Nova senha" password input + same 4-segment strength meter as registration
- "Confirmar nova senha" password input
- Requirements checklist (show live validation with ✓ green / ✗ grey):
  □ Pelo menos 8 caracteres
  □ Uma letra maiúscula
  □ Um número
- Button: "Salvar nova senha" — disabled until all requirements met
- Success state after submit: green checkmark + "Senha alterada!" + "Ir para o login →"
```

---

**TELA 05 — Dashboard do Aluno**
```
Build SCREEN 05: Student Dashboard

Route: /dashboard
Component name: StudentDashboard
This is the MOST important screen — maximum detail required.

Mobile layout (390px):

HEADER (sticky top):
  Left: circular avatar 36px (initials "AL" on #C4632A bg), tap opens profile
  Center: "Olá, Ana! 👋" text-lg font-serif
  Right: bell icon with red dot badge (2 notifications)

SEARCH BAR (below header):
  Full-width rounded-full input: "Buscar aulas..." with search icon left

SECTION 1 — "Continue de onde parou":
  Full-width card (no horizontal padding), 16:9 thumbnail with overlay:
  - Thumbnail: dark gradient overlay bottom half
  - Bottom-left text on overlay: "Doces Americanos para Vender" text-sm font-semibold text-white
  - Below: "Aula 7 — Brigadeiro Gourmet" text-xs text-white/80
  - Center: large play button circle 56px bg-white/90 with play icon #C4632A
  Below thumbnail (inside card, white bg, p-4):
  - Progress bar 67% + "Aula 7 de 12 — Módulo 3"
  - "67% concluído • Retomar →" small link

SECTION 2 — "Meus Cursos":
  Section heading + "Ver todos →" link (right)
  Horizontal scroll container (overflow-x-auto, gap-3, pb-2):
  3 course cards, each 160px wide:
    - Thumbnail 160×90 rounded-lg
    - Course name text-sm font-medium 2 lines max
    - Circular progress ring (SVG, 40px) bottom-right corner, overlapping thumbnail:
      Card 1: 42% terracotta
      Card 2: 100% green (completed — show checkmark inside ring)
      Card 3: 15% terracotta

SECTION 3 — "Próximas Conquistas":
  2 cards side-by-side:
    Left (unlocked): gold badge icon + "5 aulas seguidas" + "Conquistado!" green text
    Right (locked): grey badge icon + "Assistir 10 aulas" + progress "7/10"

SECTION 4 — "Sua Jornada":
  3-column stats row:
    "12" large + "aulas assistidas" small
    "3h 40min" large + "de conteúdo" small
    "1" large + "certificado" small

BOTTOM NAVIGATION (fixed bottom, white, border-top shadow):
  5 items: Home (active, #C4632A icon + label), Cursos, Comunidade, Certificados, Perfil
  Each: icon above + label text-xs

DESKTOP ADAPTATION (md: breakpoint):
  Left sidebar 240px: Logo, nav items vertical, user info bottom
  Main content: 2-column grid for sections
```

---

**TELA 06 — Lista de Cursos do Aluno**
```
Build SCREEN 06: My Courses List

Route: /meus-cursos
Component name: MyCoursesList

Header: "Meus Cursos" h1 + filter tabs below: "Em andamento" | "Concluídos" | "Todos" — tabs with underline active state in #C4632A

Course cards grid (1 col mobile, 2 col md, 3 col lg):
Each card:
  - Thumbnail 16:9 with category badge top-left: "Confeitaria" bg-[#C9A84C]/90 text-white
  - Card body p-4:
    - Course title: "Doces Americanos para Vender" text-base font-semibold 2 lines
    - Creator row: avatar 24px + "Chef Ana Lima" text-xs text-[#5A5A5A]
    - Progress bar (full width, h-1.5) + "42% concluído" text-xs text-[#5A5A5A] mt-1
    - Stats: "67 aulas • 8h 30min" text-xs text-[#8F8F8F]
    - Button (full width, mt-3): "Continuar" primary OR "Começar" outline (based on progress)

Empty state (when no courses):
  - Centered illustration: graduation cap emoji 64px
  - "Você ainda não está matriculada em nenhum curso" text-center
  - Outline button: "Explorar cursos →"
```

---

**TELA 07 — Visão Geral do Curso**
```
Build SCREEN 07: Course Overview Page

Route: /cursos/[slug]
Component name: CourseOverviewPage

HERO section:
  - Background: blurred thumbnail image (use a solid dark color as placeholder), overlay, p-6
  - Category badge: "Confeitaria" gold
  - Course title H1 white: "Doces Americanos para Vender"
  - "Chef Ana Lima" with small avatar
  - "Matriculada em 15 jan. 2026" text-xs text-white/70

PROGRESS CARD (white card below hero, -mt-6 z-10 relative, mx-4):
  - Left: circular SVG progress ring 80px, 42% terracotta, "42%" text center, "concluído" below
  - Right: stacked info
    "24 de 57 aulas concluídas"
    "Conclusão estimada: 3 semanas"
    Button outline small: "Ver certificado 🔒" — disabled, grey

TABS: "Conteúdo" | "Materiais" | "Comunidade" — underline style

CONTENT TAB — module accordion:
3 modules, first one open:
  Module header (clickable): "Módulo 1 — Bases da Confeitaria Americana" + "4/6 aulas" badge + chevron
  Inside each module: lesson list
    Each lesson row:
      Left icon (16px):
        - Completed: green checkmark circle
        - Current: terracotta play circle  
        - Not started: empty circle border-[#E8E0D9]
        - Locked: grey lock icon
      Lesson title text-sm (muted if locked)
      Right: duration "12:34" text-xs text-[#8F8F8F]
    
Show module 1 with 6 lessons: 4 completed, 1 current, 1 not started
Show module 2 collapsed (header only): "5/12 aulas"
Show module 3 collapsed: "0/15 aulas"
```

---

**TELA 08 — Player de Aula**
```
Build SCREEN 08: Video Player / Lesson Page

Route: /aulas/[id]
Component name: LessonPlayerPage
This is the MOST CRITICAL screen — maximum detail and care.

MOBILE LAYOUT (390px):

VIDEO PLAYER area (16:9, black bg, w-full):
  - Placeholder: dark rectangle with centered play button circle (white, 56px) and "YBR" watermark bottom-right
  - Custom controls bar (absolute bottom-0, gradient overlay, p-3):
    Row 1: scrubber bar — left portion #C4632A, right #FFFFFF/30, h-1, touch target wrapper h-6
    Row 2 flex: Play/pause icon | "7:23 / 18:45" text-xs text-white | spacer | "1x" speed button | fullscreen icon
  - Progress: 40% played (show on scrubber)

SCROLLABLE CONTENT below video:

Breadcrumb: "Doces Americanos > Módulo 3 > Aula 7" text-xs text-[#8F8F8F] with ">" separators

Lesson heading row:
  H2: "Brigadeiro Gourmet — Técnicas de Enrolamento" font-serif text-lg
  Right: duration badge "18:45" bg-[#F9F3EC] text-xs

Completion toggle row:
  Checkbox circle (animated) + "Marcar como concluída" text-sm
  When checked: green checkmark + "Aula concluída ✓" text-[#2E7D52]

TABS: "Aula" (active) | "Material" | "Dúvidas" | "Minhas Notas"

AULA TAB content:
  Description paragraph 3-4 lines about the lesson content in pt-BR

STICKY BOTTOM BAR (fixed bottom-0 above bottom-nav, white border-top p-3):
  2-column: 
    Left button outline: "← Aula anterior"
    Right button primary: "Próxima aula →"

DESKTOP LAYOUT (lg: breakpoint):
  Left 65%: video + breadcrumb + heading + tabs
  Right 35%: lesson list panel (sticky)
    Panel header: "Módulo 3 — Doces Clássicos" text-sm font-semibold, "12 aulas"
    Lesson list (scrollable):
      Each item (py-3 border-b):
        Left icon 20px (completed/current/locked states as before)
        Middle: title text-sm, duration text-xs text-[#8F8F8F]
        Current lesson: terracotta left border-l-2, bg-[#C4632A]/5, bold title
```

---

**TELA 09+10 — Abas Material e Notas**
```
Build SCREEN 09+10: Material and Notes tabs (shown inside the lesson player page)

Component name: LessonMaterialTab and LessonNotesTab (two separate components)

MATERIAL TAB:
  Section heading: "Materiais desta aula" text-base font-semibold
  3 file cards:
    Each card (flex row, p-3, border rounded-lg, gap-3):
      Left: PDF icon SVG 40px (red #DC2626 rectangle with "PDF" white text)
      Middle:
        Filename: "Receita — Brigadeiro Gourmet.pdf" text-sm font-medium
        Size: "1.2 MB • PDF" text-xs text-[#8F8F8F]
      Right: download icon button, ghost style, text-[#C4632A]
  
  Section heading: "Materiais do Módulo" text-base font-semibold mt-6
  2 more file cards (same structure, different filenames)

NOTES TAB:
  "Escreva sua anotação" label + timestamp right: "agora" text-xs text-[#8F8F8F]
  Textarea: 4 rows, placeholder "Escreva suas anotações sobre esta aula...", border rounded-lg
  Button right-aligned: "Salvar nota" primary small
  
  Divider: "Anotações anteriores" text-xs text-[#8F8F8F] mt-4
  
  Previous notes list (2 items):
    Each note card:
      Header: timestamp "há 2 dias" text-xs text-[#8F8F8F] + edit icon + delete icon (right)
      Body: note text paragraph text-sm
      Bottom: "Aula 5 — Doce de Leite" text-xs text-[#C4632A] link
```

---

**TELA 11 — Landing Page / Página de Vendas**
```
Build SCREEN 11: Sales Landing Page

Route: /[creator-slug]/[course-slug]
Component name: CourseSalesPage
This is a PUBLIC page — no header navigation. Mobile-first.

Build as a full long-form sales page. Sections in order:

1. HERO (bg gradient from #F9F3EC to #FDF8F4):
   - "★★★★★ 847 alunas em 12 estados" text-xs text-[#C9A84C] text-center font-medium
   - H1 (font-serif, text-3xl md:text-5xl, text-[#1C1C1C], text-center, leading-tight):
     "Aprenda a Fazer Doces Americanos e Comece a Vender Esta Semana"
   - Subtitle text-base text-[#5A5A5A] text-center max-w-lg:
     "O único curso de confeitaria criado especialmente para brasileiras que vivem nos Estados Unidos"
   - Proof pills row (flex wrap justify-center gap-2): 
     "📍 Framingham, MA" | "📍 Somerville" | "📍 Everett" | "📍 Orlando, FL"
     Each: text-xs bg-white border rounded-full px-3 py-1
   - CTA button (large, full width md:max-w-sm): "QUERO COMEÇAR AGORA →"
   - Below button: "ou 6x de $37 • Garantia de 15 dias 🔒" text-xs text-[#8F8F8F] text-center
   - Video preview: 16:9 card with dark bg, centered play button, caption "Assista a apresentação do curso"

2. PROOF BAR (white bg, py-6, border-y):
   3 items centered, flex row justify-center gap-8:
   "✅ 100% Online" | "🎓 Certificado incluído" | "🇧🇷 Suporte em Português"
   Each: icon + text-sm font-medium

3. FOR WHOM (cream bg):
   H2 font-serif text-center: "Este curso é para você que..."
   2×2 grid of cards:
     "🏠 Quer começar a vender doces de casa"
     "✈️ Está nos EUA há pouco tempo e não sabe por onde começar"
     "🛒 Não sabe usar ingredientes americanos como Crisco e Karo"
     "💵 Quer uma renda extra em dólar trabalhando de casa"

4. WHAT YOU'LL LEARN:
   H2 font-serif text-center: "O que você vai aprender"
   2-column grid, 8 checkmark items (√ in #C4632A):
     "Receitas completas com ingredientes do Stop & Shop e Walmart"
     "Como precificar seus doces em dólar com lucro"
     "Lei do Cottage Food de Massachusetts"
     "Como tirar fotos bonitas dos seus doces com celular"
     "Criar sua conta no Instagram para vendas"
     "Aceitar pagamentos por Zelle, Venmo e dinheiro"
     "Embalar profissionalmente seus doces"
     "Montar seu cardápio e lista de preços"

5. COURSE CONTENT:
   H2: "Conteúdo do Curso"
   Stats bar: "5 módulos • 57 aulas • 8h 30min de conteúdo" — pill badges
   Accordion (Radix-style, first open):
     "Módulo 1 — Bases da Confeitaria Americana" (10 aulas) — list of 3 visible lessons + "ver mais"
     "Módulo 2 — Doces Clássicos para Vender" (12 aulas) — collapsed
     "Módulo 3 — Embalagem e Apresentação" (10 aulas) — collapsed
     "Módulo 4 — Precificação e Vendas" (15 aulas) — collapsed
     "Módulo 5 — Marketing para Confeiteiras" (10 aulas) — collapsed

6. INSTRUCTOR:
   Circular photo placeholder 120px (bg-[#C4632A]/20 with chef hat emoji)
   "Chef Ana Lima" text-xl font-serif
   Bio text-sm text-[#5A5A5A] 3 lines
   Stats: "12 anos de experiência • 1.200+ alunas formadas"

7. TESTIMONIALS:
   H2: "O que nossas alunas dizem"
   3 cards (vertical mobile, horizontal desktop):
     Card 1: ★★★★★ | quote | "Maria S., Framingham MA" | bold result: "Faturei $1.200 no primeiro mês"
     Card 2: ★★★★★ | quote | "Fernanda L., Somerville MA" | "Já tenho 15 clientes fixos"
     Card 3: ★★★★★ | quote | "Carla M., Orlando FL" | "Vendi $800 na primeira semana"

8. PRICING BOX (centered max-w-md mx-auto):
   Border-2 border-[#C4632A] rounded-2xl p-6 bg-white:
   - Badge top: "Mais popular" bg-[#C4632A] text-white rounded-full px-4 py-1 text-sm — centered, -mt-4
   - ~~$297~~ text-[#8F8F8F] line-through text-sm text-center
   - "$197" text-5xl font-serif text-[#C4632A] text-center font-bold
   - "ou 6x de $37 sem juros" text-sm text-[#5A5A5A] text-center
   - Divider
   - 6 feature checkmark items:
     "✓ Acesso imediato e vitalício"
     "✓ 57 aulas em vídeo HD"
     "✓ Materiais e receitas para download"
     "✓ Certificado de conclusão"
     "✓ Grupo de suporte no WhatsApp"
     "✓ Atualizações gratuitas"
   - CTA button full-width large: "QUERO COMEÇAR AGORA →"
   - "🔒 Pagamento 100% seguro • Stripe • SSL" text-xs text-center text-[#8F8F8F]
   - "Garantia incondicional de 15 dias — devolvemos 100% do seu dinheiro sem perguntas" text-xs text-center

9. FAQ Accordion (5 items, closed):
   H2: "Perguntas Frequentes"
   "Preciso ter experiência em confeitaria?" 
   "Os ingredientes são fáceis de encontrar nos EUA?"
   "Posso assistir pelo celular?"
   "Como funciona a garantia de 15 dias?"
   "O certificado é reconhecido?"

10. FOOTER CTA:
    Cream bg, H2: "Comece sua jornada hoje"
    Repeated CTA + guarantee line
    Simple footer: copyright + links

Show full page in mobile width (390px) with proper section spacing.
```

---

**TELA 12 — Checkout**
```
Build SCREEN 12: Checkout Page

Route: /checkout/[courseId]
Component name: CheckoutPage

Mobile (390px): single column, order summary first, form below
Desktop (md+): 2 columns: form left (60%), order summary right (40%)

MOBILE / LEFT — ORDER SUMMARY (card):
  H3: "Resumo do pedido"
  Row: thumbnail 72px rounded + course title "Doces Americanos para Vender" + "Chef Ana Lima" text-xs
  Divider
  Row: "Subtotal" + "$197,00"
  Row: "Total" bold + "$197,00" bold text-[#C4632A]
  Trust pills: "🔒 Seguro" | "✅ 15 dias de garantia" | "⚡ Acesso imediato"

FORM — LEFT (card):
  H2: "Finalizar Compra"
  
  Payment toggle (segmented control, full width):
    Segment 1: "À vista — $197" (active: bg-[#C4632A] text-white)
    Segment 2: "6x de $37" (inactive: bg-white text-[#1C1C1C])
  
  Card form section:
    Label: "Número do cartão"
    Input with card type icon right (placeholder: "1234 5678 9012 3456")
    Two-column row: "Validade" input (placeholder "MM/AA") | "CVV" input (placeholder "123")
    Label: "Nome no cartão"
    Input placeholder "Como aparece no cartão"
  
  Divider: "Informações de acesso"
  
  "Email" input placeholder "seu@email.com"
  
  Checkbox: "Li e aceito os Termos de Uso e Política de Privacidade"
  
  Submit button full-width large: "FINALIZAR COMPRA — $197"
  Loading state: spinner + "Processando pagamento..."
  
  Payment icons row: Visa | Mastercard | Amex | Apple Pay | Google Pay (SVG placeholders as colored rectangles with labels)

Error state (show below submit): red card "Cartão recusado. Verifique os dados ou use outro cartão."
```

---

**TELA 13 — Confirmação de Compra**
```
Build SCREEN 13: Order Confirmation

Route: /checkout/confirmacao
Component name: OrderConfirmationPage

Layout: centered max-w-lg, cream background, py-16

Content:
  - Success circle: 80px green #2E7D52 with white checkmark SVG — add subtle pulse animation (CSS)
  - Confetti suggestion: 3 colored dots above (decorative)
  - H1 font-serif: "Compra confirmada! 🎉"
  - Subtitle: "Bem-vinda ao curso, Ana! Seu acesso já está ativo."
  
  Summary card (border rounded-xl p-4):
    Row: "Curso" | "Doces Americanos para Vender"
    Row: "Valor pago" | "$197,00"
    Row: "Status" | green badge "Acesso ativo"
  
  Info box (bg-[#F9F3EC] rounded-lg p-3 text-sm):
    "📧 Um email de confirmação foi enviado para ana@email.com"
  
  Primary button full-width: "Acessar o curso agora →"
  Text button below: "Ir para o dashboard"
  
  Separator
  
  Share section: "Compartilhe sua conquista:"
  Outline buttons row: WhatsApp icon + "WhatsApp" | Instagram icon + "Stories"
```

---

**TELA 14 — Certificado**
```
Build SCREEN 14: Certificate Page + Verification Page

Component names: CertificatePage and CertificateVerificationPage

CERTIFICATE PAGE (/certificados/[id]):

Student view:
  Breadcrumb: "Dashboard > Certificados > Doces Americanos"
  
  Certificate card (landscape, max-w-2xl, cream bg #F9F3EC, border-2 border-[#C9A84C] rounded-xl p-8):
    - Top: logo "YBR" + decorative thin horizontal lines
    - Center top: "Certificado de Conclusão" text-xs uppercase tracking-widest text-[#C9A84C]
    - Main text (font-serif, large):
      "Certificamos que"
      "Ana Lima" (text-3xl, underline)
      "concluiu com êxito o curso"
      "Doces Americanos para Vender" (text-xl text-[#C4632A])
    - Date: "São Paulo, 15 de março de 2026"
    - Signature line: "_______________" + "Chef Ana Lima" + "Instrutora" text-xs
    - Bottom: verification code "Código: YBR-2026-ABC123" text-xs text-[#8F8F8F]
    - Decorative corners: small ornamental brackets in #C9A84C
  
  Action buttons row:
    "Compartilhar no LinkedIn" outline
    "Enviar no WhatsApp" outline
    "Baixar PDF" primary
  
  Verification URL: "Verificar autenticidade: ybr.app/verificar/ABC123" text-xs text-[#8F8F8F]

VERIFICATION PAGE (/verificar/[code]):
  Cream background, centered card max-w-sm
  
  Large checkmark or X icon based on state
  
  VALID state:
    Green checkmark circle 56px
    "✓ Certificado válido" text-xl text-[#2E7D52] font-serif
    Card with: Aluno, Curso, Data de conclusão, Emitido por
  
  INVALID state:
    Red X circle 56px
    "✗ Certificado não encontrado" text-[#DC2626]
    "O código informado não corresponde a nenhum certificado válido."
```

---

**TELA 15 — Perfil do Aluno**
```
Build SCREEN 15: Profile & Settings

Route: /perfil
Component name: ProfilePage

Mobile: tabs at top. Desktop: sidebar nav left + content right.

SIDEBAR / TABS items: "Minha Conta" | "Segurança" | "Notificações" | "Meus Certificados"

MINHA CONTA tab:
  Avatar section: circular 80px (initials "AL" on #C4632A) + "Trocar foto" button below
  Form:
    "Nome completo" input (pre-filled "Ana Lima")
    "Email" input disabled (pre-filled, grey bg, lock icon right)
    "Telefone" input (pre-filled "+1 617 555 0123")
  Button: "Salvar alterações"

SEGURANÇA tab:
  "Alterar senha" section:
    "Senha atual" password input
    "Nova senha" + strength meter
    "Confirmar nova senha"
    Button: "Atualizar senha"
  
  "Sessões ativas" section:
    2 session cards:
      "MacBook Pro — São Paulo" + "Ativo agora" green badge
      "iPhone 15 — Framingham, MA" + "Há 2 dias" text

NOTIFICAÇÕES tab:
  Toggle list (label left, toggle right):
    "Novas aulas disponíveis" — on
    "Lembretes de estudo" — on
    "Novidades e promoções" — off
    "Email semanal de progresso" — on

MEUS CERTIFICADOS tab:
  List of 1 earned certificate:
    Row: graduation cap icon + "Doces Americanos para Vender" + date + "Baixar PDF" link text-[#C4632A]
  Locked section: "Certificados em progresso (2)" with locked padlock cards
```

---

**TELA 16 — Admin Dashboard**
```
Build SCREEN 16: Creator Admin Dashboard

Route: /admin
Component name: AdminDashboard

This is DIFFERENT from the student area — more professional, less warm. Same color palette but more data-dense.

LAYOUT: Fixed sidebar (240px) on desktop. Bottom nav on mobile (same as student but different items).

SIDEBAR:
  Logo: "YBR Admin" text-sm font-serif
  Nav items (each: icon + label):
    Dashboard (active)
    Cursos
    Alunos
    Analytics
    Cupons
    Configurações
  Bottom: user avatar + name + "Ver plataforma →" link

MAIN CONTENT:

Page title: "Dashboard" H1 text-2xl font-serif + "Última atualização: agora" text-xs text-[#8F8F8F]

KPI CARDS ROW (4 cards, 2×2 mobile, 4×1 desktop):
  Each card (white, rounded-xl, p-5, border):
    Card 1: "Total de Alunas" | "847" text-3xl font-bold text-[#1C1C1C] | "+12% este mês" text-xs text-[#2E7D52] with up arrow
    Card 2: "Receita do Mês" | "$3.840" text-3xl text-[#C4632A] | "+8%" text-xs text-[#2E7D52]
    Card 3: "Taxa de Conclusão" | "64%" text-3xl | "→ 0%" text-xs text-[#8F8F8F]
    Card 4: "Novas Matrículas (30d)" | "43" text-3xl | "+5 esta semana" text-xs text-[#2E7D52]

REVENUE CHART (white card, p-5):
  H3: "Receita dos últimos 30 dias"
  Simulated line chart using SVG:
    - x-axis: 6 date labels
    - y-axis: $0 to $5000
    - Single line in #C4632A with area fill below (rgba(196, 99, 42, 0.1))
    - Data points: dots on line
    - Tooltip hint at one point

QUICK ACTIONS ROW:
  4 outline buttons with icons:
    "+ Adicionar Aula" | "📊 Ver Relatório" | "🎟 Criar Cupom" | "✏️ Editar Curso"

RECENT STUDENTS TABLE:
  H3: "Matrículas Recentes"
  Table (responsive, scroll on mobile):
    Headers: Aluna | Curso | Data | Progresso | Status | Receita
    5 rows of data:
      Avatar (initials circle) + name + email text-xs
      Course name text-sm
      Date text-xs text-[#8F8F8F]
      Progress bar 40% wide + "40%"
      Status badge: "Ativo" green | "Concluído" blue | "Cancelado" red
      "$197"
    Pagination: "1-5 de 847" + prev/next buttons
```

---

**TELA 17 — Lista de Cursos (Admin)**
```
Build SCREEN 17: Admin Courses List

Route: /admin/cursos
Component name: AdminCoursesList

Header row: "Meus Cursos" H1 + "Novo Curso →" primary button right

Course cards grid (1 col mobile, 2 col desktop):
Each card (white, rounded-xl, border, overflow-hidden):
  Thumbnail 16:9 top + status badge overlay top-right:
    "Publicado" green badge | "Rascunho" grey badge
  Card body p-4:
    Course title text-base font-semibold
    Stats row: "47 alunas • 64% conclusão" text-xs text-[#8F8F8F]
    Revenue: "$3.840 receita total" text-sm text-[#C4632A] font-medium
    Actions row (mt-3):
      "Editar" outline small | "Ver Página" outline small | "⋮" icon button
```

---

**TELA 18 — Criar/Editar Curso**
```
Build SCREEN 18: Create/Edit Course

Route: /admin/cursos/[id]/editar
Component name: EditCoursePage

LAYOUT: 
Mobile: single column with floating save button
Desktop: 70/30 split — form left, publish panel right (sticky)

LEFT — FORM (4 sections, each a card):

Card 1: "Informações Básicas"
  - "Título do curso" input (pre-filled: "Doces Americanos para Vender")
  - "Subtítulo" input
  - "Descrição" textarea 4 rows with basic formatting hint "(suporta Markdown)"
  - "Categoria" select: "Confeitaria | Panificação | Culinária | Bebidas"

Card 2: "Mídia"
  - Thumbnail upload: dashed border rectangle 16:9, "Arraste uma imagem ou clique para enviar", "JPG, PNG até 2MB" text-xs
  - If uploaded: show thumbnail preview with "Substituir" button overlay

Card 3: "Precificação"
  - "Preço ($)" number input (pre-filled "197")
  - Toggle: "Parcelamento" — when on shows: "Número de parcelas" select (2x, 3x, 6x, 12x)
  - Preview: "6x de $32,83 sem juros"

Card 4: "Configurações"
  - "URL do curso (slug)" input with prefix "/cursos/" pre-filled "doces-americanos"
  - "Descrição SEO" textarea 2 rows

RIGHT — PUBLISH PANEL (sticky card):
  Status: "Rascunho" grey badge
  "Visibilidade: Privado" — toggle
  Separator
  "Visualizar página de vendas →" link text-sm text-[#C4632A]
  Primary button full-width: "Publicar curso"
  Small text: "Após publicar, alunos poderão se matricular"
  Separator
  "Arquivar curso" text-sm text-[#DC2626] text-center link
```

---

**TELA 19 — Gerenciar Conteúdo (Módulos e Aulas)**
```
Build SCREEN 19: Module & Lesson Manager

Route: /admin/cursos/[id]/conteudo
Component name: CourseContentManager

LAYOUT:
Mobile: accordion-style, full width
Desktop: 2-panel layout — module list left (40%), lesson editor right (60%)

LEFT PANEL — "Conteúdo do Curso":
Header: "Conteúdo" + "+ Módulo" outline button small

Module list (3 modules):
Each module item (card mb-2):
  Drag handle (⠿) + "Módulo 1 — Bases da Confeitaria" (inline editable, click to edit) + "10 aulas" badge + expand chevron + "⋮" menu
  When expanded:
    Lesson items (draggable):
      Drag handle + lesson number + title (inline editable) + duration badge + "🎥" video icon (green if uploaded, grey if not) + "⋮" menu
    "+ Adicionar aula" button ghost, dashed border

RIGHT PANEL — "Editor de Aula" (shown when lesson selected):
Selected: "Módulo 1 — Aula 3: Técnicas Básicas"

  "Título da aula" input (pre-filled)
  
  Toggle: "Aula de preview gratuito" — off
  
  VIDEO UPLOAD ZONE:
    State A (empty): dashed border rectangle, cloud upload icon, "Arraste o vídeo ou clique para enviar", "MP4, MOV até 5GB" text-xs, "Powered by Bunny Stream" text-xs text-[#8F8F8F]
    State B (uploading): progress bar #C4632A fill, "brigadeiroGourmet.mp4 — 67% enviado", "Cancelar" link
    State C (uploaded): thumbnail preview left + "brigadeiroGourmet.mp4 / 18:45 / 1.2GB" + "Substituir vídeo" link text-[#C4632A]
  
  "Descrição" textarea 3 rows
  
  MATERIALS section:
    "+ Adicionar material" button outline small
    Uploaded: "Receita-Brigadeiro.pdf" + X remove button
  
  Save button: "Salvar aula" primary full-width
```

---

**TELA 20 — Gestão de Alunos**
```
Build SCREEN 20: Students Manager

Route: /admin/alunos
Component name: StudentsManagerPage

SEARCH + FILTERS bar:
  Search input: "Buscar por nome ou email..." with search icon
  Filter buttons: "Todos os cursos ▾" | "Todos os status ▾"
  Right: "Exportar CSV" outline small

TABLE (responsive):
Headers: Aluna | Curso | Matrícula | Progresso | Status | Receita | Ações

5 rows:
  Row: [avatar AL + "Ana Lima\nana@email.com"] | "Doces Americanos" | "15 jan 2026" | [progress bar 67% + "67%"] | green "Ativo" | "$197" | "Ver" link
  Rows 2-5 with different data, one with "Concluído" blue badge, one "Cancelado" red

PAGINATION: "1-5 de 847 alunas" + prev/next buttons

STUDENT DETAIL DRAWER (slide from right, 400px):
  Header: avatar 56px + "Ana Lima" + "ana@email.com" + close X
  Section "Cursos matriculados": course list with progress
  Section "Pagamentos": table with date, amount, status
  Section "Atividade recente": timeline of last 5 actions
  Button "Revogar acesso" destructive outline at bottom
```

---

**TELA 21 — Analytics**
```
Build SCREEN 21: Analytics Page

Route: /admin/analytics
Component name: AnalyticsPage

HEADER: "Analytics" H1 + date range picker: "Últimos 30 dias ▾"

4 summary KPI cards (same style as dashboard but smaller)

CHARTS:
Card 1: "Receita Mensal" — Area chart (SVG), 12 months, area fill #C4632A/10, line #C4632A
Card 2: "Funil de Vendas" — Horizontal bars:
  "Visitantes da página de vendas: 1.240" (full width)
  "Iniciaram checkout: 312" (25% width)
  "Compraram: 43" (3.5% width)
  Each bar shows percentage label
Card 3: "Cursos por Receita" — Horizontal bar chart, 3 courses
Card 4: "Conclusão por Módulo" — Heatmap grid (5 modules × 4 weeks), cells colored by completion % from white to #C4632A
```

---

**TELA 22 — Cupons**
```
Build SCREEN 22: Coupons Page

Route: /admin/cupons
Component name: CouponsPage

Header: "Cupons de Desconto" H1 + "+ Novo Cupom" primary button

TABLE:
Headers: Código | Tipo | Desconto | Uso | Validade | Status | Ações
3 rows:
  "BEMVINDA50" | "%" | "50%" | "23/50" | "30 abr 2026" | "Ativo" green | Edit/Delete
  "FRETE10" | "Fixo" | "$10" | "5/∞" | "Sem validade" | "Ativo" green | Edit/Delete
  "LANCAMENTO" | "%" | "30%" | "47/47" | "01 mar 2026" | "Expirado" grey | Reativar

CREATE COUPON MODAL (Dialog):
  Header: "Novo Cupom" + X button
  Form:
    "Código" input + "Gerar automaticamente" button outline small (generates random code)
    "Tipo de desconto": radio "Percentual (%)" | "Valor fixo ($)"
    "Valor" number input + unit suffix (% or $)
    "Limite de usos": toggle "Ilimitado" — when off shows number input
    "Data de expiração": date input — toggle "Sem validade"
    "Aplicar a": multi-select checkboxes of courses
  Footer: Cancel + "Criar cupom" primary
```

---

**TELA 23 — Configurações Admin**
```
Build SCREEN 23: Admin Settings

Route: /admin/configuracoes
Component name: AdminSettingsPage

TABS: "Plataforma" | "Pagamentos" | "Email" | "Domínio"

PLATAFORMA tab:
  "Identidade da plataforma" section:
    "Nome da plataforma" input (pre-filled "Escola da Chef Ana")
    "Logotipo" upload zone (square 200px preview area)
    "Favicon" upload zone (square 32px preview)
    "Cor principal" — color swatch (#C4632A) + "Alterar" opens native color picker
    "Descrição curta" textarea
  Button: "Salvar configurações"

PAGAMENTOS tab:
  Stripe connection card:
    Stripe logo + "Stripe" text
    Green badge "Conectado"
    Account: "ana.lima@email.com"
    "Gerenciar conta Stripe →" link
    "Desconectar" destructive link small
  Payout info: "Repasses automáticos toda segunda-feira"

EMAIL tab:
  "Email de remetente" input (pre-filled "naoresponda@escoladachefana.com")
  "Nome do remetente" input
  Test email: input + "Enviar teste" button
  Email templates list: "Boas-vindas", "Confirmação de compra", "Recuperação de senha" — each with "Editar" link

DOMÍNIO tab:
  "Domínio personalizado" input placeholder "seudominio.com.br"
  Status indicator: checking/connected/error
  DNS instructions (expandable): table with Type, Name, Value for DNS records
  "Verificar domínio" button
```

---

After building all 23 screens, provide a summary of all component names exported, ready to reference.
```

---

## Como passar o design do Claude Design para o Copilot

O Claude Design gera **artifacts React** diretamente — o formato mais fácil de replicar:

**Opção 1 — Arquivo de referência:**
```
1. Gere a tela no Claude Design
2. Copie o código do artifact
3. Cole em: apps/web/src/ui-reference/[nome-da-tela].tsx
4. Diga ao Copilot: "Implemente a tela /dashboard seguindo exatamente o componente em ui-reference/student-dashboard.tsx — substitua os dados mockados pela integração real"
```

**Opção 2 — Compartilhar link do artifact:**
```
Se usar claude.ai com artefatos publicados:
→ Compartilhe o link do artifact com o Copilot
→ "Replique este design: [link] — adapte para nossa stack com dados reais"
```

**O Copilot vai:**
- Manter o layout, cores e componentes exatos
- Substituir dados mockados por hooks TanStack Query reais
- Conectar ao backend Fastify via API client
- Adicionar o `@mux/mux-player-react` no player de vídeo (tela 08)
- Integrar o Stripe Elements no checkout (tela 12)
- Garantir PT-BR em todos os textos

---

## PROMPT PRINCIPAL — v0.dev

> Cole este prompt no [v0.dev](https://v0.dev) e itere por conversa até todas as telas estarem corretas. Depois compartilhe a URL pública do projeto com o Copilot.

---

````
You are designing a complete online course platform called YBR Platform. Build every screen listed below as a cohesive design system using React, TypeScript, Shadcn/UI, and TailwindCSS.

---

## DESIGN SYSTEM — Apply to ALL screens

### Colors (use as CSS variables — add to globals.css)
```css
:root {
  --primary: 25 72% 47%;           /* #C4632A terracotta */
  --primary-foreground: 43 100% 97%;
  --background: 36 67% 96%;        /* #F9F3EC warm cream */
  --foreground: 0 0% 11%;          /* #1C1C1C charcoal */
  --card: 0 0% 100%;
  --card-foreground: 0 0% 11%;
  --muted: 36 40% 94%;
  --muted-foreground: 0 0% 35%;
  --border: 30 30% 87%;            /* #E8E0D9 warm border */
  --accent: 42 52% 54%;            /* #C9A84C gold */
  --destructive: 0 84% 60%;
  --radius: 0.75rem;
}
````

### Typography

- Headings: "DM Serif Display", Georgia, serif
- Body: "Inter", system-ui, sans-serif
- All UI text and labels MUST be in Portuguese (pt-BR)

### Component rules

- All buttons: rounded-full, min-height 48px, primary = bg-[#C4632A] text-white
- Cards: bg-white rounded-xl border border-[#E8E0D9] shadow-sm
- Inputs: rounded-lg border-[#E8E0D9] h-11 focus:ring-[#C4632A]
- Bottom nav (mobile): fixed bottom-0, white, border-top, 5 icons
- Progress bars: bg-[#C4632A] fill on bg-[#E8E0D9] track
- Badges: bg-[#C9A84C]/10 text-[#C9A84C] for gold; bg-[#C4632A]/10 text-[#C4632A] for primary

---

## SCREENS TO BUILD

Build each screen as a separate component. Use realistic pt-BR placeholder content (not "Lorem Ipsum"). The platform sells confectionery (confeitaria) courses to Brazilian women in the US.

---

### SCREEN 01 — Login Page

Route: /login

Layout: Centered card on cream background, max-w-sm
Content:

- Logo at top center: circular icon + "YBR" text in DM Serif
- H1: "Bem-vinda de volta"
- Subtitle: "Entre na sua conta para continuar aprendendo"
- Form: Email input ("seu@email.com"), Password input with show/hide toggle
- "Esqueceu sua senha?" link right-aligned
- Primary button full-width: "Entrar"
- Divider: "ou continue com"
- Google button outline full-width: Google icon + "Entrar com Google"
- Footer: "Não tem conta? Crie gratuitamente →" link
- Trust: small padlock icon + "Conexão segura SSL"

---

### SCREEN 02 — Register Page

Route: /cadastro

Layout: Centered card, max-w-sm
Content:

- Logo
- H1: "Crie sua conta"
- Subtitle: "Junte-se a mais de 800 alunas"
- Form: Name ("Seu nome completo"), Email, Password (with strength indicator), Confirm password
- Checkbox: "Concordo com os Termos de Uso e Política de Privacidade"
- Primary button: "Criar conta gratuita"
- Divider + Google button
- Footer: "Já tem conta? Entrar →"

---

### SCREEN 03 — Forgot Password

Route: /esqueci-senha

Layout: Centered card, max-w-sm
Content:

- Back arrow + Logo
- Envelope icon (large, terracotta)
- H1: "Esqueceu sua senha?"
- Text: "Digite seu email e enviaremos um link para redefinir"
- Email input
- Button: "Enviar link de recuperação"
- "Lembrou? Voltar para o login" link

Show a second state (success) with:

- Checkmark circle icon in green
- H2: "Email enviado!"
- Text: "Verifique sua caixa de entrada em ana@email.com"
- Button outline: "Reenviar email" + countdown "em 45s"

---

### SCREEN 04 — Reset Password

Route: /redefinir-senha

Layout: Centered card, max-w-sm
Content:

- Lock icon
- H1: "Crie uma nova senha"
- New password input with strength meter (weak/medium/strong bar)
- Confirm new password input
- Requirements checklist (8+ chars, uppercase, number)
- Button: "Salvar nova senha"

---

### SCREEN 05 — Student Dashboard (Home)

Route: /dashboard
Mobile-first (390px) then responsive tablet/desktop

Layout mobile:

- Status bar area
- Header: Avatar (32px circle) left, "Olá, Ana! 👋" center, notification bell right
- Search bar: "Buscar aulas..." with search icon

Sections:

1. "Continue de onde parou" — Full-width card with course thumbnail, course title "Doces Americanos para Vender", lesson title "Aula 7 — Brigadeiro Gourmet", progress bar 67%, large PLAY button overlay on thumbnail
2. "Meus Cursos" — Horizontal scroll of 3 cards (show 1.5 on mobile to hint scroll):
   Each card: 160px wide, thumbnail top, course name, circular progress ring bottom-right (42%, 100%, 15%)
3. "Próximas Conquistas" — 2 small cards side by side: milestone badges (locked/unlocked state)
4. "Sua jornada" — Stats row: "12 aulas assistidas", "3h 40min de conteúdo", "1 certificado"

Bottom navigation bar (fixed): Home (active), Cursos, Comunidade, Certificados, Perfil

Desktop sidebar: Logo + nav items vertically. Main content uses remaining space.

---

### SCREEN 06 — My Courses List

Route: /meus-cursos

Layout: Grid 1 col mobile, 2 col tablet, 3 col desktop
Header: "Meus Cursos" H1, filter tabs: "Em andamento | Concluídos | Todos"

Course card (each):

- Thumbnail 16:9 with category badge top-left
- Course title (2 lines max)
- Creator name + avatar small
- Progress bar + "42% concluído"
- "67 aulas • 8h 30min"
- Button: "Continuar" (primary) or "Começar" (outline)

Empty state: Illustration + "Você ainda não está matriculada em nenhum curso" + "Explorar cursos →"

---

### SCREEN 07 — Course Overview Page

Route: /cursos/[slug]

This is the course home inside the student area (not the sales page).

Layout:

- Course hero: Blurred thumbnail background, course title (H1), instructor name, "Matriculada em 15 Jan 2026"
- Progress overview card: large circular progress (42%), "24/57 aulas concluídas", "Conclusão estimada: 3 semanas", "Ver certificado" button (disabled/locked state)
- Tabs: "Conteúdo" | "Materiais" | "Comunidade"

"Conteúdo" tab:

- Accordion of modules. Each module:
  - Module header: "Módulo 1 — Bases da Confeitaria" + progress "4/6 aulas" + expand icon
  - Lesson items inside: checkbox (done/not done), lesson title, duration, lock icon if not enrolled
  - Completed lessons have green checkmark, current = terracotta play icon, locked = grey lock

---

### SCREEN 08 — Video Player / Lesson Page

Route: /aulas/[id]
This is the most important screen — design it with care.

Mobile layout (full-screen-first):

- Video player top: 16:9 ratio, black background, custom controls bar at bottom:
  - Play/pause, scrubber bar (progress in terracotta), current/total time, quality, fullscreen
  - Playback speed (0.75x, 1x, 1.25x, 1.5x) — dropdown
- Below video (scrollable):
  - Breadcrumb: "Doces Americanos > Módulo 3 > Aula 7"
  - Lesson title H2: "Brigadeiro Gourmet — Técnicas de Enrolamento"
  - Duration badge + Completed checkbox toggle
  - 4 tabs: "Aula" (active) | "Material" | "Dúvidas" | "Minhas Notas"
  - "Aula" tab: Description text area
  - Sticky bottom bar: "← Aula anterior" (left) and "Próxima aula →" (right, primary)

Desktop layout:

- Left side (70%): Video + tabs content
- Right sidebar (30%): Lesson list for current module
  - Each lesson: play icon / checkmark, title, duration, active state highlighted in terracotta

Lesson list item states:

- Completed: green checkmark circle + grey text
- Current: terracotta play circle + bold text + terracotta left border
- Not started: empty circle + normal text
- Locked: lock icon + muted text

---

### SCREEN 09 — Materials Tab (inside lesson page)

Show when "Material" tab is active:

Content:

- H3: "Materiais desta aula"
- File cards (2-3 items):
  Each: PDF icon (red), filename "Receita — Brigadeiro Gourmet.pdf", size "1.2 MB", download button
- "Materiais do Módulo" section with same card style

---

### SCREEN 10 — My Notes Tab (inside lesson page)

Show when "Minhas Notas" tab is active:

Content:

- Textarea: "Escreva suas anotações sobre esta aula..." with current timestamp
- Save button: "Salvar nota"
- Previous notes list (newest first): timestamp, note text, edit/delete icons

---

### SCREEN 11 — Sales / Landing Page

Route: /[creator-slug]/[course-slug]
This is a PUBLIC page. Mobile-first.

Sections (in order):

1. HERO
   - Background: cream gradient
   - H1 (large, DM Serif): "Aprenda a Fazer Doces Americanos e Comece a Vender Esta Semana"
   - Subtitle: "O único curso de confeitaria criado especialmente para brasileiras que vivem nos Estados Unidos"
   - Social proof bar: ★★★★★ "847 alunas" • "Framingham, MA" • "Somerville" • "Everett" • "Orlando, FL"
   - CTA button large: "QUERO COMEÇAR AGORA →"
   - Below button: "ou 6x de $37 • Garantia de 15 dias"
   - Video thumbnail with PLAY button overlay (course preview)

2. PROOF BAR (logos/icons row)
   - 3 icons: "100% Online", "Certificado incluído", "Suporte em Português"

3. FOR WHOM
   - H2: "Este curso é para você que..."
   - 4 cards with check icon: "Quer começar a vender doces de casa", "Está nos EUA há pouco tempo", "Não sabe usar ingredientes americanos", "Quer uma renda extra em dólar"

4. WHAT YOU'LL LEARN
   - H2: "O que você vai aprender"
   - 2-column grid of 8 items with checkmark icon

5. COURSE CONTENT
   - H2: "Conteúdo do Curso"
   - Summary: "5 módulos • 57 aulas • 8h 30min de conteúdo"
   - Accordion of modules (collapsed by default, first one open):
     "Módulo 1 — Bases da Confeitaria Americana (10 aulas)"
     "Módulo 2 — Doces Clássicos para Vender (12 aulas)"
     etc.

6. INSTRUCTOR
   - Circular photo (120px)
   - Name: "Chef Ana Lima"
   - Bio: 3-4 lines about credentials
   - Stats: "12 anos de experiência • 1.200+ alunas formadas"

7. TESTIMONIALS
   - H2: "O que nossas alunas dizem"
   - 3 cards (vertical on mobile, horizontal on desktop):
     Each: ★★★★★, quote text, name, city ("Maria S., Framingham MA"), result bold ("Faturei $1.200 no primeiro mês")
   - "Ver mais depoimentos" expandable

8. PRICING
   - H2: "Invista na sua transformação"
   - Pricing box centered (max-w-md, border-2 border-[#C4632A], rounded-2xl):
     - "Mais popular" badge
     - ~~$297~~ crossed
     - "$197" large primary
     - "ou 6x de $37 sem juros"
     - Feature list with checkmarks (6 items)
     - CTA button full-width: "QUERO COMEÇAR AGORA →"
     - "🔒 Pagamento 100% seguro • Stripe • SSL"
     - "Garantia de 15 dias — dinheiro de volta sem perguntas"

9. FAQ
   - H2: "Perguntas Frequentes"
   - Accordion of 5 FAQ items

10. FOOTER CTA
    - H2: "Comece hoje mesmo"
    - Repeated CTA button

---

### SCREEN 12 — Checkout Page

Route: /checkout/[courseId]

Layout: 2 columns on desktop (left: form, right: order summary), single column on mobile (summary first, then form)

LEFT — Payment form:

- H2: "Finalizar Compra"
- Payment toggle: "À vista — $197" | "6x de $37" (segmented control)
- Card form (Stripe Elements style):
  - "Número do cartão" input with card type icon detection
  - Row: "Validade (MM/AA)" | "CVV"
  - "Nome no cartão" input
- Billing: "Email de acesso" input
- Terms checkbox: "Li e aceito os Termos de Uso"
- Submit button: "FINALIZAR COMPRA — $197"
- Payment methods icons row: Visa, Mastercard, Amex, Apple Pay, Google Pay

RIGHT — Order summary:

- Course thumbnail (80px)
- Course title
- "1 item"
- Subtotal: $197.00
- Divider
- Total: $197.00 (or "6x de $37.00")
- "🔒 Compra 100% segura"
- "15 dias de garantia"
- "Acesso imediato após pagamento"

---

### SCREEN 13 — Order Confirmation

Route: /checkout/confirmacao

Layout: Centered, max-w-lg

Content:

- Success animation area: green circle with checkmark (large)
- H1: "Compra confirmada! 🎉"
- Subtitle: "Bem-vinda ao curso, Ana!"
- Summary card: Course name, amount paid, "Acesso ativo"
- "Um email de confirmação foi enviado para ana@email.com"
- Primary button: "Acessar o curso agora →"
- Secondary: "Ir para o dashboard"

---

### SCREEN 14 — Certificate Page

Route: /certificados/[id]

Two views:

1. Certificate view (student's):
   - Certificate visual (landscape card): cream background, ornamental border in gold, logo, "Certificamos que [Nome da Aluna] concluiu com êxito o curso [Nome do Curso]", signature line, date
   - Below: "Compartilhar" button (LinkedIn, WhatsApp), "Baixar PDF" button
   - Verification URL displayed: "ybr.app/verificar/ABC123"

2. Public verification page (/verificar/[code]):
   - Reduced certificate preview
   - "✓ Certificado válido" in green
   - Aluno name, course, date, issuer

---

### SCREEN 15 — Profile & Settings

Route: /perfil

Layout: Sidebar nav (desktop) or tabs (mobile)

Sections:

- "Minha Conta": Avatar upload, name, email (read-only), phone
- "Segurança": Change password form, active sessions list
- "Notificações": Toggle switches for email notifications
- "Meus Certificados": List of earned certificates with download link

---

### SCREEN 16 — Creator Admin Dashboard

Route: /admin
Sidebar navigation, clean/professional (less warm than student area, more business-like but same colors)

Top KPI cards row:

- Total Alunos: "847" + trend +12%
- Receita do Mês: "$3.840" + trend +8%
- Taxa de Conclusão: "64%" + trend
- Novas Matrículas (30d): "43"

Revenue chart: Line chart, last 30 days, terracotta line color

Recent students table:

- Columns: Avatar+Name, Course, Enrolled date, Progress, Status (active/completed/cancelled)
- Pagination

Quick actions row: "Adicionar Aula" | "Ver Relatório" | "Criar Cupom" | "Editar Curso"

---

### SCREEN 17 — Admin Courses List

Route: /admin/cursos

Header: "Meus Cursos" + "Novo Curso →" button

Course management cards:
Each card: thumbnail, title, publish status badge (Publicado / Rascunho), "47 alunos", "64% conclusão", "R$ 3.840 receita", action buttons: "Editar" | "Ver Página" | "⋮ mais"

---

### SCREEN 18 — Create/Edit Course

Route: /admin/cursos/[id]/editar

Left: Form (70%), Right: Preview/publish panel (30%)

Form sections (stepped accordion or vertical):

1. "Informações Básicas": Title, subtitle, description (rich text), category
2. "Mídia": Thumbnail upload (drag-drop), Intro video URL
3. "Precificação": Price ($), toggle "Parcelamento", number of installments
4. "Configurações": Slug (auto-generated, editable), SEO description

Publish panel:

- Status: "Rascunho"
- "Visualizar página de vendas →"
- Primary button: "Publicar curso"
- Danger: "Arquivar curso"

---

### SCREEN 19 — Module & Lesson Manager

Route: /admin/cursos/[id]/conteudo

Drag-and-drop course builder:

- Left: Module list (draggable). Each module:
  - Module name editable inline
  - Lesson count
  - Expand to show lessons (each draggable)
  - "Add lesson" button at bottom of each module
- Right: Selected lesson editor:
  - Lesson title input
  - "Vídeo da aula" — upload zone with Bunny/Mux upload progress
  - Video preview after upload (thumbnail + duration)
  - Free preview toggle
  - Description textarea
  - File attachments (PDF materials)
  - Save button

Upload state: Progress bar with percentage, file name, cancel button
Uploaded state: Video thumbnail, duration, "Substituir vídeo" link

---

### SCREEN 20 — Students Manager

Route: /admin/alunos

Search + filters: search by name/email, filter by course, filter by status

Students table:

- Avatar + name + email
- Enrolled course(s) tags
- Enrollment date
- Progress (progress bar)
- Status badge
- Revenue (amount paid)
- Actions: "Ver detalhes" | "Revogar acesso"

Student detail modal/drawer:

- Full profile, all enrolled courses, payment history, activity log

---

### SCREEN 21 — Analytics Page

Route: /admin/analytics

Metrics:

- Revenue over time: Area chart (monthly, 12 months)
- Enrollment funnel: Bar chart (visitors → started checkout → completed)
- Top courses by revenue: Horizontal bar
- Student completion rate by module: Heatmap-style

Filters: Date range picker, course selector

---

### SCREEN 22 — Coupons Page

Route: /admin/cupons

Header: "Cupons de Desconto" + "Novo Cupom" button

Coupons table: Code, Type (% / fixed), Value, Usage (12/50), Expiry, Status, Actions

Create coupon modal:

- Code input (auto-generate button)
- Discount type: Percentage | Fixed amount
- Value input
- Usage limit (unlimited toggle)
- Expiry date picker
- Applicable courses (multi-select)
- Create button

---

### SCREEN 23 — Admin Settings

Route: /admin/configuracoes

Tabs: "Plataforma" | "Pagamentos" | "Email" | "Domínio"

"Plataforma" tab:

- Platform name input
- Logo upload
- Favicon upload
- Primary color picker (default terracotta)
- Custom domain input

"Pagamentos" tab:

- Stripe connected status badge (green)
- "Gerenciar conta Stripe →" button
- Payout schedule info

---

## GENERAL RULES FOR ALL SCREENS

1. Always show realistic pt-BR content — no "Lorem Ipsum"
2. All navigation in Portuguese
3. Use Lucide icons throughout (consistent 20px stroke icons)
4. Every screen has loading skeleton state AND empty state
5. Mobile screens: 390×844 (iPhone 15). Desktop: 1440×900
6. Consistent spacing: 16px mobile gutters, 24px desktop
7. Toast notifications style: bottom-right, rounded-xl, terracotta for success
8. Error states: red border on inputs, error message below, no popup
9. All modals: centered, backdrop blur, max-w-lg, close button top-right

Start with Screen 01 (Login) and Screen 05 (Student Dashboard). Then build the remaining screens. Keep all components in a shared design system so colors, typography, and spacing are consistent across all 23 screens.

````

---

## Como passar o design gerado para o Copilot

Após gerar e iterar no v0.dev:

1. **Copiar a URL do projeto** — No v0.dev, cada projeto tem uma URL pública tipo `v0.dev/chat/abc123`
2. **Compartilhar com o Copilot** assim: *"Replique este design: v0.dev/chat/abc123 — página [X]"*
3. O Copilot vai ler o código gerado e adaptar para o projeto real (com Mux player, Stripe real, etc.)

**Alternativa — exportar tokens:**
- No v0.dev, faça "Export" → baixa os componentes como `.tsx` files
- Cole os arquivos em `apps/web/src/components/ui-generated/` como referência
- O Copilot usa como base e substitui os dados mockados por integrações reais

---

## Design Tokens — globals.css (usar no projeto real)

```css
@import url('https://fonts.googleapis.com/css2?family=DM+Serif+Display:ital@0;1&family=Inter:wght@400;500;600&display=swap');

@tailwind base;
@tailwind components;
@tailwind utilities;

@layer base {
  :root {
    /* Primárias */
    --color-primary: #C4632A;
    --color-primary-light: #D4834A;
    --color-primary-dark: #A3521F;

    /* Fundo */
    --color-bg: #F9F3EC;
    --color-surface: #FFFFFF;
    --color-surface-2: #FDF8F4;

    /* Texto */
    --color-text: #1C1C1C;
    --color-text-secondary: #5A5A5A;
    --color-text-muted: #8F8F8F;

    /* Acento */
    --color-gold: #C9A84C;
    --color-rose: #E8B4A2;

    /* Sistema */
    --color-success: #2E7D52;
    --color-warning: #B45309;
    --color-error: #DC2626;

    /* Bordas */
    --color-border: #E8E0D9;
    --color-border-light: #F2EDE8;
  }

  body {
    background-color: var(--color-bg);
    color: var(--color-text);
    font-family: 'Inter', system-ui, sans-serif;
  }

  h1, h2, h3, h4 {
    font-family: 'DM Serif Display', Georgia, serif;
  }
}
````

---

## tailwind.config.ts — Extensões necessárias

```typescript
import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: "#C4632A",
          light: "#D4834A",
          dark: "#A3521F",
          foreground: "#FFFFFF",
        },
        brand: {
          bg: "#F9F3EC",
          surface: "#FFFFFF",
          "surface-2": "#FDF8F4",
          text: "#1C1C1C",
          "text-secondary": "#5A5A5A",
          "text-muted": "#8F8F8F",
          gold: "#C9A84C",
          rose: "#E8B4A2",
          border: "#E8E0D9",
          "border-light": "#F2EDE8",
        },
        success: "#2E7D52",
      },
      fontFamily: {
        serif: ['"DM Serif Display"', "Georgia", "serif"],
        sans: ["Inter", "system-ui", "sans-serif"],
      },
      borderRadius: {
        card: "12px",
        input: "8px",
        button: "24px",
      },
      boxShadow: {
        card: "0 1px 3px rgba(196, 99, 42, 0.08), 0 1px 2px rgba(0,0,0,0.04)",
        "card-hover": "0 4px 12px rgba(196, 99, 42, 0.12)",
      },
    },
  },
  plugins: [],
};

export default config;
```

---

## Mapa de Rotas → Componentes

| Tela               | Rota                          | App   | Prioridade |
| ------------------ | ----------------------------- | ----- | ---------- |
| Login              | `/login`                      | web   | MVP        |
| Cadastro           | `/cadastro`                   | web   | MVP        |
| Esqueci senha      | `/esqueci-senha`              | web   | MVP        |
| Redefinir senha    | `/redefinir-senha`            | web   | MVP        |
| Dashboard aluno    | `/dashboard`                  | web   | MVP ⭐     |
| Meus cursos        | `/meus-cursos`                | web   | MVP        |
| Visão do curso     | `/cursos/[slug]`              | web   | MVP        |
| Player de aula     | `/aulas/[id]`                 | web   | MVP ⭐     |
| Landing page       | `/[creator]/[course]`         | web   | MVP ⭐     |
| Checkout           | `/checkout/[id]`              | web   | MVP ⭐     |
| Confirmação        | `/checkout/confirmacao`       | web   | MVP        |
| Certificado        | `/certificados/[id]`          | web   | MVP        |
| Verificar cert.    | `/verificar/[code]`           | web   | MVP        |
| Perfil             | `/perfil`                     | web   | Fase 1     |
| Admin dashboard    | `/admin`                      | admin | MVP ⭐     |
| Admin cursos       | `/admin/cursos`               | admin | MVP        |
| Criar/editar curso | `/admin/cursos/[id]/editar`   | admin | MVP        |
| Gerenciar conteúdo | `/admin/cursos/[id]/conteudo` | admin | MVP ⭐     |
| Alunos             | `/admin/alunos`               | admin | Fase 1     |
| Analytics          | `/admin/analytics`            | admin | Fase 2     |
| Cupons             | `/admin/cupons`               | admin | Fase 1     |
| Configurações      | `/admin/configuracoes`        | admin | Fase 1     |

---

## Prompt Simplificado (Para Midjourney / referência visual)

```
UI screenshot of a warm, elegant online course platform.
Terracotta #C4632A and cream #F9F3EC color palette.
Student dashboard showing video course cards with circular progress rings.
Portuguese language (pt-BR) interface labels.
Mobile-first iPhone 15 screen (390px).
DM Serif Display headings, Inter body text.
Minimalist luxury feminine aesthetic for Brazilian women.
Shadcn/UI components, TailwindCSS, clean card grid.
4K, Figma-style UI mockup, high detail.
```
