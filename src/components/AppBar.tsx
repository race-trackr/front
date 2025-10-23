import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';
import { useTranslation } from 'react-i18next';
import { cn } from '@/lib/utils';

interface AppBarProps {
  isCollapsed?: boolean;
}

const AppBar: React.FC<AppBarProps> = ({ isCollapsed }) => {
  const location = useLocation();
  const pathnames = location.pathname.split('/').filter((x) => x);
  const { t } = useTranslation();

  return (
    <div className="flex items-center h-16 px-4 border-b bg-background justify-start"> {/* Changé pour toujours justifier au début (aligner à gauche) */}
      <Breadcrumb>
        <BreadcrumbItem>
          <BreadcrumbLink asChild>
            <Link to="/">{t('home')}</Link>
          </BreadcrumbLink>
        </BreadcrumbItem>
        {/* Ajoute un séparateur uniquement s'il y a d'autres miettes après le lien explicite "Home" */}
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
