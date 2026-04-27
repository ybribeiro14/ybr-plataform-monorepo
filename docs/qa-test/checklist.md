# QA Test Checklist — YBR Platform

**Versão:** Sprint 1 (Fases 0–1.3)  
**Data de criação:** 2026-04-27  
**Última atualização:** 2026-04-27

> Este documento é para **testes manuais por um testador externo**. Nenhum conhecimento técnico é necessário — basta seguir os passos e marcar o resultado.

---

## URLs dos Ambientes

- **Portal do Aluno:** `http://localhost:3000`
- **Painel Admin:** `http://localhost:3001`
- **API / Swagger:** `http://localhost:3002/docs`

> **Pré-requisito:** O ambiente de desenvolvimento deve estar rodando (`pnpm dev` na pasta `platform/`).

---

## MÓDULO 1 — Autenticação (Portal do Aluno)

> **URL base:** `http://localhost:3000`

### 1.1 — Cadastro de nova conta

- [ ] Acesse `http://localhost:3000/pt-BR/register` → Página de cadastro carrega sem erro
- [ ] Preencha nome, e-mail e senha (mín. 8 caracteres) e clique em "Cadastrar" → Redireciona para o dashboard ou exibe mensagem de sucesso
- [ ] Tente cadastrar com o mesmo e-mail novamente → Exibe mensagem de erro "e-mail já cadastrado"
- [ ] Tente cadastrar com senha de 3 caracteres → Exibe mensagem de validação antes de enviar
- [ ] Tente cadastrar com e-mail inválido (ex: `teste@`) → Exibe mensagem de validação de e-mail
- [ ] Tente submeter o formulário vazio → Exibe mensagens de erro em todos os campos obrigatórios

---

### 1.2 — Login

- [ ] Acesse `http://localhost:3000/pt-BR/login` → Página de login carrega sem erro
- [ ] Faça login com e-mail e senha válidos → Redireciona para `/pt-BR/dashboard`
- [ ] Verifique que o nome do usuário aparece na tela após o login
- [ ] Tente fazer login com senha incorreta → Mensagem de erro "credenciais inválidas"
- [ ] Tente fazer login com e-mail não cadastrado → Mensagem de erro adequada
- [ ] Submeta o formulário vazio → Validação aparece nos campos

---

### 1.3 — Recuperação de senha

- [ ] Acesse `http://localhost:3000/pt-BR/forgot-password` → Página carrega sem erro
- [ ] Informe um e-mail cadastrado e clique em "Enviar" → Exibe mensagem de confirmação (sem revelar se o e-mail existe ou não)
- [ ] Informe um e-mail não cadastrado → Mesmo comportamento (não deve revelar que o e-mail não existe — segurança)
- [ ] Informe um e-mail inválido → Validação do campo antes de enviar

---

### 1.4 — Proteção de rotas (Portal do Aluno)

- [ ] Sem estar logado, acesse `http://localhost:3000/pt-BR/dashboard` → Redireciona para a página de login
- [ ] Sem estar logado, acesse `http://localhost:3000/pt-BR/meus-cursos` → Redireciona para a página de login
- [ ] Faça login e depois acesse `/pt-BR/login` novamente → Deve redirecionar para o dashboard (não mostrar login novamente)

---

## MÓDULO 2 — Autenticação (Painel Admin)

> **URL base:** `http://localhost:3001`

### 2.1 — Login do criador

- [ ] Acesse `http://localhost:3001/pt-BR/login` → Página de login admin carrega com o visual correto
- [ ] Tente fazer login com uma conta de aluno (role: student) → Exibe erro "acesso negado" — alunos não podem acessar o admin
- [ ] Faça login com uma conta de criador ou admin → Redireciona para o dashboard admin
- [ ] Sem estar logado, acesse `http://localhost:3001/pt-BR/dashboard` → Redireciona para `/pt-BR/login`
- [ ] Sem estar logado, acesse `http://localhost:3001/pt-BR/cursos` → Redireciona para `/pt-BR/login`

---

## MÓDULO 3 — Dashboard Admin

> **Pré-requisito:** Estar logado como criador no Painel Admin (`http://localhost:3001`)

- [ ] Acesse o dashboard após o login → Página carrega sem erro
- [ ] Verifique a presença da barra lateral (sidebar) com links para: Dashboard, Cursos, Alunas, Analytics
- [ ] Verifique o visual geral → Cores e tipografia no estilo "Artisanal Sophistication" (terracota, crème, dourado)
- [ ] Clique no link "Cursos" na sidebar → Navega para a página de gestão de cursos
- [ ] Reduza a janela do navegador → Layout se adapta sem quebrar

---

## MÓDULO 4 — Gestão de Cursos (Admin)

> **URL:** `http://localhost:3001/pt-BR/cursos`

### 4.1 — Listagem de cursos

