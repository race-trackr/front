"use client";

import React from 'react';
import { useForm, Path } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useTranslation } from 'react-i18next';
import { format } from 'date-fns';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { DatePicker } from '@/components/ui/date-picker';
import { ApiKey, Permissions, PermissionAction } from '@/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils'; // Correction ici

interface ApiKeyFormProps {
  onSave: (newApiKey: Omit<ApiKey, 'id' | 'key' | 'createdAt'>) => void;
  onCancel: () => void;
  isSaving: boolean;
}

// Define the schema for individual permission actions
const permissionActionsSchema = z.object({
  create: z.boolean(),
  read: z.boolean(),
  update: z.boolean(),
  delete: z.boolean(),
});

const formSchema = z.object({
  name: z.string().min(1, { message: "Le nom de la clé API est requis." }),
  expiresAt: z.string().nullable().optional(),
  permissions: z.object({ // Define as a direct object to ensure non-optional properties
    trackdays: permissionActionsSchema,
    vehicles: permissionActionsSchema,
    maintenances: permissionActionsSchema,
    tracks: permissionActionsSchema,
    countries: permissionActionsSchema,
    users: permissionActionsSchema,
  }),
});

// Explicitly type defaultPermissions to match the inferred type from formSchema['permissions']
const defaultPermissionsForForm: z.infer<typeof formSchema>['permissions'] = {
  trackdays: { create: false, read: false, update: false, delete: false },
  vehicles: { create: false, read: false, update: false, delete: false },
  maintenances: { create: false, read: false, update: false, delete: false },
  tracks: { create: false, read: false, update: false, delete: false },
  countries: { create: false, read: false, update: false, delete: false },
  users: { create: false, read: false, update: false, delete: false },
};

const ApiKeyForm: React.FC<ApiKeyFormProps> = ({ onSave, onCancel, isSaving }) => {
  const { t } = useTranslation();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
      expiresAt: null,
      permissions: defaultPermissionsForForm, // Use the explicitly typed default
    },
  });

  const onSubmit = (values: z.infer<typeof formSchema>) => {
    onSave({
      name: values.name,
      expiresAt: values.expiresAt || null,
      permissions: values.permissions, // This should now be correctly typed as Permissions
    });
  };

  const tableNames: Array<keyof Permissions> = ['trackdays', 'vehicles', 'maintenances', 'tracks', 'countries', 'users'];
  const permissionActions: PermissionAction[] = ['create', 'read', 'update', 'delete'];

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 p-4">
        <h2 className="text-2xl font-bold">{t('create_api_key')}</h2>
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t('api_key_name')}<span className="text-destructive">*</span></FormLabel>
              <FormControl>
                <Input {...field} placeholder={t('enter_api_key_name')} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="expiresAt"
          render={({ field }) => (
            <FormItem className="flex flex-col">
              <FormLabel>{t('validity_duration')}</FormLabel>
              <FormControl>
                <DatePicker
                  value={field.value ? new Date(field.value) : undefined}
                  onChange={(date) => field.onChange(date ? format(date, 'yyyy-MM-dd') : null)}
                  disabled={field.disabled}
                  placeholder={t('pick_expiration_date')}
                />
              </FormControl>
              <FormDescription>{t('optional_expiration_date')}</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <Separator />

        <h3 className="text-xl font-semibold mb-4">{t('permissions')}</h3>
        <div className="space-y-4">
          {tableNames.map((tableName) => (
            <Card key={tableName}>
              <CardHeader>
                <CardTitle className="text-lg capitalize">{t(tableName as string)}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  {permissionActions.map((action) => (
                    <FormField
                      key={`${tableName}-${action}`}
                      control={form.control}
                      name={`permissions.${tableName}.${action}` as Path<z.infer<typeof formSchema>>}
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                          <FormControl>
                            <Checkbox
                              checked={field.value as boolean}
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                          <div className="space-y-1 leading-none">
                            <FormLabel className="capitalize">
                              {t(action)}
                            </FormLabel>
                          </div>
                        </FormItem>
                      )}
                    />
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="flex justify-end gap-2 mt-6">
          <Button type="button" variant="outline" onClick={onCancel} disabled={isSaving}>
            {t('cancel')}
          </Button>
          <Button type="submit" className="btn-primary-gradient" disabled={isSaving}>
            {isSaving ? t('creating') : t('create_api_key')}
          </Button>
        </div>
      </form>
    </Form>
  );
};

export default ApiKeyForm;