# Types TypeScript

Définis dans [src/types/index.ts](../src/types/index.ts). Toutes les interfaces et types de l'application sont centralisés ici.

---

## Règles

- Tous les types sont dans `src/types/index.ts` — pas de types locaux dans les composants sauf pour les props internes
- Les payloads de mutation sont dérivés des types entités via `Omit` + `Partial`
- Importer via `@/types` — jamais en chemin relatif

```typescript
import { UserVehicleType, CreateVehiclePayload } from '@/types'
```

---

## Types entités (réponses API)

### UserType

```typescript
interface UserType {
  id: number
  firstName: string | null
  lastName: string | null
  email: string
  countryId: number | null
  role: UserRole // 'owner' | 'user'
  avatar: string | null
  preferences?: UserPreferences | null
  createdAt: string
  updatedAt: string | null

  // Relations optionnelles (présentes si expand)
  vehicles?: UserVehicleType[]
  trackDays?: TrackDayType[]
  subscription?: SubscriptionType
}

type UserRole = 'owner' | 'user'
```

### UserVehicleType

```typescript
interface UserVehicleType {
  id: number
  userId: number
  name: string
  slug: string
  type: VehicleCategory // 'car' | 'motorcycle' | 'karting' | 'other'
  brand: string | null
  model: string | null
  year: number | null
  licensePlate: string | null
  details: string | null
  createdAt: string
  updatedAt: string

  // Relations optionnelles
  user?: UserType
  trackDays?: TrackDayType[]
  maintenances?: MaintenanceRecordType[]
}
```

### TrackDayType

```typescript
interface TrackDayType {
  id: string // UUID
  userId: number
  trackId: number
  userVehicleId: number | null // null si véhicule supprimé (SET NULL)
  date: string
  weather: WeatherCondition | null // 'clear' | 'cloudy' | 'rainy'
  airTemperature: number | null
  trackTemperature: number | null
  trackCondition: TrackCondition | null // 'wet' | 'dry' | 'moist'
  notes: string | null
  bestLapTime: string | null
  totalLaps: number | null
  totalDistance: number | null
  chronos: { lapTime: string; isBest: boolean }[] | null
  createdAt: string
  updatedAt: string

  // Relations optionnelles
  user?: UserType
  track?: TrackType
  vehicle?: UserVehicleType
}
```

### MaintenanceRecordType

```typescript
interface MaintenanceRecordType {
  id: number
  userId: number
  userVehicleId: number
  name: string
  type: MaintenanceRecordTypeType // 'maintenance' | 'repair' | 'modification' | 'other'
  date: string
  details?: string | null
  cost: number | null
  mileage: number | null
  nextDueMileage: number | null
  createdAt: string
  updatedAt: string

  // Relations optionnelles
  user?: UserType
  vehicle?: UserVehicleType
}
```

### TrackType

```typescript
interface TrackType {
  id: number
  name: string
  slug: string
  city: string
  countryId: number
  address: string | null
  turns: string | null
  length: number
  width: string | number | null
  maxDb: number | null
  bestLapTime: string | null
  bestLapTimePilot: string | null
  description: string | null
  createdAt: string
  updatedAt: string

  country?: CountryType
  trackDays?: TrackDayType[]
}
```

### CountryType

```typescript
interface CountryType {
  id: number
  name: string
  slug: string
  iso: string
  timezone: string
  capital: string
  createdAt: string
  updatedAt: string
}
```

### SubscriptionType

```typescript
interface SubscriptionType {
  id: string
  userId: number
  plan: 'free' | 'starter' | 'pro' | 'premium' | 'enterprise'
  status: 'active' | 'inactive' | 'cancelled'
  startDate: string
  endDate: string | null
  createdAt: string
  updatedAt: string
}
```

---

## Types union (enums)

```typescript
type UserRole = 'owner' | 'user'
type VehicleCategory = 'car' | 'motorcycle' | 'karting' | 'other'
type WeatherCondition = 'clear' | 'cloudy' | 'rainy'
type TrackCondition = 'wet' | 'dry' | 'moist'
type MaintenanceRecordTypeType = 'maintenance' | 'repair' | 'modification' | 'other'
```

---

## Types de payload (mutations)

Dérivés des entités via `Omit` pour exclure les champs gérés par l'API.

```typescript
// Véhicule
type CreateVehiclePayload = Omit<
  UserVehicleType,
  'id' | 'userId' | 'slug' | 'createdAt' | 'updatedAt' | 'user' | 'trackDays' | 'maintenances'
>
type UpdateVehiclePayload = Partial<CreateVehiclePayload>

// Session piste
type CreateTrackdayPayload = Omit<
  TrackDayType,
  'id' | 'userId' | 'createdAt' | 'updatedAt' | 'user' | 'track' | 'vehicle'
>
type UpdateTrackdayPayload = Partial<CreateTrackdayPayload>

// Maintenance
type CreateMaintenancePayload = Omit<
  MaintenanceRecordType,
  'id' | 'userId' | 'createdAt' | 'updatedAt' | 'user' | 'vehicle'
>
type UpdateMaintenancePayload = Partial<CreateMaintenancePayload>
```

---

## Types d'authentification

```typescript
interface LoginPayload {
  email: string
  password: string
}

interface RegisterPayload {
  firstName: string
  lastName: string
  email: string
  password: string
  countryId: number
}

interface AuthResponse {
  token: string
  user: UserType
}
```

---

## PaginatedResponse

```typescript
interface PaginatedResponse<T> {
  data: T[];
  meta: {
    total: number;
    perPage: number;
    currentPage: number;
    lastPage: number;
    firstPage: number;
    lastPageUrl: string;
    nextPageUrl: string | null;
    previousPageUrl: string | null;
  };
}

// Usage
const { data: trackdays } = useQuery<PaginatedResponse<TrackDayType>>({...});
// trackdays.data → TrackDayType[]
// trackdays.meta.currentPage → numéro de page courant
```

---

## ApiKey et Permissions

```typescript
type PermissionAction = 'create' | 'read' | 'update' | 'delete'
type ResourcePermissions = { [action in PermissionAction]: boolean }
type Permissions = {
  trackdays: ResourcePermissions
  vehicles: ResourcePermissions
  maintenances: ResourcePermissions
  tracks: ResourcePermissions
  countries: ResourcePermissions
  users: ResourcePermissions
}

interface ApiKey {
  id: string
  name: string
  key: string
  createdAt: string
  expiresAt: string | null
  permissions: Permissions
}
```

---

## Ajouter un nouveau type

1. Ajouter dans `src/types/index.ts`
2. Si c'est un payload de mutation, le dériver avec `Omit<EntiteType, 'champs_api_gérés'>` et `Partial<>` pour update
3. Exporter et importer via `@/types`
