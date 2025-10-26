"use client";

import React from 'react';
import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { PlusCircle, Copy, Trash2, Key } from 'lucide-react';
import { DataTable } from '@/components/DataTable';
import { createColumnHelper, ColumnDef } from '@tanstack/react-table';
import { toast } from 'sonner';
import ConfirmDeleteDialog from '@/components/ConfirmDeleteDialog';
import { format } from 'date-fns';
import { v4 as uuidv4 } from 'uuid';
import { ApiKey, Permissions } from '@/types';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Link, useNavigate } from 'react-router-dom'; // Import useNavigate

const columnHelper = createColumnHelper<ApiKey>();

const PermissionsDisplay: React.FC<{ permissions: Permissions }> = ({ permissions }) => {
  const { t } = useTranslation();
  const activePermissions: string[] = [];

  Object.entries(permissions).forEach(([tableName, actions]) => {
    Object.entries(actions).forEach(([action, isActive]) => {
      if (isActive) {
        activePermissions.push(`${t(action)} ${t(tableName)}`);
      }
    });
  });

  if (activePermissions.length === 0) {
    return <span className="text-muted-foreground">{t('no_permissions')}</span>;
  }

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Badge variant="secondary" className="cursor-help">
            {t('view_permissions')} ({activePermissions.length})
          </Badge>
        </TooltipTrigger>
        <TooltipContent className="max-w-xs p-2">
          <p className="font-semibold mb-1">{t('granted_permissions')}:</p>
          <ul className="list-disc list-inside space-y-0.5">
            {activePermissions.map((perm, index) => (
              <li key={index} className="text-sm">{perm}</li>
            ))}
          </ul>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};

const DeveloperTab: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate(); // Initialize useNavigate
  const [apiKeys, setApiKeys] = React.useState<ApiKey[]>([]);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = React.useState(false);
  const [apiKeyToDelete, setApiKeyToDelete] = React.useState<string | null>(null);

  // Simulate fetching API keys on component mount
  React.useEffect(() => {
    // In a real app, you would fetch this from your backend
    const mockApiKeys: ApiKey[] = [
      {
        id: '1',
        name: 'My First API Key',
        key: 'sk_live_abc123def456ghi789jkl012mno345pqr678stu901vwx234yz567',
        createdAt: new Date().toISOString(),
        expiresAt: null,
        permissions: {
          trackdays: { create: true, read: true, update: false, delete: false },
          vehicles: { create: false, read: true, update: false, delete: false },
          maintenances: { create: false, read: false, update: false, delete: false },
          tracks: { create: false, read: true, update: false, delete: false },
          countries: { create: false, read: true, update: false, delete: false },
          users: { create: false, read: false, update: false, delete: false },
        },
      },
    ];
    setApiKeys(mockApiKeys);
  }, []);

  const copyApiKey = (key: string) => {
    navigator.clipboard.writeText(key);
    toast.success(t('api_key_copied_to_clipboard'));
  };

  const handleDeleteClick = (id: string) => {
    setApiKeyToDelete(id);
    setIsDeleteDialogOpen(true);
  };

  const handleConfirmDelete = () => {
    if (apiKeyToDelete) {
      setApiKeys((prevKeys) => prevKeys.filter((key) => key.id !== apiKeyToDelete));
      toast.success(t('api_key_deleted_successfully'));
      setIsDeleteDialogOpen(false);
      setApiKeyToDelete(null);
    }
  };

  const columns: ColumnDef<ApiKey>[] = [
    columnHelper.accessor('name', {
      header: () => t('api_key_name'),
      cell: (info) => info.getValue(),
    }),
    columnHelper.accessor('key', {
      header: () => t('api_key'),
      cell: (info) => (
        <div className="flex items-center space-x-2">
          <span className="font-mono text-sm">{info.getValue()}</span>
          <Button variant="ghost" size="icon" onClick={() => copyApiKey(info.getValue())}>
            <Copy className="h-4 w-4" />
            <span className="sr-only">{t('copy_api_key')}</span>
          </Button>
        </div>
      ),
    }),
    columnHelper.accessor('expiresAt', {
      header: () => t('expires_at'),
      cell: (info) => info.getValue() ? format(new Date(info.getValue()), 'PPP') : t('never'),
    }),
    columnHelper.accessor('permissions', {
      header: () => t('permissions'),
      cell: (info) => <PermissionsDisplay permissions={info.getValue()} />,
      enableSorting: false,
      enableColumnFilter: false,
    }),
    columnHelper.accessor('createdAt', {
      header: () => t('created_at'),
      cell: (info) => format(new Date(info.getValue()), 'PPP'),
    }),
    columnHelper.display({
      id: 'actions',
      header: () => t('actions'),
      cell: ({ row }) => (
        <Button
          variant="destructive"
          size="icon"
          onClick={() => handleDeleteClick(row.original.id)}
        >
          <Trash2 className="h-4 w-4" />
          <span className="sr-only">{t('delete_api_key')}</span>
        </Button>
      ),
    }),
  ];

  return (
    <Card className="bg-transparent shadow-none border-none">
      <CardHeader>
        <CardTitle>{t('api_keys')}</CardTitle>
        <CardDescription>{t('manage_api_keys_description')}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {apiKeys.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-6 text-center border rounded-md">
            <Key className="h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-muted-foreground mb-4">{t('no_api_keys_created')}</p>
            <Button onClick={() => navigate('/settings/api-keys/create')} className="btn-primary-gradient">
              <PlusCircle className="mr-2 h-5 w-5" /> {t('create_api_key')}
            </Button>
          </div>
        ) : (
          <>
            <div className="flex justify-end">
              <Button onClick={() => navigate('/settings/api-keys/create')} className="btn-primary-gradient">
                <PlusCircle className="mr-2 h-5 w-5" /> {t('create_api_key')}
              </Button>
            </div>
            <DataTable columns={columns} data={apiKeys} filterColumnId="name" filterPlaceholder={t('search_api_keys')} />
          </>
        )}
      </CardContent>

      <ConfirmDeleteDialog
        isOpen={isDeleteDialogOpen}
        onClose={() => setIsDeleteDialogOpen(false)}
        onConfirm={handleConfirmDelete}
        title={t('confirm_delete_api_key_title')}
        description={t('confirm_delete_api_key_description')}
        confirmButtonText={t('delete')}
        cancelButtonText={t('cancel')}
      />
    </Card>
  );
};

export default DeveloperTab;