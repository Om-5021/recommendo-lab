
import React, { useState } from 'react';
import { Clock, Users, Star, BookOpen, Play } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';
import { Course, CourseVideo } from '@/types/database';
import { Avatar, AvatarImage, AvatarFallback } from './Avatar';

interface CourseHeroProps {
  course: Course;
  selectedVideo: CourseVideo | null;
  userCourse: any;
  courseProgress: number;
  onSelectVideo: (video: CourseVideo | null) => void;
  imageLoaded: boolean;
  setImageLoaded: (loaded: boolean) => void;
}

const CourseHero: React.FC<CourseHeroProps> = ({
  course,
  selectedVideo,
  userCourse,
  courseProgress,
  onSelectVideo,
  imageLoaded,
  setImageLoaded
}) => {
  return (
    <div className="bg-gradient-to-b from-blue-50 to-transparent">
      <div className="container px-4 mx-auto py-10">
        <div className="flex flex-col md:flex-row gap-8">
          {/* Course Image or Video Player */}
          <div className="md:w-2/5 lg:w-1/3 animate-fade-up">
            {selectedVideo ? (
              <VideoPlayer 
                video={selectedVideo}
                courseId={course.id}
              />
            ) : (
              <div 
                className={cn(
                  "aspect-video w-full rounded-xl overflow-hidden shadow-lg relative",
                  "before:absolute before:inset-0 before:bg-blue-500/10"
                )}
              >
                <img 
                  src={course?.preview || course?.thumbnail}
                  alt={course?.title}
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

            {/* Course Progress */}
            {userCourse && course && (
              <div className="mt-4 p-4 glass-card rounded-xl">
                <div className="flex justify-between items-center mb-2">
                  <h3 className="font-medium">Course Progress</h3>
                  <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20">
                    {courseProgress}% Complete
                  </Badge>
                </div>
                <Progress value={courseProgress} className="h-2" />
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
  );
};

// Import at the top to avoid circular dependency
import VideoPlayer from '@/components/VideoPlayer';

export default CourseHero;
