import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import Login from './Login';
import Register from './Register';
import { useSearchParams } from 'react-router-dom';

const AuthTabs: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const defaultTab = searchParams.get('tab') || 'login';

  const handleTabChange = (value: string) => {
    setSearchParams({ tab: value });
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100 dark:bg-gray-900">
      <Tabs defaultValue={defaultTab} onValueChange={handleTabChange} className="w-[400px]">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="login">Login</TabsTrigger>
          <TabsTrigger value="register">Register</TabsTrigger>
        </TabsList>
        <TabsContent value="login" className="transition-all duration-300 ease-in-out data-[state=inactive]:opacity-0 data-[state=inactive]:scale-95 data-[state=inactive]:translate-y-2 data-[state=active]:opacity-100 data-[state=active]:scale-100 data-[state=active]:translate-y-0">
          <Login />
        </TabsContent>
        <TabsContent value="register" className="transition-all duration-300 ease-in-out data-[state=inactive]:opacity-0 data-[state=inactive]:scale-95 data-[state=inactive]:translate-y-2 data-[state=active]:opacity-100 data-[state=active]:scale-100 data-[state=active]:translate-y-0">
          <Register />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AuthTabs;