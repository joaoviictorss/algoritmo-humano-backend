# Algoritmo Humano - Backend

API REST para plataforma de cursos online. Uma solução completa para autenticação de usuários e gestão de cursos.

## 🚀 Deploy

A aplicação está disponível em: **https://algoritmo-humano-backend.onrender.com**

📖 **Documentação da API**: https://algoritmo-humano-backend.onrender.com/docs

## 🛠️ Tecnologias

- **Node.js** - Runtime JavaScript
- **Fastify** - Framework web rápido e eficiente
- **TypeScript** - Superset JavaScript com tipagem estática
- **Prisma** - ORM moderno para Node.js
- **Zod** - Biblioteca de validação de esquemas
- **JWT** - Autenticação via JSON Web Tokens
- **bcryptjs** - Hash de senhas
- **Swagger** - Documentação automática da API

## 📋 Funcionalidades

### 🔐 Autenticação

- Cadastro de usuários
- Login com email/senha
- Autenticação via JWT
- Rotas protegidas
- Perfil do usuário

### 📚 Gestão de Cursos

- **CRUD completo** para usuários autenticados
- Campos: título, descrição, imagem, duração, status
- Listagem pública de cursos ativos
- Listagem de cursos do usuário logado
- Busca por slug
- Validação de dados com Zod

## 📡 Endpoints Principais

### Autenticação

- `POST /users` - Criar conta
- `POST /sessions/password` - Login
- `GET /profile` - Perfil do usuário (autenticado)

### Cursos

- `GET /courses` - Listar todos os cursos (paginado) e com filtros de pesquisa
- `GET /me/courses` - Meus cursos (autenticado)
- `POST /courses` - Criar curso (autenticado)
- `GET /courses/:slug` - Buscar curso por slug
- `PUT /courses/:slug` - Atualizar curso (autenticado)
- `DELETE /courses/:slug` - Deletar curso (autenticado)

## 🚀 Como executar

### Pré-requisitos

- Node.js 18+
- npm ou yarn

### Instalação

1. **Clone o repositório**

```bash
git clone <url-do-repositorio>
cd algoritmo-humano-backend
```

2. **Instale as dependências**

```bash
npm install
```

3. **Configure as variáveis de ambiente**

```bash
cp .env.example .env
```

Configure as seguintes variáveis no arquivo `.env`:

```env
DATABASE_URL="sua-url-do-banco-postgresql"
DIRECT_URL="sua-url-do-banco-postgresql"
JWT_SECRET="seu-jwt-secret"
FRONTEND_URL="http://localhost:3000"
PORT=3333
```

4. **Configure o banco de dados**

```bash
npx prisma generate
npx prisma db push
npx prisma db seed  # Opcional: dados de exemplo
```

5. **Execute em modo de desenvolvimento**

```bash
npm run dev
```

A API estará disponível em `http://localhost:3333`

### Scripts disponíveis

- `npm run dev` - Executa em modo desenvolvimento com hot reload
- `npm run build` - Compila o TypeScript
- `npm run start` - Executa a aplicação compilada

## 🔒 Segurança

- **Hash de senhas** com bcryptjs
- **Autenticação JWT** com expiração
- **Validação rigorosa** de dados com Zod
- **CORS** configurado para domínios específicos
- **Rotas protegidas** para operações sensíveis

## 📊 Banco de Dados

O projeto utiliza Prisma ORM com suporte a:

- PostgreSQL (produção)
- SQLite (desenvolvimento local)

### Modelo de dados principais:

- **User**: id, name, email, passwordHash, createdAt
- **Course**: id, title, description, imageUrl, duration, status, slug, userId, createdAt, updatedAt

## 🔧 Configurações

### CORS

Configurado para aceitar requisições do frontend em desenvolvimento e produção.

### Swagger/OpenAPI

Documentação automática disponível em `/docs` com todos os endpoints, esquemas e exemplos.

### Validação

Todas as rotas possuem validação de entrada e saída usando Zod, garantindo type-safety.

## 🌐 Deploy

A aplicação está hospedada no **Render** com:

- Build automático via GitHub
- Variáveis de ambiente configuradas
- Banco de dados PostgreSQL
- SSL/HTTPS habilitado

## 🧪 Testes

Para executar o health check:

```bash
curl https://algoritmo-humano-backend.onrender.com/health
# Resposta esperada: "OK"
```

## 📝 Observações Técnicas

- **Type-safe**: Uso extensivo do TypeScript para maior confiabilidade
- **Performance**: Fastify oferece alta performance comparado ao Express
- **Documentação**: Swagger UI para facilitar integração
- **Validação**: Zod garante consistência dos dados
- **Linter**: Biome.js para verificação de estilo e segurança
- **Escalabilidade**: Arquitetura modular e bem organizada
