"use client";

import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Moon, Sun } from "lucide-react";
import { useTheme } from "@/components/theme-provider";
import LanguageSwitcher from './LanguageSwitcher';
import { cn } from '@/lib/utils'; // Import cn for conditional class names

interface AppBarProps {
  breadcrumbs?: { label: string; path?: string }[];
}

const AppBar: React.FC<AppBarProps> = ({ breadcrumbs }) => {
  const location = useLocation();
  const { theme, setTheme } = useTheme(); // Get the current theme

  const defaultBreadcrumbs = [
    { label: 'Home', path: '/' },
    { label: 'Dashboard', path: '/dashboard' },
  ];

  const currentBreadcrumbs = breadcrumbs && breadcrumbs.length > 0 ? breadcrumbs : defaultBreadcrumbs;

  return (
    <div className="flex h-16 items-center px-4 border-b">
      <Breadcrumb>
        <BreadcrumbList>
          {currentBreadcrumbs.map((crumb, index) => (
            <React.Fragment key={index}>
              <BreadcrumbItem>
                {crumb.path && index < currentBreadcrumbs.length - 1 ? (
                  <BreadcrumbLink asChild>
                    <Link to={crumb.path}>{crumb.label}</Link>
                  </BreadcrumbLink>
                ) : (
                  <BreadcrumbPage>{crumb.label}</BreadcrumbPage>
                )}
              </BreadcrumbItem>
              {index < currentBreadcrumbs.length - 1 && <BreadcrumbSeparator />}
            </React.Fragment>
          ))}
        </BreadcrumbList>
      </Breadcrumb>
      <div className="ml-auto flex items-center space-x-2">
        <LanguageSwitcher />
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="icon">
              <Sun className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
              <Moon className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
              <span className="sr-only">Toggle theme</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem 
              onClick={() => setTheme("light")}
              className={cn(theme === "light" && "bg-accent text-accent-foreground")}
            >
              Light
            </DropdownMenuItem>
            <DropdownMenuItem 
              onClick={() => setTheme("dark")}
              className={cn(theme === "dark" && "bg-accent text-accent-foreground")}
            >
              Dark
            </DropdownMenuItem>
            <DropdownMenuItem 
              onClick={() => setTheme("system")}
              className={cn(theme === "system" && "bg-accent text-accent-foreground")}
            >
              System
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
};

export default AppBar;