
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { LearningPath, Course, LearningPathStep } from '@/types/database';
import { useToast } from '@/components/ui/use-toast';

export const useLearningPathData = (userId?: string, levelFilter?: 'Beginner' | 'Intermediate' | 'Advanced') => {
  const [userLearningPaths, setUserLearningPaths] = useState<(LearningPath & { progress: number })[]>([]);
  const [recommendedLearningPaths, setRecommendedLearningPaths] = useState<LearningPath[]>([]);
  const [activeLearningPathDetails, setActiveLearningPathDetails] = useState<{
    pathDetails: LearningPath | null;
    courses: (Course & { step_order: number })[];
  }>({ pathDetails: null, courses: [] });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  // Fetch user learning paths
  useEffect(() => {
    const fetchUserLearningPaths = async () => {
      try {
        setLoading(true);
        
        // Get user's learning paths if user is logged in
        if (userId) {
          const { data: userPathsData, error: userPathsError } = await supabase
            .from('user_learning_paths')
            .select('learning_path_id, progress')
            .eq('user_id', userId);
            
          if (userPathsError) throw userPathsError;
          
          if (userPathsData && userPathsData.length > 0) {
            const pathIds = userPathsData.map(up => up.learning_path_id);
            
            // Get learning path details
            const { data: pathsData, error: pathsError } = await supabase
              .from('learning_paths')
              .select('*')
              .in('id', pathIds);
              
            if (pathsError) throw pathsError;
            
            if (pathsData) {
              // Combine path details with progress
              const pathsWithProgress = pathsData.map(path => {
                const userPath = userPathsData.find(up => up.learning_path_id === path.id);
                return {
                  ...path,
                  progress: userPath ? userPath.progress : 0
                };
              });
              
              setUserLearningPaths(pathsWithProgress);
              
              // If we have paths, get details for the first one
              if (pathsWithProgress.length > 0) {
                await fetchLearningPathDetails(pathsWithProgress[0].id);
              }
            }
          }
        }
        
        // Fetch recommended learning paths based on level filter
        await fetchRecommendedLearningPaths(levelFilter);
        
      } catch (err) {
        console.error('Error fetching learning paths:', err);
        setError('Failed to load learning paths');
        toast({
          variant: 'destructive',
          title: 'Error loading learning paths',
          description: 'Please try again later',
        });
      } finally {
        setLoading(false);
      }
    };
    
    fetchUserLearningPaths();
  }, [userId, levelFilter, toast]);

  // Fetch recommended learning paths based on level
  const fetchRecommendedLearningPaths = async (level?: 'Beginner' | 'Intermediate' | 'Advanced') => {
    try {
      let query = supabase.from('learning_path_steps')
        .select('learning_path_id, course:course_id(level)');
        
      if (level) {
        query = query.eq('course.level', level);
      }
      
      const { data: stepsData, error: stepsError } = await query;
      
      if (stepsError) throw stepsError;
      
      if (stepsData && stepsData.length > 0) {
        // Get unique learning path IDs
        const pathIds = [...new Set(stepsData.map(step => step.learning_path_id))];
        
        const { data: pathsData, error: pathsError } = await supabase
          .from('learning_paths')
          .select('*')
          .in('id', pathIds)
          .limit(5);
          
        if (pathsError) throw pathsError;
        
        if (pathsData) {
          setRecommendedLearningPaths(pathsData);
        }
      }
    } catch (err) {
      console.error('Error fetching recommended learning paths:', err);
    }
  };

  // Fetch details for a specific learning path
  const fetchLearningPathDetails = async (pathId: string) => {
    try {
      setLoading(true);
      
      // Get the learning path details
      const { data: pathData, error: pathError } = await supabase
        .from('learning_paths')
        .select('*')
        .eq('id', pathId)
        .single();
        
      if (pathError) throw pathError;
      
      // Get the learning path steps with course information
      const { data: stepsData, error: stepsError } = await supabase
        .from('learning_path_steps')
        .select('*, course:course_id(*)')
        .eq('learning_path_id', pathId)
        .order('step_order', { ascending: true });
        
      if (stepsError) throw stepsError;
      
      if (pathData && stepsData) {
        // Transform data to required format and ensure level is a valid enum value
        const courses = stepsData.map(step => {
          // Extract the course data
          const courseData = step.course as any;
          
          // Validate the level property to ensure it's one of the allowed values
          let courseLevel: "Beginner" | "Intermediate" | "Advanced" = "Beginner";
          if (courseData.level === "Intermediate" || courseData.level === "Advanced") {
            courseLevel = courseData.level;
          }
          
          // Return properly typed course object with step_order
          return {
            ...courseData,
            level: courseLevel,
            step_order: step.step_order
          } as Course & { step_order: number };
        });
        
        setActiveLearningPathDetails({
          pathDetails: pathData,
          courses
        });
      }
    } catch (err) {
      console.error('Error fetching learning path details:', err);
      setError('Failed to load learning path details');
      toast({
        variant: 'destructive',
        title: 'Error loading path details',
        description: 'Please try again later',
      });
    } finally {
      setLoading(false);
    }
  };

  return {
    userLearningPaths,
    recommendedLearningPaths,
    activeLearningPathDetails,
    loading,
    error,
    fetchLearningPathDetails
  };
};
