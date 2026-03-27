import React, { useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { PlusCircle, Edit, Trash2, ArrowLeft } from 'lucide-react'
import { CountryType } from '@/types'
import { useTranslation } from 'react-i18next'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import apiClient from '@/lib/apiClient'
import { DataTable } from '@/components/DataTable'
import { createColumnHelper, ColumnDef } from '@tanstack/react-table'
import { toast } from 'sonner'
import ConfirmDeleteDialog from '@/components/ConfirmDeleteDialog'

const columnHelper = createColumnHelper<CountryType>()

const AdminCountries: React.FC = () => {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const queryClient = useQueryClient()

  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = React.useState(false)
  const [countryToDelete, setCountryToDelete] = React.useState<string | null>(null)

  const {
    data: countries,
    isLoading,
    isError: isErrorCountries,
    error: countriesError,
  } = useQuery<
    CountryType[], // TQueryFnData
    Error, // TError
    CountryType[], // TData
    ['countries'] // TQueryKey
  >({
    queryKey: ['countries'],
    queryFn: async () => {
      const response = await apiClient.get('/countries')
      return response.data
    },
  })

  useEffect(() => {
    if (isErrorCountries && countriesError) {
      toast.error(t('an_unexpected_error_occurred'))
    }
  }, [isErrorCountries, countriesError, t])

  const deleteCountryMutation = useMutation({
    mutationFn: async (uuid: string) => {
      await apiClient.delete(`/countries/${uuid}`)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['countries'] })
      toast.success(t('country_deleted_successfully'))
      setIsDeleteDialogOpen(false)
      setCountryToDelete(null)
    },
    onError: (error: Error) => {
      // Corrected onError type
      toast.error(t('an_unexpected_error_occurred'))
      setIsDeleteDialogOpen(false)
      setCountryToDelete(null)
    },
  })

  const handleDeleteClick = (uuid: string) => {
    setCountryToDelete(uuid)
    setIsDeleteDialogOpen(true)
  }

  const handleConfirmDelete = () => {
    if (countryToDelete !== null) {
      deleteCountryMutation.mutate(countryToDelete)
    }
  }

  const columns: ColumnDef<CountryType>[] = [
    columnHelper.accessor('name', {
      header: () => t('country_name'),
      cell: (info) => info.getValue(),
    }),
    columnHelper.accessor('iso', {
      header: () => t('country_iso'),
      cell: (info) => info.getValue(),
    }),
    columnHelper.accessor('capital', {
      header: () => t('capital'),
      cell: (info) => info.getValue(),
    }),
    columnHelper.accessor('timezone', {
      header: () => t('timezone'),
      cell: (info) => info.getValue(),
    }),
    columnHelper.display({
      id: 'actions',
      header: () => t('actions'),
      cell: ({ row }) => (
        <div className="flex gap-2">
          <Button asChild variant="outline" size="icon">
            <Link to={`/admin/countries/edit/${row.original.uuid}`}>
              <Edit className="h-4 w-4" />
              <span className="sr-only">{t('edit_country')}</span>
            </Link>
          </Button>
          <Button
            variant="destructive"
            size="icon"
            onClick={() => handleDeleteClick(row.original.uuid)}
            disabled={deleteCountryMutation.isPending}
            className="btn-danger"
          >
            <Trash2 className="h-4 w-4" />
            <span className="sr-only">
              {deleteCountryMutation.isPending ? t('deleting') : t('delete_country_button')}
            </span>
          </Button>
        </div>
      ),
    }),
  ]

  if (isLoading) {
    return <div className="space-y-6">{t('loading_countries')}</div>
  }

  if (isErrorCountries) {
    // Use specific error flag
    return <div className="space-y-6 text-red-500">{t('error_loading_countries')}</div>
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4 mb-6">
        <Button variant="outline" size="icon" onClick={() => navigate('/admin')}>
          <ArrowLeft className="h-4 w-4" />
          <span className="sr-only">{t('back')}</span>
        </Button>
        <h1 className="text-3xl font-bold flex-1">{t('manage_countries')}</h1>
      </div>
      <DataTable
        columns={columns}
        data={countries || []} // Ensure countries is an array
        filterColumnId="name"
        filterPlaceholder={t('search_countries')}
        toolbarActions={
          <Button asChild className="btn-primary-gradient">
            <Link to="/admin/countries/create">
              <PlusCircle className="mr-2 h-5 w-5 flex-shrink-0" /> {t('add_new_country')}
            </Link>
          </Button>
        }
      />
      <ConfirmDeleteDialog
        isOpen={isDeleteDialogOpen}
        onClose={() => setIsDeleteDialogOpen(false)}
        onConfirm={handleConfirmDelete}
        title={t('confirm_delete_country_title')}
        description={t('confirm_delete_country_description')}
        confirmButtonText={t('delete_country_button')}
        cancelButtonText={t('cancel')}
        isConfirming={deleteCountryMutation.isPending}
      />
    </div>
  )
}

export default AdminCountries
