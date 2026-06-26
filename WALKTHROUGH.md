# Project Walkthrough — ai-todo-mono

A comprehensive summary of all changes and features implemented in this project.

---

## Walkthrough 1 — Swagger/OpenAPI Integration

### Overview
Added Swagger/OpenAPI documentation to the Express + TypeScript API so all endpoints are self-documenting and explorable via a browser UI.

### Changes Made

#### 1. Installed Dependencies
Installed the following packages inside `apps/api`:

```bash
npm install swagger-jsdoc swagger-ui-express
npm install -D @types/swagger-jsdoc @types/swagger-ui-express
```

#### 2. Created Swagger Configuration
**File:** [`apps/api/src/config/swagger.ts`](apps/api/src/config/swagger.ts)

- Initialized `swagger-jsdoc` using OpenAPI 3.0.0.
- Pointed the Swagger metadata version to run dynamically off `package.json`.
- Configured a base URL server pointing to `/api`.
- Added a global `bearerAuth` security scheme (JWT Bearer Token format).
- Added schema definitions for all DTOs and response objects:
  - `RegisterBody`, `LoginBody`, `CreateTodoInput`, `AddTodoItemInput`, `UpdateTodoItemInput`
  - `TodoItemType`, `TodoListType`, `BrutalHonestyType`
  - Response wrappers: `AuthSuccessResponse`, `TodoListResponse`, `TodoGenerateResponse`, `TodoListArrayResponse`, `TodoItemResponse`, `NullDataResponse`, `ErrorResponse`

#### 3. Integrated Swagger UI Middleware
**File:** [`apps/api/src/app.ts`](apps/api/src/app.ts)

- Imported `swaggerUi` and `swaggerSpec`.
- Mounted Swagger UI at `/api/docs` and raw JSON spec at `/api/docs.json`, only when `NODE_ENV` is not `production`.

#### 4. Added Route Annotations

**[`apps/api/src/modules/auth/auth.routes.ts`](apps/api/src/modules/auth/auth.routes.ts)**
- `POST /auth/register` — documented payload, response, and validation error.
- `POST /auth/login` — documented payload, response, and validation error.

**[`apps/api/src/modules/todo/todo.routes.ts`](apps/api/src/modules/todo/todo.routes.ts)**
- All routes tagged under the `Todo` group.
- `bearerAuth` security linked to all protected routes.
- Path parameters (`listId`, `itemId`), request body payloads, success responses, and auth/not-found/validation errors all documented.

### Verification

```bash
> ai-todo@1.0.0 build
> tsc
```

Compiled successfully. Ran the dev server and fetched `/api/docs.json` — JSON output included all routes, parameters, tags, security settings, and component schemas as expected.

---

## Walkthrough 2 — Bug Fix: Duplicate List Generation

### Cause
In the Next.js loading page, the list generation API was called inside a `useEffect` hook. In development mode with React **StrictMode** enabled, React mounts, unmounts, and remounts components — running `useEffect` **twice**. With no concurrency guard, this sent two simultaneous `POST /api/todo/generate` requests, creating duplicate lists in the database.

### Resolution
**File:** [`apps/web/app/loading/page.tsx`](apps/web/app/loading/page.tsx)

- Added a `useRef(false)` guard (`started`) inside the component.
- The `useEffect` block checks `started.current` and immediately returns if `true`, otherwise sets it to `true` before calling the API.
- This restricts the API call to exactly **once** even under StrictMode double-mounting.

```diff
+  const started = useRef(false);

   useEffect(() => {
+    if (started.current) return;
+    started.current = true;

     async function generate() { ... }
     generate();
   }, [router]);
```

### Verification

```bash
npm run build --workspace=apps/web
```

Web project compiled successfully with no errors.

---

## Walkthrough 3 — Brutal Honesty Feasibility Evaluator (Due Date)

### Problem
The "Brutal Honesty" assessment was marking **every** goal as achievable regardless of the user's chosen deadline — because the due date was never being passed to the AI prompt.

### Root Cause
The `dueDate` collected on the frontend was stored in `sessionStorage` and sent in the API body, but:
1. The `createTodoSchema` Zod validator didn't include `dueDate`, so it was stripped from `req.body`.
2. The controller didn't extract `dueDate` from `req.body` or pass it to the service.
3. The service's LLM prompt had no knowledge of today's date or the user's deadline.

