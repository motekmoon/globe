import { useState } from 'react';

export const useAnimation = () => {
  const [isPlaying, setIsPlaying] = useState(true);

  const toggleAnimation = () => setIsPlaying(!isPlaying);
  const play = () => setIsPlaying(true);
  const pause = () => setIsPlaying(false);

  return {
    isPlaying,
    toggleAnimation,
    play,
    pause,
  };
};
