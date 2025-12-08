"use client";

import React from 'react';
import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from 'recharts';
import { useQuery } from '@tanstack/react-query';
import { getTrackdays } from '@/lib/api/trackdays';
import { getVehicles } from '@/lib/api/vehicles';
import { getTracks } from '@/lib/api/tracks';
import { DatePicker } from '@/components/ui/date-picker';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { format } from 'date-fns';
import { UserVehicleType, TrackType, TrackDayType } from '@/types';
import { Combobox } from '@/components/ui/combobox';
import { toast } from 'sonner';

const Analytics: React.FC = () => {
  const { t } = useTranslation();

  // State for filters
  const [selectedVehicleId, setSelectedVehicleId] = React.useState<number | undefined>(undefined);
  const [selectedTrackId, setSelectedTrackId] = React.useState<number | undefined>(undefined);
  const [startDate, setStartDate] = React.useState<Date | undefined>(undefined);
  const [endDate, setEndDate] = React.useState<Date | undefined>(undefined);

  // Fetch data
  const { data: allTrackdaysResponse, isLoading: isLoadingTrackdays, isError: isErrorTrackdays } = useQuery<TrackDayType[]>({
    queryKey: ['trackdays', { filterVehicleId: selectedVehicleId, filterTrackId: selectedTrackId, filterStartDate: startDate?.toISOString(), filterEndDate: endDate?.toISOString() }],
    queryFn: () => getTrackdays({ limit: 0 }).then(res => {
      let filteredData = res.data;
      if (selectedVehicleId) {
        filteredData = filteredData.filter(td => td.userVehicleId === selectedVehicleId);
      }
      if (selectedTrackId) {
        filteredData = filteredData.filter(td => td.trackId === selectedTrackId);
      }
      if (startDate) {
        const start = new Date(startDate);
        start.setHours(0, 0, 0, 0);
        filteredData = filteredData.filter(td => new Date(td.date) >= start);
      }
      if (endDate) {
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999);
        filteredData = filteredData.filter(td => new Date(td.date) <= end);
      }
      return filteredData;
    }),
  });

  const trackdays = allTrackdaysResponse || [];

  const { data: vehicles, isLoading: isLoadingVehicles } = useQuery<UserVehicleType[]>({
    queryKey: ['vehicles'],
    queryFn: () => getVehicles({ limit: 0 }),
  });

  const { data: tracks, isLoading: isLoadingTracks } = useQuery<TrackType[]>({
    queryKey: ['tracks'],
    queryFn: () => getTracks(),
  });

  // Memoized data for "Tracks Driven" chart
  const tracksDrivenData = React.useMemo(() => {
    if (!trackdays || !tracks) return [];
    const trackCounts: { [key: number]: number } = {};
    trackdays.forEach(td => {
      if (td.trackId) {
        trackCounts[td.trackId] = (trackCounts[td.trackId] || 0) + 1;
      }
    });

    return Object.entries(trackCounts).map(([trackId, count]) => {
      const track = tracks.find(t => t.id === Number(trackId));
      return {
        name: track?.name || `Track ${trackId}`,
        trackdays: count,
      };
    }).sort((a, b) => b.trackdays - a.trackdays);
  }, [trackdays, tracks]);

  // Memoized data for "Chronos by Track" chart
  const chronosByTrackData = React.useMemo(() => {
    if (!trackdays || !selectedTrackId) return []; // Requires a track to be selected

    const filteredTrackdays = trackdays.filter(td =>
      (selectedVehicleId === undefined || td.userVehicleId === selectedVehicleId) && // Conditionally filter by vehicle
      td.trackId === selectedTrackId &&
      td.bestLapTime // Only include trackdays with a best lap time
    ).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()); // Sort by date

    return filteredTrackdays.map(td => ({
      date: format(new Date(td.date), 'MMM dd, yyyy'), // Format date for display
      bestLapTime: parseLapTimeToSeconds(td.bestLapTime!), // Convert MM.SS.mmm to seconds for charting
    }));
  }, [trackdays, selectedVehicleId, selectedTrackId]);

  // Helper function to convert MM.SS.mmm to seconds
  const parseLapTimeToSeconds = (lapTime: string): number => {
    const parts = lapTime.split('.');
    if (parts.length === 3) {
      const minutes = parseInt(parts[0], 10);
      const seconds = parseInt(parts[1], 10);
      const milliseconds = parseInt(parts[2], 10);
      return (minutes * 60) + seconds + (milliseconds / 1000);
    }
    return 0; // Default to 0 if format is incorrect
  };

  // Custom Tooltip for Chronos by Track
  const CustomLapTimeTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const valueInSeconds = payload[0].value;
      const minutes = Math.floor(valueInSeconds / 60);
      const seconds = Math.floor(valueInSeconds % 60);
      const milliseconds = Math.round((valueInSeconds - Math.floor(valueInSeconds)) * 1000);
      const formattedTime = `${String(minutes).padStart(2, '0')}.${String(seconds).padStart(2, '0')}.${String(milliseconds).padStart(3, '0')}`;
      return (
        <div className="rounded-lg border bg-background p-2 text-sm shadow-md">
          <p className="font-bold">{label}</p>
          <p className="text-muted-foreground">{t('best_laptime')}: <span className="font-semibold text-foreground">{formattedTime}</span></p>
        </div>
      );
    }
    return null;
  };

  // Memoized data for "Monthly Activity" chart
  const monthlyActivityData = React.useMemo(() => {
    if (!trackdays) return [];

    const monthlyData: { [key: string]: { name: string; totalLaps: number; totalDistance: number } } = {};

    trackdays.forEach(td => {
      const monthKey = format(new Date(td.date), 'yyyy-MM');
      const monthName = format(new Date(td.date), 'MMM yyyy');

      if (!monthlyData[monthKey]) {
        monthlyData[monthKey] = { name: monthName, totalLaps: 0, totalDistance: 0 };
      }
      monthlyData[monthKey].totalLaps += td.totalLaps || 0;
      monthlyData[monthKey].totalDistance += td.totalDistance || 0;
    });

    return Object.keys(monthlyData)
      .sort()
      .map(key => monthlyData[key]);
  }, [trackdays]);


  // Options for filters
  const vehicleOptions = React.useMemo(() => {
    return vehicles?.map(v => ({ value: v.id.toString(), label: `${v.brand} ${v.model || t('not_specified_model')}` })) || [];
  }, [vehicles, t]);

  const trackOptions = React.useMemo(() => {
    return tracks?.map(t => ({ value: t.id.toString(), label: t.name })) || [];
  }, [tracks]);

  const handleApplyFilters = () => {
    // The useQuery will automatically refetch when filter states change
    // For now, just log to confirm
    console.log('Applying filters:', { selectedVehicleId, selectedTrackId, startDate, endDate });
  };

  if (isLoadingTrackdays || isLoadingVehicles || isLoadingTracks) {
    return <div className="p-4 text-center">{t('loading')}...</div>;
  }

  if (isErrorTrackdays) {
    toast.error(t('an_unexpected_error_occurred'));
    return <div className="p-4 text-center text-red-500">{t('error_loading_data')}</div>;
  }

  return (
    <div className="p-4 space-y-6">
      <h1 className="text-3xl font-bold mb-6">{t('analytics')}</h1>

      <Card>
        <CardHeader>
          <CardTitle>{t('filters')}</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="flex flex-col space-y-1">
            <label className="text-sm font-medium leading-none">{t('filter_by_vehicle')}</label>
            <Select onValueChange={(value) => setSelectedVehicleId(value === 'all' ? undefined : Number(value))} value={selectedVehicleId?.toString() || 'all'}>
              <SelectTrigger>
                <SelectValue placeholder={t('select_a_vehicle')} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t('all_vehicles')}</SelectItem>
                {vehicleOptions.map(option => (
                  <SelectItem key={option.value} value={option.value}>{option.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="flex flex-col space-y-1">
            <label className="text-sm font-medium leading-none">{t('filter_by_track')}</label>
            <Combobox
              options={trackOptions}
              value={selectedTrackId?.toString() || 'all'}
              onValueChange={(value) => setSelectedTrackId(value === 'all' ? undefined : Number(value))}
              placeholder={t('select_a_track')}
              emptyMessage={t('no_track_found')}
            />
          </div>
          <div className="flex flex-col space-y-1">
            <label className="text-sm font-medium leading-none">{t('start_date')}</label>
            <DatePicker
              value={startDate}
              onChange={setStartDate}
              placeholder={t('select_start_date')}
            />
          </div>
          <div className="flex flex-col space-y-1">
            <label className="text-sm font-medium leading-none">{t('end_date')}</label>
            <DatePicker
              value={endDate}
              onChange={setEndDate}
              placeholder={t('select_end_date')}
            />
          </div>
          <div className="col-span-full flex justify-end">
            <Button onClick={handleApplyFilters} className="btn-primary-gradient">
              {t('apply_filters')}
            </Button>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>{t('tracks_driven')}</CardTitle>
          </CardHeader>
          <CardContent>
            {tracksDrivenData.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={tracksDrivenData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" angle={-45} textAnchor="end" height={80} />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="trackdays" fill="#8884d8" name={t('number_of_trackdays')} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <p className="text-center text-muted-foreground">{t('no_data_for_chart')}</p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>{t('chronos_by_track')}</CardTitle>
          </CardHeader>
          <CardContent>
            {chronosByTrackData.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={chronosByTrackData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis tickFormatter={(value) => {
                    const minutes = Math.floor(value / 60);
                    const seconds = Math.floor(value % 60);
                    return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
                  }} />
                  <Tooltip content={<CustomLapTimeTooltip />} />
                  <Legend />
                  <Line type="monotone" dataKey="bestLapTime" stroke="#82ca9d" name={t('best_laptime')} activeDot={{ r: 8 }} />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <p className="text-center text-muted-foreground">
                {selectedTrackId
                  ? t('no_data_for_chart')
                  : t('select_a_track_for_chronos')}
              </p>
            )}
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>{t('monthly_activity')}</CardTitle>
          </CardHeader>
          <CardContent>
            {monthlyActivityData.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={monthlyActivityData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis yAxisId="left" label={{ value: t('total_laps'), angle: -90, position: 'insideLeft' }} />
                  <YAxis yAxisId="right" orientation="right" label={{ value: t('total_distance_km'), angle: 90, position: 'insideRight' }} />
                  <Tooltip />
                  <Legend />
                  <Line yAxisId="left" type="monotone" dataKey="totalLaps" stroke="#8884d8" name={t('total_laps')} />
                  <Line yAxisId="right" type="monotone" dataKey="totalDistance" stroke="#82ca9d" name={t('total_distance_km')} />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <p className="text-center text-muted-foreground">{t('no_data_for_chart')}</p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Analytics;