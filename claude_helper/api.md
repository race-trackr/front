# API — Client & Modules

---

## apiClient (`src/lib/apiClient.ts`)

Instance Axios centrale. **Tout appel HTTP passe par là — jamais `axios` directement, jamais `fetch`.**

```typescript
import apiClient from '@/lib/apiClient'
```

### Configuration

```
Base URL : import.meta.env.VITE_API_URL || 'http://localhost:3333/api/v1'
Header   : Content-Type: application/json
```

### Intercepteur de requête

Lit le token depuis `localStorage` (`authToken`) et injecte `Authorization: Bearer {token}` automatiquement sur chaque requête.

> **Note :** Le token est aussi positionné directement sur `apiClient.defaults.headers.common` par `authStore` lors de la connexion/session restore. Les deux mécanismes coexistent.

### Intercepteur de réponse

- **401** → supprime `authToken` de `localStorage` (session expirée)
- Toutes les autres erreurs sont propagées normalement via `Promise.reject`

---

## Modules API (`src/lib/api/`)

Un fichier par domaine. Chaque fonction wrape un appel `apiClient` et retourne la donnée typée.

### Pattern standard

```typescript
// Lecture
export const getVehicles = async (params?): Promise<UserVehicleType[]> => {
  const response = await apiClient.get('/vehicles', { params })
  return response.data
}

// Création
export const createVehicle = async (payload: CreateVehiclePayload): Promise<UserVehicleType> => {
  const response = await apiClient.post('/vehicles', payload)
  return response.data
}

// Mise à jour
export const updateVehicle = async (
  id: number,
  payload: UpdateVehiclePayload
): Promise<UserVehicleType> => {
  const response = await apiClient.put(`/vehicles/${id}`, payload)
  return response.data
}

// Suppression
export const deleteVehicle = async (id: number): Promise<void> => {
  await apiClient.delete(`/vehicles/${id}`)
}
```

### vehicles.ts

| Fonction                         | Méthode | Endpoint        |
| -------------------------------- | ------- | --------------- |
| `getVehicles({ limit, offset })` | GET     | `/vehicles`     |
| `getVehicleByUUID(uuid: string)` | GET     | `/vehicles/:uuid` |
| `createVehicle(payload)`         | POST    | `/vehicles`     |
| `updateVehicle(id, payload)`     | PUT     | `/vehicles/:uuid` |
| `deleteVehicle(id)`              | DELETE  | `/vehicles/:uuid` |

### trackdays.ts

| Fonction                      | Méthode | Endpoint         | Retour                            |
| ----------------------------- | ------- | ---------------- | --------------------------------- |
| `getTrackdays(params?)`       | GET     | `/trackdays`     | `PaginatedResponse<TrackDayType>` |
| `getTrackdayById(id: string)` | GET     | `/trackdays/:id` | `TrackDayType`                    |
| `createTrackday(payload)`     | POST    | `/trackdays`     | `TrackDayType`                    |
| `updateTrackday(id, payload)` | PUT     | `/trackdays/:id` | `TrackDayType`                    |
| `deleteTrackday(id)`          | DELETE  | `/trackdays/:id` | `void`                            |

**Paramètres de `getTrackdays` :**

```typescript
interface GetTrackdaysParams {
  limit?: number
  page?: number // pagination basée sur les pages
  searchTerm?: string
  vehicleId?: number
  trackId?: number
}
```

### maintenances.ts

| Fonction                         | Méthode | Endpoint            |
| -------------------------------- | ------- | ------------------- |
| `getMaintenances(params?)`       | GET     | `/maintenances`     |
| `getMaintenanceById(id: number)` | GET     | `/maintenances/:id` |
| `createMaintenance(payload)`     | POST    | `/maintenances`     |
| `updateMaintenance(id, payload)` | PUT     | `/maintenances/:id` |
| `deleteMaintenance(id)`          | DELETE  | `/maintenances/:id` |

### dashboard.ts

| Fonction                | Méthode | Endpoint     | Retour             |
| ----------------------- | ------- | ------------ | ------------------ |
| `getDashboardSummary()` | GET     | `/dashboard` | `DashboardSummary` |

### tracks.ts

| Fonction           | Méthode | Endpoint      |
| ------------------ | ------- | ------------- |
| `getTracks()`      | GET     | `/tracks`     |
| `getTrackById(id)` | GET     | `/tracks/:id` |

### weather.ts

| Fonction                            | Méthode | Endpoint   | Retour            |
| ----------------------------------- | ------- | ---------- | ----------------- |
| `getWeatherForecast(trackId, date)` | GET     | `/weather` | `WeatherForecast` |

---

## Patterns React Query

### Lecture — useQuery

```typescript
const {
  data: vehicles,
  isLoading,
  isError,
} = useQuery({
  queryKey: ['vehicles'],
  queryFn: getVehicles,
})

// Avec paramètres (la queryKey inclut les params pour le cache)
const { data } = useQuery({
  queryKey: ['trackdays', { page, vehicleId, searchTerm }],
  queryFn: () => getTrackdays({ page, vehicleId, searchTerm }),
})
```

### Écriture — useMutation

```typescript
const queryClient = useQueryClient()

const mutation = useMutation({
  mutationFn: (payload: CreateVehiclePayload) => createVehicle(payload),
  onSuccess: () => {
    queryClient.invalidateQueries({ queryKey: ['vehicles'] }) // OBLIGATOIRE
    showSuccess(t('vehicle_created'))
    navigate('/vehicles')
  },
  onError: () => {
    showError(t('an_unexpected_error_occurred'))
  },
})
```

### Clés de cache utilisées

| Ressource      | QueryKey                                         |
| -------------- | ------------------------------------------------ |
| Véhicules      | `['vehicles']`                                   |
| Sessions piste | `['trackdays']` ou `['trackdays', params]`       |
| Maintenances   | `['maintenances']` ou `['maintenances', params]` |
| Dashboard      | `['dashboard']`                                  |
| Circuits       | `['tracks']`                                     |
| Pays           | `['countries']`                                  |

**Règle :** Toujours invalider la clé racine (ex: `['vehicles']`) pour toucher toutes les variantes cachées.

---

## Ajouter un nouveau module API

1. Créer `src/lib/api/mondomaine.ts`
2. Importer `apiClient` et les types nécessaires
3. Exporter des fonctions nommées (pas de classe)
4. Utiliser les types de payload de `@/types`
5. Utiliser le module dans les pages via `useQuery`/`useMutation`
