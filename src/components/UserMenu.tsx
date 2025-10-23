import React from 'react';
import { Link } from 'react-router-dom';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Settings, User as UserIcon, Gem, LogOut } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useTranslation } => 'react-i18next';
import { cn } from '@/lib/utils';

interface UserMenuProps {
  isCollapsed: boolean;
}

const UserMenu: React.FC<UserMenuProps> = ({ isCollapsed }) => {
  const { user, logout } = useAuth();
  const { t } = useTranslation();
  const isFreeTier = true; // Placeholder: Replace with actual logic to check user's subscription status

  const handleLogout = () => {
    logout();
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          className={cn(
            "h-auto",
            isCollapsed
              ? "w-10 h-10 p-0 flex items-center justify-center gap-0" // Ajout de gap-0
              : "w-full py-2 justify-start px-3"
          )}
        >
          <Avatar className="h-8 w-8 flex-shrink-0 flex items-center justify-center">
            <AvatarImage src="/placeholder-user.jpg" alt={user?.username || t("user")} />
            <AvatarFallback>{user?.username ? user.username.charAt(0).toUpperCase() : 'U'}</AvatarFallback>
          </Avatar>
          <span
            className={cn(
              "text-sm font-medium truncate overflow-hidden whitespace-nowrap transition-all duration-300 ease-in-out",
              isCollapsed ? "max-w-0 opacity-0" : "max-w-full opacity-100 ml-3"
            )}
          >
            {user?.username || t("guest")}
          </span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56" align="end" forceMount>
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-medium leading-none">{user?.username || t("guest")}</p>
            <p className="text-xs leading-none text-muted-foreground">
              {user?.email || "guest@example.com"}
            </p>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
          <Link to="/settings" className="flex items-center">
            <Settings className="mr-2 h-5 w-5 flex-shrink-0" />
            <span>{t('settings')}</span>
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link to="/profile" className="flex items-center">
            <UserIcon className="mr-2 h-5 w-5 flex-shrink-0" />
            <span>{t('my_account')}</span>
          </Link>
        </DropdownMenuItem>
        {isFreeTier && (
          <DropdownMenuItem asChild>
            <Link to="/upgrade" className="flex items-center btn-primary-gradient p-2 rounded-md">
              <Gem className="mr-2 h-5 w-5 flex-shrink-0" />
              <span>{t('upgrade_to_pro')}</span>
            </Link>
          </DropdownMenuItem>
        )}
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={handleLogout} className="flex items-center text-destructive">
          <LogOut className="mr-2 h-5 w-5 flex-shrink-0" />
          <span>{t('logout')}</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default UserMenu;