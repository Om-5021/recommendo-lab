import React, { useEffect, useRef, useState } from 'react';
import { Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { supabase } from '@/integrations/supabase/client';
import { toast } from "sonner";
import LearningPathRoadmap from '@/components/LearningPathRoadmap';
import { Course } from '@/types/database';
import { transformCourseData } from '@/utils/courseTransforms';

interface RawCourseData {
  content_duration: number | null;
  course_id: number;
  course_title: string;
  is_paid: boolean | null;
  level: string | null;
  num_lectures: number | null;
  num_reviews: number | null;
  num_subscribers: number | null;
  price: string | null;
  published_timestamp: string | null;
  subject: string | null;
  url: string | null;
}

const Hero = () => {
  const heroRef = useRef<HTMLDivElement>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [roadmapData, setRoadmapData] = useState<any>(null);

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
      const { data: matchingCourses, error } = await supabase
        .from('courses')
        .select('*')
        .or(`course_title.ilike.%${searchQuery}%,subject.ilike.%${searchQuery}%`)
        .order('num_subscribers', { ascending: false })
        .limit(5);
      
      if (error) throw error;
      
      if (matchingCourses && matchingCourses.length > 0) {
        const transformedCourses: Course[] = matchingCourses.map((course: RawCourseData) => 
          transformCourseData(course)
        );
        
        const courseIdsForQuery = transformedCourses.map(course => course.course_id).filter(Boolean);
        
        if (courseIdsForQuery.length === 0) {
          createCustomPath(transformedCourses);
          return;
        }
        
        const courseIdStrings = courseIdsForQuery.map(id => id.toString());
        
        const { data: pathSteps, error: pathError } = await supabase
          .from('learning_path_steps')
          .select('learning_path_id')
          .in('course_id', courseIdStrings);
          
        if (pathError) throw pathError;
        
        if (pathSteps && pathSteps.length > 0) {
          const pathIds = [...new Set(pathSteps.map(step => step.learning_path_id))];
          
          const { data: learningPath, error: lpError } = await supabase
            .from('learning_paths')
            .select('*')
            .in('id', pathIds)
            .limit(1)
            .maybeSingle();
            
          if (lpError && lpError.code !== 'PGRST116') throw lpError;
          
          if (learningPath) {
            const { data: orderedCourses, error: stepsError } = await supabase
              .from('learning_path_steps')
              .select('*, course_id')
              .eq('learning_path_id', learningPath.id)
              .order('step_order', { ascending: true });
              
            if (stepsError) throw stepsError;
            
            if (orderedCourses && orderedCourses.length > 0) {
              const coursesList: Course[] = [];
              
              for (const step of orderedCourses) {
                try {
                  const { data: courseData, error: courseError } = await supabase
                    .from('courses')
                    .select('*')
                    .eq('course_id', parseInt(step.course_id, 10))
                    .maybeSingle();
                    
                  if (!courseError && courseData) {
                    coursesList.push(transformCourseData(courseData));
                  }
                } catch (courseError) {
                  console.error('Error fetching course:', courseError);
                }
              }
              
              const roadmap = {
                pathName: learningPath.title,
                pathDescription: learningPath.description,
                pathId: learningPath.id,
                courses: coursesList
              };
              
              setRoadmapData(roadmap);
              toast.success(`Found a learning path for "${searchQuery}"`);
            } else {
              createCustomPath(transformedCourses);
            }
          } else {
            createCustomPath(transformedCourses);
          }
        } else {
          createCustomPath(transformedCourses);
        }
      } else {
        toast.error(`No courses found for "${searchQuery}"`);
      }
    } catch (error: any) {
      console.error('Error searching:', error);
      toast.error(`Error finding learning path: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

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
      <div className="absolute inset-0 bg-gradient-to-b from-blue-50 to-white dark:from-gray-900 dark:to-gray-950"></div>
      
      <div ref={heroRef} className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/4 left-1/5 w-64 h-64 rounded-full bg-blue-200/30 dark:bg-blue-500/10 blur-3xl animate-float"></div>
        <div className="absolute bottom-1/3 right-1/4 w-80 h-80 rounded-full bg-indigo-200/30 dark:bg-indigo-500/10 blur-3xl animate-float" style={{ animationDelay: '2s' }}></div>
        <div className="absolute top-1/2 right-1/5 w-72 h-72 rounded-full bg-sky-200/30 dark:bg-sky-500/10 blur-3xl animate-float" style={{ animationDelay: '4s' }}></div>
      </div>
      
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
