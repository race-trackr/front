import React, { useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '@/components/ui/pagination'
import { PlusCircle, Wrench, Edit, Trash2, DollarSign, Euro, CalendarDays, Search, X } from 'lucide-react'
import {
  MaintenanceRecordType,
  MaintenanceRecordTypeType,
  PaginatedResponse,
  UserVehicleType,
} from '@/types'
import { deleteMaintenance, getMaintenances } from '@/lib/api/maintenances'
import { getVehicles } from '@/lib/api/vehicles'
import ConfirmDeleteDialog from '@/components/ConfirmDeleteDialog'
import { toast } from 'sonner'
import { format } from 'date-fns'
import { fr, enUS, es, it } from 'date-fns/locale'
import { cn } from '@/lib/utils'
import useDebounce from '@/hooks/useDebounce'
import MaintenanceCostChart from '@/components/MaintenanceCostChart'
import MaintenanceTypeChart from '@/components/MaintenanceTypeChart'

const PAGE_SIZE = 10
const TYPES: MaintenanceRecordTypeType[] = ['maintenance', 'repair', 'modification', 'other']

const MaintenanceList: React.FC = () => {
  const { t, i18n } = useTranslation()
  const queryClient = useQueryClient()
  const navigate = useNavigate()

  const [inputValue, setInputValue] = React.useState('')
  const debouncedSearch = useDebounce(inputValue, 500)
  const [typeFilter, setTypeFilter] = React.useState<string>('all')
  const [vehicleFilter, setVehicleFilter] = React.useState<string>('all')
  const [currentPage, setCurrentPage] = React.useState(1)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = React.useState(false)
  const [maintenanceToDelete, setMaintenanceToDelete] = React.useState<string | null>(null)
  const listRef = React.useRef<HTMLDivElement>(null)

  useEffect(() => {
    setCurrentPage(1)
  }, [debouncedSearch, typeFilter, vehicleFilter])

  // All data — stats + charts (no pagination)
  const { data: overviewResponse, isError: isErrorOverview } = useQuery<
    PaginatedResponse<MaintenanceRecordType>
  >({
    queryKey: ['maintenances', 'overview'],
    queryFn: () => getMaintenances({ limit: 0 }),
  })
  const allMaintenances = overviewResponse?.data || []

  useEffect(() => {
    if (isErrorOverview) toast.error(t('an_unexpected_error_occurred'))
  }, [isErrorOverview, t])

  // Paginated + filtered list
  const {
    data: maintenancesResponse,
    isLoading,
    isError,
    error,
  } = useQuery<
    PaginatedResponse<MaintenanceRecordType>,
    Error,
    PaginatedResponse<MaintenanceRecordType>,
    [
      'maintenances',
      { page: number; limit: number; search?: string; type?: string; vehicle_uuid?: string },
    ]
  >({
    queryKey: [
      'maintenances',
      {
        page: currentPage,
        limit: PAGE_SIZE,
        search: debouncedSearch || undefined,
        type: typeFilter !== 'all' ? typeFilter : undefined,
        vehicle_uuid: vehicleFilter !== 'all' ? vehicleFilter : undefined,
      },
    ],
    queryFn: () =>
      getMaintenances({
        page: currentPage,
        limit: PAGE_SIZE,
        search: debouncedSearch || undefined,
        type: typeFilter !== 'all' ? typeFilter : undefined,
        vehicle_uuid: vehicleFilter !== 'all' ? vehicleFilter : undefined,
      }),
  })

  useEffect(() => {
    if (isError && error) toast.error(t('an_unexpected_error_occurred'))
  }, [isError, error, t])

  useEffect(() => {
    const el = listRef.current
    if (!el || isLoading) return
    let parent = el.parentElement
    while (parent) {
      const { overflowY } = window.getComputedStyle(parent)
      if (overflowY === 'auto' || overflowY === 'scroll') {
        const containerRect = parent.getBoundingClientRect()
        const elRect = el.getBoundingClientRect()
        parent.scrollTo({
          top: parent.scrollTop + elRect.top - containerRect.top,
          behavior: 'smooth',
        })
        return
      }
      parent = parent.parentElement
    }
  }, [debouncedSearch, typeFilter, vehicleFilter])

  const {
    data: vehiclesResponse,
    isError: isErrorVehicles,
    error: vehiclesError,
  } = useQuery<
    PaginatedResponse<UserVehicleType>,
    Error,
    PaginatedResponse<UserVehicleType>,
    ['vehicles']
  >({
    queryKey: ['vehicles'],
    queryFn: () => getVehicles({ limit: 0 }),
  })
  const vehicles = vehiclesResponse?.data || []

  useEffect(() => {
    if (isErrorVehicles && vehiclesError) toast.error(t('an_unexpected_error_occurred'))
  }, [isErrorVehicles, vehiclesError, t])

  const deleteMaintenanceMutation = useMutation({
    mutationFn: (id: string) => deleteMaintenance(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['maintenances'] })
      toast.success(t('maintenance_deleted_successfully'))
      setIsDeleteDialogOpen(false)
      setMaintenanceToDelete(null)
    },
    onError: () => {
      toast.error(t('an_unexpected_error_occurred'))
      setIsDeleteDialogOpen(false)
      setMaintenanceToDelete(null)
    },
  })

  const getLocale = () => {
    switch (i18n.language) {
      case 'fr':
        return fr
      case 'es':
        return es
      case 'it':
        return it
      default:
        return enUS
    }
  }

  const maintenances = maintenancesResponse?.data || []
  const totalItems = maintenancesResponse?.meta?.total || 0
  const totalPages = Math.max(1, Math.ceil(totalItems / PAGE_SIZE))

  const handlePageChange = (page: number) => {
    if (page > 0 && page <= totalPages) setCurrentPage(page)
  }

  const handleDeleteClick = (uuid: string) => {
    setMaintenanceToDelete(uuid)
    setIsDeleteDialogOpen(true)
  }

  const handleConfirmDelete = () => {
    if (maintenanceToDelete !== null) deleteMaintenanceMutation.mutate(maintenanceToDelete)
  }

  if (isError) {
    return (
      <div className="space-y-6 p-4 text-center text-red-500">
        {t('error_loading_maintenances')}
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-3xl font-bold">{t('your_maintenances')}</h1>
        <Button asChild className="btn-primary-gradient">
          <Link to="/maintenances/create">
            <PlusCircle className="mr-2 h-5 w-5 flex-shrink-0" /> {t('add_new_maintenance')}
          </Link>
        </Button>
      </div>

      {/* Stat cards — based on all data */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                {t('total_maintenances')}
                <p className="text-2xl font-bold mt-2">{allMaintenances.length}</p>
              </div>
              <span className="p-2 bg-primary/10 text-red-700 rounded-lg">
                <Wrench className="h-6 w-6 text-primary" />
              </span>
            </div>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg font-normal">{t('total_cost')}</CardTitle>
              <span className="p-2 bg-primary/10 text-red-700 rounded-lg">
                {i18n.language === 'en' ? (
                  <DollarSign className="h-6 w-6 text-primary" />
                ) : (
                  <Euro className="h-6 w-6 text-primary" />
                )}
              </span>
            </div>
            <p className="text-2xl font-bold">
              {new Intl.NumberFormat(i18n.language, {
                style: 'currency',
                currency: i18n.language === 'en' ? 'USD' : 'EUR',
                minimumFractionDigits: 0,
                maximumFractionDigits: 2,
              }).format(allMaintenances.reduce((sum, m) => sum + (Number(m.cost) || 0), 0))}
            </p>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg font-normal">{t('upcoming_maintenances')}</CardTitle>
              <span className="p-2 bg-primary/10 text-red-700 rounded-lg">
                <CalendarDays className="h-6 w-6 text-primary" />
              </span>
            </div>
            <p className="text-2xl font-bold">
              {allMaintenances.filter((m) => m.date && new Date(m.date) > new Date()).length}
            </p>
          </CardHeader>
        </Card>
      </div>

      {/* Charts — based on all data */}
      {allMaintenances.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <MaintenanceCostChart maintenances={allMaintenances} />
          <MaintenanceTypeChart maintenances={allMaintenances} />
        </div>
      )}

      {/* Filters */}
      <div className="flex flex-col md:flex-row items-center gap-4 mb-6">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            type="text"
            placeholder={t('search_table')}
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            className="pl-8 pr-8 w-full"
          />
          {inputValue && (
            <button
              onClick={() => setInputValue('')}
              className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>
        <Select value={typeFilter} onValueChange={setTypeFilter}>
          <SelectTrigger className="w-full md:w-[180px]">
            <SelectValue placeholder={t('filter_by_type')} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{t('all_types')}</SelectItem>
            {TYPES.map((type) => (
              <SelectItem key={type} value={type}>
                {t(`maintenance_type_${type}`)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={vehicleFilter} onValueChange={setVehicleFilter}>
          <SelectTrigger className="w-full md:w-[180px]">
            <SelectValue placeholder={t('filter_by_vehicle')} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{t('all_vehicles')}</SelectItem>
            {vehicles.map((v) => (
              <SelectItem key={v.uuid} value={v.uuid}>
                {v.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Button
          variant="ghost"
          onClick={() => {
            setInputValue('')
            setTypeFilter('all')
            setVehicleFilter('all')
          }}
          className="w-full md:w-auto"
          disabled={inputValue || typeFilter !== 'all' || vehicleFilter !== 'all' ? false : true}
        >
          <X className="mr-2 h-4 w-4" /> {t('clear_filters')}
        </Button>
      </div>

      {/* List */}
      <div ref={listRef} />
      {isLoading ? (
        <div className="grid grid-cols-1 gap-4">
          {Array.from({ length: PAGE_SIZE }).map((_, i) => (
            <Card key={i} className="p-6">
              <div className="flex items-center gap-4">
                <Skeleton className="w-10 h-10 rounded-md flex-shrink-0" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-5 w-1/3" />
                  <Skeleton className="h-4 w-1/4" />
                </div>
                <div className="space-y-2">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-5 w-16" />
                </div>
              </div>
            </Card>
          ))}
        </div>
      ) : maintenances.length > 0 ? (
        <div className="grid grid-cols-1 gap-4">
          {maintenances.map((maintenance) => (
            <Card
              key={maintenance.id}
              className="flex flex-col transition-all duration-200 ease-in-out hover:shadow-lg hover:border-primary"
            >
              <Link to={`/maintenances/${maintenance.uuid}`} className="block h-full p-6">
                <div className="flex justify-between items-center w-full">
                  <div className="flex items-center gap-4 flex-1 pr-4">
                    <div
                      className={cn(
                        'flex items-center justify-center w-10 h-10 rounded-md font-bold text-white flex-shrink-0',
                        'bg-gradient-to-r from-red-500 to-orange-500'
                      )}
                    >
                      <Wrench className="h-5 w-5" />
                    </div>
                    <div>
                      <CardTitle className="text-lg">{maintenance.name}</CardTitle>
                      <p className="text-sm text-muted-foreground">
                        {t(`maintenance_type_${maintenance.type}`)}
                        {maintenance.vehicle && (
                          <span className="ml-2 text-xs">· {maintenance.vehicle.name}</span>
                        )}
                      </p>
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    <p className="text-sm font-medium">
                      {format(new Date(maintenance.date), 'PPP', { locale: getLocale() })}
                    </p>
                    <p className="text-lg font-bold">
                      {maintenance.cost !== null
                        ? `${Number(maintenance.cost).toFixed(2)}€`
                        : t('not_specified')}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 ml-4">
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={(e) => {
                        e.stopPropagation()
                        e.preventDefault()
                        navigate(`/maintenances/edit/${maintenance.uuid}`)
                      }}
                    >
                      <Edit className="h-4 w-4" />
                      <span className="sr-only">{t('edit_maintenance_button')}</span>
                    </Button>
                    <Button
                      variant="destructive"
                      size="icon"
                      onClick={(e) => {
                        e.stopPropagation()
                        e.preventDefault()
                        handleDeleteClick(maintenance.uuid)
                      }}
                      disabled={deleteMaintenanceMutation.isPending}
                      className="btn-danger"
                    >
                      <Trash2 className="h-4 w-4" />
                      <span className="sr-only">
                        {deleteMaintenanceMutation.isPending
                          ? t('deleting')
                          : t('delete_maintenance_button')}
                      </span>
                    </Button>
                  </div>
                </div>
              </Link>
            </Card>
          ))}
        </div>
      ) : (
        <Card className="w-full mx-auto text-center p-6">
          <CardContent className="flex flex-col items-center justify-center space-y-4">
            <Wrench className="h-12 w-12 text-muted-foreground" />
            <p className="text-muted-foreground mb-4">{t('no_maintenances_recorded')}</p>
            <Button asChild className="btn-primary-gradient">
              <Link to="/maintenances/create">
                <PlusCircle className="mr-2 h-5 w-5 flex-shrink-0" /> {t('add_new_maintenance')}
              </Link>
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Pagination — always visible */}
      <Pagination>
        <PaginationContent>
          <PaginationPrevious
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 1}
          />
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
            <PaginationItem key={page}>
              <PaginationLink
                isActive={page === currentPage}
                onClick={() => handlePageChange(page)}
              >
                {page}
              </PaginationLink>
            </PaginationItem>
          ))}
          <PaginationNext
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
          />
        </PaginationContent>
      </Pagination>

      <ConfirmDeleteDialog
        isOpen={isDeleteDialogOpen}
        onClose={() => setIsDeleteDialogOpen(false)}
        onConfirm={handleConfirmDelete}
        title={t('confirm_delete_maintenance_title')}
        description={t('confirm_delete_maintenance_description')}
        confirmButtonText={t('delete_maintenance_button')}
        cancelButtonText={t('cancel')}
        isConfirming={deleteMaintenanceMutation.isPending}
      />
    </div>
  )
}

export default MaintenanceList
