# QA Test Checklist — YBR Platform

**Versão:** Sprint 3 (Fase 1 MVP completa)
**Data de criação:** 2026-04-27
**Última atualização:** 2026-04-30

> Este documento é para **testes manuais como usuário final**. Nenhum conhecimento técnico é necessário — basta seguir os passos e marcar o resultado.
>
> ⚠️ **Reinício completo:** todos os itens anteriores foram redefinidos. Teste tudo do zero.

---

## URLs dos Ambientes

- **Portal do Aluno:** `http://localhost:3000`
- **Painel do Criador:** `http://localhost:3001`
- **API / Swagger:** `http://localhost:3002/docs`

> **Pré-requisito:** O ambiente de desenvolvimento deve estar rodando (`pnpm dev` na pasta `platform/`).

---

## Contas necessárias para os testes

> Crie essas contas antes de iniciar os módulos que as exigem.

| Conta            | Como criar                                                                           | Role    |
| ---------------- | ------------------------------------------------------------------------------------ | ------- |
| Aluno de teste   | Formulário de cadastro em `http://localhost:3000/pt-BR/register`                    | student |
| Criador de teste | Swagger `POST /ybr-admin/creators` (requer conta admin) ou direto no banco           | creator |
| Admin            | Inserção direta no banco (campo `role = 'admin'` na tabela `users`)                 | admin   |

---

## MÓDULO 1 — Autenticação — Portal do Aluno

> **URL base:** `http://localhost:3000`

### 1.1 — Cadastro com e-mail e senha

- [ ] Acesse `http://localhost:3000/pt-BR/register` → Página carrega sem erro
- [ ] Preencha nome, e-mail e senha (mín. 8 caracteres) e clique em "Criar conta" → Redireciona para o dashboard ou exibe mensagem de sucesso
- [ ] Tente cadastrar com o mesmo e-mail novamente → Exibe mensagem de erro "e-mail já cadastrado"
- [ ] Tente cadastrar com senha de 3 caracteres → Exibe validação antes de enviar
- [ ] Tente cadastrar com e-mail inválido (ex: `teste@`) → Exibe mensagem de validação de e-mail
- [ ] Submeta o formulário completamente vazio → Mensagens de erro aparecem em todos os campos obrigatórios

---

### 1.2 — Login com e-mail e senha

- [ ] Acesse `http://localhost:3000/pt-BR/login` → Página carrega sem erro
- [ ] Faça login com e-mail e senha válidos → Redireciona para `/pt-BR/dashboard`
- [ ] Verifique que o nome do usuário aparece na tela após o login
- [ ] Tente fazer login com senha incorreta → Mensagem de erro "credenciais inválidas"
- [ ] Tente fazer login com e-mail não cadastrado → Mensagem de erro adequada
- [ ] Submeta o formulário vazio → Validação aparece nos campos

---

### 1.3 — Login com Google OAuth

> ⚠️ **Pré-requisito:** `GOOGLE_CLIENT_ID` e `GOOGLE_CLIENT_SECRET` configurados no `.env.local`.
> Pule este bloco se as credenciais Google não estiverem configuradas no ambiente.

- [ ] Na página de login, clique no botão "Entrar com Google" → Redireciona para a tela de consentimento do Google
- [ ] Selecione ou faça login com uma conta Google → Redireciona de volta ao portal
- [ ] Após o callback, é redirecionado para `/pt-BR/dashboard` com sessão ativa
- [ ] Na página de cadastro, clique em "Cadastrar com Google" → Mesmo fluxo; conta criada com a role `student`
- [ ] Cancele a permissão na tela do Google em vez de aceitar → Retorna para `/pt-BR/login` com mensagem de erro

---

### 1.4 — Recuperação de senha

- [ ] Acesse `http://localhost:3000/pt-BR/forgot-password` → Página carrega sem erro
- [ ] Informe um e-mail cadastrado e clique em "Enviar e-mail de recuperação" → Mensagem de confirmação aparece (sem revelar se o e-mail existe)
- [ ] Informe um e-mail não cadastrado → Mesmo comportamento visual (não revela ausência do e-mail — segurança)
- [ ] Informe um e-mail inválido → Validação do campo antes de enviar

