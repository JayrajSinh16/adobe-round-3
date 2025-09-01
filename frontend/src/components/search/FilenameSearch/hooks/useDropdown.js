/**
 * Dropdown State Management Hook
 * Handles dropdown open/close state and interactions
 */

import { useState, useCallback, useEffect } from 'react';

export const useDropdown = () => {
  const [openDropdowns, setOpenDropdowns] = useState(new Set());

  const toggleDropdown = useCallback((fileId, e) => {
    e.stopPropagation();
    setOpenDropdowns(prev => {
      const newSet = new Set(prev);
      if (newSet.has(fileId)) {
        newSet.delete(fileId);
      } else {
        newSet.clear(); // Close all other dropdowns
        newSet.add(fileId);
      }
      return newSet;
    });
  }, []);

  const closeAllDropdowns = useCallback(() => {
    setOpenDropdowns(new Set());
  }, []);

  const isDropdownOpen = useCallback((fileId) => {
    return openDropdowns.has(fileId);
  }, [openDropdowns]);

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = () => closeAllDropdowns();
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, [closeAllDropdowns]);

  return {
    openDropdowns,
    toggleDropdown,
    closeAllDropdowns,
    isDropdownOpen
  };
};
