
import React from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Star, Clock, BookOpen } from 'lucide-react';
import { Course } from '@/types/database';
import { cn } from '@/lib/utils';
import { Progress } from '@/components/ui/progress';

interface CourseCardProps {
  course: Course;
  className?: string;
  progress?: number;
}

const CourseCard: React.FC<CourseCardProps> = ({ course, className, progress }) => {
  if (!course) {
    console.error('No course data provided to CourseCard');
    return null;
  }

  // Extract ID from either id or course_id property
  const courseId = course.id || String(course.course_id);
  
  return (
    <Card className={cn("overflow-hidden transition-all hover:shadow-lg border border-border/50", className)}>
      <Link to={`/course/${courseId}`}>
        <div className="aspect-video w-full relative overflow-hidden">
          <img 
            src={course.thumbnail || 'https://via.placeholder.com/640x360?text=Course+Image'} 
            alt={course.title} 
            className="w-full h-full object-cover transition-transform hover:scale-105"
          />
          {course.level && (
            <Badge variant="secondary" className="absolute top-2 right-2">
              {course.level}
            </Badge>
          )}
        </div>
      </Link>
      
      <CardHeader className="p-4 pb-0">
        <div className="flex justify-between items-start">
          <CardTitle className="text-lg font-semibold line-clamp-1">
            <Link to={`/course/${courseId}`} className="hover:text-primary">
              {course.title}
            </Link>
          </CardTitle>
          
          <div className="flex items-center text-amber-500">
            <Star className="h-4 w-4 fill-current" />
            <span className="ml-1 text-sm">{course.rating?.toFixed(1) || "N/A"}</span>
          </div>
        </div>
        
        <CardDescription className="line-clamp-2 mt-1">
          {course.description}
        </CardDescription>
      </CardHeader>
      
      <CardContent className="p-4 pt-2">
        {progress !== undefined && (
          <div className="mt-2 mb-2">
            <div className="flex justify-between items-center mb-1 text-xs text-muted-foreground">
              <span>Progress</span>
              <span>{progress}%</span>
            </div>
            <Progress value={progress} className="h-1.5" />
          </div>
        )}
        <div className="flex flex-wrap gap-1 mt-2">
          {course.tags && course.tags.slice(0, 2).map((tag, index) => (
            <span 
              key={index} 
              className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
            >
              {tag}
            </span>
          ))}
        </div>
      </CardContent>
      
      <CardFooter className="p-4 pt-0 text-sm text-muted-foreground flex justify-between">
        <div className="flex items-center">
          <Clock className="h-4 w-4 mr-1" />
          <span>{course.duration}</span>
        </div>
        
        <div className="flex items-center">
          <BookOpen className="h-4 w-4 mr-1" />
          <span>{course.num_lectures || 0} lectures</span>
        </div>
      </CardFooter>
    </Card>
  );
};

export default CourseCard;
