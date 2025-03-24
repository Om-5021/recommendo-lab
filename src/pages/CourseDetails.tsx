import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/components/ui/use-toast';
import Navbar from '@/components/Navbar';
import { supabase } from '@/lib/supabase';
import { Course, CourseVideo } from '@/types/database';
import { useUserProgress } from '@/contexts/UserProgressContext';

// Imported components
import CourseHero from '@/components/course-details/CourseHero';
import CourseOverview from '@/components/course-details/CourseOverview';
import CourseReviews from '@/components/course-details/CourseReviews';
import CourseInstructor from '@/components/course-details/CourseInstructor';
import CourseSidebar from '@/components/course-details/CourseSidebar';
import CourseVideos from '@/components/CourseVideos';

const CourseDetails = () => {
  const { courseId } = useParams<{ courseId: string }>();
  const [course, setCourse] = useState<Course | null>(null);
  const [similarCourses, setSimilarCourses] = useState<Course[]>([]);
  const [loadingCourse, setLoadingCourse] = useState(true);
  const [loadingSimilar, setLoadingSimilar] = useState(true);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [selectedVideo, setSelectedVideo] = useState<CourseVideo | null>(null);
  const [totalVideos, setTotalVideos] = useState(1);
  const { toast } = useToast();
  const { session, userCourses, updateCourseProgress } = useUserProgress();

  // Get user course progress
  const userCourse = userCourses.find(uc => uc.course_id === courseId);
  const courseProgress = userCourse?.progress || 0;

  // Fetch course details
  useEffect(() => {
    const fetchCourse = async () => {
      if (!courseId) return;
      
      try {
        setLoadingCourse(true);
        
        // Check if the courseId is numeric (from database) or a UUID (from UI)
        const isNumeric = /^\d+$/.test(courseId);
        
        let query;
        if (isNumeric) {
          // If numeric, search by course_id
          query = supabase
            .from('courses')
            .select('*')
            .eq('course_id', parseInt(courseId, 10))
            .maybeSingle();
        } else {
          // If UUID, search by id
          query = supabase
            .from('courses')
            .select('*')
            .eq('id', courseId)
            .maybeSingle();
        }
        
        const { data, error } = await query;
          
        if (error) {
          throw error;
        }
        
        if (data) {
          // Transform data for consistency
          const transformedCourse: Course = {
            id: data.id || data.course_id?.toString(),
            course_id: data.course_id,
            title: data.title || data.course_title,
            course_title: data.course_title,
            description: data.description || data.subject || 'No description available',
            instructor: data.instructor || 'Instructor',
            thumbnail: data.thumbnail || data.url || 'https://via.placeholder.com/640x360?text=Course+Image',
            duration: data.duration || `${Math.round((data.content_duration || 0) / 60)} hours`,
            level: data.level || 'Beginner',
            category: data.category || data.subject || 'General',
            rating: data.rating || 4.5,
            enrollments: data.enrollments || data.num_subscribers || 0,
            tags: data.tags || [data.subject || 'General'],
            created_at: data.created_at || data.published_timestamp || new Date().toISOString(),
            ...data
          };
          
          setCourse(transformedCourse);
        } else {
          setCourse(null);
        }
      } catch (error) {
        console.error('Error fetching course:', error);
        toast({
          title: 'Error',
          description: 'Failed to load course details. Please try again later.',
          variant: 'destructive'
        });
      } finally {
        setLoadingCourse(false);
      }
    };
    
    fetchCourse();
  }, [courseId, toast]);
  
  // Fetch course videos to count them
  useEffect(() => {
    const fetchVideos = async () => {
      if (!courseId) return;
      
      try {
        const { data, error, count } = await supabase
          .from('course_videos')
          .select('*', { count: 'exact' })
          .eq('course_id', courseId);
          
        if (error) {
          throw error;
        }
        
        if (count) {
          setTotalVideos(count);
        }
      } catch (error) {
        console.error('Error fetching videos count:', error);
      }
    };
    
    fetchVideos();
  }, [courseId]);
  
  // Fetch similar courses
  useEffect(() => {
    const fetchSimilarCourses = async () => {
      if (!course) return;
      
      try {
        setLoadingSimilar(true);
        const { data, error } = await supabase
          .from('courses')
          .select('*')
          .eq('category', course.category)
          .neq('id', course.id)
          .limit(2);
          
        if (error) {
          throw error;
        }
        
        if (data) {
          setSimilarCourses(data as Course[]);
        }
      } catch (error) {
        console.error('Error fetching similar courses:', error);
      } finally {
        setLoadingSimilar(false);
      }
    };
    
    if (course) {
      fetchSimilarCourses();
    }
  }, [course]);
  
  // Smooth load animation
  useEffect(() => {
    document.body.classList.add('page-transition');
    return () => {
      document.body.classList.remove('page-transition');
    };
  }, []);
  
  const handleSelectVideo = (video: CourseVideo) => {
    setSelectedVideo(video);
    
    // Create/update user course entry when starting a video
    if (session.userId && !userCourse) {
      updateCourseProgress(courseId!, 1, video.id);
    }
  };

  const handleVideoEnded = () => {
    // Update progress when video ends
    if (session.userId) {
      const newProgress = userCourse ? Math.min(userCourse.progress + Math.floor(100 / totalVideos), 100) : Math.floor(100 / totalVideos);
      const isComplete = newProgress >= 100;
      
      updateCourseProgress(courseId!, newProgress, selectedVideo?.id, isComplete);
    }
  };

  // If loading
  if (loadingCourse) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="container px-4 mx-auto pt-32 text-center">
          <Loader2 className="h-10 w-10 animate-spin text-primary mx-auto mb-4" />
          <h1 className="text-2xl font-bold mb-2">Loading Course</h1>
          <p className="text-muted-foreground">Please wait while we load the course details</p>
        </div>
      </div>
    );
  }

  // If course is not found
  if (!course) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="container px-4 mx-auto pt-32 text-center">
          <h1 className="text-3xl font-bold mb-4">Course Not Found</h1>
          <p className="text-muted-foreground mb-8">The course you're looking for doesn't exist or has been removed.</p>
          <Button asChild>
            <Link to="/">Return to Home</Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <main className="pt-20">
        {/* Hero Section */}
        <CourseHero 
          course={course}
          selectedVideo={selectedVideo}
          userCourse={userCourse}
          courseProgress={courseProgress}
          onSelectVideo={setSelectedVideo}
          imageLoaded={imageLoaded}
          setImageLoaded={setImageLoaded}
        />
        
        {/* Course Content */}
        <div className="container px-4 mx-auto py-12">
          <Tabs defaultValue="curriculum" className="space-y-8">
            <div className="sticky top-16 z-20 bg-background/80 backdrop-blur-sm py-2">
              <TabsList className="w-full justify-start bg-transparent border-b rounded-none h-auto p-0 space-x-8">
                <TabsTrigger 
                  value="overview" 
                  className="data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:shadow-none rounded-none bg-transparent h-10 px-2"
                >
                  Overview
                </TabsTrigger>
                <TabsTrigger 
                  value="curriculum" 
                  className="data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:shadow-none rounded-none bg-transparent h-10 px-2"
                >
                  Curriculum
                </TabsTrigger>
                <TabsTrigger 
                  value="reviews" 
                  className="data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:shadow-none rounded-none bg-transparent h-10 px-2"
                >
                  Reviews
                </TabsTrigger>
                <TabsTrigger 
                  value="instructor" 
                  className="data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:shadow-none rounded-none bg-transparent h-10 px-2"
                >
                  Instructor
                </TabsTrigger>
              </TabsList>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2 animate-fade-up" style={{ animationDelay: "0.2s" }}>
                <TabsContent value="overview" className="m-0">
                  <CourseOverview course={course} />
                </TabsContent>
                
                <TabsContent value="curriculum" className="m-0">
                  <CourseVideos 
                    courseId={course?.id || ''} 
                    onSelectVideo={handleSelectVideo}
                  />
                </TabsContent>
                
                <TabsContent value="reviews" className="m-0">
                  <CourseReviews course={course} />
                </TabsContent>
                
                <TabsContent value="instructor" className="m-0">
                  <CourseInstructor course={course} />
                </TabsContent>
              </div>
              
              {/* Sidebar */}
              <div className="animate-fade-up" style={{ animationDelay: "0.3s" }}>
                <CourseSidebar 
                  course={course}
                  courseProgress={courseProgress}
                  userCourse={userCourse}
                  selectedVideo={selectedVideo}
                  handleSelectVideo={setSelectedVideo}
                  updateCourseProgress={updateCourseProgress}
                  session={session}
                  similarCourses={similarCourses}
                  loadingSimilar={loadingSimilar}
                  courseId={courseId || ''}
                />
              </div>
            </div>
          </Tabs>
        </div>
      </main>
    </div>
  );
};

export default CourseDetails;
