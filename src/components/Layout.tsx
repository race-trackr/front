import React, { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { MenuIcon, Car, Wrench, Flag, Users, Gauge, CalendarDays } from 'lucide-react';
import { MadeWithDyad } from './made-with-dyad';

interface LayoutProps {
  children: ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const { isAuthenticated, logout, user } = useAuth();

  const navItems = isAuthenticated ? (
    <>
      <NavLink to="/dashboard" icon={<Gauge className="h-4 w-4" />}>Dashboard</NavLink>
      <NavLink to="/trackdays" icon={<CalendarDays className="h-4 w-4" />}>Trackdays</NavLink>
      <NavLink to="/vehicles" icon={<Car className="h-4 w-4" />}>Vehicles</NavLink>
      <NavLink to="/maintenances" icon={<Wrench className="h-4 w-4" />}>Maintenances</NavLink>
      {(user?.role === 'admin' || user?.role === 'super_admin') && (
        <NavLink to="/admin" icon={<Users className="h-4 w-4" />}>Admin</NavLink>
      )}
    </>
  ) : (
    <>
      <NavLink to="/login">Login</NavLink>
      <NavLink to="/register">Register</NavLink>
    </>
  );

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <header className="sticky top-0 z-40 w-full border-b bg-background">
        <div className="container flex h-16 items-center justify-between py-4">
          <Link to="/" className="text-2xl font-bold text-primary">Race Trackr</Link>
          <nav className="hidden md:flex items-center space-x-4">
            {navItems}
            {isAuthenticated && (
              <Button variant="ghost" onClick={logout}>Logout</Button>
            )}
          </nav>
          <div className="md:hidden">
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon">
                  <MenuIcon className="h-6 w-6" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right">
                <nav className="flex flex-col gap-4 pt-6">
                  {navItems}
                  {isAuthenticated && (
                    <Button variant="ghost" onClick={logout}>Logout</Button>
                  )}
                </nav>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </header>
      <main className="flex-grow container py-8">
        {children}
      </main>
      <MadeWithDyad />
    </div>
  );
};

interface NavLinkProps {
  to: string;
  children: ReactNode;
  icon?: ReactNode;
}

const NavLink: React.FC<NavLinkProps> = ({ to, children, icon }) => (
  <Link
    to={to}
    className="flex items-center gap-2 text-lg font-medium transition-colors hover:text-primary md:text-sm"
  >
    {icon}
    {children}
  </Link>
);

export default Layout;