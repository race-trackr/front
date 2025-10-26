"use client";

import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import ApiKeyForm from '@/components/ApiKeyForm';
import { ApiKey } from '@/types';
import { toast } from 'sonner';
import { v4 as uuidv4 } from 'uuid';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';

const ApiKeyCreate: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [isSavingApiKey, setIsSavingApiKey] = React.useState(false);

  const handleCreateApiKey = (newApiKeyData: Omit<ApiKey, 'id' | 'key' | 'createdAt'>) => {
    setIsSavingApiKey(true);
    // Simulate API call
    setTimeout(() => {
      const newKey: ApiKey = {
        id: uuidv4(),
        key: `sk_live_${uuidv4().replace(/-/g, '')}`,
        createdAt: new Date().toISOString(),
        ...newApiKeyData,
      };
      // In a real app, you would send this to your backend and then refetch the list.
      // For now, we'll just simulate success and navigate back.
      console.log("New API Key created (simulated):", newKey);
      toast.success(t('api_key_created_successfully'));
      setIsSavingApiKey(false);
      navigate('/settings/developer'); // Navigate back to the developer tab
    }, 1000);
  };

  return (
    <div className="mx-auto p-4 space-y-6">
      <div className="flex items-center justify-between mb-4">
        <Button variant="outline" onClick={() => navigate(-1)}>
          <ArrowLeft className="mr-2 h-4 w-4" /> {t('back')}
        </Button>
        <h1 className="text-3xl font-bold flex-grow text-center">{t('create_new_api_key')}</h1>
        <div className="w-10"></div> {/* Placeholder for alignment */}
      </div>
      <Card className="w-full max-w-2xl mx-auto">
        <CardContent className="p-6">
          <ApiKeyForm onSave={handleCreateApiKey} onCancel={() => navigate('/settings/developer')} isSaving={isSavingApiKey} />
        </CardContent>
      </Card>
    </div>
  );
};

export default ApiKeyCreate;