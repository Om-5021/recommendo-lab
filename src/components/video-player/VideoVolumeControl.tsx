
import React from 'react';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Volume2, VolumeX } from 'lucide-react';
import { useVideoPlayer } from '@/contexts/VideoPlayerContext';

const VideoVolumeControl: React.FC = () => {
  const { volume, isMuted, toggleMute, handleVolumeChange } = useVideoPlayer();

  return (
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
  );
};

export default VideoVolumeControl;
