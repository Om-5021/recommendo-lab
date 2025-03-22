
import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  LogIn, 
  LogOut, 
  UserCircle,
  Loader2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/lib/supabase';

export const AuthNavItems = () => {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    const checkSession = async () => {
      try {
        setLoading(true);
        const { data } = await supabase.auth.getSession();
        setUser(data.session?.user || null);
      } catch (error) {
        console.error('Error checking session:', error);
      } finally {
        setLoading(false);
      }
    };

    checkSession();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setUser(session?.user || null);
        setLoading(false);
      }
    );

    return () => {
      subscription.unsubscribe();
    };
  }, []);

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

  if (loading) {
    return (
      <Button variant="ghost" size="sm" disabled>
        <Loader2 className="h-4 w-4 animate-spin" />
      </Button>
    );
  }

  if (user) {
    return (
      <>
        <li>
          <Link 
            to="/dashboard" 
            className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 hover:text-primary"
          >
            <UserCircle className="mr-2 h-4 w-4" />
            Dashboard
          </Link>
        </li>
        <li>
          <button
            onClick={handleLogout}
            className="flex w-full items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 hover:text-primary"
          >
            <LogOut className="mr-2 h-4 w-4" />
            Logout
          </button>
        </li>
      </>
    );
  }

  return (
    <li>
      <Link 
        to="/login" 
        className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 hover:text-primary"
      >
        <LogIn className="mr-2 h-4 w-4" />
        Login
      </Link>
    </li>
  );
};
