/* eslint-disable react-hooks/exhaustive-deps */
import { useState, useEffect } from 'react';
import { BASE_URL } from '../utils/api';

export const useActivitiesFilter = (initialActivities = []) => {
  const [filteredActivities, setFilteredActivities] = useState(initialActivities);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("Alle Leergebieden");
  const [selectedAge, setSelectedAge] = useState("alle-leeftijden");
  const [selectedSort, setSelectedSort] = useState("hoogstgewaardeerde");

  const filterActivities = () => {
    setLoading(true);
    setError(null);
    
    try {
      let results = [...initialActivities];

      // Apply search term filter
      if (searchTerm.trim()) {
        const term = searchTerm.toLowerCase().trim();
        results = results.filter(activity => 
          activity.title.toLowerCase().includes(term) || 
          activity.description.toLowerCase().includes(term)
      )}

      // Apply category filter
      if (selectedCategory && selectedCategory !== 'Alle Leergebieden') {
        results = results.filter(activity => 
          activity.learningDomain === selectedCategory
        )
      }

      // Apply age filter
      if (selectedAge && selectedAge !== 'alle-leeftijden') {
        const [minAge, maxAge] = selectedAge.split('-').map(Number);
        results = results.filter(activity => {
          const [activityMin, activityMax] = activity.ageGroup.split('-').map(Number);
          return activityMin >= minAge && activityMax <= maxAge;
        })
      }

      // Apply sort
      if (selectedSort === 'hoogstgewaardeerde') {
        results.sort((a, b) => (b.averageRating || 0) - (a.averageRating || 0));
      } else if (selectedSort === 'meestgewaardeerde') {
        results.sort((a, b) => (b.ratings?.length || 0) - (a.ratings?.length || 0));
      } else if (selectedSort === 'voltooid') {
        // You might need to add completion status to your activity model
        // This is just a placeholder
        results.sort((a, b) => (b.completedCount || 0) - (a.completedCount || 0));
      }

      setFilteredActivities(results);
      
    } catch (err) {
      console.error('Error filtering activities:', err);
      setError(err.message || 'Failed to filter activities');
      setFilteredActivities([]);
    } finally {
      setLoading(false);
    }
  };

  // Update filtered activities when initial activities change
  useEffect(() => {
    setFilteredActivities(initialActivities);
  }, [initialActivities]);

  // Auto-filter when any filter value changes
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      filterActivities();
    }, 300); // Debounce for 300ms

    return () => clearTimeout(timeoutId);
  }, [searchTerm, selectedCategory, selectedAge, selectedSort, initialActivities]);

  const resetFilters = () => {
    setSearchTerm("");
    setSelectedCategory("Alle Leergebieden");
    setSelectedAge("alle-leeftijden");
    setSelectedSort("hoogstgewaardeerde");
    setFilteredActivities(initialActivities);
  };

  return {
    // Data
    activities: filteredActivities,
    loading,
    error,
    
    // Filter states
    searchTerm,
    selectedCategory,
    selectedAge,
    selectedSort,
    
    // Filter setters
    setSearchTerm,
    setSelectedCategory,
    setSelectedAge,
    setSelectedSort,
    
    // Functions
    resetFilters
  };
};