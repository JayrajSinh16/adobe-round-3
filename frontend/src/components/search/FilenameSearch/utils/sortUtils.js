/**
 * File Sorting and Filtering Utilities
 * Business logic for file processing operations
 */

import { SORT_OPTIONS } from './constants.js';

export const sortFiles = (files, sortBy, visitedFiles) => {
  const sorted = [...files];
  
  switch (sortBy) {
    case SORT_OPTIONS.NAME:
      return sorted.sort((a, b) => a.name.localeCompare(b.name));
    
    case SORT_OPTIONS.SIZE:
      return sorted.sort((a, b) => b.size - a.size);
    
    case SORT_OPTIONS.CONFIDENCE:
      return sorted.sort((a, b) => (b.confidence || 0) - (a.confidence || 0));
    
    case SORT_OPTIONS.RECENT:
    default:
      return sorted.sort((a, b) => (b.lastAccessed || 0) - (a.lastAccessed || 0));
  }
};

export const filterFiles = (files, filterBy, visitedFiles) => {
  switch (filterBy) {
    case 'visited':
      return files.filter(file => visitedFiles.has(file.id));
    
    case 'unvisited':
      return files.filter(file => !visitedFiles.has(file.id));
    
    case 'all':
    default:
      return files;
  }
};

export const processFiles = (files, sortBy, filterBy, visitedFiles) => {
  const filtered = filterFiles(files, filterBy, visitedFiles);
  return sortFiles(filtered, sortBy, visitedFiles);
};
