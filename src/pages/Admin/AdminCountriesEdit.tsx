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
import apiClient from '@/lib/apiClient'
import { CountryType } from '@/types'
import { ArrowLeft, Trash2 } from 'lucide-react' // Import des icônes

const formSchema = z.object({
  name: z.string().min(1, { message: 'Le nom du pays est requis.' }),
  iso: z.string().length(2, { message: 'Le code ISO doit contenir 2 caractères.' }),
  timezone: z.string().min(1, { message: 'Le fuseau horaire est requis.' }),
  capital: z.string().min(1, { message: 'La capitale est requise.' }),
})

const AdminCountriesEdit: React.FC = () => {
  const { uuid } = useParams<{ uuid: string }>()
  const countryUUID = uuid
  const navigate = useNavigate()
  const { t } = useTranslation()
  const queryClient = useQueryClient()

  const form = useForm<Omit<CountryType, 'id' | 'uuid' | 'slug' | 'createdAt' | 'updatedAt'>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
      iso: '',
      timezone: '',
      capital: '',
    },
  })

  const {
    data: country,
    isLoading,
    isError,
  } = useQuery<CountryType>({
    queryKey: ['country', countryUUID],
    queryFn: async () => {
      const response = await apiClient.get(`/countries/${countryUUID}`)
      return response.data
    },
    enabled: !!countryUUID,
  })

  useEffect(() => {
    if (country) {
      form.reset({
        name: country.name,
        iso: country.iso,
        timezone: country.timezone,
        capital: country.capital,
      })
    }
  }, [country, form])

  const updateCountryMutation = useMutation({
    mutationFn: async (payload: Omit<CountryType, 'id' | 'uuid' | 'slug' | 'createdAt' | 'updatedAt'>) => {
      const response = await apiClient.put(`/countries/${countryUUID}`, payload)
      return response.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['country', countryUUID] })
      queryClient.invalidateQueries({ queryKey: ['countries'] })
      toast.success(t('country_updated_successfully'))
      navigate('/admin/countries')
    },
    onError: (error: any) => {
      toast.error(t('an_unexpected_error_occurred')) // Generic error message
    },
  })

  const deleteCountryMutation = useMutation({
    mutationFn: async () => {
      await apiClient.delete(`/countries/${countryUUID}`)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['countries'] })
      toast.success(t('country_deleted_successfully'))
      navigate('/admin/countries')
    },
    onError: (error: any) => {
      toast.error(t('an_unexpected_error_occurred')) // Generic error message
    },
  })

  const onSubmit = (values: z.infer<typeof formSchema>) => {
    const payload: Omit<CountryType, 'id' | 'uuid' | 'slug' | 'createdAt' | 'updatedAt'> = {
      ...values,
      name: values.name,
      iso: values.iso,
      timezone: values.timezone,
      capital: values.capital,
    }
    updateCountryMutation.mutate(payload)
  }

  const handleDelete = () => {
    if (window.confirm(t('confirm_delete_country'))) {
      deleteCountryMutation.mutate()
    }
  }

  if (isLoading) {
    return <div className="space-y-6">{t('loading_country')}</div>
  }

  if (isError || !country) {
    return <div className="space-y-6 text-red-500">{t('error_loading_country')}</div>
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between mb-6">
        <Button variant="outline" onClick={() => navigate(-1)}>
          <ArrowLeft className="mr-2 h-4 w-4" /> {t('back')}
        </Button>
        <h1 className="text-3xl font-bold">{country.name}</h1>
        <Button
          variant="destructive"
          size="icon"
          onClick={handleDelete}
          disabled={deleteCountryMutation.isPending}
          className="btn-danger"
        >
          <Trash2 className="h-4 w-4" />
          <span className="sr-only">
            {deleteCountryMutation.isPending ? t('deleting') : t('delete_country_button')}
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
                  {t('country_name')}
                  <span className="text-destructive">*</span>
                </FormLabel>
                <FormControl>
                  <Input {...field} placeholder={t('enter_country_name')} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="iso"
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  {t('country_iso')}
                  <span className="text-destructive">*</span>
                </FormLabel>
                <FormControl>
                  <Input {...field} placeholder="e.g., US, FR" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="timezone"
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  {t('timezone')}
                  <span className="text-destructive">*</span>
                </FormLabel>
                <FormControl>
                  <Input {...field} placeholder="e.g., CET, EST" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="capital"
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  {t('capital')}
                  <span className="text-destructive">*</span>
                </FormLabel>
                <FormControl>
                  <Input {...field} placeholder={t('enter_capital')} />
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
              disabled={updateCountryMutation.isPending}
            >
              {t('cancel')}
            </Button>
            <Button
              type="submit"
              className="btn-primary-gradient"
              disabled={updateCountryMutation.isPending}
            >
              {updateCountryMutation.isPending ? t('saving') : t('save_changes')}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  )
}

export default AdminCountriesEdit
