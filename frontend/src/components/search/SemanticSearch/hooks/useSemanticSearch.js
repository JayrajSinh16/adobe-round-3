/**
 * SemanticSearch Hook
 * Custom hook managing semantic search state and operations
 */

import { useState, useCallback, useRef, useEffect } from 'react';
import { 
  createDebouncedSearch, 
  performSemanticSearch 
} from '../utils/searchUtils';
import { UI_CONFIG } from '../utils/constants';

export const useSemanticSearch = ({ onNavigateToDocument }) => {
  const [semanticSearchTerm, setSemanticSearchTerm] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [semanticResults, setSemanticResults] = useState([]);
  const [clickingFile, setClickingFile] = useState(null);
  
  const searchTimeoutRef = useRef(null);

  // Handle the actual search execution
  const executeSearch = useCallback(async (query) => {
    if (!query?.trim()) {
      setSemanticResults([]);
      return;
    }

    setIsSearching(true);
    try {
      const results = await performSemanticSearch(query);
      setSemanticResults(results || []);
    } catch (error) {
      console.error('Search execution error:', error);
      setSemanticResults([]);
    } finally {
      setIsSearching(false);
    }
  }, []);

  // Create debounced search function
  const debouncedSearch = useCallback(
    createDebouncedSearch(executeSearch),
    [executeSearch]
  );

  // Handle search term changes
  const handleSearchChange = useCallback((value) => {
    setSemanticSearchTerm(value);
    debouncedSearch(value);
  }, [debouncedSearch]);

  // Handle result item click with animation
  const handleResultClick = useCallback((result) => {
    if (!onNavigateToDocument || clickingFile) return;

    setClickingFile(result.file_name);
    
    setTimeout(() => {
      onNavigateToDocument(result.file_name, result.page_number);
      setClickingFile(null);
    }, UI_CONFIG.CLICK_ANIMATION_DELAY);
  }, [onNavigateToDocument, clickingFile]);

  // Clear search
  const clearSearch = useCallback(() => {
    setSemanticSearchTerm('');
    setSemanticResults([]);
    setIsSearching(false);
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, []);

  return {
    // State
    semanticSearchTerm,
    isSearching,
    semanticResults,
    clickingFile,
    
    // Actions
    handleSearchChange,
    handleResultClick,
    clearSearch,
  };
};
