
import React, { useState, useEffect } from 'react';
import { Play, BookOpen, BarChart, ChevronRight, Loader2, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CourseVideo } from '@/types/database';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/components/ui/use-toast';
import { useUserProgress } from '@/contexts/UserProgressContext';
import { cn } from '@/lib/utils';

interface CourseVideosProps {
  courseId: string;
  onSelectVideo?: (video: CourseVideo) => void;
}

const CourseVideos: React.FC<CourseVideosProps> = ({ courseId, onSelectVideo }) => {
  const [videos, setVideos] = useState<CourseVideo[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    'section-1': true
  });
  const { toast } = useToast();
  const { userCourses } = useUserProgress();
  
  // Get user course progress data
  const userCourse = userCourses.find(uc => uc.course_id === courseId);
  const lastWatchedVideoId = userCourse?.last_watched_video;

  useEffect(() => {
    const fetchVideos = async () => {
      try {
        setLoading(true);
        const { data, error } = await supabase
          .from('course_videos')
          .select('*')
          .eq('course_id', courseId)
          .order('order_index', { ascending: true });
          
        if (error) {
          throw error;
        }
        
        if (data) {
          setVideos(data as CourseVideo[]);
        }
      } catch (error) {
        console.error('Error fetching course videos:', error);
        toast({
          title: 'Error',
          description: 'Failed to load course videos. Please try again later.',
          variant: 'destructive'
        });
      } finally {
        setLoading(false);
      }
    };
    
    if (courseId) {
      fetchVideos();
    }
  }, [courseId, toast]);

  const toggleSection = (sectionId: string) => {
    setExpandedSections(prev => ({
      ...prev,
      [sectionId]: !prev[sectionId]
    }));
  };

  const handleVideoClick = (video: CourseVideo) => {
    if (onSelectVideo) {
      onSelectVideo(video);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-8">
        <Loader2 className="h-6 w-6 animate-spin text-primary mr-2" />
        <span>Loading videos...</span>
      </div>
    );
  }

  if (videos.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground">No videos available for this course yet.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <section>
        <h2 className="text-2xl font-bold mb-4">Course Curriculum</h2>
        <p className="text-muted-foreground mb-6">
          This course includes {videos.length} lectures with video content, practical exercises, and assessments.
        </p>
        
        <div className="mb-4">
          <div className="flex justify-between items-center py-3 px-4 bg-secondary rounded-t-lg">
            <h3 className="font-semibold">Course Videos</h3>
            <div className="text-sm text-muted-foreground">
              {videos.length} lectures
            </div>
          </div>
          
          {videos.map((video, index) => {
            const isWatched = userCourse && userCourse.progress > 0 && userCourse.progress >= ((index + 1) / videos.length) * 100;
            const isLastWatched = video.id === lastWatchedVideoId;
            
            return (
              <div 
                key={video.id} 
                className={cn(
                  "flex justify-between items-center py-3 px-4 border-b last:border-0 last:rounded-b-lg border-border hover:bg-secondary/50 transition-colors cursor-pointer",
                  isLastWatched ? "bg-primary/5" : "bg-background",
                  isWatched ? "bg-primary/10" : ""
                )}
                onClick={() => handleVideoClick(video)}
              >
                <div className="flex items-center">
                  {isWatched ? (
                    <CheckCircle className="h-4 w-4 mr-3 text-green-500" />
                  ) : isLastWatched ? (
                    <Play className="h-4 w-4 mr-3 text-primary fill-primary" />
                  ) : (
                    <Play className="h-4 w-4 mr-3 text-primary" />
                  )}
                  <span>{video.title}</span>
                  {isLastWatched && (
                    <Badge variant="outline" className="ml-2 bg-primary/10 text-primary border-primary/20 text-xs">
                      Continue
                    </Badge>
                  )}
                </div>
                <div className="text-sm text-muted-foreground">{video.duration}</div>
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
};

export default CourseVideos;
