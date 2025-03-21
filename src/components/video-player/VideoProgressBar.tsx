
import React from 'react';
import { Slider } from '@/components/ui/slider';
import { useVideoPlayer } from '@/contexts/VideoPlayerContext';

const VideoProgressBar: React.FC = () => {
  const { currentTime, duration, handleSeek } = useVideoPlayer();

  const onValueChange = (values: number[]) => {
    if (handleSeek) {
      handleSeek(values);
    }
  };

  return (
    <Slider 
      value={[currentTime]} 
      min={0} 
      max={duration || 100}
      step={0.1}
      onValueChange={onValueChange}
      className="cursor-pointer"
    />
  );
};

export default VideoProgressBar;
