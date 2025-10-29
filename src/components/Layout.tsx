import React from 'react';
import { Link, Outlet, useLocation, useMatches } from 'react-router-dom';
import {
  Sheet,
  SheetContent,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Menu, Car, Wrench, CalendarDays, Settings, Gauge, Users, Globe, ChevronLeft, ChevronRight, KeyRound, UserRound } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useTranslation } from 'react-i18next';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useAuth } from '@/context/AuthContext';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

const queryClient = new QueryClient();

interface RouteMatch {
  id: string;
  pathname: string;
  params: { [key: string]: string | undefined };
  data?: any;
  handle?: {
    crumb?: (data: any) => React.ReactNode;
  };
}

const Layout: React.FC = () => {
  const { t } = useTranslation();
  const { user, logout } = useAuth();
  const location = useLocation();
  const matches = useMatches() as RouteMatch[];

  const [isCollapsed, setIsCollapsed] = React.useState(false);

  const breadcrumbs = matches
    .filter((match) => match.handle?.crumb)
    .map((match, index, array) => {
      const isLast = index === array.length - 1;
      const crumb = match.handle?.crumb?.(match);
      return (
        <React.Fragment key={match.id}>
          <BreadcrumbItem>
            {isLast ? (
              <span className="text-foreground">{crumb}</span>
            ) : (
              <BreadcrumbLink asChild>
                <Link to={match.pathname}>{crumb}</Link>
              </BreadcrumbLink>
            )}
          </BreadcrumbItem>
          {!isLast && <BreadcrumbSeparator />}
        </React.Fragment>
      );
    });

  const navigation = [
    { name: t('Dashboard'), href: '/dashboard', icon: Gauge, roles: ['user', 'admin'] },
    { name: t('trackdays'), href: '/trackdays', icon: CalendarDays, roles: ['user', 'admin'] },
    { name: t('vehicles'), href: '/vehicles', icon: Car, roles: ['user', 'admin'] },
    { name: t('maintenances'), href: '/maintenances', icon: Wrench, roles: ['user', 'admin'] },
    { name: t('settings'), href: '/settings', icon: Settings, roles: ['user', 'admin'] },
    { name: t('my_account'), href: '/profile', icon: UserRound, roles: ['user', 'admin'] },
    { name: t('admin_dashboard'), href: '/admin', icon: Users, roles: ['admin'] },
    { name: t('manage_tracks'), href: '/admin/tracks', icon: Globe, roles: ['admin'] },
    { name: t('manage_countries'), href: '/admin/countries', icon: Globe, roles: ['admin'] },
    { name: t('api_keys'), href: '/settings/api-keys/create', icon: KeyRound, roles: ['user', 'admin'] },
  ];

  const filteredNavigation = navigation.filter(item => {
    if (!user) return false;
    return item.roles.some(role => user.roles.includes(role));
  });

  return (
    <QueryClientProvider client={queryClient}>
      <div className="flex min-h-screen bg-background">
        {/* Sidebar for larger screens */}
        <aside
          className={cn(
            "hidden md:flex flex-col border-r bg-card text-card-foreground transition-all duration-300 ease-in-out",
            isCollapsed ? "w-[60px]" : "w-64"
          )}
        >
          <div className="flex items-center justify-center h-16 border-b relative">
            <Link to="/dashboard" className="flex items-center gap-2">
              <img src="/logo.svg" alt="Logo" className="h-8 w-8" />
              <span
                className={cn(
                  "text-2xl font-bold text-primary overflow-hidden whitespace-nowrap transition-all duration-300 ease-in-out",
                  isCollapsed ? "max-w-0 opacity-0" : "max-w-full opacity-100"
                )}
              >
                FlowUp
              </span>
            </Link>
            <Button
              variant="ghost"
              size="icon"
              className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-1/2 rounded-full bg-background border border-border shadow-md hover:bg-accent"
              onClick={() => setIsCollapsed(!isCollapsed)}
            >
              {isCollapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
            </Button>
          </div>
          <nav className="flex-1 p-2 space-y-1 overflow-y-auto">
            {filteredNavigation.map((item) => (
              <Link
                key={item.name}
                to={item.href}
                className={cn(
                  "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium hover:bg-accent hover:text-accent-foreground",
                  location.pathname.startsWith(item.href)
                    ? "bg-accent text-accent-foreground"
                    : "text-muted-foreground",
                  isCollapsed ? "justify-center" : ""
                )}
              >
                <item.icon className={cn("h-5 w-5", isCollapsed ? "mr-0" : "mr-3")} />
                <span className={cn("overflow-hidden whitespace-nowrap transition-all duration-300 ease-in-out",
                  isCollapsed ? "max-w-0 opacity-0" : "max-w-full opacity-100"
                )}>
                  {item.name}
                </span>
              </Link>
            ))}
          </nav>
        </aside>

        <div className="flex flex-col flex-1">
          {/* Header */}
          <header className="sticky top-0 z-30 flex h-16 items-center gap-4 border-b bg-card px-4 sm:static sm:h-auto sm:border-0 sm:bg-transparent sm:px-6">
            <Sheet>
              <SheetTrigger asChild>
                <Button size="icon" variant="outline" className="sm:hidden">
                  <Menu className="h-5 w-5" />
                  <span className="sr-only">{t('toggle_menu')}</span>
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="sm:max-w-xs">
                <nav className="grid gap-6 text-lg font-medium">
                  <Link to="/dashboard" className="flex items-center gap-2 text-lg font-semibold">
                    <img src="/logo.svg" alt="Logo" className="h-6 w-6" />
                    <span className="text-primary">FlowUp</span>
                  </Link>
                  {filteredNavigation.map((item) => (
                    <Link
                      key={item.name}
                      to={item.href}
                      className={cn(
                        "flex items-center gap-4 px-2.5 text-muted-foreground hover:text-foreground",
                        location.pathname.startsWith(item.href) ? "text-foreground" : ""
                      )}
                    >
                      <item.icon className="h-5 w-5" />
                      {item.name}
                    </Link>
                  ))}
                </nav>
              </SheetContent>
            </Sheet>
            <Breadcrumb className="hidden md:flex">
              <BreadcrumbList>
                {breadcrumbs}
              </BreadcrumbList>
            </Breadcrumb>
            <div className="relative ml-auto flex-1 md:grow-0">
              {/* Search or other header elements can go here */}
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="secondary" size="icon" className="rounded-full">
                  <Avatar>
                    <AvatarImage src={user?.avatarUrl || "https://github.com/shadcn.png"} alt={user?.username || "User"} />
                    <AvatarFallback>{user?.username ? user.username.charAt(0).toUpperCase() : 'U'}</AvatarFallback>
                  </Avatar>
                  <span className="sr-only">{t('toggle_user_menu')}</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>{user?.username || t('my_account')}</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link to="/profile">{t('profile')}</Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link to="/settings">{t('settings')}</Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={logout}>
                  {t('logout')}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </header>

          {/* Main content */}
          <main className="flex-1 p-4 sm:px-6 sm:py-0 overflow-auto">
            <Outlet />
          </main>
        </div>
      </div>
    </QueryClientProvider>
  );
};

export default Layout;