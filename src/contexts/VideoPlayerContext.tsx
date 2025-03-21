
import React, { createContext, useContext, useState, useRef, useEffect } from 'react';
import { CourseVideo } from '@/types/database';
import { useUserProgress } from '@/contexts/UserProgressContext';
import { useToast } from '@/components/ui/use-toast';

interface VideoPlayerContextProps {
  video: CourseVideo;
  courseId: string;
  totalVideos: number;
  isPlaying: boolean;
  setIsPlaying: React.Dispatch<React.SetStateAction<boolean>>;
  currentTime: number;
  setCurrentTime: React.Dispatch<React.SetStateAction<number>>;
  duration: number;
  setDuration: React.Dispatch<React.SetStateAction<number>>;
  volume: number;
  setVolume: React.Dispatch<React.SetStateAction<number>>;
  isMuted: boolean;
  setIsMuted: React.Dispatch<React.SetStateAction<boolean>>;
  isFullscreen: boolean;
  setIsFullscreen: React.Dispatch<React.SetStateAction<boolean>>;
  showControls: boolean;
  setShowControls: React.Dispatch<React.SetStateAction<boolean>>;
  loading: boolean;
  setLoading: React.Dispatch<React.SetStateAction<boolean>>;
  videoRef: React.RefObject<HTMLVideoElement>;
  containerRef: React.RefObject<HTMLDivElement>;
  togglePlay: () => void;
  toggleMute: () => void;
  handleVolumeChange: (value: number[]) => void;
  handleSeek: (value: number[]) => void;
  toggleFullscreen: () => void;
  formatTime: (timeInSeconds: number) => string;
  showControlsTemporarily: () => void;
}

const VideoPlayerContext = createContext<VideoPlayerContextProps | undefined>(undefined);

export const VideoPlayerProvider: React.FC<{
  children: React.ReactNode;
  video: CourseVideo;
  courseId: string;
  totalVideos?: number;
  onEnded?: () => void;
}> = ({ children, video, courseId, totalVideos = 1, onEnded }) => {
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

  // Handle video metadata and events
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
    
    const onVideoEnded = () => {
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
    videoElement.addEventListener('ended', onVideoEnded);
    videoElement.addEventListener('loadeddata', onLoadedData);
    
    return () => {
      videoElement.removeEventListener('loadedmetadata', onLoadedMetadata);
      videoElement.removeEventListener('timeupdate', onTimeUpdate);
      videoElement.removeEventListener('ended', onVideoEnded);
      videoElement.removeEventListener('loadeddata', onLoadedData);
    };
  }, [video.video_url, onEnded, duration, session.userId, courseId, totalVideos, updateCourseProgress, video.id, toast, progressTracked]);
  
  // Handle fullscreen changes
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    
    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
    };
  }, []);
  
  // Cleanup controls timeout on unmount
  useEffect(() => {
    return () => {
      if (controlsTimeoutRef.current) {
        window.clearTimeout(controlsTimeoutRef.current);
      }
    };
  }, []);

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

  const value = {
    video,
    courseId,
    totalVideos,
    isPlaying,
    setIsPlaying,
    currentTime,
    setCurrentTime,
    duration,
    setDuration,
    volume,
    setVolume,
    isMuted,
    setIsMuted,
    isFullscreen,
    setIsFullscreen,
    showControls,
    setShowControls,
    loading,
    setLoading,
    videoRef,
    containerRef,
    togglePlay,
    toggleMute,
    handleVolumeChange,
    handleSeek,
    toggleFullscreen,
    formatTime,
    showControlsTemporarily
  };

  return (
    <VideoPlayerContext.Provider value={value}>
      {children}
    </VideoPlayerContext.Provider>
  );
};

export const useVideoPlayer = () => {
  const context = useContext(VideoPlayerContext);
  if (context === undefined) {
    throw new Error('useVideoPlayer must be used within a VideoPlayerProvider');
  }
  return context;
};
