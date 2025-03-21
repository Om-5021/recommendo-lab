
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/components/ui/use-toast';

export interface UserCourse {
  id: string;
  user_id: string;
  course_id: string;
  progress: number;
  last_watched_video: string | null;
  started_at: string;
  updated_at: string;
  completed: boolean;
}

export const useUserCourseProgress = (userId?: string) => {
  const [userCourses, setUserCourses] = useState<UserCourse[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const { toast } = useToast();

  // Fetch user's course progress
  useEffect(() => {
    const fetchUserCourses = async () => {
      if (!userId) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const { data, error } = await supabase
          .from('user_courses')
          .select('*')
          .eq('user_id', userId);

        if (error) {
          throw error;
        }

        if (data) {
          setUserCourses(data as UserCourse[]);
        }
      } catch (error) {
        console.error('Error fetching user courses:', error);
        toast({
          title: 'Error',
          description: 'Failed to load your course progress',
          variant: 'destructive',
        });
      } finally {
        setLoading(false);
      }
    };

    fetchUserCourses();
  }, [userId, toast]);

  // Set up real-time subscription for progress updates
  useEffect(() => {
    if (!userId) return;

    const channel = supabase
      .channel('schema-db-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'user_courses',
          filter: `user_id=eq.${userId}`,
        },
        (payload) => {
          console.log('Realtime update:', payload);
          
          if (payload.eventType === 'INSERT') {
            setUserCourses(prev => [...prev, payload.new as UserCourse]);
          } else if (payload.eventType === 'UPDATE') {
            setUserCourses(prev => 
              prev.map(course => 
                course.id === payload.new.id ? payload.new as UserCourse : course
              )
            );
          } else if (payload.eventType === 'DELETE') {
            setUserCourses(prev => 
              prev.filter(course => course.id !== payload.old.id)
            );
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [userId]);

  // Update course progress
  const updateCourseProgress = async (
    courseId: string, 
    progress: number, 
    videoId?: string,
    completed: boolean = false
  ) => {
    if (!userId) return;

    try {
      // Check if user course entry exists
      const { data: existingCourse } = await supabase
        .from('user_courses')
        .select('*')
        .eq('user_id', userId)
        .eq('course_id', courseId)
        .maybeSingle();

      if (existingCourse) {
        // Update existing entry
        const { error } = await supabase
          .from('user_courses')
          .update({ 
            progress, 
            last_watched_video: videoId || existingCourse.last_watched_video,
            updated_at: new Date().toISOString(),
            completed: completed || existingCourse.completed
          })
          .eq('id', existingCourse.id);

        if (error) throw error;
      } else {
        // Create new entry
        const { error } = await supabase
          .from('user_courses')
          .insert({
            user_id: userId,
            course_id: courseId,
            progress,
            last_watched_video: videoId || null,
            completed
          });

        if (error) throw error;
      }

      toast({
        title: 'Progress saved',
        description: 'Your course progress has been updated',
      });
    } catch (error) {
      console.error('Error updating course progress:', error);
      toast({
        title: 'Error',
        description: 'Failed to update course progress',
        variant: 'destructive',
      });
    }
  };

  return {
    userCourses,
    loading,
    updateCourseProgress
  };
};
