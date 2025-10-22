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

interface UserMenuProps {
  isCollapsed: boolean;
}

const UserMenu: React.FC<UserMenuProps> = ({ isCollapsed }) => {
  const { user, logout } = useAuth();
  const isFreeTier = true; // Placeholder: Replace with actual logic to check user's subscription status

  const handleLogout = () => {
    logout();
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="w-full justify-start h-auto p-2">
          <Avatar className="h-8 w-8">
            <AvatarImage src="/placeholder-user.jpg" alt={user?.username || "User"} />
            <AvatarFallback>{user?.username ? user.username.charAt(0).toUpperCase() : 'U'}</AvatarFallback>
          </Avatar>
          {!isCollapsed && (
            <span className="ml-3 text-sm font-medium truncate">{user?.username || "Guest"}</span>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56" align="end" forceMount>
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-medium leading-none">{user?.username || "Guest"}</p>
            <p className="text-xs leading-none text-muted-foreground">
              {user?.email || "guest@example.com"}
            </p>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
          <Link to="/settings" className="flex items-center">
            <Settings className="mr-2 h-4 w-4" />
            <span>Settings</span>
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link to="/profile" className="flex items-center">
            <UserIcon className="mr-2 h-4 w-4" />
            <span>My Account</span>
          </Link>
        </DropdownMenuItem>
        {isFreeTier && (
          <DropdownMenuItem asChild>
            <Link to="/upgrade" className="flex items-center text-primary">
              <Gem className="mr-2 h-4 w-4" />
              <span>Upgrade to Pro</span>
            </Link>
          </DropdownMenuItem>
        )}
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={handleLogout} className="flex items-center text-destructive">
          <LogOut className="mr-2 h-4 w-4" />
          <span>Log out</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default UserMenu;