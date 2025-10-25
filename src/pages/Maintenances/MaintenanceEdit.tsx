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
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { DatePicker } from '@/components/ui/date-picker';
import { format } from 'date-fns';
import { CreateMaintenancePayload, MaintenanceRecordTypeType, UserVehicleType, UpdateMaintenancePayload, MaintenanceRecordType } from '@/types';
import { getMaintenanceById, updateMaintenance, deleteMaintenance } from '@/lib/api/maintenances';
import { getVehicles } from '@/lib/api/vehicles';
import { PlusCircle } from 'lucide-react';

const formSchema = z.object({
  userVehicleId: z.coerce.number().min(1, { message: "Le véhicule est requis." }),
  type: z.enum(['repair', 'service', 'modification'], { message: "Le type de maintenance est requis." }),
  date: z.string().min(1, { message: "La date est requise." }),
  description: z.string().min(1, { message: "La description est requise." }),
  cost: z.coerce.number().min(0, { message: "Le coût ne peut pas être négatif." }).nullable().optional(),
  mileage: z.coerce.number().min(0, { message: "Le kilométrage ne peut pas être négatif." }).nullable().optional(),
  nextDueDate: z.string().nullable().optional(),
  nextDueMileage: z.coerce.number().min(0, { message: "Le kilométrage de la prochaine échéance ne peut pas être négatif." }).nullable().optional(),
});