---

### 1.5 — Redefinição de senha

> **Pré-requisito:** Receber o e-mail de recuperação com o link de redefinição.

- [ ] Acesse o link recebido no e-mail → Página "Redefinir senha" carrega
- [ ] Digite nova senha e confirmação iguais → Senha redefinida com sucesso, redireciona para login
- [ ] Tente usar o mesmo link de redefinição novamente → Mensagem de erro "token inválido ou expirado"
- [ ] Tente enviar senhas diferentes → Validação aparece antes de enviar

---

### 1.6 — Proteção de rotas (Portal do Aluno)

- [ ] Sem estar logado, acesse `http://localhost:3000/pt-BR/dashboard` → Redireciona para `/pt-BR/login`
- [ ] Sem estar logado, acesse `http://localhost:3000/pt-BR/meus-cursos` → Redireciona para `/pt-BR/login`
- [ ] Faça login e acesse `/pt-BR/login` novamente → Redireciona para o dashboard (não exibe o login novamente)

---

## MÓDULO 2 — Autenticação — Painel do Criador

> **URL base:** `http://localhost:3001`

### 2.1 — Login e redirecionamento por papel

- [ ] Acesse `http://localhost:3001/pt-BR/login` → Página carrega com o visual correto
- [ ] Tente fazer login com conta de **aluno** (role: student) → Exibe erro "acesso negado"
- [ ] Faça login com conta de **criador** → Redireciona para `/pt-BR/cursos` (painel de cursos)
- [ ] Faça login com conta de **admin** → Redireciona para `/pt-BR/ybr-admin/criadores` (painel de administração)
- [ ] Sem estar logado, acesse `http://localhost:3001/pt-BR/cursos` → Redireciona para `/pt-BR/login`

---

## MÓDULO 3 — Dashboard e Sidebar do Criador

> **Pré-requisito:** Logado como criador em `http://localhost:3001`

- [ ] Acesse o dashboard após login → Página carrega sem erro
- [ ] Sidebar visível com links para: **Dashboard**, **Cursos**, **Alunas**, **Analytics**
- [ ] Clique em "Cursos" na sidebar → Navega para gestão de cursos
- [ ] Visual geral → Fundo warm stone, tipografia Inter, cor primária nos botões de ação
- [ ] Reduza a janela do navegador → Layout não quebra

---

## MÓDULO 4 — Gestão de Cursos (Criador)

> **URL:** `http://localhost:3001/pt-BR/cursos`

### 4.1 — Listagem

- [ ] Acesse a página de cursos → Carrega sem erro
- [ ] Estado vazio → Mensagem amigável quando não há cursos, sem mensagem de erro técnico
- [ ] Botão "Novo curso" → Visível e clicável

---

### 4.2 — Criar novo curso

- [ ] Clique em "Novo curso" → Formulário de criação abre
- [ ] Salve com apenas o título preenchido → Deve aceitar (descrição e thumbnail são opcionais)
- [ ] Tente salvar com formulário completamente vazio → Validação aparece no campo título
- [ ] Preencha título, descrição e idioma → Curso criado com sucesso
- [ ] Após criação, o curso aparece na listagem com status **"Rascunho"**
- [ ] Faça upload de imagem de thumbnail (PNG ou JPG) → Preview aparece antes de salvar
- [ ] Crie curso com mesmo título de um existente → Deve permitir (títulos não precisam ser únicos)

---

### 4.3 — Editar curso

- [ ] Clique em "Editar" em um curso existente → Formulário abre com dados pré-preenchidos
- [ ] Altere o título e salve → Título atualizado na listagem
- [ ] Altere a thumbnail → Nova imagem salva corretamente
- [ ] Clique em "Cancelar" sem salvar → Volta para a listagem sem alterar os dados

---

### 4.4 — Publicar / Arquivar curso

