import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import Login from './Login';
import Register from './Register';
import { useSearchParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next'; // Import useTranslation

const AuthTabs: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const defaultTab = searchParams.get('tab') || 'login';
  const { t } = useTranslation(); // Initialize useTranslation

  const handleTabChange = (value: string) => {
    setSearchParams({ tab: value });
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-background">
      <Tabs defaultValue={defaultTab} onValueChange={handleTabChange} className="w-[400px]">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="login">{t('login')}</TabsTrigger>
          <TabsTrigger value="register">{t('register')}</TabsTrigger>
        </TabsList>
        <TabsContent 
          value="login" 
          className="transition-all duration-300 ease-in-out 
                     data-[state=inactive]:opacity-0 data-[state=inactive]:scale-90 data-[state=inactive]:-translate-y-4 
                     data-[state=active]:opacity-100 data-[state=active]:scale-100 data-[state=active]:translate-y-0"
        >
          <Login />
        </TabsContent>
        <TabsContent 
          value="register" 
          className="transition-all duration-300 ease-in-out 
                     data-[state=inactive]:opacity-0 data-[state=inactive]:scale-90 data-[state=inactive]:-translate-y-4 
                     data-[state=active]:opacity-100 data-[state=active]:scale-100 data-[state=active]:translate-y-0"
        >
          <Register />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AuthTabs;