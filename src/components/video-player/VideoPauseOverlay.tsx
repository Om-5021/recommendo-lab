
import React from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Play } from 'lucide-react';
import { useVideoPlayer } from '@/contexts/VideoPlayerContext';

const VideoPauseOverlay: React.FC = () => {
  const { isPlaying, loading, togglePlay, video } = useVideoPlayer();
  
  if (loading || isPlaying) {
    return null;
  }
  
  return (
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
  );
};

export default VideoPauseOverlay;
