
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/components/ui/use-toast';

interface UserProfile {
  id: string;
  full_name?: string;
  avatar_url?: string;
  email?: string;
  created_at?: string;
}

export const useUser = () => {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loadingProfile, setLoadingProfile] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        setLoadingProfile(true);
        
        // Get current session
        const { data: { session } } = await supabase.auth.getSession();
        
        if (!session?.user) {
          setProfile(null);
          setLoadingProfile(false);
          return;
        }
        
        // Fetch user profile
        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', session.user.id)
          .single();
          
        if (error) {
          console.error('Error fetching user profile:', error);
          return;
        }
        
        setProfile({
          id: session.user.id,
          full_name: data?.full_name,
          avatar_url: data?.avatar_url,
          email: session.user.email,
          created_at: data?.created_at
        });
        
      } catch (error) {
        console.error('Error in useUser hook:', error);
        toast({
          title: 'Error',
          description: 'Failed to load user profile',
          variant: 'destructive'
        });
      } finally {
        setLoadingProfile(false);
      }
    };
    
    fetchUserProfile();
    
    // Set up subscription for auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        fetchUserProfile();
      } else {
        setProfile(null);
      }
    });
    
    return () => {
      subscription.unsubscribe();
    };
  }, [toast]);
  
  return { profile, loadingProfile };
};
