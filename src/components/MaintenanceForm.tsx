import React from 'react'
import { useTranslation } from 'react-i18next'
import { useForm, UseFormReturn } from 'react-hook-form'
import { z } from 'zod'
import { format } from 'date-fns'
import { Button } from '@/components/ui/button'
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { DatePicker } from '@/components/ui/date-picker'
import { PlusCircle } from 'lucide-react'
import { UserVehicleType } from '@/types'
import { Textarea } from './ui/textarea'

/**
 * Schema used by both create & edit pages.  Exported for typing and resolver.
 */
export const maintenanceFormSchema = z.object({
  userVehicleId: z.coerce.number().min(1, { message: 'Le véhicule est requis.' }),
  name: z.string().min(1, { message: 'Le nom de la maintenance est requis.' }),
  type: z.enum(['maintenance', 'repair', 'modification', 'other'], {
    message: 'Le type de maintenance est requis.',
  }),
  date: z.string().min(1, { message: 'La date est requise.' }),
  details: z.string().nullable().optional(),
  cost: z.coerce
    .number()
    .min(0, { message: 'Le coût ne peut pas être négatif.' })
    .nullable()
    .optional(),
  mileage: z.coerce
    .number()
    .min(0, { message: 'Le kilométrage ne peut pas être négatif.' })
    .nullable()
    .optional(),
  nextDueMileage: z.coerce
    .number()
    .min(0, { message: 'Le kilométrage de la prochaine échéance ne peut pas être négatif.' })
    .nullable()
    .optional(),
})

export type MaintenanceFormValues = z.infer<typeof maintenanceFormSchema>

interface MaintenanceFormProps {
  form: UseFormReturn<MaintenanceFormValues>
  onSubmit: (values: MaintenanceFormValues) => void
  submitLabel: string
  isSubmitting?: boolean
  cancelLabel: string
  onCancel: () => void
  vehicles?: UserVehicleType[]
  isLoadingVehicles: boolean
  isErrorVehicles: boolean
  onAddVehicle: () => void
}

const MaintenanceForm: React.FC<MaintenanceFormProps> = ({
  form,
  onSubmit,
  submitLabel,
  isSubmitting = false,
  cancelLabel,
  onCancel,
  vehicles,
  isLoadingVehicles,
  isErrorVehicles,
  onAddVehicle,
}) => {
  const { t } = useTranslation()

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="grid grid-cols-1 md:grid-cols-2 gap-6"
      >
        <FormField
          control={form.control}
          name="userVehicleId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>
                {t('vehicle')}
                <span className="text-destructive">*</span>
              </FormLabel>
              <Select
                onValueChange={(value) => {
                  if (value === 'create-new-vehicle') {
                    onAddVehicle()
                  } else {
                    field.onChange(Number(value))
                  }
                }}
                value={field.value.toString()}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder={t('select_a_vehicle')} />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {isLoadingVehicles ? (
                    <SelectItem value="loading" disabled>
                      {t('loading_vehicles')}
                    </SelectItem>
                  ) : isErrorVehicles || !vehicles || vehicles.length === 0 ? (
                    <SelectItem
                      value="create-new-vehicle"
                      className="text-blue-600 cursor-pointer hover:bg-accent"
                    >
                      <div className="flex items-center">
                        <PlusCircle className="mr-2 h-4 w-4" /> {t('create_vehicle')}
                      </div>
                    </SelectItem>
                  ) : (
                    vehicles.map((vehicle) => (
                      <SelectItem key={vehicle.id} value={vehicle.id.toString()}>
                        {vehicle.name} ({vehicle.model || vehicle.brand || t('not_specified')})
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>
                {t('maintenance_name')}
                <span className="text-destructive">*</span>
              </FormLabel>
              <FormControl>
                <Input {...field} placeholder={t('enter_maintenance_name')} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="type"
          render={({ field }) => (
            <FormItem>
              <FormLabel>
                {t('type')}
                <span className="text-destructive">*</span>
              </FormLabel>
              <Select onValueChange={field.onChange} value={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder={t('select_maintenance_type')} />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="maintenance">{t('maintenance_type_maintenance')}</SelectItem>
                  <SelectItem value="repair">{t('maintenance_type_repair')}</SelectItem>
                  <SelectItem value="modification">{t('maintenance_type_modification')}</SelectItem>
                  <SelectItem value="other">{t('maintenance_type_other')}</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="date"
          render={({ field }) => (
            <FormItem>
              <FormLabel>
                {t('date')}
                <span className="text-destructive">*</span>
              </FormLabel>
              <FormControl>
                <DatePicker
                  value={field.value ? new Date(field.value) : undefined}
                  onChange={(date) => field.onChange(date ? format(date, 'yyyy-MM-dd') : '')}
                  disabled={field.disabled}
                  placeholder={t('pick_a_date')}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="cost"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t('cost')}</FormLabel>
              <FormControl>
                <Input
                  type="number"
                  step="0.01"
                  {...field}
                  value={field.value === null ? '' : field.value}
                  placeholder={t('enter_cost')}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="mileage"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t('mileage')}</FormLabel>
              <FormControl>
                <Input
                  type="number"
                  {...field}
                  value={field.value === null ? '' : field.value}
                  placeholder={t('enter_mileage')}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="nextDueMileage"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t('next_due_mileage')}</FormLabel>
              <FormControl>
                <Input
                  type="number"
                  {...field}
                  value={field.value === null ? '' : field.value}
                  placeholder={t('enter_next_due_mileage')}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="details"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t('details')}</FormLabel>
              <FormControl>
                <Textarea {...field} placeholder={t('enter_details')} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex justify-between mt-4 md:col-span-2">
          <Button type="button" variant="outline" onClick={onCancel}>
            {cancelLabel}
          </Button>
          <Button type="submit" className="btn-primary-gradient" disabled={isSubmitting}>
            {isSubmitting ? t('saving') : submitLabel}
          </Button>
        </div>
      </form>
    </Form>
  )
}

export default MaintenanceForm
