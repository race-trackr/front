# Routing

Configuré dans [src/App.tsx](../src/App.tsx) via `createBrowserRouter` de React Router v6.

---

## Structure des routes

```
/                         → Index (public)
/auth                     → AuthTabs (public)
/auth/forgot-password     → ForgotPassword (public)

── ProtectedRoute (auth requis) ──────────────────────────
  └── Layout
      ├── /dashboard
      ├── /trackdays
      ├── /trackdays/create
      ├── /trackdays/:id
      ├── /trackdays/edit/:id
      ├── /vehicles
      ├── /vehicles/create
      ├── /vehicles/:id
      ├── /vehicles/edit/:id
      ├── /maintenances
      ├── /maintenances/create
      ├── /maintenances/:id
      ├── /maintenances/edit/:id
      ├── /analytics
      ├── /settings
      ├── /settings/api-keys/create
      ├── /profile
      └── /upgrade

── ProtectedRoute (role: 'owner' requis) ─────────────────
  └── Layout
      └── /admin
          ├── /admin (index)
          ├── /admin/tracks
          ├── /admin/tracks/create
          ├── /admin/tracks/edit/:id
          ├── /admin/countries
          ├── /admin/countries/create
          ├── /admin/countries/edit/:id
          └── /admin/users
              ├── /admin/users (index)
              ├── /admin/users/create
              └── /admin/users/edit/:id

* → NotFound
```

---

## ProtectedRoute

Composant-garde utilisé comme `element` sur les groupes de routes nécessitant une authentification.

```typescript
// Auth seul
{ element: <ProtectedRoute />, children: [...routes] }

// Auth + rôle spécifique
{ element: <ProtectedRoute allowedRoles={['owner']} />, children: [...routes] }
```

**Décision tree :**

1. `loading === true` → `<Skeleton />` (init auth en cours)
2. `!isAuthenticated` → `<Navigate to="/auth" />`
3. `allowedRoles` défini et `user.role` absent → `<Navigate to="/dashboard" />`
4. Tout OK → `<Outlet />`

---

## Loaders (pré-chargement de données)

Les routes d'édition et de visualisation pré-chargent leurs données via `loader`. Les données sont disponibles dans le composant via `useLoaderData()`.

```typescript
// Dans App.tsx
{
  path: ':id',
  element: <VehicleView />,
  loader: async ({ params }) => {
    const vehicle = await getVehicleByUUID(Number(params.id!));
    return { vehicle };
  },
  handle: { crumb: ({ data }) => data?.vehicle?.name ?? t('view_vehicle') }
}

// Dans le composant
const { vehicle } = useLoaderData() as { vehicle: UserVehicleType };
```

**Quand utiliser un loader vs useQuery :**

- Loader : données nécessaires au rendu initial de la page (détail, édition)
- useQuery : données secondaires, rafraîchissables, paginées

---

## Breadcrumbs

Chaque route qui doit apparaître dans le breadcrumb définit un `handle.crumb`.

### Breadcrumb statique

```typescript
{
  path: 'vehicles',
  handle: { crumb: () => t('vehicles') }
}
```

### Breadcrumb dynamique (depuis loader)

```typescript
{
  path: ':id',
  loader: async ({ params }) => getVehicleByUUID(params.id),
  handle: {
    crumb: ({ data }: { data: { vehicle: UserVehicleType } }) =>
      data?.vehicle?.name ?? t('view_vehicle')
  }
}
```

`useBreadcrumbs()` dans `Layout.tsx` lit tous les matches et construit le tableau `[{ path, label }]`.

---

## Ajouter une nouvelle route

### Route simple (dans Layout)

```typescript
// Dans routesConfig, dans le bloc element: <Layout />
{
  path: '/ma-page',
  element: <MaPage />,
  handle: { crumb: () => t('ma_page') },
}
```

Ne pas oublier :

1. Ajouter le lien dans `Sidebar.tsx`
2. Ajouter la clé de traduction dans les 4 locales

### Route avec paramètre + loader

```typescript
{
  path: ':id',
  element: <MonDetailPage />,
  loader: async ({ params }) => {
    const item = await getItemById(Number(params.id!));
    return { item };
  },
  handle: {
    crumb: ({ data }) => data?.item?.name ?? t('view_item')
  },
  errorElement: <ErrorPage />,
}
```

### Route admin (owner uniquement)

Ajouter dans le bloc `element: <ProtectedRoute allowedRoles={['owner']} />`.

---

## Navigation programmatique

```typescript
import { useNavigate } from 'react-router-dom'
const navigate = useNavigate()

navigate('/vehicles') // push
navigate(-1) // retour
navigate('/vehicles', { replace: true }) // replace (après login)
```

---

## errorElement

Chaque groupe de routes racine définit `errorElement: <ErrorPage />` pour capturer les erreurs de loader et de rendu.