- [ ] Encontre curso com status "Rascunho" → Badge de status visível
- [ ] Clique em "Publicar" → Status muda para **"Publicado"** sem recarregar a página
- [ ] Clique em "Arquivar" em um curso publicado → Status muda para **"Arquivado"**
- [ ] Badges têm cores diferentes → Rascunho (cinza), Publicado (verde/dourado), Arquivado (neutro)

---

## MÓDULO 5 — Editor de Conteúdo (Criador)

> **URL:** `http://localhost:3001/pt-BR/cursos/[id-do-curso]/conteudo`

### 5.1 — Módulos

- [ ] Acesse o editor de conteúdo de um curso → Interface de edição carrega
- [ ] Clique em "Adicionar módulo" → Campo para criar módulo aparece
- [ ] Crie dois módulos com títulos distintos → Ambos visíveis na ordem correta
- [ ] Clique em ↑ no segundo módulo → Sobe para a primeira posição
- [ ] Clique em ↓ no primeiro módulo → Desce para a segunda posição
- [ ] Edite o título de um módulo → Título atualizado sem recarregar
- [ ] Delete um módulo → Confirmação solicitada antes de remover; módulo removido após confirmar

---

### 5.2 — Aulas

- [ ] Dentro de um módulo, clique em "Adicionar aula" → Formulário de nova aula aparece
- [ ] Crie duas aulas no mesmo módulo → Ambas visíveis na lista
- [ ] Reordene com ↑ e ↓ → Ordem atualizada corretamente
- [ ] Edite o título de uma aula → Título atualizado
- [ ] Delete uma aula → Confirmação solicitada; aula removida após confirmar
- [ ] Crie aulas em módulos diferentes → Cada módulo exibe apenas suas próprias aulas

---

### 5.3 — Upload de vídeo da aula

> Selecione uma aula no editor para ver o painel de edição à direita.

- [ ] Com aula selecionada, clique na zona de vídeo → Seletor de arquivo abre
- [ ] Selecione um arquivo MP4 → Barra de progresso aparece com percentual
- [ ] Upload concluído → Player de vídeo real aparece no lugar da barra de progresso
- [ ] Botões "Substituir vídeo" e "Remover vídeo" visíveis abaixo do player
- [ ] Clique em "Remover vídeo" → Dialog de confirmação aparece antes de remover
- [ ] Confirme a remoção → Player desaparece, zona de upload volta a aparecer
- [ ] Clique em "Substituir vídeo" → Seletor de arquivo abre para novo vídeo

---

## MÓDULO 6 — Links de Convite (Criador)

> **Pré-requisito:** Logado como criador. Ter ao menos um curso publicado.
> Os links de convite permitem matricular alunos sem passar por pagamento.

### 6.1 — Criar link de convite

- [ ] Acesse `http://localhost:3002/docs` (Swagger) → Encontre `POST /admin/courses/{courseId}/invites`
- [ ] Autentique com o Bearer token do criador (botão "Authorize" no Swagger)
- [ ] Crie um link para um curso publicado com `{ "maxUses": 5 }` → Retorna token e URL de convite
- [ ] Crie um link sem `maxUses` → Deve aceitar (usos ilimitados)
- [ ] Tente criar convite para curso que **não é seu** → Retorna erro 403

---

### 6.2 — Usar link de convite (como aluno)

- [ ] Acesse `http://localhost:3000/pt-BR/invite/[token]` com o token gerado → Página exibe nome do curso e botão para aceitar
- [ ] Clique em aceitar **sem estar logado** → Exibe formulário de cadastro rápido (nome, e-mail, senha)
- [ ] Preencha o formulário e envie → Conta criada e matrícula ativada; redireciona para o curso
- [ ] Acesse o mesmo link logado como aluno **já matriculado** → Mensagem de que já está matriculado (sem erro)
- [ ] Acesse link com token inválido (ex: `abc123`) → Página de erro amigável
- [ ] Se o link tiver `maxUses: 1` e já foi usado → Página exibe erro "convite esgotado"

---

## MÓDULO 7 — Painel YBR Admin

> **Pré-requisito:** Logado como **admin** em `http://localhost:3001`.
> Este painel é exclusivo para a equipe da plataforma — não acessível por criadores ou alunos.

