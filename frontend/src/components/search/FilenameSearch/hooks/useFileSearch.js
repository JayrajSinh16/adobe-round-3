/**
 * File Search Hook
 * Manages search state and file processing logic
 */

import { useState, useMemo } from 'react';
import { processFiles } from '../utils/sortUtils.js';
import { SORT_OPTIONS, FILTER_OPTIONS } from '../utils/constants.js';

export const useFileSearch = (filteredFiles, visitedFiles) => {
  const [sortBy, setSortBy] = useState(SORT_OPTIONS.RECENT);
  const [filterBy, setFilterBy] = useState(FILTER_OPTIONS.ALL);

  const sortedFiles = useMemo(() => {
    return processFiles(filteredFiles, sortBy, filterBy, visitedFiles);
  }, [filteredFiles, sortBy, filterBy, visitedFiles]);

  return {
    sortBy,
    setSortBy,
    filterBy,
    setFilterBy,
    sortedFiles
  };
};
