import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, Trash2, Edit, ArrowLeft, PlusCircle } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import apiClient from '@/lib/apiClient';
import { UserType } from '@/types';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import ConfirmDeleteDialog from '@/components/ConfirmDeleteDialog';
import { DataTable } from '@/components/DataTable';
import { ColumnDef, createColumnHelper } from '@tanstack/react-table';

const columnHelper = createColumnHelper<UserType>();

const AdminUsers: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [selectedUserId, setSelectedUserId] = React.useState<number | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = React.useState(false);

  // Fetch users
  const { data: users, isLoading, isError, error } = useQuery<UserType[]>({
    queryKey: ['admin-users'],
    queryFn: async () => {
      const response = await apiClient.get('/admin/users');
      // the API wraps the users in an object: { users: [...] }
      return response.data?.users || [];
    },
  });

  // Delete mutation
  const deleteUserMutation = useMutation({
    mutationFn: async (userId: number) => {
      const response = await apiClient.delete(`/admin/users/${userId}`);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-users'] });
      toast.success(t('user_deleted_successfully'));
      setIsDeleteDialogOpen(false);
      setSelectedUserId(null);
    },
    onError: () => {
      toast.error(t('an_unexpected_error_occurred'));
    },
  });

  const handleDeleteClick = (userId: number) => {
    setSelectedUserId(userId);
    setIsDeleteDialogOpen(true);
  };

  const handleConfirmDelete = () => {
    if (selectedUserId) {
      deleteUserMutation.mutate(selectedUserId);
    }
  };

  if (isLoading) {
    return <div className="space-y-6">{t('loading')}...</div>;
  }

  if (isError) {
    return <div className="space-y-6 text-red-500">{t('an_unexpected_error_occurred')}</div>;
  }

  const columns: ColumnDef<UserType>[] = [
    columnHelper.accessor('email', {
      header: () => t('email'),
      cell: (info) => info.getValue(),
    }),
    columnHelper.accessor('firstName', {
      header: () => t('first_name'),
      cell: (info) => info.getValue(),
    }),
    columnHelper.accessor('lastName', {
      header: () => t('last_name'),
      cell: (info) => info.getValue(),
    }),
    columnHelper.accessor('role', {
      header: () => t('role'),
      cell: (info) => (<span className="inline-flex items-center rounded-full bg-blue-100 px-3 py-1 text-sm font-medium text-blue-800">{info.getValue()}</span>),
    }),
    columnHelper.display({
      id: 'actions',
      header: () => t('actions'),
      cell: ({ row }) => (
        <div className="flex gap-2">
          <Button title={t('edit_user')} asChild variant="outline" size="icon">
            <Link to={`/admin/users/edit/${row.original.id}`}>
              <Edit className="h-4 w-4" />
              <span className="sr-only">{t('edit_user')}</span>
            </Link>
          </Button>
          <Button
            variant="destructive"
            size="icon"
            onClick={() => handleDeleteClick(row.original.id)}
            disabled={deleteUserMutation.isPending}
            className="btn-danger"
            title={deleteUserMutation.isPending ? t('deleting') : t('delete_user')}
          >
            <Trash2 className="h-4 w-4" />
            <span className="sr-only">{deleteUserMutation.isPending ? t('deleting') : t('delete_user')}</span>
          </Button>
        </div>
      ),
    }),
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4 mb-6">
        <Button variant="outline" size="icon" onClick={() => navigate('/admin')}>
          <ArrowLeft className="h-4 w-4" />
          <span className="sr-only">{t('back')}</span>
        </Button>
        <div className="flex items-center gap-2">
          <Users className="h-5 w-5" />
          <h1 className="text-3xl font-bold">{t('manage_users')}</h1>
        </div>
      </div>

      <DataTable
        columns={columns}
        data={users}
        filterColumnId="email"
        filterPlaceholder={t('search_by_email')}
        toolbarActions={
          <Button asChild className="btn-primary-gradient">
            <Link to="/admin/users/create">
              <PlusCircle className="mr-2 h-5 w-5 flex-shrink-0" /> {t('add_new_user')}
            </Link>
          </Button>
        }
      ></DataTable>

      <ConfirmDeleteDialog
        isOpen={isDeleteDialogOpen}
        onClose={() => setIsDeleteDialogOpen(false)}
        onConfirm={handleConfirmDelete}
        title={t('confirm_delete_user_title', { defaultValue: 'Supprimer cet utilisateur ?' })}
        description={t('confirm_delete_user_description', { defaultValue: 'Cette action est irréversible.' })}
        confirmButtonText={t('delete')}
        cancelButtonText={t('cancel')}
        isConfirming={deleteUserMutation.isPending}
      />
    </div>
  );
};

export default AdminUsers;
