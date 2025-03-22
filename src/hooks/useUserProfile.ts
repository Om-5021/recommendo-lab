
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/components/ui/use-toast';

interface Profile {
  id: string;
  avatar_url: string | null;
  full_name: string | null;
  created_at: string;
  updated_at: string;
}

export const useUserProfile = (userId?: string) => {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    const fetchProfile = async () => {
      if (!userId) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        
        // Fetch profile data from Supabase
        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', userId)
          .single();
        
        if (error) {
          throw error;
        }
        
        if (data) {
          setProfile(data as Profile);
        }
      } catch (error: any) {
        console.error('Error fetching user profile:', error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [userId]);

  const updateProfile = async (updates: Partial<Omit<Profile, 'id' | 'created_at' | 'updated_at'>>) => {
    if (!userId) return null;
    
    try {
      const { data, error } = await supabase
        .from('profiles')
        .update({
          ...updates,
          updated_at: new Date().toISOString(),
        })
        .eq('id', userId)
        .select('*')
        .single();
      
      if (error) {
        throw error;
      }
      
      if (data) {
        setProfile(data as Profile);
        toast({
          title: 'Profile updated',
          description: 'Your profile has been updated successfully.',
        });
      }
      
      return data;
    } catch (error: any) {
      console.error('Error updating profile:', error.message);
      toast({
        variant: 'destructive',
        title: 'Update failed',
        description: error.message,
      });
      return null;
    }
  };

  return { profile, loading, updateProfile };
};
