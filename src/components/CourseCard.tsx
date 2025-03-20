
import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { Clock, Users, Star, Play } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { Course as CourseType } from '@/types/database';
import { supabase } from '@/integrations/supabase/client';

interface CourseCardProps {
  course: CourseType;
  progress?: number;
  className?: string;
  showVideoCount?: boolean;
}

const CourseCard: React.FC<CourseCardProps> = ({ 
  course, 
  progress, 
  className,
  showVideoCount = true
}) => {
  const [imageLoaded, setImageLoaded] = useState(false);
  const [videoCount, setVideoCount] = useState(0);
  const imgRef = useRef<HTMLImageElement>(null);

  // Check if image is already cached
  useEffect(() => {
    if (imgRef.current && imgRef.current.complete) {
      setImageLoaded(true);
    }
  }, []);

  // Fetch video count for this course
  useEffect(() => {
    const fetchVideoCount = async () => {
      try {
        const { count, error } = await supabase
          .from('course_videos')
          .select('*', { count: 'exact', head: true })
          .eq('course_id', course.id);
          
        if (error) {
          throw error;
        }
        
        if (count !== null) {
          setVideoCount(count);
        }
      } catch (error) {
        console.error('Error fetching video count:', error);
      }
    };
    
    if (showVideoCount) {
      fetchVideoCount();
    }
  }, [course.id, showVideoCount]);

  const handleImageLoad = () => {
    setImageLoaded(true);
  };

  return (
    <Link to={`/course/${course.id}`} className="block">
      <div 
        className={cn(
          "h-full rounded-xl overflow-hidden transition-all-300 hover:translate-y-[-4px] hover:shadow-lg",
          "glass-card border border-border/50",
          className
        )}
      >
        {/* Image container with blur-up effect */}
        <div 
          className={cn(
            "relative aspect-video w-full overflow-hidden blurred-img",
            imageLoaded ? "loaded" : ""
          )}
          style={{ backgroundImage: `url(${course.thumbnail}?w=40&blur=10)` }}
        >
          <img
            ref={imgRef}
            src={course.thumbnail}
            alt={course.title}
            className={cn(
              "w-full h-full object-cover transition-opacity duration-300",
              imageLoaded ? "opacity-100" : "opacity-0"
            )}
            onLoad={handleImageLoad}
          />
          <div className="absolute top-3 right-3">
            <Badge className="bg-black/70 text-white hover:bg-black/80">{course.level}</Badge>
          </div>
          {progress !== undefined && (
            <div className="absolute bottom-0 left-0 right-0 h-1 bg-gray-200">
              <div 
                className="h-full bg-primary transition-all-300" 
                style={{ width: `${progress}%` }}
              />
            </div>
          )}
        </div>
        
        <div className="p-5">
          <div className="mb-2 flex flex-wrap gap-2">
            <Badge variant="secondary" className="text-xs font-normal">
              {course.category}
            </Badge>
            {videoCount > 0 && (
              <Badge variant="outline" className="text-xs font-normal flex items-center gap-1">
                <Play className="h-3 w-3" /> {videoCount} videos
              </Badge>
            )}
          </div>
          
          <h3 className="text-lg font-semibold mb-2 line-clamp-2 text-balance">
            {course.title}
          </h3>
          
          <p className="text-muted-foreground text-sm mb-4 line-clamp-2">
            {course.description}
          </p>
          
          <div className="flex justify-between items-center text-sm">
            <div className="flex items-center text-muted-foreground gap-1">
              <Clock size={15} />
              <span>{course.duration}</span>
            </div>
            
            <div className="flex items-center text-muted-foreground gap-1">
              <Users size={15} />
              <span>{course.enrollments.toLocaleString()}</span>
            </div>
            
            <div className="flex items-center text-amber-500 gap-1">
              <Star size={15} className="fill-amber-500" />
              <span>{course.rating}</span>
            </div>
          </div>
          
          {progress !== undefined && (
            <div className="mt-4 flex justify-between items-center text-sm">
              <span className="text-muted-foreground">Progress</span>
              <span className="font-medium">{progress}%</span>
            </div>
          )}
        </div>
      </div>
    </Link>
  );
};

export default CourseCard;
