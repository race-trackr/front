import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';
import { useTranslation } from 'react-i18next'; // Importation de useTranslation
import { cn } from '@/lib/utils';

interface AppBarProps {
  isCollapsed?: boolean;
}

const AppBar: React.FC<AppBarProps> = ({ isCollapsed }) => {
  const location = useLocation();
  const pathnames = location.pathname.split('/').filter((x) => x);
  const { t } = useTranslation(); // Utilisation du hook useTranslation

  return (
    <div className={cn("flex items-center h-16 px-4 border-b bg-background", isCollapsed ? "justify-center" : "justify-between")}>
      <Breadcrumb>
        <BreadcrumbItem>
          <BreadcrumbLink asChild>
            <Link to="/">{t('home')}</Link>
          </BreadcrumbLink>
        </BreadcrumbItem>
        {/* Only add separator if there are other crumbs after the explicit Home link */}
        {pathnames.length > 0 && <BreadcrumbSeparator />}
        {pathnames.map((name, index) => {
          const routeTo = `/${pathnames.slice(0, index + 1).join('/')}`;
          const isLast = index === pathnames.length - 1;
          const translatedName = t(name.toLowerCase()); // Traduire chaque segment du chemin

          return (
            <React.Fragment key={name}>
              <BreadcrumbItem>
                {isLast ? (
                  <span className="text-foreground">{translatedName}</span>
                ) : (
                  <BreadcrumbLink asChild>
                    <Link to={routeTo}>{translatedName}</Link>
                  </BreadcrumbLink>
                )}
              </BreadcrumbItem>
              {!isLast && <BreadcrumbSeparator />}
            </React.Fragment>
          );
        })}
      </Breadcrumb>
    </div>
  );
};

export default AppBar;