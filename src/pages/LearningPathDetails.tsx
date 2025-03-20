
import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ChevronLeft, Book, Clock, Loader2, BookOpen } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { 
  Tabs, 
  TabsContent, 
  TabsList, 
  TabsTrigger 
} from '@/components/ui/tabs';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/components/ui/use-toast';
import Navbar from '@/components/Navbar';
import CourseCard from '@/components/CourseCard';
import { supabase } from '@/integrations/supabase/client';
import { LearningPath, LearningPathStep, Course } from '@/types/database';

const LearningPathDetailsPage = () => {
  const { pathId } = useParams<{ pathId: string }>();
  const [learningPath, setLearningPath] = useState<LearningPath | null>(null);
  const [pathSteps, setPathSteps] = useState<(LearningPathStep & { course: Course })[]>([]);
  const [loading, setLoading] = useState(true);
  const [enrolling, setEnrolling] = useState(false);
  const [enrolled, setEnrolled] = useState(false);
  const [progress, setProgress] = useState(0);
  const { toast } = useToast();

  useEffect(() => {
    const fetchLearningPathDetails = async () => {
      try {
        setLoading(true);
        
        // Fetch learning path details
        const { data: pathData, error: pathError } = await supabase
          .from('learning_paths')
          .select('*')
          .eq('id', pathId)
          .single();
          
        if (pathError) throw pathError;
        if (!pathData) throw new Error('Learning path not found');
        
        setLearningPath(pathData);
        
        // Fetch learning path steps with course details
        const { data: stepsData, error: stepsError } = await supabase
          .from('learning_path_steps')
          .select(`
            *,
            course:course_id(*)
          `)
          .eq('learning_path_id', pathId)
          .order('step_order', { ascending: true });
          
        if (stepsError) throw stepsError;
        
        // Type assertion to make TypeScript happy
        setPathSteps(stepsData as unknown as (LearningPathStep & { course: Course })[]);
        
        // Check if user is enrolled in this learning path
        // This is a simplified version - in a real app, you'd check against authenticated user
        const { data: enrollmentData, error: enrollmentError } = await supabase
          .from('user_learning_paths')
          .select('*')
          .eq('learning_path_id', pathId)
          .maybeSingle();
          
        if (!enrollmentError && enrollmentData) {
          setEnrolled(true);
          setProgress(enrollmentData.progress);
        }
        
      } catch (error) {
        console.error('Error fetching learning path details:', error);
        toast({
          title: 'Error',
          description: 'Failed to load learning path details. Please try again later.',
          variant: 'destructive'
        });
      } finally {
        setLoading(false);
      }
    };
    
    if (pathId) {
      fetchLearningPathDetails();
    }
  }, [pathId, toast]);

  const handleEnroll = async () => {
    try {
      setEnrolling(true);
      
      // In a real app, you'd use the authenticated user ID here
      const { error } = await supabase
        .from('user_learning_paths')
        .insert({
          learning_path_id: pathId,
          progress: 0
        });
        
      if (error) throw error;
      
      setEnrolled(true);
      setProgress(0);
      
      toast({
        title: 'Success',
        description: 'You have successfully enrolled in this learning path.',
      });
    } catch (error) {
      console.error('Error enrolling in learning path:', error);
      toast({
        title: 'Error',
        description: 'Failed to enroll in learning path. Please try again later.',
        variant: 'destructive'
      });
    } finally {
      setEnrolling(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="container pt-32 pb-20 flex justify-center items-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <span className="ml-2 text-lg">Loading learning path...</span>
        </div>
      </div>
    );
  }

  if (!learningPath) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="container pt-32 pb-20 text-center">
          <h2 className="text-2xl font-bold mb-4">Learning Path Not Found</h2>
          <p className="text-muted-foreground mb-6">
            The learning path you're looking for doesn't exist or has been removed.
          </p>
          <Button asChild>
            <Link to="/learning-paths">
              <ChevronLeft className="h-4 w-4 mr-2" />
              Back to Learning Paths
            </Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <main className="pt-24 pb-20">
        <div className="container px-4 mx-auto">
          {/* Back button */}
          <Button variant="ghost" className="mb-6" asChild>
            <Link to="/learning-paths">
              <ChevronLeft className="h-4 w-4 mr-2" />
              Back to Learning Paths
            </Link>
          </Button>
          
          {/* Learning Path Header */}
          <div className="mb-8">
            <div className="flex flex-wrap items-start justify-between gap-4 mb-4">
              <div>
                <h1 className="text-3xl md:text-4xl font-bold mb-2">{learningPath.title}</h1>
                <p className="text-muted-foreground text-lg">{learningPath.description}</p>
              </div>
              
              {!enrolled ? (
                <Button 
                  size="lg" 
                  onClick={handleEnroll} 
                  disabled={enrolling}
                >
                  {enrolling ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Enrolling...
                    </>
                  ) : (
                    <>
                      <BookOpen className="h-5 w-5 mr-2" />
                      Enroll in Learning Path
                    </>
                  )}
                </Button>
              ) : (
                <div className="bg-white border border-border/40 rounded-lg p-4 min-w-64">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-medium">Your Progress</span>
                    <Badge variant="secondary">{progress}% Complete</Badge>
                  </div>
                  <Progress value={progress} className="h-2 mb-3" />
                  <Button size="sm" className="w-full">
                    <Book className="h-4 w-4 mr-2" />
                    Continue Learning
                  </Button>
                </div>
              )}
            </div>
            
            <div className="flex flex-wrap gap-4 items-center text-sm text-muted-foreground">
              <div className="flex items-center">
                <Book className="h-4 w-4 mr-1" />
                <span>{pathSteps.length} Courses</span>
              </div>
              
              <div className="flex items-center">
                <Clock className="h-4 w-4 mr-1" />
                <span>
                  {pathSteps.reduce((total, step) => {
                    const hours = parseInt(step.course.duration.split(' ')[0]);
                    return total + hours;
                  }, 0)} hours total
                </span>
              </div>
            </div>
          </div>
          
          {/* Learning Path Content */}
          <div className="bg-white rounded-xl shadow-sm border border-border/50 overflow-hidden">
            <Tabs defaultValue="courses">
              <TabsList className="bg-muted/40 p-0 justify-start w-full rounded-none border-b border-border/40">
                <TabsTrigger 
                  value="courses" 
                  className="px-6 py-3 rounded-none data-[state=active]:bg-white"
                >
                  Courses ({pathSteps.length})
                </TabsTrigger>
                <TabsTrigger 
                  value="overview" 
                  className="px-6 py-3 rounded-none data-[state=active]:bg-white"
                >
                  Overview
                </TabsTrigger>
              </TabsList>
              
              <TabsContent value="courses" className="p-0 mt-0">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-16">Step</TableHead>
                      <TableHead>Course</TableHead>
                      <TableHead>Level</TableHead>
                      <TableHead>Duration</TableHead>
                      <TableHead className="text-right">Action</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {pathSteps.map((step, index) => (
                      <TableRow key={step.id}>
                        <TableCell className="font-medium">
                          {index + 1}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <img 
                              src={step.course.thumbnail} 
                              alt={step.course.title}
                              className="h-10 w-16 object-cover rounded"
                            />
                            <div>
                              <p className="font-medium">{step.course.title}</p>
                              <p className="text-sm text-muted-foreground">{step.course.instructor}</p>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">{step.course.level}</Badge>
                        </TableCell>
                        <TableCell>{step.course.duration}</TableCell>
                        <TableCell className="text-right">
                          <Button size="sm" variant="outline" asChild>
                            <Link to={`/course/${step.course.id}`}>
                              View Course
                            </Link>
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TabsContent>
              
              <TabsContent value="overview" className="p-6 mt-0">
                <div className="space-y-6">
                  <Card>
                    <CardHeader>
                      <CardTitle>What You'll Learn</CardTitle>
                      <CardDescription>
                        Key skills and knowledge gained from this learning path
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <ul className="list-disc pl-5 space-y-2">
                        <li>Master all fundamental concepts across {pathSteps.length} carefully selected courses</li>
                        <li>Build practical skills through hands-on projects and exercises</li>
                        <li>Learn at your own pace with a structured learning sequence</li>
                        <li>Achieve expertise through progressive skill development</li>
                      </ul>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardHeader>
                      <CardTitle>Related Courses</CardTitle>
                      <CardDescription>
                        These courses complement this learning path
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {pathSteps.slice(0, 2).map(step => (
                          <CourseCard key={step.course.id} course={step.course} />
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </main>
    </div>
  );
};

export default LearningPathDetailsPage;
