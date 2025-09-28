import React from 'react';
import { Button } from '@chakra-ui/react';

interface AnimationControlProps {
  isPlaying: boolean;
  onToggle: () => void;
}

const AnimationControl: React.FC<AnimationControlProps> = ({ isPlaying, onToggle }) => {
  return (
    <Button
      position="absolute"
      bottom="20px"
      left="20px"
      zIndex={10}
      onClick={onToggle}
      size="md"
      colorScheme="blue"
      borderRadius="full"
      aria-label={isPlaying ? "Pause globe animation" : "Play globe animation"}
      _hover={{
        transform: "scale(1.05)",
        transition: "transform 0.2s ease-in-out"
      }}
      _active={{
        transform: "scale(0.95)"
      }}
    >
      {isPlaying ? "⏸️" : "▶️"}
    </Button>
  );
};

export default AnimationControl;
