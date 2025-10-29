import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import Login from './Login';
import Register from './Register';
import { useSearchParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { cn } from '@/lib/utils';

const backgroundImages = [
  '/images/login-background-1.jpg',
  '/images/login-background-2.jpg',
  '/images/login-background-3.jpg',
];

const AuthTabs: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const defaultTab = searchParams.get('tab') || 'login';
  const { t } = useTranslation();
  const [currentBackgroundImage, setCurrentBackgroundImage] = React.useState('');

  React.useEffect(() => {
    const randomIndex = Math.floor(Math.random() * backgroundImages.length);
    setCurrentBackgroundImage(backgroundImages[randomIndex]);
  }, []);

  const handleTabChange = (value: string) => {
    setSearchParams({ tab: value });
  };

  return (
    <div
      className="flex items-center justify-center min-h-screen p-4 bg-cover bg-center"
      style={{ backgroundImage: `url(${currentBackgroundImage})` }}
    >
      <div className="w-full md:w-1/2 lg:max-w-xl flex flex-col items-center bg-background/90 p-6 rounded-lg shadow-lg">
        <div className="flex flex-col items-center mb-6">
          <div
            className={cn(
              "flex items-center justify-center w-12 h-12 rounded-lg font-bold text-white text-3xl flex-shrink-0",
              "bg-gradient-to-r from-red-500 to-orange-500 mb-2"
            )}
          >
            R
          </div>
          <h1 className="text-3xl font-bold text-primary mb-2">Race Trackr</h1>
          <p className="text-center text-muted-foreground max-w-xs">
            {t('auth_page_description')}
          </p>
        </div>
        <Tabs defaultValue={defaultTab} onValueChange={handleTabChange} className="w-full">
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
    </div>
  );
};

export default AuthTabs;