import React, { useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useTranslation } from 'react-i18next';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { PasswordInput } from '@/components/PasswordInput';
import apiClient from '@/lib/apiClient';
import { CountryType, UpdateUserPayload, UserType } from '@/types';
import { getUserById, updateUser, deleteUser } from '@/lib/api/users';
import ConfirmDeleteDialog from '@/components/ConfirmDeleteDialog';
import { ArrowLeft, Trash2 } from 'lucide-react';
import { Separator } from '@/components/ui/separator';

const formSchema = z.object({
  fullName: z.string().min(2, { message: "Le nom complet doit contenir au moins 2 caractères." }),
  email: z.string().email({ message: "Adresse email invalide." }),
  countryId: z.coerce.number().min(1, { message: "Le pays est requis." }),
  role: z.enum(['user', 'admin'], { message: "Le rôle est requis." }),
  password: z.string().optional(),
}).superRefine((data, ctx) => {
  if (data.password && data.password.length < 6) {
    ctx.addIssue({
      code: z.ZodIssueCode.too_small,
      minimum: 6,
      type: "string",
      inclusive: true,
      message: "Le mot de passe doit contenir au moins 6 caractères.",
      path: ["password"],
    });
  }
});

const AdminUsersEdit: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const userId = Number(id);
  const navigate = useNavigate();
  const { t } = useTranslation();
  const queryClient = useQueryClient();

  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = React.useState(false);

  const form = useForm<UpdateUserPayload>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      fullName: '',
      email: '',
      countryId: 0,
      role: 'user',
      password: '',
    },
  });

  const { data: user, isLoading, isError } = useQuery<UserType>({
    queryKey: ['user', userId],
    queryFn: () => getUserById(userId),
    enabled: !!userId && !isNaN(userId),
  });

  const { data: countries, isLoading: isLoadingCountries, isError: isErrorCountries } = useQuery<CountryType[]>({
    queryKey: ['countries'],
    queryFn: async () => {
      const response = await apiClient.get('/countries');
      return response.data;
    },
  });

  useEffect(() => {
    if (user) {
      form.reset({
        fullName: user.fullName,
        email: user.email,
        countryId: user.countryId,
        role: user.role,
        password: '', // Always reset password field to empty
      });
    }
  }, [user, form]);

  const updateUserMutation = useMutation({
    mutationFn: (payload: UpdateUserPayload) => updateUser(userId, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user', userId] });
      queryClient.invalidateQueries({ queryKey: ['users'] });
      toast.success(t('user_updated_successfully'));
      navigate('/admin/users');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || t('failed_to_update_user'));
    },
  });

  const deleteUserMutation = useMutation({
    mutationFn: () => deleteUser(userId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      toast.success(t('user_deleted_successfully'));
      navigate('/admin/users');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || t('failed_to_delete_user'));
    },
  });

  const onSubmit = (values: z.infer<typeof formSchema>) => {
    const payload: UpdateUserPayload = {
      fullName: values.fullName,
      email: values.email,
      countryId: values.countryId,
      role: values.role,
    };
    if (values.password) {
      payload.password = values.password;
    }
    updateUserMutation.mutate(payload);
  };

  const handleDeleteClick = () => {
    setIsDeleteDialogOpen(true);
  };

  const handleConfirmDelete = () => {
    deleteUserMutation.mutate();
  };

  if (isLoading) {
    return <div className="space-y-6">{t('loading_user')}</div>;
  }

  if (isError || !user) {
    return <div className="space-y-6 text-red-500">{t('error_loading_user')}</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between mb-6">
        <Button variant="outline" onClick={() => navigate(-1)}>
          <ArrowLeft className="mr-2 h-4 w-4" /> {t('back')}
        </Button>
        <h1 className="text-3xl font-bold">{t('edit_user', { id: user.id })}</h1>
        <Button
          variant="destructive"
          size="icon"
          onClick={handleDeleteClick}
          disabled={deleteUserMutation.isPending}
          className="btn-danger"
        >
          <Trash2 className="h-4 w-4" />
          <span className="sr-only">{deleteUserMutation.isPending ? t('deleting') : t('delete_user')}</span>
        </Button>
      </div>

      <Card>
        <CardHeader><CardTitle>{t('user_details')}</CardTitle></CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField
                control={form.control}
                name="fullName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('full_name')}<span className="text-destructive">*</span></FormLabel>
                    <FormControl>
                      <Input {...field} placeholder={t('enter_full_name')} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('email')}<span className="text-destructive">*</span></FormLabel>
                    <FormControl>
                      <Input type="email" {...field} placeholder="m@example.com" />
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
                    <FormLabel>{t('country')}<span className="text-destructive">*</span></FormLabel>
                    <Select onValueChange={(value) => field.onChange(Number(value))} value={field.value.toString()} disabled={isLoadingCountries || isErrorCountries || updateUserMutation.isPending}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder={isLoadingCountries ? t('loading_countries') : isErrorCountries ? t('error_loading_countries') : t('select_country')} />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {countries?.map((country) => (
                          <SelectItem key={country.id} value={country.id.toString()}>
                            {country.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="role"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('role')}<span className="text-destructive">*</span></FormLabel>
                    <Select onValueChange={field.onChange} value={field.value} disabled={updateUserMutation.isPending}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder={t('select_role')} />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="user">{t('role_user')}</SelectItem>
                        <SelectItem value="admin">{t('role_admin')}</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="md:col-span-2">
                <Separator className="my-6" />
                <h3 className="text-lg font-semibold mb-4">{t('change_password')}</h3>
              </div>

              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem className="md:col-span-2">
                    <FormLabel>{t('new_password_optional')}</FormLabel>
                    <FormControl>
                      <PasswordInput {...field} value={field.value || ''} />
                    </FormControl>
                    <FormDescription>{t('leave_blank_for_no_change')}</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="flex justify-between mt-4 md:col-span-2">
                <Button type="button" variant="outline" onClick={() => navigate(-1)}>
                  {t('cancel')}
                </Button>
                <Button type="submit" className="btn-primary-gradient" disabled={updateUserMutation.isPending}>
                  {updateUserMutation.isPending ? t('saving') : t('save_changes')}
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>

      <ConfirmDeleteDialog
        isOpen={isDeleteDialogOpen}
        onClose={() => setIsDeleteDialogOpen(false)}
        onConfirm={handleConfirmDelete}
        title={t('confirm_delete_user_title')}
        description={t('confirm_delete_user_description')}
        confirmButtonText={t('delete_user_button')}
        cancelButtonText={t('cancel')}
        isConfirming={deleteUserMutation.isPending}
      />
    </div>
  );
};

export default AdminUsersEdit;