import React, { useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useTranslation } from 'react-i18next'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
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
import apiClient from '@/lib/apiClient'
import { CountryType, TrackType } from '@/types'
import { ArrowLeft, Trash2 } from 'lucide-react' // Import des icônes

const formSchema = z.object({
  name: z.string().min(1, { message: 'Le nom de la piste est requis.' }),
  countryId: z.coerce.number().min(1, { message: 'Le pays est requis.' }),
  length: z.coerce.number().min(0.1, { message: 'La longueur doit être supérieure à 0.' }),
  address: z.string().nullable().optional(),
  city: z.string().min(1, { message: 'La ville est requise.' }),
  turns: z.string().nullable().optional(),
  width: z.union([z.string(), z.coerce.number()]).nullable().optional(),
  maxDb: z.coerce.number().min(0).nullable().optional(),
  bestLapTime: z.string().nullable().optional(),
  bestLapTimePilot: z.string().nullable().optional(),
  description: z.string().nullable().optional(),
})

const AdminTracksEdit: React.FC = () => {
  const { id } = useParams<{ id: string }>()
  const trackUUID = id
  const navigate = useNavigate()
  const { t } = useTranslation()
  const queryClient = useQueryClient()

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
      countryId: 0,
      length: 0.1,
      address: null,
      city: '',
      turns: null,
      width: null,
      maxDb: null,
      bestLapTime: null,
      bestLapTimePilot: null,
      description: null,
    },
  })

  const {
    data: track,
    isLoading,
    isError,
  } = useQuery<TrackType, Error, TrackType, ['track', string]>({
    queryKey: ['track', trackUUID],
    queryFn: async () => {
      const response = await apiClient.get(`/tracks/${trackUUID}`)
      return response.data
    },
    enabled: !!trackUUID,
  })

  const {
    data: countries,
    isLoading: isLoadingCountries,
    isError: isErrorCountries,
    error: countriesError,
  } = useQuery<
    CountryType[], // TQueryFnData
    Error, // TError
    CountryType[], // TData
    ['countries'] // TQueryKey
  >({
    queryKey: ['countries'],
    queryFn: async () => {
      const response = await apiClient.get('/countries')
      return response.data
    },
  })

  useEffect(() => {
    if (isErrorCountries && countriesError) {
      toast.error(t('an_unexpected_error_occurred'))
    }
  }, [isErrorCountries, countriesError, t])

  useEffect(() => {
    if (track) {
      form.reset({
        name: track.name,
        countryId: track.countryId,
        length: track.length,
        address: track.address || null,
        city: track.city,
        turns: track.turns || null,
        width: track.width || null,
        maxDb: track.maxDb || null,
        bestLapTime: track.bestLapTime || null,
        bestLapTimePilot: track.bestLapTimePilot || null,
        description: track.description || null,
      })
    }
  }, [track, form])

  const updateTrackMutation = useMutation({
    mutationFn: async (payload: z.infer<typeof formSchema>) => {
      const response = await apiClient.put(`/tracks/${trackUUID}`, payload)
      return response.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['track', trackUUID] })
      queryClient.invalidateQueries({ queryKey: ['tracks'] })
      toast.success(t('track_updated_successfully'))
      navigate('/admin/tracks')
    },
    onError: (error: Error) => {
      // Corrected onError type
      toast.error(t('an_unexpected_error_occurred'))
    },
  })

  const deleteTrackMutation = useMutation({
    mutationFn: async () => {
      await apiClient.delete(`/tracks/${trackUUID}`)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tracks'] })
      toast.success(t('track_deleted_successfully'))
      navigate('/admin/tracks')
    },
    onError: (error: Error) => {
      // Corrected onError type
      toast.error(t('an_unexpected_error_occurred'))
    },
  })

  const onSubmit = (values: z.infer<typeof formSchema>) => {
    const payload: z.infer<typeof formSchema> = {
      ...values,
      name: values.name,
      countryId: values.countryId,
      length: values.length,
      city: values.city,
      address: values.address === '' ? null : values.address,
      turns: values.turns === '' ? null : values.turns,
      width: values.width === '' ? null : values.width,
      maxDb: values.maxDb === undefined ? null : values.maxDb,
      bestLapTime: values.bestLapTime === '' ? null : values.bestLapTime,
      bestLapTimePilot: values.bestLapTimePilot === '' ? null : values.bestLapTimePilot,
      description: values.description === '' ? null : values.description,
    }
    updateTrackMutation.mutate(payload)
  }

  const handleDelete = () => {
    if (window.confirm(t('confirm_delete_track'))) {
      deleteTrackMutation.mutate()
    }
  }

  if (isLoading) {
    return <div className="space-y-6">{t('loading_track')}</div>
  }

  if (isError || !track) {
    return <div className="space-y-6 text-red-500">{t('error_loading_track')}</div>
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between mb-6">
        <Button variant="outline" onClick={() => navigate(-1)}>
          <ArrowLeft className="mr-2 h-4 w-4" /> {t('back')}
        </Button>
        <h1 className="text-3xl font-bold">{track.name}</h1>
        <Button
          variant="destructive"
          size="icon"
          onClick={handleDelete}
          disabled={deleteTrackMutation.isPending}
          className="btn-danger"
        >
          <Trash2 className="h-4 w-4" />
          <span className="sr-only">
            {deleteTrackMutation.isPending ? t('deleting') : t('delete_track_button')}
          </span>
        </Button>
      </div>

      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="grid grid-cols-1 md:grid-cols-2 gap-6"
        >
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  {t('track_name')}
                  <span className="text-destructive">*</span>
                </FormLabel>
                <FormControl>
                  <Input {...field} placeholder={t('enter_track_name')} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="countryId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  {t('country')}
                  <span className="text-destructive">*</span>
                </FormLabel>
                <Select
                  onValueChange={(value) => field.onChange(Number(value))}
                  value={field.value.toString()}
                  disabled={isLoadingCountries || isErrorCountries || updateTrackMutation.isPending}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue
                        placeholder={
                          isLoadingCountries
                            ? t('loading_countries')
                            : isErrorCountries
                              ? t('error_loading_countries')
                              : t('select_country')
                        }
                      />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {countries?.map(
                      (
                        country // Accessing countries safely
                      ) => (
                        <SelectItem key={country.id} value={country.id.toString()}>
                          {country.name}
                        </SelectItem>
                      )
                    )}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="length"
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  {t('length_km')}
                  <span className="text-destructive">*</span>
                </FormLabel>
                <FormControl>
                  <Input type="number" step="0.1" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="city"
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  {t('city')}
                  <span className="text-destructive">*</span>
                </FormLabel>
                <FormControl>
                  <Input {...field} placeholder={t('enter_city')} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="address"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t('address')}</FormLabel>
                <FormControl>
                  <Input {...field} value={field.value || ''} placeholder={t('enter_address')} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="turns"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t('turns')}</FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    value={field.value || ''}
                    placeholder={t('enter_number_of_turns')}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="width"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t('width')}</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    step="0.1"
                    {...field}
                    value={field.value === null ? '' : field.value}
                    placeholder={t('enter_track_width')}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="maxDb"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t('max_db')}</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    {...field}
                    value={field.value === null ? '' : field.value}
                    placeholder={t('enter_max_db')}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="bestLapTime"
            render={({ field }) => (
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
            name="bestLapTimePilot"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t('best_laptime_pilot')}</FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    value={field.value || ''}
                    placeholder={t('enter_best_laptime_pilot')}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="description"
            render={({ field }) => (
              <FormItem className="md:col-span-2">
                <FormLabel>{t('description')}</FormLabel>
                <FormControl>
                  <Textarea
                    rows={3}
                    {...field}
                    value={field.value || ''}
                    placeholder={t('enter_track_description')}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <div className="flex justify-between mt-4 md:col-span-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate(-1)}
              disabled={updateTrackMutation.isPending}
            >
              {t('cancel')}
            </Button>
            <Button
              type="submit"
              className="btn-primary-gradient"
              disabled={updateTrackMutation.isPending}
            >
              {updateTrackMutation.isPending ? t('saving') : t('save_changes')}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  )
}

export default AdminTracksEdit
