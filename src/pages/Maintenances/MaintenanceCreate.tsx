import React from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useTranslation } from 'react-i18next';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useMutation, useQueryClient, useQuery } from '@tanstack/react-query';
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
import { CreateMaintenancePayload, MaintenanceRecordTypeType, UserVehicleType } from '@/types';
import { createMaintenance } from '@/lib/api/maintenances';
import { getVehicles } from '@/lib/api/vehicles';
import { PlusCircle } from 'lucide-react';

const formSchema = z.object({
  userVehicleId: z.coerce.number().min(1, { message: "Le véhicule est requis." }),
  name: z.string().min(1, { message: "Le nom de la maintenance est requis." }), // Added name field
  type: z.enum(['maintenance', 'repair', 'modification', 'other'], { message: "Le type de maintenance est requis." }), // Updated enum
  date: z.string().min(1, { message: "La date est requise." }),
  description: z.string().min(1, { message: "La description est requise." }),
  cost: z.coerce.number().min(0, { message: "Le coût ne peut pas être négatif." }).nullable().optional(),
  mileage: z.coerce.number().min(0, { message: "Le kilométrage ne peut pas être négatif." }).nullable().optional(),
  nextDueDate: z.string().nullable().optional(),
  nextDueMileage: z.coerce.number().min(0, { message: "Le kilométrage de la prochaine échéance ne peut pas être négatif." }).nullable().optional(),
});

const MaintenanceCreate: React.FC = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const [searchParams] = useSearchParams();
  const preselectedVehicleId = searchParams.get('vehicleId');

  const form = useForm<CreateMaintenancePayload>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      userVehicleId: preselectedVehicleId ? Number(preselectedVehicleId) : 0,
      name: '', // Default value for new name field
      type: 'maintenance', // Changed default to 'maintenance'
      date: format(new Date(), 'yyyy-MM-dd'),
      description: '',
      cost: null,
      mileage: null,
      nextDueDate: null,
      nextDueMileage: null,
    },
  });

  const { data: vehicles, isLoading: isLoadingVehicles, isError: isErrorVehicles } = useQuery<UserVehicleType[]>({
    queryKey: ['vehicles'],
    queryFn: () => getVehicles({ limit: 0 }),
  });

  const createMaintenanceMutation = useMutation({
    mutationFn: createMaintenance,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['maintenances'] });
      queryClient.invalidateQueries({ queryKey: ['vehicleMaintenances'] });
      toast.success(t('maintenance_created_successfully'));
      navigate('/maintenances');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || t('failed_to_create_maintenance'));
    },
  });

  const onSubmit = (values: z.infer<typeof formSchema>) => {
    const payload: CreateMaintenancePayload = {
      ...values,
      userVehicleId: values.userVehicleId,
      name: values.name, // Include name in payload
      type: values.type,
      date: values.date,
      description: values.description,
      cost: values.cost === undefined ? null : values.cost,
      mileage: values.mileage === undefined ? null : values.mileage,
      nextDueDate: values.nextDueDate === '' ? null : values.nextDueDate,
      nextDueMileage: values.nextDueMileage === undefined ? null : values.nextDueMileage,
    };
    createMaintenanceMutation.mutate(payload);
  };

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">{t('create_new_maintenance')}</h1>
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
                    <FormLabel>{t('vehicle')}<span className="text-destructive">*</span></FormLabel>
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
                name="name" // New name field
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('maintenance_name')}<span className="text-destructive">*</span></FormLabel>
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
                    <FormLabel>{t('type')}<span className="text-destructive">*</span></FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
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
                  <FormItem className="flex flex-col">
                    <FormLabel>{t('date')}<span className="text-destructive">*</span></FormLabel>
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
                    <FormLabel>{t('description')}<span className="text-destructive">*</span></FormLabel>
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
                <Button type="submit" className="btn-primary-gradient" disabled={createMaintenanceMutation.isPending}>
                  {createMaintenanceMutation.isPending ? t('creating') : t('save_maintenance')}
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
};

export default MaintenanceCreate;