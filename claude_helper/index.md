# Race Trackr Frontend — Project Overview

## Overview

SPA React pour gérer des **sessions piste (track days)**, **véhicules** et **maintenances**. Interface multi-langue (en/fr/es/it), thème clair/sombre, accès par rôle (`user` / `owner`), consommation de l'API Race Trackr via REST.

---

## Tech Stack

| Couche | Technologie | Version |
|---|---|---|
| Build tool | Vite + SWC | ^6.3.4 |
| Langage | TypeScript | ~5.5 |
| Framework UI | React | ^18.3 |
| Routing | React Router DOM | ^6.26 |
| État serveur | TanStack React Query | ^5.56 |
| État client | Zustand | ^5.0 |
| Formulaires | React Hook Form + Zod | ^7.55 + ^3.24 |
| Composants UI | shadcn/ui (Radix UI) | — |
| Styles | Tailwind CSS | ^3.4 |
| Icônes | Lucide React | ^0.462 |
| Graphiques | Recharts | ^2.12 |
| i18n | i18next + react-i18next | ^25 + ^16 |
| HTTP | Axios | ^1.12 |
| Notifications | Sonner | ^1.5 |
| Thème | next-themes | ^0.3 |
| Dates | date-fns | ^3.6 |

---

## Structure du projet

```
front/
├── src/
│   ├── components/
│   │   ├── ui/              → Composants shadcn/ui (Radix primitives)
│   │   ├── Layout.tsx       → Grille principale sidebar + contenu
│   │   ├── Sidebar.tsx      → Navigation latérale (collapsible)
│   │   ├── AppBar.tsx       → Barre du haut + breadcrumbs
│   │   ├── ProtectedRoute.tsx → Garde de route (auth + rôle)
│   │   ├── VehicleForm.tsx  → Formulaire véhicule réutilisable
│   │   ├── TrackdayForm.tsx → Formulaire session piste
│   │   ├── MaintenanceForm.tsx → Formulaire maintenance
│   │   └── [autres composants métier]
│   ├── context/
│   │   └── AuthContext.tsx  → Provider React wrappant authStore
│   ├── hooks/
│   │   ├── useAuth.ts       → Accès au contexte auth
│   │   ├── useBreadcrumbs.tsx → Génération breadcrumbs depuis les routes
│   │   ├── useContentHeight.ts → Hauteur dynamique pour transitions tabs
│   │   ├── useDebounce.tsx  → Debounce input (recherche)
│   │   └── use-mobile.tsx   → Détection viewport mobile
│   ├── lib/
│   │   ├── apiClient.ts     → Instance Axios (header auth + interceptor 401)
│   │   ├── api/             → Fonctions API par domaine
│   │   │   ├── vehicles.ts
│   │   │   ├── trackdays.ts
│   │   │   ├── maintenances.ts
│   │   │   ├── dashboard.ts
│   │   │   ├── tracks.ts
│   │   │   └── weather.ts
│   │   └── utils.ts         → cn() (tailwind-merge + clsx)
│   ├── pages/               → Composants de route, organisés par domaine
│   │   ├── Auth/            → Login, Register, ForgotPassword
│   │   ├── Admin/           → Dashboard admin, users, tracks, countries
│   │   ├── Trackdays/       → List, Create, Edit, View
│   │   ├── Vehicles/        → List, Create, Edit, View
│   │   ├── Maintenances/    → List, Create, Edit, View
│   │   ├── Settings/        → Paramètres + API keys
│   │   ├── Dashboard.tsx
│   │   ├── Analytics.tsx
│   │   ├── Profile.tsx
│   │   └── Upgrade.tsx
│   ├── store/
│   │   ├── authStore.ts     → Auth state (Zustand + localStorage)
│   │   └── sidebarStore.ts  → État sidebar (Zustand + localStorage)
│   ├── locales/             → Fichiers de traduction JSON
│   │   ├── en/translation.json
│   │   ├── fr/translation.json
│   │   ├── es/translation.json
│   │   └── it/translation.json
│   ├── types/index.ts       → Tous les types TypeScript de l'app
│   ├── utils/toast.ts       → Utilitaires toast (showSuccess, showError…)
│   ├── App.tsx              → Config routing (createBrowserRouter)
│   ├── main.tsx             → Point d'entrée React
│   ├── i18n.ts              → Configuration i18next
│   └── globals.css          → Variables HSL theme + Tailwind base
├── public/images/           → Assets statiques (logo, backgrounds)
├── CLAUDE.md                → Règles non-négociables (lire en premier)
└── claude_helper/           → Guides détaillés par domaine (ce dossier)
```

---

## Import alias

```
@/*  →  src/*
```

Toujours utiliser `@/` — jamais de chemins relatifs remontant avec `../`.

---

## Variable d'environnement

```
VITE_API_URL   → URL de base de l'API (défaut: http://localhost:3333/api/v1)
```

---

## Commandes utiles

```bash
npm run dev        # Serveur de développement Vite (HMR)
npm run build      # Build production TypeScript + Vite
npm run build:dev  # Build en mode développement
npm run lint       # ESLint
npm run preview    # Preview du build production
```

---

## Guides détaillés

- [pages.md](pages.md) — Toutes les pages et leurs responsabilités
- [components.md](components.md) — Composants layout, formulaires, patterns UI
- [hooks.md](hooks.md) — Hooks personnalisés documentés
- [api.md](api.md) — apiClient, modules API, patterns React Query
- [store.md](store.md) — Stores Zustand (auth, sidebar)
- [routing.md](routing.md) — React Router v6, ProtectedRoute, breadcrumbs
- [i18n.md](i18n.md) — Internationalisation, conventions de traduction
- [types.md](types.md) — Types TypeScript, payload patterns
