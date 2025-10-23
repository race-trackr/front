import React, { ReactNode, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { MenuIcon, ChevronLeft, ChevronRight } from 'lucide-react';
import Sidebar from './Sidebar';
import { useTranslation } from 'react-i18next';
import { cn } from '@/lib/utils';

interface LayoutProps {
  children: ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const { isAuthenticated, loading } = useAuth(); // Garder pour le contenu de la barre latérale, mais pas pour la décision de structure du layout
  const [isCollapsed, setIsCollapsed] = useState(false);
  const { t } = useTranslation();
  const location = useLocation();

  const toggleSidebar = () => {
    setIsCollapsed(!isCollapsed);
  };

  const sidebarWidthClass = isCollapsed ? 'w-[60px]' : 'w-[280px]';
  const gridColsClass = isCollapsed ? 'md:grid-cols-[60px_1fr]' : 'md:grid-cols-[280px_1fr]';

  const isAuthPage = location.pathname === '/auth';

  // Si c'est la page d'authentification, rendre uniquement les enfants sans aucune structure de layout.
  // Le padding pour le contenu principal sera géré par le composant AuthTabs lui-même.
  if (isAuthPage) {
    return <main className="flex flex-1 flex-col p-0 gap-0">{children}</main>;
  }

  // Pour toutes les autres pages (tableau de bord, routes protégées), rendre le layout complet.
  // Les vérifications isAuthenticated et loading sont gérées par Index.tsx et ProtectedRoute.tsx
  // qui redirigeront si l'utilisateur n'est pas authentifié ou si le chargement est toujours en cours.
  return (
    <div className={`grid min-h-screen w-full ${gridColsClass} lg:${gridColsClass}`}>
      {/* Desktop Sidebar */}
      <div className={`hidden border-r bg-muted/40 md:block ${sidebarWidthClass} transition-all duration-300 ease-in-out`}>
        <div className="flex h-full max-h-screen flex-col gap-2">
          <div className="flex h-14 items-center border-b px-4 lg:h-[60px] lg:px-6 justify-between">
            <Link to="/" className="flex items-center gap-2 font-semibold">
              {!isCollapsed && <span className="text-2xl font-bold text-primary">Race Trackr</span>}
            </Link>
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