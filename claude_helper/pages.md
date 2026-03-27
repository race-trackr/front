# Pages

Situées dans [src/pages/](../src/pages/). Chaque page est un composant de route — elle orchestre la récupération de données (React Query) et le rendu, sans logique métier embarquée.

---

## Conventions générales

- Les pages **lisent** les données via `useQuery` — jamais avec `useState + useEffect + fetch`
- Les pages **écrivent** via `useMutation` avec invalidation du cache dans `onSuccess`
- Les chaînes visibles utilisent toujours `t('clé')` — jamais de texte en dur
- La navigation programmatique se fait via `useNavigate()`
- Les données pré-chargées par le loader React Router sont accessibles via `useLoaderData()`

---

## Auth/

### AuthTabs.tsx

Point d'entrée auth. Tabs Login / Inscription. Sélection par `?tab=login` ou `?tab=register` dans l'URL. Animation de hauteur sur le changement d'onglet via `useContentHeight`.

**Particularité scroll mobile :** conteneur `h-screen overflow-y-auto` (le body a `overflow: hidden` globalement — c'est le div lui-même qui scrolle).

### Login.tsx

Formulaire email + mot de passe. Appelle `authStore.login()` via `useAuth()`. Redirige vers `/dashboard` après succès.

### Register.tsx

Formulaire prénom, nom, email, mot de passe, pays. Appelle `authStore.register()` via `useAuth()`. Connecte automatiquement l'utilisateur après inscription.

### ForgotPassword.tsx

Formulaire de réinitialisation de mot de passe par email.

---

## Dashboard.tsx

Page d'accueil après connexion. Affiche :

- Statistiques sommaires (`DashboardSummary` via `/dashboard`)
- Sessions récentes (3 dernières via `getTrackdays({ limit: 3, recent: true })`)
- Véhicules récents
- Graphiques via `DashboardCharts`

---

## Trackdays/

### TrackdayList.tsx

Liste paginée des sessions. Filtres : véhicule, circuit, recherche textuelle. Pagination via métadonnées `PaginatedResponse`. `useQuery(['trackdays', params])`.

### TrackdayCreate.tsx

Formulaire de création. Utilise `TrackdayForm`. `useMutation` → `createTrackday` → invalide `['trackdays']`.

### TrackdayEdit.tsx

Formulaire de modification. Données pré-chargées via `loader` (React Router). `useMutation` → `updateTrackday`.

### TrackdayView.tsx

Détail d'une session : infos générales, météo, condition piste, chronos, véhicule, circuit. Données chargées via `loader`.

---

## Vehicles/

### VehicleList.tsx

Liste de tous les véhicules de l'utilisateur. `useQuery(['vehicles'])`.

### VehicleCreate.tsx

Formulaire de création. Utilise `VehicleForm`. `useMutation` → `createVehicle` → invalide `['vehicles']`.

### VehicleEdit.tsx

Formulaire de modification. Données pré-chargées via `loader`. `useMutation` → `updateVehicle`.

### VehicleView.tsx

Détail d'un véhicule : informations, liste des sessions associées, liste des maintenances.

---

## Maintenances/

### MaintenanceList.tsx

Liste paginée des maintenances, filtrable par véhicule. `useQuery(['maintenances', params])`.

### MaintenanceCreate.tsx

Formulaire de création. Utilise `MaintenanceForm`. `useMutation` → `createMaintenance` → invalide `['maintenances']`.

### MaintenanceEdit.tsx

Formulaire de modification. Données pré-chargées via `loader`.

### MaintenanceView.tsx

Détail d'une maintenance : type, coût, kilométrage, prochaine échéance.

---

## Analytics.tsx

Tableaux de bord analytiques : évolution des chronos, coûts de maintenance par véhicule, fréquence des sessions. Utilise Recharts.

---

## Profile.tsx

Profil de l'utilisateur connecté. Formulaire `UserProfileForm`. Met à jour via `PUT /users/me` et appelle `authStore.setUser()` pour synchroniser l'état local.

---

## Settings/

### Settings.tsx

Paramètres généraux : thème, langue, notifications, gestion des API keys.

### ApiKeyCreate.tsx

Formulaire de création d'une API key avec définition des permissions par ressource (CRUD).

---

## Upgrade.tsx

Page de présentation des plans d'abonnement (free, starter, pro, premium, enterprise).

---

## Admin/

Toutes les pages admin sont protégées par `ProtectedRoute allowedRoles={['owner']}`.

### AdminDashboard.tsx

Vue d'ensemble de l'administration.

### AdminTracks.tsx / AdminTracksCreate.tsx / AdminTracksEdit.tsx

Gestion des circuits (CRUD). `loader` sur Edit pour pré-charger les données.

### AdminCountries.tsx / AdminCountriesCreate.tsx / AdminCountriesEdit.tsx

Gestion des pays de référence.

### AdminUsers.tsx / AdminUserEdit.tsx

Gestion des utilisateurs. `AdminUserEdit` sert aussi à la création (même composant).

---

## Index.tsx

Landing page publique (non-connecté).

## NotFound.tsx

Page 404 — route fallback `*`.
