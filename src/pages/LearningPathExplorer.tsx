
import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import Navbar from '@/components/Navbar';
import DetailedLearningPath from '@/components/DetailedLearningPath';
import { Course, LearningPath } from '@/types/database';
import { supabase } from '@/lib/supabase';
import { transformCourseData, parseCourseId } from '@/utils/courseTransforms';
import { useToast } from '@/components/ui/use-toast';

// Updated RouteParams interface with index signature to satisfy the constraint
interface RouteParams {
  [key: string]: string | undefined;
  pathId?: string;
}

const LearningPathExplorer = () => {
  const { pathId } = useParams<RouteParams>();
  const [learningPath, setLearningPath] = useState<LearningPath | null>(null);
  const [pathCourses, setPathCourses] = useState<(Course & { step_order: number })[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [userProgress, setUserProgress] = useState<number>(0);
  const { toast } = useToast();

  useEffect(() => {
    const fetchPathData = async () => {
      setIsLoading(true);
      try {
        if (!pathId) {
          throw new Error('Path ID is required');
        }

        console.log('Fetching learning path data for path ID:', pathId);

        // Fetch learning path data
        const { data: pathData, error: pathError } = await supabase
          .from('learning_paths')
          .select('*')
          .eq('id', pathId)
          .single();

        if (pathError) {
          console.error('Error fetching learning path:', pathError);
          throw pathError;
        }
        
        setLearningPath(pathData);
        console.log('Learning path data fetched:', pathData);

        // Fetch path steps to get the courses in the correct order
        const { data: stepsData, error: stepsError } = await supabase
          .from('learning_path_steps')
          .select('*')
          .eq('learning_path_id', pathId)
          .order('step_order', { ascending: true });

        if (stepsError) {
          console.error('Error fetching learning path steps:', stepsError);
          throw stepsError;
        }

        console.log('Learning path steps fetched:', stepsData);

        // Set a random progress value for demonstration purposes (in a real app, this would come from user data)
        setUserProgress(Math.floor(Math.random() * 100));

        // Fetch all courses in the path
        const coursesPromises = stepsData.map(async (step) => {
          // Ensure course_id is properly parsed to a number
          const courseId = parseCourseId(step.course_id);
          
          if (courseId === null) {
            console.error('Invalid course ID in step:', step);
            return null;
          }

          console.log('Fetching course with ID:', courseId);

          const { data: courseData, error: courseError } = await supabase
            .from('courses')
            .select('*')
            .eq('course_id', courseId)
            .single();

          if (courseError) {
            console.error('Error fetching course:', courseError, 'for course ID:', courseId);
            return null;
          }

          console.log('Course data fetched:', courseData);

          // Transform course data and add step_order
          return {
            ...transformCourseData(courseData),
            step_order: step.step_order
          };
        });

        const courses = await Promise.all(coursesPromises);
        // Filter out null values and cast to the correct type
        const validCourses = courses.filter(Boolean) as (Course & { step_order: number })[];
        console.log('Processed courses:', validCourses);
        setPathCourses(validCourses);
      } catch (error) {
        console.error('Error fetching learning path details:', error);
        toast({
          variant: 'destructive',
          title: 'Error loading learning path',
          description: 'Could not load the learning path. Please try again later.',
        });
      } finally {
        setIsLoading(false);
      }
    };

    if (pathId) {
      fetchPathData();
    } else {
      setIsLoading(false);
    }
  }, [pathId, toast]);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="container mx-auto px-4 py-24">
        {isLoading ? (
          <div className="flex justify-center items-center min-h-[60vh]">
            <Loader2 className="h-10 w-10 animate-spin text-primary" />
          </div>
        ) : learningPath ? (
          <DetailedLearningPath 
            learningPath={learningPath} 
            courses={pathCourses} 
            userProgress={userProgress} 
          />
        ) : (
          <div className="text-center py-12">
            <h2 className="text-2xl font-bold mb-4">Learning Path Not Found</h2>
            <p className="text-muted-foreground">
              Sorry, we couldn't find the learning path you're looking for.
            </p>
          </div>
        )}
      </main>
    </div>
  );
};

export default LearningPathExplorer;
