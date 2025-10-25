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

const formSchema = z.object({
  fullName: z.string().min(2, { message: "Le nom complet doit contenir au moins 2 caractères." }),
  email: z.string().email({ message: "Adresse email invalide." }),
  countryId: z.coerce.number().min(1, { message: "Le pays est requis." }),
});

export type UserProfileFormValues = z.infer<typeof formSchema>; // Exported the type

const UserProfileForm: React.FC = () => {
  const { t } = useTranslation();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const setUserInStore = useAuthStore((state) => state.setUser);

  const form = useForm<UserProfileFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      fullName: user?.fullName || '',
      email: user?.email || '',
      countryId: user?.countryId || 0,
    },
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
      });
    }
  }, [user, form]);

  const updateUserProfileMutation = useMutation({
    mutationFn: async (payload: UserProfileFormValues) => {
      if (!user?.id) throw new Error("User ID is missing.");
      const response = await apiClient.put(`/users/${user.id}`, payload);
      return response.data;
    },
    onSuccess: (updatedUser: UserType) => {
      queryClient.invalidateQueries({ queryKey: ['user', user?.id] });
      setUserInStore(updatedUser); // Update user in Zustand store
      toast.success(t('profile_updated_successfully'));
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || t('failed_to_update_profile'));
    },
  });

  const onSubmit = (values: UserProfileFormValues) => {
    updateUserProfileMutation.mutate(values);
  };

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
                    <Input type="email" {...field} placeholder="m@example.com" disabled />
                  </FormControl>
                  <FormDescription>{t('email_cannot_be_changed')}</FormDescription>
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
                  <Select onValueChange={(value) => field.onChange(Number(value))} value={field.value.toString()} disabled={isLoadingCountries || isErrorCountries || updateUserProfileMutation.isPending}>
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
            <div className="flex justify-end mt-4 md:col-span-2">
              <Button type="submit" className="btn-primary-gradient" disabled={updateUserProfileMutation.isPending}>
                {updateUserProfileMutation.isPending ? t('saving_profile') : t('update_profile')}
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
};

export default UserProfileForm;