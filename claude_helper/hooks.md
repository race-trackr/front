# Hooks

Situés dans [src/hooks/](../src/hooks/).

---

## useAuth()

**Fichier :** `hooks/useAuth.ts`

Accède au contexte d'authentification fourni par `AuthProvider`. Lance une erreur si utilisé en dehors du provider.

```typescript
const { user, token, isAuthenticated, login, register, logout, loading } = useAuth()
```

| Valeur               | Type               | Description                                 |
| -------------------- | ------------------ | ------------------------------------------- |
| `user`               | `UserType \| null` | Utilisateur connecté                        |
| `token`              | `string \| null`   | Bearer token JWT                            |
| `isAuthenticated`    | `boolean`          | Session active                              |
| `loading`            | `boolean`          | En cours d'initialisation (splash/skeleton) |
| `login(credentials)` | `Promise<void>`    | Connexion — redirige vers `/dashboard`      |
| `register(userData)` | `Promise<void>`    | Inscription + auto-connexion                |
| `logout()`           | `void`             | Déconnexion + clear localStorage            |

**Règle :** Toujours utiliser ce hook — jamais lire directement `localStorage` ou `authStore` dans un composant.

---

## useBreadcrumbs()

**Fichier :** `hooks/useBreadcrumbs.tsx`

Génère le tableau de breadcrumbs à partir des routes matchées et de leur `handle.crumb`.

```typescript
const crumbs = useBreadcrumbs()
// → [{ path: '/', label: 'Home' }, { path: '/vehicles', label: 'Vehicles' }, ...]
```

- Préfixe automatiquement "Home" (`/`) si absent
- Chaque route doit définir `handle: { crumb: () => t('label') }` pour apparaître
- Pour les labels dynamiques (basés sur des données chargées), `crumb` reçoit l'objet `match` entier (qui contient `match.data` du loader)

**Exemple de route avec breadcrumb dynamique :**

```typescript
{
  path: ':id',
  element: <VehicleView />,
  loader: async ({ params }) => getVehicleByUUID(params.id),
  handle: {
    crumb: ({ data }) => data?.vehicle?.name ?? t('view_vehicle')
  }
}
```

---

## useContentHeight()

**Fichier :** `hooks/useContentHeight.ts`

Calcule dynamiquement la hauteur du contenu actif dans des onglets pour animer la transition de hauteur sans saut visuel.

```typescript
const { contentRef, height } = useContentHeight();

// Usage
<div style={{ height: `${height}px` }} className="overflow-hidden transition-all">
  <div ref={contentRef}>
    <TabsContent value="tab1">...</TabsContent>
    <TabsContent value="tab2">...</TabsContent>
  </div>
</div>
```

**Mécanisme :** observe via `ResizeObserver` + `MutationObserver` (sur `data-state`) et met à jour `height` à chaque changement d'onglet actif.

**Utilisé dans :** `AuthTabs.tsx` pour l'animation entre Login et Register.

---

## useDebounce()

**Fichier :** `hooks/useDebounce.tsx`

Retarde la mise à jour d'une valeur — typiquement pour éviter d'envoyer une requête à chaque frappe clavier.

```typescript
const debouncedSearch = useDebounce(searchTerm, 400) // 400ms

useEffect(() => {
  refetch() // appelé seulement après 400ms sans frappe
}, [debouncedSearch])
```

**Utilisé dans :** les pages de liste avec champ de recherche (`TrackdayList`, `VehicleList`…).

---

## use-mobile()

**Fichier :** `hooks/use-mobile.tsx`

Détecte si le viewport est en mode mobile (breakpoint `768px`).

```typescript
const isMobile = useMobile()
```

Utilisé pour adapter le rendu (ex: masquer la sidebar, changer la disposition d'un composant).

---

## Hooks tiers fréquemment utilisés

| Hook               | Import                  | Usage                                                          |
| ------------------ | ----------------------- | -------------------------------------------------------------- |
| `useTranslation()` | `react-i18next`         | `const { t, i18n } = useTranslation()` — accès aux traductions |
| `useQuery()`       | `@tanstack/react-query` | Récupération de données avec cache                             |
| `useMutation()`    | `@tanstack/react-query` | Écriture + invalidation cache                                  |
| `useQueryClient()` | `@tanstack/react-query` | `queryClient.invalidateQueries(...)`                           |
| `useForm()`        | `react-hook-form`       | État formulaire avec `zodResolver`                             |
| `useNavigate()`    | `react-router-dom`      | Navigation programmatique                                      |
| `useParams()`      | `react-router-dom`      | Paramètres de l'URL (`:id`)                                    |
| `useLoaderData()`  | `react-router-dom`      | Données pré-chargées par le loader                             |
| `useMatches()`     | `react-router-dom`      | Routes matchées (utilisé dans `useBreadcrumbs`)                |
| `useTheme()`       | `next-themes`           | Accès au thème courant (light/dark)                            |

---

## Créer un nouveau hook

Un hook personnalisé est justifié quand la logique :

- est utilisée dans **au moins 2 composants distincts**, OU
- implique **plusieurs hooks imbriqués** (ex: observer + state + effect)

Sinon, laisser la logique inline dans le composant.

```typescript
// Squelette standard
import { useState, useEffect } from 'react'

export const useMyHook = (param: string) => {
  const [value, setValue] = useState<string>('')

  useEffect(() => {
    // logique
  }, [param])

  return { value }
}
```
