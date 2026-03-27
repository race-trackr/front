import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Combobox } from '@/components/ui/combobox'
import { DatePicker } from '@/components/ui/date-picker'
import { Button } from '@/components/ui/button'
import MultiLineChronoInput from '@/components/MultiLineChronoInput'
import { PlusCircle } from 'lucide-react'
import { format } from 'date-fns'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { CreateTrackdayPayload, UserVehicleType, TrackType } from '@/types'
import { useEffect } from 'react'

const chronoFormatRegex = /^(\d{1,2})\.(\d{2})\.(\d{3})$/

type TrackOption = { value: string; label: string }

type Props = {
  vehicles?: UserVehicleType[]
  tracks?: TrackType[]
  trackOptions?: TrackOption[]
  isLoadingVehicles?: boolean
  isErrorVehicles?: boolean
  isLoadingTracks?: boolean
  isErrorTracks?: boolean
  isDatePickerOpen: boolean
  setIsDatePickerOpen: (v: boolean) => void
  isOwner?: boolean
  submitLabel?: string
  submitDisabled?: boolean
  cancelLabel?: string
  onCancel?: () => void
  onSubmit: (values: CreateTrackdayPayload) => void
  defaultValues?: Partial<CreateTrackdayPayload>
}

export default function TrackdayForm({
  onSubmit,
  vehicles,
  tracks,
  trackOptions,
  isLoadingVehicles,
  isErrorVehicles,
  isLoadingTracks,
  isErrorTracks,
  isDatePickerOpen,
  setIsDatePickerOpen,
  isOwner,
  submitLabel = 'Save',
  submitDisabled = false,
  cancelLabel = 'Cancel',
  onCancel,
  defaultValues: propsDefaultValues,
}: Props) {
  const { t } = useTranslation()
  const navigate = useNavigate()

  const formSchema = z.object({
    userVehicleId: z.coerce
      .number()
      .min(1, { message: t('vehicle_required') })
      .nullable()
      .optional(),
    trackId: z.coerce.number().min(1, { message: t('track_required') }),
    date: z.string().min(1, { message: t('date_required') }),
    weather: z.enum(['clear', 'cloudy', 'rainy']).nullable().optional(),
    airTemperature: z.coerce
      .number()
      .min(-50)
      .max(50, { message: t('air_temperature_invalid') })
      .nullable()
      .optional(),
    trackTemperature: z.coerce
      .number()
      .min(-50)
      .max(100, { message: t('track_temperature_invalid') })
      .nullable()
      .optional(),
    trackCondition: z.enum(['wet', 'dry', 'moist']).nullable().optional(),
    notes: z.string().nullable().optional(),
    bestLapTime: z
      .string()
      .refine((val) => !val || chronoFormatRegex.test(val), {
        message: t('laptime_format_invalid'),
      })
      .nullable()
      .optional(),
    totalLaps: z.coerce
      .number()
      .min(0, { message: t('total_laps_invalid') })
      .nullable()
      .optional(),
    totalDistance: z.coerce
      .number()
      .min(0, { message: t('total_distance_invalid') })
      .nullable()
      .optional(),
    chronos: z
      .array(
        z.object({
          lapTime: z
            .string()
            .refine((val) => val === '' || chronoFormatRegex.test(val), {
              message: t('laptime_format_invalid'),
            }),
          isBest: z.boolean(),
        })
      )
      .nullable()
      .optional(),
  })

  const defaultFormValues = {
    userVehicleId: null,
    trackId: 0,
    date: '',
    weather: null,
    airTemperature: null,
    trackTemperature: null,
    trackCondition: null,
    notes: null,
    bestLapTime: null,
    totalLaps: null,
    totalDistance: null,
    chronos: null,
  }

  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: { ...defaultFormValues, ...propsDefaultValues },
  })

  useEffect(() => {
    if (propsDefaultValues) {
      form.reset({ ...defaultFormValues, ...propsDefaultValues })
    }
  }, [propsDefaultValues])

  const handleSubmit = (values: any) => {
    const filteredChronos =
      values.chronos
        ?.filter((c: any) => c.lapTime !== '')
        .map((c: any) => ({ lapTime: c.lapTime, isBest: c.isBest })) || null

    const payload: CreateTrackdayPayload = {
      ...values,
      userVehicleId: values.userVehicleId === undefined ? null : values.userVehicleId,
      trackId: values.trackId,
      date: values.date,
      weather: values.weather === undefined ? null : values.weather,
      trackCondition: values.trackCondition === undefined ? null : values.trackCondition,
      airTemperature: values.airTemperature === undefined ? null : values.airTemperature,
      trackTemperature: values.trackTemperature === undefined ? null : values.trackTemperature,
      notes: values.notes === '' ? null : values.notes,
      bestLapTime: values.bestLapTime === '' ? null : values.bestLapTime,
      totalLaps: values.totalLaps === undefined ? null : values.totalLaps,
      totalDistance: values.totalDistance === undefined ? null : values.totalDistance,
      chronos: filteredChronos && filteredChronos.length > 0 ? filteredChronos : null,
    }
    onSubmit(payload)
  }
  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(handleSubmit)}
        className="grid grid-cols-1 md:grid-cols-2 gap-6"
      >
        <FormField
          control={form.control}
          name="userVehicleId"
          render={({ field }: any) => (
            <FormItem>
              <FormLabel>{t('vehicle')}</FormLabel>
              <Select
                onValueChange={(value: any) => {
                  if (value === 'create-new-vehicle') {
                    navigate('/vehicles/create')
                  } else if (value === 'loading') {
                    return // ignore
                  } else {
                    const num = Number(value)
                    if (!isNaN(num)) {
                      field.onChange(num)
                    }
                  }
                }}
                value={
                  field.value != null && field.value !== 0 ? field.value.toString() : undefined
                }
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder={t('select_vehicle')} />
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
                        <PlusCircle className="mr-2 h-4 w-4" /> {t('create_new_vehicle')}
                      </div>
                    </SelectItem>
                  ) : (
                    vehicles.map((vehicle: any) => (
                      <SelectItem key={vehicle.id} value={vehicle.id.toString()}>
                        {vehicle.name} ({vehicle.licensePlate || '—'})
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
          name="trackId"
          render={({ field }: any) => (
            <FormItem>
              <FormLabel>
                {t('track')} <span className="text-destructive">*</span>
              </FormLabel>
              <FormControl>
                <Combobox
                  options={trackOptions || []}
                  value={field.value?.toString()}
                  onValueChange={(value: any) => field.onChange(Number(value))}
                  placeholder={t('select_track')}
                  emptyMessage={t('no_tracks_found')}
                  disabled={isLoadingTracks}
                  {...(isOwner ? { onCreateNew: undefined, createNewLabel: undefined } : {})}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="date"
          render={({ field }: any) => (
            <FormItem>
              <FormLabel>
                {t('date')} <span className="text-destructive">*</span>
              </FormLabel>
              <FormControl>
                <DatePicker
                  value={field.value ? new Date(field.value) : undefined}
                  onChange={(date: Date | null) =>
                    field.onChange(date ? format(date, 'yyyy-MM-dd') : '')
                  }
                  disabled={field.disabled}
                  placeholder="Choisir une date"
                  open={isDatePickerOpen}
                  onOpenChange={setIsDatePickerOpen}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="weather"
          render={({ field }: any) => (
            <FormItem>
              <FormLabel>{t('weather')}</FormLabel>
              <Select
                onValueChange={(value: any) =>
                  field.onChange(value === 'null-option' ? null : value)
                }
                value={field.value || 'null-option'}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder={t('select_weather')} />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="null-option">{t('unspecified')}</SelectItem>
                  <SelectItem value="clear">{t('clear')}</SelectItem>
                  <SelectItem value="cloudy">{t('cloudy')}</SelectItem>
                  <SelectItem value="rainy">{t('rainy')}</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="airTemperature"
          render={({ field }: any) => (
            <FormItem>
              <FormLabel>{t('air_temperature')}</FormLabel>
              <FormControl>
                <Input
                  type="number"
                  step="0.1"
                  {...field}
                  value={field.value === null ? '' : field.value}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="trackTemperature"
          render={({ field }: any) => (
            <FormItem>
              <FormLabel>{t('track_temperature')}</FormLabel>
              <FormControl>
                <Input
                  type="number"
                  step="0.1"
                  {...field}
                  value={field.value === null ? '' : field.value}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="trackCondition"
          render={({ field }: any) => (
            <FormItem>
              <FormLabel>{t('track_condition')}</FormLabel>
              <Select
                onValueChange={(value: any) =>
                  field.onChange(value === 'null-option' ? null : value)
                }
                value={field.value || 'null-option'}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder={t('select_track_condition')} />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="null-option">{t('unspecified')}</SelectItem>
                  <SelectItem value="wet">{t('wet')}</SelectItem>
                  <SelectItem value="dry">{t('dry')}</SelectItem>
                  <SelectItem value="moist">{t('moist')}</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="bestLapTime"
          render={({ field }: any) => (
            <FormItem>
              <FormLabel>{t('best_laptime')}</FormLabel>
              <FormControl>
                <Input {...field} value={field.value || ''} placeholder="MM.SS.mmm" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="totalLaps"
          render={({ field }: any) => (
            <FormItem>
              <FormLabel>{t('total_laps')}</FormLabel>
              <FormControl>
                <Input type="number" {...field} value={field.value === null ? '' : field.value} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="totalDistance"
          render={({ field }: any) => (
            <FormItem>
              <FormLabel>{t('total_distance')}</FormLabel>
              <FormControl>
                <Input
                  type="number"
                  step="0.1"
                  {...field}
                  value={field.value === null ? '' : field.value}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="notes"
          render={({ field }: any) => (
            <FormItem className="md:col-span-2">
              <FormLabel>{t('notes')}</FormLabel>
              <FormControl>
                <Textarea rows={3} {...field} value={field.value || ''} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="chronos"
          render={({ field }: any) => (
            <FormItem>
              <FormLabel>{t('chronos')}</FormLabel>
              <FormControl>
                <MultiLineChronoInput
                  value={field.value}
                  onChange={field.onChange}
                  placeholder={t('lap_time_format')}
                  disabled={field.disabled}
                />
              </FormControl>
            </FormItem>
          )}
        />

        <div className="flex justify-between mt-4 md:col-span-2">
          <Button type="button" variant="outline" onClick={() => (onCancel ? onCancel() : null)}>
            {cancelLabel}
          </Button>
          <Button type="submit" className="btn-primary-gradient" disabled={submitDisabled}>
            {submitLabel}
          </Button>
        </div>
      </form>
    </Form>
  )
}
