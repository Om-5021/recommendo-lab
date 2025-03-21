
import React from 'react';
import { Button } from '@/components/ui/button';
import { Play, Pause, Maximize, Minimize } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useVideoPlayer } from '@/contexts/VideoPlayerContext';
import VideoProgressBar from './VideoProgressBar';
import VideoVolumeControl from './VideoVolumeControl';

const VideoControls: React.FC = () => {
  const { 
    isPlaying, 
    togglePlay, 
    formatTime, 
    currentTime, 
    duration,
    isFullscreen,
    toggleFullscreen,
    showControls
  } = useVideoPlayer();

  return (
    <div 
      className={cn(
        "absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4 transition-opacity duration-300",
        showControls ? "opacity-100" : "opacity-0"
      )}
    >
      <div className="flex flex-col gap-2">
        <VideoProgressBar />
        
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
            
            <VideoVolumeControl />
            
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
  );
};

export default VideoControls;
