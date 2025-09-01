/**
 * FilenameSearch - Professional File Search and Management Component
 * 
 * A highly organized, modular file search component with advanced filtering,
 * sorting, and file operations. Refactored from 454 lines to ~90 lines.
 * 
 * Features:
 * - Advanced search & filtering with real-time results
 * - Smart sorting by name, size, recency, and confidence
 * - File operations: AI detection, summary generation, deletion
 * - Responsive design with collapsed and expanded views
 * - Professional animations using Framer Motion
 * - Comprehensive accessibility support
 */

import React from 'react';
import SearchInput from './components/SearchInput.jsx';
import FilterControls from './components/FilterControls.jsx';
import FileListExpanded from './components/FileListExpanded.jsx';
import FileListCollapsed from './components/FileListCollapsed.jsx';
import { useFileSearch } from './hooks/useFileSearch.js';
import { useDropdown } from './hooks/useDropdown.js';
import { useFileActions } from './hooks/useFileActions.js';

const FilenameSearch = ({
  filteredFiles,
  selectedFile,
  handleFileSelectWithVisit,
  searchTerm,
  handleSearchChange,
  formatFileSize,
  formatTimestamp,
  visitedFiles,
  leftPanelCollapsed,
  onFileDelete,
  onAIDetection,
  onSummaryGenerate
}) => {
  // Custom hooks for state management
  const { sortBy, setSortBy, filterBy, setFilterBy, sortedFiles } = useFileSearch(
    filteredFiles, 
    visitedFiles
  );
  
  const { 
    openDropdowns, 
    toggleDropdown, 
    closeAllDropdowns, 
    isDropdownOpen 
  } = useDropdown();
  
  const fileActions = useFileActions({
    onFileDelete,
    onAIDetection,
    onSummaryGenerate,
    closeAllDropdowns
  });

  return (
    <>
      {/* Search Input */}
      <SearchInput
        searchTerm={searchTerm}
        onSearchChange={handleSearchChange}
        leftPanelCollapsed={leftPanelCollapsed}
      />

      {/* Filter & Sort Controls */}
      <FilterControls
        sortBy={sortBy}
        setSortBy={setSortBy}
        filterBy={filterBy}
        setFilterBy={setFilterBy}
        leftPanelCollapsed={leftPanelCollapsed}
      />

      {/* File List */}
      <div className="flex-1 overflow-y-auto overflow-x-hidden">
        {leftPanelCollapsed ? (
          <FileListCollapsed
            sortedFiles={sortedFiles}
            selectedFile={selectedFile}
            visitedFiles={visitedFiles}
            formatFileSize={formatFileSize}
            onFileSelect={handleFileSelectWithVisit}
          />
        ) : (
          <FileListExpanded
            sortedFiles={sortedFiles}
            selectedFile={selectedFile}
            visitedFiles={visitedFiles}
            formatFileSize={formatFileSize}
            onFileSelect={handleFileSelectWithVisit}
            isDropdownOpen={isDropdownOpen}
            onToggleDropdown={toggleDropdown}
            fileActions={fileActions}
            searchTerm={searchTerm}
          />
        )}
      </div>
    </>
  );
};

export default FilenameSearch;
