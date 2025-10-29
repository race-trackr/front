import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { PlusCircle, Edit, Trash2 } from 'lucide-react';
import { TrackType } from '@/types';
import { useTranslation } from 'react-i18next';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import apiClient from '@/lib/apiClient';
import { DataTable } from '@/components/DataTable';
import { createColumnHelper, ColumnDef } from '@tanstack/react-table';
import { toast } from 'sonner';
import ConfirmDeleteDialog from '@/components/ConfirmDeleteDialog';

const columnHelper = createColumnHelper<TrackType>();

const AdminTracks: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = React.useState(false);
  const [trackToDelete, setTrackToDelete] = React.useState<number | null>(null);

  const { data: tracks, isLoading, isError } = useQuery<TrackType[]>({
    queryKey: ['tracks'],
    queryFn: async () => {
      const response = await apiClient.get('/tracks');
      return response.data;
    },
  });

  const deleteTrackMutation = useMutation({
    mutationFn: async (id: number) => {
      await apiClient.delete(`/tracks/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tracks'] });
      toast.success(t('track_deleted_successfully'));
      setIsDeleteDialogOpen(false);
      setTrackToDelete(null);
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || t('failed_to_delete_track'));
      setIsDeleteDialogOpen(false);
      setTrackToDelete(null);
    },
  });

  const handleDeleteClick = (id: number) => {
    setTrackToDelete(id);
    setIsDeleteDialogOpen(true);
  };

  const handleConfirmDelete = () => {
    if (trackToDelete !== null) {
      deleteTrackMutation.mutate(trackToDelete);
    }
  };

  const columns: ColumnDef<TrackType>[] = [
    columnHelper.accessor('name', {
      header: () => t('track_name'),
      cell: (info) => info.getValue(),
    }),
    columnHelper.accessor('city', {
      header: () => t('city'),
      cell: (info) => info.getValue(),
    }),
    columnHelper.accessor('country.name', {
      header: () => t('country'),
      cell: (info) => info.getValue() || t('unknown_country'),
    }),
    columnHelper.accessor('length', {
      header: () => t('length_km'),
      cell: (info) => `${info.getValue()} km`,
    }),
    columnHelper.display({
      id: 'actions',
      header: () => t('actions'),
      cell: ({ row }) => (
        <div className="flex gap-2">
          <Button asChild variant="outline" size="icon">
            <Link to={`/admin/tracks/edit/${row.original.id}`}>
              <Edit className="h-4 w-4" />
              <span className="sr-only">{t('edit_track')}</span>
            </Link>
          </Button>
          <Button
            variant="destructive"
            size="icon"
            onClick={() => handleDeleteClick(row.original.id)}
            disabled={deleteTrackMutation.isPending}
            className="btn-danger"
          >
            <Trash2 className="h-4 w-4" />
            <span className="sr-only">{deleteTrackMutation.isPending ? t('deleting') : t('delete_track_button')}</span>
          </Button>
        </div>
      ),
    }),
  ];

  if (isLoading) {
    return <div className="space-y-6">{t('loading_tracks')}</div>;
  }

  if (isError) {
    return <div className="space-y-6 text-red-500">{t('error_loading_tracks')}</div>;
  }

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">{t('manage_tracks')}</h1>
      <DataTable
        columns={columns}
        data={tracks || []}
        filterColumnId="name"
        filterPlaceholder={t('search_tracks')}
        toolbarActions={
          <Button asChild className="btn-primary-gradient">
            <Link to="/admin/tracks/create">
              <PlusCircle className="mr-2 h-5 w-5 flex-shrink-0" /> {t('add_new_track')}
            </Link>
          </Button>
        }
      />
      <ConfirmDeleteDialog
        isOpen={isDeleteDialogOpen}
        onClose={() => setIsDeleteDialogOpen(false)}
        onConfirm={handleConfirmDelete}
        title={t('confirm_delete_track_title')}
        description={t('confirm_delete_track_description')}
        confirmButtonText={t('delete_track_button')}
        cancelButtonText={t('cancel')}
        isConfirming={deleteTrackMutation.isPending}
      />
    </div>
  );
};

export default AdminTracks;