### 7.1 — Listagem de criadores

- [ ] Após login como admin, é redirecionado automaticamente para `/pt-BR/ybr-admin/criadores`
- [ ] Página lista todos os criadores com: nome, e-mail, plano, status (Ativo / Suspenso)
- [ ] Se não houver criadores → Mensagem de estado vazio sem erro técnico

---

### 7.2 — Criar novo criador

- [ ] Clique em "Novo criador" → Formulário abre
- [ ] Preencha nome, e-mail e senha → Conta de criador criada com sucesso e aparece na listagem
- [ ] Tente criar com e-mail já existente → Mensagem de erro

---

### 7.3 — Ativar / Suspender criador

- [ ] Na listagem, localize um criador ativo → Badge "Ativo" visível
- [ ] Clique no botão de suspender → Status muda para **"Suspenso"** sem recarregar a página
- [ ] Clique novamente para reativar → Status volta para "Ativo"
- [ ] Tente fazer login com conta de criador **suspenso** no painel → Acesso negado

---

### 7.4 — Controle de acesso

- [ ] Logado como **criador**, tente acessar `http://localhost:3001/pt-BR/ybr-admin/criadores` → Redireciona para o painel de cursos (acesso negado)
- [ ] Logado como **aluno**, tente acessar a mesma URL → Redireciona para login

---

## MÓDULO 8 — Área do Aluno — Dashboard e Cursos

> **Pré-requisito:** Logado como aluno com ao menos uma matrícula ativa.
>
> **Como criar matrícula para teste:** Use o link de convite do Módulo 6 **ou** via Swagger:
> `POST http://localhost:3002/webhooks/enrollment` com header `x-webhook-secret` definido no `.env.local`

### 8.1 — Dashboard

- [ ] Acesse `http://localhost:3000/pt-BR/dashboard` → Carrega com o nome do usuário logado
- [ ] Se houver curso em andamento → Card "Continue assistindo" aparece com barra de progresso e botão para continuar
- [ ] Se não houver curso → Mensagem de estado vazio aparece (sem erro técnico)
- [ ] Grade de cursos matriculados exibe thumbnails e títulos corretamente
- [ ] Clique em "Ver todos os cursos" → Navega para `/pt-BR/meus-cursos`

---

### 8.2 — Meus Cursos

- [ ] Acesse `http://localhost:3000/pt-BR/meus-cursos` → Página carrega sem erro
- [ ] Cursos matriculados aparecem com thumbnail, título e barra de progresso
- [ ] Clique em um curso → Navega para a visão geral do curso (`/pt-BR/cursos/[slug]`)
- [ ] Se não houver matrículas → Estado vazio exibido com mensagem amigável

---

### 8.3 — Visão geral do curso

- [ ] Acesse `/pt-BR/cursos/[slug]` de um curso matriculado → Carrega com título, módulos e aulas
- [ ] Barra de progresso geral do curso visível
- [ ] Lista de módulos e aulas expansível → Aulas de cada módulo visíveis ao clicar
- [ ] Aulas concluídas têm indicador visual diferente (ícone de check)
- [ ] Botão "Iniciar curso" ou "Continuar" → Redireciona para a primeira aula não concluída
- [ ] Tente acessar `/pt-BR/cursos/[slug]` de curso em que **não está matriculado** → Redireciona para `/pt-BR/meus-cursos`

---

## MÓDULO 9 — Player de Vídeo

> **Pré-requisito:** Matrícula ativa em curso com pelo menos uma aula com vídeo enviado.

### 9.1 — Acesso à aula

- [ ] Acesse `/pt-BR/cursos/[slug]/aulas/[lessonId]` logado → Página da aula carrega sem erro
- [ ] Player de vídeo visível na proporção 16:9
- [ ] Sidebar direita exibe lista de módulos e aulas do curso
- [ ] Aula atual destacada na sidebar (borda ou cor diferente das outras)
- [ ] Tente acessar a aula **sem estar logado** → Redireciona para login
- [ ] Tente acessar a aula logado mas **sem matrícula** → Redireciona para o dashboard (acesso negado)

