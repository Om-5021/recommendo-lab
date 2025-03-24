
import React, { useEffect, useRef, useState } from 'react';
import { Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { supabase } from '@/integrations/supabase/client';
import { toast } from "sonner";
import LearningPathRoadmap from '@/components/LearningPathRoadmap';
import { Course } from '@/types/database';

const Hero = () => {
  const heroRef = useRef<HTMLDivElement>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [roadmapData, setRoadmapData] = useState(null);

  // Parallax effect on scroll
  useEffect(() => {
    const handleScroll = () => {
      if (!heroRef.current) return;
      const scrollY = window.scrollY;
      heroRef.current.style.transform = `translateY(${scrollY * 0.3}px)`;
      heroRef.current.style.opacity = `${1 - scrollY * 0.002}`;
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      toast.error("Please enter a course topic to search");
      return;
    }

    setIsLoading(true);
    setRoadmapData(null);

    try {
      // Search for courses that match the query in title or subject
      const { data: matchingCourses, error } = await supabase
        .from('courses')
        .select('*')
        .or(`course_title.ilike.%${searchQuery}%,subject.ilike.%${searchQuery}%`)
        .order('num_subscribers', { ascending: false })
        .limit(5);
      
      if (error) throw error;
      
      if (matchingCourses && matchingCourses.length > 0) {
        // Transform the courses to match our Course interface
        const transformedCourses: Course[] = matchingCourses.map(course => ({
          id: course.id || course.course_id?.toString(),
          course_id: course.course_id,
          title: course.course_title,
          course_title: course.course_title,
          description: course.subject || 'No description available',
          instructor: 'Instructor',
          thumbnail: course.url || 'https://via.placeholder.com/640x360?text=Course+Image',
          duration: `${Math.round((course.content_duration || 0) / 60)} hours`,
          level: course.level as 'Beginner' | 'Intermediate' | 'Advanced' || 'Beginner',
          category: course.subject || 'General',
          rating: 4.5, // Default rating
          enrollments: course.num_subscribers || 0,
          tags: [course.subject || 'General'],
          created_at: course.published_timestamp || new Date().toISOString(),
        }));
        
        // Find any learning paths that include these courses
        const courseIdsForQuery = transformedCourses.map(course => {
          // If course_id is a number, use it directly; otherwise convert string to number if possible
          if (typeof course.course_id === 'number') {
            return course.course_id;
          } else if (course.course_id && /^\d+$/.test(course.course_id)) {
            return parseInt(course.course_id, 10);
          }
          return course.id;
        }).filter(id => id !== undefined);
        
        if (courseIdsForQuery.length === 0) {
          createCustomPath(transformedCourses);
          return;
        }
        
        try {
          // Query for learning path steps that include these courses
          const { data: pathSteps, error: pathError } = await supabase
            .from('learning_path_steps')
            .select('learning_path_id')
            .in('course_id', courseIdsForQuery);
          
          if (pathError) throw pathError;
          
          if (pathSteps && pathSteps.length > 0) {
            // Get unique learning path IDs
            const pathIds = [...new Set(pathSteps.map(step => step.learning_path_id))];
            
            // Get the first matching learning path
            const { data: learningPath, error: lpError } = await supabase
              .from('learning_paths')
              .select('*')
              .in('id', pathIds)
              .limit(1)
              .maybeSingle();
            
            if (lpError && lpError.code !== 'PGRST116') throw lpError;
            
            if (learningPath) {
              // Get all courses in this learning path in order
              const { data: orderedCourses, error: stepsError } = await supabase
                .from('learning_path_steps')
                .select('*, course_id')
                .eq('learning_path_id', learningPath.id)
                .order('step_order', { ascending: true });
              
              if (stepsError) throw stepsError;
              
              if (orderedCourses && orderedCourses.length > 0) {
                // Now fetch each course directly, not through relationships
                const coursesList: Course[] = [];
                
                for (const step of orderedCourses) {
                  try {
                    // Handle both numeric and string IDs
                    let courseQuery;
                    if (typeof step.course_id === 'number') {
                      courseQuery = supabase
                        .from('courses')
                        .select('*')
                        .eq('course_id', step.course_id)
                        .maybeSingle();
                    } else if (step.course_id && /^\d+$/.test(step.course_id)) {
                      courseQuery = supabase
                        .from('courses')
                        .select('*')
                        .eq('course_id', parseInt(step.course_id, 10))
                        .maybeSingle();
                    } else {
                      courseQuery = supabase
                        .from('courses')
                        .select('*')
                        .eq('id', step.course_id)
                        .maybeSingle();
                    }
                    
                    const { data: courseData, error: courseError } = await courseQuery;
                    
                    if (!courseError && courseData) {
                      const transformedCourse: Course = {
                        id: courseData.id || courseData.course_id?.toString(),
                        course_id: courseData.course_id,
                        title: courseData.course_title,
                        course_title: courseData.course_title,
                        description: courseData.subject || 'No description available',
                        instructor: 'Instructor',
                        thumbnail: courseData.url || 'https://via.placeholder.com/640x360?text=Course+Image',
                        duration: `${Math.round((courseData.content_duration || 0) / 60)} hours`,
                        level: courseData.level as 'Beginner' | 'Intermediate' | 'Advanced' || 'Beginner',
                        category: courseData.subject || 'General',
                        rating: 4.5, // Default rating
                        enrollments: courseData.num_subscribers || 0,
                        tags: [courseData.subject || 'General'],
                        created_at: courseData.published_timestamp || new Date().toISOString(),
                      };
                      coursesList.push(transformedCourse);
                    }
                  } catch (courseError) {
                    console.error('Error fetching course:', courseError);
                  }
                }
                
                // Format the data for display
                const roadmap = {
                  pathName: learningPath.title,
                  pathDescription: learningPath.description,
                  pathId: learningPath.id,
                  courses: coursesList
                };
                
                setRoadmapData(roadmap);
                toast.success(`Found a learning path for "${searchQuery}"`);
              } else {
                // Fallback to creating a suggested path
                createCustomPath(transformedCourses);
              }
            } else {
              // If no existing learning path, create a suggested one based on courses
              createCustomPath(transformedCourses);
            }
          } else {
            // No existing paths, create a custom one
            createCustomPath(transformedCourses);
          }
        } catch (pathQueryError) {
          console.error('Error querying for learning paths:', pathQueryError);
          createCustomPath(transformedCourses);
        }
      } else {
        toast.error(`No courses found for "${searchQuery}"`);
      }
    } catch (error) {
      console.error('Error searching:', error);
      toast.error(`Error finding learning path: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };
  
  // Helper function to create a custom path
  const createCustomPath = (courses: Course[]) => {
    const roadmap = {
      pathName: `Custom path for "${searchQuery}"`,
      pathDescription: `A suggested learning path based on your search for "${searchQuery}"`,
      isCustom: true,
      courses: courses.sort((a, b) => a.level === 'Beginner' ? -1 : b.level === 'Beginner' ? 1 : 0)
    };
    
    setRoadmapData(roadmap);
    toast.success(`Created a custom path for "${searchQuery}"`);
  };

  return (
    <div className="relative overflow-hidden min-h-[90vh] flex items-center justify-center py-24">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-b from-blue-50 to-white dark:from-gray-900 dark:to-gray-950"></div>
      
      {/* Floating elements */}
      <div ref={heroRef} className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/4 left-1/5 w-64 h-64 rounded-full bg-blue-200/30 dark:bg-blue-500/10 blur-3xl animate-float"></div>
        <div className="absolute bottom-1/3 right-1/4 w-80 h-80 rounded-full bg-indigo-200/30 dark:bg-indigo-500/10 blur-3xl animate-float" style={{ animationDelay: '2s' }}></div>
        <div className="absolute top-1/2 right-1/5 w-72 h-72 rounded-full bg-sky-200/30 dark:bg-sky-500/10 blur-3xl animate-float" style={{ animationDelay: '4s' }}></div>
      </div>
      
      {/* Content */}
      <div className="container relative z-10 px-4 mx-auto">
        <div className="max-w-3xl mx-auto text-center">
          <div className="mb-6 inline-flex px-4 py-1.5 rounded-full bg-white/80 backdrop-blur-sm border border-blue-100 dark:bg-gray-800/60 dark:backdrop-blur-sm dark:border-gray-700 shadow-sm">
            <span className="text-sm font-medium text-primary dark:text-blue-400">AI-Powered Learning Recommendations</span>
          </div>
          
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-400 dark:to-indigo-400 bg-clip-text text-transparent animate-fade-up">
            Discover Your Perfect Learning Path
          </h1>
          
          <p className="text-lg md:text-xl text-muted-foreground dark:text-gray-300 mb-8 mx-auto max-w-2xl animate-fade-up" style={{ animationDelay: '0.2s' }}>
            Personalized course recommendations that adapt to your learning style, goals, and progress. Learn smarter, not harder.
          </p>
          
          <div className="relative max-w-md mx-auto animate-fade-up" style={{ animationDelay: '0.4s' }}>
            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
              <Search className="h-5 w-5 text-muted-foreground dark:text-gray-400" />
            </div>
            <Input 
              type="search" 
              placeholder="What do you want to learn today?" 
              className="w-full pl-10 py-6 bg-white/80 backdrop-blur-sm border-blue-100 rounded-lg shadow-md dark:bg-gray-800/60 dark:backdrop-blur-sm dark:border-gray-700 dark:text-gray-200 dark:placeholder:text-gray-400"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
            />
            <Button 
              className="absolute right-1.5 top-1/2 transform -translate-y-1/2 shadow-md dark:bg-blue-600 dark:hover:bg-blue-700 dark:text-white" 
              size="sm"
              onClick={handleSearch}
              disabled={isLoading}
            >
              {isLoading ? 'Searching...' : 'Explore'}
            </Button>
          </div>
          
          <div className="mt-10 flex flex-wrap justify-center gap-3 animate-fade-up" style={{ animationDelay: '0.6s' }}>
            <Button onClick={() => setSearchQuery('Machine Learning')} variant="outline" className="rounded-full bg-white/80 backdrop-blur-sm dark:bg-gray-800/60 dark:border-gray-700 dark:text-gray-200 dark:hover:bg-gray-700/80">Machine Learning</Button>
            <Button onClick={() => setSearchQuery('Web Development')} variant="outline" className="rounded-full bg-white/80 backdrop-blur-sm dark:bg-gray-800/60 dark:border-gray-700 dark:text-gray-200 dark:hover:bg-gray-700/80">Web Development</Button>
            <Button onClick={() => setSearchQuery('Data Science')} variant="outline" className="rounded-full bg-white/80 backdrop-blur-sm dark:bg-gray-800/60 dark:border-gray-700 dark:text-gray-200 dark:hover:bg-gray-700/80">Data Science</Button>
            <Button onClick={() => setSearchQuery('UX Design')} variant="outline" className="rounded-full bg-white/80 backdrop-blur-sm dark:bg-gray-800/60 dark:border-gray-700 dark:text-gray-200 dark:hover:bg-gray-700/80">UX Design</Button>
          </div>
        </div>
        
        {/* Roadmap Results */}
        {roadmapData && (
          <div className="mt-16 animate-fade-up">
            <LearningPathRoadmap roadmap={roadmapData} />
          </div>
        )}
      </div>
    </div>
  );
};

export default Hero;
