
import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ChevronDown } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuLabel, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/components/ui/use-toast';
import { User } from '@supabase/supabase-js';

interface NavbarUserMenuProps {
  user: User;
  profile: any;
}

const NavbarUserMenu = ({ user, profile }: NavbarUserMenuProps) => {
  const navigate = useNavigate();
  const { toast } = useToast();

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
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <div className="flex items-center gap-2 cursor-pointer">
          <Avatar className="h-8 w-8 transition-transform hover:scale-105">
            <AvatarImage src={profile?.avatar_url || undefined} alt={profile?.full_name || user.email} />
            <AvatarFallback className="bg-primary/10 dark:bg-primary/20 text-primary">
              {profile?.full_name?.[0] || user.email?.[0] || 'U'}
            </AvatarFallback>
          </Avatar>
          <ChevronDown className="h-4 w-4 text-muted-foreground dark:text-gray-400" />
        </div>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="dark:bg-gray-800 dark:border-gray-700">
        <DropdownMenuLabel className="dark:text-gray-200">
          <div className="flex flex-col">
            <span>{profile?.full_name || 'User'}</span>
            <span className="text-xs text-muted-foreground dark:text-gray-400">{user.email}</span>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator className="dark:bg-gray-700" />
        <DropdownMenuItem asChild className="dark:text-gray-200 dark:focus:bg-gray-700 dark:hover:bg-gray-700">
          <Link to="/dashboard">Dashboard</Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild className="dark:text-gray-200 dark:focus:bg-gray-700 dark:hover:bg-gray-700">
          <Link to="/courses">My Courses</Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild className="dark:text-gray-200 dark:focus:bg-gray-700 dark:hover:bg-gray-700">
          <Link to="/learning-paths">Learning Paths</Link>
        </DropdownMenuItem>
        <DropdownMenuSeparator className="dark:bg-gray-700" />
        <DropdownMenuItem 
          onClick={handleLogout}
          className="dark:text-gray-200 dark:focus:bg-gray-700 dark:hover:bg-gray-700"
        >
          Logout
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default NavbarUserMenu;
