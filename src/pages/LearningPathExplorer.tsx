import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/lib/supabase';
import { LearningPath } from '@/types/database';
import { transformCourseData } from '@/utils/courseTransforms';

const LearningPathExplorer = () => {
  const [paths, setPaths] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchPathsWithCourses();
  }, []);

  const fetchPathsWithCourses = async () => {
    setIsLoading(true);
    try {
      // Fetch learning paths
      const { data: pathsData, error: pathsError } = await supabase
        .from('learning_paths')
        .select('*');
        
      if (pathsError) throw pathsError;
      
      // For each path, fetch its steps and courses separately
      const pathsWithCourses = await Promise.all(
        (pathsData || []).map(async (path) => {
          // Fetch the steps for this path
          const { data: stepsData, error: stepsError } = await supabase
            .from('learning_path_steps')
            .select('*')
            .eq('learning_path_id', path.id)
            .order('step_order', { ascending: true });
          
          if (stepsError) {
            console.error('Error fetching path steps:', stepsError);
            return { ...path, steps: [] };
          }
          
          if (!stepsData || stepsData.length === 0) {
            return { ...path, steps: [] };
          }
          
          // Fetch each course separately
          const stepsWithCourses = await Promise.all(
            stepsData.map(async (step) => {
              // Handle numeric course IDs
              const parsedCourseId = typeof step.course_id === 'string' && /^\d+$/.test(step.course_id)
                ? parseInt(step.course_id, 10)
                : step.course_id;
              
              const { data: courseData, error: courseError } = await supabase
                .from('courses')
                .select('*')
                .eq('course_id', parsedCourseId)
                .maybeSingle();
              
              if (courseError || !courseData) {
                console.error('Error fetching course for step:', courseError);
                return { ...step, course: null };
              }
              
              // Transform to our Course type
              const transformedCourse = transformCourseData(courseData);
              
              return {
                ...step,
                course: transformedCourse,
                step_order: step.step_order // Ensure step_order is included
              };
            })
          );
          
          return {
            ...path,
            steps: stepsWithCourses
          };
        })
      );
      
      setPaths(pathsWithCourses);
    } catch (error) {
      console.error('Error fetching learning paths with courses:', error);
      toast({
        title: 'Error',
        description: 'Failed to load learning paths',
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container py-12">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Explore Learning Paths</h1>
        <Button asChild>
          <Link to="/create-learning-path" className="flex items-center">
            <Plus className="mr-2 h-4 w-4" />
            Create New Path
          </Link>
        </Button>
      </div>

      {isLoading ? (
        <div className="flex justify-center items-center py-8">
          <Loader2 className="h-6 w-6 animate-spin text-primary mr-2" />
          <span>Loading learning paths...</span>
        </div>
      ) : paths.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-muted-foreground">No learning paths found. Create one to get started!</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {paths.map((path) => (
            <Card key={path.id} className="bg-white dark:bg-gray-800 shadow-md rounded-lg overflow-hidden">
              <CardHeader>
                <CardTitle className="text-lg font-semibold line-clamp-1 dark:text-white">{path.title}</CardTitle>
                <CardDescription className="text-sm text-muted-foreground line-clamp-2 dark:text-gray-400">{path.description}</CardDescription>
              </CardHeader>
              <CardContent className="p-4">
                <h4 className="text-sm font-semibold mb-2 dark:text-gray-300">Courses:</h4>
                <ul className="space-y-2">
                  {path.steps.map((step, index) => (
                    <li key={step.id} className="flex items-center justify-between">
                      <div className="flex items-center">
                        <Badge className="mr-2">{index + 1}</Badge>
                        <Link to={`/course/${step.course?.id}`} className="hover:underline line-clamp-1 dark:text-white">
                          {step.course?.title}
                        </Link>
                      </div>
                      <span className="text-xs text-muted-foreground dark:text-gray-400">Step {step.step_order}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
              <CardFooter className="p-4">
                <Button asChild variant="outline">
                  <Link to={`/learning-path/${path.id}`} className="w-full text-center">
                    View Path
                  </Link>
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default LearningPathExplorer;
