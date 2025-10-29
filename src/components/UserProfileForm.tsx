"use client";

import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useTranslation } from 'react-i18next';
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
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useAuth } from '@/hooks/useAuth';
import apiClient from '@/lib/apiClient';
import { CountryType, UserType } from '@/types';
import { useAuthStore } from '@/store/authStore';
import { Separator } from '@/components/ui/separator';
import { PasswordInput } from '@/components/PasswordInput'; // Import the new PasswordInput component

const formSchema = z.object({
  firstName: z.string().min(1, { message: "Le prénom est requis." }).nullable(),
  lastName: z.string().min(1, { message: "Le nom de famille est requis." }).nullable(),
  email: z.string().email({ message: "Adresse email invalide." }),
  countryId: z.coerce.number().min(1, { message: "Le pays est requis." }).nullable(),
  currentPassword: z.string().optional(),
  newPassword: z.string().optional(),
  confirmNewPassword: z.string().optional(),
}).superRefine((data, ctx) => {
  if (data.newPassword && data.newPassword.length < 6) {
    ctx.addIssue({
      code: z.ZodIssueCode.too_small,
      minimum: 6,
      type: "string",
      inclusive: true,
      message: "Le nouveau mot de passe doit contenir au moins 6 caractères.",
      path: ["newPassword"],
    });
  }
  if (data.newPassword && !data.currentPassword) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: "Le mot de passe actuel est requis pour changer le mot de passe.",
      path: ["currentPassword"],
    });
  }
  if (data.newPassword && data.newPassword !== data.confirmNewPassword) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: "Les nouveaux mots de passe ne correspondent pas.",
      path: ["confirmNewPassword"],
    });
  }
});

export type UserProfileFormValues = z.infer<typeof formSchema>;

const UserProfileForm: React.FC = () => {
  const { t } = useTranslation();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const setUserInStore = useAuthStore((state) => state.setUser);

  const form = useForm<UserProfileFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      firstName: user?.firstName || '',
      lastName: user?.lastName || '',
      email: user?.email || '',
      countryId: user?.countryId || null,
      currentPassword: '',
      newPassword: '',
      confirmNewPassword: '',
    },
  });

  const { data: countries, isLoading: isLoadingCountries, isError: isErrorCountries } = useQuery<
    CountryType[],
    Error,
    ['countries']
  >({
    queryKey: ['countries'],
    queryFn: async () => {
      const response = await apiClient.get('/countries');
      return response.data;
    },
    onError: (error: Error) => { // Corrected onError type
      toast.error(t('an_unexpected_error_occurred')); // Generic error message
    },
  });

  useEffect(() => {
    if (user) {
      form.reset({
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        countryId: user.countryId,
        currentPassword: '',
        newPassword: '',
        confirmNewPassword: '',
      });
    }
  }, [user, form]);

  const updateUserProfileMutation = useMutation({
    mutationFn: async (payload: { firstName: string | null; lastName: string | null; email: string; countryId: number | null }) => {
      if (!user?.id) throw new Error("User ID is missing.");
      const response = await apiClient.put(`/users/${user.id}`, payload);
      return response.data;
    },
    onSuccess: (updatedUser: UserType) => {
      queryClient.invalidateQueries({ queryKey: ['user', user?.id] });
      setUserInStore(updatedUser);
      toast.success(t('profile_updated_successfully'));
    },
    onError: (error: Error) => { // Corrected onError type
      toast.error(t('an_unexpected_error_occurred')); // Generic error message
    },
  });

  const updatePasswordMutation = useMutation({
    mutationFn: async (payload: { currentPassword: string; newPassword: string }) => {
      if (!user?.id) throw new Error("User ID is missing.");
      const response = await apiClient.put(`/users/${user.id}/password`, payload);
      return response.data;
    },
    onSuccess: () => {
      toast.success(t('password_updated_successfully'));
      form.resetField('currentPassword');
      form.resetField('newPassword');
      form.resetField('confirmNewPassword');
    },
    onError: (error: Error) => { // Corrected onError type
      toast.error(t('an_unexpected_error_occurred')); // Generic error message
    },
  });

  const onSubmit = async (values: UserProfileFormValues) => {
    const profilePayload = {
      firstName: values.firstName,
      lastName: values.lastName,
      email: values.email,
      countryId: values.countryId,
    };
    await updateUserProfileMutation.mutateAsync(profilePayload);

    if (values.newPassword) {
      const passwordPayload = {
        currentPassword: values.currentPassword!,
        newPassword: values.newPassword,
      };
      await updatePasswordMutation.mutateAsync(passwordPayload);
    }
  };

  const isSubmitting = updateUserProfileMutation.isPending || updatePasswordMutation.isPending;

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>{t('profile_information')}</CardTitle>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <FormField
              control={form.control}
              name="firstName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('first_name')}<span className="text-destructive">*</span></FormLabel>
                  <FormControl>
                    <Input {...field} value={field.value || ''} placeholder={t('enter_first_name')} />
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
                  <FormLabel>{t('last_name')}<span className="text-destructive">*</span></FormLabel>
                  <FormControl>
                    <Input {...field} value={field.value || ''} placeholder={t('enter_last_name')} />
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
                  <Select onValueChange={(value) => field.onChange(Number(value))} value={field.value?.toString() || ''} disabled={isLoadingCountries || isErrorCountries || isSubmitting}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder={isLoadingCountries ? t('loading_countries') : isErrorCountries ? t('error_loading_countries') : t('select_country')} />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {countries?.map((country) => ( // Accessing countries safely
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

            <div className="md:col-span-2">
              <Separator className="my-6" />
              <h3 className="text-lg font-semibold mb-4">{t('change_password')}</h3>
            </div>

            <FormField
              control={form.control}
              name="currentPassword"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('current_password')}</FormLabel>
                  <FormControl>
                    <PasswordInput {...field} value={field.value || ''} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="md:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField
                control={form.control}
                name="newPassword"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('new_password')}</FormLabel>
                    <FormControl>
                      <PasswordInput {...field} value={field.value || ''} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="confirmNewPassword"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('confirm_new_password')}</FormLabel>
                    <FormControl>
                      <PasswordInput {...field} value={field.value || ''} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="flex justify-end mt-4 md:col-span-2">
              <Button type="submit" className="btn-primary-gradient" disabled={isSubmitting}>
                {isSubmitting ? t('saving_profile') : t('update_profile')}
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
};

export default UserProfileForm;