const MaintenanceEdit: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const maintenanceId = Number(id); // Convert id to number
  const navigate = useNavigate();
  const { t } = useTranslation();
  const queryClient = useQueryClient();

  const form = useForm<CreateMaintenancePayload>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      userVehicleId: 0,
      type: 'service',
      date: format(new Date(), 'yyyy-MM-dd'),
      description: '',
      cost: null,
      mileage: null,
      nextDueDate: null,
      nextDueMileage: null,
    },
  });

  const { data: maintenance, isLoading, isError } = useQuery<MaintenanceRecordType>({
    queryKey: ['maintenance', maintenanceId],
    queryFn: () => getMaintenanceById(maintenanceId),
    enabled: !!maintenanceId && !isNaN(maintenanceId),
  });

  const { data: vehicles, isLoading: isLoadingVehicles, isError: isErrorVehicles } = useQuery<UserVehicleType[]>({
    queryKey: ['vehicles'],
    queryFn: () => getVehicles({ limit: 0 }),
  });

  useEffect(() => {
    if (maintenance) {
      form.reset({
        userVehicleId: maintenance.userVehicleId,
        type: maintenance.type,
        date: maintenance.date,
        description: maintenance.description,
        cost: maintenance.cost || null,
        mileage: maintenance.mileage || null,
        nextDueDate: maintenance.nextDueDate || null,
        nextDueMileage: maintenance.nextDueMileage || null,
      });
    }
  }, [maintenance, form]);

  const updateMaintenanceMutation = useMutation({
    mutationFn: (payload: UpdateMaintenancePayload) => updateMaintenance(maintenanceId, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['maintenance', maintenanceId] });
      queryClient.invalidateQueries({ queryKey: ['maintenances'] });
      toast.success(t('maintenance_updated_successfully'));
      navigate('/maintenances');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || t('failed_to_update_maintenance'));
    },
  });

  const deleteMaintenanceMutation = useMutation({
    mutationFn: () => deleteMaintenance(maintenanceId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['maintenances'] });
      toast.success(t('maintenance_deleted_successfully'));
      navigate('/maintenances');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || t('failed_to_delete_maintenance'));
    },
  });

  const onSubmit = (values: z.infer<typeof formSchema>) => {
    const payload: UpdateMaintenancePayload = {
      ...values,
      cost: values.cost === undefined ? null : values.cost,
      mileage: values.mileage === undefined ? null : values.mileage,
      nextDueDate: values.nextDueDate === '' ? null : values.nextDueDate,
      nextDueMileage: values.nextDueMileage === undefined ? null : values.nextDueMileage,
    };
    updateMaintenanceMutation.mutate(payload);
  };

  const handleDelete = () => {
    if (window.confirm(t('confirm_delete_maintenance'))) {
      deleteMaintenanceMutation.mutate();
    }
  };

  if (isLoading) {
    return <div className="space-y-6">{t('loading_maintenance')}</div>;
  }

  if (isError || !maintenance) {
    return <div className="space-y-6 text-red-500">{t('error_loading_maintenance')}</div>;
  }

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">{t('edit_maintenance', { id: maintenance.id })}</h1>
      <Card>
        <CardHeader><CardTitle>{t('maintenance_details')}</CardTitle></CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField
                control={form.control}
                name="userVehicleId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('vehicle')}</FormLabel>
                    <Select onValueChange={(value) => {
                      if (value === "create-new-vehicle") {
                        navigate('/vehicles/create');
                      } else {
                        field.onChange(Number(value));
                      }
                    }} value={field.value.toString()}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder={t('select_a_vehicle')} />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {isLoadingVehicles ? (
                          <SelectItem value="loading" disabled>{t('loading_vehicles')}</SelectItem>
                        ) : isErrorVehicles || !vehicles || vehicles.length === 0 ? (
                          <SelectItem value="create-new-vehicle" className="text-blue-600 cursor-pointer hover:bg-accent">
                            <div className="flex items-center">
                              <PlusCircle className="mr-2 h-4 w-4" /> {t('create_vehicle')}
                            </div>
                          </SelectItem>
                        ) : (
                          vehicles.map((vehicle) => (
                            <SelectItem key={vehicle.id} value={vehicle.id.toString()}>
                              {vehicle.brand} {vehicle.model} ({vehicle.licensePlate || t('not_specified')})
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
                name="type"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('type')}</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder={t('select_maintenance_type')} />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="repair">{t('maintenance_type_repair')}</SelectItem>
                        <SelectItem value="service">{t('maintenance_type_service')}</SelectItem>
                        <SelectItem value="modification">{t('maintenance_type_modification')}</SelectItem>
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
                  <FormItem className="flex flex-col">
                    <FormLabel>{t('date')}</FormLabel>
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
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('description')}</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder={t('enter_description')} />
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
                      <Input type="number" step="0.01" {...field} value={field.value === null ? '' : field.value} placeholder={t('enter_cost')} />
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
                      <Input type="number" {...field} value={field.value === null ? '' : field.value} placeholder={t('enter_mileage')} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="nextDueDate"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>{t('next_due_date')}</FormLabel>
                    <FormControl>
                      <DatePicker
                        value={field.value ? new Date(field.value) : undefined}
                        onChange={(date) => field.onChange(date ? format(date, 'yyyy-MM-dd') : null)}
                        disabled={field.disabled}
                        placeholder={t('pick_next_due_date')}
                      />
                    </FormControl>
                    <FormDescription>{t('optional_next_due_date')}</FormDescription>
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
                      <Input type="number" {...field} value={field.value === null ? '' : field.value} placeholder={t('enter_next_due_mileage')} />
                    </FormControl>
                    <FormDescription>{t('optional_next_due_mileage')}</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="flex justify-between mt-4 md:col-span-2">
                <Button type="button" variant="outline" onClick={() => navigate(-1)}>
                  {t('cancel')}
                </Button>
                <div className="flex gap-2">
                  <Button variant="destructive" onClick={handleDelete} disabled={deleteMaintenanceMutation.isPending} className="bg-red-600 hover:bg-red-700 text-white">
                    {deleteMaintenanceMutation.isPending ? t('deleting') : t('delete_maintenance')}
                  </Button>
                  <Button onClick={form.handleSubmit(onSubmit)} className="btn-primary-gradient" disabled={updateMaintenanceMutation.isPending}>
                    {updateMaintenanceMutation.isPending ? t('saving') : t('save_changes')}
                  </Button>
                </div>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
};

export default MaintenanceEdit;