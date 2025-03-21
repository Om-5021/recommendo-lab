
import React, { useEffect, useRef, useState } from 'react';
import { Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { supabase } from '@/integrations/supabase/client';
import { toast } from "sonner";
import LearningPathRoadmap from '@/components/LearningPathRoadmap';

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
      // Search for courses that match the query in title, description, or tags
      const { data: matchingCourses, error } = await supabase
        .from('courses')
        .select('*')
        .or(`title.ilike.%${searchQuery}%,description.ilike.%${searchQuery}%,tags.cs.{${searchQuery}}`)
        .order('rating', { ascending: false })
        .limit(5);
      
      if (error) throw error;
      
      if (matchingCourses && matchingCourses.length > 0) {
        // Find any learning paths that include these courses
        const courseIds = matchingCourses.map(course => course.id);
        
        const { data: pathSteps, error: pathError } = await supabase
          .from('learning_path_steps')
          .select('learning_path_id')
          .in('course_id', courseIds);
        
        if (pathError) throw pathError;
        
        if (pathSteps && pathSteps.length > 0) {
          // Get unique learning path IDs
          const pathIds = [...new Set(pathSteps.map(step => step.learning_path_id))];
          
          // Get the first matching learning path with its courses
          const { data: learningPath, error: lpError } = await supabase
            .from('learning_paths')
            .select('*')
            .in('id', pathIds)
            .limit(1)
            .single();
          
          if (lpError && lpError.code !== 'PGRST116') throw lpError;
          
          if (learningPath) {
            // Get all courses in this learning path in order
            const { data: orderedCourses, error: stepsError } = await supabase
              .from('learning_path_steps')
              .select('*, course:courses(*)')
              .eq('learning_path_id', learningPath.id)
              .order('step_order', { ascending: true });
            
            if (stepsError) throw stepsError;
            
            // Format the data for display
            const roadmap = {
              pathName: learningPath.title,
              pathDescription: learningPath.description,
              pathId: learningPath.id,
              courses: orderedCourses.map(step => step.course)
            };
            
            setRoadmapData(roadmap);
            toast.success(`Found a learning path for "${searchQuery}"`);
          } else {
            // If no existing learning path, create a suggested one based on courses
            const roadmap = {
              pathName: `Custom path for "${searchQuery}"`,
              pathDescription: `A suggested learning path based on your search for "${searchQuery}"`,
              isCustom: true,
              courses: matchingCourses.sort((a, b) => a.level === 'Beginner' ? -1 : b.level === 'Beginner' ? 1 : 0)
            };
            
            setRoadmapData(roadmap);
            toast.success(`Created a custom path for "${searchQuery}"`);
          }
        } else {
          // No existing paths, create a custom one
          const roadmap = {
            pathName: `Custom path for "${searchQuery}"`,
            pathDescription: `A suggested learning path based on your search for "${searchQuery}"`,
            isCustom: true,
            courses: matchingCourses.sort((a, b) => a.level === 'Beginner' ? -1 : b.level === 'Beginner' ? 1 : 0)
          };
          
          setRoadmapData(roadmap);
          toast.success(`Created a custom path for "${searchQuery}"`);
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

  return (
    <div className="relative overflow-hidden min-h-[90vh] flex items-center justify-center py-24">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-b from-blue-50 to-white"></div>
      
      {/* Floating elements */}
      <div ref={heroRef} className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/4 left-1/5 w-64 h-64 rounded-full bg-blue-200/30 blur-3xl animate-float"></div>
        <div className="absolute bottom-1/3 right-1/4 w-80 h-80 rounded-full bg-indigo-200/30 blur-3xl animate-float" style={{ animationDelay: '2s' }}></div>
        <div className="absolute top-1/2 right-1/5 w-72 h-72 rounded-full bg-sky-200/30 blur-3xl animate-float" style={{ animationDelay: '4s' }}></div>
      </div>
      
      {/* Content */}
      <div className="container relative z-10 px-4 mx-auto">
        <div className="max-w-3xl mx-auto text-center">
          <div className="mb-6 inline-flex px-4 py-1.5 rounded-full bg-white/80 backdrop-blur-sm border border-blue-100 shadow-sm">
            <span className="text-sm font-medium text-primary">AI-Powered Learning Recommendations</span>
          </div>
          
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent animate-fade-up">
            Discover Your Perfect Learning Path
          </h1>
          
          <p className="text-lg md:text-xl text-muted-foreground mb-8 mx-auto max-w-2xl animate-fade-up" style={{ animationDelay: '0.2s' }}>
            Personalized course recommendations that adapt to your learning style, goals, and progress. Learn smarter, not harder.
          </p>
          
          <div className="relative max-w-md mx-auto animate-fade-up" style={{ animationDelay: '0.4s' }}>
            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
              <Search className="h-5 w-5 text-muted-foreground" />
            </div>
            <Input 
              type="search" 
              placeholder="What do you want to learn today?" 
              className="w-full pl-10 py-6 bg-white/80 backdrop-blur-sm border-blue-100 rounded-lg shadow-md"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
            />
            <Button 
              className="absolute right-1.5 top-1/2 transform -translate-y-1/2 shadow-md" 
              size="sm"
              onClick={handleSearch}
              disabled={isLoading}
            >
              {isLoading ? 'Searching...' : 'Explore'}
            </Button>
          </div>
          
          <div className="mt-10 flex flex-wrap justify-center gap-3 animate-fade-up" style={{ animationDelay: '0.6s' }}>
            <Button onClick={() => setSearchQuery('Machine Learning')} variant="outline" className="rounded-full bg-white/80 backdrop-blur-sm">Machine Learning</Button>
            <Button onClick={() => setSearchQuery('Web Development')} variant="outline" className="rounded-full bg-white/80 backdrop-blur-sm">Web Development</Button>
            <Button onClick={() => setSearchQuery('Data Science')} variant="outline" className="rounded-full bg-white/80 backdrop-blur-sm">Data Science</Button>
            <Button onClick={() => setSearchQuery('UX Design')} variant="outline" className="rounded-full bg-white/80 backdrop-blur-sm">UX Design</Button>
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
