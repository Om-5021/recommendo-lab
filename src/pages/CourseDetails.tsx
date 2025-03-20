
import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Clock, Users, Star, BookOpen, Play, BarChart, CheckCircle, Calendar, ChevronRight, Award, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/components/ui/use-toast';
import Navbar from '@/components/Navbar';
import { supabase } from '@/integrations/supabase/client';
import { cn } from '@/lib/utils';
import CourseVideos from '@/components/CourseVideos';
import VideoPlayer from '@/components/VideoPlayer';
import { Course, CourseVideo } from '@/types/database';

const CourseDetails = () => {
  const { courseId } = useParams<{ courseId: string }>();
  const [course, setCourse] = useState<Course | null>(null);
  const [similarCourses, setSimilarCourses] = useState<Course[]>([]);
  const [loadingCourse, setLoadingCourse] = useState(true);
  const [loadingSimilar, setLoadingSimilar] = useState(true);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [selectedVideo, setSelectedVideo] = useState<CourseVideo | null>(null);
  const { toast } = useToast();

  // Fetch course details
  useEffect(() => {
    const fetchCourse = async () => {
      if (!courseId) return;
      
      try {
        setLoadingCourse(true);
        const { data, error } = await supabase
          .from('courses')
          .select('*')
          .eq('id', courseId)
          .maybeSingle();
          
        if (error) {
          throw error;
        }
        
        if (data) {
          setCourse(data as Course);
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
        <div className="bg-gradient-to-b from-blue-50 to-transparent">
          <div className="container px-4 mx-auto py-10">
            <div className="flex flex-col md:flex-row gap-8">
              {/* Course Image or Video Player */}
              <div className="md:w-2/5 lg:w-1/3 animate-fade-up">
                {selectedVideo ? (
                  <VideoPlayer video={selectedVideo} />
                ) : (
                  <div 
                    className={cn(
                      "aspect-video w-full rounded-xl overflow-hidden shadow-lg relative",
                      "before:absolute before:inset-0 before:bg-blue-500/10"
                    )}
                  >
                    <img 
                      src={course.preview || course.thumbnail}
                      alt={course.title}
                      className={cn(
                        "w-full h-full object-cover transition-opacity duration-300",
                        imageLoaded ? "opacity-100" : "opacity-0"
                      )}
                      onLoad={() => setImageLoaded(true)}
                    />
                    
                    <div className="absolute inset-0 flex items-center justify-center">
                      <Button 
                        size="icon" 
                        className="h-16 w-16 rounded-full bg-white/90 hover:bg-white shadow-lg hover:scale-105 transition-all"
                      >
                        <Play className="h-8 w-8 text-primary fill-primary" />
                      </Button>
                    </div>
                  </div>
                )}
              </div>
              
              {/* Course Info */}
              <div className="md:w-3/5 lg:w-2/3 animate-fade-up" style={{ animationDelay: "0.1s" }}>
                <div className="flex flex-wrap gap-2 mb-3">
                  <Badge className="bg-primary/10 text-primary hover:bg-primary/20 border-none">
                    {course.category}
                  </Badge>
                  <Badge className="bg-secondary text-muted-foreground hover:bg-secondary/80 border-none">
                    {course.level}
                  </Badge>
                </div>
                
                <h1 className="text-3xl md:text-4xl font-bold mb-3">{course.title}</h1>
                
                <p className="text-muted-foreground mb-6">{course.description}</p>
                
                <div className="flex flex-wrap gap-x-6 gap-y-3 mb-6">
                  <div className="flex items-center">
                    <Clock className="h-5 w-5 text-muted-foreground mr-2" />
                    <span>{course.duration}</span>
                  </div>
                  <div className="flex items-center">
                    <Users className="h-5 w-5 text-muted-foreground mr-2" />
                    <span>{course.enrollments.toLocaleString()} students</span>
                  </div>
                  <div className="flex items-center">
                    <Star className="h-5 w-5 text-amber-500 fill-amber-500 mr-2" />
                    <span>{course.rating} rating</span>
                  </div>
                  <div className="flex items-center">
                    <BookOpen className="h-5 w-5 text-muted-foreground mr-2" />
                    <span>Last updated {new Date(course.created_at).toLocaleDateString()}</span>
                  </div>
                </div>
                
                <div className="flex items-center mb-6">
                  <div className="flex items-center mr-4">
                    <Avatar className="h-10 w-10 mr-2 border border-border">
                      <AvatarImage src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80" alt={course.instructor} />
                      <AvatarFallback>{course.instructor[0]}</AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium">{course.instructor}</p>
                      <p className="text-xs text-muted-foreground">Lead Instructor</p>
                    </div>
                  </div>
                </div>
                
                <div className="flex flex-col sm:flex-row gap-4">
                  <Button size="lg" className="flex-1">Enroll Now</Button>
                  <Button size="lg" variant="outline" className="flex-1">Add to Wishlist</Button>
                </div>
              </div>
            </div>
          </div>
        </div>
        
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
                  <div className="space-y-6">
                    <section>
                      <h2 className="text-2xl font-bold mb-4">About This Course</h2>
                      <p className="text-muted-foreground mb-3">
                        This comprehensive course takes you through all aspects of {course.title.toLowerCase()}, from basic concepts to advanced techniques. Whether you're a beginner or looking to expand your knowledge, this course provides a structured learning path with hands-on exercises and real-world projects.
                      </p>
                      <p className="text-muted-foreground mb-3">
                        You'll learn through a combination of video lectures, practical assignments, quizzes, and a final project that consolidates all your learning. By the end of this course, you'll have gained practical skills that you can immediately apply in your work or studies.
                      </p>
                    </section>
                    
                    <section>
                      <h2 className="text-2xl font-bold mb-4">What You'll Learn</h2>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {[
                          "Master core principles and best practices",
                          "Build real-world projects for your portfolio",
                          "Learn from industry experts with practical experience",
                          "Access to cutting-edge tools and frameworks",
                          "Develop problem-solving skills through challenges",
                          "Understand advanced concepts and applications",
                          "Join a community of like-minded learners",
                          "Receive personalized feedback on your progress"
                        ].map((item, index) => (
                          <div key={index} className="flex items-start">
                            <CheckCircle className="h-5 w-5 text-primary mt-0.5 mr-2 shrink-0" />
                            <span>{item}</span>
                          </div>
                        ))}
                      </div>
                    </section>
                    
                    <section>
                      <h2 className="text-2xl font-bold mb-4">Requirements</h2>
                      <ul className="list-disc list-inside space-y-2 text-muted-foreground">
                        <li>Basic understanding of {course.category.toLowerCase()} concepts</li>
                        <li>Access to a computer with internet connection</li>
                        <li>Willingness to practice and apply what you learn</li>
                        <li>No specific software is required - all tools used are free</li>
                      </ul>
                    </section>
                    
                    <section>
                      <h2 className="text-2xl font-bold mb-4">Who This Course is For</h2>
                      <ul className="list-disc list-inside space-y-2 text-muted-foreground">
                        <li>Students wanting to gain practical skills in {course.category.toLowerCase()}</li>
                        <li>Professionals looking to expand their knowledge and expertise</li>
                        <li>Career changers entering the field of {course.category.toLowerCase()}</li>
                        <li>Anyone with an interest in {course.title.toLowerCase()}</li>
                      </ul>
                    </section>
                  </div>
                </TabsContent>
                
                <TabsContent value="curriculum" className="m-0">
                  <CourseVideos 
                    courseId={course.id} 
                    onSelectVideo={handleSelectVideo}
                  />
                </TabsContent>
                
                <TabsContent value="reviews" className="m-0">
                  <div className="space-y-6">
                    <section>
                      <h2 className="text-2xl font-bold mb-4">Student Reviews</h2>
                      
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                        <div className="md:col-span-1 flex flex-col items-center justify-center p-6 glass-card rounded-xl">
                          <div className="text-5xl font-bold text-primary mb-2">{course.rating}</div>
                          <div className="flex mb-2">
                            {[1, 2, 3, 4, 5].map(star => (
                              <Star 
                                key={star} 
                                className={`h-5 w-5 ${star <= Math.floor(course.rating) ? "text-amber-500 fill-amber-500" : "text-gray-300"}`} 
                              />
                            ))}
                          </div>
                          <p className="text-muted-foreground">Course Rating</p>
                          <p className="text-sm mt-1 text-muted-foreground">{course.enrollments.toLocaleString()} students</p>
                        </div>
                        
                        <div className="md:col-span-2 glass-card rounded-xl p-6">
                          <h3 className="font-semibold mb-4">Rating Distribution</h3>
                          {[5, 4, 3, 2, 1].map(rating => {
                            // Generate a percentage based on the course rating
                            const percentage = rating === 5 ? 68 : 
                                              rating === 4 ? 22 : 
                                              rating === 3 ? 7 : 
                                              rating === 2 ? 2 : 1;
                            
                            return (
                              <div key={rating} className="flex items-center mb-2 last:mb-0">
                                <div className="flex items-center w-1/6">
                                  <Star className="h-4 w-4 text-amber-500 fill-amber-500 mr-1" />
                                  <span>{rating}</span>
                                </div>
                                <div className="w-4/6 mx-4">
                                  <Progress value={percentage} className="h-2" />
                                </div>
                                <div className="w-1/6 text-muted-foreground text-sm">
                                  {percentage}%
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                      
                      <Separator className="my-8" />
                      
                      {/* Sample reviews */}
                      {[
                        {
                          name: "Sarah Johnson",
                          avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80",
                          rating: 5,
                          date: "2 months ago",
                          comment: "This course exceeded my expectations! The instructor explains complex concepts in a simple and understandable way. The projects were challenging but helped reinforce what I learned. Highly recommended for anyone wanting to master this subject."
                        },
                        {
                          name: "David Williams",
                          avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80",
                          rating: 4,
                          date: "1 month ago",
                          comment: "Great course with lots of practical examples. I found the explanations clear and concise. My only suggestion would be to include more advanced topics in the later sections. Otherwise, this was exactly what I needed to progress in my learning journey."
                        },
                        {
                          name: "Emily Chen",
                          avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80",
                          rating: 5,
                          date: "3 weeks ago",
                          comment: "As a beginner, I was worried this course might be too advanced, but the instructor does an excellent job of breaking down difficult concepts. The pace is perfect, and I feel much more confident in my skills now. The community support is also fantastic!"
                        }
                      ].map((review, index) => (
                        <div key={index} className="mb-6 last:mb-0 pb-6 last:pb-0 border-b last:border-0 border-border">
                          <div className="flex justify-between mb-3">
                            <div className="flex items-center">
                              <Avatar className="h-10 w-10 mr-3">
                                <AvatarImage src={review.avatar} alt={review.name} />
                                <AvatarFallback>{review.name[0]}</AvatarFallback>
                              </Avatar>
                              <div>
                                <h4 className="font-medium">{review.name}</h4>
                                <div className="flex items-center">
                                  <div className="flex mr-2">
                                    {[1, 2, 3, 4, 5].map(star => (
                                      <Star 
                                        key={star} 
                                        className={`h-3 w-3 ${star <= review.rating ? "text-amber-500 fill-amber-500" : "text-gray-300"}`} 
                                      />
                                    ))}
                                  </div>
                                  <span className="text-xs text-muted-foreground">{review.date}</span>
                                </div>
                              </div>
                            </div>
                          </div>
                          <p className="text-muted-foreground">{review.comment}</p>
                        </div>
                      ))}
                      
                      <Button variant="outline" className="mt-4 w-full">Load More Reviews</Button>
                    </section>
                  </div>
                </TabsContent>
                
                <TabsContent value="instructor" className="m-0">
                  <div className="space-y-6">
                    <section>
                      <div className="flex flex-col md:flex-row items-start gap-6 mb-6">
                        <Avatar className="h-24 w-24 rounded-xl">
                          <AvatarImage src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80" alt={course.instructor} />
                          <AvatarFallback className="text-2xl">{course.instructor[0]}</AvatarFallback>
                        </Avatar>
                        
                        <div>
                          <h2 className="text-2xl font-bold mb-2">{course.instructor}</h2>
                          <p className="text-muted-foreground mb-3">
                            Lead Instructor & Industry Expert in {course.category}
                          </p>
                          
                          <div className="flex flex-wrap gap-4 mb-4">
                            <div className="flex items-center">
                              <Star className="h-5 w-5 text-amber-500 fill-amber-500 mr-1" />
                              <span>4.9 Instructor Rating</span>
                            </div>
                            <div className="flex items-center">
                              <Users className="h-5 w-5 text-muted-foreground mr-1" />
                              <span>32,547 Students</span>
                            </div>
                            <div className="flex items-center">
                              <BookOpen className="h-5 w-5 text-muted-foreground mr-1" />
                              <span>12 Courses</span>
                            </div>
                          </div>
                        </div>
                      </div>
                      
                      <div className="space-y-4">
                        <p className="text-muted-foreground">
                          {course.instructor} is a seasoned professional with over 15 years of experience in {course.category}. 
                          After earning a Ph.D. from Stanford University, they worked at leading technology companies 
                          before transitioning to education full-time.
                        </p>
                        
                        <p className="text-muted-foreground">
                          Their teaching approach combines academic rigor with practical industry insights, 
                          helping students not just understand concepts but apply them in real-world scenarios. 
                          They have taught over 30,000 students across various platforms and are known for their 
                          clear explanations and engaging teaching style.
                        </p>
                        
                        <p className="text-muted-foreground">
                          When not teaching, they consult for Fortune 500 companies and contribute to open-source 
                          projects. Their work has been featured in prestigious journals and conferences in the field.
                        </p>
                      </div>
                    </section>
                  </div>
                </TabsContent>
              </div>
              
              {/* Sidebar */}
              <div className="animate-fade-up" style={{ animationDelay: "0.3s" }}>
                <div className="glass-card rounded-xl p-6 space-y-6 sticky top-32">
                  <div className="text-center">
                    <div className="text-3xl font-bold mb-2">Free</div>
                    <p className="text-muted-foreground mb-6">Full access to this course</p>
                    <Button className="w-full mb-3">Enroll Now</Button>
                    <Button variant="outline" className="w-full">Add to Wishlist</Button>
                  </div>
                  
                  <Separator />
                  
                  <div className="space-y-3">
                    <h3 className="font-semibold">This course includes:</h3>
                    
                    <div className="flex items-start">
                      <BookOpen className="h-5 w-5 text-muted-foreground mt-0.5 mr-3" />
                      <div>
                        <p>12 hours on-demand video</p>
                      </div>
                    </div>
                    
                    <div className="flex items-start">
                      <BookOpen className="h-5 w-5 text-muted-foreground mt-0.5 mr-3" />
                      <div>
                        <p>48 lessons in 8 modules</p>
                      </div>
                    </div>
                    
                    <div className="flex items-start">
                      <Calendar className="h-5 w-5 text-muted-foreground mt-0.5 mr-3" />
                      <div>
                        <p>Full lifetime access</p>
                      </div>
                    </div>
                    
                    <div className="flex items-start">
                      <BookOpen className="h-5 w-5 text-muted-foreground mt-0.5 mr-3" />
                      <div>
                        <p>25 downloadable resources</p>
                      </div>
                    </div>
                    
                    <div className="flex items-start">
                      <Award className="h-5 w-5 text-muted-foreground mt-0.5 mr-3" />
                      <div>
                        <p>Certificate of completion</p>
                      </div>
                    </div>
                  </div>
                  
                  <Separator />
                  
                  <div>
                    <h3 className="font-semibold mb-3">Similar Courses</h3>
                    {loadingSimilar ? (
                      <div className="flex justify-center py-4">
                        <Loader2 className="h-6 w-6 animate-spin text-primary" />
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {similarCourses.map(course => (
                          <Link to={`/course/${course.id}`} key={course.id} className="group block">
                            <div className="flex gap-3">
                              <div className="w-16 h-16 rounded-md overflow-hidden shrink-0">
                                <img 
                                  src={course.thumbnail} 
                                  alt={course.title} 
                                  className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                                />
                              </div>
                              <div>
                                <h4 className="font-medium line-clamp-2 group-hover:text-primary transition-colors">{course.title}</h4>
                                <div className="flex items-center mt-1">
                                  <Star className="h-3 w-3 text-amber-500 fill-amber-500 mr-1" />
                                  <span className="text-xs">{course.rating}</span>
                                </div>
                              </div>
                            </div>
                          </Link>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </Tabs>
        </div>
      </main>
    </div>
  );
};

// Avatar component for this file
const Avatar = ({ children, className, ...props }: React.HTMLAttributes<HTMLDivElement> & { children: React.ReactNode }) => {
  return (
    <div className={cn("relative overflow-hidden rounded-full", className)} {...props}>
      {children}
    </div>
  );
};

const AvatarImage = ({ src, alt, className, ...props }: React.ImgHTMLAttributes<HTMLImageElement>) => {
  return <img src={src} alt={alt} className={cn("aspect-square h-full w-full", className)} {...props} />;
};

const AvatarFallback = ({ children, className, ...props }: React.HTMLAttributes<HTMLDivElement> & { children: React.ReactNode }) => {
  return (
    <div
      className={cn(
        "flex h-full w-full items-center justify-center bg-muted",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
};

export default CourseDetails;
