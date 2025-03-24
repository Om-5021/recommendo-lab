
import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import Navbar from '@/components/Navbar';
import DetailedLearningPath from '@/components/DetailedLearningPath';
import { Course, LearningPath } from '@/types/database';
import { supabase } from '@/lib/supabase';
import { transformCourseData } from '@/utils/courseTransforms';

interface RouteParams {
  pathId?: string;
}

const LearningPathExplorer = () => {
  const { pathId } = useParams<RouteParams>();
  const [learningPath, setLearningPath] = useState<LearningPath | null>(null);
  const [pathCourses, setPathCourses] = useState<Course[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchPathData = async () => {
      setIsLoading(true);
      try {
        if (!pathId) {
          throw new Error('Path ID is required');
        }

        // Fetch learning path data
        const { data: pathData, error: pathError } = await supabase
          .from('learning_paths')
          .select('*')
          .eq('id', pathId)
          .single();

        if (pathError) throw pathError;
        setLearningPath(pathData);

        // Fetch path steps to get the courses in the correct order
        const { data: stepsData, error: stepsError } = await supabase
          .from('learning_path_steps')
          .select('*')
          .eq('learning_path_id', pathId)
          .order('step_order', { ascending: true });

        if (stepsError) throw stepsError;

        // Fetch all courses in the path
        const coursesPromises = stepsData.map(async (step) => {
          // Convert course_id to a number if it's a string number
          let courseId: number;
          
          if (typeof step.course_id === 'string' && /^\d+$/.test(step.course_id)) {
            courseId = parseInt(step.course_id, 10);
          } else if (typeof step.course_id === 'number') {
            courseId = step.course_id;
          } else {
            console.error('Invalid course ID format:', step.course_id);
            return null;
          }

          const { data: courseData, error: courseError } = await supabase
            .from('courses')
            .select('*')
            .eq('course_id', courseId)
            .single();

          if (courseError) {
            console.error('Error fetching course:', courseError);
            return null;
          }

          return transformCourseData(courseData);
        });

        const courses = await Promise.all(coursesPromises);
        setPathCourses(courses.filter(Boolean) as Course[]);
      } catch (error) {
        console.error('Error fetching learning path:', error);
      } finally {
        setIsLoading(false);
      }
    };

    if (pathId) {
      fetchPathData();
    } else {
      setIsLoading(false);
    }
  }, [pathId]);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="container mx-auto px-4 py-24">
        {isLoading ? (
          <div className="flex justify-center items-center min-h-[60vh]">
            <Loader2 className="h-10 w-10 animate-spin text-primary" />
          </div>
        ) : learningPath ? (
          <DetailedLearningPath path={learningPath} courses={pathCourses} />
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
