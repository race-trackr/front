import React, { ReactNode, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { MenuIcon, ChevronLeft, ChevronRight } from 'lucide-react';
import Sidebar from './Sidebar';
import LanguageSwitcher from './LanguageSwitcher'; // Import LanguageSwitcher
import ThemeToggle from './ThemeToggle'; // Import ThemeToggle
import { useTranslation } from 'react-i18next'; // Import useTranslation

interface LayoutProps {
  children: ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const { t } = useTranslation(); // Initialize useTranslation

  const toggleSidebar = () => {
    setIsCollapsed(!isCollapsed);
  };

  const sidebarWidthClass = isCollapsed ? 'w-[60px]' : 'w-[280px]';
  const gridColsClass = isCollapsed ? 'md:grid-cols-[60px_1fr]' : 'md:grid-cols-[280px_1fr]';

  // If not authenticated and not loading, don't render the sidebar layout
  if (!loading && !isAuthenticated) {
    return <main className="flex flex-1 flex-col gap-4 p-4 lg:gap-6 lg:p-6">{children}</main>;
  }

  return (
    <div className={`grid min-h-screen w-full ${gridColsClass} lg:${gridColsClass}`}>
      {/* Desktop Sidebar */}
      <div className={`hidden border-r bg-muted/40 md:block ${sidebarWidthClass} transition-all duration-300 ease-in-out`}>
        <div className="flex h-full max-h-screen flex-col gap-2">
          <div className="flex h-14 items-center border-b px-4 lg:h-[60px] lg:px-6 justify-between">
            <Link to="/" className="flex items-center gap-2 font-semibold">
              {!isCollapsed && <span className="text-2xl font-bold text-primary">Race Trackr</span>}
            </Link>
            <div className="flex items-center gap-2"> {/* Container for toggles */}
              <LanguageSwitcher />
              <ThemeToggle />
              <Button
                variant="ghost"
                size="icon"
                onClick={toggleSidebar}
                className="h-8 w-8"
              >
                {isCollapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
                <span className="sr-only">Toggle sidebar</span>
              </Button>
            </div>
          </div>
          <div className="flex-1 overflow-y-auto">
            <Sidebar isCollapsed={isCollapsed} />
          </div>
        </div>
      </div>

      {/* Mobile Header and Sidebar */}
      <div className="flex flex-col">
        <header className="flex h-14 items-center gap-4 border-b bg-muted/40 px-4 lg:h-[60px] lg:px-6 md:hidden">
          <Sheet>
            <SheetTrigger asChild>
              <Button
                variant="outline"
                size="icon"
                className="shrink-0 md:hidden"
              >
                <MenuIcon className="h-5 w-5" />
                <span className="sr-only">Toggle navigation menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="flex flex-col">
              <Link to="/" className="flex items-center gap-2 font-semibold text-primary text-2xl">
                Race Trackr
              </Link>
              <Sidebar isMobile={true} />
            </SheetContent>
          </Sheet>
          <Link to="/" className="text-2xl font-bold text-primary ml-auto">Race Trackr</Link>
          <div className="flex items-center gap-2"> {/* Container for toggles */}
            <LanguageSwitcher />
            <ThemeToggle />
          </div>
        </header>

        {/* Main Content */}
        <main className="flex flex-1 flex-col gap-4 p-4 lg:gap-6 lg:p-6">
          {children}
        </main>
      </div>
    </div>
  );
};

export default Layout;