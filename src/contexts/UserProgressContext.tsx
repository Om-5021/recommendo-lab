
import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useUserCourseProgress, UserCourse } from '@/hooks/useUserCourseProgress';

interface UserSession {
  userId: string | null;
  isLoading: boolean;
}

interface UserProgressContextProps {
  session: UserSession;
  userCourses: UserCourse[];
  isLoading: boolean;
  updateCourseProgress: (courseId: string, progress: number, videoId?: string, completed?: boolean) => Promise<void>;
}

const UserProgressContext = createContext<UserProgressContextProps | undefined>(undefined);

export const UserProgressProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [session, setSession] = useState<UserSession>({ userId: null, isLoading: true });
  
  // Get the current user session
  useEffect(() => {
    const fetchSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setSession({ 
        userId: session?.user?.id || null, 
        isLoading: false 
      });
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

  const { userCourses, loading, updateCourseProgress } = useUserCourseProgress(session.userId || undefined);

  return (
    <UserProgressContext.Provider 
      value={{ 
        session, 
        userCourses, 
        isLoading: session.isLoading || loading,
        updateCourseProgress 
      }}
    >
      {children}
    </UserProgressContext.Provider>
  );
};

export const useUserProgress = () => {
  const context = useContext(UserProgressContext);
  if (context === undefined) {
    throw new Error('useUserProgress must be used within a UserProgressProvider');
  }
  return context;
};
