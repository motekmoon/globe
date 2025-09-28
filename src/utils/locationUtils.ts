import { Location } from '../lib/supabase';

export const filterAndSortLocations = (
  locations: Location[],
  searchQuery: string,
  sortBy: "name" | "date" | "distance"
): Location[] => {
  return locations
    .filter((location) =>
      location.name.toLowerCase().includes(searchQuery.toLowerCase())
    )
    .sort((a, b) => {
      switch (sortBy) {
        case "name":
          return a.name.localeCompare(b.name);
        case "date":
          return (
            new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
          );
        case "distance":
          // For now, just sort by name as distance calculation would require user location
          return a.name.localeCompare(b.name);
        default:
          return 0;
      }
    });
};