---

### 9.2 — Funcionalidades do player

- [ ] Clique em "Play" → Vídeo começa a reproduzir
- [ ] Pause e retome → Pausa e retoma corretamente
- [ ] Arraste a barra de progresso para outro ponto → Vídeo pula para o ponto selecionado
- [ ] Aumente e diminua o volume → Volume muda conforme esperado
- [ ] Clique em tela cheia → Vídeo expande para tela cheia
- [ ] Recarregue a página após assistir alguns segundos → Vídeo retoma de onde parou

---

### 9.3 — Progresso e conclusão

- [ ] Assista mais de 10 segundos e recarregue → Progresso salvo; vídeo retoma no mesmo ponto
- [ ] Assista até ≥ 90% do vídeo → Aula marcada como concluída (indicação visual na sidebar)
- [ ] Na sidebar, verifique a aula concluída → Ícone de check diferente das demais
- [ ] Clique em outra aula na sidebar → Navega para a aula selecionada sem recarregar o layout

---

### 9.4 — Abas da aula

- [ ] Abaixo do player, três abas visíveis: **"Aula"**, **"Materiais"**, **"Minhas Notas"**
- [ ] Clique em "Materiais" → Conteúdo muda sem recarregar a página
- [ ] Clique em "Minhas Notas" → Conteúdo da aba muda
- [ ] Clique em "Aula" → Retorna ao conteúdo da aula

---

## MÓDULO 10 — Certificados

> **Pré-requisito:** Aluno com **100% das aulas concluídas** em ao menos um curso.

### 10.1 — Gerar e visualizar certificado

- [ ] Acesse `/pt-BR/certificado/[courseId]` do curso concluído → Página carrega com card de certificado
- [ ] Na primeira visita, o certificado é gerado automaticamente → Indicador de carregamento e depois o card com os dados
- [ ] Recarregue a página → Certificado já existente é exibido sem gerar novo (idempotente)
- [ ] Botão "Baixar PDF" visível → Clique nele; arquivo PDF é baixado corretamente
- [ ] Botão "Compartilhar no LinkedIn" visível e clicável
- [ ] Botão "Copiar link de verificação" → Copia URL pública para a área de transferência

---

### 10.2 — Verificação pública

> Este teste **não requer login** — é uma página pública.

- [ ] Acesse a URL copiada em 10.1 (formato `/pt-BR/verificar/[código]`) → Página pública carrega sem login
- [ ] Exibe: nome do aluno, nome do curso, nome do criador, data de conclusão
- [ ] Badge **"Certificado Válido"** visível
- [ ] Acesse `/pt-BR/verificar/codigo-que-nao-existe` → Mensagem **"Certificado não encontrado"** sem erro técnico

---

### 10.3 — Curso incompleto

- [ ] Acesse `/pt-BR/certificado/[courseId]` de curso **não concluído** → Mensagem de erro amigável informando que é necessário concluir o curso (não gera PDF)

---

## MÓDULO 11 — E-mails Transacionais

