"use client";

import React from 'react';
import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { PlusCircle, Copy, Trash2 } from 'lucide-react';
import { DataTable } from '@/components/DataTable';
import { createColumnHelper, ColumnDef } from '@tanstack/react-table';
import { toast } from 'sonner';
import ConfirmDeleteDialog from '@/components/ConfirmDeleteDialog';
import { format } from 'date-fns';
import { v4 as uuidv4 } from 'uuid';

interface ApiKey {
  id: string;
  key: string;
  createdAt: string;
}

const columnHelper = createColumnHelper<ApiKey>();

const DeveloperTab: React.FC = () => {
  const { t } = useTranslation();
  const [apiKeys, setApiKeys] = React.useState<ApiKey[]>([]);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = React.useState(false);
  const [apiKeyToDelete, setApiKeyToDelete] = React.useState<string | null>(null);

  const generateApiKey = () => {
    const newKey = uuidv4();
    const newApiKey: ApiKey = {
      id: newKey,
      key: `sk_live_${newKey.replace(/-/g, '')}`,
      createdAt: new Date().toISOString(),
    };
    setApiKeys((prevKeys) => [...prevKeys, newApiKey]);
    toast.success(t('api_key_created_successfully'));
  };

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
            <p className="text-muted-foreground mb-4">{t('no_api_keys_created')}</p>
            <Button onClick={generateApiKey} className="btn-primary-gradient">
              <PlusCircle className="mr-2 h-5 w-5" /> {t('create_api_key')}
            </Button>
          </div>
        ) : (
          <>
            <div className="flex justify-end">
              <Button onClick={generateApiKey} className="btn-primary-gradient">
                <PlusCircle className="mr-2 h-5 w-5" /> {t('create_api_key')}
              </Button>
            </div>
            <DataTable columns={columns} data={apiKeys} filterColumnId="key" filterPlaceholder={t('search_api_keys')} />
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