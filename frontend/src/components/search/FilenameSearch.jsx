import React, { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Search, FileText, CheckCircle2, SortDesc, Trash2
} from 'lucide-react';

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
  onFileDelete
}) => {
  // Local state for filename search
  const [sortBy, setSortBy] = useState('recent');
  const [filterBy, setFilterBy] = useState('all');

  // Handle file deletion
  const handleDeleteFile = useCallback((e, fileId) => {
    e.stopPropagation(); // Prevent file selection when clicking delete
    if (onFileDelete) {
      onFileDelete(fileId);
    }
  }, [onFileDelete]);

  // Sophisticated sorting logic for filename search
  const sortedFiles = React.useMemo(() => {
    let sorted = [...filteredFiles];
    
    switch (sortBy) {
      case 'name':
        sorted.sort((a, b) => a.name.localeCompare(b.name));
        break;
      case 'size':
        sorted.sort((a, b) => b.size - a.size);
        break;
      case 'confidence':
        sorted.sort((a, b) => b.confidence - a.confidence);
        break;
      case 'recent':
      default:
        sorted.sort((a, b) => b.lastAccessed - a.lastAccessed);
        break;
    }

    // Apply filter
    if (filterBy === 'visited') {
      sorted = sorted.filter(file => visitedFiles.has(file.id));
    } else if (filterBy === 'unvisited') {
      sorted = sorted.filter(file => !visitedFiles.has(file.id));
    }

    return sorted;
  }, [filteredFiles, sortBy, filterBy, visitedFiles]);

  return (
    <>
      {/* Search Input - only show when not collapsed */}
      {!leftPanelCollapsed && (
        <div className="relative group">
          <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-4 h-4 text-[#1A1A1A] opacity-40 group-focus-within:opacity-70 group-focus-within:text-[#DC2626] transition-all duration-300" />
          <input
            type="text"
            placeholder="Search documents by filename..."
            value={searchTerm}
            onChange={handleSearchChange}
            className="w-full pl-12 pr-4 py-3 border-2 border-[#E5E7EB] bg-[#FAFAF9] rounded-xl focus:ring-2 focus:ring-[#DC2626]/20 focus:border-[#DC2626] transition-all duration-300 text-sm font-medium placeholder-[#1A1A1A] placeholder-opacity-40 hover:bg-white"
            style={{
              backdropFilter: 'blur(10px)',
              boxShadow: '0 4px 16px rgba(0, 0, 0, 0.02)'
            }}
          />
        </div>
      )}

      {/* Filter & Sort Controls - only show when not collapsed */}
      {!leftPanelCollapsed && (
        <div className="flex items-center justify-between space-x-3">
          {/* Sort Dropdown */}
          <div className="relative flex-1">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="w-full appearance-none bg-white/80 border border-[#E5E7EB] rounded-xl px-4 py-2 text-sm font-medium text-[#1A1A1A] focus:ring-2 focus:ring-[#DC2626]/20 focus:border-[#DC2626] transition-all duration-300"
            >
              <option value="recent">Recent</option>
              <option value="name">Name</option>
              <option value="size">Size</option>
              <option value="confidence">Confidence</option>
            </select>
            <SortDesc className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-[#1A1A1A] opacity-40 pointer-events-none" />
          </div>

          {/* Filter Toggle */}
          <div className="flex items-center space-x-1 bg-white/80 border border-[#E5E7EB] rounded-xl p-1">
            {['all', 'visited', 'unvisited'].map((filter) => (
              <button
                key={filter}
                onClick={() => setFilterBy(filter)}
                className={`px-3 py-1 text-xs font-bold rounded-lg transition-all duration-300 ${
                  filterBy === filter
                    ? 'bg-[#DC2626] text-white shadow-lg'
                    : 'text-[#1A1A1A] opacity-60 hover:opacity-100'
                }`}
              >
                {filter === 'all' ? 'All' : filter === 'visited' ? 'Read' : 'New'}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* File List */}
      <div className="flex-1 overflow-y-auto overflow-x-hidden">
        {!leftPanelCollapsed ? (
          <div className="space-y-3 w-full">
            <AnimatePresence mode="popLayout">
              {sortedFiles.map((file, index) => {
                const isVisited = visitedFiles.has(file.id);
                const isSelected = selectedFile?.id === file.id;
                
                return (
                  <motion.article
                    key={file.id}
                    layout
                    initial={{ opacity: 0, y: 13, scale: 0.95 }}
                    animate={{ 
                      opacity: 1, 
                      y: 0, 
                      scale: 1,
                      transition: { 
                        delay: index * 0.055,
                        type: "spring",
                        stiffness: 400,
                        damping: 25
                      }
                    }}
                    exit={{ opacity: 0, scale: 0.95, y: -13 }}
                    className={`group relative p-4 rounded-xl cursor-pointer transition-all duration-300 border overflow-hidden ${
                      isSelected
                        ? 'bg-[#DC2626]/5 border-[#DC2626]/20 shadow-md'
                        : 'bg-white/80 hover:bg-white border-[#E5E7EB]/50 hover:border-[#DC2626]/20 hover:shadow-md'
                    }`}
                    onClick={() => handleFileSelectWithVisit(file)}
                    whileHover={{ 
                      y: -2,
                      transition: { duration: 0.2 }
                    }}
                    whileTap={{ scale: 0.98 }}
                    style={{
                      backdropFilter: 'blur(8px)',
                      boxShadow: isSelected 
                        ? '0 4px 12px rgba(220, 38, 38, 0.1)'
                        : '0 1px 3px rgba(0, 0, 0, 0.05)'
                    }}
                  >
                    {/* Visited Status Indicator */}
                    {isVisited && (
                      <motion.div
                        initial={{ scale: 0, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        className="absolute top-3 right-3 z-10"
                      >
                        <CheckCircle2 className="w-5 h-5 text-[#059669] bg-white rounded-full" />
                      </motion.div>
                    )}

                    {/* File Header */}
                    <div className="flex items-start space-x-4">
                      <motion.div 
                        className={`p-3 rounded-xl transition-all duration-500 relative overflow-hidden ${
                          isSelected 
                            ? 'bg-[#DC2626] text-white shadow-lg' 
                            : 'bg-[#F3F4F6] text-[#1A1A1A] group-hover:bg-[#DC2626] group-hover:text-white'
                        }`}
                        whileHover={{ scale: 1.05 }}
                        transition={{ duration: 0.3 }}
                      >
                        <FileText className="w-5 h-5 relative z-10" />
                      </motion.div>
                      
                      <div className="flex-1 min-w-0">
                        {/* File Name */}
                        <div className="flex items-center justify-between space-x-2 mb-3">
                          <h4 className={`text-[15px] font-semibold truncate transition-colors duration-300 ${
                            isSelected ? 'text-[#DC2626]' : 'text-[#1A1A1A] group-hover:text-[#DC2626]'
                          }`}>
                            {file.name}
                          </h4>
                          {!isVisited && (
                            <motion.div
                              initial={{ scale: 0 }}
                              animate={{ scale: 1 }}
                              className="w-2 h-2 bg-[#DC2626] rounded-full flex-shrink-0"
                            />
                          )}
                        </div>
                        
                        {/* File Metadata */}
                        <div className="flex items-center justify-between text-[13px] text-[#6B7280] mb-2">
                          <span className="font-medium">{formatFileSize(file.size)}</span>
                          <motion.button
                            onClick={(e) => handleDeleteFile(e, file.id)}
                            className="p-1 rounded-md hover:bg-red-100 hover:text-red-600 transition-all duration-200 group/delete"
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            aria-label={`Delete ${file.name}`}
                          >
                            <Trash2 className="w-3 h-3" />
                          </motion.button>
                        </div>
                      </div>
                    </div>
                    
                    {/* Selection Indicator */}
                    <AnimatePresence>
                      {isSelected && (
                        <motion.div 
                          initial={{ scaleY: 0, opacity: 0 }}
                          animate={{ scaleY: 1, opacity: 1 }}
                          exit={{ scaleY: 0, opacity: 0 }}
                          transition={{ duration: 0.2, ease: "easeOut" }}
                          className="absolute left-0 top-1/2 transform -translate-y-1/2 w-1 h-8 bg-[#DC2626] rounded-r-full"
                          layoutId="selectedIndicator"
                        />
                      )}
                    </AnimatePresence>
                  </motion.article>
                );
              })}
            </AnimatePresence>

            {/* Empty State */}
            {sortedFiles.length === 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-center py-12"
              >
                <FileText className="w-16 h-16 mx-auto text-[#E5E7EB] mb-4" />
                <h4 className="text-lg font-bold text-[#1A1A1A] mb-2">No documents found</h4>
                <p className="text-sm text-[#1A1A1A] opacity-60">
                  {searchTerm ? 'Try adjusting your search or filters' : 'Upload documents to get started'}
                </p>
              </motion.div>
            )}
          </div>
        ) : (
          // Collapsed View
          <div className="px-2 space-y-2 w-full overflow-hidden">
            <AnimatePresence mode="popLayout">
              {sortedFiles.slice(0, 8).map((file, index) => {
                const isVisited = visitedFiles.has(file.id);
                const isSelected = selectedFile?.id === file.id;
                
                return (
                  <motion.div
                    key={file.id}
                    className="relative group"
                    layout
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ 
                      opacity: 1, 
                      scale: 1,
                      transition: { delay: index * 0.05 }
                    }}
                    exit={{ opacity: 0, scale: 0.8 }}
                  >
                    <motion.button
                      onClick={() => handleFileSelectWithVisit(file)}
                      className={`relative w-full p-3 rounded-lg transition-all duration-300 ${
                        isSelected
                          ? 'bg-[#DC2626] text-white shadow-lg'
                          : 'bg-[#F3F4F6] text-[#1A1A1A] hover:bg-[#DC2626] hover:text-white'
                      }`}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.95 }}
                      aria-label={file.name}
                      style={{
                        backdropFilter: 'blur(8px)',
                        boxShadow: isSelected ? '0 4px 12px rgba(220, 38, 38, 0.2)' : 'none'
                      }}
                    >
                      <FileText className="w-5 h-5 mx-auto" />
                      
                      {/* Status Indicators */}
                      <AnimatePresence>
                        {isVisited && !isSelected && (
                          <motion.div 
                            className="absolute top-1 right-1 w-2 h-2 bg-[#059669] rounded-full"
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            exit={{ scale: 0 }}
                          />
                        )}
                        
                        {!isVisited && !isSelected && (
                          <motion.div 
                            className="absolute top-1 right-1 w-2 h-2 bg-[#DC2626] rounded-full"
                            animate={{ 
                              scale: [1, 1.2, 1],
                              opacity: [1, 0.7, 1]
                            }}
                            transition={{ 
                              duration: 2, 
                              repeat: Infinity 
                            }}
                          />
                        )}
                      </AnimatePresence>
                    </motion.button>
                    
                    {/* Tooltip */}
                    <motion.div
                      className="absolute left-full top-1/2 transform -translate-y-1/2 ml-2 px-3 py-2 bg-[#1A1A1A] text-white text-xs font-medium rounded-lg shadow-lg opacity-0 group-hover:opacity-100 transition-all duration-200 pointer-events-none whitespace-nowrap z-50"
                      initial={{ opacity: 0, x: -8 }}
                      whileHover={{ opacity: 1, x: 0 }}
                    >
                      <div className="font-medium">{file.name}</div>
                      <div className="text-xs opacity-80 mt-1">
                        {formatFileSize(file.size)}
                        {isVisited && <span className="text-[#059669] ml-1">✓ Read</span>}
                      </div>
                      
                      {/* Tooltip Arrow */}
                      <div className="absolute top-1/2 left-0 transform -translate-y-1/2 -translate-x-1 w-0 h-0 border-t-2 border-b-2 border-r-2 border-transparent border-r-[#1A1A1A]"></div>
                    </motion.div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
            
            {/* Overflow Indicator */}
            {sortedFiles.length > 8 && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-center py-2"
              >
                <div className="text-xs text-[#6B7280] font-medium bg-[#F3F4F6] px-2 py-1 rounded-lg inline-flex items-center">
                  +{sortedFiles.length - 8} more
                </div>
              </motion.div>
            )}
          </div>
        )}
      </div>
    </>
  );
};

export default FilenameSearch;
