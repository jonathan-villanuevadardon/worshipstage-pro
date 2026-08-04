import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { cn } from '@/lib/utils';
import { LayoutDashboard, Users, Settings, Music, Calendar, ListMusic, Building2, KeyRound as UsersRound } from 'lucide-react';

export default function NavigationMenu({ isMobile = false, onItemClick }) {
  const { currentUser } = useAuth();
  const location = useLocation();

  const getMenuItems = () => {
    const role = currentUser?.role;
    const baseItems = [
      { label: 'Dashboard', path: '/dashboard', icon: LayoutDashboard }
    ];

    if (role === 'super_admin') {
      baseItems.push(
        { label: 'Organizations', path: '/organizations', icon: Building2 },
        { label: 'Users', path: '/users', icon: Users },
        { label: 'Grupos', path: '/teams', icon: UsersRound },
        { label: 'Services', path: '/services', icon: Calendar },
        { label: 'Songs', path: '/songs', icon: Music },
        { label: 'Repertoires', path: '/repertoires', icon: ListMusic }
      );
    } else if (role === 'church_admin' || role === 'pastor') {
      baseItems.push(
        { label: 'Users', path: '/users', icon: Users },
        { label: 'Grupos', path: '/teams', icon: UsersRound },
        { label: 'Services', path: '/services', icon: Calendar },
        { label: 'Songs', path: '/songs', icon: Music },
        { label: 'Repertoires', path: '/repertoires', icon: ListMusic }
      );
    } else if (role === 'worship_leader') {
      baseItems.push(
        { label: 'Grupos', path: '/teams', icon: UsersRound },
        { label: 'Services', path: '/services', icon: Calendar },
        { label: 'Songs', path: '/songs', icon: Music },
        { label: 'Repertoires', path: '/repertoires', icon: ListMusic }
      );
    } else if (role === 'volunteer' || role === 'musician') {
      baseItems.push(
        { label: 'My Schedule', path: '/schedule', icon: Calendar },
        { label: 'Repertoires', path: '/repertoires', icon: ListMusic }
      );
    }

    baseItems.push({ label: 'Settings', path: '/settings', icon: Settings });
    return baseItems;
  };

  const items = getMenuItems();

  return (
    <nav className={cn("flex gap-2", isMobile ? "flex-col" : "flex-row items-center")}>
      {items.map((item) => {
        const isActive = location.pathname.startsWith(item.path) && (item.path !== '/' || location.pathname === '/');
        const Icon = item.icon;
        
        return (
          <Link
            key={item.path}
            to={item.path}
            onClick={onItemClick}
            className={cn(
              "flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-200",
              isActive 
                ? "bg-primary/10 text-primary" 
                : "text-muted-foreground hover:bg-muted hover:text-foreground active:scale-[0.98]"
            )}
          >
            <Icon className="w-4 h-4" />
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}