- [ ] Acesse a página de cursos → Carrega sem erro (pode estar vazia)
- [ ] Verifique o estado vazio → Mensagem amigável quando não há cursos ("Nenhum curso criado ainda" ou similar)
- [ ] Verifique a presença do botão "Novo curso" → Botão visível e clicável

---

### 4.2 — Criar novo curso

- [ ] Clique em "Novo curso" → Abre o formulário de criação
- [ ] Preencha apenas o título e tente salvar → Deve aceitar (descrição e thumbnail não são obrigatórios)
- [ ] Tente salvar com o formulário completamente vazio → Validação aparece no campo título
- [ ] Preencha todos os campos (título, descrição, idioma) → Curso criado com sucesso
- [ ] Após criação, o curso aparece na listagem com status "Rascunho"
- [ ] Faça upload de uma imagem de thumbnail (PNG ou JPG) → Preview da imagem aparece antes de salvar
- [ ] Crie um curso com o mesmo título de um existente → Deve permitir (títulos não são únicos)

---

### 4.3 — Editar curso

- [ ] Clique em "Editar" em um curso existente → Formulário abre com os dados pré-preenchidos
- [ ] Altere o título e salve → Título atualizado na listagem
- [ ] Altere a thumbnail → Nova imagem salva corretamente
- [ ] Clique em "Cancelar" sem salvar → Volta para a listagem sem modificar os dados

---

### 4.4 — Publicar / Arquivar curso

- [ ] Na listagem, encontre um curso com status "Rascunho" → Badge de status visível
- [ ] Clique em "Publicar" → Status muda para "Publicado" sem recarregar a página
- [ ] Clique em "Arquivar" em um curso publicado → Status muda para "Arquivado"
- [ ] Verifique que badges de status têm cores diferentes → Rascunho (cinza), Publicado (verde/dourado), Arquivado (neutro)

---

## MÓDULO 5 — Editor de Conteúdo (Admin)

> **URL:** `http://localhost:3001/pt-BR/cursos/[id-do-curso]/conteudo`
> Acesse via botão "Editar conteúdo" ou "Módulos" na listagem de cursos.

### 5.1 — Gerenciar módulos

- [ ] Acesse o editor de conteúdo de um curso → Página carrega com a interface de edição
- [ ] Clique em "Adicionar módulo" → Campo/formulário para criar módulo aparece
- [ ] Crie um módulo com um título → Módulo criado e visível na lista
- [ ] Crie um segundo módulo → Dois módulos visíveis na ordem correta
- [ ] Clique no botão ↑ no segundo módulo → Módulo sobe para a primeira posição
- [ ] Clique no botão ↓ no primeiro módulo → Módulo desce para a segunda posição
- [ ] Edite o título de um módulo existente → Título atualizado
- [ ] Delete um módulo → Módulo removido da lista (com confirmação antes de deletar)

---

### 5.2 — Gerenciar aulas

- [ ] Dentro de um módulo, clique em "Adicionar aula" → Formulário de nova aula aparece
- [ ] Crie uma aula com título → Aula criada e visível dentro do módulo
- [ ] Crie uma segunda aula no mesmo módulo → Duas aulas visíveis
- [ ] Reordene as aulas com ↑ e ↓ → Ordem atualizada corretamente
- [ ] Edite o título de uma aula → Título atualizado
- [ ] Delete uma aula → Aula removida (com confirmação)
- [ ] Crie aulas em módulos diferentes → Cada módulo exibe corretamente suas próprias aulas

---

## MÓDULO 6 — Player de Vídeo (Portal do Aluno)

> **Pré-requisito:** O testador precisa ter uma matrícula ativa em algum curso que tenha pelo menos uma aula com vídeo configurado.
> **Nota para setup:** Um administrador técnico precisa configurar um enrollment de teste e uma aula com `bunny_video_id` preenchido antes deste módulo ser testado.

### 6.1 — Acesso à aula

- [ ] Estando logado, acesse `/pt-BR/cursos/[slug]/aulas/[lessonId]` → Página da aula carrega sem erro
- [ ] Verifique que o player de vídeo está visível na proporção 16:9
- [ ] Tente acessar a aula sem estar logado → Redireciona para login
- [ ] Tente acessar a aula estando logado mas SEM matrícula → Exibe erro de acesso negado (403)

---

### 6.2 — Funcionalidades do player

- [ ] Clique em "Play" no vídeo → Vídeo começa a reproduzir
- [ ] Pause e volte a dar play → Pausa e retoma corretamente
- [ ] Arraste a barra de progresso para um ponto diferente → Vídeo pula para o ponto selecionado
- [ ] Aumente e diminua o volume → Volume muda conforme esperado
- [ ] Clique em tela cheia → Vídeo expande para tela cheia
- [ ] Recarregue a página após assistir alguns segundos → O vídeo retoma de onde parou (progresso salvo)

---

### 6.3 — Progresso e conclusão

