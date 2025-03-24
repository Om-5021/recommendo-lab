
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { BookOpen, GraduationCap, PlusCircle, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/components/ui/use-toast';
import { useSession } from '@/hooks/useSession';
import { supabase } from '@/lib/supabase';
import Navbar from '@/components/Navbar';
import { transformCourseData } from '@/utils/courseTransforms';
import { Course } from '@/types/database';

// Import mock data for fallback
import { mockCourses } from '@/lib/data';

const Dashboard = () => {
  const [enrolledCourses, setEnrolledCourses] = useState<Course[]>([]);
  const [loadingCourses, setLoadingCourses] = useState(true);
  const { userId, isLoading: loadingProfile } = useSession();
  const { toast } = useToast();

  useEffect(() => {
    if (!loadingProfile) {
      fetchCourses();
    }
  }, [userId, loadingProfile]);

  const fetchCourses = async () => {
    try {
      setLoadingCourses(true);

      if (!userId) {
        // Use mock data if user is not logged in
        const mockTransformedCourses = mockCourses.map(mockCourse => ({
          course_id: parseInt(mockCourse.id, 10),
          course_title: mockCourse.title,
          title: mockCourse.title,
          description: mockCourse.description,
          instructor: mockCourse.instructor,
          thumbnail: mockCourse.thumbnail,
          duration: mockCourse.duration,
          level: mockCourse.level,
          category: mockCourse.category,
          rating: mockCourse.rating,
          enrollments: mockCourse.enrollments,
          tags: mockCourse.tags,
          preview: mockCourse.preview,
          created_at: mockCourse.created_at,
          progress: 30 // Default progress for mock data
        }));

        setEnrolledCourses(mockTransformedCourses);
        setLoadingCourses(false);
        return;
      }

      // First get the user's course progress
      const { data: userCoursesData, error: userCoursesError } = await supabase
        .from('user_courses')
        .select('*')
        .eq('user_id', userId);

      if (userCoursesError) throw userCoursesError;

      // Get the course ids from user progress
      const courseIds = userCoursesData?.map(uc => uc.course_id) || [];

      if (courseIds.length === 0) {
        // If no courses found, use mock data for now
        const mockTransformedCourses = mockCourses.map(mockCourse => ({
          course_id: parseInt(mockCourse.id, 10),
          course_title: mockCourse.title,
          title: mockCourse.title,
          description: mockCourse.description, 
          instructor: mockCourse.instructor,
          thumbnail: mockCourse.thumbnail,
          duration: mockCourse.duration,
          level: mockCourse.level,
          category: mockCourse.category,
          rating: mockCourse.rating,
          enrollments: mockCourse.enrollments,
          tags: mockCourse.tags,
          preview: mockCourse.preview,
          created_at: mockCourse.created_at,
          progress: 30 // Default progress for mock data
        }));

        setEnrolledCourses(mockTransformedCourses);
        setLoadingCourses(false);
        return;
      }

      // Get the actual course data from Supabase
      const promises = courseIds.map(async (courseId) => {
        // Parse courseId to number for the Supabase query
        let parsedCourseId: number;
        
        if (typeof courseId === 'string' && /^\d+$/.test(courseId)) {
          parsedCourseId = parseInt(courseId, 10);
        } else if (typeof courseId === 'number') {
          parsedCourseId = courseId;
        } else {
          console.error('Invalid course ID format:', courseId);
          return null;
        }

        const { data, error } = await supabase
          .from('courses')
          .select('*')
          .eq('course_id', parsedCourseId)
          .maybeSingle();

        if (error) {
          console.error('Error fetching course:', error);
          return null;
        }

        if (!data) return null;

        // Get progress from user_courses
        const userCourse = userCoursesData?.find(uc => 
          uc.course_id === courseId ||
          uc.course_id === parsedCourseId.toString()
        );
        const progress = userCourse?.progress || 0;

        // Transform data to match our Course interface and add progress
        const transformedCourse = transformCourseData(data);
        return {
          ...transformedCourse,
          progress
        };
      });

      const courses = await Promise.all(promises);
      setEnrolledCourses(courses.filter(Boolean) as Course[]);
    } catch (error) {
      console.error('Error fetching enrolled courses:', error);
      toast({
        title: 'Error',
        description: 'Failed to load your courses',
        variant: 'destructive'
      });
    } finally {
      setLoadingCourses(false);
    }
  };

  if (loadingProfile) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background dark:bg-gray-900">
      <Navbar />
      <main className="container pt-24 pb-12 px-4 mx-auto">
        <div className="mb-8 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold dark:text-white">My Dashboard</h1>
            <p className="text-muted-foreground dark:text-gray-400">
              Track your progress and continue learning.
            </p>
          </div>
          <Button asChild variant="outline">
            <Link to="/courses" className="flex items-center">
              <PlusCircle className="mr-2 h-4 w-4" /> Browse Courses
            </Link>
          </Button>
        </div>

        {loadingCourses ? (
          <div className="flex justify-center items-center py-20">
            <Loader2 className="h-6 w-6 animate-spin text-primary mr-2" />
            <span className="text-lg dark:text-white">Loading your courses...</span>
          </div>
        ) : enrolledCourses.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {enrolledCourses.map((course) => (
              <Card key={course.id} className="glass-card dark:bg-gray-800 dark:border-gray-700">
                <CardHeader>
                  <CardTitle className="text-lg font-semibold line-clamp-1 dark:text-white">
                    {course.title}
                  </CardTitle>
                  <CardDescription className="text-muted-foreground dark:text-gray-400">
                    {course.description}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="mb-4">
                    <div className="flex items-center text-sm text-muted-foreground dark:text-gray-400">
                      <GraduationCap className="mr-2 h-4 w-4" />
                      <span>{course.level}</span>
                    </div>
                  </div>
                  <div className="mb-4">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground dark:text-gray-400">
                        Progress
                      </span>
                      <span className="font-medium dark:text-white">
                        {course.progress}%
                      </span>
                    </div>
                    <Progress value={course.progress || 0} className="h-2" />
                  </div>
                  <Button asChild variant="secondary" className="w-full dark:bg-gray-700 dark:text-white dark:hover:bg-gray-600">
                    <Link to={`/course/${course.id}`} className="flex items-center justify-center">
                      Continue Learning
                      <BookOpen className="ml-2 h-4 w-4" />
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="text-center py-20 dark:text-white">
            <h3 className="text-2xl font-semibold mb-2">No courses yet</h3>
            <p className="text-muted-foreground dark:text-gray-400">
              Start learning something new today!
            </p>
            <Button asChild variant="outline" className="mt-4 dark:bg-gray-800 dark:text-white dark:border-gray-700 dark:hover:bg-gray-700">
              <Link to="/courses">Browse Courses</Link>
            </Button>
          </div>
        )}
      </main>
    </div>
  );
};

export default Dashboard;
