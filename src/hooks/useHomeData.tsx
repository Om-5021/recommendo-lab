
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
        // Fetch popular courses (based on num_subscribers)
        const { data: popularData, error: popularError } = await supabase
          .from('courses')
          .select('*')
          .order('num_subscribers', { ascending: false })
          .limit(4);
        
        if (popularError) throw popularError;
        
        if (popularData) {
          // Transform data to match our Course interface
          const transformedPopularCourses: Course[] = popularData.map(course => ({
            id: String(course.course_id),
            course_id: course.course_id,
            title: course.course_title,
            course_title: course.course_title,
            description: course.subject || 'No description available',
            instructor: 'Instructor',
            thumbnail: course.url || 'https://via.placeholder.com/640x360?text=Course+Image',
            duration: `${Math.round((course.content_duration || 0) / 60)} hours`,
            level: course.level || 'Beginner',
            category: course.subject || 'General',
            rating: 4.5, 
            enrollments: course.num_subscribers || 0,
            tags: [course.subject || 'General'],
            created_at: course.published_timestamp || new Date().toISOString(),
            subject: course.subject,
            url: course.url,
            price: course.price,
            num_lectures: course.num_lectures,
            num_subscribers: course.num_subscribers,
            num_reviews: course.num_reviews,
            is_paid: course.is_paid,
            content_duration: course.content_duration,
            published_timestamp: course.published_timestamp
          }));
          
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
          const transformedRecommendedCourses: Course[] = recommendedData.map(course => ({
            id: String(course.course_id),
            course_id: course.course_id,
            title: course.course_title,
            course_title: course.course_title,
            description: course.subject || 'No description available',
            instructor: 'Instructor',
            thumbnail: course.url || 'https://via.placeholder.com/640x360?text=Course+Image',
            duration: `${Math.round((course.content_duration || 0) / 60)} hours`,
            level: course.level || 'Beginner',
            category: course.subject || 'General',
            rating: 4.5,
            enrollments: course.num_subscribers || 0,
            tags: [course.subject || 'General'],
            created_at: course.published_timestamp || new Date().toISOString(),
            subject: course.subject,
            url: course.url,
            price: course.price,
            num_lectures: course.num_lectures,
            num_subscribers: course.num_subscribers,
            num_reviews: course.num_reviews,
            is_paid: course.is_paid,
            content_duration: course.content_duration,
            published_timestamp: course.published_timestamp
          }));
          
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
              const transformedRelatedCourses: Course[] = relatedData.map(course => ({
                id: String(course.course_id),
                course_id: course.course_id,
                title: course.course_title,
                course_title: course.course_title,
                description: course.subject || 'No description available',
                instructor: 'Instructor',
                thumbnail: course.url || 'https://via.placeholder.com/640x360?text=Course+Image',
                duration: `${Math.round((course.content_duration || 0) / 60)} hours`,
                level: course.level || 'Beginner',
                category: course.subject || 'General',
                rating: 4.5,
                enrollments: course.num_subscribers || 0,
                tags: [course.subject || 'General'],
                created_at: course.published_timestamp || new Date().toISOString(),
                subject: course.subject,
                url: course.url,
                price: course.price,
                num_lectures: course.num_lectures,
                num_subscribers: course.num_subscribers,
                num_reviews: course.num_reviews,
                is_paid: course.is_paid,
                content_duration: course.content_duration,
                published_timestamp: course.published_timestamp
              }));
              
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
