import React from 'react';
import { Button } from '@chakra-ui/react';
import { PlayIcon, PauseIcon } from '@heroicons/react/24/solid';
import { motion } from 'framer-motion';

interface AnimationControlProps {
  isPlaying: boolean;
  onToggle: () => void;
}

const AnimationControl: React.FC<AnimationControlProps> = ({ isPlaying, onToggle }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.4, ease: "easeOut" }}
      style={{
        position: "absolute",
        bottom: "20px",
        left: "20px",
        zIndex: 10
      }}
    >
      <Button
        onClick={onToggle}
        size="md"
        bg="rgba(255, 255, 255, 0.1)"
        color="white"
        borderRadius="full"
        aria-label={isPlaying ? "Pause globe animation" : "Play globe animation"}
        _hover={{
          bg: "rgba(255, 255, 255, 0.2)",
          transform: "scale(1.05)",
          transition: "all 0.2s ease-in-out"
        }}
        _active={{
          bg: "rgba(255, 255, 255, 0.3)",
          transform: "scale(0.95)"
        }}
      >
        {isPlaying ? <PauseIcon className="h-4 w-4" /> : <PlayIcon className="h-4 w-4" />}
      </Button>
    </motion.div>
  );
};

export default AnimationControl;
