# Antigravity — AI Todo Mono

An AI-powered todo list app built as a full-stack TypeScript monorepo.

Give it a goal. It builds your task list using AI, then judges whether that goal is actually achievable.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | Next.js 16 · React 19 · TypeScript · Tailwind CSS |
| Backend | Node.js · Express · TypeScript |
| Database | PostgreSQL · Prisma ORM |
| Auth | JWT (Bearer Token) |
| AI | OpenRouter API |
| API Docs | Swagger / OpenAPI 3.0 |

---

## Project Structure

```
ai-todo-mono/
├── apps/
│   ├── api/           # Node.js + Express backend
│   │   ├── src/
│   │   │   ├── config/          # App config, DB, Swagger
│   │   │   ├── middleware/      # Auth + error middleware
│   │   │   ├── modules/
│   │   │   │   ├── auth/        # Register, Login (JWT)
│   │   │   │   └── todo/        # CRUD + AI generation
│   │   │   └── shared/          # Exceptions, utils
│   │   └── prisma/
│   │       └── schema.prisma    # DB schema (User, TodoList, TodoItem)
│   └── web/           # Next.js frontend
│       └── app/
│           ├── dashboard/       # User's todo lists
│           ├── list/[id]/       # Single list view
│           ├── loading/         # AI generation screen
│           ├── login/
│           └── register/
└── package.json       # Monorepo root (npm workspaces)
```

---

## Prerequisites

Make sure you have these installed before starting:

- **Node.js** v18 or later — [nodejs.org](https://nodejs.org)
- **npm** v9 or later (comes with Node.js)
- **PostgreSQL** — running locally or a cloud instance (e.g., Supabase, Neon)
- An **OpenRouter API key** — [openrouter.ai](https://openrouter.ai) (free tier available)

---

## Setup Instructions

### 1. Clone the repository

```bash
git clone <your-repo-url>
cd ai-todo-mono
```

### 2. Install all dependencies

Run this from the **monorepo root** to install dependencies for all workspaces at once:

```bash
npm install
```

### 3. Configure the backend environment

Create an `.env` file inside `apps/api/`:

```bash
cp apps/api/.env.example apps/api/.env   # if example exists, otherwise create it manually
```

Add the following variables to `apps/api/.env`:

```env
# Server
PORT=4000
NODE_ENV=development

# Database
DATABASE_URL="postgresql://<user>:<password>@localhost:5432/<dbname>"

# JWT
JWT_SECRET=your_super_secret_key_here

# OpenRouter AI
OPENROUTER_API_KEY=sk-or-v1-...
OPENROUTER_MODEL=openrouter/free
```

> **Note:** Replace the `DATABASE_URL` with your actual PostgreSQL connection string.

### 4. Run database migrations

From the monorepo root (or inside `apps/api/`):

```bash
cd apps/api
npx prisma migrate dev
```

This creates all required tables (`User`, `TodoList`, `TodoItem`) in your database.

Optionally, generate the Prisma client if needed:

```bash
npx prisma generate
```

### 5. Run the development servers

From the **monorepo root**, run both frontend and backend together:

```bash
npm run dev
```

Or run them individually:

```bash
# API only (http://localhost:4000)
npm run dev:api

# Web only (http://localhost:3000)
npm run dev:web
```

---

## API Documentation (Swagger)

With the backend running in development mode, open your browser and go to:

```
http://localhost:4000/api/docs
```

The interactive Swagger UI lets you explore and test every endpoint. The raw OpenAPI JSON spec is available at:

```
http://localhost:4000/api/docs.json
```

> Swagger is only available in `NODE_ENV=development`. It is disabled in production.

---

## API Overview

### Auth endpoints (`/api/auth`)

| Method | Path | Description |
|---|---|---|
| `POST` | `/api/auth/register` | Create a new account |
| `POST` | `/api/auth/login` | Log in and receive a JWT token |

### Todo endpoints (`/api/todo`) — all require `Authorization: Bearer <token>`

| Method | Path | Description |
|---|---|---|
| `POST` | `/api/todo/generate` | Generate a todo list from a goal via AI |
| `GET` | `/api/todo` | Get all todo lists for current user |
| `GET` | `/api/todo/:listId` | Get a specific todo list |
| `POST` | `/api/todo/:listId/items` | Add an item to a list |
| `PATCH` | `/api/todo/item/:itemId/toggle` | Toggle item completion status |
| `PATCH` | `/api/todo/item/:itemId` | Update item details |
| `DELETE` | `/api/todo/item/:itemId` | Delete an item |
| `DELETE` | `/api/todo/:listId` | Delete an entire list |

---

## Available Scripts

From the **monorepo root:**

| Script | Description |
|---|---|
| `npm run dev` | Run both API and web in parallel |
| `npm run dev:api` | Run backend only |
| `npm run dev:web` | Run frontend only |

From **`apps/api/`:**

| Script | Description |
|---|---|
| `npm run dev` | Start API dev server with hot reload |
| `npm run build` | Compile TypeScript to `dist/` |
| `npm run start` | Start the compiled production server |
| `npm run migrate` | Run Prisma migrations |
| `npm run studio` | Open Prisma Studio (visual DB explorer) |

From **`apps/web/`:**

| Script | Description |
|---|---|
| `npm run dev` | Start Next.js dev server |
| `npm run build` | Build for production |
| `npm run start` | Start the production server |

---

## Database Schema

```
User
 └── TodoList (many)
      └── TodoItem (many)
```

- **User** — `id`, `name`, `email`, `password`, `createdAt`
- **TodoList** — `id`, `goal`, `userId`, `createdAt`
- **TodoItem** — `id`, `task`, `description`, `isCompleted`, `order`, `priority` (LOW/MEDIUM/HIGH), `dueDate`, `estimatedTime`, `listId`
