import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Loader2 } from 'lucide-react';

import { Course, CourseVideo } from '@/types/database';
import { useUserProgress } from '@/contexts/UserProgressContext';
import { useSession } from '@/contexts/SessionContext';
import { useToast } from '@/components/ui/use-toast';
import CourseVideos from '@/components/CourseVideos';
import CourseSidebar from '@/components/course-details/CourseSidebar';
import VideoPlayer from '@/components/VideoPlayer';
import { supabase } from '@/lib/supabase';
import { transformCourseData } from '@/utils/courseTransforms';

const CourseDetails = () => {
  const { courseId } = useParams<{ courseId: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { userId } = useSession();
  const { userCourses, updateCourseProgress } = useUserProgress();

  const [course, setCourse] = useState<Course | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedVideo, setSelectedVideo] = useState<CourseVideo | null>(null);
  const [courseProgress, setCourseProgress] = useState(0);
  const [userCourse, setUserCourse] = useState<any>(null);
  const [similarCourses, setSimilarCourses] = useState<Course[]>([]);
  const [loadingSimilar, setLoadingSimilar] = useState(true);

  useEffect(() => {
    if (courseId) {
      fetchCourse();
      fetchSimilarCourses();
    }
  }, [courseId]);

  useEffect(() => {
    if (courseId && userId) {
      const userCourseData = userCourses.find(uc => uc.course_id === courseId);
      setUserCourse(userCourseData);
      setCourseProgress(userCourseData ? userCourseData.progress : 0);
    }
  }, [courseId, userId, userCourses]);

  const fetchCourse = async () => {
    try {
      setLoading(true);
    
      // Convert courseId to number if it's a numeric string
      let queryValue: number;
      if (/^\d+$/.test(courseId)) {
        queryValue = parseInt(courseId, 10);
      } else {
        throw new Error('Invalid course ID format');
      }
    
      const { data, error } = await supabase
        .from('courses')
        .select('*')
        .eq('course_id', queryValue)
        .maybeSingle();
      
      if (error) {
        throw error;
      }
    
      if (data) {
        // Transform data to match our Course interface
        setCourse(transformCourseData(data));
      } else {
        navigate('/courses');
        toast({
          title: 'Course not found',
          description: 'The requested course could not be found',
          variant: 'destructive'
        });
      }
    } catch (error) {
      console.error('Error fetching course:', error);
      toast({
        title: 'Error',
        description: 'Failed to load course details',
        variant: 'destructive'
      });
      navigate('/courses');
    } finally {
      setLoading(false);
    }
  };

  const fetchSimilarCourses = async () => {
    try {
      setLoadingSimilar(true);
      const { data, error } = await supabase
        .from('courses')
        .select('*')
        .limit(4);

      if (error) {
        throw error;
      }

      setSimilarCourses(data as Course[]);
    } catch (error) {
      console.error('Error fetching similar courses:', error);
      toast({
        title: 'Error',
        description: 'Failed to load similar courses',
        variant: 'destructive'
      });
    } finally {
      setLoadingSimilar(false);
    }
  };

  const handleSelectVideo = (video: CourseVideo | null) => {
    setSelectedVideo(video);
  };

  if (loading || !courseId) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="container py-12">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <VideoPlayer videoUrl={selectedVideo?.video_url || course.url || ''} />
          <div className="mt-6">
            <h1 className="text-3xl font-bold">{course.title}</h1>
            <p className="text-muted-foreground mt-2">{course.description}</p>
          </div>
          <div className="mt-8">
            <CourseVideos courseId={courseId} onSelectVideo={handleSelectVideo} />
          </div>
        </div>
        <div className="lg:col-span-1">
          <CourseSidebar
            course={course}
            courseProgress={courseProgress}
            userCourse={userCourse}
            selectedVideo={selectedVideo}
            handleSelectVideo={handleSelectVideo}
            updateCourseProgress={updateCourseProgress}
            session={{ userId }}
            similarCourses={similarCourses}
            loadingSimilar={loadingSimilar}
            courseId={courseId}
          />
        </div>
      </div>
    </div>
  );
};

export default CourseDetails;
