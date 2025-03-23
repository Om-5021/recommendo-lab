
import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Menu, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import ThemeToggle from '@/components/ThemeToggle';
import { useUser } from '@/contexts/UserContext';
import { useNotifications } from '@/hooks/useNotifications';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/components/ui/use-toast';

// Import our refactored components
import NavbarLinks from './navbar/NavbarLinks';
import NavbarSearch from './navbar/NavbarSearch';
import NavbarNotifications from './navbar/NavbarNotifications';
import NavbarUserMenu from './navbar/NavbarUserMenu';
import MobileMenu from './navbar/MobileMenu';

const Navbar = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user, profile } = useUser();
  const { unreadCount, notifications, markAllAsRead } = useNotifications(user?.id);
  
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const toggleMobileMenu = () => setIsMobileMenuOpen(!isMobileMenuOpen);
  const closeMobileMenu = () => setIsMobileMenuOpen(false);

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
      toast({
        title: 'Logged out',
        description: 'You have been successfully logged out',
      });
      navigate('/');
    } catch (error) {
      console.error('Error logging out:', error);
      toast({
        variant: 'destructive',
        title: 'Logout failed',
        description: 'An error occurred while logging out',
      });
    }
  };

  return (
    <header className={cn(
      'fixed top-0 left-0 right-0 z-50 transition-all-300',
      isScrolled 
        ? 'bg-background/90 backdrop-blur-md shadow-sm dark:bg-gray-900/90' 
        : 'bg-transparent dark:bg-transparent'
    )}>
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <span className="font-bold text-xl bg-gradient-to-r from-primary to-blue-600 bg-clip-text text-transparent">
              Recommendo
            </span>
          </Link>

          <NavbarLinks />

          <div className="hidden md:flex items-center space-x-4">
            <NavbarSearch />
            <ThemeToggle />
            
            {user ? (
              <>
                <NavbarNotifications 
                  unreadCount={unreadCount} 
                  notifications={notifications} 
                  markAllAsRead={markAllAsRead} 
                />
                <NavbarUserMenu user={user} profile={profile} />
              </>
            ) : (
              <Button asChild>
                <Link to="/login">Log In</Link>
              </Button>
            )}
          </div>

          <div className="md:hidden flex items-center gap-2">
            <ThemeToggle />
            <button
              onClick={toggleMobileMenu}
              className="text-foreground dark:text-gray-200"
              aria-label="Toggle menu"
            >
              {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </div>

      <MobileMenu 
        isMobileMenuOpen={isMobileMenuOpen}
        closeMobileMenu={closeMobileMenu}
        user={user}
        unreadCount={unreadCount}
        handleLogout={handleLogout}
      />
    </header>
  );
};

export default Navbar;
