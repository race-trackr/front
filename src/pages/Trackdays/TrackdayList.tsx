"use client";

import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { PlusCircle, Calendar, Edit, Trash2, Eye, Search } from 'lucide-react';
import { getTrackdays, deleteTrackday } from '@/lib/api/trackdays';
import { getVehicles } from '@/lib/api/vehicles';
import { getTracks } from '@/lib/api/tracks';
import { format } from 'date-fns';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { TrackDayType, UserVehicleType, TrackType, PaginatedResponse } from '@/types';
import ConfirmDeleteDialog from '@/components/ConfirmDeleteDialog';
import { toast } from 'sonner';
import { Skeleton } from '@/components/ui/skeleton';
import useDebounce from '@/hooks/useDebounce';
import { Combobox } from '@/components/ui/combobox';
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
  PaginationEllipsis,
} from "@/components/ui/pagination";

const TrackdayList: React.FC = () => {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  const [inputValue, setInputValue] = React.useState('');
  const debouncedSearch = useDebounce(inputValue, 500);

  const [filterVehicleId, setFilterVehicleId] = React.useState<number | undefined>(undefined);
  const [filterTrackId, setFilterTrackId] = React.useState<number | undefined>(undefined);

  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = React.useState(false);
  const [trackdayToDelete, setTrackdayToDelete] = React.useState<string | null>(null);

  // Pagination states
  const [currentPage, setCurrentPage] = React.useState(1);
  const itemsPerPage = 9; // Fixed limit of 9 items per page

  const { data: paginatedTrackdaysResponse, isLoading, isError } = useQuery<PaginatedResponse<TrackDayType>>({
    queryKey: ['trackdays', { page: currentPage, limit: itemsPerPage, search: debouncedSearch, filterVehicleId, filterTrackId }],
    queryFn: () => getTrackdays({
      limit: itemsPerPage,
      page: currentPage, // Sending currentPage as 'page' parameter
      searchTerm: debouncedSearch || undefined,
      vehicleId: filterVehicleId,
      trackId: filterTrackId,
    }),
    onError: (error: any) => {
      toast.error(t('an_unexpected_error_occurred')); // Generic error message
    },
  });

  const { data: vehicles, isLoading: isLoadingVehicles } = useQuery<UserVehicleType[]>({
    queryKey: ['vehicles'],
    queryFn: () => getVehicles({ limit: 0 }),
    onError: (error: any) => {
      toast.error(t('an_unexpected_error_occurred')); // Generic error message
    },
  });

  const { data: tracks, isLoading: isLoadingTracks } = useQuery<TrackType[]>({
    queryKey: ['tracks'],
    queryFn: () => getTracks(),
    onError: (error: any) => {
      toast.error(t('an_unexpected_error_occurred')); // Generic error message
    },
  });

  const deleteTrackdayMutation = useMutation({
    mutationFn: (id: string) => deleteTrackday(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['trackdays'] });
      toast.success(t('trackday_deleted_successfully'));
      setIsDeleteDialogOpen(false);
      setTrackdayToDelete(null);
    },
    onError: (error: any) => {
      toast.error(t('an_unexpected_error_occurred')); // Generic error message
      setIsDeleteDialogOpen(false);
      setTrackdayToDelete(null);
    },
  });

  const handleDeleteClick = (id: string) => {
    setTrackdayToDelete(id);
    setIsDeleteDialogOpen(true);
  };

  const handleConfirmDelete = () => {
    if (trackdayToDelete !== null) {
      deleteTrackdayMutation.mutate(trackdayToDelete);
    }
  };

  const trackOptions = React.useMemo(() => {
    const options = tracks?.map(track => ({
      value: track.id.toString(),
      label: track.name
    })) || [];
    return [{ value: 'all', label: t('all_tracks') }, ...options];
  }, [tracks, t]);

  const totalItems = paginatedTrackdaysResponse?.meta?.total || 0;
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const paginatedTrackdays = paginatedTrackdaysResponse?.data || [];

  const handlePageChange = (page: number) => {
    if (page > 0 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  if (isError) {
    return <div className="space-y-6 p-4 text-center text-red-500">{t('error_loading_trackdays')}</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-3xl font-bold">{t('your_trackdays')}</h1>
        <Button asChild className="btn-primary-gradient">
          <Link to="/trackdays/create">
            <PlusCircle className="mr-2 h-5 w-5 flex-shrink-0" /> {t('add_new_trackday')}
          </Link>
        </Button>
      </div>

      <div className="flex flex-col md:flex-row items-center gap-4 mb-6">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            type="text"
            placeholder={t('search_trackdays')}
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            className="pl-8 w-full"
          />
        </div>
        <Select
          onValueChange={(value) => setFilterVehicleId(value === 'all' ? undefined : Number(value))}
          value={filterVehicleId?.toString() || 'all'}
        >
          <SelectTrigger className="w-full md:w-[180px]">
            <SelectValue placeholder={t('filter_by_vehicle')} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{t('all_vehicles')}</SelectItem>
            {vehicles?.map((vehicle) => (
              <SelectItem key={vehicle.id} value={vehicle.id.toString()}>
                {vehicle.brand} {vehicle.model}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Combobox
          options={trackOptions}
          value={filterTrackId?.toString() || 'all'}
          onValueChange={(value) => setFilterTrackId(value === 'all' ? undefined : Number(value))}
          placeholder={t('filter_by_track')}
          emptyMessage={t('no_track_found')}
          className="w-full md:w-[180px]"
        />
      </div>

      {isLoading || isLoadingVehicles || isLoadingTracks ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: itemsPerPage }).map((_, index) => (
            <Card key={index} className="flex flex-col">
              <CardHeader>
                <Skeleton className="h-6 w-3/4 mb-2" />
                <Skeleton className="h-4 w-1/2" />
              </CardHeader>
              <CardContent className="flex-grow space-y-2">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-3/4" />
              </CardContent>
              <div className="p-4 border-t flex justify-between gap-2">
                <Skeleton className="h-8 w-8 rounded-md" />
                <Skeleton className="h-8 w-8 rounded-md" />
                <Skeleton className="h-8 w-8 rounded-md" />
              </div>
            </Card>
          ))}
        </div>
      ) : paginatedTrackdays.length > 0 ? (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {paginatedTrackdays.map((trackday) => (
              <Card key={trackday.id} className="flex flex-col">
                <CardHeader>
                  <CardTitle className="text-lg">
                    {trackday.track?.name || trackday.trackId} - {format(new Date(trackday.date), 'PPP')}
                  </CardTitle>
                  <p className="text-sm text-muted-foreground">
                    {trackday.vehicle ? `${trackday.vehicle.brand} ${trackday.vehicle.model}` : t('not_specified_vehicle')}
                  </p>
                </CardHeader>
                <CardContent className="flex-grow space-y-2">
                  <p><strong>{t('best_laptime')}:</strong> {trackday.bestLapTime || t('no_best_laptime')}</p>
                  <p><strong>{t('total_laps')}:</strong> {trackday.totalLaps || t('not_specified')}</p>
                  <p><strong>{t('total_distance')}:</strong> {trackday.totalDistance ? `${trackday.totalDistance} km` : t('not_specified')}</p>
                </CardContent>
                <div className="p-4 border-t flex items-center justify-between gap-2">
                  <Button
                    variant="destructive"
                    size="icon"
                    onClick={() => handleDeleteClick(trackday.id)}
                    disabled={deleteTrackdayMutation.isPending}
                    className="btn-danger"
                  >
                    <Trash2 className="h-4 w-4" />
                    <span className="sr-only">{deleteTrackdayMutation.isPending ? t('deleting') : t('delete_trackday_button')}</span>
                  </Button>
                  <div className="flex gap-2">
                    <Button asChild variant="outline" size="icon">
                      <Link to={`/trackdays/${trackday.id}`}>
                        <Eye className="h-4 w-4" />
                        <span className="sr-only">{t('view_details')}</span>
                      </Link>
                    </Button>
                    <Button asChild variant="outline" size="icon">
                      <Link to={`/trackdays/edit/${trackday.id}`}>
                        <Edit className="h-4 w-4" />
                        <span className="sr-only">{t('edit_trackday_button')}</span>
                      </Link>
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
          {totalPages > 1 && (
            <Pagination>
              <PaginationContent>
                <PaginationItem>
                  <PaginationPrevious onClick={() => handlePageChange(currentPage - 1)} disabled={currentPage === 1} />
                </PaginationItem>
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                  <PaginationItem key={page}>
                    <PaginationLink isActive={page === currentPage} onClick={() => handlePageChange(page)}>
                      {page}
                    </PaginationLink>
                  </PaginationItem>
                ))}
                <PaginationItem>
                  <PaginationNext onClick={() => handlePageChange(currentPage + 1)} disabled={currentPage === totalPages} />
                </PaginationItem>
              </PaginationContent>
            </Pagination>
          )}
        </>
      ) : (
        <Card className="w-full mx-auto text-center p-6">
          <CardContent className="flex flex-col items-center justify-center space-y-4">
            <Calendar className="h-12 w-12 text-muted-foreground" />
            <p className="text-muted-foreground">{t('no_trackdays_recorded')}</p>
          </CardContent>
        </Card>
      )}

      <ConfirmDeleteDialog
        isOpen={isDeleteDialogOpen}
        onClose={() => setIsDeleteDialogOpen(false)}
        onConfirm={handleConfirmDelete}
        title={t('confirm_delete_trackday_title')}
        description={t('confirm_delete_trackday_description')}
        confirmButtonText={t('delete_trackday_button')}
        cancelButtonText={t('cancel')}
        isConfirming={deleteTrackdayMutation.isPending}
      />
    </div>
  );
};

export default TrackdayList;