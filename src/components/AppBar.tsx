import React from 'react';
import { Link, useLocation, useMatches } from 'react-router-dom';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';
import LanguageSwitcher from './LanguageSwitcher';
import ThemeToggle from './ThemeToggle';
import { useTranslation } from 'react-i18next';
import { cn } from '@/lib/utils';

interface MatchHandle {
  crumb?: string | ((data: any) => React.ReactNode);
}

const AppBar: React.FC = () => {
  const { t } = useTranslation();
  const location = useLocation();
  const matches = useMatches();

  const crumbs = matches
    .filter((match) => (match.handle as MatchHandle)?.crumb)
    .map((match, index, array) => {
      const handle = match.handle as MatchHandle;
      const crumb = typeof handle.crumb === 'function' ? handle.crumb(match.data) : handle.crumb;
      const isLast = index === array.length - 1;

      return (
        <React.Fragment key={match.id}>
          <BreadcrumbItem>
            {isLast ? (
              <BreadcrumbPage>{crumb}</BreadcrumbPage>
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

  // Don't render AppBar on auth page
  if (location.pathname === '/auth') {
    return null;
  }

  return (
    <div className="fixed top-0 right-0 z-50 bg-background border-b h-14 flex items-center px-4 lg:px-6 md:left-[var(--sidebar-width)] transition-[left] duration-300 ease-in-out">
      <div className="flex-1">
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink asChild>
                <Link to="/">{t('home')}</Link>
              </BreadcrumbLink>
            </BreadcrumbItem>
            {crumbs.length > 0 && <BreadcrumbSeparator />}
            {crumbs}
          </BreadcrumbList>
        </Breadcrumb>
      </div>
      <div className="flex items-center gap-2">
        <LanguageSwitcher />
        <ThemeToggle />
      </div>
    </div>
  );
};

export default AppBar;