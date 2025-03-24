
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { LearningPath, Course } from '@/types/database';
import { transformCourseData } from '@/utils/courseTransforms';

export const useHomeData = () => {
  const [recommendedCourses, setRecommendedCourses] = useState<Course[]>([]);
  const [popularCourses, setPopularCourses] = useState<Course[]>([]);
  const [relatedCourses, setRelatedCourses] = useState<Course[]>([]);
  const [learningPaths, setLearningPaths] = useState<LearningPath[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        // Fetch popular courses (based on num_subscribers)
        const { data: popularData, error: popularError } = await supabase
          .from('courses')
          .select('*')
          .order('num_subscribers', { ascending: false })
          .limit(4);
        
        if (popularError) throw popularError;
        
        if (popularData) {
          // Transform data to match our Course interface
          const transformedPopularCourses: Course[] = popularData.map(course => 
            transformCourseData(course)
          );
          
          setPopularCourses(transformedPopularCourses);
        }
        
        // Fetch recommended courses (based on ratings - we'll just use the same data for now)
        const { data: recommendedData, error: recommendedError } = await supabase
          .from('courses')
          .select('*')
          .limit(4);
        
        if (recommendedError) throw recommendedError;
        
        if (recommendedData) {
          // Transform data to match our Course interface
          const transformedRecommendedCourses: Course[] = recommendedData.map(course => 
            transformCourseData(course)
          );
          
          setRecommendedCourses(transformedRecommendedCourses);
          
          // Generate related courses (based on subject - use different courses)
          if (recommendedData.length > 0) {
            const mainSubject = recommendedData[0].subject;
            const { data: relatedData, error: relatedError } = await supabase
              .from('courses')
              .select('*')
              .neq('course_id', recommendedData[0].course_id)
              .eq('subject', mainSubject)
              .limit(4);
            
            if (relatedError) throw relatedError;
            
            if (relatedData) {
              // Transform data to match our Course interface
              const transformedRelatedCourses: Course[] = relatedData.map(course => 
                transformCourseData(course)
              );
              
              setRelatedCourses(transformedRelatedCourses);
            }
          }
        }
        
        // Fetch learning paths
        const { data: pathsData, error: pathsError } = await supabase
          .from('learning_paths')
          .select('*')
          .limit(3);
        
        if (pathsError) throw pathsError;
        if (pathsData) setLearningPaths(pathsData as LearningPath[]);
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  return {
    recommendedCourses,
    popularCourses,
    relatedCourses,
    learningPaths,
    isLoading
  };
};
