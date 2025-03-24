
import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Layers, BookOpen, ArrowRight, GraduationCap, Clock, Loader2 } from 'lucide-react';
import Navbar from '@/components/Navbar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from '@/components/ui/use-toast';
import { supabase } from '@/lib/supabase';
import { LearningPath, LearningPathStep, Course } from '@/types/database';
import CourseCard from '@/components/CourseCard';

const LearningPathExplorer = () => {
  const [learningPaths, setLearningPaths] = useState<LearningPath[]>([]);
  const [selectedPath, setSelectedPath] = useState<LearningPath | null>(null);
  const [pathCourses, setPathCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [courseLoading, setCourseLoading] = useState(false);

  // Fetch all learning paths
  useEffect(() => {
    const fetchLearningPaths = async () => {
      try {
        setLoading(true);
        const { data, error } = await supabase
          .from('learning_paths')
          .select('*')
          .order('title');
          
        if (error) throw error;
        if (data) {
          setLearningPaths(data as LearningPath[]);
          if (data.length > 0) {
            setSelectedPath(data[0] as LearningPath);
          }
        }
      } catch (error) {
        console.error('Error fetching learning paths:', error);
        toast({
          title: 'Error',
          description: 'Failed to load learning paths. Please try again later.',
          variant: 'destructive'
        });
      } finally {
        setLoading(false);
      }
    };
    
    fetchLearningPaths();
  }, []);

  // Fetch courses for selected learning path
  useEffect(() => {
    const fetchPathCourses = async () => {
      if (!selectedPath) return;
      
      try {
        setCourseLoading(true);
        const { data, error } = await supabase
          .from('learning_path_steps')
          .select(`
            step_order,
            course_id
          `)
          .eq('learning_path_id', selectedPath.id)
          .order('step_order');
          
        if (error) throw error;
        
        if (data && data.length > 0) {
          // Fetch each course individually
          const coursesList: (Course & { step_order: number })[] = [];
          
          for (const step of data) {
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
                // Transform the course data
                const transformedCourse: Course & { step_order: number } = {
                  id: courseData.id || courseData.course_id?.toString(),
                  course_id: courseData.course_id,
                  title: courseData.title || courseData.course_title,
                  course_title: courseData.course_title,
                  description: courseData.description || courseData.subject || 'No description available',
                  instructor: courseData.instructor || 'Instructor',
                  thumbnail: courseData.thumbnail || courseData.url || 'https://via.placeholder.com/640x360?text=Course+Image',
                  duration: courseData.duration || `${Math.round((courseData.content_duration || 0) / 60)} hours`,
                  level: courseData.level || 'Beginner',
                  category: courseData.category || courseData.subject || 'General',
                  rating: courseData.rating || 4.5,
                  enrollments: courseData.enrollments || courseData.num_subscribers || 0,
                  tags: courseData.tags || [courseData.subject || 'General'],
                  created_at: courseData.created_at || courseData.published_timestamp || new Date().toISOString(),
                  step_order: step.step_order
                };
                
                coursesList.push(transformedCourse);
              }
            } catch (courseError) {
              console.error(`Error fetching course ${step.course_id}:`, courseError);
            }
          }
          
          // Sort by step_order
          coursesList.sort((a, b) => a.step_order - b.step_order);
          setPathCourses(coursesList);
        } else {
          setPathCourses([]);
        }
      } catch (error) {
        console.error('Error fetching path courses:', error);
        toast({
          title: 'Error',
          description: 'Failed to load courses for this learning path.',
          variant: 'destructive'
        });
        setPathCourses([]);
      } finally {
        setCourseLoading(false);
      }
    };
    
    fetchPathCourses();
  }, [selectedPath]);

  const handlePathSelect = (path: LearningPath) => {
    setSelectedPath(path);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="container px-4 mx-auto pt-24 pb-20">
          <div className="flex justify-center items-center py-20">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <span className="ml-2 text-lg">Loading learning paths...</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <main className="container px-4 mx-auto pt-24 pb-20">
        <div className="mb-8">
          <Link to="/" className="inline-flex items-center text-sm text-muted-foreground mb-6 hover:text-primary transition-colors">
            <ArrowLeft className="mr-1 h-4 w-4" /> Back to Home
          </Link>
          
          <h1 className="text-3xl md:text-4xl font-bold mb-4">Learning Path Explorer</h1>
          <p className="text-muted-foreground text-lg max-w-3xl">
            Explore structured learning paths designed to help you achieve your educational goals.
          </p>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Sidebar with learning paths list */}
          <div className="lg:col-span-4 xl:col-span-3">
            <div className="bg-white rounded-xl shadow-sm border border-border/50 p-4 sticky top-24">
              <h2 className="text-lg font-semibold mb-4 flex items-center">
                <Layers className="mr-2 h-5 w-5 text-primary" />
                Available Learning Paths
              </h2>
              
              <div className="space-y-2">
                {learningPaths.map((path) => (
                  <Button
                    key={path.id}
                    variant={selectedPath?.id === path.id ? "default" : "outline"}
                    className="w-full justify-start h-auto py-3 px-4"
                    onClick={() => handlePathSelect(path)}
                  >
                    <div className="text-left">
                      <div className="font-medium">{path.title}</div>
                      <div className="text-xs text-muted-foreground line-clamp-1 mt-1">
                        {path.description.substring(0, 60)}...
                      </div>
                    </div>
                  </Button>
                ))}
              </div>
            </div>
          </div>
          
          {/* Main content */}
          <div className="lg:col-span-8 xl:col-span-9">
            {selectedPath && (
              <div className="space-y-8">
                <Card>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <Badge variant="outline" className="text-xs font-normal flex items-center gap-1 mb-2">
                        <GraduationCap className="h-3 w-3" /> 
                        Learning Path
                      </Badge>
                    </div>
                    <CardTitle className="text-2xl font-bold">{selectedPath.title}</CardTitle>
                    <CardDescription className="text-base">
                      {selectedPath.description}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center justify-between text-sm mb-4">
                      <div className="flex items-center">
                        <BookOpen className="h-4 w-4 mr-1 text-muted-foreground" />
                        <span>{pathCourses.length} Courses</span>
                      </div>
                      <div className="flex items-center">
                        <Clock className="h-4 w-4 mr-1 text-muted-foreground" />
                        <span>Created {new Date(selectedPath.created_at).toLocaleDateString()}</span>
                      </div>
                    </div>
                    
                    <Button variant="default" size="lg" className="w-full mt-2" asChild>
                      <Link to={`/learning-path/${selectedPath.id}`}>
                        Start Learning Path
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </Link>
                    </Button>
                  </CardContent>
                </Card>
                
                <div>
                  <h3 className="text-xl font-bold mb-4 flex items-center">
                    <BookOpen className="mr-2 h-5 w-5 text-primary" />
                    Courses in this Learning Path
                  </h3>
                  
                  {courseLoading ? (
                    <div className="space-y-6">
                      {[1, 2, 3].map((_, index) => (
                        <Card key={index}>
                          <CardContent className="p-6">
                            <div className="flex items-center">
                              <div className="mr-4 bg-muted rounded-md overflow-hidden">
                                <Skeleton className="h-24 w-24" />
                              </div>
                              <div className="flex-1 space-y-2">
                                <Skeleton className="h-4 w-24" />
                                <Skeleton className="h-6 w-3/4" />
                                <Skeleton className="h-4 w-1/2" />
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  ) : (
                    <div className="space-y-6">
                      {pathCourses.map((course, index) => (
                        <Card key={course.id} className="overflow-hidden animate-scale-in">
                          <div className="flex flex-col md:flex-row">
                            <div className="md:w-1/4 lg:w-1/5 aspect-video md:aspect-square relative">
                              <img 
                                src={course.thumbnail} 
                                alt={course.title}
                                className="object-cover w-full h-full"
                              />
                              <Badge className="absolute top-2 right-2 bg-black/70 text-white">
                                Step {course.step_order}
                              </Badge>
                            </div>
                            
                            <CardContent className="flex-1 p-6">
                              <div className="flex flex-col h-full justify-between">
                                <div>
                                  <div className="flex items-center gap-2 mb-2">
                                    <Badge variant="outline">{course.level}</Badge>
                                    <Badge variant="secondary">{course.category}</Badge>
                                    <div className="text-sm text-muted-foreground">{course.duration}</div>
                                  </div>
                                  
                                  <h4 className="text-xl font-semibold mb-2">{course.title}</h4>
                                  <p className="text-muted-foreground line-clamp-2">{course.description}</p>
                                  
                                  <div className="flex items-center mt-3 text-sm text-muted-foreground">
                                    <span className="mr-3">By {course.instructor}</span>
                                    <span className="mr-3">{course.rating.toFixed(1)} Rating</span>
                                    <span>{course.enrollments.toLocaleString()} Students</span>
                                  </div>
                                </div>
                                
                                <div className="mt-4">
                                  <Button variant="outline" asChild>
                                    <Link to={`/course/${course.id}`}>
                                      View Course Details
                                    </Link>
                                  </Button>
                                </div>
                              </div>
                            </CardContent>
                          </div>
                        </Card>
                      ))}
                    </div>
                  )}
                  
                  {pathCourses.length === 0 && !courseLoading && (
                    <div className="text-center py-12 bg-muted/20 rounded-lg border border-border/50">
                      <h4 className="text-lg font-medium mb-2">No courses found in this learning path</h4>
                      <p className="text-muted-foreground">This learning path doesn't have any courses yet.</p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default LearningPathExplorer;
