
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { LearningPath, Course, LearningPathStep } from '@/types/database';

export const useLearningPathData = (userId?: string) => {
  const [userLearningPaths, setUserLearningPaths] = useState<(LearningPath & { progress: number })[]>([]);
  const [activeLearningPathDetails, setActiveLearningPathDetails] = useState<{
    pathDetails: LearningPath | null;
    courses: (Course & { step_order: number })[];
  }>({ pathDetails: null, courses: [] });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch user learning paths
  useEffect(() => {
    const fetchUserLearningPaths = async () => {
      if (!userId) {
        setLoading(false);
        return;
      }
      
      try {
        setLoading(true);
        
        // Get user's learning paths
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
      } catch (err) {
        console.error('Error fetching learning paths:', err);
        setError('Failed to load learning paths');
      } finally {
        setLoading(false);
      }
    };
    
    fetchUserLearningPaths();
  }, [userId]);

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
    } finally {
      setLoading(false);
    }
  };

  return {
    userLearningPaths,
    activeLearningPathDetails,
    loading,
    error,
    fetchLearningPathDetails
  };
};

