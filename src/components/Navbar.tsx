import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Menu, X, Search, User, Bell, ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { cn } from '@/lib/utils';
import ThemeToggle from '@/components/ThemeToggle';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuLabel, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';
import { useUser } from '@/contexts/UserContext';
import { useNotifications } from '@/hooks/useNotifications';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/components/ui/use-toast';

const Navbar = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const location = useLocation();
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

  const navLinks = [
    { name: 'Home', path: '/' },
    { name: 'Courses', path: '/courses' },
    { name: 'Dashboard', path: '/dashboard' }
  ];

  const toggleMobileMenu = () => setIsMobileMenuOpen(!isMobileMenuOpen);
  const closeMobileMenu = () => setIsMobileMenuOpen(false);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    
    try {
      setIsSearching(true);
      navigate(`/courses?search=${encodeURIComponent(searchQuery.trim())}`);
    } catch (error) {
      console.error('Search error:', error);
    } finally {
      setIsSearching(false);
    }
  };

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

          <nav className="hidden md:flex items-center space-x-8">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className={cn(
                  'font-medium transition-colors hover:text-primary dark:text-gray-200 dark:hover:text-primary',
                  location.pathname === link.path ? 'text-primary dark:text-primary' : 'text-foreground'
                )}
              >
                {link.name}
              </Link>
            ))}
          </nav>

          <div className="hidden md:flex items-center space-x-4">
            <form onSubmit={handleSearch} className="relative w-[240px]">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search courses..."
                className="pl-10 h-9 border-none bg-secondary dark:bg-gray-800 dark:text-gray-200"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                disabled={isSearching}
              />
            </form>
            
            <ThemeToggle />
            
            {user ? (
              <>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="relative">
                      <Bell className="h-5 w-5 text-muted-foreground" />
                      {unreadCount > 0 && (
                        <Badge 
                          className="absolute -top-1 -right-1 px-1.5 py-0.5 min-w-5 h-5 flex items-center justify-center text-xs" 
                          variant="destructive"
                        >
                          {unreadCount}
                        </Badge>
                      )}
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-80">
                    <DropdownMenuLabel className="flex justify-between items-center">
                      <span>Notifications</span>
                      {unreadCount > 0 && (
                        <Button variant="ghost" size="sm" onClick={markAllAsRead} className="text-xs h-7">
                          Mark all as read
                        </Button>
                      )}
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <div className="max-h-[300px] overflow-y-auto">
                      {notifications.length > 0 ? (
                        notifications.slice(0, 5).map((notification) => (
                          <DropdownMenuItem key={notification.id} className="flex flex-col items-start p-3">
                            <div className="flex justify-between w-full">
                              <span className="font-medium">{notification.title}</span>
                              {!notification.read && (
                                <Badge variant="outline" className="ml-2 bg-blue-50 text-blue-700">New</Badge>
                              )}
                            </div>
                            <span className="text-muted-foreground text-sm mt-1">{notification.message}</span>
                          </DropdownMenuItem>
                        ))
                      ) : (
                        <div className="p-4 text-center text-muted-foreground">
                          No notifications
                        </div>
                      )}
                    </div>
                  </DropdownMenuContent>
                </DropdownMenu>
                
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <div className="flex items-center gap-2 cursor-pointer">
                      <Avatar className="h-8 w-8 transition-transform hover:scale-105">
                        <AvatarImage src={profile?.avatar_url || undefined} alt={profile?.full_name || user.email} />
                        <AvatarFallback>{profile?.full_name?.[0] || user.email?.[0] || 'U'}</AvatarFallback>
                      </Avatar>
                      <ChevronDown className="h-4 w-4 text-muted-foreground" />
                    </div>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuLabel>
                      <div className="flex flex-col">
                        <span>{profile?.full_name || 'User'}</span>
                        <span className="text-xs text-muted-foreground">{user.email}</span>
                      </div>
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem asChild>
                      <Link to="/dashboard">Dashboard</Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link to="/courses">My Courses</Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link to="/learning-paths">Learning Paths</Link>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={handleLogout}>
                      Logout
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
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

      <div
        className={cn(
          'md:hidden fixed inset-x-0 bg-background/95 backdrop-blur-sm transition-all duration-300 ease-in-out dark:bg-gray-900/95',
          isMobileMenuOpen ? 'top-[72px] opacity-100' : 'top-[-100%] opacity-0'
        )}
      >
        <div className="container mx-auto px-4 py-6 space-y-6">
          <form onSubmit={handleSearch} className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search courses..."
              className="pl-10 w-full border-none bg-secondary dark:bg-gray-800 dark:text-gray-200"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              disabled={isSearching}
            />
          </form>
          <nav className="flex flex-col space-y-4">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                onClick={closeMobileMenu}
                className={cn(
                  'py-2 font-medium transition-colors dark:text-gray-200 dark:hover:text-primary',
                  location.pathname === link.path ? 'text-primary dark:text-primary' : 'text-foreground'
                )}
              >
                {link.name}
              </Link>
            ))}
          </nav>
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
    </header>
  );
};

export default Navbar;
