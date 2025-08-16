import React, { useState, useCallback, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ChevronLeft, Plus, Brain, File
} from 'lucide-react';
import FilenameSearch from './search/FilenameSearch';
import SemanticSearch from './search/SemanticSearch';

const LeftPanel = ({
  leftPanelCollapsed,
  toggleLeftPanel,
  filteredFiles,
  selectedFile,
  handleFileSelect,
  searchTerm,
  handleSearchChange,
  formatFileSize,
  formatReadingTime,
  formatTimestamp,
  goldenTransition,
  rightPanelVisible, // New prop for auto-collapse behavior
  onFileUpload // New prop for handling file uploads
}) => {
  // Enhanced state management for premium features
  const [visitedFiles, setVisitedFiles] = useState(new Set());
  const fileInputRef = useRef(null);
  
  // Search mode state
  const [searchMode, setSearchMode] = useState('filename'); // 'filename' or 'semantic'

  // Auto-collapse when right panel opens - Premium UX behavior
  useEffect(() => {
    if (rightPanelVisible && !leftPanelCollapsed) {
      toggleLeftPanel();
    }
  }, [rightPanelVisible, leftPanelCollapsed, toggleLeftPanel]);

  // Handle search mode change
  const handleSearchModeChange = useCallback((mode) => {
    setSearchMode(mode);
    if (mode === 'filename') {
      // Clear any existing search when switching to filename mode
      handleSearchChange({ target: { value: '' } });
    }
  }, [handleSearchChange]);

  // Mark file as visited when selected - Innovative tracking
  const handleFileSelectWithVisit = useCallback((file) => {
    setVisitedFiles(prev => new Set([...prev, file.id]));
    handleFileSelect(file);
  }, [handleFileSelect]);

  // Direct file upload handler - streamlined UX
  const handleUploadClick = useCallback(() => {
    fileInputRef.current?.click();
  }, []);

  const handleFileUploadChange = useCallback((event) => {
    const files = Array.from(event.target.files);
    if (files.length > 0 && onFileUpload) {
      onFileUpload(files);
    }
    // Reset input for future uploads
    event.target.value = '';
  }, [onFileUpload]);

  // Premium animation variants
  const containerVariants = {
    expanded: {
      width: '400px',
      transition: { ...goldenTransition, staggerChildren: 0.05 }
    },
    collapsed: {
      width: '80px',
      transition: { ...goldenTransition, staggerChildren: 0.03 }
    }
  };

  const itemVariants = {
    expanded: {
      opacity: 1,
      x: 0,
      scale: 1,
      transition: { type: "spring", stiffness: 400, damping: 25 }
    },
    collapsed: {
      opacity: 0,
      x: -20,
      scale: 0.95,
      transition: { duration: 0.2 }
    }
  };
  return (
    <>
      {/* Hidden File Input */}
      <input
        ref={fileInputRef}
        type="file"
        multiple
        accept=".pdf,.doc,.docx"
        onChange={handleFileUploadChange}
        className="hidden"
      />

      {/* Premium Left Panel with Mathematical Proportions */}
      <motion.aside
        initial={{ opacity: 0, x: -21 }}
        animate={{ 
          opacity: 1, 
          x: 0,
          width: leftPanelCollapsed ? '80px' : '400px'
        }}
        variants={containerVariants}
        transition={{
          ...goldenTransition,
          duration: 0.6,
          ease: [0.25, 0.46, 0.45, 0.94] // Premium easing curve
        }}
        className="flex-shrink-0 bg-white/90 backdrop-blur-sm border-r border-[#E5E7EB]/20 flex flex-col shadow-xl relative overflow-hidden"
        style={{
          backdropFilter: 'blur(20px) saturate(180%)',
          borderImage: 'linear-gradient(180deg, rgba(229, 231, 235, 0.3), rgba(229, 231, 235, 0.1)) 1',
          minWidth: leftPanelCollapsed ? '80px' : '400px',
          maxWidth: leftPanelCollapsed ? '80px' : '400px'
        }}
      >
        {/* Sophisticated Panel Header with Add Button */}
        <div className="py-2 pl-6 pr-2 border-b border-[#E5E7EB]/20 flex items-center justify-between relative">
          <AnimatePresence mode="wait">
            {!leftPanelCollapsed && (
              <motion.div
                key="header-content"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.3 }}
                className="flex-1"
              >
                <div className="flex items-center justify-between mt-6 ">
                  <h3 className="text-[26px] font-bold text-[#1A1A1A] tracking-tight">
                    Document Library
                  </h3>
                  
                  {/* Premium Add Button - Direct Upload */}
                  <motion.button
                    onClick={handleUploadClick}
                    className="group relative p-3 bg-gradient-to-r from-[#DC2626] to-[#B91C1C] text-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300"
                    whileHover={{ scale: 1.05, rotate: 90 }}
                    whileTap={{ scale: 0.95 }}
                    aria-label="Upload new documents"
                  >
                    <Plus className="w-5 h-5 transition-transform duration-300" />
                    <div className="absolute inset-0 bg-white/20 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  </motion.button>
                </div>
                
                <div className="flex  items-center justify-between">
                  <p className="text-[16px] text-[#1A1A1A] opacity-60 font-medium">
                    {filteredFiles.length} document{filteredFiles.length !== 1 ? 's' : ''}
                  </p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
          
          {/* Enhanced Collapse Toggle */}
          <motion.button
            onClick={toggleLeftPanel}
            className="p-3 rounded-xl hover:bg-[#E5E7EB]/50 transition-all duration-300 relative group"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            aria-label={leftPanelCollapsed ? 'Expand library' : 'Collapse library'}
          >
            <ChevronLeft 
              className={`w-5 h-5 transition-all duration-500 ${
                leftPanelCollapsed ? 'rotate-180 text-[#DC2626]' : 'text-[#1A1A1A]'
              }`} 
            />
            <div className="absolute inset-0 bg-[#DC2626]/10 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          </motion.button>
        </div>

        {/* Advanced Search & Filter Interface */}
        <AnimatePresence>
          {!leftPanelCollapsed && (
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ delay: 0.1, duration: 0.3 }}
              className="px-6 border-b border-[#E5E7EB]/20 space-y-4"
            >
              {/* Search Mode Toggle */}
              <div className="flex items-center space-x-1 bg-[#F3F4F6] rounded-xl p-1">
                <motion.button
                  onClick={() => handleSearchModeChange('filename')}
                  className={`flex-1 flex items-center justify-center space-x-2 py-2 px-3 rounded-lg text-sm font-medium transition-all duration-300 ${
                    searchMode === 'filename'
                      ? 'bg-white text-[#1A1A1A] shadow-sm'
                      : 'text-[#1A1A1A] opacity-60 hover:opacity-100'
                  }`}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <File className="w-4 h-4" />
                  <span>Filename</span>
                </motion.button>
                
                <motion.button
                  onClick={() => handleSearchModeChange('semantic')}
                  className={`flex-1 flex items-center justify-center space-x-2 py-2 px-3 rounded-lg text-sm font-medium transition-all duration-300 ${
                    searchMode === 'semantic'
                      ? 'bg-gradient-to-r from-[#DC2626] to-[#B91C1C] text-white shadow-sm'
                      : 'text-[#1A1A1A] opacity-60 hover:opacity-100'
                  }`}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <Brain className="w-4 h-4" />
                  <span>Semantic</span>
                </motion.button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Search Component Container */}
        <div className="flex-1 overflow-hidden flex flex-col">
          {!leftPanelCollapsed && (
            <div className="px-6 py-4 space-y-4 flex-1 flex flex-col overflow-hidden">
              {searchMode === 'filename' ? (
                <FilenameSearch
                  filteredFiles={filteredFiles}
                  selectedFile={selectedFile}
                  handleFileSelectWithVisit={handleFileSelectWithVisit}
                  searchTerm={searchTerm}
                  handleSearchChange={handleSearchChange}
                  formatFileSize={formatFileSize}
                  formatTimestamp={formatTimestamp}
                  visitedFiles={visitedFiles}
                  leftPanelCollapsed={leftPanelCollapsed}
                />
              ) : (
                <SemanticSearch
                  filteredFiles={filteredFiles}
                  selectedFile={selectedFile}
                  handleFileSelectWithVisit={handleFileSelectWithVisit}
                  formatFileSize={formatFileSize}
                  formatTimestamp={formatTimestamp}
                  visitedFiles={visitedFiles}
                  leftPanelCollapsed={leftPanelCollapsed}
                />
              )}
            </div>
          )}
          
          {leftPanelCollapsed && (
            <div className="p-3 space-y-3 w-full overflow-hidden">
              <FilenameSearch
                filteredFiles={filteredFiles}
                selectedFile={selectedFile}
                handleFileSelectWithVisit={handleFileSelectWithVisit}
                searchTerm={searchTerm}
                handleSearchChange={handleSearchChange}
                formatFileSize={formatFileSize}
                formatTimestamp={formatTimestamp}
                visitedFiles={visitedFiles}
                leftPanelCollapsed={leftPanelCollapsed}
              />
            </div>
          )}
        </div>

      </motion.aside>
    </>
  );
};

export default LeftPanel;
