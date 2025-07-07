# Patas com Amor - Relatório Técnico do Projeto

## Visão Geral

Este projeto é uma aplicação completa para adoção de pets, gerenciamento de usuários, blog, permissões e administração, construída com React Native (Expo), Firebase (Firestore, Auth, Storage), integração com notificações push, e suporte a múltiplas plataformas (Android, iOS e Web).

---

## Arquitetura e Organização

### Estrutura de Pastas

- **app/**: Código principal da aplicação.
  - **app/**: Navegação principal, layouts e roteamento.
  - **components/**: Componentes reutilizáveis (inputs, botões, upload de imagem, etc).
  - **config/**: Configuração e serviços do Firebase.
  - **hooks/**: Hooks customizados.
  - **screens/**: Telas principais (AddPet, AddBlogPost, AdminConsole, etc).
  - **utils/**: Utilitários (tema, permissões, autenticação, notificações, etc).
- **assets/**: Imagens e recursos estáticos.
- **constants/**: Constantes globais.
- **__test__/**: Testes automatizados.
- **android/**, **ios/**: Configurações nativas.
- **locales/**: Internacionalização (i18n).

---

## Fluxo de Autenticação

- Utiliza Firebase Auth para login, registro, logout e controle de sessão.
- Suporte a login por email/senha e provedores sociais (Google, Facebook).
- Contexto de autenticação global via [`AuthProvider`](app/utils/AuthContext.tsx).
- Verificação de status de admin com [`isUserAdmin`](app/config/firebase.tsx).

---

## Gerenciamento de Permissões

- Serviço centralizado em [`PermissionService`](app/utils/PermissionsServices.tsx).
- Permissões essenciais: notificações, câmera, galeria, localização, contatos.
- Telas para gerenciamento e solicitação de permissões ([`PermissionManager`](app/screens/PermissionManage.tsx)).
- Diálogos de rationale e status detalhado para o usuário.

---

## Gerenciamento de Dados

### Firebase Firestore

- **Coleções principais**:
  - `users`: Perfis de usuário, papéis (admin/user), preferências.
  - `pets`: Dados de pets para adoção, status, imagens, histórico.
  - `blog_posts`: Posts do blog, categorias, status (publicado/rascunho).
  - `comments`: Comentários em posts do blog.

- **Funções utilitárias**:
  - CRUD completo para pets, posts, usuários e comentários.
  - Upload de imagens para Firebase Storage e Cloudinary.
  - Funções para ordenação, filtragem e paginação dos dados.

### Notificações

- Integração com Firebase Cloud Messaging.
- Notificações automáticas para novos pets, favoritos, etc.
- Serviços de inscrição/desinscrição em tópicos de interesse.

---

## Principais Telas e Funcionalidades

### Telas de Usuário

- **Home/Login/Register**: Fluxo de autenticação, registro e recuperação de senha.
- **Adopt**: Listagem de pets disponíveis, filtros, detalhes do pet.
- **AdoptionDetails**: Detalhes completos do pet, imagens, requisitos, contato com responsável, chat.
- **Profile**: Perfil do usuário, informações de contato, estatísticas.
- **News/Blog**: Listagem de posts do blog, categorias, detalhes do post, comentários.
- **About**: Missão, equipe, história, contato.

### Telas Administrativas

- **AdminConsole/AdminConsoleWeb**: Painel de administração para gerenciar pets, posts, usuários e configurações.
- **AddPet/AddBlogPost/AddUsers**: Telas para criação e edição de pets, posts e usuários.
- **SettingsPanel**: Configurações do sistema, aparência, backup, logs, informações do app.

---

## Componentes Reutilizáveis

- **ImageUpload**: Upload e compressão de imagens, integração com galeria/câmera.
- **InputPassword**: Campo de senha com visibilidade alternável.
- **StatusBagde**: Exibição de status (publicado, rascunho, adotado, etc).
- **FloatingButton**: Botão de ação flutuante para adicionar itens.
- **Toastable**: Sistema de notificações visuais rápidas.

---

## Internacionalização

- Suporte a múltiplos idiomas via i18next.
- Arquivos de tradução em `locales/`.
- Extração automática de chaves com `i18next-scanner`.

---

## Temas e Aparência

- Contexto de tema global via [`ThemeProvider`](app/utils/ThemeContext.tsx).
- Suporte a tema claro/escuro, cores customizadas e integração com react-native-paper e eva-design.

---

## Integrações e Serviços Externos

- **Firebase**: Auth, Firestore, Storage, FCM.
- **Cloudinary**: Upload alternativo de imagens.
- **Expo**: Notificações, navegação, permissões, etc.
- **React Native Paper**: Componentes UI modernos.
- **Lucide/Feather Icons**: Ícones vetoriais.

---

## Segurança

- Restrições de acesso por papel (admin/user) em todas as operações sensíveis.
- Verificações de autenticação e autorização em todos os serviços do Firebase.
- Validação de dados em formulários e uploads.

---

## Testes

- Estrutura para testes automatizados em `__test__/`.
- Testes de acessibilidade, e2e e unitários.

---

## Observações Finais

- O projeto é modular, escalável e preparado para produção.
- Fácil extensão para novas funcionalidades (ex: marketplace, doações, eventos).
- Código organizado, com separação clara de responsabilidades e uso extensivo de hooks e contextos.

---

## Referências de Código

- [app/config/firebase.tsx](app/config/firebase.tsx): Serviços de dados, autenticação e permissões.
- [app/screens/](app/screens/): Telas principais do app.
- [app/components/](app/components/): Componentes reutilizáveis.
- [app/utils/](app/utils/): Utilitários de tema, permissões, autenticação, notificações.

---

## Como rodar o projeto

1. Instale as dependências:
   ```sh
   npm install
   ```
2. Configure as variáveis de ambiente em `.env`.
3. Inicie o projeto:
   ```sh
   npx expo start
   ```

---

## Contato

Para dúvidas ou contribuições, consulte o arquivo [CONTRIBUTING.md] ou abra uma issue.
