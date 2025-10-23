import React, { ReactNode, useState } from 'react';
import { Link, useLocation, Outlet } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { MenuIcon, ChevronLeft, ChevronRight } from 'lucide-react';
import Sidebar from './Sidebar';
import { useTranslation } from 'react-i18next';
import { cn } from '@/lib/utils';
import AppBar from './AppBar'; // Import AppBar
import { Toaster } from "@/components/ui/toaster"; // Import Toaster
import { Toaster as Sonner } from "@/components/ui/sonner"; // Import Sonner

interface LayoutProps {
  children: ReactNode; // Children will now be the Outlet
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const { t } = useTranslation();
  const location = useLocation();

  const toggleSidebar = () => {
    setIsCollapsed(!isCollapsed);
  };

  const dynamicSidebarWidth = isCollapsed ? '60px' : '280px';

  return (
    <div
      className={cn(
        `grid min-h-screen w-full`,
        `md:grid-cols-[var(--sidebar-width)_1fr]`,
        `lg:grid-cols-[var(--sidebar-width)_1fr]`,
        `transition-[grid-template-columns] duration-300 ease-in-out`
      )}
      style={{ '--sidebar-width': dynamicSidebarWidth } as React.CSSProperties}
    >
      {/* Desktop Sidebar */}
      <div className={cn(
        "hidden border-r md:block", // Removed bg-muted/40
        "transition-all duration-300 ease-in-out"
      )}>
        <div className="flex h-full max-h-screen flex-col gap-2">
          <div className="flex h-14 items-center border-b px-4 lg:h-[60px] lg:px-6 justify-between">
            <Link to="/" className="flex items-center gap-2 font-semibold">
              <span
                className={cn(
                  "text-2xl font-bold text-primary overflow-hidden whitespace-nowrap transition-all duration-300 ease-in-out",
                  isCollapsed ? "max-w-0 opacity-0" : "max-w-full opacity-100"
                )}
              >
                Race Trackr
              </span>
            </Link>
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleSidebar}
              className="h-8 w-8"
            >
              {isCollapsed ? <ChevronRight className="h-5 w-5 flex-shrink-0" /> : <ChevronLeft className="h-5 w-5 flex-shrink-0" />}
              <span className="sr-only">Toggle sidebar</span>
            </Button>
          </div>
          <div className="flex-1 overflow-y-auto">
            <Sidebar isCollapsed={isCollapsed} />
          </div>
        </div>
      </div>

      {/* Mobile Header (now part of AppBar or removed) and Main Content */}
      <div className="flex flex-col">
        {/* AppBar is now always visible at the top */}
        <AppBar /> 

        {/* Main Content - adjusted padding for fixed AppBar */}
        <main className="flex flex-1 flex-col gap-4 p-4 lg:gap-6 lg:p-6 mt-14"> {/* Changed pt-14 to mt-14 to account for AppBar height */}
          <>{children}</> {/* Explicitly wrap children in a fragment */}
        </main>
      </div>
      <Toaster /> {/* Toaster et Sonner sont maintenant dans le Layout */}
      <Sonner />
    </div>
  );
};

export default Layout;