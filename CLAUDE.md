# CLAUDE.md

## Where to Add New Rules

When adding a new coding rule or convention, add it to this file only if it is a **cross-cutting, non-negotiable hard rule** that applies regardless of file type. Domain-specific notes (e.g. form patterns, query conventions) go in inline comments or a dedicated `claude_helper/` file if one is created.

---

## Hard Rules — Violation = Rejected Code

These rules are **non-negotiable**. They apply to every line of code in every session. Breaking any of them means the code will be rejected. They are numbered for reference.

### HR-1: React Query for all server state — no `useState` for API data

Never use `useState` + `useEffect` to fetch data from the API. All server state goes through `useQuery` (reads) and `useMutation` (writes). Local UI state (modals, form inputs) may use `useState`.

| Wrong                                                                           | Right                                                                                   |
| ------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------- |
| `const [vehicles, setVehicles] = useState([]); useEffect(() => fetch(...), [])` | `const { data: vehicles } = useQuery({ queryKey: ['vehicles'], queryFn: getVehicles })` |

### HR-2: Always invalidate the React Query cache after mutations

Every `useMutation` that creates, updates, or deletes a resource **must** call `queryClient.invalidateQueries({ queryKey: [...] })` in `onSuccess`. Never leave stale data in the cache after a write.

```typescript
// Wrong
useMutation({ mutationFn: deleteVehicle })

// Right
useMutation({
  mutationFn: deleteVehicle,
  onSuccess: () => queryClient.invalidateQueries({ queryKey: ['vehicles'] }),
})
```

### HR-3: React Hook Form + Zod for every form — no manual validation

Every form must use `useForm()` with `zodResolver()`. Never validate manually with `if (!value)` checks or raw `onChange` handlers. Schema goes in a `const formSchema = z.object({...})` defined at the top of the component file.

### HR-4: Always use `apiClient` — never raw `fetch` or `axios`

All HTTP calls must go through the Axios instance at `@/lib/apiClient`. It handles the `Authorization` header and 401 interceptor automatically. Never import `axios` directly or use `fetch()` for API calls.

### HR-5: Always use the `t()` function — no hardcoded user-facing strings

Every string visible to the user (labels, placeholders, error messages, button text) **must** use `t('key')` from `useTranslation()`. Add the key to all four locale files (`en`, `fr`, `es`, `it`) before submitting.

### HR-6: Use `@/*` path aliases — no relative `../../` imports

All imports must use the `@/*` alias (maps to `src/*`). Never use relative paths that traverse up directories.

| Wrong                                            | Right                                     |
| ------------------------------------------------ | ----------------------------------------- |
| `import apiClient from '../../../lib/apiClient'` | `import apiClient from '@/lib/apiClient'` |

### HR-7: Use existing shadcn/ui components — never build custom UI primitives

Before creating a new UI component, check `@/components/ui/`. shadcn/ui covers buttons, inputs, selects, dialogs, cards, tables, tabs, toasts, and 50+ more. Only build a custom component when the existing library has no equivalent.

### HR-8: Use `useAuth()` for auth state — never read localStorage directly

Auth state (user, token, isAuthenticated) must be accessed via the `useAuth()` hook. Never read `localStorage.getItem('auth-storage')` or similar in components. The hook reads from `authStore` which manages persistence internally.

### HR-9: English-only code

All variable names, function names, type names, and comments must be in English. French is allowed only in locale translation files (`locales/fr/translation.json`).

### HR-10: No single-use helper methods

Never extract a function whose sole purpose is to wrap a one-liner used in only one place. Inline the logic directly. A helper function is only justified when called from **at least two distinct places** or when it encapsulates genuinely complex logic.

---

## Pre-Flight — Before ANY Code Change

Read the applicable `claude_helper/` guide before editing.

| You're about to touch...                  | Read first                                                                                                        |
| ----------------------------------------- | ----------------------------------------------------------------------------------------------------------------- |
| Une page / route                          | [`claude_helper/pages.md`](claude_helper/pages.md) + [`claude_helper/routing.md`](claude_helper/routing.md)       |
| Un formulaire                             | [`claude_helper/components.md`](claude_helper/components.md) + [`claude_helper/types.md`](claude_helper/types.md) |
| Un appel API / mutation                   | [`claude_helper/api.md`](claude_helper/api.md)                                                                    |
| Un composant UI                           | [`claude_helper/components.md`](claude_helper/components.md)                                                      |
| Un hook                                   | [`claude_helper/hooks.md`](claude_helper/hooks.md)                                                                |
| Auth / rôles / stores                     | [`claude_helper/store.md`](claude_helper/store.md) + [`claude_helper/routing.md`](claude_helper/routing.md)       |
| Une chaîne traduite                       | [`claude_helper/i18n.md`](claude_helper/i18n.md)                                                                  |
| Un type TypeScript                        | [`claude_helper/types.md`](claude_helper/types.md)                                                                |
| Une nouvelle feature (plusieurs fichiers) | [`claude_helper/index.md`](claude_helper/index.md) puis les guides concernés                                      |

---

## Project Overview

**Race Trackr Frontend** — React SPA for managing racing track days, vehicles, and maintenance records. Supports light/dark mode, 4 languages (en/fr/es/it), role-based access (`user` / `owner`), and subscription-gated features.

### Architecture

```
src/
├── components/ui/      → shadcn/ui components (Radix UI primitives)
├── components/         → Layout, forms, feature-specific components
├── context/            → AuthContext (wraps authStore for React tree)
├── hooks/              → Custom hooks (useAuth, useBreadcrumbs, useDebounce…)
├── lib/
│   ├── apiClient.ts    → Axios instance (auth header + 401 interceptor)
│   └── api/            → Per-domain API functions (vehicles, trackdays…)
├── pages/              → Route-level components, organized by domain
├── store/              → Zustand stores (authStore, sidebarStore)
├── locales/            → i18n JSON files (en, fr, es, it)
├── types/              → All TypeScript types and payload interfaces
└── globals.css         → Tailwind base + HSL theme variables
```

### Key Concepts

- **Auth:** Zustand store (`authStore`) persists token in localStorage; user data re-fetched on session restore via `/users/me`
- **Server state:** React Query v5 — all API data lives in the query cache, not in component state
- **Forms:** React Hook Form + Zod on every form — schema defined at top of file, resolver passed to `useForm`
- **Routing:** React Router v6 `createBrowserRouter` with nested routes, loader functions for data pre-fetch, and `handle.crumb()` for breadcrumbs
- **Roles:** `user` (standard) and `owner` (admin access) — enforced in `ProtectedRoute` via `allowedRoles` prop
- **i18n:** 4 languages, auto-detected from browser, fallback to English — always use `t()`, never hardcode strings
- **Theming:** `next-themes` + Tailwind dark mode (`class` strategy) + CSS HSL variables in `globals.css`
- **Overflow:** `html, body` have `overflow: hidden` globally (app shell never scrolls) — page-level scroll must be handled by the route container itself using `h-screen overflow-y-auto`

### Import Alias

```
@/*  →  src/*
```

Always use `@/` — never relative paths traversing up directories.

### Environment Variables

```
VITE_API_URL   → Backend base URL (default: http://localhost:3333/api/v1)
```
