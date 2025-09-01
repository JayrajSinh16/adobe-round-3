/**
 * FilenameSearch Component - Public API
 * 
 * Main export for the organized FilenameSearch component.
 * This ensures clean imports and maintains backward compatibility.
 */

// Main component export
export { default } from './FilenameSearch.jsx';

// Export hooks for external use if needed
export { useFileSearch } from './hooks/useFileSearch.js';
export { useDropdown } from './hooks/useDropdown.js';
export { useFileActions } from './hooks/useFileActions.js';

// Export utilities for external use if needed
export { sortFiles, filterFiles, processFiles } from './utils/sortUtils.js';
export { SORT_OPTIONS, FILTER_OPTIONS, UI_CONFIG } from './utils/constants.js';
