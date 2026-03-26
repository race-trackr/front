# Stores Zustand

Situés dans [src/store/](../src/store/). Gestion de l'état **client** (non-serveur). L'état serveur est dans React Query.

---

## Règle fondamentale

- **État serveur** (données API) → React Query
- **État client persisté** (session, UI) → Zustand + localStorage
- **État UI local** (modal ouvert, champ en cours) → useState

---

## authStore.ts

Gère l'authentification. Persisté dans `localStorage` sous la clé `auth-storage` (uniquement le **token** — pas l'objet user).

### Interface

```typescript
interface AuthState {
  user: UserType | null;
  token: string | null;
  isAuthenticated: boolean;
  loading: boolean;

  initializeAuth: () => Promise<void>;
  login: (credentials: LoginPayload) => Promise<void>;
  register: (userData: RegisterPayload) => Promise<void>;
  logout: () => void;
  setUser: (user: UserType) => void;
}
```

### Méthodes

#### `initializeAuth()`
Appelée au démarrage par `AuthProvider`. Si un token est en localStorage, positionne l'header Axios et appelle `GET /users/me` pour restaurer l'objet `user` en mémoire. En cas d'erreur (token expiré) : nettoie l'état.

#### `login(credentials)`
```
POST /auth/login → token
→ set Authorization header sur apiClient
GET /users/me → user
→ set { token, user, isAuthenticated: true }
→ showSuccess
```

#### `register(userData)`
```
POST /auth/register
→ appelle login() automatiquement (auto-connexion)
```

#### `logout()`
```
→ set { user: null, token: null, isAuthenticated: false }
→ delete Authorization header sur apiClient
→ showSuccess
```

#### `setUser(user)`
Met à jour l'objet `user` en mémoire sans toucher au token. Utilisé après mise à jour du profil (`Profile.tsx`).

### Persistance

```typescript
// Seul le token est persisté en localStorage
partialize: (state) => ({ token: state.token })
```

Au démarrage (`onRehydrateStorage`) : si un token est trouvé, positionne l'header Axios avant même que React soit rendu, puis appelle `initializeAuth()`.

### Accès dans les composants

**Ne jamais importer `useAuthStore` directement dans un composant.** Passer toujours par le hook `useAuth()` qui lit le contexte `AuthContext`.

```typescript
// ✗ Wrong
import { useAuthStore } from '@/store/authStore';
const { user } = useAuthStore();

// ✓ Right
import { useAuth } from '@/hooks/useAuth';
const { user } = useAuth();
```

L'accès direct à `useAuthStore` est réservé au store lui-même et à `AuthContext.tsx`.

---

## sidebarStore.ts

Gère l'état collapsed/expanded de la sidebar. Persisté dans `localStorage` sous la clé `sidebar-storage`.

### Interface

```typescript
interface SidebarState {
  isCollapsed: boolean;
  toggleCollapse: () => void;
}
```

### Accès

```typescript
import { useSidebarStore } from '@/store/sidebarStore';
const { isCollapsed, toggleCollapse } = useSidebarStore();
```

Utilisé dans `Layout.tsx` (calcul de la largeur CSS) et `Sidebar.tsx` (rendu icône/label).

---

## Ajouter un nouveau store

Uniquement si l'état doit persister entre les navigations ou être partagé par des composants distants dans l'arbre. Pour un état local à un composant, utiliser `useState`.

```typescript
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

interface MyState {
  value: string;
  setValue: (v: string) => void;
}

export const useMyStore = create<MyState>()(
  persist(
    (set) => ({
      value: '',
      setValue: (v) => set({ value: v }),
    }),
    {
      name: 'my-storage',       // clé localStorage
      storage: createJSONStorage(() => localStorage),
    }
  )
);
```
