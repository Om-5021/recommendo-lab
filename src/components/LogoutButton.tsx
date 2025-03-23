
import { useState } from 'react';
import { LogOut, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/lib/supabase';
import { useNavigate } from 'react-router-dom';

const LogoutButton = () => {
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      setLoading(true);
      await supabase.auth.signOut();
      toast({
        title: 'Logged out',
        description: 'You have been successfully logged out',
      });
      navigate('/');
    } catch (error) {
      console.error('Error signing out:', error);
      toast({
        variant: 'destructive',
        title: 'Logout failed',
        description: 'An error occurred while logging out',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Button 
      variant="ghost" 
      onClick={handleLogout} 
      disabled={loading}
      className="dark:text-gray-200 dark:hover:bg-gray-800"
    >
      {loading ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          Logging out...
        </>
      ) : (
        <>
          <LogOut className="mr-2 h-4 w-4" />
          Logout
        </>
      )}
    </Button>
  );
};

export default LogoutButton;
