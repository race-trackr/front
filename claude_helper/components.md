# Components

Situés dans [src/components/](../src/components/).

---

## Hiérarchie

```
components/
├── ui/              → shadcn/ui (50+ composants Radix UI wrappés)
├── Layout.tsx       → Grille principale de l'app connectée
├── Sidebar.tsx      → Navigation latérale
├── AppBar.tsx       → Barre du haut
├── ProtectedRoute.tsx → Garde d'accès aux routes
├── VehicleForm.tsx
├── TrackdayForm.tsx
├── MaintenanceForm.tsx
├── UserProfileForm.tsx
├── ConfirmDeleteDialog.tsx
├── DashboardCharts.tsx
├── MaintenanceCostChart.tsx
├── DataTable.tsx
├── LanguageSwitcher.tsx
├── UserMenu.tsx
├── GoogleIcon.tsx
├── PasswordInput.tsx
└── ErrorPage.tsx
```

---

## Layout.tsx

Grille CSS `h-screen` à deux colonnes : sidebar + contenu principal.

```
┌──────────────────┬─────────────────────────────┐
│  Sidebar         │  AppBar (breadcrumbs)        │
│  (280px / 60px)  ├─────────────────────────────┤
│                  │  <main> overflow-y-auto      │
│                  │    <Outlet />                │
│                  │                              │
└──────────────────┴─────────────────────────────┘
```

- La largeur de la sidebar est pilotée par `sidebarStore.isCollapsed` → CSS variable `--sidebar-width`
- Sur mobile (`md:` breakpoint), la sidebar est masquée (`hidden md:block`)
- Le `<main>` a `overflow-y-auto` — c'est lui le conteneur scrollable de chaque page
- **Ne jamais mettre `h-screen` sur un enfant de `<main>`** — utiliser `flex-1` à la place

### Ajouter une page dans le layout

1. Ajouter la route dans `App.tsx` sous le bloc `element: <Layout />`
2. Ajouter le lien dans `Sidebar.tsx`
3. Définir `handle.crumb` sur la route pour le breadcrumb

---

## Sidebar.tsx

Navigation avec icônes Lucide + labels. Reçoit `isCollapsed: boolean` en prop.

- En mode collapsed : icônes seules + tooltips
- En mode expanded : icônes + labels
- Les labels respectent `t('clé')` pour l'i18n

---

## AppBar.tsx

Barre supérieure. Reçoit `breadcrumbs: Breadcrumb[]`. Contient :
- Breadcrumb navigation (liens cliquables sauf dernier)
- `UserMenu` (profil, déconnexion)
- `LanguageSwitcher`
- Toggle thème

---

## ProtectedRoute.tsx

Composant-garde wrappant les routes protégées.

```typescript
// Usage dans App.tsx
{ element: <ProtectedRoute />, children: [...] }                    // auth requis
{ element: <ProtectedRoute allowedRoles={['owner']} />, children: [...] }  // rôle requis
```

**Comportement :**
- `loading: true` → affiche squelette Skeleton
- `!isAuthenticated` → redirige vers `/auth`
- `isAuthenticated` mais rôle non autorisé → redirige vers `/dashboard`
- `isAuthenticated` + rôle OK → rend `<Outlet />`

---

## Formulaires réutilisables

Tous les formulaires suivent le même pattern : ils reçoivent une instance `form` (UseFormReturn) et un callback `onSubmit`. La page parente crée le formulaire et gère la mutation.

### Pattern formulaire

```typescript
// Dans la page (parent)
const form = useForm<VehicleFormValues>({
  resolver: zodResolver(vehicleFormSchema),
  defaultValues: { ... },
});

const mutation = useMutation({
  mutationFn: createVehicle,
  onSuccess: () => {
    queryClient.invalidateQueries({ queryKey: ['vehicles'] });
    navigate('/vehicles');
  },
});

// Rendu
<VehicleForm
  form={form}
  onSubmit={mutation.mutate}
  isLoading={mutation.isPending}
  submitLabel={t('create')}
  onCancel={() => navigate('/vehicles')}
/>
```

### VehicleForm.tsx
Champs : name, type (select), brand, model, year, licensePlate, details.

### TrackdayForm.tsx
Champs : date, trackId (select), userVehicleId (select), weather, trackCondition, airTemperature, trackTemperature, bestLapTime, totalLaps, totalDistance, chronos (dynamique), notes.

### MaintenanceForm.tsx
Champs : name, type (select), date, userVehicleId (select), cost, mileage, nextDueMileage, details.

### UserProfileForm.tsx
Champs : firstName, lastName, email, countryId, avatar, preferences (notifications).

---

## ConfirmDeleteDialog.tsx

Dialog de confirmation avant suppression. Props : `open`, `onOpenChange`, `onConfirm`, `title`, `description`.

```typescript
<ConfirmDeleteDialog
  open={isDeleteOpen}
  onOpenChange={setIsDeleteOpen}
  onConfirm={() => deleteMutation.mutate(vehicle.id)}
  title={t('delete_vehicle')}
  description={t('delete_vehicle_confirm')}
/>
```

---

## DashboardCharts.tsx / MaintenanceCostChart.tsx

Composants Recharts. Reçoivent les données en props. N'effectuent aucun appel API.

---

## DataTable.tsx

Table générique basée sur `@tanstack/react-table`. Reçoit `columns` et `data`. Gère le tri, la pagination client.

---

## PasswordInput.tsx

Input password avec toggle visibilité (œil). Wrapping de l'`Input` shadcn/ui.

---

## Composants shadcn/ui (`components/ui/`)

Toujours chercher ici avant de créer un nouveau composant. Composants disponibles (non exhaustif) :

| Composant | Usage |
|---|---|
| `Button` | Tous les boutons — variantes: default, destructive, outline, ghost, link |
| `Input` | Champs texte |
| `Select` | Listes déroulantes |
| `Dialog` | Modales |
| `Card` + `CardHeader` + `CardContent` | Blocs de contenu |
| `Form` + `FormField` + `FormItem` + `FormLabel` + `FormControl` + `FormMessage` | Wrapper react-hook-form |
| `Tabs` + `TabsList` + `TabsTrigger` + `TabsContent` | Onglets |
| `Table` | Tableaux |
| `Badge` | Étiquettes colorées |
| `Skeleton` | Placeholder de chargement |
| `Separator` | Ligne de séparation |
| `Tooltip` | Info-bulles |
| `DropdownMenu` | Menus déroulants |
| `Sheet` | Panneau latéral mobile |
| `Calendar` + `Popover` | Date picker |

### Utilisation correcte de Form (react-hook-form)

```typescript
<Form {...form}>
  <form onSubmit={form.handleSubmit(onSubmit)}>
    <FormField
      control={form.control}
      name="fieldName"
      render={({ field }) => (
        <FormItem>
          <FormLabel>{t('label')}</FormLabel>
          <FormControl>
            <Input {...field} />
          </FormControl>
          <FormMessage />  {/* affiche automatiquement l'erreur Zod */}
        </FormItem>
      )}
    />
  </form>
</Form>
```

---

## Utilitaire cn()

```typescript
import { cn } from '@/lib/utils';

// Fusion Tailwind + conditionnel
<div className={cn("base-class", isActive && "active-class", variant === 'primary' && "primary-class")} />
```

Toujours utiliser `cn()` pour combiner des classes Tailwind conditionnelles — jamais de concaténation de strings.