### Changes Made

#### 1. Updated Validation Schema
**File:** [`apps/api/src/modules/todo/todo.validation.ts`](apps/api/src/modules/todo/todo.validation.ts)

```diff
 export const createTodoSchema = z.object({
   body: z.object({
     goal: z.string({ message: 'Goal is required' }).min(3),
+    dueDate: z.string().optional(),
   }),
 });
```

#### 2. Updated Types
**File:** [`apps/api/src/types/todo.types.ts`](apps/api/src/types/todo.types.ts)

```diff
 export interface CreateTodoInput {
   goal: string;
+  dueDate?: string;
 }
```

#### 3. Wired `dueDate` Through Controller → Service
**File:** [`apps/api/src/modules/todo/todo.controller.ts`](apps/api/src/modules/todo/todo.controller.ts)

```diff
-  const { goal } = req.body;
-  const result = await todoService.generateTodoList(goal, userId);
+  const { goal, dueDate } = req.body;
+  const result = await todoService.generateTodoList(goal, userId, dueDate);
```

#### 4. Injected Timeline Into LLM Prompt
**File:** [`apps/api/src/modules/todo/todo.service.ts`](apps/api/src/modules/todo/todo.service.ts)

```typescript
async generateTodoList(goal: string, userId: string, dueDate?: string) {
  const todayStr = new Date().toISOString().slice(0, 10);
  const timelineInfo = dueDate
    ? `Today's date is ${todayStr}. The target deadline (due date) for this goal is ${dueDate}.`
    : '';
  // ...
  // Prompt now includes timelineInfo and instructs the LLM to evaluate
  // feasibility honestly against the deadline — setting isAchievable: false
  // with a sarcastic verdict/reasoning when the timeline is unrealistic.
}
```

### Verification

```bash
npm run build --workspace=apps/api
# ✓ Compiled successfully with no TypeScript errors
```

---

## Walkthrough 4 — Centralized Types Refactoring

### Problem
TypeScript interfaces and DTOs were scattered inside each module's own `*.types.ts` file (`auth.types.ts` inside `modules/auth/`, `todo.types.ts` inside `modules/todo/`). This made it harder to discover shared types and violated the separation of concerns between module logic and data contracts.

### Changes Made

#### 1. Created Central `src/types/` Files

| File | Interfaces |
|------|-----------|
| [`src/types/user.types.ts`](apps/api/src/types/user.types.ts) | `User`, `CreateUserDto` |
| [`src/types/auth.types.ts`](apps/api/src/types/auth.types.ts) | `RegisterBody`, `LoginBody`, `JwtPayload` |
| [`src/types/todo.types.ts`](apps/api/src/types/todo.types.ts) | `CreateTodoInput`, `AddTodoItemInput`, `UpdateTodoItemInput`, `TodoItemType`, `TodoListType`, `BrutalHonestyType` |

#### 2. Updated Imports Across Codebase

| File | Old Import | New Import |
|------|-----------|------------|
| `modules/auth/auth.service.ts` | `'./auth.types'` | `'../../types/auth.types'` |
| `middleware/auth.middleware.ts` | `'../modules/auth/auth.types'` | `'../types/auth.types'` |
| `modules/todo/todo.repository.ts` | `'./todo.types'` | `'../../types/todo.types'` |
| `modules/todo/todo.service.ts` | `'./todo.types'` | `'../../types/todo.types'` |

#### 3. Deleted Old Localized Files

```bash
rm apps/api/src/modules/auth/auth.types.ts
rm apps/api/src/modules/todo/todo.types.ts
```

### Verification

```bash
npm run build --workspace=apps/api
# ✓ All types resolve correctly, zero TypeScript errors
```

---

## Walkthrough 5 — README

**File:** [`README.md`](README.md) (monorepo root)

Created a comprehensive project README covering:
- Project structure (annotated directory tree)
- Tech stack table
- Step-by-step setup instructions (prerequisites → clone → install → `.env` → DB → run)
- All environment variables with descriptions
- Full API endpoint reference table
- Database schema summary
- Brutal Honesty feature explanation
- All available `npm run` scripts for root, API, and web workspaces
- Types directory reference
