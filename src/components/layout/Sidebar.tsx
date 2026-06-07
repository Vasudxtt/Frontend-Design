import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  ClipboardList,
  BookCheck,
  LogOut,
  Settings,
  Bell,
  Trophy,
  MessageSquare,
  Users,
  Building2,
  Globe,
  Trash2,
  Bookmark,
} from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import { cn } from '../../utils/cn';

const navItems = [
  { icon: LayoutDashboard, to: '/dashboard', label: 'Dashboard' },
  { icon: ClipboardList, to: '/tests', label: 'Test Creation' },
  { icon: BookCheck, to: '/tracking', label: 'Test Tracking' },
];

const bottomIcons = [
  { icon: Users, label: 'Users' },
  { icon: Building2, label: 'Institute' },
  { icon: Globe, label: 'Global' },
  { icon: Trash2, label: 'Trash' },
  { icon: Bookmark, label: 'Saved' },
  { icon: Trophy, label: 'Leaderboard' },
  { icon: MessageSquare, label: 'Messages' },
  { icon: Bell, label: 'Notifications' },
  { icon: Settings, label: 'Settings' },
];

export function Sidebar() {
  const { clearAuth } = useAuthStore();
  const navigate = useNavigate();

  const handleLogout = () => {
    clearAuth();
    navigate('/login');
  };

  return (
    <aside className="fixed left-0 top-0 h-screen w-16 bg-sidebar flex flex-col items-center py-4 z-30">
      {/* Logo mark */}
      <div className="mb-6">
        <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
          <rect width="32" height="32" rx="8" fill="url(#sidebarLogoGrad)" />
          <path
            d="M8 24 L12 12 L20 20 L24 8"
            stroke="white"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            fill="none"
          />
          <circle cx="24" cy="8" r="3" fill="white" opacity="0.9" />
          <circle cx="8" cy="24" r="2" fill="white" opacity="0.7" />
          <defs>
            <linearGradient id="sidebarLogoGrad" x1="0" y1="0" x2="32" y2="32">
              <stop offset="0%" stopColor="#6366F1" />
              <stop offset="100%" stopColor="#3B82F6" />
            </linearGradient>
          </defs>
        </svg>
      </div>

      {/* Primary Nav */}
      <nav className="flex flex-col items-center gap-1 flex-1">
        {navItems.map(({ icon: Icon, to, label }) => (
          <NavLink
            key={to}
            to={to}
            title={label}
            className={({ isActive }) =>
              cn(
                'w-10 h-10 flex items-center justify-center rounded-xl transition-all',
                isActive
                  ? 'bg-primary-600 text-white'
                  : 'text-gray-400 hover:bg-sidebar-hover hover:text-white'
              )
            }
          >
            <Icon size={18} />
          </NavLink>
        ))}

        <div className="my-3 w-8 border-t border-gray-700" />

        {bottomIcons.map(({ icon: Icon, label }) => (
          <button
            key={label}
            title={label}
            className="w-10 h-10 flex items-center justify-center rounded-xl text-gray-600 hover:bg-sidebar-hover hover:text-gray-400 transition-all"
          >
            <Icon size={16} />
          </button>
        ))}
      </nav>

      {/* Logout */}
      <button
        onClick={handleLogout}
        title="Logout"
        className="w-10 h-10 flex items-center justify-center rounded-xl text-gray-600 hover:bg-red-900 hover:text-red-400 transition-all mt-2"
      >
        <LogOut size={16} />
      </button>
    </aside>
  );
}
