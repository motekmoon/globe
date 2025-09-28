import { useState } from 'react';

export const useDrawer = () => {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState<"name" | "date" | "distance">("date");

  const openDrawer = () => setIsDrawerOpen(true);
  const closeDrawer = () => setIsDrawerOpen(false);

  return {
    isDrawerOpen,
    openDrawer,
    closeDrawer,
    searchQuery,
    setSearchQuery,
    sortBy,
    setSortBy,
  };
};
