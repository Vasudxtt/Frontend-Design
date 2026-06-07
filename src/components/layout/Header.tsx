import React from 'react';
import { Bell, ChevronDown } from 'lucide-react';
import { Logo } from '../ui/Logo';
import { useAuthStore } from '../../store/authStore';

interface BreadcrumbItem {
  label: string;
  href?: string;
}

interface HeaderProps {
  breadcrumbs?: BreadcrumbItem[];
  actions?: React.ReactNode;
  showLogo?: boolean;
}

export function Header({ breadcrumbs, actions, showLogo = true }: HeaderProps) {
  const { user } = useAuthStore();

  return (
    <header className="h-16 bg-white border-b border-gray-200 flex items-center px-6 gap-4 sticky top-0 z-20">
      {showLogo && (
        <div className="mr-4">
          <Logo size="sm" />
        </div>
      )}

      {breadcrumbs && breadcrumbs.length > 0 && (
        <nav className="flex items-center gap-2 text-sm text-gray-500 flex-1">
          {breadcrumbs.map((b, i) => (
            <React.Fragment key={i}>
              {i > 0 && <span>/</span>}
              <span className={i === breadcrumbs.length - 1 ? 'text-gray-900 font-medium' : ''}>
                {b.label}
              </span>
            </React.Fragment>
          ))}
        </nav>
      )}

      <div className="ml-auto flex items-center gap-3">
        {actions}
        <button className="relative w-9 h-9 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors">
          <Bell size={18} className="text-gray-600" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full" />
        </button>
        <div className="flex items-center gap-2 cursor-pointer hover:bg-gray-50 rounded-lg px-2 py-1">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center text-white text-xs font-bold overflow-hidden">
            {user?.avatar ? (
              <img src={user.avatar} alt={user.name} className="w-full h-full object-cover" />
            ) : (
              user?.name?.[0]?.toUpperCase() ?? 'A'
            )}
          </div>
          <div className="hidden sm:block text-right">
            <p className="text-sm font-medium text-gray-900 leading-tight">{user?.name ?? 'Admin'}</p>
            <p className="text-xs text-gray-500 capitalize">{user?.role ?? 'Admin'}</p>
          </div>
          <ChevronDown size={14} className="text-gray-400" />
        </div>
      </div>
    </header>
  );
}
