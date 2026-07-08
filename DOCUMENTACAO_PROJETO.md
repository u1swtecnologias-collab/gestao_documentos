# Documentação Oficial - Sistema de Gestão de Documentos e Processos

## 1. Visão Geral da Aplicação
O **Sistema de Gestão de Documentos e Processos** é uma plataforma web moderna projetada para centralizar a criação, organização e controle de processos empresariais e seus respectivos documentos. A aplicação foi construída visando performance, segurança e uma interface de usuário responsiva e intuitiva.

### Stack Tecnológica Principal:
- **Framework Frontend/Backend:** Next.js (v16) com React 19 (App Router).
- **Linguagem:** TypeScript.
- **Estilização:** Tailwind CSS (v4).
- **Banco de Dados & ORM:** PostgreSQL hospedado no **Supabase**, mapeado e acessado via **Prisma ORM**.
- **Autenticação:** NextAuth.js (@auth/prisma-adapter).
- **Armazenamento de Arquivos:** Integração com **Google Drive API** para gestão de arquivos e criação de Google Docs.

---

## 2. Funcionamento do Sistema
A plataforma funciona como um hub central onde os usuários autenticados possuem diferentes níveis de acesso baseados em seu **Perfil** e **Área** de atuação.
1. **Processos:** Atuam como pastas organizacionais (containers) que possuem um *Status* e estão vinculados a *Áreas*.
2. **Documentos:** Podem ser arquivos upados (PDFs, imagens) ou documentos dinâmicos gerados no Google Docs. Todo documento é obrigatoriamente vinculado a um Processo.
3. **Integração Google:** Quando um documento é criado ou upado na plataforma, o arquivo real é gerado e armazenado de forma transparente no Google Drive, enquanto a plataforma salva apenas o ID de referência para rápida recuperação e visualização.

---

## 3. Onde o sistema está armazenado?
- **Código-Fonte e Desenvolvimento:** Localizado na máquina de desenvolvimento no diretório `c:\Users\danil\OneDrive\Desktop\PROJETO2\gestao-documentos`.
- **Banco de Dados (Dados textuais, estruturais e logins):** Hospedado na nuvem utilizando o **Supabase** (que roda um banco PostgreSQL sob o capô).
- **Arquivos Físicos (Imagens, PDFs, Docs):** Armazenados no **Google Drive** corporativo ou vinculado à conta de serviço (via `googleapis`).

---

## 4. Onde a aplicação pode ser editada (Ambiente de Desenvolvimento)?
Para realizar alterações no sistema, você deve modificar os arquivos dentro da pasta `gestao-documentos`. Os principais locais são:
- `src/app/`: Onde ficam as rotas, páginas e o layout principal (ex: `page.tsx`, `layout.tsx`). Se quiser mudar o que aparece em uma URL específica, é aqui.
- `src/components/`: Onde ficam os pedaços visuais reutilizáveis do site (modais de criação, botões, formulários). Ex: `UploadDocumentModal.tsx`.
- `src/lib/`: Configurações e integrações do sistema (conexão com Google Drive `google.ts` e configuração do banco `prisma.ts`).
- `prisma/schema.prisma`: Onde se altera, adiciona ou remove tabelas do banco de dados (Supabase).
- `package.json`: Onde são gerenciadas as bibliotecas de terceiros (dependências) e comandos de inicialização.

---

## 5. Como estão divididas as tabelas no SUPABASE (Estrutura do Banco)
A arquitetura do banco de dados no Supabase (gerenciada via Prisma) é dividida nas seguintes categorias lógicas:

**A. Autenticação e Segurança (Gerados pelo NextAuth):**
- `User`: Armazena os dados dos usuários (email, nome, vínculo de perfil).
- `Account` e `Session`: Gerenciam os logins ativos e conexões com provedores de autenticação externos.
- `VerificationToken`: Utilizado para links mágicos ou verificação de email.

**B. Controle de Acesso e Organização:**
- `Perfil`: Níveis de permissão (Administrador, Gestor, Colaborador, Consulta).
- `Area`: Setores ou departamentos (ex: RH, Financeiro).

**C. Núcleo da Aplicação (Negócio):**
- `Processo`: Agrupa os documentos, possui número único, status e vinculação a áreas.
- `StatusProcesso`: Dicionário de status possíveis (Aberto, Concluído, etc).
- `ProcessoArea`: Tabela de junção para permitir que um processo pertença a múltiplas áreas.
- `Documento`: Representa os arquivos. Salva nome, tipo, comentário e o identificador do Google Drive (`driveFileId`).
- `TipoDocumento`: Classificação dos documentos.
- `Parametro`: Tabela para configurações gerais do sistema de forma dinâmica (ex: chaves, pastas raiz).

---

## 6. Como o layout do site foi criado?
O layout foi arquitetado focado em modernidade, velocidade e responsividade, utilizando:
- **Tailwind CSS v4:** Ao invés de usar arquivos `.css` complexos, o visual foi construído aplicando classes utilitárias diretamente nos elementos HTML (ex: `flex`, `text-center`, `bg-blue-500`).
- **Lucide React:** Biblioteca que fornece todos os ícones da aplicação (limpos e vetoriais).
- **Utilitários de UI:** Bibliotecas como `clsx` e `tailwind-merge` garantem que os componentes possam mudar de cor ou tamanho de forma dinâmica sem quebrar o layout.
- **Tipografia:** A fonte **Geist** e **Geist Mono** foram injetadas globalmente em `layout.tsx` para garantir uma leitura agradável e estética premium.

---

## 7. Como explicar os passos de criação (Construído com Antigravity)
Caso precise explicar para clientes, chefes ou em uma apresentação como este sistema foi construído rapidamente utilizando o **Antigravity** (IA da Google DeepMind), utilize o seguinte roteiro:

1. **Ideação e Ingestão de Requisitos:** O fluxo começou passando para a IA toda a documentação base do projeto (Específicações em PDF, fluxogramas em PNG, manuais em Word). O Antigravity assimilou as regras de negócio antes de escrever qualquer código.
2. **Setup do Ambiente Tecnológico:** Através de comandos de terminal autônomos, o Antigravity inicializou o projeto do zero, instalando o Next.js, configurando o TypeScript e o Tailwind CSS v4 para uma fundação sólida.
3. **Modelagem de Dados e Banco:** Com base nos requisitos lidos, a IA escreveu o arquivo `schema.prisma` mapeando exatamente o que o sistema precisava (Usuários, Áreas, Processos, Documentos) e publicou esse esquema na nuvem no Supabase.
4. **Desenvolvimento Frontend:** Utilizando componentes do React e as classes do Tailwind, o Antigravity construiu a interface visual tela a tela, seguindo diretrizes de design premium e criando modais iterativos (como os de upload e criação de processos).
5. **Integrações Complexas:** O agente codificou autonomamente a lógica de backend (API routes) conectando a aplicação com a API oficial do Google Drive para gerenciar o tráfego dos arquivos sem intervenção humana na infraestrutura.
6. **Pair Programming IA + Humano:** Todo o processo foi iterativo, onde o humano direcionava a visão e a validação, enquanto o Antigravity operava o desenvolvimento e arquitetura em altíssima velocidade.
