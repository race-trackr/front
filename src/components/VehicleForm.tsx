import { useTranslation } from 'react-i18next';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import * as z from 'zod';

export const vehicleFormSchema = z.object({
    name: z.string().min(1, { message: "Le nom du véhicule est requis." }),
    type: z.enum(['car', 'motorcycle', 'karting', 'other'], { message: "Le type de véhicule est requis." }),
    brand: z.string().nullable().optional(),
    model: z.string().nullable().optional(),
    year: z.coerce.number().min(1900).max(new Date().getFullYear() + 1).nullable().optional(),
    licensePlate: z.string().nullable().optional(),
    details: z.string().nullable().optional(),
});

type VehicleFormSchemaType = z.infer<typeof vehicleFormSchema>;

type VehicleFormProps = {
    form: any;
    onSubmit: (values: VehicleFormSchemaType) => void;
    isLoading?: boolean;
    submitLabel?: string;
    cancelLabel?: string;
    onCancel?: () => void;
};

export default function VehicleForm({
    form,
    onSubmit,
    isLoading = false,
    submitLabel,
    cancelLabel,
    onCancel,
}: VehicleFormProps) {
    const { t } = useTranslation();

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>{t('vehicle_name')}<span className="text-destructive">*</span></FormLabel>
                            <FormControl>
                                <Input {...field} placeholder={t('enter_vehicle_name')} />
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
                            <FormLabel>{t('vehicle_type')}<span className="text-destructive">*</span></FormLabel>
                            <Select onValueChange={field.onChange} value={field.value}>
                                <FormControl>
                                    <SelectTrigger>
                                        <SelectValue placeholder={t('select_vehicle_type')} />
                                    </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                    <SelectItem value="car">{t('type_car')}</SelectItem>
                                    <SelectItem value="motorcycle">{t('type_motorcycle')}</SelectItem>
                                    <SelectItem value="karting">{t('type_karting')}</SelectItem>
                                    <SelectItem value="other">{t('type_other')}</SelectItem>
                                </SelectContent>
                            </Select>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <FormField
                    control={form.control}
                    name="brand"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>{t('vehicle_brand')}</FormLabel>
                            <FormControl>
                                <Input {...field} value={field.value || ''} placeholder={t('enter_brand_optional')} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <FormField
                    control={form.control}
                    name="model"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>{t('vehicle_model')}</FormLabel>
                            <FormControl>
                                <Input {...field} value={field.value || ''} placeholder={t('enter_model_optional')} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <FormField
                    control={form.control}
                    name="year"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>{t('vehicle_year')}</FormLabel>
                            <FormControl>
                                <Input type="number" {...field} value={field.value === null ? '' : field.value} placeholder={t('enter_year_optional')} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <FormField
                    control={form.control}
                    name="licensePlate"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>{t('vehicle_license_plate')}</FormLabel>
                            <FormControl>
                                <Input {...field} value={field.value || ''} placeholder={t('enter_license_plate')} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <FormField
                    control={form.control}
                    name="details"
                    render={({ field }) => (
                        <FormItem className="md:col-span-2">
                            <FormLabel>{t('details')}</FormLabel>
                            <FormControl>
                                <Textarea rows={3} {...field} value={field.value || ''} placeholder={t('enter_any_details')} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <div className="flex justify-between w-full md:col-span-2 mt-4">
                    <Button
                        type="button"
                        variant="outline"
                        onClick={() => onCancel ? onCancel() : null}
                        disabled={isLoading}
                        title={cancelLabel || t('cancel')}
                    >
                        {cancelLabel || t('cancel')}
                    </Button>
                    <Button
                        type="submit"
                        className="btn-primary-gradient"
                        disabled={isLoading}
                        title={isLoading ? t('saving') : (submitLabel || t('save_changes'))}
                    >
                        {isLoading ? t('saving') : (submitLabel || t('save_changes'))}
                    </Button>
                </div>
            </form>
        </Form>
    );
}
