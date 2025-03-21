
import React from 'react';
import { useVideoPlayer } from '@/contexts/VideoPlayerContext';

const VideoLoadingOverlay: React.FC = () => {
  const { loading } = useVideoPlayer();
  
  if (!loading) {
    return null;
  }
  
  return (
    <div className="absolute inset-0 flex items-center justify-center bg-black/50">
      <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
    </div>
  );
};

export default VideoLoadingOverlay;
