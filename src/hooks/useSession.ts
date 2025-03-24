
import { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';

interface SessionContextType {
  userId: string | null;
  isLoading: boolean;
}

const initialState: SessionContextType = {
  userId: null,
  isLoading: true
};

export const useSession = () => {
  const [session, setSession] = useState<SessionContextType>(initialState);

  useEffect(() => {
    const fetchSession = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        setSession({
          userId: session?.user?.id || null,
          isLoading: false
        });
      } catch (error) {
        console.error('Error fetching session:', error);
        setSession({
          userId: null,
          isLoading: false
        });
      }
    };

    fetchSession();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession({
        userId: session?.user?.id || null,
        isLoading: false
      });
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  return session;
};

export default useSession;
