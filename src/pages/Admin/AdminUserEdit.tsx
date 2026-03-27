import React, { useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useQuery, useMutation } from '@tanstack/react-query'
import { toast } from 'sonner'
import apiClient from '@/lib/apiClient'
import { useTranslation } from 'react-i18next'
import { Button } from '@/components/ui/button'
import {
  Form,
  FormControl,
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

const AdminUserEdit: React.FC = () => {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const { id } = useParams<{ id: string }>()

  const userSchema = z.object({
    email: z.string().email({ message: t('invalid_email') }),
    firstName: z.string().min(1, { message: t('first_name_required') }),
    lastName: z.string().min(1, { message: t('last_name_required') }),
    role: z.enum(['user', 'owner']),
  })

  type UserFormValues = z.infer<typeof userSchema>

  const form = useForm<UserFormValues>({
    resolver: zodResolver(userSchema),
    defaultValues: {
      email: '',
      firstName: '',
      lastName: '',
      role: 'user',
    },
  })

  const {
    data: userData,
    isLoading,
    isError,
  } = useQuery<UserFormValues>({
    queryKey: ['admin-user', id],
    queryFn: async () => {
      const response = await apiClient.get(`/admin/users/${id}`)
      return response.data.user
    },
    enabled: !!id,
  })

  const { data: ownerCount } = useQuery<{ total: number }>({
    queryKey: ['admin-users-count', 'owner'],
    queryFn: async () => {
      const response = await apiClient.get('/admin/users', {
        params: { countOnly: true, role: 'owner' },
      })
      return response.data
    },
    enabled: !!userData,
  })

  const isLastOwner = userData?.role === 'owner' && (ownerCount?.total ?? 0) <= 1

  useEffect(() => {
    if (userData) {
      form.reset(userData)
    }
  }, [userData])

  const updateMutation = useMutation({
    mutationFn: async (values: UserFormValues) => {
      const response = await apiClient.put(`/admin/users/${id}`, values)
      return response.data
    },
    onSuccess: () => {
      toast.success(t('user_updated_successfully', { defaultValue: 'User updated' }))
      navigate('/admin/users')
    },
    onError: () => {
      toast.error(t('an_unexpected_error_occurred'))
    },
  })

  const onSubmit = (values: UserFormValues) => {
    updateMutation.mutate(values)
  }

  if (isLoading) {
    return <div className="space-y-6">{t('loading')}...</div>
  }

  if (isError) {
    return <div className="space-y-6 text-red-500">{t('an_unexpected_error_occurred')}</div>
  }

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">{id ? t('edit_user') : t('create_user')}</h1>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  {t('email')} <span className="text-destructive">*</span>
                </FormLabel>
                <FormControl>
                  <Input type="email" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="firstName"
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  {t('first_name')} <span className="text-destructive">*</span>
                </FormLabel>
                <FormControl>
                  <Input {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="lastName"
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  {t('last_name')} <span className="text-destructive">*</span>
                </FormLabel>
                <FormControl>
                  <Input {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="role"
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  {t('role')} <span className="text-destructive">*</span>
                </FormLabel>
                <Select onValueChange={field.onChange} value={field.value} disabled={isLastOwner}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder={t('select_option')} />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="user">{t('user')}</SelectItem>
                    <SelectItem value="owner">{t('owner')}</SelectItem>
                  </SelectContent>
                </Select>
                {isLastOwner && (
                  <p className="text-sm text-muted-foreground">
                    {t('cannot_change_last_owner_role')}
                  </p>
                )}
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="flex justify-between gap-4">
            <Button variant="outline" onClick={() => navigate('/admin/users')}>
              {t('cancel')}
            </Button>
            <Button type="submit" disabled={updateMutation.isPending}>
              {updateMutation.isPending ? t('saving') : t('save_changes')}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  )
}

export default AdminUserEdit
