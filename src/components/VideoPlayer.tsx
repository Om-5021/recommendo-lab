import React, { useState, useRef, useEffect } from 'react';
import { Play, Pause, Volume2, VolumeX, Maximize, Minimize } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Slider } from '@/components/ui/slider';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CourseVideo } from '@/types/database';
import { useUserProgress } from '@/contexts/UserProgressContext';
import { useToast } from '@/components/ui/use-toast';

interface VideoPlayerProps {
  video: CourseVideo;
  courseId: string;
  totalVideos?: number;
  className?: string;
  onEnded?: () => void;
}

const VideoPlayer: React.FC<VideoPlayerProps> = ({ 
  video, 
  courseId,
  totalVideos = 1,
  className,
  onEnded
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const [loading, setLoading] = useState(true);
  const [progressTracked, setProgressTracked] = useState(false);
  
  const controlsTimeoutRef = useRef<number | null>(null);
  
  const { session, updateCourseProgress } = useUserProgress();
  const { toast } = useToast();

  useEffect(() => {
    const videoElement = videoRef.current;
    
    if (!videoElement) return;
    
    // Reset state when video changes
    setIsPlaying(false);
    setCurrentTime(0);
    setDuration(0);
    setLoading(true);
    setProgressTracked(false);
    
    const onLoadedMetadata = () => {
      setDuration(videoElement.duration);
    };
    
    const onTimeUpdate = () => {
      const newTime = videoElement.currentTime;
      setCurrentTime(newTime);
      
      // Track progress at 25%, 50%, 75%, and 90% points of the video
      if (session.userId && duration > 0) {
        const percentage = Math.floor((newTime / duration) * 100);
        
        // Calculate the video's contribution to the overall course progress
        const videoContribution = Math.floor(100 / totalVideos);
        
        // Track progress at specific milestones
        if (!progressTracked && percentage >= 25) {
          const videoProgress = Math.ceil(percentage / 100 * videoContribution);
          updateCourseProgress(courseId, videoProgress, video.id);
          setProgressTracked(true);
        }
      }
    };
    
    const onEnded = () => {
      setIsPlaying(false);
      
      // Update progress to 100% for this video
      if (session.userId) {
        const videoContribution = Math.floor(100 / totalVideos);
        updateCourseProgress(courseId, videoContribution, video.id);
        
        toast({
          title: "Video completed!",
          description: "Your progress has been updated.",
        });
      }
      
      if (onEnded) {
        onEnded();
      }
    };
    
    const onLoadedData = () => {
      setLoading(false);
    };
    
    videoElement.addEventListener('loadedmetadata', onLoadedMetadata);
    videoElement.addEventListener('timeupdate', onTimeUpdate);
    videoElement.addEventListener('ended', onEnded);
    videoElement.addEventListener('loadeddata', onLoadedData);
    
    return () => {
      videoElement.removeEventListener('loadedmetadata', onLoadedMetadata);
      videoElement.removeEventListener('timeupdate', onTimeUpdate);
      videoElement.removeEventListener('ended', onEnded);
      videoElement.removeEventListener('loadeddata', onLoadedData);
    };
  }, [video.video_url, onEnded, duration, session.userId, courseId, totalVideos, updateCourseProgress, video.id, toast, progressTracked]);
  
  const togglePlay = () => {
    if (!videoRef.current) return;
    
    if (isPlaying) {
      videoRef.current.pause();
    } else {
      videoRef.current.play();
    }
    
    setIsPlaying(!isPlaying);
  };
  
  const toggleMute = () => {
    if (!videoRef.current) return;
    
    videoRef.current.muted = !isMuted;
    setIsMuted(!isMuted);
  };
  
  const handleVolumeChange = (value: number[]) => {
    if (!videoRef.current) return;
    
    const newVolume = value[0];
    videoRef.current.volume = newVolume;
    setVolume(newVolume);
    
    if (newVolume === 0) {
      setIsMuted(true);
      videoRef.current.muted = true;
    } else if (isMuted) {
      setIsMuted(false);
      videoRef.current.muted = false;
    }
  };
  
  const handleSeek = (value: number[]) => {
    if (!videoRef.current) return;
    
    const seekTime = value[0];
    videoRef.current.currentTime = seekTime;
    setCurrentTime(seekTime);
  };
  
  const toggleFullscreen = () => {
    if (!containerRef.current) return;
    
    if (!document.fullscreenElement) {
      containerRef.current.requestFullscreen().catch(err => {
        console.error(`Error attempting to enable fullscreen: ${err.message}`);
      });
    } else {
      document.exitFullscreen();
    }
  };
  
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    
    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
    };
  }, []);
  
  const formatTime = (timeInSeconds: number) => {
    const minutes = Math.floor(timeInSeconds / 60);
    const seconds = Math.floor(timeInSeconds % 60);
    return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
  };
  
  const showControlsTemporarily = () => {
    setShowControls(true);
    
    if (controlsTimeoutRef.current) {
      window.clearTimeout(controlsTimeoutRef.current);
    }
    
    controlsTimeoutRef.current = window.setTimeout(() => {
      if (isPlaying) {
        setShowControls(false);
      }
    }, 3000);
  };
  
  useEffect(() => {
    return () => {
      if (controlsTimeoutRef.current) {
        window.clearTimeout(controlsTimeoutRef.current);
      }
    };
  }, []);

  return (
    <div 
      ref={containerRef}
      className={cn(
        "relative overflow-hidden rounded-xl bg-black aspect-video",
        isFullscreen ? "w-full h-full" : "",
        className
      )}
      onMouseMove={showControlsTemporarily}
      onMouseLeave={() => isPlaying && setShowControls(false)}
    >
      <video
        ref={videoRef}
        src={video.video_url}
        className="w-full h-full cursor-pointer"
        onClick={togglePlay}
        poster={loading ? undefined : undefined}
      />
      
      {loading && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/50">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
        </div>
      )}
      
      {!loading && !isPlaying && (
        <div 
          className="absolute inset-0 flex items-center justify-center bg-black/30 cursor-pointer"
          onClick={togglePlay}
        >
          <Button 
            size="icon" 
            className="h-16 w-16 rounded-full bg-white/90 hover:bg-white shadow-lg hover:scale-105 transition-all"
          >
            <Play className="h-8 w-8 text-primary fill-primary" />
          </Button>
          
          <div className="absolute top-4 left-4">
            <Badge variant="secondary" className="bg-black/70 text-white border-none px-3 py-1.5">
              {video.title}
            </Badge>
          </div>
        </div>
      )}
      
      <div 
        className={cn(
          "absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4 transition-opacity duration-300",
          showControls ? "opacity-100" : "opacity-0"
        )}
      >
        <div className="flex flex-col gap-2">
          <Slider 
            value={[currentTime]} 
            min={0} 
            max={duration || 100}
            step={0.1}
            onValueChange={handleSeek}
            className="cursor-pointer"
          />
          
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Button 
                size="icon" 
                variant="ghost" 
                className="h-8 w-8 text-white hover:bg-white/10"
                onClick={togglePlay}
              >
                {isPlaying ? (
                  <Pause className="h-5 w-5" />
                ) : (
                  <Play className="h-5 w-5" />
                )}
              </Button>
              
              <div className="flex items-center gap-2">
                <Button 
                  size="icon" 
                  variant="ghost" 
                  className="h-8 w-8 text-white hover:bg-white/10"
                  onClick={toggleMute}
                >
                  {isMuted || volume === 0 ? (
                    <VolumeX className="h-5 w-5" />
                  ) : (
                    <Volume2 className="h-5 w-5" />
                  )}
                </Button>
                
                <Slider 
                  value={[isMuted ? 0 : volume]} 
                  min={0} 
                  max={1}
                  step={0.01}
                  onValueChange={handleVolumeChange}
                  className="w-20"
                />
              </div>
              
              <span className="text-xs text-white">
                {formatTime(currentTime)} / {formatTime(duration)}
              </span>
            </div>
            
            <Button 
              size="icon" 
              variant="ghost" 
              className="h-8 w-8 text-white hover:bg-white/10"
              onClick={toggleFullscreen}
            >
              {isFullscreen ? (
                <Minimize className="h-5 w-5" />
              ) : (
                <Maximize className="h-5 w-5" />
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VideoPlayer;