> **Como verificar:** Acesse o painel do **Resend** (https://resend.com/emails) ou observe os logs do terminal da API.
> Se `RESEND_API_KEY` não estiver configurado, os envios são ignorados silenciosamente — verifique os logs.

- [ ] **Boas-vindas:** Crie uma nova conta → E-mail de boas-vindas recebido com o nome do usuário, em português
- [ ] **Acesso ao curso:** Matrícula criada (via convite ou webhook) → E-mail "Seu acesso foi liberado" com título do curso e link direto
- [ ] **Recuperação de senha:** Solicite recuperação → E-mail com link de redefinição recebido, em português
- [ ] **Links funcionam:** Clique no link do e-mail de recuperação → Abre a página de redefinição correta
- [ ] **Sem inglês:** Todos os e-mails recebidos estão inteiramente em português (pt-BR)

---

## MÓDULO 12 — Visual e UX Geral

> Verifique em **ambos** os sites (Portal do Aluno e Painel do Criador).

### 12.1 — Design system

- [ ] **[Portal Aluno]** Cor primária dos botões → `bg-primary` (não hardcoded; deve variar por criador)
- [ ] **[Admin]** Cor primária dos botões → `bg-primary`
- [ ] **[Portal Aluno]** Fundo das páginas → Warm stone (`#fafaf9`), não branco puro
- [ ] **[Admin]** Fundo das páginas → Warm stone (`#fafaf9`), não branco puro
- [ ] **[Portal Aluno]** Tipografia → Inter em toda a interface
- [ ] **[Admin]** Tipografia → Inter em toda a interface
- [ ] **[Portal Aluno]** Botões primários → Bordas totalmente arredondadas (pill), altura mínima 48px
- [ ] **[Admin]** Botões primários → Bordas totalmente arredondadas (pill), altura mínima 48px
- [ ] **[Portal Aluno]** Cards → Borda `border-outline-variant`, sombra neutra
- [ ] **[Admin]** Cards → Borda `border-outline-variant`, sombra neutra
- [ ] **[Portal Aluno]** Barras de progresso → Preenchimento na cor `bg-primary`

---

### 12.2 — Idioma

- [ ] **[Portal Aluno]** Todos os textos visíveis em português (pt-BR) — sem inglês na UI
- [ ] **[Admin]** Todos os textos visíveis em português (pt-BR) — sem inglês na UI
- [ ] **[Portal Aluno]** Mensagens de erro de formulário em português
- [ ] **[Admin]** Mensagens de erro de formulário em português

---

### 12.3 — Responsividade

- [ ] **[Portal Aluno]** ~375px (celular) → Layout não quebra, textos legíveis
- [ ] **[Admin]** ~375px (celular) → Layout não quebra, textos legíveis
- [ ] **[Portal Aluno]** ~768px (tablet) → Layout se adapta corretamente
- [ ] **[Admin]** ~768px (tablet) → Layout se adapta corretamente
- [ ] **[Portal Aluno]** ~1440px (desktop) → Layout completo e balanceado
- [ ] **[Admin]** ~1440px (desktop) → Layout completo e balanceado

---

### 12.4 — Acessibilidade básica

- [ ] **[Portal Aluno]** Navegação por teclado (Tab) → Possível percorrer todos os campos sem mouse
- [ ] **[Admin]** Navegação por teclado (Tab) → Possível percorrer todos os campos sem mouse
- [ ] **[Portal Aluno]** Foco visível → Elemento focado tem destaque visual ao usar Tab
- [ ] **[Admin]** Foco visível → Elemento focado tem destaque visual ao usar Tab
- [ ] **[Portal Aluno]** Campos de formulário → Cada campo tem label visível associado
- [ ] **[Admin]** Campos de formulário → Cada campo tem label visível associado

---

## MÓDULO 13 — Segurança

- [ ] Sem login no admin, acesse `http://localhost:3001/pt-BR/cursos` → Redireciona para login
- [ ] Logado como **aluno**, acesse `http://localhost:3001/pt-BR/cursos` → Acesso negado (aluno não é criador)
- [ ] Logado como **aluno**, acesse `http://localhost:3001/pt-BR/ybr-admin/criadores` → Acesso negado
- [ ] Tente fazer login no admin com credenciais erradas 5+ vezes seguidas → Rate limit ativo: bloqueio temporário ou mensagem "muitas tentativas"
- [ ] No portal do aluno, tente acessar URL de aula de curso em que **não está matriculado** → Redireciona (não expõe URL do vídeo)
- [ ] Acesse `http://localhost:3002/docs` → Documentação Swagger carrega corretamente (apenas em ambiente dev)

---

## Bugs Encontrados

> Liste cada bug com o máximo de detalhes: URL, passos para reproduzir, comportamento esperado vs. observado.

| # | Módulo | Descrição | Gravidade |
|---|--------|-----------|-----------|
| 1 | | | Alta / Média / Baixa |
| 2 | | | Alta / Média / Baixa |
| 3 | | | Alta / Média / Baixa |

---

**Testado por:** ___________________________
**Data:** ___________________________
**Versão testada:** Sprint 3 (Fase 1 MVP — Fases 0–1.9)