- [ ] Assista ao vídeo por mais de 10 segundos e recarregue → O progresso foi salvo (vídeo volta ao mesmo ponto)
- [ ] Assista até 90% ou mais do vídeo → A aula é marcada como concluída (ícone de check ou indicação visual)
- [ ] Na sidebar de módulos/aulas, verifique o indicador de conclusão → Aula concluída aparece com ícone/check diferente
- [ ] Navegue para outra aula pela sidebar → Muda para a aula selecionada

---

### 6.4 — Tabs da aula

- [ ] Abaixo do player, verifique as abas → Três abas visíveis: "Aula", "Materiais", "Minhas Notas"
- [ ] Clique na aba "Materiais" → Conteúdo da aba muda sem recarregar a página
- [ ] Clique na aba "Minhas Notas" → Conteúdo da aba muda
- [ ] Clique de volta em "Aula" → Retorna ao conteúdo da aula

---

## MÓDULO 7 — Visual e UX Geral

> Verifique estes itens em AMBOS os sites (Portal do Aluno e Painel Admin).

### 7.1 — Design system

- [ ] **[Portal Aluno]** Cor primária dos botões → Terracota (#984207), não laranja puro nem vermelho
- [ ] **[Admin]** Cor primária dos botões → Terracota (#984207), não laranja puro nem vermelho
- [ ] **[Portal Aluno]** Fundo das páginas → Creme quente (não branco puro)
- [ ] **[Admin]** Fundo das páginas → Creme quente (não branco puro)
- [ ] **[Portal Aluno]** Tipografia dos títulos → Serifada (DM Serif Display), não sans-serif
- [ ] **[Admin]** Tipografia dos títulos → Serifada (DM Serif Display), não sans-serif
- [ ] **[Portal Aluno]** Botões primários → Bordas arredondadas totalmente (pill/cápsula)
- [ ] **[Admin]** Botões primários → Bordas arredondadas totalmente (pill/cápsula)
- [ ] **[Portal Aluno]** Cards e containers → Borda suave quente, sombra sutil terracota
- [ ] **[Admin]** Cards e containers → Borda suave quente, sombra sutil terracota
- [ ] **[Portal Aluno]** Barra de progresso → Cor dourada (#755b00)

---

### 7.2 — Idioma

- [ ] **[Portal Aluno]** Todos os textos visíveis estão em português (pt-BR) — sem textos em inglês na interface
- [ ] **[Admin]** Todos os textos visíveis estão em português (pt-BR) — sem textos em inglês na interface
- [ ] **[Portal Aluno]** Mensagens de erro de formulário estão em português
- [ ] **[Admin]** Mensagens de erro de formulário estão em português

---

### 7.3 — Responsividade

- [ ] **[Portal Aluno]** Viewport ~375px (celular) → Layout não quebra, textos legíveis
- [ ] **[Admin]** Viewport ~375px (celular) → Layout não quebra, textos legíveis
- [ ] **[Portal Aluno]** Viewport ~768px (tablet) → Layout se adapta corretamente
- [ ] **[Admin]** Viewport ~768px (tablet) → Layout se adapta corretamente
- [ ] **[Portal Aluno]** Viewport ~1440px (desktop) → Layout completo e balanceado
- [ ] **[Admin]** Viewport ~1440px (desktop) → Layout completo e balanceado

---

### 7.4 — Acessibilidade básica

- [ ] **[Portal Aluno]** Navegação por teclado (Tab) → É possível navegar pelos campos sem mouse
- [ ] **[Admin]** Navegação por teclado (Tab) → É possível navegar pelos campos sem mouse
- [ ] **[Portal Aluno]** Estado de foco visível → O elemento focado tem destaque visual ao usar Tab
- [ ] **[Admin]** Estado de foco visível → O elemento focado tem destaque visual ao usar Tab
- [ ] **[Portal Aluno]** Campos de formulário → Cada campo tem um label visível associado
- [ ] **[Admin]** Campos de formulário → Cada campo tem um label visível associado

---

## MÓDULO 8 — Segurança Básica

- [ ] Tente acessar `http://localhost:3001/pt-BR/dashboard` sem estar logado no admin → Redireciona para login
- [ ] Faça login como aluno e tente acessar `http://localhost:3001/pt-BR/cursos` → Acesso negado (aluno não é criador)
- [ ] Tente fazer login no admin com credenciais erradas 5+ vezes seguidas → Rate limit: bloqueio temporário ou mensagem de muitas tentativas
- [ ] No portal do aluno, tente acessar a URL de uma aula de um curso em que não está matriculado → Erro de acesso (não expõe a URL de vídeo)

---

## Bugs Encontrados

> Liste aqui todos os bugs encontrados durante os testes.

**Bug #1**

- Módulo:
- Descrição:
- Gravidade: Alta / Média / Baixa

**Bug #2**

- Módulo:
- Descrição:
- Gravidade: Alta / Média / Baixa

---

**Testado por:** **\*\***\_\_\_**\*\***
**Data:** **\*\***\_\_\_**\*\***
**Versão testada:** Sprint 1 (Fases 0–1.3)
