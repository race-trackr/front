import React from 'react';
import { NavLink as RouterNavLink } from 'react-router-dom';
import { cn } from '@/lib/utils';

interface NavLinkProps {
  to: string;
  icon: React.ReactNode;
  children: React.ReactNode;
  isMobile: boolean; // Gardé pour compatibilité, mais peut être réévalué si non utilisé
  isCollapsed: boolean;
}

const NavLink: React.FC<NavLinkProps> = ({ to, icon, children, isCollapsed }) => {
  return (
    <RouterNavLink
      to={to}
      className={({ isActive }) =>
        cn(
          "flex items-center rounded-md px-3 py-2 text-sm font-medium transition-colors duration-200",
          isActive
            ? "bg-primary text-primary-foreground shadow-sm" // Style pour le lien actif
            : "text-muted-foreground hover:bg-accent hover:text-accent-foreground", // Style pour le lien inactif avec effet de survol
          isCollapsed ? "justify-center" : "justify-start"
        )
      }
    >
      {icon}
      <span className={cn("ml-3", isCollapsed ? "hidden" : "block")}>{children}</span>
    </RouterNavLink>
  );
};

export default NavLink;