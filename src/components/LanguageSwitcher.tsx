import React from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Globe, Check } from 'lucide-react'; // Import Check icon

const LanguageSwitcher: React.FC = () => {
  const { i18n } = useTranslation();

  const changeLanguage = (lng: string) => {
    i18n.changeLanguage(lng);
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="h-8 w-8">
          <Globe className="h-5 w-5" />
          <span className="sr-only">Change language</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={() => changeLanguage('en')} className="flex items-center justify-between">
          English
          {i18n.language === 'en' && <Check className="ml-2 h-5 w-5" />}
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => changeLanguage('fr')} className="flex items-center justify-between">
          Français
          {i18n.language === 'fr' && <Check className="ml-2 h-5 w-5" />}
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => changeLanguage('it')} className="flex items-center justify-between">
          Italiano
          {i18n.language === 'it' && <Check className="ml-2 h-5 w-5" />}
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => changeLanguage('es')} className="flex items-center justify-between">
          Español
          {i18n.language === 'es' && <Check className="ml-2 h-5 w-5" />}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default LanguageSwitcher;