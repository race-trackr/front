import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Combobox } from "@/components/ui/combobox";
import { DatePicker } from "@/components/ui/date-picker";
import { Button } from "@/components/ui/button";
import MultiLineChronoInput from "@/components/MultiLineChronoInput";
import { PlusCircle } from 'lucide-react';
import { format } from 'date-fns';
import { useTranslation } from 'react-i18next';

type TrackOption = { value: string; label: string };

type Props = {
    form: any;
    onSubmit: (values: any) => void;
    vehicles?: any[];
    tracks?: any[];
    trackOptions?: TrackOption[];
    isLoadingVehicles?: boolean;
    isErrorVehicles?: boolean;
    isLoadingTracks?: boolean;
    isErrorTracks?: boolean;
    isDatePickerOpen: boolean;
    setIsDatePickerOpen: (v: boolean) => void;
    isOwner?: boolean;
    submitLabel?: string;
    submitDisabled?: boolean;
    cancelLabel?: string;
    onCancel?: () => void;
};

export default function TrackdayForm({
    form,
    onSubmit,
    vehicles,
    tracks,
    trackOptions,
    isLoadingVehicles,
    isErrorVehicles,
    isLoadingTracks,
    isErrorTracks,
    isDatePickerOpen,
    setIsDatePickerOpen,
    isOwner,
    submitLabel = 'Save',
    submitDisabled = false,
    cancelLabel = 'Cancel',
    onCancel,
}: Props) {
    const { t } = useTranslation();
    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                    control={form.control}
                    name="userVehicleId"
                    render={({ field }: any) => (
                        <FormItem>
                            <FormLabel>{t('vehicle')}</FormLabel>
                            <Select onValueChange={(value: any) => {
                                if (value === "create-new-vehicle") {
                                    // handled by parent via onCancel/navigation
                                } else {
                                    field.onChange(Number(value));
                                }
                            }} value={field.value?.toString() || ''}>
                                <FormControl>
                                    <SelectTrigger>
                                        <SelectValue placeholder={t('select_vehicle')} />
                                    </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                    {isLoadingVehicles ? (
                                        <SelectItem value="" disabled>{t('loading_vehicles')}</SelectItem>
                                    ) : isErrorVehicles || !vehicles || vehicles.length === 0 ? (
                                        <SelectItem value="create-new-vehicle" className="text-blue-600 cursor-pointer hover:bg-accent">
                                            <div className="flex items-center">
                                                <PlusCircle className="mr-2 h-4 w-4" /> {t('create_new_vehicle')}
                                            </div>
                                        </SelectItem>
                                    ) : (
                                        vehicles.map((vehicle: any) => (
                                            <SelectItem key={vehicle.id} value={vehicle.id.toString()}>
                                                {vehicle.name} ({vehicle.licensePlate || '—'})
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
                    name="trackId"
                    render={({ field }: any) => (
                        <FormItem>
                            <FormLabel>{t('track')}</FormLabel>
                            <FormControl>
                                <Combobox
                                    options={trackOptions || []}
                                    value={field.value?.toString()}
                                    onValueChange={(value: any) => field.onChange(Number(value))}
                                    placeholder="Sélectionner une piste"
                                    emptyMessage="Aucune piste trouvée"
                                    disabled={isLoadingTracks}
                                    {...(isOwner ? { onCreateNew: undefined, createNewLabel: undefined } : {})}
                                />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <FormField
                    control={form.control}
                    name="date"
                    render={({ field }: any) => (
                        <FormItem>
                            <FormLabel>{t('date')}</FormLabel>
                            <FormControl>
                                <DatePicker
                                    value={field.value ? new Date(field.value) : undefined}
                                    onChange={(date: Date | null) => field.onChange(date ? format(date, 'yyyy-MM-dd') : '')}
                                    disabled={field.disabled}
                                    placeholder="Choisir une date"
                                    open={isDatePickerOpen}
                                    onOpenChange={setIsDatePickerOpen}
                                />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <FormField control={form.control} name="weather" render={({ field }: any) => (
                    <FormItem>
                        <FormLabel>{t('weather')}</FormLabel>
                        <Select onValueChange={(value: any) => field.onChange(value === 'null-option' ? null : value)} value={field.value || 'null-option'}>
                            <FormControl>
                                <SelectTrigger>
                                    <SelectValue placeholder={t('select_weather')} />
                                </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                                <SelectItem value="null-option">{t('unspecified')}</SelectItem>
                                <SelectItem value="clear">{t('clear')}</SelectItem>
                                <SelectItem value="cloudy">{t('cloudy')}</SelectItem>
                                <SelectItem value="rainy">{t('rainy')}</SelectItem>
                            </SelectContent>
                        </Select>
                        <FormMessage />
                    </FormItem>
                )} />

                <FormField control={form.control} name="airTemperature" render={({ field }: any) => (
                    <FormItem>
                        <FormLabel>{t('air_temperature')}</FormLabel>
                        <FormControl>
                            <Input type="number" step="0.1" {...field} value={field.value === null ? '' : field.value} />
                        </FormControl>
                        <FormMessage />
                    </FormItem>
                )} />

                <FormField control={form.control} name="trackTemperature" render={({ field }: any) => (
                    <FormItem>
                        <FormLabel>{t('track_temperature')}</FormLabel>
                        <FormControl>
                            <Input type="number" step="0.1" {...field} value={field.value === null ? '' : field.value} />
                        </FormControl>
                        <FormMessage />
                    </FormItem>
                )} />

                <FormField control={form.control} name="trackCondition" render={({ field }: any) => (
                    <FormItem>
                        <FormLabel>{t('track_condition')}</FormLabel>
                        <Select onValueChange={(value: any) => field.onChange(value === 'null-option' ? null : value)} value={field.value || 'null-option'}>
                            <FormControl>
                                <SelectTrigger>
                                    <SelectValue placeholder={t('select_track_condition')} />
                                </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                                <SelectItem value="null-option">{t('unspecified')}</SelectItem>
                                <SelectItem value="wet">{t('wet')}</SelectItem>
                                <SelectItem value="dry">{t('dry')}</SelectItem>
                                <SelectItem value="moist">{t('moist')}</SelectItem>
                            </SelectContent>
                        </Select>
                        <FormMessage />
                    </FormItem>
                )} />

                <FormField control={form.control} name="bestLapTime" render={({ field }: any) => (
                    <FormItem>
                        <FormLabel>{t('best_laptime')}</FormLabel>
                        <FormControl>
                            <Input {...field} value={field.value || ''} placeholder="MM.SS.mmm" />
                        </FormControl>
                        <FormMessage />
                    </FormItem>
                )} />

                <FormField control={form.control} name="totalLaps" render={({ field }: any) => (
                    <FormItem>
                        <FormLabel>{t('total_laps')}</FormLabel>
                        <FormControl>
                            <Input type="number" {...field} value={field.value === null ? '' : field.value} />
                        </FormControl>
                        <FormMessage />
                    </FormItem>
                )} />

                <FormField control={form.control} name="totalDistance" render={({ field }: any) => (
                    <FormItem>
                        <FormLabel>{t('total_distance')}</FormLabel>
                        <FormControl>
                            <Input type="number" step="0.1" {...field} value={field.value === null ? '' : field.value} />
                        </FormControl>
                        <FormMessage />
                    </FormItem>
                )} />

                <FormField control={form.control} name="notes" render={({ field }: any) => (
                    <FormItem className="md:col-span-2">
                        <FormLabel>{t('notes')}</FormLabel>
                        <FormControl>
                            <Textarea rows={3} {...field} value={field.value || ''} />
                        </FormControl>
                        <FormMessage />
                    </FormItem>
                )} />

                <FormField control={form.control} name="chronos" render={({ field }: any) => (
                    <FormItem>
                        <FormLabel>{t('chronos')}</FormLabel>
                        <FormControl>
                            <MultiLineChronoInput value={field.value} onChange={field.onChange} placeholder={t('lap_time_format')} disabled={field.disabled} />
                        </FormControl>
                    </FormItem>
                )} />

                <div className="flex justify-between mt-4 md:col-span-2">
                    <Button type="button" variant="outline" onClick={() => onCancel ? onCancel() : null}>
                        {cancelLabel}
                    </Button>
                    <Button type="submit" className="btn-primary-gradient" disabled={submitDisabled}>
                        {submitLabel}
                    </Button>
                </div>
            </form>
        </Form>
    );
};
