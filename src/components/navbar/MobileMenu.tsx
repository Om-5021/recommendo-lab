
import React from 'react';
import { Link } from 'react-router-dom';
import { User, Bell } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import NavbarLinks from './NavbarLinks';
import NavbarSearch from './NavbarSearch';
import { User as SupabaseUser } from '@supabase/supabase-js';

interface MobileMenuProps {
  isMobileMenuOpen: boolean;
  closeMobileMenu: () => void;
  user: SupabaseUser | null;
  unreadCount: number;
  handleLogout: () => void;
}

const MobileMenu = ({
  isMobileMenuOpen,
  closeMobileMenu,
  user,
  unreadCount,
  handleLogout
}: MobileMenuProps) => {
  return (
    <div
      className={cn(
        'md:hidden fixed inset-x-0 bg-background/95 backdrop-blur-sm transition-all duration-300 ease-in-out dark:bg-gray-900/95',
        isMobileMenuOpen ? 'top-[72px] opacity-100' : 'top-[-100%] opacity-0'
      )}
    >
      <div className="container mx-auto px-4 py-6 space-y-6">
        <NavbarSearch isMobile={true} />
        <NavbarLinks isMobile={true} onClick={closeMobileMenu} />
        {user ? (
          <div className="pt-4 border-t border-border dark:border-gray-700 flex flex-col gap-3">
            <Link 
              to="/dashboard" 
              onClick={closeMobileMenu}
              className="flex items-center gap-2 py-2 font-medium dark:text-gray-200"
            >
              <User size={18} />
              <span>Dashboard</span>
            </Link>
            <div className="flex items-center justify-between">
              <Link
                to="/notifications"
                onClick={closeMobileMenu}
                className="flex items-center gap-2 py-2 font-medium dark:text-gray-200"
              >
                <Bell size={18} />
                <span>Notifications</span>
                {unreadCount > 0 && (
                  <Badge variant="destructive" className="ml-2">{unreadCount}</Badge>
                )}
              </Link>
            </div>
            <Button variant="outline" onClick={handleLogout} className="dark:border-gray-700 dark:text-gray-200">Logout</Button>
          </div>
        ) : (
          <div className="pt-4 border-t border-border dark:border-gray-700">
            <Button asChild className="w-full">
              <Link to="/login" onClick={closeMobileMenu}>Log In</Link>
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default MobileMenu;
