
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { LearningPath, Course } from '@/types/database';

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
        // Fetch popular courses (based on enrollments)
        const { data: popularData, error: popularError } = await supabase
          .from('courses')
          .select('*')
          .order('enrollments', { ascending: false })
          .limit(4);
        
        if (popularError) throw popularError;
        if (popularData) setPopularCourses(popularData as Course[]);
        
        // Fetch recommended courses (based on rating)
        const { data: recommendedData, error: recommendedError } = await supabase
          .from('courses')
          .select('*')
          .order('rating', { ascending: false })
          .limit(4);
        
        if (recommendedError) throw recommendedError;
        if (recommendedData) {
          setRecommendedCourses(recommendedData as Course[]);
          
          // Generate related courses based on the first recommended course's category and tags
          if (recommendedData.length > 0) {
            const mainCourse = recommendedData[0];
            const { data: relatedData, error: relatedError } = await supabase
              .from('courses')
              .select('*')
              .neq('id', mainCourse.id)
              .or(`category.eq.${mainCourse.category},tags.cs.{${mainCourse.tags.join(',')}}`)
              .limit(4);
            
            if (relatedError) throw relatedError;
            if (relatedData) setRelatedCourses(relatedData as Course[]);
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
