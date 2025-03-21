
import React from 'react';
import { cn } from '@/lib/utils';
import { CourseVideo } from '@/types/database';
import { VideoPlayerProvider } from '@/contexts/VideoPlayerContext';
import { useVideoPlayer } from '@/contexts/VideoPlayerContext';
import VideoControls from './VideoControls';
import VideoLoadingOverlay from './VideoLoadingOverlay';
import VideoPauseOverlay from './VideoPauseOverlay';

interface VideoPlayerProps {
  video: CourseVideo;
  courseId: string;
  totalVideos?: number;
  className?: string;
  onEnded?: () => void;
}

// Main Video Player Component
const VideoPlayer: React.FC<VideoPlayerProps> = ({ 
  video, 
  courseId,
  totalVideos = 1,
  className,
  onEnded
}) => {
  return (
    <VideoPlayerProvider 
      video={video} 
      courseId={courseId} 
      totalVideos={totalVideos} 
      onEnded={onEnded}
    >
      <VideoPlayerContent className={className} />
    </VideoPlayerProvider>
  );
};

// Internal component that uses the context
const VideoPlayerContent: React.FC<{ className?: string }> = ({ className }) => {
  const { 
    videoRef, 
    containerRef,
    video, 
    isFullscreen,
    showControlsTemporarily,
    isPlaying,
    setShowControls,
    togglePlay 
  } = useVideoPlayer();

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
      />
      
      <VideoLoadingOverlay />
      <VideoPauseOverlay />
      <VideoControls />
    </div>
  );
};

export default VideoPlayer;
