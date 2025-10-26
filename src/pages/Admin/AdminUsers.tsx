import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { PlusCircle, User as UserIcon, Edit, Trash2 } from 'lucide-react';
import { UserType, CountryType } from '@/types';
import { useTranslation } from 'react-i18next';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getUsers, deleteUser } from '@/lib/api/users';
import { toast } from 'sonner';
import ConfirmDeleteDialog from '@/components/ConfirmDeleteDialog';
import apiClient from '@/lib/apiClient';

const AdminUsers: React.FC = () => {
  const { t } = useTranslation();
  const queryClient = useQueryClient();

  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = React.useState(false);
  const [userToDelete, setUserToDelete] = React.useState<number | null>(null);

  const { data: users, isLoading, isError } = useQuery<UserType[]>({
    queryKey: ['users'],
    queryFn: getUsers,
  });

  const { data: countries, isLoading: isLoadingCountries } = useQuery<CountryType[]>({
    queryKey: ['countries'],
    queryFn: async () => {
      const response = await apiClient.get('/countries');
      return response.data;
    },
  });

  const deleteUserMutation = useMutation({
    mutationFn: (id: number) => deleteUser(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      toast.success(t('user_deleted_successfully'));
      setIsDeleteDialogOpen(false);
      setUserToDelete(null);
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || t('failed_to_delete_user'));
      setIsDeleteDialogOpen(false);
      setUserToDelete(null);
    },
  });

  const handleDeleteClick = (id: number) => {
    setUserToDelete(id);
    setIsDeleteDialogOpen(true);
  };

  const handleConfirmDelete = () => {
    if (userToDelete !== null) {
      deleteUserMutation.mutate(userToDelete);
    }
  };

  const getCountryName = (countryId: number) => {
    if (isLoadingCountries) return t('loading_countries');
    return countries?.find(c => c.id === countryId)?.name || t('unknown_country');
  };

  if (isLoading) {
    return <div className="space-y-6">{t('loading_users')}</div>;
  }

  if (isError) {
    return <div className="space-y-6 text-red-500">{t('error_loading_users')}</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">{t('manage_users')}</h1>
        <Button asChild className="btn-primary-gradient">
          <Link to="/admin/users/create">
            <PlusCircle className="mr-2 h-5 w-5 flex-shrink-0" /> {t('add_new_user')}
          </Link>
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {users && users.length === 0 ? (
          <p className="text-muted-foreground">{t('no_users_added')}</p>
        ) : (
          users?.map((user) => (
            <Card key={user.id}>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <UserIcon className="h-5 w-5 text-muted-foreground" />
                  {user.fullName}
                </CardTitle>
                <p className="text-sm text-muted-foreground">{user.email}</p>
              </CardHeader>
              <CardContent className="space-y-2">
                <p><strong>{t('role')}:</strong> {user.role}</p>
                <p><strong>{t('country')}:</strong> {getCountryName(user.countryId)}</p>
                <div className="flex gap-2 mt-4">
                  <Button asChild variant="outline" className="flex-1">
                    <Link to={`/admin/users/edit/${user.id}`}>
                      <Edit className="mr-2 h-4 w-4" /> {t('view_edit_details')}
                    </Link>
                  </Button>
                  <Button
                    variant="destructive"
                    size="icon"
                    onClick={() => handleDeleteClick(user.id)}
                    disabled={deleteUserMutation.isPending}
                    className="btn-danger"
                  >
                    <Trash2 className="h-4 w-4" />
                    <span className="sr-only">{deleteUserMutation.isPending ? t('deleting') : t('delete_user_button')}</span>
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      <ConfirmDeleteDialog
        isOpen={isDeleteDialogOpen}
        onClose={() => setIsDeleteDialogOpen(false)}
        onConfirm={handleConfirmDelete}
        title={t('confirm_delete_user_title')}
        description={t('confirm_delete_user_description')}
        confirmButtonText={t('delete_user_button')}
        cancelButtonText={t('cancel')}
        isConfirming={deleteUserMutation.isPending}
      />
    </div>
  );
};

export default AdminUsers;